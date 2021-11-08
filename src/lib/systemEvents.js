import { EventEmitter } from 'events';
import { runPowershell } from './runPowershell';

let systemEvents = new EventEmitter();
let lastDeviceEntry = null;
let pollInterval = null;

systemEvents.startPolling = () => {
    console.log('Starting system event polling');
    pollInterval = setInterval(() => {
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
    }, 5000);
};

systemEvents.stopPolling = () => {
    console.log('Stopping system event polling');
    clearInterval(pollInterval);
};

export { systemEvents };
