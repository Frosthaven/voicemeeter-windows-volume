/**
 * this file handles all voicemeeter interactions
 */

// imports *********************************************************************
//******************************************************************************

import { EventEmitter } from 'events';
import {
    Voicemeeter,
    BusProperties,
    StripProperties,
    BusEQChannelCellProperties,
    FXProperties,
    PatchProperties,
    SystemProperties,
    SystemBusDelayProperties,
    PatchChannelProperties,
} from 'voicemeeter-connector';
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

// events **********************************************************************
//******************************************************************************

events.on('any', (data) => {
    if (data.target && !['diff'].includes(data.target)) {
        logger.log(
            'info',
            'Voicemeeter Event: ' + JSON.stringify(data, null, 4)
        );
    }

    if (data.target === 'ready') {
        logger.log('info', JSON.stringify(state, null, 4));
    }
});

// library *********************************************************************
//******************************************************************************

/**
 * updates the current state to the values within a diff state object and fires
 * an event for the collection of changed values
 * @param diffState the diff state
 */
const applyDiffState = (diffState: any) => {
    let diffLength = Object.keys(diffState).length;
    if (diffLength > 0) {
        Object.keys(diffState).forEach((key) => {
            // iterate over the strips and subs
            Object.keys(diffState[key]).forEach((prop) => {
                state[key][prop] = diffState[key][prop];
            });
        });
        events.emit('any', { target: 'diff', diff: diffState });
        events.emit('diff', { target: 'diff', diff: diffState });
    } else {
        // something changed, but we don't have a value diff. Possibly an
        // untracked parameter or one the API doesn't support
        events.emit('any', { target: 'unknown' });
        events.emit('unknown', { target: 'unknown' });
    }
};

