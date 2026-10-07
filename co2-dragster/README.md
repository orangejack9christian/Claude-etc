# CO2 dragster working drawing (tech ed)

- `working_drawing.pdf`: current drawing, flipped so the cartridge hole is on the right in the top and side views. 14 x 8.5 in sheet at 1:1. Print on legal paper, landscape, at Actual Size / 100%, then check that the 1-inch square measures 1 inch. Light projection lines carry the front and back of each side-view wheel up to the top view.
- `working_drawing_original.pdf`: the same drawing with the cartridge hole on the left.
- `true-size-viewer.html`: shows the drawing at true size on a screen. Match the on-screen card or ruler to a real one first. Keep `drawing.svg` next to it.
- `flip.js`: how the flip was made. Text keeps reading left to right, and the title, notes, rule checks and title block stay in place. Rebuild with `pdftocairo -svg working_drawing_original.pdf original.svg && NODE_PATH=$(npm root -g) node flip.js original.svg flipped.svg working_drawing.pdf`.

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
