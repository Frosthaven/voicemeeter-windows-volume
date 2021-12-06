/**
 * handles the lifecycle events of the application
 */
/**
 * starts the application logic
 */
declare const init: () => Promise<void>;
/**
 * fired when a clean exit has been detected. this is where we can perform our
 * cleanup code
 */
declare const exit: () => void;
export { init, exit };
