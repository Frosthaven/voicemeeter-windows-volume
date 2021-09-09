import { spawn } from 'child_process';

const formatCode = (typedCode) => {
    return typedCode.replace(/\r?\n|\r/g, ' ').trim();
};

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
};

export { runPowershell };
