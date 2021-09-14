/**
 * menu entry for exiting the program
 * @param {object} props properties passed to the menu item
 * @param {function} props.click function to trigger on menu item click
 * @returns
 */
const itemExit = ({ click }) => {
    return {
        title: 'Exit',
        checked: false,
        enabled: true,
        click,
    };
};

export { itemExit };
