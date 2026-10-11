#!/usr/bin/env python3
"""Assemble viewer/data.json from a training run directory.

Reads train.csv, milestones.jsonl, net_meta.json and eval_d*.json[l] from the run
directory (see tools/release.sh) and writes the data file the viewer loads.
"""
import csv
import glob
import json
import math
import os
import statistics
import sys


def load_log(path):
    rows = []
    with open(path) as f:
        for r in csv.DictReader(f):
            # Older rows lack the drill columns; keep whatever each row has.
            row = {k: float(v) for k, v in r.items() if k and v not in (None, "")}
            # A run resumed from an earlier checkpoint replaces the rows logged after it.
            while rows and rows[-1]["games"] >= row["games"]:
                rows.pop()
            rows.append(row)
    return rows


def bin_log(rows, width=0.025):
    """Average log rows into bins of equal width on a log10 axis of games."""
    out, cur, key = [], [], None
    for r in rows:
        k = math.floor(math.log10(r["games"]) / width)
        if key is not None and k != key:
            out.append(cur)
            cur = []
        key = k
        cur.append(r)
    if cur:
        out.append(cur)
    res = []
    for b in out:
        avg = lambda f: sum(r[f] for r in b) / len(b)
        res.append({
            "games": round(avg("games")),
            "avg": round(avg("avg_score")),
            **{f"r{t}": round(avg(f"r{t}"), 4) for t in (2048, 4096, 8192, 16384, 32768)},
        })
    return res


def compact(n):
    if n >= 1e6:
        s = f"{n / 1e6:.1f}".rstrip("0").rstrip(".")
        return s + "M"
    if n >= 1e3:
        s = f"{n / 1e3:.1f}".rstrip("0").rstrip(".")
        return s + "K"
    return str(n)


