/**
 * This is an enumeration of system priorities for ease of development
 */
declare const PRIORITIES: {
    REALTIME: number;
    HIGH: number;
    ABOVE_NORMAL: number;
    NORMAL: number;
    BELOW_NORMAL: number;
    LOW: number;
};
/**
 * Polls the list of running processes every 5 seconds and responds once it
 * finds a match to the provided regex
 * @param processNameRegex the regex to match running processes against
 */
declare const waitForProcess: (processNameRegex: RegExp) => Promise<any>;
/**
 * determines if a regex matched process is running
 * @param processNameRegex the regex to match rnuning processes against
 */
declare const isProcessRunning: (processNameRegex: RegExp) => Promise<unknown>;
export { PRIORITIES, isProcessRunning, waitForProcess, };
