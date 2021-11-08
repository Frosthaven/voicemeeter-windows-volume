import { EventEmitter } from 'events';
import { runPowershell } from './runPowershell';

let systemEvents = new EventEmitter();
let lastDeviceEntry = null;
let pollInterval = null;
let polling_rate = 5000;
let lastTime = null;

/**
 * detects when audio devices change by referencing the current audio device list
 */
const audioDeviceScan = () => {
    runPowershell({
        stdout: false,
        commands: ['get-wmiobject win32_sounddevice'],
        callback: (output) => {
            if (output && lastDeviceEntry && lastDeviceEntry !== output) {
                console.log('Audio devices changed');
                systemEvents.emit('any', {
                    type: 'AudioDeviceChange',
                    old: lastDeviceEntry,
                    new: output,
                });
                systemEvents.emit('AudioDeviceChange', {
                    old: lastDeviceEntry,
                    new: output,
                });
                lastDeviceEntry = output;
            } else if (output && !lastDeviceEntry) {
                lastDeviceEntry = output;
            }
        },
    });
};

/**
 * detects when the system wakes from sleep by looking for delayed interval
 * calls
 */
const resumeFromStandbyScan = () => {
    var currentTime = new Date().getTime();
    if (lastTime && currentTime > lastTime + polling_rate + 2000) {
        console.log('System has resumed from standby mode');
        systemEvents.emit('any', { type: 'Resume' });
        systemEvents.emit('Resume');
    }
    lastTime = currentTime;
};

/**
 * defines and starts the polling interval timer
 */
systemEvents.startPolling = () => {
    console.log('Starting system event polling');

    let lastTime = new Date().getTime();
    pollInterval = setInterval(() => {
        audioDeviceScan();
        resumeFromStandbyScan();
    }, polling_rate);
};

/**
 * stops the polling interval timer
 */
systemEvents.stopPolling = () => {
    console.log('Stopping system event polling');
    clearInterval(pollInterval);
};

export { systemEvents };
