import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js";

import { DialogueSystem } from "../../UI/dialogue_ui/UIDialogue.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";


import { DIA_CONTENT_LUYINGYI_01, DIA_CONTENT_test001, DIA_CONTENT_test002 } from "../../UI/dialogue_ui/DialogueScript.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, type Item, SerializeItemsOnly, type InventoryUpdateCallback } from "../../UI/inventory_ui/UIInventory.js";


var PlayerInstance: InstanceType.RedHairGirlSprite;
var ZhangPengInventory: Item[] = [
]

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // @ts-ignore
    PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 处理库存系统测试 
    ZhangPengInventory = [{ itemName: "温暖的衣服", itemDescribe: "充满温度的衣服，可以保暖", itemLevel: ItemLevel.B },
    { itemName: "手机", itemDescribe: "可以用于通讯和照明的只能工具", itemLevel: ItemLevel.S }]
})


/** 使用 UI 交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 用于存储当前打开的库存关闭函数


    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {

        var ButtonConetent: string = e.data.ButtonContent_;
        if (ButtonConetent == "使用") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


            //GL_COMMAND_.GET_LAST_ACTION="refresh"
            // console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

            var LuyingYizi = LastestChooseObject;
            PlayerInstance.x = LuyingYizi.x
            PlayerInstance.y = LuyingYizi.y;

            UISubtitleMain.ShowSubtitles("你正在使用 [露营椅子]", 5)
        }

        if (ButtonConetent == "销毁") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            //GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")
            UISubtitleMain.ShowSubtitles('<span style="color: red;">*此物品无法被破坏</span>', 5)
        }

        if (ButtonConetent == "调查") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            // @ts-ignore
            DialogueMainController.ShowDialogue(DIA_CONTENT_LUYINGYI_01)

        }

        if (ButtonConetent == "查看库存") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "ZhangPeng") return
            // @ts-ignore
            //DialogueMainController.ShowDialogue(DIA_CONTENT_LUYINGYI_01)
            var InventoryInstance: InstanceType.InventoryData = LastestChooseObject;
            var InventoryData = DeserializeItemsOnly(InventoryInstance.instVars.InventoryData);
            
            // 创建更新回调，指定实例和变量名
            const updateInfo: InventoryUpdateCallback = {
                instance: InventoryInstance,
                varName: "InventoryData"
            };
            
            // 传入更新回调参数
            inventoryManager.ShowOtherInventory(InventoryData, 10, 5, updateInfo);
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