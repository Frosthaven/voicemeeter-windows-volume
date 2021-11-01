import { rememberThisVolume } from '../lib/audioSyncManager';

/**
 * menu entry to remember volume levels for next launch
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemRememberVolume = (props) => {
    return {
        title: 'Restore Volume At Launch',
        checked: false,
        sid: 'remember_volume',
        enabled: true,
        init: function (checked) {
            // do nothing
        },
        activate: function (checked) {
            checked && rememberThisVolume();
        },
    };
};

export { itemRememberVolume };
