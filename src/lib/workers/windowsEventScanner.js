import { EventEmitter } from 'events';
import {
    JSONPS,
    startPowershellWorker,
    stopPowershellWorker,
} from '../runPowershell';

const label = 'StandbyScanner';
const interval = 5000;
let WindowsEvents = new EventEmitter();

let lastStandbyScan = null;
let lastResumeEvent = new Date().getTime();
let standbyInterval = null;
let lastTime = new Date().getTime();

const emitEvent = (label) => {
    // ensure we only fire one resume event within a 20 second span
    let newTime = new Date().getTime();
    if (newTime - lastResumeEvent > 20000) {
        lastResumeEvent = newTime;
        WindowsEvents.emit(label);
    }
    newTime = null;
};

const startWindowsEventScanner = () => {
    lastResumeEvent = new Date().getTime();
    standbyInterval = setInterval(() => {
        let currentTime = new Date().getTime();
        if (currentTime - lastTime > interval + 2000) {
            // this code block executed after the time it was expected (with a
            // 2 second margin of error), so the system must have just resumed
            emitEvent('resume');
        }
        lastTime = currentTime;
    }, interval);

    startPowershellWorker({
        interval: interval,
        label: label,
        command:
            'Get-EventLog -LogName system -Source "Microsoft-Windows-Kernel-Power" -Newest 15 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source, TimeWritten, InstanceID | ConvertTo-json | Out-Host',
        onResponse: (data) => {
            data = data.join();

            if (data.length > 0) {
                if (null === lastStandbyScan) {
                    // first scan
                    lastStandbyScan = data;
                } else if (data !== lastStandbyScan) {
                    // data has changed, resumed from modern standby
                    emitEvent('modern_resume');
                    lastStandbyScan = data;
                }
            }
        },
    });
};

const stopWindowsEventScanner = () => {
    clearInterval(standbyInterval);
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner, WindowsEvents };
