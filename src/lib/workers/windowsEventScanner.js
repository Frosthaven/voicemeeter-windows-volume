import { EventEmitter } from 'events';
import { startPowershellWorker, stopPowershellWorker } from '../runPowershell';

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
            'echo "resume-event:"; Get-EventLog -LogName system -Source "Microsoft-Windows-Kernel-Power" -Newest 15 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source, TimeWritten, InstanceID | Out-Host; echo "monitor-sleep:"; powercfg /query;',
        onResponse: (data) => {
            let separatedOutputs = {};

            // split output lines into categorical arrays
            let bucket = null;
            let recordThis = false;
            data.forEach((line) => {
                switch (line) {
                    case 'monitor-sleep:':
                        bucket = 'monitor-sleep';
                        recordThis = false;
                        break;
                    case 'resume-event:':
                        bucket = 'resume-event';
                        recordThis = false;
                        break;
                    default:
                        recordThis = true;
                        break;
                }

                if (recordThis) {
                    if (!separatedOutputs[bucket]) {
                        separatedOutputs[bucket] = [];
                    }
                    separatedOutputs[bucket].push(line);
                }
            });

            // handle resume events chunk
            if (
                separatedOutputs['resume-event'] &&
                separatedOutputs['resume-event'].length > 0
            ) {
                let resumeData = separatedOutputs['resume-event'].join();
                if (null === lastStandbyScan) {
                    // first scan
                    lastStandbyScan = resumeData;
                } else if (resumeData !== lastStandbyScan) {
                    // data has changed, resumed from modern standby
                    emitEvent('modern_resume');
                    lastStandbyScan = resumeData;
                }
                resumeData = null;
            }

            // handle monitor sleep chunk - atm this gets the current setting of when
            // monitor goes to sleep in hex
            if (
                separatedOutputs['monitor-sleep'] &&
                separatedOutputs['monitor-sleep'].length > 0
            ) {
                let monitorData = separatedOutputs['monitor-sleep'].join();
                let reg =
                    /VIDEOIDLE[\s\S]*?Index:,*([0-9|a-z]*)[\s\S]*?Index:,*([0-9|a-z]*)/;
                let matches = monitorData.match(reg);
                if (matches && matches[1] && matches[2]) {
                    let timeout = parseInt(matches[1], 16);
                }

                matches = null;
                reg = null;
                monitorData = null;
            }
        },
    });
};

const stopWindowsEventScanner = () => {
    clearInterval(standbyInterval);
    stopPowershellWorker(label);
};

export { startWindowsEventScanner, stopWindowsEventScanner, WindowsEvents };
