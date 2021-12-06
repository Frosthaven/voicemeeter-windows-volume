/**
 * handles the lifecycle events of the application
 */

// imports *********************************************************************
// *****************************************************************************

import { getSystemColor } from './util';

// helper **********************************************************************
// *****************************************************************************

/**
 * registers exit handlers so that we can run cleanup when possible
 */
const registerExitHandlers = () => {
    type exitOptions = { cleanup?: boolean; exit?: boolean };

    /**
     * the exit handler that responds to exit requests
     * @param options the exitOptions to provide to the handler
     * @param exitCode the exit code provided to the handler
     */
    const exitHandler = (options: exitOptions, exitCode: string) => {
        if (options.cleanup) {
            exit();
        }
        if (exitCode) console.log('Exit Code:', exitCode);
        if (options.exit) process.exit();
    };

    // route specific signals through the exit handler
    process.on('exit', exitHandler.bind(null, { cleanup: true }));
    process.on('SIGINT', exitHandler.bind(null, { exit: true })); // ctrl+c
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true })); // killed
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true })); // killed
    process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
};

// init ************************************************************************
// *****************************************************************************

/**
 * starts the application logic
 */
const init = async () => {
    let systemColor = await getSystemColor();
    registerExitHandlers();
    console.log(
        'Voicemeeter Windows Volume started, Process ID: ',
        process.pid
    );
    console.log(`Color Scheme: ${systemColor}`);
};

// exit ************************************************************************
// *****************************************************************************

/**
 * fired when a clean exit has been detected. this is where we can perform our
 * cleanup code
 */
const exit = () => {
    // clean exit
    // let vm = getVoicemeeterConnection();
    // vm && vm.disconnect();
    // vm = null;
    // systray && systray.kill(false);
};

export { init, exit };
