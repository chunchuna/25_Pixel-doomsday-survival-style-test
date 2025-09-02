import { Unreal__ } from "../../../engine.js";
import { DeserializeItemsOnly, inventoryManager, ItemLevel, SerializeItemsOnly, type Item } from "../../UI/inventory_ui/UIInventory.js";



// Base item data structure
export abstract class ItemData {
    abstract readonly itemName: string;
    abstract readonly itemDescribe: string;
    abstract readonly itemLevel: ItemLevel;
    
    // Convert to Item interface for inventory system
    public toItem(): Item {
        return {
            itemName: this.itemName,
            itemDescribe: this.itemDescribe,
            itemLevel: this.itemLevel
        };
    }

     // Create multiple items at once
     public toItems(count: number): Item[] {
        return multiplyItem(this, count);
    }
}


// Helper function to create multiple items at once
export function createItems(itemClass: new () => ItemData, count: number): Item[] {
    const items: Item[] = [];
    const itemInstance = new itemClass();
    const itemData = itemInstance.toItem();
    
    for (let i = 0; i < count; i++) {
        items.push({ ...itemData }); // Use spread to create new object instances
    }
    
    return items;
}

// Alternative helper function using item instance
export function multiplyItem(itemData: ItemData, count: number): Item[] {
    const items: Item[] = [];
    const itemTemplate = itemData.toItem();
    
    for (let i = 0; i < count; i++) {
        items.push({ ...itemTemplate }); // Use spread to create new object instances
    }
    
    return items;
}


// Example item classes
export class Apple extends ItemData {
    readonly itemName = "苹果";
    readonly itemDescribe = "可食用的苹果";
    readonly itemLevel = ItemLevel.D;
}



// Main inventory management class
export class MainInventory {
    /**
     * Add item to player's main inventory
     * @param itemData The item data to add
     * @param count Number of items to add (default: 1)
     */
    public static addItem(itemData: ItemData, count: number = 1): void {
        // Get current inventory
        const currentItems = DeserializeItemsOnly(
            Unreal__.runtime.globalVars.PlayerInventory
        );
        
        // Add new items
        const newItem = itemData.toItem();
        for (let i = 0; i < count; i++) {
            currentItems.push(newItem);
        }
        
        // Update global inventory data
        Unreal__.runtime.globalVars.PlayerInventory = 
            SerializeItemsOnly(currentItems);
        
        console.log(`Added ${count}x ${itemData.itemName} to inventory`);
    }
    
    /**
     * Remove item from player's main inventory
     * @param itemData The item data to remove
     * @param count Number of items to remove (default: 1)
     */
    public static removeItem(itemData: ItemData, count: number = 1): void {
        // Get current inventory
        const currentItems = DeserializeItemsOnly(
            Unreal__.runtime.globalVars.PlayerInventory
        );
        
        // Remove items
        let removedCount = 0;
        for (let i = currentItems.length - 1; i >= 0 && removedCount < count; i--) {
            if (currentItems[i].itemName === itemData.itemName) {
                currentItems.splice(i, 1);
                removedCount++;
            }
        }
        
        // Update global inventory data
        Unreal__.runtime.globalVars.PlayerInventory = 
            SerializeItemsOnly(currentItems);
        
        console.log(`Removed ${removedCount}x ${itemData.itemName} from inventory`);
    }
    
    /**
     * Check if player has specific item
     * @param itemData The item data to check
     * @return Number of items in inventory
     */
    public static getItemCount(itemData: ItemData): number {
        const currentItems = DeserializeItemsOnly(
            Unreal__.runtime.globalVars.PlayerInventory
        );
        
        return currentItems.filter(item => item.itemName === itemData.itemName).length;
    }
    
    /**
     * Check if player has enough items
     * @param itemData The item data to check
     * @param requiredCount Required count
     * @return True if player has enough items
     */
    public static hasItem(itemData: ItemData, requiredCount: number = 1): boolean {
        return this.getItemCount(itemData) >= requiredCount;
    }
}

