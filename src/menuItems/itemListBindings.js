import { STRING_MENU_ITEMS } from '../lib/strings';

let strips = [],
    buses = [];

// generate maximum amount of strips and buses, assuming Voicemeeter Potato
// audioSyncManager will disable the ones not used
for (let i = 0; i <= 7; i++) {
    strips.push({
        title: `Input Strip ${i}`,
        sid: `Strip_${i}`,
        init: (checked) => {},
        checked: false,
        enabled: true,
    });

    buses.push({
        title: `Output Bus ${i}`,
        sid: `Bus_${i}`,
        init: (checked) => {},
        checked: false,
        enabled: true,
    });
}

/**
 * menu entry for binding Windows volume to Voicemeeter strips and subs
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemListBindings = (props) => {
    return {
        title: STRING_MENU_ITEMS['itemListBindings'].t,
        enabled: true,
        items: [
            { Title: STRING_MENU_ITEMS['itemTitleInputs'] },
            ...strips,
            { Title: '', enabled: false },
            { Title: STRING_MENU_ITEMS['itemTitleOutputs'] },
            ...buses,
        ],
    };
};

export { itemListBindings };
