import path from 'path';
const { spawn } = require('child_process');

const PRIORITIES = {
    REALTIME: 256,
    HIGH: 128,
    ABOVE_NORMAL: 32768,
    NORMAL: 32,
    BELOW_NORMAL: 16384,
    LOW: 64,
};

const AFFINITIES = {};

const formattedCodeblock = (typedCode) => {
    return typedCode.replace(/\r?\n|\r/g, ' ').trim();
};

const runPowershell = ({ commands, callback, stdout = false }) => {
    // make sure our command is a part of an array
    if (typeof commands !== 'object') {
        commands = [commands];
    }

    // script started
    const child = spawn('powershell.exe', commands);

    // script output
    if (stdout) {
        console.log('Running Powershell Command:', commands.join(' '));
        child.on('exit', function () {
            console.log('Powershell Script finished');
        });
        child.stdout.on('data', function (data) {
            console.log('Powershell Data: ' + data);
        });
        child.stderr.on('data', function (data) {
            console.log('Powershell Errors: ' + data);
        });
    }

    // close powershell input
    child.stdin.end();
};

const enableStartOnLaunch = () => {
    const actionPath = path.normalize(
        __dirname + '/../voicemeeter-windows-volume.vbs'
    );

    let psCommand = formattedCodeblock(`
        $name = "voicemeeter-windows-volume";
        $description = "Runs voicemeeter-windows-volume app at login";
        $action = New-ScheduledTaskAction -Execute "${actionPath}";
        $trigger = New-ScheduledTaskTrigger -AtLogon;
        $principal = New-ScheduledTaskPrincipal -GroupId "BUILTIN\\Administrators" -RunLevel Highest;
        $settings = New-ScheduledTaskSettingsSet -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -DontStopOnIdleEnd -ExecutionTimeLimit 0;
        $task = New-ScheduledTask -Description $description -Action $action -Principal $principal -Trigger $trigger -Settings $settings;

        Unregister-ScheduledTask -TaskName $name -Confirm:$false;
        Register-ScheduledTask $name -InputObject $task;
    `);

    runPowershell({
        stdout: false,
        commands: [psCommand],
        callback: () => {},
    });
};

const disableStartOnLaunch = () => {
    let psCommand = formattedCodeblock(`
        $name = "voicemeeter-windows-volume";
        Unregister-ScheduledTask -TaskName $name -Confirm:$false;
    `);
    runPowershell({
        stdout: false,
        commands: [psCommand],
        callback: () => {},
    });
};

const setProcessPriority = (processName, priorityCode) => {
    runPowershell({
        stdout: false,
        commands: [
            `Get-WmiObject Win32_process -filter 'name = "${processName}.exe"' | foreach-object { $_.SetPriority(${priorityCode}) }`,
        ],
        callback: () => {},
    });
};

const setProcessAffinity = (processName, affinityCode) => {
    runPowershell({
        stdout: false,
        commands: [
            `$Process = Get-Process ${processName}; $Process.ProcessorAffinity=${affinityCode}`,
        ],
        callback: () => {},
    });
};

export {
    setProcessPriority,
    setProcessAffinity,
    PRIORITIES,
    enableStartOnLaunch,
    disableStartOnLaunch,
};
