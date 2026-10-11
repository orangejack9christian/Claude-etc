# Trackmania 2020 FPS setup

For a Lenovo ThinkCentre (10MUS1NK00) with an i7-6700T, Intel HD 530 graphics, 32 GB RAM and a 1080p 60 Hz screen. Goal: 60+ FPS.

## Desktop shortcut

`install.ps1` makes a "Trackmania FPS" shortcut on the desktop. Copy the whole file, paste it into PowerShell, and press Enter.

The shortcut drops the screen to 1280x720, starts Trackmania at high priority, and puts the screen back about 30 seconds after you quit. The resolution change is never saved, so restarting the PC also puts the screen back. To change the size, edit `$Width` and `$Height` in `%USERPROFILE%\TrackmaniaFPS\TM-FPS.ps1`.

If the shortcut disappears again, check Windows Security > Virus & threat protection > Protection history, then rerun `install.ps1`.

## Trackmania settings

| Setting | Value |
|---|---|
| Display mode | Fullscreen, or Windowed borderless if Fullscreen fails |
| Resolution | 1280x720 (same as the shortcut) |
| VSync | Off |
| Max FPS | Off / unlimited |
| Preset | Lowest, then tick "Customize advanced video settings" |
| Shadows | Off, or the lowest level that keeps the car's shadow |
| Shader quality | Lowest |
| Texture quality | Low |
| Anti-aliasing | Off |
| Texture filtering | Lowest |
| Lightmap quality | Lowest |
| GPU/CPU synchronization | Try 1 frame, then Immediate |

Check FPS with the Win+G Performance widget. Above about 70 FPS, try 1600x900; below 60, go back to 1280x720.

## If Fullscreen doesn't work

1. Use the shortcut, then pick Windowed borderless at 1280x720. With the screen already at 720p it fills the screen and runs about as fast as Fullscreen.
2. Right-click `Trackmania.exe` > Properties > Compatibility, tick "Disable fullscreen optimizations", and click OK.
3. If 720p shows as a small picture with black borders, open Intel Graphics Command Center > Display and set Scale to "Maintain aspect ratio" or "Stretch".
