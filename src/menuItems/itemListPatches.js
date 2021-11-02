import { itemRestoreVolume } from './itemRestoreVolume';
import { itemPreventVolumeSpikes } from './itemPreventVolumeSpikes';
import { itemCrackleFix } from './itemCrackleFix';
import { STRING_MENU_ITEMS } from '../lib/strings';

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
            itemRestoreVolume(),
            itemPreventVolumeSpikes(),
            itemCrackleFix(),
        ],
    };
};

export { itemListPatches };
