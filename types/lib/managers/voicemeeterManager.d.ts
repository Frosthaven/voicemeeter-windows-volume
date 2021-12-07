/**
 * this file handles all voicemeeter interactions
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Voicemeeter } from 'voicemeeter-connector';
declare let ready: boolean;
declare let connection: null | Voicemeeter;
declare let events: EventEmitter;
/**
 * creates the voicemeeter connection
 */
declare const connect: () => Promise<Voicemeeter>;
export { ready, events, connect, connection };
