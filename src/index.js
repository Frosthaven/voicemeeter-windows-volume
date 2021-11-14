/**
 * main entry point for voicemeeter-windows-volume
 */

// imports *********************************************************************

// local
import { systray, setupPersistantSystray } from './lib/persistantSysTray';
import { startAudioSync } from './lib/managers/audioSyncManager';
import { getVoicemeeterConnection } from './lib/managers/audioSyncManager';
import { trayApp } from './trayApp';
import { defaults } from './defaultSettings';

const settingsPath = `${__dirname}/settings.json`;

// handle app exit *************************************************************

const exitHandler = (options, exitCode) => {
    if (options.cleanup) {
        let vm = getVoicemeeterConnection();
        vm && vm.disconnect();
        vm = null;
        systray.kill(false);
        console.log('clean exit');
    }
    if (exitCode) console.log('Exit Code:', exitCode);
    if (options.exit) process.exit();
};
// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

// initialize the tray app *****************************************************

console.log('Voicemeeter Windows Volume started, Process ID: ', process.pid);
setupPersistantSystray({
    trayApp,
    defaults,
    settingsPath,
    onReady: () => {
        console.log('Starting audio synchronization');
        startAudioSync();
    },
});
