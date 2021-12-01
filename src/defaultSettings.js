import { PRIORITIES } from './lib/managers/processManager.js';

const defaults = {
    polling_rate: 100,
    gain_min: -60,
    gain_max: 12,
    start_with_windows: true,
    limit_db_gain_to_0: false,
    remember_volume: false,
    disable_donate: false,
    audiodg: {
        priority: PRIORITIES.HIGH,
        affinity: 2,
    },
    toggles: [
        {
            setting: 'restart_audio_engine_on_device_change',
            value: false,
        },
        {
            setting: 'restart_audio_engine_on_app_launch',
            value: false,
        },
    ],
};

export { defaults };
