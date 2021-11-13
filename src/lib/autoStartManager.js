import path from 'path';
import { runPowershell } from './runPowershell';

/**
 * Uses Powershell to generate a scheduled task that starts the tray application
 */
const enableStartOnLaunch = () => {
    console.log('Enabling automatic start with Windows');
    let actionPath = path.normalize(
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

    actionPath = null;
    psCommand = null;
};

/**
 * Uses Powershell to remove the generated startup task
 */
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

    psCommand = null;
};

export { enableStartOnLaunch, disableStartOnLaunch };
