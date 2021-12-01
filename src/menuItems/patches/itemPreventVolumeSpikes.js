import { STRING_MENU_ITEMS } from '../../lib/strings.js';

/**
 * menu entry for preventing 100% volume spikes from Windows/driver issues
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemPreventVolumeSpikes = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemPreventVolumeSpikes'].t,
        checked: false,
        sid: 'apply_volume_fix',
        enabled: true,
        init: function (checked) {},
        activate: function (checked) {},
    };
};

export { itemPreventVolumeSpikes };
