import { EventEmitter } from 'events';
import {
    JSONPS,
    startPowershellWorker,
    stopPowershellWorker,
} from '../runPowershell';

const label = 'EventScanner';
const interval = 5000;
let WindowsEvents = new EventEmitter();

let lastStandbyScan = null;
let lastTime = new Date().getTime();

const startWindowsEventScanner = () => {
    startPowershellWorker({
        interval: interval,
        label: label,
        command:
            'Get-EventLog -LogName system -Source "Microsoft-Windows-Kernel-Power" -Newest 15 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source, TimeWritten, InstanceID | ConvertTo-json | Out-Host',
        onResponse: (data) => {
            let currentTime = new Date().getTime();
            if (currentTime > lastTime + interval + 2000) {
                // this code block executed after the time it was expected, so
                // the system must have been asleep or hibernating
                WindowsEvents.emit('resume');
            }
            lastTime = currentTime;

            if (data.length > 0) {
                if (null === lastStandbyScan) {
                    // first scan
                    lastStandbyScan = data;
                } else if (data !== lastStandbyScan) {
                    // data has changed, resumed from modern standby
                    WindowsEvents.emit('modern_resume');
                    lastStandbyScan = data;
                }
            }
        },
    });
};

const stopWindowsEventScanner = () => {
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner };
