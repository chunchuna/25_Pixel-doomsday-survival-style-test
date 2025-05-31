import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, SerializeItemsOnly, type Item } from "../../UI/inventory_ui/UIInventory.js";

export var PLAYER_INVENTORY_ITEMS: Item[];


// 玩家在LEVEL里面的主库存
export var PLAYER_MAIN_INVENTORY_LEVEL = {
    MAIN: null as any,
}


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 玩家的初始库存  写在这里
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory = SerializeItemsOnly([
        { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
        { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
        { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
        { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
        { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
        { itemName: "手枪", itemDescribe: "标准手枪，伤害一般但射速较快", itemLevel: ItemLevel.C },
        { itemName: "霰弹枪", itemDescribe: "近距离威力巨大的武器", itemLevel: ItemLevel.B },
        { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
        { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
        { itemName: "破损的部件", itemDescribe: "看起来已经无法使用了", itemLevel: ItemLevel.Break },
        { itemName: "神秘宝石", itemDescribe: "散发着奇异光芒的宝石，似乎有特殊价值", itemLevel: ItemLevel.Top },
        { itemName: "防弹衣", itemDescribe: "减少受到的伤害", itemLevel: ItemLevel.A },
        { itemName: "地图", itemDescribe: "显示周围地区的详细信息", itemLevel: ItemLevel.C },
        { itemName: "眼镜", itemDescribe: "普通的眼镜，似乎没什么特别之处", itemLevel: ItemLevel.Low },
        { itemName: "密码本", itemDescribe: "记录着一些重要的密码", itemLevel: ItemLevel.B },])
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    // Get initial inventory data
    const initialItems = DeserializeItemsOnly(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory);
    // Create update function to update global variables after inventory operations
    const updatePlayerInventory = (items: Item[]) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory = SerializeItemsOnly(items);
    };
    
    // Bind main inventory and get the returned control object
    const inventoryControl = inventoryManager.BindPlayerMainInventory(initialItems, 30, 5, "Tab");
    
    // Save reference to ensure unbind function is available
    PLAYER_MAIN_INVENTORY_LEVEL.MAIN = inventoryControl;
    
    // Verify that the control object has the unbind method
    if (!inventoryControl || typeof inventoryControl.unbind !== 'function') {
        console.error("Failed to properly initialize inventory control object");
    } else {
        console.log("Inventory control object initialized successfully");
    }
    
    // Switch to single column mode
    
    // Add custom update callback for main inventory
    inventoryManager.SetMainInventoryUpdateCallback({
        updateMethod: updatePlayerInventory
    });
})

// Handle data saving 

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    //@ts-ignore
    var initialItems
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load", (e) => {
        initialItems = DeserializeItemsOnly(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory);
        // Re-bind inventory UI to ensure UI is synchronized with data
        if (inventoryManager) {
            // Give a short delay to ensure UI system is ready
            setTimeout(() => {
                // Reset and re-bind inventory
                //@ts-ignore
                const control = inventoryManager.BindPlayerMainInventory(
                    DeserializeItemsOnly(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory), 
                    30, 
                    6, 
                    "I"
                );
                
                // Save reference to ensure unbind function is available
                PLAYER_MAIN_INVENTORY_LEVEL.MAIN = control;
                
                // Verify that the control object has the unbind method
                if (!control || typeof control.unbind !== 'function') {
                    console.error("Failed to properly re-initialize inventory control object on load");
                } else {
                    console.log("Inventory control object re-initialized successfully on load");
                }
                
                // Apply single column mode
                //control.oneline();
            }, 100);
        }
    });
})