import { EventEmitter } from 'events';
import { startPowershellWorker, stopPowershellWorker } from '../runPowershell';

const label = 'EventScanner';
let WindowsEvents = new EventEmitter();

const startWindowsEventScanner = () => {
    startPowershellWorker({
        interval: 5000,
        label: label,
        command: 'echo "to be implemented" | Out-Host',
        onResponse: (data) => {
            console.log(label, data);
        },
    });
};

const stopWindowsEventScanner = () => {
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner };
