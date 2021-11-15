import { EventEmitter } from 'events';
import { startPowershellWorker, stopPowershellWorker } from '../runPowershell';

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
                data.shift();
                data.pop();
                data = data
                    .join()
                    .replace(/\,\,/g, ',')
                    .replace(/\,\}/g, '}')
                    .replace(/\{\,/g, '{');
                data = `{"PSDATA":[${data}]}`;
                data = JSON.parse(data).PSDATA;
                console.log(label, data);
            }
        },
    });
};

const stopWindowsEventScanner = () => {
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner };
