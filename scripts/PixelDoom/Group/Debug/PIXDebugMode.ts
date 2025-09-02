import { Unreal__ } from "../../../engine.js";
import { UIConsole } from "../../UI/debug_ui/UIConsole.js";
import { IMGUIDebugButton } from "../../UI/debug_ui/UIDbugButton.js";
import { VariableMonitoring } from "../../UI/debug_ui/UIvariableMonitoring.js";
import { startFogDistanceMonitoring } from "../Effect/Fog/PIXEffect_fog.js";
import { data } from "../Save/PIXSave.js";

export class dEBUG_MOD {

    // 打开这个后会自动打开配置好的debug调试窗口 
    static AllowDebugMod = true

    // 判断是否已经呼出各种debug 窗口
    static DebugModAlreadRunning = false;


    static async DirectRunDebugWindow() {
        if (dEBUG_MOD.DebugModAlreadRunning) return
        if (dEBUG_MOD.AllowDebugMod) {

            //VariableMonitoring.Toggle();

            IMGUIDebugButton.Toggle();
            await Unreal__.WAIT_TIME_FORM_PROMISE(1)

            UIConsole.Toggle();


            dEBUG_MOD.DebugModAlreadRunning = true;
            startFogDistanceMonitoring();

        }

    }
}

Unreal__.GameBegin(() => {
    dEBUG_MOD.DirectRunDebugWindow();


})


