import { getVoicemeeterConnection } from "../../lib/managers/audioSyncManager";
import { isToggleChecked } from "../../lib/managers/settingsManager";
import { STRING_CONSOLE_ENTRIES } from "../../lib/strings";
import {
  AudioEvents,
  startAudioDeviceScanner,
  stopAudioDeviceScanner,
} from "../../lib/workers/windowsAudioScanner";
import chalk from "colorette";

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestartAudioEngineOnDeviceChange = (props) => {
  return {
    title: STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.devicechange,
    checked: false,
    sid: "restart_audio_engine_on_device_change",
    enabled: true,
    init: function (checked) {
      AudioEvents.on("audio_device", (devices) => {
        let isEnabled =
          isToggleChecked("restart_audio_engine_on_device_change") &&
          !isToggleChecked("restart_audio_engine_on_any_device_change");
        if (isEnabled && devices.new > 0) {
          setTimeout(() => {
            console.log(
              STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                "{{REASON}}",
                STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.devicechange
              ),
              `(${chalk.magenta(devices.old)} => ${chalk.green(devices.new)})`
            );
            let vm = getVoicemeeterConnection();
            vm && vm.sendCommand("Restart", 1);
            vm = null;
          }, 1000);
        }

        isEnabled = null;
      });
      checked && this.activate(checked);
    },
    activate: function (checked) {
      if (checked) {
        startAudioDeviceScanner();
      } else {
        stopAudioDeviceScanner();
      }
    },
  };
};

export { itemRestartAudioEngineOnDeviceChange };
