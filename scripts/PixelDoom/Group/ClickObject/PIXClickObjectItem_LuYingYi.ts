import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js";
import { DialogueSystem } from "../../UI/dialogue_ui/UIDialogue.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";


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
            // console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

            var LuyingYizi = LastestChooseObject;
            PlayerInstance.x = LuyingYizi.x
            PlayerInstance.y = LuyingYizi.y;

            UISubtitleMain.ShowSubtitles("你正在使用 [露营椅子]", 5)
        }

        if (ButtonConetent == "destroy") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            //GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")
            UISubtitleMain.ShowSubtitles('<span style="color: red;">*此物品无法被破坏</span>', 5)
        }

        if (ButtonConetent == "find") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            var Dialogue =new DialogueSystem();
            Dialogue.ShowDialogue(`左->这里看来有人来过
左->火堆还没有熄灭
左->choose:仔细检查露营椅子
	右->并没有发现什么异常
	左->不过有雨水打湿的痕迹。最近在雨季。
左->choose:查看帐篷情况
左->继续
左->choose:查看露营椅的牌子
	右->磨损严重看不清
左->继续`)

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