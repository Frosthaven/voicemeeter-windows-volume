/**
 * main entry point for voicemeeter-windows-volume
 */

// imports *********************************************************************

// local
import { setupPersistantSystray } from './lib/persistantSysTray';
import { startAudioSync } from './lib/audioSyncManager';

import { defaults } from './defaultSettings';
import { trayApp } from './trayApp';

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
