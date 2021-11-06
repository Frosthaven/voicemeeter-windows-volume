import { STRING_MENU_ITEMS } from '../lib/strings';

/**
 * menu entry to limit Voicemeeter dB gain to 0
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemLimitdBGain = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemLimitdBGain'].t,
        checked: false,
        sid: 'limit_db_gain_to_0',
        enabled: true,
        init: function (checked) {
            // do nothing
        },
        activate: function (checked) {
            // do nothing
        },
    };
};

export { itemLimitdBGain };
