#!/usr/bin/env bash
# Package a training run for the web viewer:
#   1. export the network sparse + quantized, gzip it, base64 it into <=10 MB text parts
#      (artifact hosting serves text but not arbitrary binary files)
#   2. test the exported network at several search depths on fresh games
#   3. write viewer/data.json
#
#   tools/release.sh [run_dir]        e.g. tools/release.sh runs/main
# Env: FINAL=1 once training has finished (labels the last stage "Fully trained")
#      PRUNE (min updates to keep a weight, default 16); PRUNE_LATE (same, for stages 1-2)
#      EVALS (search settings to test as depth:games, <depth>x<extra>:games or t<ms>:games;
#             default "1:2000 2:1000 3:200")
#      ENDGAME (depth:positions for the endgame test from bench/late16k.txt, default "2:311 3:311")
set -euo pipefail
cd "$(dirname "$0")/.."
RUN=${1:-runs/main}
PRUNE=${PRUNE:-16}
EVALS=${EVALS:-"1:2000 2:1000 3:200"}
THREADS=${THREADS:-$(nproc)}

make -s all
build/export --weights "${WEIGHTS:-$RUN/weights.bin}" --prune "$PRUNE" --prune-late "${PRUNE_LATE:-$PRUNE}" \
  --out "$RUN/net.bin" --meta "$RUN/net_meta.json"
gzip -9 -c "$RUN/net.bin" > "$RUN/net.bin.gz"
rm -f viewer/net-*.bin viewer/net-*.txt
base64 -w0 "$RUN/net.bin.gz" | split -b 10000000 -d -a 1 --additional-suffix=.txt - viewer/net-
ls -la viewer/net-*.txt

# Test the exported network (exactly what the viewer runs) at each search setting.
rm -f "$RUN"/eval_*.json "$RUN"/eval_*.jsonl
for spec in $EVALS; do
  name=${spec%%:*}
  games=${spec#*:}
  case $name in
    t*) args="--time ${name#t}" ;;                         # t100: 100 ms per move
    *x*) args="--depth ${name%x*} --extra ${name#*x}" ;;   # 3x1: depth 3, +1 when few cells are empty
    *) args="--depth $name" ;;
  esac
  build/play --net "$RUN/net.bin" $args --games "$games" --threads "$THREADS" --seed 777 \
    --record "$RUN/eval_$name.jsonl" --summary "$RUN/eval_$name.json" | grep -A6 RESULT
done
# Endgame test: play out the saved 16384 positions (what decides the 32768 tile).
rm -f "$RUN"/endgame_d*.json
for spec in ${ENDGAME:-"2:311 3:311"}; do
  d=${spec%%:*}
  build/play --net "$RUN/net.bin" --starts bench/late16k.txt --depth "$d" --games "${spec#*:}" --threads "$THREADS" \
    --seed 5150 --summary "$RUN/endgame_d$d.json" | grep -A6 RESULT | grep -E "RESULT|32768"
done
python3 tools/build_data.py "$RUN" viewer
