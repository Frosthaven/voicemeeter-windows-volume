/*
 manages running Windows processes
*/

import { exec } from 'child_process';
import { runPowershell } from '../runPowershell.js';

/**
 * This is an enumeration of system priorities for ease of development
 */
const PRIORITIES = {
    REALTIME: 256,
    HIGH: 128,
    ABOVE_NORMAL: 32768,
    NORMAL: 32,
    BELOW_NORMAL: 16384,
    LOW: 64,
};

/**
 * Polls the list of running processes every 5 seconds and responds once it
 * finds a match
 * @param {regexp} processNameRegex regex that matches a running process name
 * @param {function} callback a function to call once a match is found
 */
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

/**
 * checks if a process is running by matching a regex against the current task
 * list
 * @param {regexp} processNameRegex regex that matches a running process name
 * @param {function} cb a function with parameter of process name or false
 */
const isProcessRunning = (processNameRegex, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist`;
            break;
        case 'darwin':
            //
            /* @ts-ignore - necessary if not running on OSX */
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

/**
 * uses Powershell to restart a currently running process
 * @param {string} processName the name of the target process
 */
const restartProcess = (processName) => {
    let process = processName.replace('.exe', '');
    runPowershell({
        stdout: false,
        commands: [
            `$processes = Get-Process ${process}; foreach($process in $processes) { $path = $process.Path; $process.Kill(); $process.WaitForExit(); } Start-Process "$path"`,
        ],
        callback: () => {},
    });
};

/**
 * uses Powershell to set a process to run at a specific priority
 * @param {string} processName the name of the target process
 * @param {number} priorityCode  the priority code to apply
 */
const setProcessPriority = (processName, priorityCode) => {
    runPowershell({
        stdout: false,
        commands: [
            `Get-WmiObject Win32_process -filter 'name = "${processName}.exe"' | foreach-object { $_.SetPriority(${priorityCode}) }`,
        ],
        callback: () => {},
    });
};

/**
 * uses Powershell to set a process to run on a specific core affinity
 * @param {*} processName the name of the target process
 * @param {*} affinityCode the affinity code to apply
 */
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
    restartProcess,
    waitForProcess,
    setProcessAffinity,
    setProcessPriority,
};
