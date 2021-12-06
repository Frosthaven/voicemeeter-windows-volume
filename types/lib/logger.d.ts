/**
 * this is the logger service for the application
 */
/**
 * sets up the logger
 */
declare const init: () => void;
/**
 * describes the type of log levels supported in the logger
 */
declare type LogLevels = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
/**
 * adds a log to the logger service
 * @param level the LogLevel to use for this logged message
 * @param message the message to log
 */
declare const log: (level: LogLevels, message: string) => void;
export { init, log };
