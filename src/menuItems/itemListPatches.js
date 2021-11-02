import { itemRememberVolume } from './itemRememberVolume';
import { itemVolumeFix } from './itemVolumeFix';
import { itemCrackleFix } from './itemCrackleFix';

/**
 * menu entry for misc patches and workarounds
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemListPatches = (props) => {
    return {
        title: 'Extra Patches And Features',
        enabled: true,
        items: [itemRememberVolume(), itemVolumeFix(), itemCrackleFix()],
    };
};

export { itemListPatches };
