const itemExit = {
    title: 'Exit',
    checked: false,
    enabled: true,
    click: () => {
        systray.kill(false);
        setTimeout(() => {
            process.exit();
        }, 1000);
    },
};

export { itemExit };
