import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { DeserializeItemsOnly, inventoryManager, type InventoryUpdateCallback } from "../../UI/inventory_ui/UIInventory.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {

        var ButtonConetent: string = e.data.ButtonContent_;
        if (ButtonConetent == "查看库存") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "ZhangPeng") return

            // 打开库存面板
            // 使用类型断言来避免类型错误
            //@ts-ignore
            var InventoryInstance = LastestChooseObject as InstanceType.InventoryData;

            // 确保实例有InventoryData属性，如果没有则进行处理
            if (!InventoryInstance.instVars.InventoryData) {
                console.warn("实例没有InventoryData属性，将使用空库存");
                InventoryInstance.instVars.InventoryData = "[]";
            }

            var InventoryData = DeserializeItemsOnly(InventoryInstance.instVars.InventoryData);

            // 创建更新回调，指定实例和变量名
            const updateInfo: InventoryUpdateCallback = {
                instance: InventoryInstance,
                varName: "InventoryData"
            };
            // 传入更新回调参数
            inventoryManager.ShowOtherInventory(InventoryData, 10, 6, updateInfo, InventoryInstance.instVars.InventoryName);
        }
        if (ButtonConetent == "调查") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "ZhangPeng") return

            // @ts-ignore
            DialogueMainController.ShowDialogue(DIA_CONTENT_ZHANGPENG_01)

        }
    })
})

export function DIA_temp_ReBackDialogueFunction() {
    // @ts-ignore
    DialogueMainController.ShowDialogue(DIA_CONTENT_ZHANGPENG_01)

}
export function DIA_temp_InventoryFindFunction() {

    //@ts-ignore
    var InventoryInstance = LastestChooseObject as InstanceType.InventoryData;

    // 确保实例有InventoryData属性，如果没有则进行处理
    if (!InventoryInstance.instVars.InventoryData) {
        InventoryInstance.instVars.InventoryData = "[]";
    }

    var InventoryData = DeserializeItemsOnly(InventoryInstance.instVars.InventoryData);

    // 创建更新回调，指定实例和变量名
    const updateInfo: InventoryUpdateCallback = {
        instance: InventoryInstance,
        varName: "InventoryData"
    };
    // 传入更新回调参数
    inventoryManager.ShowOtherInventory(InventoryData, 10, 6, updateInfo, InventoryInstance.instVars.InventoryName);

}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    (window as any).DIA_temp_InventoryFindFunction = DIA_temp_InventoryFindFunction;

    (window as any).DIA_temp_ReBackDialogueFunction = DIA_temp_ReBackDialogueFunction;
})


// 帐篷调查
var DIA_CONTENT_ZHANGPENG_01 = `
左-> 露营地的帐篷显得格外的显眼
右->choose:查看外观
    左-> 一个普通的帐篷，被雨水打湿。帐篷的门是打开的
    左->[code-(DIA_temp_ReBackDialogueFunction())] 
右->choose:进入帐篷内查看
    左-> 里面有一些没有被拿走的东西
    左-> 看来帐篷的主人走的很匆忙
    右->choose:继续分析
        左-> 从帐篷外部的篝火来看，帐篷的主人应该没有离开太久才对
        左-> 但是由于天气的原因
        左-> 就算再帐篷里面也感觉比较寒冷
        左->[code-(DIA_temp_ReBackDialogueFunction())] 
    右->choose:查看库存
        左-> 你正在查看帐篷的库存信息[code-(DIA_temp_InventoryFindFunction())]    
        左->[code-(DIA_temp_ReBackDialogueFunction())] 
右->choose:整体观察
    左-> 一个普通的帐篷，被雨水打湿。帐篷的门是打开的
    右-> 信息:信息被记录
    左->[code-(DIA_temp_ReBackDialogueFunction())] 
	`