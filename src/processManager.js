import { exec } from 'child_process';
import { runPowershell } from './runPowershell';

const PRIORITIES = {
    REALTIME: 256,
    HIGH: 128,
    ABOVE_NORMAL: 32768,
    NORMAL: 32,
    BELOW_NORMAL: 16384,
    LOW: 64,
};

const waitForProcess = (processNameRegex, callback) => {
    isProcessRunning(processNameRegex, (running) => {
        if (running) {
            console.log('Process found:', running);
            callback();
        } else {
            console.log('Waiting for process:', processNameRegex);
            setTimeout(() => {
                waitForProcess(processNameRegex, callback);
            }, 5000);
        }
    });
};

const isProcessRunning = (processNameRegex, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist`;
            break;
        case 'darwin':
            cmd = `ps -ax | grep ${query}`;
            break;
        case 'linux':
            cmd = `ps -A`;
            break;
        default:
            break;
    }
    exec(cmd, (err, stdout, stderr) => {
        const haystack = stdout.toLowerCase();
        let match = processNameRegex.exec(haystack);
        cb(match !== null ? match[0] : false);
    });
};

const setProcessPriority = (processName, priorityCode) => {
    runPowershell({
        stdout: false,
        commands: [
            `Get-WmiObject Win32_process -filter 'name = "${processName}.exe"' | foreach-object { $_.SetPriority(${priorityCode}) }`,
        ],
        callback: () => {},
    });
};

const setProcessAffinity = (processName, affinityCode) => {
    runPowershell({
        stdout: false,
        commands: [
            `$Process = Get-Process ${processName}; $Process.ProcessorAffinity=${affinityCode}`,
        ],
        callback: () => {},
    });
};

export {
    PRIORITIES,
    isProcessRunning,
    waitForProcess,
    setProcessAffinity,
    setProcessPriority,
};
