import { STRING_MENU_ITEMS } from "../lib/strings";

/**
 * menu entry for opening the application folder in file explorer
 * @param {object} props properties passed to the menu item
 * @returns
 */
const itemOpenApplicationFolder = (props) => {
  return {
    title: STRING_MENU_ITEMS["itemOpenApplicationFolder"].t,
    checked: false,
    enabled: true,
    button: true,
    click: function () {
      // open settings folder in file explorer using CMD
      require("child_process").exec(
        'start "" "' + require("path").resolve(__dirname) + '"'
      );
    },
  };
};

export { itemOpenApplicationFolder };
