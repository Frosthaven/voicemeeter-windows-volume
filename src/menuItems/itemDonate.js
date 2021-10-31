import { systray } from '../lib/persistantSysTray';
import { runPowershell } from '../lib/runPowershell';
import { getSettings } from '../lib/settingsManager';
/**
 * menu entry for launching the donation page in the default browser
 * @param {object} props properties passed to the menu item
 * @returns
 */
const label = 'Donate (Optional)';
const itemDonate = (props) => {
    return {
        title: label,
        enabled: true,
        checked: false,
        button: true,
        init: () => {
            let settings = getSettings();
            let isDisabled = settings.disable_donate;

            if (isDisabled) {
                for (let [key, value] of systray.internalIdMap) {
                    if (value.title === label) {
                        value.hidden = true;
                        systray.sendAction({
                            type: 'update-item',
                            item: value,
                        });
                    }
                }
            }
        },
        click: () => {
            runPowershell({
                stdout: false,
                commands: [
                    'Start-Process "https://www.paypal.com/donate?hosted_button_id=JBDM2H96RNKH8"',
                ],
                callback: () => {},
            });
        },
    };
};

export { itemDonate };
