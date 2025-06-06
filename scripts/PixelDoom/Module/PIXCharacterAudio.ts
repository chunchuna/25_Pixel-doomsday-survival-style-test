import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

// @ts-ignore
var JiaoBuShengInterval: any = null;
var JiaoBuTimer: any;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionISMoving", () => {

        JiaoBuTimer = JiaoBuShengInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
            _Audio.AudioPlayOnce("sfx_JiaoBuSheng", -25, 2, "SFX_JiaoBuSheng")
        }, 0.5)
    })

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionNotMoving", () => {
        _Audio.AudioStop("SFX_JiaoBuSheng")
        // @ts-ignore
        clearInterval(JiaoBuShengInterval);
        //@ts-ignore
        if (JiaoBuTimer)
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.STOP_C3TIMER_INTERVAL(JiaoBuTimer)

    })
})