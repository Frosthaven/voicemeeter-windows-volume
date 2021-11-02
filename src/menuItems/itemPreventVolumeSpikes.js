import { getSettings } from '../lib/settingsManager';
import {
    PRIORITIES,
    setProcessPriority,
    setProcessAffinity,
} from '../lib/processManager';
import { STRING_MENU_ITEMS } from '../lib/strings';

/**
 * menu entry for fixing audio crackle by setting process priority and affinity
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
