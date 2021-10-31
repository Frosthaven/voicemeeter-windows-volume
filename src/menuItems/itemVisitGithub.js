import { runPowershell } from '../lib/runPowershell';
/**
 * menu entry for launching the github page in the default browser
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemVisitGithub = (props) => {
    return {
        title: 'Visit Github Page',
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
