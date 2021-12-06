/**
 * a list of helper functions used by the application
 */
/**
 * shim that provides __dirname support
 */
declare const getDirName: () => string;
/**
 * ensures a provided function cannot be called more than once every wait period
 */
declare const debounce: (callback: Function, wait: number) => (...args: any) => void;
/**
 * asynchronously gets the color mode of the system (dark, light, or default)
 */
declare const getSystemColor: () => Promise<unknown>;
export { debounce, getDirName, getSystemColor };
