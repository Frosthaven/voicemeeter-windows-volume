/*
 This handles creating a custom systray instance that is bound to a settings file
*/

import SysTray, { ClickEvent, MenuItem } from 'systray2';

import {
    isToggleChecked,
    saveSettings,
    loadSettings,
} from './managers/settingsManager.js';

/**
 * looks through the systray menu items and runs any existing init() method
 */
const runInitCode = () => {
    for (let [key, value] of systray.internalIdMap) {
        if (typeof value.init === 'function') {
            value.init.bind(value);
            value.init(value.checked);
        }
    }
};

let systray = null;

/**
 * creates a system tray instance with settings saving capabilities
 * We do some custom things with the systray library in order to sync checked
 * menu items to a saved state
 *  - Menu objects that require their check be saved need to have a unique sid
 *    assigned to them.
 *  - You can now set the item's button property to true to prevent toggling
 *  - We provide two new methods for sid enabled menu items to use
 *    - init(checkedBoolean) which fires on creation of the menu item
 *    - activate(checkedBoolean) which fires when a checkbox item is clicked
 * @param {object} trayApp the menu configuration that systray2 needs
 * @param {object} defaults the default settings to apply when generating them
 * @param {string} settingsPath the file location name name of the settings file
 * @param {function} onReady the callback function that is triggered when done
 * @returns {object} the newly created systray instance
 */
const setupPersistantSystray = ({
    trayApp,
    defaults,
    settingsPath,
    onReady,
}) => {
    // create the systray instance
    let newSysTray = new SysTray(trayApp);

    // load the settings once ready
    newSysTray.ready().then(() => {
        loadSettings({
            settingsPath,
            defaults,
            callback: () => {
                runInitCode();
                if (typeof onReady === 'function') {
                    onReady();
                }
            },
        });
    });

    // change the settings when a checkbox changes
    newSysTray.onClick((action) => {
        if (action.item.click != null) {
            action.item.click();
        }

        if (action?.item?.button === true) {
            // automatically uncheck items that are buttons
            setTimeout(() => {
                action.item.checked = false;
                systray.sendAction({
                    type: 'update-item',
                    item: action.item,
                });
            }, 1000);
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
            saveSettings();
        }

        if (action?.item?.sid && typeof action?.item?.activate === 'function') {
            action.item.activate.bind(action.item);
            action.item.activate(isToggleChecked(action.item.sid));
        }
    });

    systray = newSysTray;
    return systray;
};

export { systray, setupPersistantSystray };
