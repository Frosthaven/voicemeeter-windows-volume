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
const itemCrackleFix = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemCrackleFix'].t,
        tooltip: STRING_MENU_ITEMS['itemCrackleFix'].d,
        checked: false,
        sid: 'apply_crackle_fix',
        enabled: true,
        init: function (checked) {
            checked && this.activate(checked);
        },
        activate: function (checked) {
            const loadedSettings = getSettings().audiodg;
            const audiodg_settings = {
                priority: loadedSettings?.priority || 128,
                affinity: loadedSettings?.affinity || 2,
            };
            if (checked === true) {
                console.log(
                    `Setting audiodg.exe priority to ${audiodg_settings.priority} and affinity to ${audiodg_settings.affinity}`
                );
                setProcessPriority(
                    'audiodg',
                    audiodg_settings?.priority || 128
                );
                setProcessAffinity('audiodg', audiodg_settings?.affinity || 2);
            } else {
                console.log(
                    `Restoring audiodg.exe priority to ${
                        PRIORITIES.NORMAL
                    } and affinity to ${255}`
                );
                setProcessPriority('audiodg', PRIORITIES.NORMAL);
                setProcessAffinity('audiodg', 255);
            }
        },
    };
};

export { itemCrackleFix };
