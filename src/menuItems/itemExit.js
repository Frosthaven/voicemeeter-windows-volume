const itemExit = (props) => {
    return {
        title: 'Exit',
        checked: false,
        enabled: true,
        click: props.click,
    };
};

export { itemExit };
