import SysTray from 'systray2';
const CustomSystray = SysTray;

CustomSystray.prototype.test = 'test';

export { CustomSystray };
