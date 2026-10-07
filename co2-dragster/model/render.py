"""3D picture of the dragster, ray-marched straight from the same math model.

Run:  python render.py   -> out/render.png (front 3/4 view + rear 3/4 view)
"""
import os

import numpy as np
from PIL import Image

import dragster as D

P = D.P
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
GROUND = -(P["wheel_r"] - P["axle_y"])
ZIN = P["pod_halfwidth"] + P["washer"]

BALSA, RUBBER, STEEL, CART, FLOOR, EYE = range(6)
COLORS = {BALSA: (0.93, 0.80, 0.58), RUBBER: (0.13, 0.13, 0.14), STEEL: (0.72, 0.74, 0.78),
          CART: (0.80, 0.82, 0.86), FLOOR: (0.94, 0.94, 0.95), EYE: (0.75, 0.70, 0.45)}
SHINY = {STEEL: 0.6, CART: 0.8, EYE: 0.5, RUBBER: 0.15, BALSA: 0.05, FLOOR: 0.0}


def wheels(p):
    d = np.full(p.shape[:-1], np.inf)
    w = P["wheel_w"]
    for xa in (P["rear_axle_x"], P["front_axle_x"]):
        for s in (1, -1):
            q = p - np.array([xa, P["axle_y"], s * (ZIN + w / 2)])
            r = np.sqrt(q[..., 0] ** 2 + q[..., 1] ** 2)
            tire = D.extrude_z(r - P["wheel_r"], q[..., 2], w / 2, r=0.04)
            dish = np.maximum(r - 0.55, -(s * q[..., 2] - (w / 2 - 0.06)))   # recessed outer face
            d = np.minimum(d, np.maximum(tire, -dish))
    return d


def axles(p):
    return np.minimum.reduce([D.cyl_z(p, xa, P["axle_y"], 1 / 16, P["axle_len"] / 2)
                              for xa in (P["rear_axle_x"], P["front_axle_x"])])


def cartridge(p):
    cy = P["cart_y"]
    body_ = D.capsule(p, (-0.25, cy, 0), (P["hole_depth"] - 0.37, cy, 0), 0.37)
    neck = D.round_cone(p, (-0.30, cy, 0), (-0.47, cy, 0), 0.3, 0.16)
    return np.minimum(body_, neck)


def eyes(p):
    d = np.full(p.shape[:-1], np.inf)
    for xe in P["eye_x"]:
        q = p - np.array([xe, -0.14, 0])
        ring = np.sqrt((np.sqrt(q[..., 1] ** 2 + q[..., 2] ** 2) - 0.065) ** 2 + q[..., 0] ** 2) - 0.018
        shank = D.capsule(p, (xe, -0.08, 0), (xe, 0.05, 0), 0.02)
        d = np.minimum.reduce([d, ring, shank])
    return d


BOX_LO = np.array([-0.6, GROUND - 0.01, -1.3])
BOX_HI = np.array([12.1, 1.95, 1.3])


def scene(p, with_mat=False):
    """Whole scene. Points far from the car only get a cheap box distance (a safe lower bound)."""
    shape = p.shape[:-1]
    p = p.reshape(-1, 3)
    q = np.abs(p - (BOX_LO + BOX_HI) / 2) - (BOX_HI - BOX_LO) / 2
    dbox = np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(-1), 0)
    floor = p[:, 1] - GROUND
    d = np.minimum(dbox, floor)
    mat = np.full(len(p), FLOOR)
    near = np.nonzero(dbox < 0.25)[0]
    if len(near):
        pn = p[near]
        parts = np.stack([D.body(pn), wheels(pn), axles(pn), cartridge(pn), floor[near], eyes(pn)])
        d[near] = parts.min(axis=0)
        mat[near] = parts.argmin(axis=0)
    if with_mat:
        return d.reshape(shape), mat.reshape(shape)
    return d.reshape(shape)


def paint(p, n):
    """Gulf-style racing livery: powder blue, orange center stripe, black nose and pods."""
    col = np.tile([0.47, 0.72, 0.88], (len(p), 1))
    stripe = (np.abs(p[:, 2]) < 0.12) & (n[:, 1] > 0.2)
    col[stripe] = [1.0, 0.45, 0.08]
    edge = (np.abs(np.abs(p[:, 2]) - 0.12) < 0.022) & (n[:, 1] > 0.2)
    col[edge] = [0.08, 0.08, 0.1]
    nose = p[:, 0] > 11.62
    col[nose] = [0.08, 0.08, 0.1]
    pods = np.abs(p[:, 2]) > 0.55
    pods &= (np.abs(p[:, 0] - P["rear_axle_x"]) < 0.9) | (np.abs(p[:, 0] - P["front_axle_x"]) < 0.9)
    pods &= p[:, 1] < 0.7
    col[pods] = [0.08, 0.08, 0.1]
    return col


