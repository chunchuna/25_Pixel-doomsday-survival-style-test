import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
export class _Audio {
    static AudioPlayOnce(AudioName, Yinliang, ShengDao, TAG) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayOnce", AudioName, Yinliang, ShengDao, TAG);
    }
    static AudioPlayCycle(AudioName, Yinliang, ShengDao, TAG) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayCycle", AudioName, Yinliang, ShengDao, TAG);
    }
    static AudioStop(TAG) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioStop", TAG);
    }
    static AudioStopAll(TAG) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioStopAll");
    }
    static AudioPlayOnPostion(AudioName, ZengYi, X, Y, Z, TAG) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("AudioPlayOnPostion", AudioName, ZengYi, X, Y, Z, TAG);
    }
}
