import { itemLimitdBGain } from './settings/itemLimitdBGain.js';
import { itemRestartAudioEngineOnDeviceChange } from './restarts/itemRestartAudioEngineOnDeviceChange.js';
import { itemRestoreVolume } from './patches/itemRestoreVolume.js';
import { itemPreventVolumeSpikes } from './patches/itemPreventVolumeSpikes.js';
import { itemCrackleFix } from './patches/itemCrackleFix.js';
import { STRING_MENU_ITEMS } from '../lib/strings.js';
import { itemStartWithWindows } from './settings/itemStartWithWindows.js';

/**
 * menu entry for misc patches and workarounds
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemListPatches = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemListPatches'].t,
        enabled: true,
        items: [
            { title: STRING_MENU_ITEMS['itemTitleSettings'] },
            itemStartWithWindows(),
            itemLimitdBGain(),
            { title: '', enabled: false },
            { title: STRING_MENU_ITEMS['itemTitleDriverWorkarounds'] },
            itemRestoreVolume(),
            itemPreventVolumeSpikes(),
            itemCrackleFix(),
        ],
    };
};

export { itemListPatches };
