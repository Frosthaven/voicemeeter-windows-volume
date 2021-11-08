import { itemLimitdBGain } from './itemLimitdBGain';
import { itemRestartAudioEngineOnDeviceChange } from './patches/itemRestartAudioEngineOnDeviceChange';
import { itemRestoreVolume } from './patches/itemRestoreVolume';
import { itemPreventVolumeSpikes } from './patches/itemPreventVolumeSpikes';
import { itemCrackleFix } from './patches/itemCrackleFix';
import { STRING_MENU_ITEMS } from '../lib/strings';
import { itemStartWithWindows } from './itemStartWithWindows';
import SysTray from 'systray2';

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
            itemRestartAudioEngineOnDeviceChange(),
            itemRestoreVolume(),
            itemPreventVolumeSpikes(),
            itemCrackleFix(),
        ],
    };
};

export { itemListPatches };
