import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UIConsole } from "../../UI/debug_ui/UIConsole.js";
import { IMGUIDebugButton } from "../../UI/debug_ui/UIDbugButton.js";
import { VariableMonitoring } from "../../UI/debug_ui/UIvariableMonitoring.js";

export class dEBUG_MOD {
    static isEnable = true;
    static isRunMod = false;


    static async asynload() {
        if (dEBUG_MOD.isRunMod) return
        if (dEBUG_MOD.isEnable) {

            VariableMonitoring.Toggle();

            IMGUIDebugButton.Toggle();
            await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1)

            UIConsole.Toggle();

            dEBUG_MOD.isRunMod = true;

        }

    }
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    dEBUG_MOD.asynload();


})


