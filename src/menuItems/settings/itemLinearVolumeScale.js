import { STRING_MENU_ITEMS } from '../../lib/strings';

/**
 * menu entry to limit Voicemeeter dB gain to 0
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemLinearVolumeScale = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemLinearVolumeScale'].t,
        checked: false,
        sid: 'linear_volume_scale',
        enabled: true,
        init: function (checked) {
            // do nothing
        },
        activate: function (checked) {
            if (checked) {
                console.log('Now using linear volume scaling');
            } else {
                console.log('Now using logorithmic volume scaling');
            }
        },
    };
};

export { itemLinearVolumeScale };
