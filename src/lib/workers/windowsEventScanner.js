import { EventEmitter } from 'events';
import {
    JSONPS,
    startPowershellWorker,
    stopPowershellWorker,
} from '../runPowershell';

const label = 'EventScanner';
let WindowsEvents = new EventEmitter();

const startWindowsEventScanner = () => {
    startPowershellWorker({
        interval: 5000,
        label: label,
        command:
            'Get-EventLog -LogName system -Source "Microsoft-Windows-Kernel-Power" -Newest 15 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source, TimeWritten, InstanceID | ConvertTo-json | Out-Host',
        onResponse: (data) => {
            if (data.length > 0) {
                try {
                    data = JSONPS.parse(data);
                    console.log(data);
                } catch (e) {
                    cocnsole.log(e);
                }
            }
        },
    });
};

const stopWindowsEventScanner = () => {
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner };
