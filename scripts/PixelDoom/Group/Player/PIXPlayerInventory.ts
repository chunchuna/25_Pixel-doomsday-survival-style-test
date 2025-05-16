import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, SerializeItemsOnly, type Item } from "../../UI/inventory_ui/UIInventory.js";

export var PLAYER_INVENTORY_ITEMS: Item[];

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 定义玩家的初始库存 
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory = SerializeItemsOnly([{ itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
    { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
    { itemName: "手枪", itemDescribe: "标准手枪，伤害一般但射速较快", itemLevel: ItemLevel.C },
    { itemName: "霰弹枪", itemDescribe: "近距离威力巨大的武器", itemLevel: ItemLevel.B },
    { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
    { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
    { itemName: "破损的部件", itemDescribe: "看起来已经无法使用了", itemLevel: ItemLevel.Break },
    { itemName: "神秘宝石", itemDescribe: "散发着奇异光芒的宝石，似乎有特殊价值", itemLevel: ItemLevel.S },
    { itemName: "防弹衣", itemDescribe: "减少受到的伤害", itemLevel: ItemLevel.A },
    { itemName: "地图", itemDescribe: "显示周围地区的详细信息", itemLevel: ItemLevel.C },
    { itemName: "眼镜", itemDescribe: "普通的眼镜，似乎没什么特别之处", itemLevel: ItemLevel.Low },
    { itemName: "密码本", itemDescribe: "记录着一些重要的密码", itemLevel: ItemLevel.B },])
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 获取初始库存数据
    const initialItems = DeserializeItemsOnly(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory);
    PLAYER_INVENTORY_ITEMS = initialItems;
    
    // 创建更新函数，用于在库存操作后更新全局变量
    const updatePlayerInventory = (items: Item[]) => {
        // 更新内存中的库存数组
        PLAYER_INVENTORY_ITEMS = items;
        // 将最新库存数据序列化并更新全局变量
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory = SerializeItemsOnly(items);
    };
    
    // 绑定主库存，并监听物品变化
    inventoryManager.BindPlayerMainInventory(initialItems, 30, 5, "I");
    
    // 为主库存添加自定义更新回调
    inventoryManager.SetMainInventoryUpdateCallback({
        updateMethod: updatePlayerInventory
    });
})

// 处理数据保存 

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 保存游戏数据
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("save", (e) => {
        // 将当前内存中的库存数据保存到存档
        e.saveData = {
            "PlayerInventoryData": PLAYER_INVENTORY_ITEMS
        }
    });
    
    // 加载游戏数据
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load", (e) => {
        // 从存档加载库存数据到内存中
        if (e.saveData && e.saveData.PlayerInventoryData) {
            // 更新内存中的库存数组
            PLAYER_INVENTORY_ITEMS = e.saveData.PlayerInventoryData;
            
            // 更新全局变量中的序列化字符串
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.PlayerInventory = 
                SerializeItemsOnly(PLAYER_INVENTORY_ITEMS);
            
            
            // 重新绑定库存UI，确保UI与数据同步
            if (inventoryManager) {
                // 给一个短暂延迟，确保UI系统已经准备好
                setTimeout(() => {
                    // 重置并重新绑定库存
                    inventoryManager.BindPlayerMainInventory(PLAYER_INVENTORY_ITEMS, 30, 6, "I");
                    console.log("已重新绑定库存UI");
                }, 100);
            }
        } else {
            console.warn("加载的存档中没有库存数据");
        }
    });
})