// imports *********************************************************************

import { STRING_CONSOLE_ENTRIES } from '../../lib/strings';
import {
    WindowsEvents,
    startWindowsEventScanner,
    stopWindowsEventScanner,
} from '../../lib/workers/windowsEventScanner';

// event handlers **************************************************************

WindowsEvents.on('resume', () => {
    console.log('not implemented: resume');
});

WindowsEvents.on('modern_resume', () => {
    console.log('not implimented: modern resume');
});

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
