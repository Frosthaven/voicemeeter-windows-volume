import { STRING_MENU_ITEMS } from '../lib/strings';
import { itemRestartAudioEngineOnDeviceChange } from './restarts/itemRestartAudioEngineOnDeviceChange';
import { itemRestartAudioEngineOnAppLaunch } from './restarts/itemRestartAudioEngineOnAppLaunch';
import { itemRestartAudioEngineOnResume } from './restarts/itemRestartAudioEngineOnResume';

/**
 * menu entry for misc patches and workarounds
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemListRestarts = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemListRestarts'].t,
        enabled: true,
        items: [
            itemRestartAudioEngineOnDeviceChange(),
            itemRestartAudioEngineOnResume(),
            itemRestartAudioEngineOnAppLaunch(),
        ],
    };
};

export { itemListRestarts };
