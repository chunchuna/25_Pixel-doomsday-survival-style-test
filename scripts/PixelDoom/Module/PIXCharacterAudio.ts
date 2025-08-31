import { hf_engine } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

// @ts-ignore
var JiaoBuShengInterval: any = null;
var JiaoBuTimer: any;

hf_engine.gl$_ubu_init(() => {
    hf_engine.gl$_call_eventhandle_("CharacterControllerMoveFunctionISMoving", () => {

        JiaoBuTimer = JiaoBuShengInterval = hf_engine.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
            _Audio.AudioPlayOnce("sfx_JiaoBuSheng", -25, 2, "SFX_JiaoBuSheng")
        }, 0.5)
    })

    hf_engine.gl$_call_eventhandle_("CharacterControllerMoveFunctionNotMoving", () => {
        _Audio.AudioStop("SFX_JiaoBuSheng")
        // @ts-ignore
        clearInterval(JiaoBuShengInterval);
        //@ts-ignore
        if (JiaoBuTimer)
            hf_engine.STOP_C3TIMER_INTERVAL(JiaoBuTimer)

    })
})