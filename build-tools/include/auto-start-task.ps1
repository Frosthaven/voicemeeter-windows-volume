$scriptpath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptpath

<# define our boot script #>
function Start-App {
    Set-Location $dir
    cscript.exe app-launcher.vbs
}

<# wait until the systray is available #>
while ($true) {
    try {
        $systray = (Get-Process explorer | Where-Object {$_.MainWindowTitle -eq "Program Manager"}).MainWindowHandle
        if ($systray -eq 0) {
            throw "systray not found"
        }
        <# extra sleep to make sure the systray is fully loaded #>
        Start-Sleep -Seconds 5
        Start-App
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
