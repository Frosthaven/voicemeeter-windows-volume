import { getSettings } from '../lib/settingsManager';
import {
    PRIORITIES,
    setProcessPriority,
    setProcessAffinity,
} from '../lib/processManager';

/**
 * menu entry for fixing audio crackle by setting process priority and affinity
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemVolumeFix = (props) => {
    return {
        title: 'Prevent 100% Volume Spikes',
        checked: false,
        sid: 'apply_volume_fix',
        enabled: true,
        init: function (checked) {},
        activate: function (checked) {},
    };
};

export { itemVolumeFix };
