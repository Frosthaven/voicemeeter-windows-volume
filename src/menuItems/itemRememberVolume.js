import { rememberThisVolume } from '../lib/audioSyncManager';

/**
 * menu entry for exiting the program
 * @param {object} props properties passed to the menu item
 * @param {function} props.click function to trigger on menu item click
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
