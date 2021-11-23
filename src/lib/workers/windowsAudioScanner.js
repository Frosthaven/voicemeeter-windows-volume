import { EventEmitter } from 'events';
import {
    startPowershellWorker,
    stopPowershellWorker,
    sendToPowershellWorker,
} from '../runPowershell';

const label = 'AudioScanner';
const labelDevices = 'DeviceScanner';

let AudioEvents = new EventEmitter();
let started = null;
let volume = null;
let muted = null;
let devices = [];

const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

const getVolume = () => {
    return volume;
};

const getMuted = () => {
    return muted;
};

const getDevices = () => {
    return devices;
};

const setVolume = (volume) => {
    // PS C:\> [Audio]::Volume = 0.75  # Set volume to 75%
    sendToPowershellWorker({
        label: label,
        command: `[Audio]::Volume = ${volume * 0.01}`,
    });
};

const setMuted = (isMuted) => {
    // PS C:\> [Audio]::Mute = $true   # Mute speaker
    console.log('setMuted not yet implemented');
};

const startAudioScanner = (interval) => {
    if (started) {
        return;
    }
    started = true;

    startPowershellWorker({
        interval: interval,
        label: label,
        setup: `Add-Type -TypeDefinition @'\r\n
using System.Runtime.InteropServices;\r\n
\r\n
[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\r\n
interface IAudioEndpointVolume {\r\n
    // f(), g(), ... are unused COM method slots. Define these if you care\r\n
    int f(); int g(); int h(); int i();\r\n
    int SetMasterVolumeLevelScalar(float fLevel, System.Guid pguidEventContext);\r\n
    int j();\r\n
    int GetMasterVolumeLevelScalar(out float pfLevel);\r\n
    int k(); int l(); int m(); int n();\r\n
    int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, System.Guid pguidEventContext);\r\n
    int GetMute(out bool pbMute);\r\n
};\r\n
\r\n
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\r\n
interface IMMDevice {\r\n
    int Activate(ref System.Guid id, int clsCtx, int activationParams, out IAudioEndpointVolume aev);\r\n
};\r\n
\r\n
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\r\n
interface IMMDeviceEnumerator {\r\n
    int f(); // Unused\r\n
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);\r\n
};\r\n
\r\n
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumeratorComObject { };\r\n
\r\n
public class Audio {\r\n
    static IAudioEndpointVolume Vol() {\r\n
    var enumerator = new MMDeviceEnumeratorComObject() as IMMDeviceEnumerator;\r\n
    IMMDevice dev = null;\r\n
    Marshal.ThrowExceptionForHR(enumerator.GetDefaultAudioEndpoint(/*eRender*/ 0, /*eMultimedia*/ 1, out dev));\r\n
    IAudioEndpointVolume epv = null;\r\n
    var epvid = typeof(IAudioEndpointVolume).GUID;\r\n
    Marshal.ThrowExceptionForHR(dev.Activate(ref epvid, /*CLSCTX_ALL*/ 23, 0, out epv));\r\n
    return epv;\r\n
    }\r\n
    public static float Volume {\r\n
    get {float v = -1; Marshal.ThrowExceptionForHR(Vol().GetMasterVolumeLevelScalar(out v)); return v;}\r\n
    set {Marshal.ThrowExceptionForHR(Vol().SetMasterVolumeLevelScalar(value, System.Guid.Empty));}\r\n
    }\r\n
    public static bool Mute {\r\n
    get { bool mute; Marshal.ThrowExceptionForHR(Vol().GetMute(out mute)); return mute; }\r\n
    set { Marshal.ThrowExceptionForHR(Vol().SetMute(value, System.Guid.Empty)); }\r\n
    }\r\n
};\r\n
'@\r\n`,
        command: '[Audio]::Volume | Out-Host; [Audio]::Mute | Out-Host;',
        onResponse: (data) => {
            if (data && data.length > 0) {
                // get volume and mute state out of the top two lines
                let newVolume = Math.round(parseFloat(data.shift()) * 100);
                let newMuted = data.shift() === 'True' ? true : false;

                let events = {
                    first_start: {
                        enable: false,
                    },
                    volume: {
                        enable: false,
                        data: null,
                    },
                    muted: {
                        enable: false,
                        data: null,
                    },
                };

                // update our values and prepare events
                if (volume !== newVolume && !isNaN(newVolume)) {
                    if (volume === null && newVolume !== null) {
                        events.first_start.enable = true;
                    }
                    if (null !== volume) {
                        events.volume.enable = true;
                        events.volume.data = {
                            old: volume,
                            new: newVolume,
                        };
                    }
                    volume = newVolume;
                }
                if (muted !== newMuted) {
                    if (null !== muted) {
                        events.muted.enable = true;
                        events.muted.data = {
                            old: muted,
                            new: newMuted,
                        };
                    }
                    muted = newMuted;
                }
                if (events.first_start.enable) {
                    AudioEvents.emit('started');
                }

                if (events.volume.enable) {
                    AudioEvents.emit('volume', events.volume.data);
                }
                if (events.muted.enable) {
                    AudioEvents.emit('mute', events.muted.data);
                }

                //cleanup
                events = null;
                newVolume = null;
                newMuted = null;
            }
        },
    });

    startPowershellWorker({
        interval: 5000,
        label: labelDevices,
        command: 'get-wmiobject win32_sounddevice | Out-Host;',
        onResponse: (data) => {
            // remaining data is active audio device status. if we need more
            // data control later, we can split the lines via regex /\s{2,}/
            // which will give us a 2 dimensional array of device info
            // (the first two indexes will be headers, and then divider lines)
            let newDevices = data;
            let events = {
                device: {
                    enable: false,
                    data: null,
                },
            };

            if (newDevices.length > 0 && !arraysEqual(devices, newDevices)) {
                if (devices.length > 0) {
                    events.device.enable = true;
                    events.device.data = {
                        old: devices,
                        new: newDevices,
                    };
                }

                devices = Array.from(newDevices);
            }

            if (events.device.enable) {
                AudioEvents.emit('device', events.device.data);
            }

            newDevices = null;
        },
    });
};

const stopAudioScanner = () => {
    stopPowershellWorker(label);
    stopPowershellWorker(labelDevices);
    AudioEvents.emit('stopped');
    started = false;
};

export {
    startAudioScanner,
    stopAudioScanner,
    getDevices,
    getVolume,
    setVolume,
    getMuted,
    setMuted,
    AudioEvents,
};
