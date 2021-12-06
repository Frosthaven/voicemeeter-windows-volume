/**
 * a list of helper functions used by the application
 */
/**
 * shim that provides __dirname support
 */
declare const getDirName: () => string;
/**
 * allows code execution to pause for the specified time
 * @param time time in ms to sleep
 */
declare const sleep: (time: number) => Promise<unknown>;
/**
 * ensures a provided function cannot be called more than once every wait period
 */
declare const debounce: (callback: Function, wait: number) => (...args: any) => void;
/**
 * asynchronously gets the color mode of the system (dark, light, or default)
 */
declare const getSystemColor: () => Promise<unknown>;
export { debounce, getDirName, sleep, getSystemColor };
