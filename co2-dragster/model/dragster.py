"""CO2 dragster: math model -> rule checks -> 1:1 working drawing.

The car is built from signed distance functions (SDFs): each part is an
equation that says how far any point is from its surface (negative = inside
the wood). That lets us measure every wall thickness exactly, compute the
volume/mass, and draw the side and top views straight from the same model.

Coordinates (inches):  x = along the car (0 = rear face, 12 = nose tip)
                       y = up (0 = body bottom)
                       z = across (0 = centerline)
"""
import numpy as np

# ----------------------------------------------------------------------------
# Design numbers. Every rule from the class packet is noted next to the value.
# ----------------------------------------------------------------------------
P = dict(
    length=12.0,          # 11" min, 12" max (spec sheet lists 12" as the constant)
    max_width=1.625,      # 1 5/8" max
    max_height=2.75,      # 2 3/4" max
    wheel_r=0.8125,       # 1 5/8" wheels
    wheel_w=0.3125,       # ASSUMED 5/16" -- measure your wheels
    washer=0.03125,       # 1/32" washer between hub and body
    axle_len=2.5,         # given
    axle_hole_r=3 / 32,   # packet: drill 3/16" axle holes
    axle_y=0.375,         # spec: axle centerline 3/8" from bottom
    rear_axle_x=1.0,
    front_axle_x=11.0,
    cart_r=0.375,         # 3/4" cartridge / hole
    cart_len=2.5,
    hole_depth=2.0,       # 3/4" x 2" hole
    cart_y=0.375 + 0.875, # rule: cartridge centerline 7/8" above axle centerline
    wall=0.1875,          # rule min 1/8"; we use 3/16" so balsa can't split
    front_wall=0.25,      # wood in front of the hole (takes the thrust)
    spine_r=0.1875,       # 3/8" round spine (3/8" min thickness)
    ramp_end_x=5.5,       # where the S-curve swoop finishes blending into the spine
    pod_r=0.25,           # teardrop axle pods: 1/2" thick around each axle
    pod_tail=0.65,        # pod tail length behind the axle
    pod_halfwidth=0.8125, # 1 5/8" wide at the axles (spec sheet)
    eye_x=(1.75, 11.625), # screw eyes on the centerline, under the car
    fillet=0.08,          # small blended joints (sanded)
)
P["housing_len"] = P["hole_depth"] + P["front_wall"]
P["housing_r"] = P["cart_r"] + P["wall"]


# ----------------------------------------------------------------------------
# SDF building blocks (numpy, any number of points; last axis = coordinates)
# ----------------------------------------------------------------------------
def length(v):
    return np.sqrt(np.sum(v * v, axis=-1))


