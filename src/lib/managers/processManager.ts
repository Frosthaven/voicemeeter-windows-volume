/*
 manages running Windows processes
*/

// imports *********************************************************************
// *****************************************************************************

import { exec } from 'child_process';
import * as logger from '../logger';
import { sleep } from '../util';

// variables *******************************************************************
// *****************************************************************************

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

// library *********************************************************************
// *****************************************************************************

/**
 * Polls the list of running processes every 5 seconds and responds once it
 * finds a match to the provided regex
 * @param processNameRegex the regex to match running processes against
 */
const waitForProcess = async (processNameRegex: RegExp) => {
    let processRunning: any = false;

    while (!processRunning) {
        logger.log('info', `Awaiting process match for ${processNameRegex}`);
        processRunning = await isProcessRunning(processNameRegex);
        if (!processRunning) {
            await sleep(5000);
        }
    }

    return Promise.resolve(processRunning);
};

/**
 * determines if a regex matched process is running
 * @param processNameRegex the regex to match rnuning processes against
 */
const isProcessRunning = async (processNameRegex: RegExp) => {
    return new Promise((resolve, reject) => {
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
            if (err) {
                logger.log('error', err.toString());
                throw new Error(err.toString());
            } else {
                const haystack = stdout.toLowerCase();
                let match = processNameRegex.exec(haystack);
                resolve(match !== null ? match[0] : false);
            }
        });
    });
};

// /**
//  * uses Powershell to restart a currently running process
//  * @param {string} processName the name of the target process
//  */
// const restartProcess = (processName) => {
//     let process = processName.replace('.exe', '');
//     runPowershell({
//         stdout: false,
//         commands: [
//             `$processes = Get-Process ${process}; foreach($process in $processes) { $path = $process.Path; $process.Kill(); $process.WaitForExit(); } Start-Process "$path"`,
//         ],
//         callback: () => {},
//     });
// };

// /**
//  * uses Powershell to set a process to run at a specific priority
//  * @param {string} processName the name of the target process
//  * @param {number} priorityCode  the priority code to apply
//  */
// const setProcessPriority = (processName, priorityCode) => {
//     runPowershell({
//         stdout: false,
//         commands: [
//             `Get-WmiObject Win32_process -filter 'name = "${processName}.exe"' | foreach-object { $_.SetPriority(${priorityCode}) }`,
//         ],
//         callback: () => {},
//     });
// };

// /**
//  * uses Powershell to set a process to run on a specific core affinity
//  * @param {*} processName the name of the target process
//  * @param {*} affinityCode the affinity code to apply
//  */
// const setProcessAffinity = (processName, affinityCode) => {
//     runPowershell({
//         stdout: false,
//         commands: [
//             `$Process = Get-Process ${processName}; $Process.ProcessorAffinity=${affinityCode}`,
//         ],
//         callback: () => {},
//     });
// };

export {
    PRIORITIES,
    isProcessRunning,
    // restartProcess,
    waitForProcess,
    // setProcessAffinity,
    // setProcessPriority,
};
