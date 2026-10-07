"""Geometry for the drawing additions, measured straight from the math model.

- crease: the visible edge in the side view where the 3/8" web's flat sides
  meet the round tube (housing + S-curve swoop), from the rear face to the end
  of the swoop.
- back view: the outline seen from behind (housing circle, web, axle pods with
  their fillets, and the S-curve swoop, which shows below the housing),
  checked against the model's own silhouette.

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


def pod_outline(axle_x, n=90):
    """Side-view outline of a teardrop axle pod (its flat outer face is the
    widest part of the car, so the whole outline is a visible edge).
    Closed loop: axle circle (r = pod_r) joined by tangent lines to the tail
    circle (r = spine_r, pod_tail behind the axle)."""
    c1 = np.array([axle_x, P["axle_y"]]); r1 = P["pod_r"]
    c2 = np.array([axle_x - P["pod_tail"], P["spine_r"]]); r2 = P["spine_r"]
    d = np.linalg.norm(c2 - c1); u = (c2 - c1) / d; up = np.array([-u[1], u[0]])
    ca = (r1 - r2) / d; sa = np.sqrt(1 - ca * ca)
    na, nb = ca * u + sa * up, ca * u - sa * up
    n_hi, n_lo = (na, nb) if na[1] > nb[1] else (nb, na)
    ang = lambda v: np.arctan2(v[1], v[0])

    def arc(c, r, a0, a1, through):
        # sweep from a0 to a1 in whichever direction passes through `through`
        ccw = (a1 - a0) % (2 * np.pi)
        t = (through - a0) % (2 * np.pi)
        sweep = ccw if t < ccw else ccw - 2 * np.pi
        th = a0 + np.linspace(0, 1, n) * sweep
        return [c + r * np.array([np.cos(a), np.sin(a)]) for a in th]

    loop = arc(c1, r1, ang(n_hi), ang(n_lo), ang(-u))          # around the front of the axle
    loop += arc(c2, r2, ang(n_lo), ang(n_hi), ang(u))          # around the end of the tail
    loop.append(loop[0])
    pts = np.array(loop)
    err = np.abs(D.round_cone(pts, tuple(c1), tuple(c2), r1, r2)).max()
    return pts, float(err)


def pods():
    """Rear pod: the whole teardrop (it sits inside the tall rear block).
    Front pod: only the part inside the spine's outline (its upper edge is
    already the car's outline), i.e. where the outline is below the spine top."""
    rear, e1 = pod_outline(P["rear_axle_x"])
    front, e2 = pod_outline(P["front_axle_x"])
    top = 2 * P["spine_r"]
    below = front[:, 1] <= top + 1e-9
    # the loop starts on the upper tangent; rotate so the below-the-spine run is contiguous
    k = int(np.argmax(~below))
    rolled = np.roll(front[:-1], -k, axis=0)
    keep = rolled[:, 1] <= top + 1e-9
    i0 = int(np.argmax(keep)); i1 = len(keep) - int(np.argmax(keep[::-1]))
    front_lower = rolled[i0:i1]
    return dict(rear=rear.tolist(), front_lower=front_lower.tolist(), max_sdf_error=max(e1, e2))


def swoop_back_profile(step=0.0025):
    """Half-width of the S-curve swoop seen from behind, at each height.
    Each swoop segment is a round cone between two spheres on the centerline,
    so seen from behind it is the 2D hull of two circles centred at z = 0."""
    xs, ys, rs = D.swoop_curve()
    cs = [((0.0, ys[i]), (0.0, ys[i + 1]), rs[i], rs[i + 1]) for i in range(len(xs) - 1)]

    def inside(z, y):
        q = np.array([[z, y]])
        return min(D.round_cone(q, a, b, ra, rb)[0] for a, b, ra, rb in cs) <= 0

    out = []
    for y in np.arange(0.0, P["cart_y"] + P["housing_r"] + 1e-9, step):
        if not inside(0.0, y):
            continue
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if inside(mid, y) else (lo, mid)
        out.append((float(lo), float(y)))
    return out


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


def analytic_mask(zs, ys, top_curve, swoop):
    """The outline as drawn: housing circle + web + pods (with the measured fillet curve) + swoop."""
    Z, Y = np.meshgrid(zs, ys, indexing="ij")
    cy, hr, ph = P["cart_y"], P["housing_r"], P["pod_halfwidth"]
    circle = (Z ** 2 + (Y - cy) ** 2) <= hr ** 2
    web = (np.abs(Z) <= WEB) & (Y >= 0) & (Y <= cy)
    tz = np.array([t[0] for t in top_curve])
    ty = np.array([t[1] for t in top_curve])
    pod_top = np.where(np.abs(Z) <= tz[-1], np.interp(np.abs(Z), tz, ty), P["axle_y"] + P["pod_r"])
    pod = (np.abs(Z) <= ph) & (Y >= 0) & (Y <= pod_top)
    sw = np.array(swoop)
    swoop_mask = np.abs(Z) <= np.interp(Y, sw[:, 1], sw[:, 0], left=-1, right=-1)
    return circle | web | pod | swoop_mask


def main(out_path):
    if len(sys.argv) > 2 and sys.argv[2] == "pods":       # quick update: pods + swoop profile, no check
        with open(out_path) as fh:
            res = json.load(fh)
        res["pods"] = pods()
        res["swoop_back"] = swoop_back_profile()
        with open(out_path, "w") as fh:
            json.dump(res, fh, indent=1)
        print("pods: max SDF error on outline", res["pods"]["max_sdf_error"])
        return
    c = crease()
    top = pod_top_curve()
    sw = swoop_back_profile()
    # Whole back-view silhouette vs the drawn outline. Every part that can show from behind lies in
    # x 0..5.6 (housing, swoop, web, rear pod) or 9.9..11.5 (front pod); past the swoop the spine
    # sits inside the web.
    zs = np.arange(-0.86, 0.86, 0.005)
    ys = np.arange(-0.02, 1.86, 0.005)
    xs = np.r_[np.arange(0.0, 5.6, 0.01), np.arange(9.9, 11.5, 0.01)]
    model = silhouette(zs, ys, xs)
    drawn = analytic_mask(zs, ys, top, sw)
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
        swoop_back=sw,
        pods=pods(),
        crease=c,
        pod_top=top,
        P={k: v for k, v in P.items() if not isinstance(v, tuple)},
        eye_x=list(P["eye_x"]),
        web_half=WEB,
        check=dict(
            silhouette_cells=int(model.sum()),
            mismatch_cells=int(diff.sum()),
            mismatch_away_from_edges=int(real.sum()),
            width=float(zs_w.max() - zs_w.min() + 0.005),
            height=float(ys_h.max() - ys_h.min() + 0.005),
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
