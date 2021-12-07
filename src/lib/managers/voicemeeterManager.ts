/**
 * this file handles all voicemeeter interactions
 */

// imports *********************************************************************
//******************************************************************************

import { EventEmitter } from 'events';
import { Voicemeeter } from 'voicemeeter-connector';
import { waitForProcess } from './processManager';
import { debounce } from '../util';
import * as logger from '../logger';

// types ***********************************************************************
//******************************************************************************

/*
    @todo
*/

// variables *******************************************************************
//******************************************************************************

let ready: boolean = false;
let connection: null | Voicemeeter = null;
let events = new EventEmitter();
let state: any = {};
import { BusProperties, StripProperties } from 'voicemeeter-connector';

// events **********************************************************************
//******************************************************************************

events.on('untracked', (data) => {
    logger.log(
        'info',
        "Voicemeeter event: Something we aren't tracking changed"
    );
});
events.on('any', (data) => {
    logger.log('info', 'Voicemeeter event: ' + JSON.stringify(data, null, 4));
});
events.on('ready', () => {
    ready = true;
});

// library *********************************************************************
//******************************************************************************

/**
 * applies a diff state to the current state and fires events
 * @param diffState the diff state
 */
const applyDiffState = (diffState: any) => {
    let diffLength = Object.keys(diffState).length;
    let event = {
        type: '',
        diff: diffState,
    };
    if (diffLength > 0) {
        Object.keys(diffState).forEach((key) => {
            // iterate over the strips and subs
            Object.keys(diffState[key]).forEach((prop) => {
                // emit an event for the property and update our state
                event.type = prop.toLowerCase();
                events.emit(event.type, event);
                state[key][prop] = diffState[key][prop];
            });
        });
        event.type = 'any';
        events.emit(event.type, event);
    } else {
        event.type = 'untracked';
        events.emit(event.type, {});
    }
};

/**
 * creates a diff of changes from an old state to a new state
 * @param oldState the old state object
 * @param newState the new state object
 */
const getDiffState = (oldState: any, newState: any) => {
    let diffState: any = {};
    // iterate over the strips and subs
    Object.keys(oldState).forEach((key) => {
        // iterate over the properties
        Object.keys(oldState[key]).forEach((prop) => {
            if (oldState[key][prop] != newState[key][prop]) {
                diffState[key] = diffState[key] || {};
                diffState[key][prop] = newState[key][prop];
            }
        });
    });
    return diffState;
};

/**
 * populates the current state with active voicemeeter parameters
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const populateState = (vm: Voicemeeter, state: any) => {
    // add all strip properties to the state
    for (const prop of Object.values(StripProperties)) {
        // gets all strip properties
        for (let i = 0; i <= 7; i++) {
            let val = vm.getStripParameter(i, prop);
            state[`Strip_${i}`] = state[`Strip_${i}`] || {};
            state[`Strip_${i}`][prop] = val;
        }
    }

    // add all bus properties to the state
    for (const prop of Object.values(BusProperties)) {
        // gets all strip properties
        for (let i = 0; i <= 7; i++) {
            let val = vm.getBusParameter(i, prop);
            state[`Bus_${i}`] = state[`Bus_${i}`] || {};
            state[`Bus_${i}`][prop] = val;
        }
    }
};

/**
 * registers event handlers for a provided voicemeeter connection
 * @param vm the voicemeeter connection
 */
const registerConnectionHandlers = (vm: Voicemeeter) => {
    logger.log('info', `Registering Voicemeeter connection handlers`);
    vm.attachChangeEvent(
        debounce(() => {
            if (!state.populated) {
                // we need to populate our initial state
                logger.log('info', 'Populating initial Voicemeeter state');
                populateState(vm, state);
                // logger.log('info', JSON.stringify(state, null, 4));
                events.emit('ready');
                events.emit('any', { type: 'ready' });
                state.populated = true;
            } else {
                // compare the new state to the existing state to decide which
                // events to fire
                logger.log('info', 'Comparing new Voicemeeter state');
                let newState = {};
                populateState(vm, newState);
                let diffState = getDiffState(state, newState);
                applyDiffState(diffState);
            }
        }, 800)
    );
};

/**
 * creates the voicemeeter connection
 */
const connect = async () => {
    if (null !== connection) {
        // connection already exists
        return Promise.resolve(connection);
    }

    // create the connection
    let reg = /voicemeeter(.*[^(setup)])?.exe/g;
    let processName = await waitForProcess(reg);
    logger.log('info', `Voicemeeter process found: '${processName}'`);
    let vm = await Voicemeeter.init();
    try {
        // attempt to connect to voicemeeter and register events
        vm.connect();
        logger.log('info', `Voicemeeter connection made with '${vm.$type}'`);
        registerConnectionHandlers(vm);

        // assign the connection to our accessible variable
        connection = vm;
        return Promise.resolve(vm);
    } catch (err) {
        return Promise.reject(err);
    }
};

export { ready, events, connect, connection };
