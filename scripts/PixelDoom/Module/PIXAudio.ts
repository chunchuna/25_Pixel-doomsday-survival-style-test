import { Unreal__ } from "../../engine.js";

export class _Audio {
    public static AudioPlayOnce(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        Unreal__.runtime.callFunction("AudioPlayOnce", AudioName, Yinliang, ShengDao, TAG)
    }
    public static AudioPlayCycle(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        Unreal__.runtime.callFunction("AudioPlayCycle", AudioName, Yinliang, ShengDao, TAG)
    }
    public static AudioStop(TAG: string) {
        Unreal__.runtime.callFunction("AudioStop", TAG)
    }
    public static AudioStopAll() {
        Unreal__.runtime.callFunction("AudioStopAll")
    }
    public static AudioPlayOnPostion(AudioName: string, ZengYi: number, X: number, Y: number, Z: number, TAG: string) {
        Unreal__.runtime.callFunction("AudioPlayOnPostion", AudioName, ZengYi, X, Y, Z, TAG)
    }
}