def round_cone(p, a, b, r1, r2):
    """Two spheres/circles (a,r1) and (b,r2) joined by a smooth taper (Inigo Quilez)."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    ba = b - a
    l2 = ba @ ba
    rr = r1 - r2
    a2 = l2 - rr * rr
    il2 = 1.0 / l2
    pa = p - a
    y = pa @ ba
    z = y - l2
    q = pa * l2 - y[..., None] * ba
    x2 = np.sum(q * q, axis=-1)
    y2 = y * y * l2
    z2 = z * z * l2
    k = np.sign(rr) * rr * rr * x2
    d3 = (np.sqrt(np.maximum(x2 * a2 * il2, 0)) + y * rr) * il2 - r1
    d1 = np.sqrt(x2 + z2) * il2 - r2
    d2 = np.sqrt(x2 + y2) * il2 - r1
    return np.where(np.sign(z) * a2 * z2 > k, d1, np.where(np.sign(y) * a2 * y2 < k, d2, d3))


def capsule(p, a, b, r):
    return round_cone(p, a, b, r, r)


def polygon2d(p, verts):
    """Signed distance to a closed 2D polygon."""
    v = np.asarray(verts, float)
    d = np.sum((p - v[0]) ** 2, axis=-1)
    s = np.ones(p.shape[:-1])
    n = len(v)
    for i in range(n):
        j = i - 1
        e = v[j] - v[i]
        w = p - v[i]
        t = np.clip((w @ e) / (e @ e), 0, 1)
        bq = w - t[..., None] * e
        d = np.minimum(d, np.sum(bq * bq, axis=-1))
        c1 = p[..., 1] >= v[i][1]
        c2 = p[..., 1] < v[j][1]
        c3 = e[0] * w[..., 1] > e[1] * w[..., 0]
        flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
        s = np.where(flip, -s, s)
    return s * np.sqrt(d)


def extrude_z(d2, z, half, r=0.0):
    """Extrude a 2D shape (distance d2 in the x-y plane) along z, edges rounded by r."""
    wx = d2 + r
    wy = np.abs(z) - (half - r)
    out = np.minimum(np.maximum(wx, wy), 0) + np.sqrt(np.maximum(wx, 0) ** 2 + np.maximum(wy, 0) ** 2)
    return out - r


def cyl_x(p, x0, x1, yc, r):
    """Capped cylinder along x from x0 to x1, axis at (y=yc, z=0)."""
    d2 = np.sqrt((p[..., 1] - yc) ** 2 + p[..., 2] ** 2) - r
    wx = np.abs(p[..., 0] - (x0 + x1) / 2) - (x1 - x0) / 2
    return np.minimum(np.maximum(d2, wx), 0) + np.sqrt(np.maximum(d2, 0) ** 2 + np.maximum(wx, 0) ** 2)


def cyl_z(p, xc, yc, r, half):
    d2 = np.sqrt((p[..., 0] - xc) ** 2 + (p[..., 1] - yc) ** 2) - r
    wz = np.abs(p[..., 2]) - half
    return np.minimum(np.maximum(d2, wz), 0) + np.sqrt(np.maximum(d2, 0) ** 2 + np.maximum(wz, 0) ** 2)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


# ----------------------------------------------------------------------------
# The car body
# ----------------------------------------------------------------------------
def pod(p, axle_x):
    """Teardrop axle pod: round around the axle, tapering toward the rear, full width."""
    xy = p[..., :2]
    # Tail stays 3/8" thick (spec sheet: 3/8" minimum) and fairs into the spine
    d2 = round_cone(xy, (axle_x, P["axle_y"]), (axle_x - P["pod_tail"], P["spine_r"]), P["pod_r"], P["spine_r"])
    return extrude_z(d2, p[..., 2], P["pod_halfwidth"], r=0.02)


def swoop_curve(n=14):
    """Center line + radius of the S-curve from the housing down to the spine.
    smoothstep keeps both ends level, so it leaves the housing and meets the spine with no kink."""
    s = np.linspace(0, 1, n)
    sm = s * s * (3 - 2 * s)
    xs = P["housing_len"] + (P["ramp_end_x"] - P["housing_len"]) * s
    ys = P["cart_y"] + (P["spine_r"] - P["cart_y"]) * sm
    rs = P["housing_r"] + (P["spine_r"] - P["housing_r"]) * sm
    return xs, ys, rs


def body_outer(p):
    """The solid wood shape before any holes are drilled."""
    cy, hr, sr = P["cart_y"], P["housing_r"], P["spine_r"]
    xs, ys, rs = swoop_curve()
    swoop = np.minimum.reduce([round_cone(p, (xs[i], ys[i], 0), (xs[i + 1], ys[i + 1], 0), rs[i], rs[i + 1])
                               for i in range(len(xs) - 1)])
    web = [(0, 0), (0, cy)] + list(zip(xs, ys)) + [(P["ramp_end_x"], 0)]
    # These parts meet tangentially, so a plain union is already smooth
    d = np.minimum.reduce([
        cyl_x(p, 0.0, P["housing_len"], cy, hr),                                   # cartridge housing
        swoop,                                                                     # S-curve into the spine
        capsule(p, (sr, sr, 0), (P["length"] - sr, sr, 0), sr),                   # 3/8" spine
        extrude_z(polygon2d(p[..., :2], web), p[..., 2], sr, r=0.03),             # 3/8" web under it all
    ])
    # The axle pods get small blended joints (sanded fillets)
    for xa in (P["rear_axle_x"], P["front_axle_x"]):
        d = smin(d, pod(p, xa), P["fillet"])
    # Clip to the legal box: flat bottom, max width, length, height
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    box = np.maximum.reduce([-y, y - P["max_height"], np.abs(z) - P["max_width"] / 2, -x, x - P["length"]])
    return np.maximum(d, box)


def holes(p):
    cart = cyl_x(p, -1.0, P["hole_depth"], P["cart_y"], P["cart_r"])
    ax = [cyl_z(p, xa, P["axle_y"], P["axle_hole_r"], 2.0) for xa in (P["rear_axle_x"], P["front_axle_x"])]
    return np.minimum.reduce([cart] + ax)


def body(p):
    return np.maximum(body_outer(p), -holes(p))


# ----------------------------------------------------------------------------
# Measurements
# ----------------------------------------------------------------------------
STEP = 0.01


def _min_over(xs, ys, zs, axis):
    """Evaluate the body on a grid in x-slabs and take the min along one axis (a silhouette)."""
    out = []
    for i0 in range(0, len(xs), 60):
        X, Y, Z = np.meshgrid(xs[i0:i0 + 60], ys, zs, indexing="ij")
        out.append(body(np.stack([X, Y, Z], axis=-1)).min(axis=axis))
    return np.concatenate(out, axis=0).T


def sample_fields(step=STEP):
    """Volume + centroid on a 0.02" grid; side/top silhouettes at 0.01"."""
    xs = np.arange(-0.05, P["length"] + 0.05, step)
    ys = np.arange(-0.05, P["max_height"] + 0.05, step)
    zs = np.arange(-P["max_width"] / 2 - 0.05, P["max_width"] / 2 + 0.05, step)
    # Side view: every part is widest-profiled at the centerline, so a few z slices are plenty
    side = _min_over(xs, ys, np.unique(np.r_[np.linspace(-0.8, 0.8, 17), 0.0]), axis=2)
    # Top view: slices through all the heights where parts are widest
    yk = np.unique(np.r_[np.arange(0, 1.95, 0.05), P["cart_y"], P["axle_y"], P["spine_r"]])
    top = _min_over(xs, yk, zs, axis=1)
    # Volume and centroid
    g = 0.02
    count, sx, sy = 0, 0.0, 0.0
    gx = np.arange(0, P["length"], g) + g / 2
    gy = np.arange(0, 2.0, g) + g / 2
    gz = np.arange(-0.85, 0.85, g) + g / 2
    for i0 in range(0, len(gx), 60):
        X, Y, Z = np.meshgrid(gx[i0:i0 + 60], gy, gz, indexing="ij")
        inside = body(np.stack([X, Y, Z], axis=-1)) <= 0
        count += inside.sum()
        sx += X[inside].sum()
        sy += Y[inside].sum()
    return dict(xs=xs, ys=ys, zs=zs, side=side, top=top, volume=count * g ** 3,
                cx=sx / count, cy=sy / count)


def wall_thickness(origins, normals, tmax=1.5, dt=0.002):
    """Wood thickness along each ray: distance until we leave the outer surface."""
    ts = np.arange(0, tmax, dt)
    pts = origins[:, None, :] + ts[None, :, None] * normals[:, None, :]
    outside = body_outer(pts) > 0
    first = np.argmax(outside, axis=1)
    # A ray that never leaves the wood within tmax is at least tmax thick
    return np.where(outside.any(axis=1), ts[first], tmax)


def rule_checks(fields):
    out = []
    xs, ys, zs = fields["xs"], fields["ys"], fields["zs"]
    inside_side = fields["side"] <= 0
    inside_top = fields["top"] <= 0
    xin = xs[inside_side.any(axis=0)]
    yin = ys[inside_side.any(axis=1)]
    zin = zs[inside_top.any(axis=1)]
    L, H, W = xin.max() - xin.min() + STEP, yin.max() - yin.min() + STEP, zin.max() - zin.min() + STEP
    out.append(("Length 11\"-12\"", f"{L:.3f}\"", 11 - 0.02 <= L <= 12 + 0.02))
    out.append(("Width <= 1 5/8\"", f"{W:.3f}\"", W <= 1.625 + 0.02))
    out.append(("Height <= 2 3/4\"", f"{H:.3f}\"", H <= 2.75 + 0.02))

    # Wood around the cartridge hole (sides + front end)
    th = np.linspace(0, 2 * np.pi, 72, endpoint=False)
    xx = np.linspace(0.05, P["hole_depth"] - 0.02, 40)
    T, XX = np.meshgrid(th, xx)
    n = np.stack([np.zeros_like(T), np.cos(T), np.sin(T)], -1).reshape(-1, 3)
    o = np.stack([XX, P["cart_y"] + P["cart_r"] * np.cos(T), P["cart_r"] * np.sin(T)], -1).reshape(-1, 3)
    side_wall = wall_thickness(o, n).min()
    rr = np.linspace(0, P["cart_r"], 8)
    R2, T2 = np.meshgrid(rr, th)
    o2 = np.stack([np.full(R2.size, P["hole_depth"]), (P["cart_y"] + R2 * np.cos(T2)).ravel(),
                   (R2 * np.sin(T2)).ravel()], -1)
    front = wall_thickness(o2, np.tile([1.0, 0, 0], (len(o2), 1))).min()
    w = min(side_wall, front)
    out.append(("Wood around cartridge >= 1/8\"", f"{w:.3f}\" (front {front:.3f}\")", w >= 0.125 - 1e-3))

    # Wood around each axle hole
    for name, xa in (("rear", P["rear_axle_x"]), ("front", P["front_axle_x"])):
        zz = np.linspace(-P["pod_halfwidth"] + 0.05, P["pod_halfwidth"] - 0.05, 25)
        T, ZZ = np.meshgrid(th, zz)
        n = np.stack([np.cos(T), np.sin(T), np.zeros_like(T)], -1).reshape(-1, 3)
        o = np.stack([xa + P["axle_hole_r"] * np.cos(T), P["axle_y"] + P["axle_hole_r"] * np.sin(T), ZZ],
                     -1).reshape(-1, 3)
        w = wall_thickness(o, n).min()
        out.append((f"Wood around {name} axle >= 1/8\"", f"{w:.3f}\"", w >= 0.125 - 1e-3))

    ya = P["axle_y"] - yin.min()
    out.append(("Axle height 3/16\"-7/16\" above bottom", f"{ya:.3f}\"", 3 / 16 <= ya <= 7 / 16))
    dc = P["cart_y"] - P["axle_y"]
    out.append(("Cartridge CL 7/8\" above axle CL", f"{dc:.3f}\"", abs(dc - 0.875) < 1e-6))
    out.append(("Width at axles >= 1 3/8\" (spec: 1 5/8\")", f"{2 * P['pod_halfwidth']:.3f}\"",
                2 * P["pod_halfwidth"] >= 1.375))
    out.append(("Spine thickness >= 3/8\"", f"{2 * P['spine_r']:.3f}\"", 2 * P["spine_r"] >= 0.375))
    gap = P["eye_x"][1] - P["eye_x"][0]
    out.append(("Screw eyes >= 6\" apart, on centerline", f"{gap:.3f}\"", gap >= 6))
    return out


if __name__ == "__main__":
    f = sample_fields()
    vol = f["volume"]
    print(f"volume {vol:.3f} in^3 = {vol * 16.387:.1f} cm^3")
    for lb in (6, 8, 10):
        print(f"  balsa {lb} lb/ft^3 -> {vol * 16.387 * lb * 0.016018:.1f} g")
    print(f"body centroid x={f['cx']:.2f}  y={f['cy']:.2f}")
    for name, val, ok in rule_checks(f):
        print(("PASS " if ok else "FAIL ") + f"{name:45s} {val}")
