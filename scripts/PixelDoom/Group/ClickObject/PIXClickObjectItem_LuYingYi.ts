import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js";


var PlayerInstance: InstanceType.RedHairGirlSprite;


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // @ts-ignore
    PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
})




/** 使用 UI 交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {

        var ButtonConetent: string = e.data.ButtonContent_;
        if (ButtonConetent == "use") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


            //GL_COMMAND_.GET_LAST_ACTION="refresh"
            console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

            var LuyingYizi = LastestChooseObject;
            PlayerInstance.x = LuyingYizi.x
            PlayerInstance.y = LuyingYizi.y;
        }

        if (ButtonConetent == "destroy") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")
        }


    })
})


/** 使用GL_COMMAND 的交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

    GL_COMMAND_._TRY_ACTION_UPDATE("use", () => {
        if (LastestChooseObject == null) return
        if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


        //GL_COMMAND_.GET_LAST_ACTION="refresh"
        console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

        var LuyingYizi = LastestChooseObject;
        PlayerInstance.x = LuyingYizi.x
        PlayerInstance.y = LuyingYizi.y;

        // PlayerInstance.behaviors.MoveFunction.isEnabled = false;


    })


    GL_COMMAND_._TRY_ACTION_UPDATE("destroy", () => {
        if (LastestChooseObject == null) return
        if (LastestChooseObject.instVars.ID != "LuYingYiZi") return

        GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")

    })
})