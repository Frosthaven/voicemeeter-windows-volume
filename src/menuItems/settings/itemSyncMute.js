import { STRING_MENU_ITEMS } from '../../lib/strings';

/**
 * menu entry to sync mute
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemSyncMute = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemSyncMute'].t,
        checked: true,
        sid: 'sync_mute',
        enabled: true,
        init: function (checked) {
            // do nothing
        },
        activate: function (checked) {
            if (checked) {
                console.log('Syncing mute');
            } else {
                console.log('No longer syncing mute');
            }
        },
    };
};

export { itemSyncMute };
