const itemExit = ({ click }) => {
    return {
        title: 'Exit',
        checked: false,
        enabled: true,
        click,
    };
};

export { itemExit };
