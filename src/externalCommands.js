var spawn = require('child_process').spawn,
    child;

const PRIORITIES = {
    REALTIME: 256,
    HIGH: 128,
    ABOVE_NORMAL: 32768,
    NORMAL: 32,
    BELOW_NORMAL: 16384,
    LOW: 64,
};

const AFFINITIES = {};

const runPowershell = ({ commands, callback, stdout = false }) => {
    // make sure our command is a part of an array
    if (typeof commands !== 'object') {
        commands = [commands];
    }

    // script started
    child = spawn('powershell.exe', commands);

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

export { setProcessPriority, setProcessAffinity, PRIORITIES };
