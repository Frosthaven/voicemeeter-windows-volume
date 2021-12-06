declare const STRING_METADATA: {
    name: string;
    friendlyname: string;
    version: string;
};
declare const STRING_VOICEMEETER_FRIENDLY_NAMES: {
    voicemeeter: {
        Strip: string[];
        Bus: string[];
    };
    voicemeeterBanana: {
        Strip: string[];
        Bus: string[];
    };
    voicemeeterPotato: {
        Strip: string[];
        Bus: string[];
    };
};
declare const STRING_CONSOLE_ENTRIES: {
    restartAudioEngine: string;
    restartAudioEngineReasons: {
        userinput: string;
        applaunch: string;
        devicechange: string;
        resume: string;
        modern_resume: string;
        monitor_resume: string;
    };
};
declare const STRING_MENU_ITEMS: {
    itemVMTitle: string;
    itemSupportTitle: string;
    itemTitleInputs: string;
    itemTitleOutputs: string;
    itemTitleSettings: string;
    itemTitleDriverWorkarounds: string;
    itemListBindings: {
        t: string;
        d: string;
    };
    itemListRestarts: {
        t: string;
        d: string;
    };
    itemRestartAudioEngineOnDeviceChange: {
        t: string;
        d: string;
    };
    itemListPatches: {
        t: string;
        d: string;
    };
    itemShowVoicemeeter: {
        t: string;
        d: string;
    };
    itemRestartVoicemeeter: {
        t: string;
        d: string;
    };
    itemRestartAudioEngine: {
        t: string;
        d: string;
    };
    itemLimitdBGain: {
        t: string;
        d: string;
    };
    itemRestoreVolume: {
        t: string;
        d: string;
    };
    itemPreventVolumeSpikes: {
        t: string;
        d: string;
    };
    itemCrackleFix: {
        t: string;
        d: string;
    };
    itemStartWithWindows: {
        t: string;
        d: string;
    };
    itemVisitGithub: {
        t: string;
        d: string;
    };
    itemDonate: {
        t: string;
        d: string;
    };
    itemExit: {
        t: string;
        d: string;
    };
};
export { STRING_VOICEMEETER_FRIENDLY_NAMES, STRING_CONSOLE_ENTRIES, STRING_MENU_ITEMS, STRING_METADATA, };
