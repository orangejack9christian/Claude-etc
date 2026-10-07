# CO2 dragster working drawing (tech ed)

- `working_drawing.pdf`: current drawing, flipped so the cartridge hole is on the right in the top and side views. 14 x 8.5 in sheet at 1:1. Print on legal paper, landscape, at Actual Size / 100%, then check that the 1-inch square measures 1 inch.
- `working_drawing_original.pdf`: the same drawing with the cartridge hole on the left.
- `true-size-viewer.html`: shows the drawing at true size on a screen. Match the on-screen card or ruler to a real one first. Keep `drawing.svg` next to it.
- `flip.js`: how the flip was made. Text keeps reading left to right, and the title, notes, rule checks and title block stay in place. Rebuild with `pdftocairo -svg working_drawing_original.pdf original.svg && NODE_PATH=$(npm root -g) node flip.js original.svg flipped.svg working_drawing.pdf`.
