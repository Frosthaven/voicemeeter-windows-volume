import { EventEmitter } from 'events';
import { startPowershellWorker, stopPowershellWorker } from '../runPowershell';

const label = 'StandbyScanner';
const interval = 5000;
let WindowsEvents = new EventEmitter();

let lastStandbyScan = null;
let lastResumeEvent = new Date().getTime();
let standbyInterval = null;
let isMonitorOn = true;
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
        setup: `Add-Type @'\r\n
using System;\r\n
using System.Diagnostics;\r\n
using System.Runtime.InteropServices;\r\n
\r\n
namespace PInvoke.Win32 {\r\n
\r\n
    public static class UserInput {\r\n
\r\n
        [DllImport("user32.dll", SetLastError=false)]\r\n
        private static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);\r\n
\r\n
        [StructLayout(LayoutKind.Sequential)]\r\n
        private struct LASTINPUTINFO {\r\n
            public uint cbSize;\r\n
            public int dwTime;\r\n
        }\r\n
\r\n
        public static DateTime LastInput {\r\n
            get {\r\n
                DateTime bootTime = DateTime.UtcNow.AddMilliseconds(-Environment.TickCount);\r\n
                DateTime lastInput = bootTime.AddMilliseconds(LastInputTicks);\r\n
                return lastInput;\r\n
            }\r\n
        }\r\n
\r\n
        public static TimeSpan IdleTime {\r\n
            get {\r\n
                return DateTime.UtcNow.Subtract(LastInput);\r\n
            }\r\n
        }\r\n
\r\n
        public static int LastInputTicks {\r\n
            get {\r\n
                LASTINPUTINFO lii = new LASTINPUTINFO();\r\n
                lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));\r\n
                GetLastInputInfo(ref lii);\r\n
                return lii.dwTime;\r\n
            }\r\n
        }\r\n
    }\r\n
}\r\n
'@\r\n`,
        command:
            'echo "resume-event:"; Get-EventLog -LogName system -Source "Microsoft-Windows-Kernel-Power" -Newest 15 | Where-Object {$_.EventID -eq 507} | Select-Object -Property Source, TimeWritten, InstanceID | Out-Host; echo "monitor-sleep:"; powercfg /query; echo "idle-time:"; [PInvoke.Win32.UserInput]::IdleTime | Out-Host;',
        onResponse: (data) => {
            let separatedOutputs = {};

            // split output lines into categorical arrays
            let bucket = null;
            let recordThis = false;
            data.forEach((line) => {
                recordThis = false;
                switch (line) {
                    case 'monitor-sleep:':
                        bucket = 'monitor-sleep';
                        break;
                    case 'resume-event:':
                        bucket = 'resume-event';
                        break;
                    case 'idle-time:':
                        bucket = 'idle-time';
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
                separatedOutputs['idle-time'] &&
                separatedOutputs['idle-time'].length > 0 &&
                separatedOutputs['monitor-sleep'] &&
                separatedOutputs['monitor-sleep'].length > 0
            ) {
                let monitorData = separatedOutputs['monitor-sleep'].join();
                let matches = monitorData.match(
                    /VIDEOIDLE[\s\S]*?Index:,*([0-9|a-z]*)[\s\S]*?Index:,*([0-9|a-z]*)/
                );
                if (matches && matches[1] && matches[2]) {
                    let timeout = parseInt(matches[1], 16);
                    if (timeout > 0) {
                        // monitor has sleep mode enabled, lets check how long they've
                        // been idle
                        let match =
                            separatedOutputs['idle-time'][3].match(
                                /[\s]*:\s*([0-9]*)/
                            );
                        let idletime = parseInt(match[1]);

                        // set the known monitor state - we subtract the current
                        // interval speed from the screen timeout timer to
                        // account for the fact this code block doesn't run
                        // every second. it allows enough time buffer to ensure
                        // we capture screen timeouts with high accuracy
                        console.log(
                            timeout,
                            idletime,
                            timeout - interval * 0.001
                        );
                        if (
                            isMonitorOn &&
                            idletime >= timeout - interval * 0.001
                        ) {
                            isMonitorOn = false;
                        } else if (
                            !isMonitorOn &&
                            idletime < timeout - interval * 0.001
                        ) {
                            isMonitorOn = true;
                            emitEvent('monitor_resume');
                        }

                        match = null;
                        idletime = null;
                    }

                    timeout = null;
                }

                matches = null;
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
