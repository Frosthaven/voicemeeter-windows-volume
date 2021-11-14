/**
 * main entry point for voicemeeter-windows-volume
 */

// imports *********************************************************************

// local
import { setupPersistantSystray } from './lib/persistantSysTray';
import { startAudioSync } from './lib/managers/audioSyncManager';
import { trayApp } from './trayApp';
import { defaults } from './defaultSettings';

const settingsPath = `${__dirname}/settings.json`;

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
