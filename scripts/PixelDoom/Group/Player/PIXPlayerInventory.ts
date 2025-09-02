import { hf_engine } from "../../../engine.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, SerializeItemsOnly, type Item } from "../../UI/inventory_ui/UIInventory.js";
import { Apple, MainInventory } from "../Inventory/PIXItems.js";
export var PLAYER_INVENTORY_ITEMS: Item[];


// 玩家在LEVEL里面的主库存
export var PLAYER_MAIN_INVENTORY_LEVEL = {
    MAIN: null as any,
}


hf_engine.gl$_ubu_init(() => {
    
    // 玩家的初始库存  写在这里
    hf_engine.
    runtime.globalVars.PlayerInventory = SerializeItemsOnly([
        ...new Apple().toItems(10),
    ]);
    
    
   
})


hf_engine.gl$_ubu_init(() => {

    if (hf_engine.runtime.layout.name != "Level") return

    // Get initial inventory data
    const initialItems = DeserializeItemsOnly(hf_engine.runtime.globalVars.PlayerInventory);
    // Create update function to update global variables after inventory operations
    const updatePlayerInventory = (items: Item[]) => {
        hf_engine.runtime.globalVars.PlayerInventory = SerializeItemsOnly(items);
    };
    
    // Bind main inventory and get the returned control object
    const inventoryControl = inventoryManager.BindPlayerMainInventory(initialItems, 30, 5, "Tab");
    //inventoryControl.oneline();
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

hf_engine.gl$_ubu_init(() => {
    //@ts-ignore
    var initialItems
    hf_engine.runtime.addEventListener("load", (e:any) => {
        initialItems = DeserializeItemsOnly(hf_engine.runtime.globalVars.PlayerInventory);
        // Re-bind inventory UI to ensure UI is synchronized with data
        if (inventoryManager) {
            // Give a short delay to ensure UI system is ready
            setTimeout(() => {
                // Reset and re-bind inventory
                //@ts-ignore
                const control = inventoryManager.BindPlayerMainInventory(
                    DeserializeItemsOnly(hf_engine.runtime.globalVars.PlayerInventory), 
                    30, 
                    6, 
                    "Tab"
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