$scriptpath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptpath

<# define our boot script #>
function Start-App {
    Set-Location $dir
    cscript.exe app-launcher.vbs
}

<# Run Start-App only after the task bar is accessible #>
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate('Taskbar')
Start-App
