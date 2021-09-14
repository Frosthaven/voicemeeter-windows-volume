import SysTray from 'systray2';

import { getToggle, saveSettings, loadSettings } from './settingsManager';

// We do some custom things with the systray library in order to sync checked
// menu items to a saved state
// - Menu objects that require their check be saved need to have a unique sid
//    assigned to them.
// - We provide two new methods for sid enabled menu items to use
//    - init(checkedBoolean) which fires on creation of the menu item
//    - activate(checkedBoolean) which fires when a checkbox item is clicked
let systray = null;

const setupPersistantSystray = ({
    trayApp,
    defaults,
    settingsPath,
    onReady,
}) => {
    systray = new SysTray(trayApp);

    const runInitCode = () => {
        for (let [key, value] of systray.internalIdMap) {
            if (typeof value.init === 'function') {
                value.init.bind(value);
                value.init(value.checked);
            }
        }
    };

    const settingsLoaded = () => {
        runInitCode();
        if (typeof onReady === 'function') {
            onReady();
        }
    };

    systray.ready().then(() => {
        loadSettings({
            systray,
            settingsPath,
            defaults,
            callback: settingsLoaded,
        });
    });

    systray.onClick((action) => {
        if (action.item.click != null) {
            action.item.click();
        }

        if (
            typeof action?.item?.checked === 'boolean' ||
            action?.item?.checked === 'true' ||
            action?.item?.checked === 'false'
        ) {
            action.item.checked = !action.item.checked;
            systray.sendAction({
                type: 'update-item',
                item: action.item,
            });
            saveSettings(systray);
        }

        if (action?.item?.sid && typeof action?.item?.activate === 'function') {
            action.item.activate.bind(action.item);
            action.item.activate(getToggle(action.item.sid).value);
        }
    });

    return systray;
};

export { systray, setupPersistantSystray };
