import { rememberCurrentVolume } from '../../lib/managers/audioSyncManager';
import { STRING_MENU_ITEMS } from '../../lib/strings';

/**
 * menu entry to remember volume levels for next launch
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRestoreVolume = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemRestoreVolume'].t,
        checked: false,
        sid: 'remember_volume',
        enabled: true,
        init: function (checked) {
            // do nothing
        },
        activate: function (checked) {
            checked && rememberCurrentVolume();
        },
    };
};

export { itemRestoreVolume };
