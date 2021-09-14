import { spawn } from 'child_process';

/**
 * takes a code block and removes newlines and whitespaces
 * @param {string} typedCode Powershell code in string format
 * @returns {string} formatted and terminal-friendly code
 */
const formatCode = (typedCode) => {
    return typedCode.replace(/\r?\n|\r/g, ' ').trim();
};

/**
 * uses node child process spawning to run powershell scripts
 * @param {object} props properties object containing parameters
 * @param {array} props.commands an array of string commands to run
 * @param {callback} props.callback a function to call when done
 * @param {boolean} props.stdout if true, will console log Powershell output
 */
const runPowershell = ({ commands, callback, stdout = false }) => {
    // make sure our command is a part of an array
    if (typeof commands !== 'object') {
        commands = [commands];
    }

    // clean up inputs
    commands.forEach((value, index) => {
        commands[index] = formatCode(commands[index]);
    });

    // script started
    const child = spawn('powershell.exe', commands);

    // script output
    if (stdout) {
        console.log('Running Powershell Command:', commands.join(' '));
        child.on('exit', function () {
            console.log('Powershell Script finished');
        });
        child.stdout.on('data', function (data) {
            console.log('Powershell Data: ' + data);
        });
        child.stderr.on('data', function (data) {
            console.log('Powershell Errors: ' + data);
        });
    }

    // close powershell input
    child.stdin.end();

    // callback
    if (typeof callback === 'function') {
        callback();
    }
};

export { runPowershell };
