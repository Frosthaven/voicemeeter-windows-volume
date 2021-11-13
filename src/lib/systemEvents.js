import { EventEmitter } from 'events';
import { powershellEvents, startPowershellWorker } from './runPowershell';
import { isToggleChecked } from '../lib/settingsManager';
import { getVoicemeeterConnection } from './audioSyncManager';

let systemEvents = new EventEmitter();
let pollInterval = null;
let polling_rate = 5000;

/**
 * watch for powershell host events that we can trigger
 */
// powershellEvents.on('CustomSystemEvents', (response) => {
//     console.log(response.data);
//     if (
//         response.event === 'changed' &&
//         response.data.old &&
//         response.data.old.length !== 0
//     ) {
//         let vm = getVoicemeeterConnection();
//         console.log(`Restarting Audio Engine. Reason: ${response.label}`);
//         //vm && vm.sendCommand('Restart', 1);
//     }
// });

/**
 * defines and starts the polling interval timer
 */
systemEvents.startPolling = () => {
    console.log('Starting system event polling');

    /*
        isToggleChecked('restart_audio_engine_on_device_change') &&
            runOnPowerShellHost({
                hostName: 'CustomSystemEvents',
                label: 'AudioDeviceChange',
                commands: ['get-wmiobject win32_sounddevice'],
            });
        isToggleChecked('restart_audio_engine_on_device_change') &&
            runOnPowerShellHost({
                hostName: 'CustomSystemEvents',
                label: 'ResumeStandby',
                commands: [
                    'Get-EventLog -LogName System -Source Microsoft-Windows-Kernel-Power -Newest 30 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source,TimeWritten',
                ],
            });
        isToggleChecked('restart_audio_engine_on_device_change') &&
            runOnPowerShellHost({
                hostName: 'CustomSystemEvents',
                label: 'Help',
                commands: ['Help'],
            });
        */

    // rememeber to pipe into Out-Host to get the results
    // @todo skip intervals that are run while worker is busy
    isToggleChecked('restart_audio_engine_on_device_change') &&
        startPowershellWorker({
            interval: 500,
            label: 'AudioDeviceChange',
            command: 'get-wmiobject win32_sounddevice | Out-Host',
            onResponse: (data) => {
                // compare results from prior results to know if device changed
                console.log(Date.now(), 'AudioDeviceChange', data);
                if (changed) {
                }
            },
        });

    /*
    let stdoutCollection = [];

    fs.stat(outputPath, function (err) {
        if (err?.code === 'ENOENT') {
            fs.mkdirSync(outputPath);
        }
    });
    fs.watch(outputPath, (event, filename) => {
        if (event === 'change') {
            let label = filename.slice(0, -4);
            let fullPath = `${outputPath}\\${filename}`;

            // get the value of the file and load it into our values
            fs.readFile(path.normalize(fullPath), (err, buff) => {
                // if any error
                if (err) {
                    console.error(err);
                    return;
                }

                // get the md5 hash of the file contents
                const fileContents = buff.toString().trim();
                const hash = md5(fileContents);

                // save the hash to our registry
                stdoutCollection[label] = {
                    hash: hash,
                    value: fileContents,
                };
                console.log(stdoutCollection);
            });
        }

    });

    pollInterval = setInterval(() => {
        isToggleChecked('restart_audio_engine_on_device_change') &&
            runPowershellScan(
                'AudioDeviceChange',
                `get-wmiobject win32_sounddevice`
            );
        isToggleChecked('restart_audio_engine_on_device_change') &&
            runPowershellScan(
                'ResumeFromStandby',
                `Get-EventLog -LogName System -Source Microsoft-Windows-Kernel-Power -Newest 30 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source,TimeWritten`
            );
    }, polling_rate);
    */
};

/**
 * stops the polling interval timer
 */
systemEvents.stopPolling = () => {
    console.log('Stopping system event polling');
    clearInterval(pollInterval);
};

export { systemEvents };
