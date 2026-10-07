# Round SVG coordinates to 3 decimals (0.001 pt) to shrink the viewer images.
# Usage: python3 round_svg.py in.svg out.svg
import re, sys
s = open(sys.argv[1]).read()
def r(m):
    v = round(float(m.group(0)), 3)
    t = ('%.3f' % v).rstrip('0').rstrip('.')
    return '0' if t in ('-0', '') else t
s2 = re.sub(r'-?\d+\.\d{4,}', r, s)
s2 = re.sub(r'\n\s*', '\n', s2)
open(sys.argv[2], 'w').write(s2)
print(len(s), '->', len(s2))