def normals(p, e=0.002):
    ex, ey, ez = np.eye(3) * e
    n = np.stack([scene(p + ex) - scene(p - ex), scene(p + ey) - scene(p - ey),
                  scene(p + ez) - scene(p - ez)], -1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


def march(ro, rd, tmax=60.0, steps=160):
    t = np.zeros(len(rd))
    alive = np.ones(len(rd), bool)
    hit = np.zeros(len(rd), bool)
    for _ in range(steps):
        idx = np.nonzero(alive)[0]
        if len(idx) == 0:
            break
        d = scene(ro[idx] + t[idx, None] * rd[idx])
        t[idx] += d * 0.9
        done = d < 0.0015
        hit[idx[done]] = True
        alive[idx[done | (t[idx] > tmax)]] = False
    return t, hit


def soft_shadow(p, ldir, k=10.0, steps=48):
    res = np.ones(len(p))
    t = np.full(len(p), 0.02)
    for _ in range(steps):
        q = p + t[:, None] * ldir
        d = scene(q)
        # Only true car distances count toward the penumbra (the far-field box is just for skipping)
        qb = np.abs(q - (BOX_LO + BOX_HI) / 2) - (BOX_HI - BOX_LO) / 2
        near = np.linalg.norm(np.maximum(qb, 0), axis=-1) < 0.25
        res = np.where(near, np.minimum(res, np.clip(k * d / t, 0, 1)), res)
        t += np.clip(d, 0.01, 0.4)
    return np.clip(res, 0, 1)


def render(eye, target, w=900, h=420, fov=28, painted=True):
    eye, target = np.array(eye, float), np.array(target, float)
    fwd = target - eye
    fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, [0, 1, 0])
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    f = 1 / np.tan(np.radians(fov) / 2)
    ys, xs = np.mgrid[0:h, 0:w]
    u = (2 * (xs + 0.5) / w - 1) * (w / h)
    v = 1 - 2 * (ys + 0.5) / h
    rd = (u[..., None] * right + v[..., None] * up + f * fwd).reshape(-1, 3)
    rd /= np.linalg.norm(rd, axis=-1, keepdims=True)
    ro = np.broadcast_to(eye, rd.shape)

    t, hit = march(ro, rd)
    img = np.ones((len(rd), 3)) * np.array([1.0, 1.0, 1.0])
    idx = np.nonzero(hit)[0]
    p = ro[idx] + t[idx, None] * rd[idx]
    _, mat = scene(p, with_mat=True)
    n = normals(p)
    ldir = np.array([0.45, 0.85, 0.35])
    ldir /= np.linalg.norm(ldir)
    sh = soft_shadow(p + n * 0.004, ldir)
    diff = np.clip(n @ ldir, 0, 1) * sh
    sky = 0.5 + 0.5 * n[:, 1]
    hvec = ldir - rd[idx]
    hvec /= np.linalg.norm(hvec, axis=-1, keepdims=True)
    spec = np.clip(np.sum(n * hvec, -1), 0, 1) ** 40 * sh
    base = np.array([COLORS[m] for m in range(6)])[mat]
    shiny = np.array([SHINY[m] for m in range(6)])[mat]
    if painted:
        car = mat == BALSA
        base[car] = paint(p[car], n[car])
        shiny[car] = 0.35
    col = base * (0.30 * sky[:, None] + 0.80 * diff[:, None]) + shiny[:, None] * spec[:, None]
    # Fade the floor out with distance so the car floats on a soft shadow
    fl = mat == FLOOR
    dist = np.linalg.norm(p[fl][:, [0, 2]] - [6.0, 0.0], axis=-1)
    fade = np.clip((dist - 5.5) / 6.0, 0, 1)[:, None]
    col[fl] = col[fl] * (1 - fade) + fade * 1.0
    img[idx] = np.clip(col, 0, 1) ** (1 / 1.15)
    return (img.reshape(h, w, 3) * 255).astype(np.uint8)


def main():
    front = render(eye=(14.5, 4.6, 8.8), target=(6.0, 0.45, 0.0), w=900, h=480, fov=34)
    rear = render(eye=(-4.6, 3.6, 6.4), target=(4.2, 0.55, 0.0), w=900, h=480, fov=34)
    side = render(eye=(6.0, 0.9, 30.0), target=(6.0, 0.55, 0.0), w=1800, h=360, fov=10)
    raw = render(eye=(14.5, 4.6, 8.8), target=(6.0, 0.45, 0.0), w=900, h=480, fov=34, painted=False)
    top_row = np.concatenate([front, rear], axis=1)
    img = np.concatenate([top_row, side], axis=0)
    Image.fromarray(img).save(os.path.join(OUT, "render.png"))
    Image.fromarray(raw).save(os.path.join(OUT, "render_bare_balsa.png"))
    print("saved", img.shape)


if __name__ == "__main__":
    main()
