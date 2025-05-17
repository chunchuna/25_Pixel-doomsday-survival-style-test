import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

export class _Audio {
    public static AudioPlayOnce(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayOnce", AudioName, Yinliang, ShengDao, TAG)

    }

    public static AudioPlayCycle(AudioName: string, Yinliang: number, ShengDao: number, TAG: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayCycle", AudioName, Yinliang, ShengDao, TAG)

    }

    public static AudioStop(TAG: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioStop", TAG)

    }

    public static AudioStopAll() {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioStopAll")

    }

    public static AudioPlayOnPostion(AudioName: string, ZengYi: number, X: number, Y: number, Z: number, TAG: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayOnPostion", AudioName, ZengYi, X, Y, Z, TAG)
    }
}