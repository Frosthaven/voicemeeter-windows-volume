/**
 * this is the logger service for the application
 */

// imports *********************************************************************
// *****************************************************************************

import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

// variables *******************************************************************
// *****************************************************************************

let logger: any; // will be populated with logger on init

// code ************************************************************************
// *****************************************************************************

/**
 * sets up the logger
 */
const init = () => {
    flushLogs();
    logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
            //
            // - Write all logs with level `error` and below to `error.log`
            // - Write all logs with level `info` and below to `combined.log`
            //
            new winston.transports.File({
                filename: './logs/error.log',
                level: 'error',
            }),
            new winston.transports.File({ filename: './logs/combined.log' }),
        ],
    });

    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.NODE_ENV !== 'production') {
        logger.add(
            new winston.transports.Console({
                format: winston.format.simple(),
            })
        );
    }
};

/**
 * clears old logs
 */
const flushLogs = () => {
    let logFiles = [
        'error',
        'warn',
        'info',
        'http',
        'verbose',
        'debug',
        'silly',
        'combined',
    ];

    logFiles.forEach((fileName) => {
        try {
            fs.unlinkSync(path.normalize(`./logs/${fileName}.log`));
        } catch (err) {}
    });
};

/**
 * describes the type of log levels supported in the logger
 */
type LogLevels =
    | 'error'
    | 'warn'
    | 'info'
    | 'http'
    | 'verbose'
    | 'debug'
    | 'silly';

/**
 * adds a log to the logger service
 * @param level the LogLevel to use for this logged message
 * @param message the message to log
 */
const log = (level: LogLevels, message: string) => {
    logger.log({ level, message });
};

export { init, log };
