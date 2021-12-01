import { STRING_CONSOLE_ENTRIES } from '../../lib/strings.js';

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngineOnAppLaunch = (props) => {
    return {
        title: STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.applaunch,
        checked: false,
        sid: 'restart_audio_engine_on_app_launch',
        enabled: true,
    };
};

export { itemRestartAudioEngineOnAppLaunch };
