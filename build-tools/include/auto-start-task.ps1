$scriptpath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptpath
$vmwvPath = Join-Path $dir "required\VMWV.exe"
Set-Location $dir

# Wait for VMWV to be responsive
# we will know vmwv loaded correctly when it has a cmd.exe child process

# begin the loader
$vmwvLoaded = $false
while ($vmwvLoaded -eq $false) {
    # kill any existing VMWV processes
    try {
        taskkill /im "VMWV.exe" /t /f
        Get-Process -Name "VMWV" -ErrorAction SilentlyContinue | Stop-Process -Force
    } catch {}

    # start a fresh process and give it time to breathe
    Start-Process -FilePath $vmwvPath -WindowStyle Hidden
    $vmwv = Get-Process -Name "VMWV" -ErrorAction SilentlyContinue
    Start-Sleep -s 2

    # begin polling for child processes to ensure VMWV has access to cmd.exe
    $polling_for_children = $true;
    $polling_count = 0;
    while ($polling_for_children -eq $true) {
        $childProcesses = Get-WmiObject Win32_Process -Filter "ParentProcessId=$($vmwv.Id)"
        if ($childProcesses | Where-Object {$_.Name -eq "cmd.exe"}) {
            # we have a child process, VMWV is ready
            $polling_for_children = $false
            $vmwvLoaded = $true
            break
        }

        # if cmd.exe is not found, wait a second and try again
        $polling_count++
        if ($polling_count -gt 10) {
            $polling_for_children = $false
        }
        Start-Sleep -s 1
    }
}
