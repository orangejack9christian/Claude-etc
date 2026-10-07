"""Geometry for the drawing additions, measured straight from the math model.

- crease: the visible edge in the side view where the 3/8" web's flat sides
  meet the round tube (housing + S-curve swoop), from the rear face to the end
  of the swoop.
- back view: the outline seen from behind (housing circle, web, axle pods with
  their fillets), checked against the model's own silhouette.

Run:  python drawing_geom.py out.json
"""
import json
import sys

import numpy as np

import dragster as D

P = D.P
WEB = P["spine_r"]          # the web is extruded +/- spine_r: 3/8" thick
EPS = 1e-4


def crease(n=331):
    """Height of the web/tube edge at each x, found by bisection just outside the web face."""
    xs = np.linspace(0.0, P["ramp_end_x"], n)
    xs[0] = 0.002                      # just inside the rear face
    z = WEB + EPS
    pts = []
    for x in xs:
        # Scan down from the top of the tube: inside the tube, then out into air beside the web.
        ys = np.arange(1.9, -0.001, -0.0025)
        p = np.stack([np.full_like(ys, x), ys, np.full_like(ys, z)], -1)
        inside = D.body_outer(p) <= 0
        idx = np.nonzero(inside)[0]
        if len(idx) == 0:
            continue
        k = idx[0]
        while k + 1 < len(ys) and inside[k + 1]:
            k += 1
        lo, hi = ys[k + 1] if k + 1 < len(ys) else 0.0, ys[k]   # lo outside, hi inside
        for _ in range(40):
            mid = (lo + hi) / 2
            if D.body_outer(np.array([[x, mid, z]]))[0] <= 0:
                hi = mid
            else:
                lo = mid
        pts.append((float(x), float(hi)))
    return pts


def silhouette(zs, ys, xs):
    """Back-view silhouette: is any x along the line of sight inside the wood?"""
    Z, Y = np.meshgrid(zs, ys, indexing="ij")
    best = np.full(Z.shape, np.inf)
    for x0 in range(0, len(xs), 8):
        X = xs[x0:x0 + 8]
        p = np.stack(np.broadcast_arrays(X[:, None, None], Y[None], Z[None]), -1)
        best = np.minimum(best, D.body_outer(p).min(axis=0))
    return best <= 0


def pod_top_curve():
    """Top of the lower solid (pod + fillet) in the back view, from the web side outward."""
    zs = np.arange(WEB + 0.001, 0.46, 0.002)
    ys = np.arange(0.55, 0.80, 0.0005)
    xs = np.r_[np.arange(0.0, 1.45, 0.004), np.arange(9.95, 11.45, 0.004)]
    mask = silhouette(zs, ys, xs)
    out = []
    for i, z in enumerate(zs):
        col = mask[i]
        # first y (scanning up) where we leave the lower solid
        k = np.argmax(~col) if (~col).any() else len(col) - 1
        out.append((float(z), float(ys[k])))
    return out


def analytic_mask(zs, ys, top_curve):
    """The outline as drawn: housing circle + web + pods (with the measured fillet curve)."""
    Z, Y = np.meshgrid(zs, ys, indexing="ij")
    cy, hr, ph = P["cart_y"], P["housing_r"], P["pod_halfwidth"]
    circle = (Z ** 2 + (Y - cy) ** 2) <= hr ** 2
    web = (np.abs(Z) <= WEB) & (Y >= 0) & (Y <= cy)
    tz = np.array([t[0] for t in top_curve])
    ty = np.array([t[1] for t in top_curve])
    pod_top = np.where(np.abs(Z) <= tz[-1], np.interp(np.abs(Z), tz, ty), P["axle_y"] + P["pod_r"])
    pod = (np.abs(Z) <= ph) & (Y >= 0) & (Y <= pod_top)
    return circle | web | pod


def main(out_path):
    c = crease()
    top = pod_top_curve()
    # Whole back-view silhouette vs the drawn outline (rear pod/housing region holds every part's extent;
    # the front pod is identical and the swoop and spine sit inside the housing circle and web)
    zs = np.arange(-0.86, 0.86, 0.004)
    ys = np.arange(-0.02, 1.86, 0.004)
    xs = np.r_[np.arange(0.0, 2.4, 0.01), np.arange(9.9, 11.5, 0.01)]
    model = silhouette(zs, ys, xs)
    drawn = analytic_mask(zs, ys, top)
    diff = model ^ drawn
    # Disagreements within 1 grid cell of an edge are sampling noise; report the rest
    from_edge = np.zeros_like(diff)
    for dz in (-1, 0, 1):
        for dy in (-1, 0, 1):
            from_edge |= np.roll(np.roll(drawn, dz, 0), dy, 1) != drawn
    real = diff & ~from_edge
    zs_w = zs[model.any(axis=1)]
    ys_h = ys[model.any(axis=0)]
    res = dict(
        crease=c,
        pod_top=top,
        P={k: v for k, v in P.items() if not isinstance(v, tuple)},
        eye_x=list(P["eye_x"]),
        web_half=WEB,
        check=dict(
            silhouette_cells=int(model.sum()),
            mismatch_cells=int(diff.sum()),
            mismatch_away_from_edges=int(real.sum()),
            width=float(zs_w.max() - zs_w.min() + 0.004),
            height=float(ys_h.max() - ys_h.min() + 0.004),
            crease_at_rear=c[0][1],
            crease_at_swoop_start=float(np.interp(P["housing_len"], [p[0] for p in c], [p[1] for p in c])),
            crease_at_end=c[-1][1],
        ),
    )
    with open(out_path, "w") as f:
        json.dump(res, f, indent=1)
    print(json.dumps(res["check"], indent=1))
    print("pod top near web:", [(round(z, 3), round(y, 4)) for z, y in top[:12:2]], "... far:", top[-1])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "drawing_geom.json")
