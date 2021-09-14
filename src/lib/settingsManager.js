import path from 'path';
import fs from 'fs';

import { systray } from './persistantSysTray';
let settingsFilePath = '';
let settings = null;

/**
 * compiles a settings object by looping through the ui and referencing the
 * current settings object, saving them to disk in json format
 */
const saveSettings = () => {
    // compiles a list of every valid check setting in the menu and saves their
    // state to the settings file

    let loadedSettings = getSettings();
    if (typeof loadedSettings === 'object') {
        loadedSettings.toggles = [];
        for (let [key, value] of systray.internalIdMap) {
            if (value.sid && typeof value.checked === 'boolean') {
                loadedSettings.toggles.push({
                    setting: value.sid,
                    value: value.checked,
                });
            }
        }
        setSettings(loadedSettings);

        fs.writeFileSync(
            settingsFilePath,
            JSON.stringify(getSettings(), null, 2)
        );
    }
};

/**
 * loads settings from disk, creating the file if it doesn't exist. also updates
 * the current tray ui to reflect the loaded settings
 * @param {object} props properties as parameters
 * @param {string} props.settingsPath the file location name name of the settings file
 * @param {defaults} props.defaults the default settings to apply when generating them
 * @param {function} props.callback the callback function that is triggered when done
 */
const loadSettings = ({ settingsPath, defaults, callback }) => {
    // store the safe file path of the settings file
    settingsFilePath = path.normalize(settingsPath);
    console.log('Using settings file:', settingsFilePath);

    // attempt to load our settings
    try {
        // settings loaded successfully
        setSettings(JSON.parse(fs.readFileSync(settingsFilePath)));
    } catch (err) {
        // something went wrong, lets write the file with defaults
        console.log(err);
        setSettings(defaults);
        const data = JSON.stringify(defaults);
        fs.writeFileSync(
            settingsFilePath,
            JSON.stringify(getSettings(), null, 2)
        );
    }

    // update the tray ui
    updateSysTrayFromSettings();

    // hand code off to the callback if provided
    if (typeof callback === 'function') {
        callback(getSettings());
    }
};

/**
 * updates the tray app ui with the values from settings
 * @returns null
 */
const updateSysTrayFromSettings = () => {
    const settings = getSettings();
    if (!settings.toggles) {
        return;
    }
    for (let [key, value] of systray.internalIdMap) {
        if (value.sid) {
            const matchedToggle = settings.toggles.filter((x) => {
                return x.setting === value.sid;
            });

            if (matchedToggle[0]) {
                value.checked = matchedToggle[0].value;
                systray.sendAction({
                    type: 'update-item',
                    item: value,
                });
            }
        }
    }
};

/**
 * sets the overall settings object
 * @param {object} settingsObj the object of settings to set
 */
const setSettings = (settingsObj) => {
    settings = settingsObj;
};

/**
 * gets the state of a checkbox title associated with a provided sid
 * @param {string} toggleSID the sid of the checkmark toggle to get
 * @returns {boolean} true if checked, false if unchecked
 */
const getToggle = (toggleSID) => {
    return getSettings().toggles.filter((x) => x.setting === toggleSID)[0];
};

/**
 * gets the overall settings object
 * @return {object} the object of overall settings obtained
 */
const getSettings = () => {
    return settings;
};

export { saveSettings, loadSettings, getSettings, getToggle };
