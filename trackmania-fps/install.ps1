# Paste this whole file into PowerShell. It saves the launcher to
# %USERPROFILE%\TrackmaniaFPS and puts a "Trackmania FPS" shortcut on the desktop.

$dir = "$env:USERPROFILE\TrackmaniaFPS"
New-Item -ItemType Directory -Force $dir | Out-Null

Set-Content "$dir\TM-FPS.ps1" -Encoding UTF8 -Value @'
# Trackmania FPS launcher: drops the screen to a lower resolution, starts
# Trackmania, and puts the screen back after you quit. The change is never
# saved, so restarting the PC also puts the screen back.

$Width  = 1280   # try 1600 x 900 for a sharper picture if FPS stays above 70
$Height = 720

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class TmScreen {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public struct DEVMODE {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmDeviceName;
        public short dmSpecVersion, dmDriverVersion, dmSize, dmDriverExtra;
        public int dmFields, dmPositionX, dmPositionY, dmDisplayOrientation, dmDisplayFixedOutput;
        public short dmColor, dmDuplex, dmYResolution, dmTTOption, dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmFormName;
        public short dmLogPixels;
        public int dmBitsPerPel, dmPelsWidth, dmPelsHeight, dmDisplayFlags, dmDisplayFrequency;
        public int dmICMMethod, dmICMIntent, dmMediaType, dmDitherType, dmReserved1, dmReserved2, dmPanningWidth, dmPanningHeight;
    }
    [DllImport("user32.dll", CharSet = CharSet.Ansi)]
    static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE dm);
    [DllImport("user32.dll", CharSet = CharSet.Ansi)]
    static extern int ChangeDisplaySettings(ref DEVMODE dm, int flags);
    [DllImport("user32.dll", EntryPoint = "ChangeDisplaySettingsA")]
    static extern int ChangeDisplaySettingsReset(IntPtr dm, int flags);

    public static int Set(int width, int height) {
        DEVMODE dm = new DEVMODE();
        dm.dmSize = (short)Marshal.SizeOf(typeof(DEVMODE));
        EnumDisplaySettings(null, -1, ref dm);
        dm.dmPelsWidth = width;
        dm.dmPelsHeight = height;
        dm.dmFields = 0x80000 | 0x100000;
        return ChangeDisplaySettings(ref dm, 0);
    }
    public static int Reset() { return ChangeDisplaySettingsReset(IntPtr.Zero, 0); }
}
"@

$result = [TmScreen]::Set($Width, $Height)
if ($result -ne 0) { Write-Host "Couldn't switch the screen to ${Width}x${Height} (error $result)." }

try {
    if (-not (Get-Process Trackmania -ErrorAction SilentlyContinue)) {
        $game = @(
            "${env:ProgramFiles(x86)}\Ubisoft\Ubisoft Game Launcher\games\Trackmania\Trackmania.exe"
            "$env:ProgramFiles\Epic Games\TrackmaniaNext\Trackmania.exe"
            "${env:ProgramFiles(x86)}\Steam\steamapps\common\Trackmania\Trackmania.exe"
        ) | Where-Object { Test-Path $_ } | Select-Object -First 1
        if ($game) { Start-Process $game -WorkingDirectory (Split-Path $game) }
        else { Write-Host "Couldn't find Trackmania. Start it yourself now." }
    }

    Write-Host "Waiting for Trackmania to start..."
    while (-not (Get-Process Trackmania -ErrorAction SilentlyContinue)) { Start-Sleep 2 }

    # Launchers can close the game and reopen it, so only finish once it has
    # stayed closed for 30 seconds.
    do {
        Get-Process Trackmania -ErrorAction SilentlyContinue | ForEach-Object {
            try { $_.PriorityClass = 'High' } catch {}
        }
        Write-Host "Playing. The screen goes back to normal about 30 seconds after you quit."
        Wait-Process -Name Trackmania -ErrorAction SilentlyContinue
        Start-Sleep 30
    } while (Get-Process Trackmania -ErrorAction SilentlyContinue)
}
finally {
    [TmScreen]::Reset() | Out-Null
}
'@

$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Trackmania FPS.lnk")
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$dir\TM-FPS.ps1`""
$shortcut.WorkingDirectory = $dir
$shortcut.WindowStyle = 7
$shortcut.Save()

Write-Host "Done. Double-click 'Trackmania FPS' on your desktop to play."
