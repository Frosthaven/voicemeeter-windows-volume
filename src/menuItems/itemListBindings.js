// for now, we're hard coding 7 of each. This is the maximum available if the
// user has the Voicemeeter Potato edition.

import { STRING_MENU_ITEMS } from '../lib/strings';

let strips = [],
    buses = [];

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
        enabled: false,
        items: [
            { Title: STRING_MENU_ITEMS['itemTitleInputs'] },
            ...strips,
            { Title: '' },
            { Title: STRING_MENU_ITEMS['itemTitleOutputs'] },
            ...buses,
        ],
    };
};

export { itemListBindings };