def median_game(games):
    games = sorted(games, key=lambda g: g["score"])
    return games[len(games) // 2]


def slim(g):
    return {k: g[k] for k in ("score", "max", "moves", "init", "steps")}


def main(run, out):
    log = load_log(os.path.join(run, "train.csv"))
    meta = json.load(open(os.path.join(run, "net_meta.json")))

    # Games recorded by a run that was later abandoned (e.g. a reverted experiment).
    sup_path = os.path.join(run, "superseded.txt")
    superseded = {int(x) for x in open(sup_path).read().split()} if os.path.exists(sup_path) else set()
    by_trained = {}
    for line in open(os.path.join(run, "milestones.jsonl")):
        g = json.loads(line)
        if g["trained"] in superseded:
            continue
        by_trained.setdefault(g["trained"], []).append(g)
    final = os.environ.get("FINAL") == "1"
    replays = []
    for n in sorted(by_trained):
        if n >= meta["games"]:
            continue  # the current network is covered by the eval games below
        g = median_game(by_trained[n])
        if n == 0:
            title, label = "Untrained", "untrained network (all weights zero)"
        else:
            # Stages are recorded when training passes a milestone, so n can be a few games over it.
            shown = int(float(f"{n:.2g}")) if n >= 100 else n
            noun = "game" if shown == 1 else "games"
            title, label = f"After {compact(shown)} {noun}", f"network after {n:,} training games"
        replays.append({"key": f"m{n}", "trained": n, "stage": True, "title": title, "label": label,
                        "game": slim(g)})

    evals = []
    for path in glob.glob(os.path.join(run, "eval_*.json")):
        e = json.load(open(path))
        e["name"] = os.path.basename(path)[5:-5]
        evals.append(e)
    evals.sort(key=lambda e: (e.get("time_ms", 0) > 0, e.get("time_ms", 0), e["depth"], e.get("extra", 0)))
    games_of = lambda e: [json.loads(l) for l in open(os.path.join(run, f"eval_{e['name']}.jsonl"))]
    def search_name(e):
        if e.get("time_ms", 0) > 0:
            return f"{e['time_ms'] / 1000:g} s per move"
        if e.get("extra"):
            return f"depth {e['depth']}-{e['depth'] + 2 * e['extra']} search"
        return f"depth {e['depth']} search"

    n = meta["games"]
    d1 = [e for e in evals if e["depth"] == 1 and not e.get("time_ms")]
    if d1:
        replays.append({"key": f"m{n}", "trained": n, "stage": True,
                        "title": "Fully trained" if final else f"Now · {compact(n)}",
                        "label": f"network after {n:,} training games, no search",
                        "game": slim(median_game(games_of(d1[0])))})
    showcase = replays[-1]["key"]
    searched = [e for e in evals if e["depth"] >= 2 or e.get("time_ms", 0) > 0]
    if searched:
        deep = max((e for e in searched if e["games"] >= 20),
                   key=lambda e: (e.get("time_ms", 0), e["depth"], e.get("extra", 0)), default=searched[-1])
        games = games_of(deep)
        replays.append({"key": "typical", "trained": None, "title": f"Median game, {search_name(deep)}",
                        "label": f"median of {len(games)} test games with {search_name(deep)}",
                        "game": slim(median_game(games))})
        best, best_e = None, None
        for e in searched:
            for g in games_of(e):
                if best is None or g["score"] > best["score"]:
                    best, best_e = g, e
        replays.append({"key": "best", "trained": None, "title": "Best test game",
                        "label": f"best of all test games ({search_name(best_e)})", "game": slim(best)})
        showcase = "best"

    block = []
    prev = 0
    for r in log:
        block.append((r["games"] - prev) * r["avg_moves"])
        prev = r["games"]
    meta_out = {
        "patterns": meta["patterns"],
        "weights": meta["weights"],
        "touched": meta["touched"],
        "shipped": meta["shipped"],
        "prune": meta["prune"],
        "games": meta["games"],
        "moves": round(sum(block)),
        "hours": log[-1]["seconds"] / 3600,
        "weightFiles": sorted(os.path.basename(p) for p in glob.glob(os.path.join(out, "net-*.txt"))),
    }
    meta_out["final"] = final
    meta_out["stages"] = meta.get("stages", 1)
    events = []
    for fname, label in (("restart_from.txt", "Endgame practice starts"), ("stages_from.txt", "Endgame network added"),
                         ("drills_from.txt", "Endgame drills"), ("stage3_from.txt", "Final-stretch network added")):
        path = os.path.join(run, fname)
        if os.path.exists(path):
            events.append({"games": int(open(path).read().strip()), "label": label})
    # Endgame drills: points added from a fresh 16384 tile, per 50K training games.
    drills, cur, edge = [], [], None
    for r in log:
        if not r.get("drills"):
            continue
        b = int(r["games"] // 50000)
        if edge is not None and b != edge and cur:
            drills.append(cur)
            cur = []
        edge = b
        cur.append(r)
    if cur:
        drills.append(cur)
    drills = [{"games": round(sum(r["games"] for r in c) / len(c)),
               "gain": round(sum(r["drill_gain"] * r["drills"] for r in c) / sum(r["drills"] for r in c)),
               "r32768": round(sum(r["drill_r32768"] * r["drills"] for r in c) / sum(r["drills"] for r in c), 5),
               "n": int(sum(r["drills"] for r in c))} for c in drills]
    endgame = sorted((json.load(open(p)) for p in glob.glob(os.path.join(run, "endgame_*.json"))),
                     key=lambda e: (e.get("time_ms", 0) > 0, e.get("time_ms", 0), e["depth"]))
    data = {"drills": drills, "endgame": endgame, "events": events, "meta": meta_out, "log": bin_log(log), "replays": replays, "eval": evals, "showcase": showcase}
    with open(os.path.join(out, "data.json"), "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"wrote {out}/data.json: {len(data['log'])} chart points, {len(replays)} replays, "
          f"{len(evals)} eval rows, weight files {meta_out['weightFiles']}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "runs/main", sys.argv[2] if len(sys.argv) > 2 else "viewer")
