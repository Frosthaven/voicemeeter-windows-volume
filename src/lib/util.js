import Registry from 'winreg';

const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
};

const getSystemColor = () => {
    return new Promise((resolve, reject) => {
        let color = 'default';
        try {
            const RegPersonalization = new Registry({
                hive: Registry.HKCU,
                key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize',
            });
            RegPersonalization.values(function (err, items) {
                if (err) {
                    resolve('default');
                } else {
                    let usingLightTheme = items.find(
                        (i) => i.name === 'AppsUseLightTheme'
                    )?.value;
                    if (usingLightTheme) {
                        usingLightTheme = parseInt(usingLightTheme, 16);
                        color = usingLightTheme === 0 ? 'dark' : 'light';
                        resolve(color);
                    } else {
                        resolve('default');
                    }
                }
            });
        } catch (error) {
            resolve('default');
        }
    });
};

export { debounce, getSystemColor };
