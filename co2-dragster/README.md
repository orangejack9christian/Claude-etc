# CO2 dragster working drawing (tech ed)

- `working_drawing.pdf`: the current drawing, two 14 x 8.5 in sheets at 1:1. Print on legal paper, landscape, at Actual Size / 100%, then check that the 1-inch square on each sheet measures 1 inch.
  - Sheet 1: top and side views, flipped so the cartridge hole is on the right. Light projection lines carry the front and back of each side-view wheel up to the top view. The side view also shows the edge where the round tube meets the 3/8" flat web under it: 23/32" up along the cartridge housing, then curving down the S-curve to where the web ends, 5 1/2" from the rear.
  - Sheet 2: the back view (from the CO2 end) with its dimensions: housing, web, axle pods, wheels, axle, cartridge and screw eye.
- `working_drawing_original.pdf`: the first drawing, one sheet, cartridge hole on the left.
- `true-size-viewer.html`: shows both sheets at true size on a screen. Match the on-screen card or ruler to a real one first. Keep `drawing.svg` and `back_view.svg` next to it.
- `model/`: the math model the drawing comes from.
  - `dragster.py`: the car as signed distance functions, with the rule checks and volume.
  - `render.py`: the 3D picture.
  - `drawing_geom.py` writes `drawing_geom.json`: the web/tube edge and the back-view outline, measured from the model. It also checks the drawn back-view outline against the model's own silhouette. It takes about 8 minutes.
- `build.js` and `back_view.js`: build the PDF. `build.js` mirrors the original sheet (text keeps reading left to right) and adds the projection lines and the web/tube edge. `back_view.js` draws sheet 2.

Rebuild:

```sh
pdftocairo -svg working_drawing_original.pdf /tmp/original.svg
(cd model && python3 drawing_geom.py drawing_geom.json)    # only if the model changed
NODE_PATH=$(npm root -g) node build.js /tmp/original.svg model/drawing_geom.json /tmp/dragster
cp /tmp/dragster/working_drawing.pdf .
pdftocairo -svg -f 1 -l 1 working_drawing.pdf drawing.svg      # viewer images, text as outlines
pdftocairo -svg -f 2 -l 2 working_drawing.pdf back_view.svg
```

## Requirement checks (measured from the drawing's lines)

| Requirement | Measured | Result |
| --- | --- | --- |
| At least 1/8" of wood around the axle holes | 0.156" (5/32") least, on the nose side of each 3/16" hole; 0.281" below each hole | Pass |
| At least 1/8" of wood around the cartridge hole | 0.1875" (3/16") wall on top (side view) and on each side (top view); 0.875" below; 0.406" between the hole and the rear axle hole | Pass |
| Axle height above the bottom, 3/16" to 7/16" | 0.375" (3/8") at both axles | Pass |
| Hidden lines for the axles in the top view | Two dashed lines per axle, 3/16" apart, across the full 1 5/8" width | Pass |
| Wheels drawn in the side view and transferred up | 1 5/8" circles on both axles in the side view; projection lines from their front and back edges to the top-view wheels, which line up exactly | Pass |
| Width at the front and rear axles at least 1 3/8" | 1.625" (1 5/8") at both | Pass |
| Hidden lines for hollowing in the top and side views | Cartridge hole (2" deep x 3/4") dashed in both views; screw eye holes dashed | Pass |
