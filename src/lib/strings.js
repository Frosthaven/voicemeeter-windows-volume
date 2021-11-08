// these could probably be simplified and logically chosen rather than
// explicitely duplicating names across voicemeeter versions
const STRING_VOICEMEETER_FRIENDLY_NAMES = {
    voicemeeter: {
        Strip: ['Hardware 1', 'Hardware 2', 'Virtual 1 [VAIO]'],
        Bus: ['Hareware A1', 'Hardware A2'],
    },
    voicemeeterBanana: {
        Strip: [
            'Hardware 1',
            'Hardware 2',
            'Hardware 3',
            'Virtual 1 [VAIO]',
            'Virtual 2 [AUX]',
        ],
        Bus: [
            'Hardware A1',
            'Hardware A2',
            'Hardware A3',
            'Virtual 1 [VAIO]',
            'Virtual 2 [AUX]',
        ],
    },
    voicemeeterPotato: {
        Strip: [
            'Hardware 1',
            'Hardware 2',
            'Hardware 3',
            'Hardware 4',
            'Hardware 5',
            'Virtual 1 [VAIO]',
            'Virtual 2 [AUX]',
            'Virtual 3 [VAIO 3]',
        ],
        Bus: [
            'Hardware A1',
            'Hardware A2',
            'Hardware A3',
            'Hardware A4',
            'Hardware A5',
            'Virtual 1 [VAIO]',
            'Virtual 2 [AUX]',
            'Virtual 3 [VAIO 3]',
        ],
    },
};

const STRING_MENU_ITEMS = {
    itemTitleInputs: 'INPUTS',
    itemTitleOutputs: 'OUTPUTS',
    itemTitleSettings: 'SETTINGS',
    itemTitleDriverWorkarounds: 'DRIVER WORKAROUNDS',
    itemListBindings: {
        t: 'Bind Windows Volume To',
        d: '',
    },
    itemListPatches: {
        t: 'Settings',
        d: '',
    },
    itemRestartVoicemeeter: {
        t: 'Restart Voicemeeter',
        d: '',
    },
    itemRestartAudioEngine: {
        t: 'Restart Audio Engine',
        d: '',
    },
    itemLimitdBGain: {
        t: 'Limit Max Gain To 0dB',
        d: '',
    },
    itemRestoreVolume: {
        t: 'Restore Volume At Launch',
        d: '',
    },
    itemPreventVolumeSpikes: {
        t: 'Prevent 100% Volume Spikes',
        d: '',
    },
    itemCrackleFix: {
        t: 'Apply Crackle Fix (USB Interfaces)',
        d: '',
    },
    itemStartWithWindows: {
        t: 'Automatically Start With Windows',
        d: '',
    },
    itemVisitGithub: {
        t: 'Visit Github Page',
        d: '',
    },
    itemDonate: {
        t: 'Donate (optional)',
        d: '',
    },
    itemExit: {
        t: 'Exit',
        d: '',
    },
};

export { STRING_VOICEMEETER_FRIENDLY_NAMES, STRING_MENU_ITEMS };
