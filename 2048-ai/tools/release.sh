#!/usr/bin/env bash
# Package a training run for the web viewer:
#   1. export the network sparse + quantized, gzip it, base64 it into <=10 MB text parts
#      (artifact hosting serves text but not arbitrary binary files)
#   2. test the exported network at several search depths on fresh games
#   3. write viewer/data.json
#
#   tools/release.sh [run_dir]        e.g. tools/release.sh runs/main
# Env: FINAL=1 once training has finished (labels the last stage "Fully trained")
#      PRUNE (min updates to keep a weight, default 16)
#      EVALS (search settings to test as depth:games or t<ms>:games, default "1:2000 2:1000 3:200")
set -euo pipefail
cd "$(dirname "$0")/.."
RUN=${1:-runs/main}
PRUNE=${PRUNE:-16}
EVALS=${EVALS:-"1:2000 2:1000 3:200"}
THREADS=${THREADS:-$(nproc)}

make -s all
build/export --weights "$RUN/weights.bin" --prune "$PRUNE" --out "$RUN/net.bin" --meta "$RUN/net_meta.json"
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
    t*) args="--time ${name#t}" ;;
    *) args="--depth $name" ;;
  esac
  build/play --net "$RUN/net.bin" $args --games "$games" --threads "$THREADS" --seed 777 \
    --record "$RUN/eval_$name.jsonl" --summary "$RUN/eval_$name.json" | grep -A6 RESULT
done
python3 tools/build_data.py "$RUN" viewer
