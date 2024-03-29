import { getVoicemeeterConnection } from "../../lib/managers/audioSyncManager";
import { isToggleChecked } from "../../lib/managers/settingsManager";
import { STRING_CONSOLE_ENTRIES } from "../../lib/strings";
import {
  AudioEvents,
  startAnyDeviceScanner,
  stopAnyDeviceScanner,
  stopAudioDeviceScanner,
  startAudioDeviceScanner,
} from "../../lib/workers/windowsAudioScanner";
import * as chalk from "colorette";

/**
 * menu entry for automatically restarting the audio engine when devices change
 * @returns
 */
const itemRestartAudioEngineOnAnyDeviceChange = () => {
  return {
    title: STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.anydevicechange,
    checked: false,
    sid: "restart_audio_engine_on_any_device_change",
    enabled: true,
    init: function (checked) {
      AudioEvents.on("any_device", (devices) => {
        if (checked && devices.new > 0) {
          setTimeout(() => {
            console.log(
              STRING_CONSOLE_ENTRIES.restartAudioEngine.replace(
                "{{REASON}}",
                STRING_CONSOLE_ENTRIES.restartAudioEngineReasons.anydevicechange
              )
            );
            console.log(
              chalk.blue(STRING_CONSOLE_ENTRIES.restartDeviceMessages.added),
              devices.added
            );
            console.log(
              chalk.red(STRING_CONSOLE_ENTRIES.restartDeviceMessages.removed),
              devices.removed
            );
            let vm = getVoicemeeterConnection();
            vm && vm.sendCommand("Restart", 1);
            vm = null;
          }, 1000);
        }
      });
      checked && this.activate(checked);
    },
    activate: function (checked) {
      if (checked) {
        stopAudioDeviceScanner();
        startAnyDeviceScanner();
      } else {
        if (isToggleChecked("restart_audio_engine_on_device_change")) {
          startAudioDeviceScanner();
        }

        stopAnyDeviceScanner();
      }
    },
  };
};

export { itemRestartAudioEngineOnAnyDeviceChange };