/**
 * creates a diff object of changes from an old state to a new state and fires
 * events for changed properties
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
                // generate our diffstate
                diffState[key] = diffState[key] || {};
                diffState[key][prop] = newState[key][prop];

                // prepare event data
                let eventData: any = {};
                eventData['target'] = `${key}.${prop}`;
                eventData['old'] = {
                    [prop]: oldState[key][prop],
                };
                eventData['new'] = {
                    [prop]: newState[key][prop],
                };

                // emit an event for the full key/property pair
                events.emit(`${key}.${prop}`, eventData);

                // emit an event for this specific key
                events.emit(`${key}`, eventData);

                // emit an event for this specific property
                events.emit(`${prop}`, eventData);

                // emit the event across the "any" channel
                events.emit('any', eventData);
            }
        });
    });
    return diffState;
};

/**
 * Adds current strip parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachStripValuesToState = (vm: Voicemeeter, state: any) => {
    for (const prop of Object.values(StripProperties)) {
        for (let i = 0; i <= 7; i++) {
            let val = vm.getStripParameter(i, prop);
            state[`Strip_${i}`] = state[`Strip_${i}`] || {};
            state[`Strip_${i}`][prop] = val;
        }
    }
};

/**
 * Adds current strip gainlayer parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachStripGainLayerValuesToState = (vm: Voicemeeter, state: any) => {
    for (let stripIndex = 0; stripIndex <= 7; stripIndex++) {
        for (let busIndex = 0; busIndex <= 7; busIndex++) {
            let val = vm.getStripGainLayerParameter(stripIndex, busIndex);
            let key = `Strip_${stripIndex}`;
            let prop = `GainLayer_${busIndex}`;
            state[key] = state[key] || {};
            state[key][prop] = val;
        }
    }
};

/**
 * Adds current bus parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachBusValuesToState = (vm: Voicemeeter, state: any) => {
    for (const prop of Object.values(BusProperties)) {
        for (let i = 0; i <= 7; i++) {
            let val = vm.getBusParameter(i, prop);
            state[`Bus_${i}`] = state[`Bus_${i}`] || {};
            state[`Bus_${i}`][prop] = val;
        }
    }
};

/**
 * Adds current bus eq channel cell parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachBusEQChannelCellValuesToState = (vm: Voicemeeter, state: any) => {
    for (let busIndex = 0; busIndex <= 7; busIndex++) {
        for (let channelIndex = 0; channelIndex <= 7; channelIndex++) {
            for (let cellIndex = 0; cellIndex <= 5; cellIndex++) {
                let on = vm.getBusEQChannelCellParameter(
                    busIndex,
                    channelIndex,
                    cellIndex,
                    BusEQChannelCellProperties.EQChannelCellOn
                );
                let type = vm.getBusEQChannelCellParameter(
                    busIndex,
                    channelIndex,
                    cellIndex,
                    BusEQChannelCellProperties.EQChannelCellType
                );
                let f = vm.getBusEQChannelCellParameter(
                    busIndex,
                    channelIndex,
                    cellIndex,
                    BusEQChannelCellProperties.EQChannelCellF
                );
                let gain = vm.getBusEQChannelCellParameter(
                    busIndex,
                    channelIndex,
                    cellIndex,
                    BusEQChannelCellProperties.EQChannelCellGain
                );
                let q = vm.getBusEQChannelCellParameter(
                    busIndex,
                    channelIndex,
                    cellIndex,
                    BusEQChannelCellProperties.EQChannelCellQ
                );

                let key = `Bus_${busIndex}`;
                let subkey = `EQ_Channel_${channelIndex}_Cell_${cellIndex}`;
                state[key][`${subkey}_On`] = on;
                state[key][`${subkey}_Type`] = type;
                state[key][`${subkey}_F`] = f;
                state[key][`${subkey}_Gain`] = gain;
                state[key][`${subkey}_Q`] = q;
            }
        }
    }
};

/**
 * Adds current fx parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachFXValuesToState = (vm: Voicemeeter, state: any) => {
    for (const prop of Object.values(FXProperties)) {
        state['Fx'] = state['Fx'] || {};
        state['Fx'][prop] = vm.getFXParameter(prop);
    }
};

/**
 * Adds current patch parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachPatchValuesToState = (vm: Voicemeeter, state: any) => {
    for (const prop of Object.values(PatchProperties)) {
        state['Patch'] = state['Patch'] || {};
        state['Patch'][prop] = vm.getPatchParameter(prop);
    }
};

/**
 * Adds current patch channel value parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachPatchChannelValuesToState = (vm: Voicemeeter, state: any) => {
    state['Patch'] = state['Patch'] || {};

    for (let i = 0; i <= 14; i++) {
        state['Patch'][`Channel_${i}_ASIO`] = vm.getPatchChannelParameter(
            i,
            PatchChannelProperties.Asio
        );
        state['Patch'][`Channel_${i}_OutA2`] = vm.getPatchChannelParameter(
            i,
            PatchChannelProperties.OutA2
        );
        state['Patch'][`Channel_${i}_OutA3`] = vm.getPatchChannelParameter(
            i,
            PatchChannelProperties.OutA3
        );
        state['Patch'][`Channel_${i}_OutA4`] = vm.getPatchChannelParameter(
            i,
            PatchChannelProperties.OutA4
        );
        state['Patch'][`Channel_${i}_OutA5`] = vm.getPatchChannelParameter(
            i,
            PatchChannelProperties.OutA5
        );
    }
};

/**
 * Adds current system parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachSystemValuesToState = (vm: Voicemeeter, state: any) => {
    for (const prop of Object.values(SystemProperties)) {
        state['Option'] = state['Option'] || {};
        state['Option'][prop] = vm.getSystemParameter(prop);
    }
};

/**
 * Adds current system hardware bus delay parameters to the state
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const attachSystemBusDelayValuesToState = (vm: Voicemeeter, state: any) => {
    state['Option'] = state['Option'] || {};
    for (let i = 0; i <= 5; i++) {
        let key = `Bus_${i}_Delay`;
        state['Option'][key] = vm.getSystemBusDelayParameter(
            i,
            SystemBusDelayProperties.Delay
        );
    }
    for (const prop of Object.values(SystemProperties)) {
        state['Option'] = state['Option'] || {};
        state['Option'][prop] = vm.getSystemParameter(prop);
    }
};

/**
 * populates the provided state with current voicemeeter parameters
 * @param vm the voicemeeter connection
 * @param state the state object to populate
 */
const populateState = (vm: Voicemeeter, state: any) => {
    attachStripValuesToState(vm, state);
    attachStripGainLayerValuesToState(vm, state);
    attachBusValuesToState(vm, state);
    attachBusEQChannelCellValuesToState(vm, state);
    attachFXValuesToState(vm, state);
    attachPatchValuesToState(vm, state);
    attachPatchChannelValuesToState(vm, state);
    attachSystemValuesToState(vm, state);
    attachSystemBusDelayValuesToState(vm, state);

    // @todo extra patch properties - composite and insert
    // @todo button properties
    // @todo recorder properties
    // @todo vban properties
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
                events.emit('any', { target: 'ready' });
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
