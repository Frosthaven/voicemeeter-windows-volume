import path from 'path';
import { runPowershell } from './runPowershell';

const enableStartOnLaunch = () => {
    console.log('Enabling automatic start with Windows');
    const actionPath = path.normalize(
        __dirname + '/../voicemeeter-windows-volume.vbs'
    );

    let psCommand = `
        $name = "voicemeeter-windows-volume";
        $description = "Runs voicemeeter-windows-volume app at login";
        $action = New-ScheduledTaskAction -Execute "${actionPath}";
        $trigger = New-ScheduledTaskTrigger -AtLogon;
        $principal = New-ScheduledTaskPrincipal -GroupId "BUILTIN\\Administrators" -RunLevel Highest;
        $settings = New-ScheduledTaskSettingsSet -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -DontStopOnIdleEnd -ExecutionTimeLimit 0;
        $task = New-ScheduledTask -Description $description -Action $action -Principal $principal -Trigger $trigger -Settings $settings;

        Unregister-ScheduledTask -TaskName $name -Confirm:$false;
        Register-ScheduledTask $name -InputObject $task;
    `;

    runPowershell({
        stdout: false,
        commands: [psCommand],
        callback: () => {},
    });
};

const disableStartOnLaunch = () => {
    console.log('Disabling automatic start with Windows');
    let psCommand = `
        $name = "voicemeeter-windows-volume";
        Unregister-ScheduledTask -TaskName $name -Confirm:$false;
    `;
    runPowershell({
        stdout: false,
        commands: [psCommand],
        callback: () => {},
    });
};

export { enableStartOnLaunch, disableStartOnLaunch };
