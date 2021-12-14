/**
 * handles the lifecycle events of the application
 */

// imports *********************************************************************
// *****************************************************************************

import * as logger from './logger';
import { getSystemColor } from './util';
import * as voicemeeter from './managers/voicemeeterManager';

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
        if (exitCode) logger.log('info', `Exit Code: ${exitCode}`);
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
    // logger setup
    logger.init();
    logger.log(
        'info',
        `Voicemeeter Windows Volume started, Process ID: ${process.pid}`
    );

    // exit handlers
    registerExitHandlers();

    // system color theme
    let systemColor = await getSystemColor();
    logger.log('info', `Color Scheme: ${systemColor}`);

    // voicemeeter
    voicemeeter.events.on('ready', () => {
        // voicemeeter state is populated and ready for tracking
        debug();
    });
    await voicemeeter.connect();

    // windows audio
    // await winaudio.init();
};

// debug ***********************************************************************
// *****************************************************************************

const debug = () => {
    logger.log('info', 'hi');
};

// exit ************************************************************************
// *****************************************************************************

/**
 * fired when a clean exit has been detected. this is where we can perform our
 * cleanup code
 */
const exit = () => {
    // clean exit
    logger.log('info', 'Disconnecting from Voicemeeter');
    let vm = voicemeeter.connection;
    vm && vm.disconnect();
    logger.log('info', `Clean exit`);
    // systray && systray.kill(false);
};

export { init, exit };
