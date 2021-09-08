import { enableStartOnLaunch, disableStartOnLaunch } from '../externalCommands';

const itemStartWithWindows = {
    title: 'Automatically Start With Windows',
    checked: true,
    sid: 'start_with_windows',
    enabled: true,
    init: function (checked) {
        // only run the code here if checked at launch
        checked && this.activate(checked);
    },
    activate: function (checked) {
        if (checked) {
            enableStartOnLaunch();
        } else {
            disableStartOnLaunch();
        }
    },
};

export { itemStartWithWindows };
