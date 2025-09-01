import { hf_engine } from "../../engine.js";

export class _Audio {
    public static AudioPlayOnce(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        hf_engine.runtime.callFunction("AudioPlayOnce", AudioName, Yinliang, ShengDao, TAG)
    }
    public static AudioPlayCycle(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        hf_engine.runtime.callFunction("AudioPlayCycle", AudioName, Yinliang, ShengDao, TAG)
    }
    public static AudioStop(TAG: string) {
        hf_engine.runtime.callFunction("AudioStop", TAG)
    }
    public static AudioStopAll() {
        hf_engine.runtime.callFunction("AudioStopAll")
    }
    public static AudioPlayOnPostion(AudioName: string, ZengYi: number, X: number, Y: number, Z: number, TAG: string) {
        hf_engine.runtime.callFunction("AudioPlayOnPostion", AudioName, ZengYi, X, Y, Z, TAG)
    }
}