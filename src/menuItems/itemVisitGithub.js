import { runPowershell } from '../lib/runPowershell';
import { STRING_MENU_ITEMS } from '../lib/strings';
/**
 * menu entry for launching the github page in the default browser
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemVisitGithub = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemVisitGithub'].t,
        enabled: true,
        checked: false,
        button: true,
        click: () => {
            runPowershell({
                stdout: false,
                commands: [
                    'Start-Process "https://github.com/Frosthaven/voicemeeter-windows-volume"',
                ],
                callback: () => {},
            });
        },
    };
};

export { itemVisitGithub };
