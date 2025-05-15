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
            var InventoryInstance = LastestChooseObject as any;
            
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
            inventoryManager.ShowOtherInventory(InventoryData, 10, 5, updateInfo);
        }
    })
})