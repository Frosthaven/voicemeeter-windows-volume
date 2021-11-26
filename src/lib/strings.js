//{{INJECT_START:PKG}}
const STRING_METADATA = {
    name: 'voicemeeter-windows-volume',
    friendlyname: 'Voicemeeter Windows Volume',
    version: '1.6.2.0',
};
//{{INJECT_END:PKG}}

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

const STRING_CONSOLE_ENTRIES = {
    restartAudioEngine: 'Restaring audio engine. Reason: {{REASON}}',
    restartAudioEngineReasons: {
        userinput: 'User Input',
        applaunch: 'App Launch',
        devicechange: 'Audio Device Connection Changes',
        resume: 'Resume From Sleep And Standby',
    },
};

const STRING_MENU_ITEMS = {
    itemVMTitle: 'VOICEMEETER',
    itemSupportTitle: 'SUPPORT',
    itemTitleInputs: 'INPUTS',
    itemTitleOutputs: 'OUTPUTS',
    itemTitleSettings: 'SETTINGS',
    itemTitleDriverWorkarounds: 'PATCHES AND WORKAROUNDS',
    itemListBindings: {
        t: 'Bind Windows Volume To...',
        d: '',
    },
    itemListRestarts: {
        t: 'Restart Audio Engine On...',
        d: '',
    },
    itemRestartAudioEngineOnDeviceChange: {
        t: 'Audio Devices Change',
        d: '',
    },
    itemListPatches: {
        t: 'Settings',
        d: '',
    },
    itemShowVoicemeeter: {
        t: 'Show Voicemeeter',
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

export {
    STRING_VOICEMEETER_FRIENDLY_NAMES,
    STRING_CONSOLE_ENTRIES,
    STRING_MENU_ITEMS,
    STRING_METADATA,
};
