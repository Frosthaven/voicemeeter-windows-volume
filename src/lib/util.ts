/**
 * a list of helper functions used by the application
 */

// imports *********************************************************************
// *****************************************************************************

import Registry from 'winreg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// library *********************************************************************
// *****************************************************************************

/**
 * shim that provides __dirname support
 */
const getDirName = () => {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(__filename);
};

/**
 * allows code execution to pause for the specified time
 * @param time time in ms to sleep
 */
const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

/**
 * ensures a provided function cannot be called more than once every wait period
 */
const debounce = (callback: Function, wait: number) => {
    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    return (...args: any) => {
        clearTimeout(Number(timeoutId));
        timeoutId = setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
};

/**
 * asynchronously gets the color mode of the system (dark, light, or default)
 */
const getSystemColor = async () => {
    type SystemColor = 'default' | 'dark' | 'light';
    return new Promise((resolve, reject) => {
        let color: SystemColor = 'default';
        try {
            const RegPersonalize = new Registry({
                hive: Registry.HKCU,
                key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize',
            });
            RegPersonalize.values((err, items) => {
                if (err) {
                    resolve(color);
                } else {
                    let AppsUseLightTheme: string | undefined = items.find(
                        (i) => i.name === 'AppsUseLightTheme'
                    )?.value;
                    if (typeof AppsUseLightTheme !== 'undefined') {
                        let flag = parseInt(AppsUseLightTheme, 16);
                        color = flag === 0 ? 'dark' : 'light';
                        resolve(color);
                    } else {
                        resolve(color);
                    }
                }
            });
        } catch (err) {
            resolve(color);
        }
    });
};

export { debounce, getDirName, sleep, getSystemColor };
