declare const defaults: {
    polling_rate: number;
    gain_min: number;
    gain_max: number;
    start_with_windows: boolean;
    limit_db_gain_to_0: boolean;
    remember_volume: boolean;
    disable_donate: boolean;
    audiodg: {
        priority: number;
        affinity: number;
    };
    toggles: {
        setting: string;
        value: boolean;
    }[];
};
export { defaults };
