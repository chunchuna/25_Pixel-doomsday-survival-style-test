import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js";

import { DialogueSystem } from "../../UI/dialogue_ui/UIDialogue.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";


import { DIA_CONTENT_LUYINGYI_01, DIA_CONTENT_test001, DIA_CONTENT_test002 } from "../../UI/dialogue_ui/DialogueScript.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, type Item, SerializeItemsOnly, type InventoryUpdateCallback } from "../../UI/inventory_ui/UIInventory.js";


var PlayerInstance: InstanceType.RedHairGirlSprite;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // @ts-ignore
    PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
})


/** 使用 UI 交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 用于存储当前打开的库存关闭函数


    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {

        var ButtonConetent_id: string = e.data.ButtonContent_;
        if (ButtonConetent_id == "use") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


            //GL_COMMAND_.GET_LAST_ACTION="refresh"
            // console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

            var LuyingYizi = LastestChooseObject;
            PlayerInstance.x = LuyingYizi.x
            PlayerInstance.y = LuyingYizi.y;

            UISubtitleMain.ShowSubtitles("你正在使用 [露营椅子]", 5)
        }

        if (ButtonConetent_id == "destroy") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            //GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")
            UISubtitleMain.ShowSubtitles('<span style="color: red;">*此物品无法被破坏</span>', 5)
        }

        if (ButtonConetent_id == "find") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            // @ts-ignore
            DialogueMainController.ShowDialogue(DIA_CONTENT_LUYINGYI_01)

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