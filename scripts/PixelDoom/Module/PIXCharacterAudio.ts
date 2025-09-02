import { Unreal__ } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

// @ts-ignore
var JiaoBuShengInterval: any = null;
var JiaoBuTimer: any;

Unreal__.GameBegin(() => {
    Unreal__.GetEvent("CharacterControllerMoveFunctionISMoving", () => {

        JiaoBuTimer = JiaoBuShengInterval = Unreal__.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
            _Audio.AudioPlayOnce("sfx_JiaoBuSheng", -25, 2, "SFX_JiaoBuSheng")
        }, 0.5)
    })

    Unreal__.GetEvent("CharacterControllerMoveFunctionNotMoving", () => {
        _Audio.AudioStop("SFX_JiaoBuSheng")
        // @ts-ignore
        clearInterval(JiaoBuShengInterval);
        //@ts-ignore
        if (JiaoBuTimer)
            Unreal__.STOP_C3TIMER_INTERVAL(JiaoBuTimer)

    })
})