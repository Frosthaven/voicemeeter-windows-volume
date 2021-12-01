// imports *********************************************************************

import { STRING_CONSOLE_ENTRIES } from '../../lib/strings.js';
import {
    WindowsEvents,
    startWindowsEventScanner,
    stopWindowsEventScanner,
} from '../../lib/workers/windowsEventScanner.js';
import { getVoicemeeterConnection } from '../../lib/managers/audioSyncManager.js';

// event handlers **************************************************************

WindowsEvents.on('resume', () => {
    restartVM(STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.resume);
});

WindowsEvents.on('modern_resume', () => {
    restartVM(STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.modern_resume);
});

WindowsEvents.on('monitor_resume', () => {
    restartVM(STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.monitor_resume);
});

// helper **********************************************************************

const restartVM = (reason) => {
    // we wait one second to ensure system is fully resumed
    setTimeout(() => {
        console.log(
            STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                '{{REASON}}',
                reason
            )
        );
        let vm = getVoicemeeterConnection();
        vm && vm.sendCommand('Restart', 1);
        vm = null;
    }, 1000);
};

// menu entry ******************************************************************

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngineOnResume = (props) => {
    return {
        title: STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.resume,
        checked: false,
        sid: 'restart_audio_engine_on_resume',
        enabled: true,
        init: function (checked) {
            checked && this.activate(checked);
        },
        activate: function (checked) {
            if (checked) {
                startWindowsEventScanner();
            } else {
                stopWindowsEventScanner();
            }
        },
    };
};

export { itemRestartAudioEngineOnResume };
