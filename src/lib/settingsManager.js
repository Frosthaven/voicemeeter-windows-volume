import path from 'path';
import fs from 'fs';

let settingsFilePath = '';
let settings = null;

const saveSettings = (systray) => {
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

// @todo this needs to move to the systray module instead of living here
const updateSysTrayFromSettings = (systray) => {
    const settings = getSettings();
    if (!settings.toggles) {
        return;
    }
    for (let [key, value] of systray.internalIdMap) {
        if (value.sid) {
            //console.log(`Updating ${value.title}`);
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

const loadSettings = ({ systray, settingsPath, defaults, callback }) => {
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

    // update our systray menu
    updateSysTrayFromSettings(systray);

    // hand code off to the callback if provided
    if (typeof callback === 'function') {
        callback(getSettings());
    }
};

const setSettings = (settingsObj) => {
    settings = settingsObj;
};

const getToggle = (toggleSID) => {
    return getSettings().toggles.filter((x) => x.setting === toggleSID)[0];
};

const getSettings = () => {
    return settings;
};

// load the file here

export { saveSettings, loadSettings, getSettings, getToggle };
