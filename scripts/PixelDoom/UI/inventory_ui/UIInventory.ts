// Main entry point for UIInventory system
// This file provides the public API and maintains compatibility with existing code

// Import all necessary types and classes
import type { Item, ItemLevel, InventoryUpdateCallback, SlotPosition, SerializedInventory, SerializedItem } from './UIInventoryTypes';
import { UIInventoryCore } from './UIInventoryCore.js';
import { UIInventoryStyles } from './UIInventoryStyles.js';
import { UIInventoryUtils } from './UIInventoryUtils.js';
import { UIInventoryDrag } from './UIInventoryDrag.js';
import { UIInventoryRender } from './UIInventoryRender.js';

// Re-export types for external use
export type { Item, InventoryUpdateCallback, SlotPosition, SerializedInventory, SerializedItem };
export { ItemLevel } from './UIInventoryTypes.js';

// Initialize styles when module is loaded
UIInventoryStyles.initStyles();

// Public API functions that maintain compatibility with the original UIInventory class

/**
 * Bind player main inventory
 * @param inventoryArray Array of items
 * @param rows Number of rows
 * @param columns Number of columns  
 * @param key Inventory key
 * @returns Object with unbind and oneline functions
 */
export function BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): { unbind: () => void, oneline: () => void } {
    const core = UIInventoryCore.getInstance();
    return core.BindPlayerMainInventory(inventoryArray, rows, columns, key);
}

/**
 * Show other inventory
 * @param inventoryArray Array of items
 * @param rows Number of rows
 * @param columns Number of columns
 * @param updateInfo Update callback information
 * @param InventoryName Name of the inventory
 * @returns Object with close and oneline functions
 */
export function ShowOtherInventory(
    inventoryArray: Item[],
    rows: number,
    columns: number,
    updateInfo?: InventoryUpdateCallback,
    InventoryName?: string
): { close: () => void, oneline: () => void } {
    const core = UIInventoryCore.getInstance();
    return core.ShowOtherInventory(inventoryArray, rows, columns, updateInfo, InventoryName);
}

/**
 * Serialize inventory to string
 * @param inventoryArray Array of items
 * @param rows Number of rows
 * @param columns Number of columns
 * @returns Serialized string
 */
export function SerializeInventory(inventoryArray: Item[], rows: number, columns: number): string {
    return UIInventoryUtils.serializeInventory(inventoryArray, rows, columns);
}

/**
 * Deserialize inventory from string
 * @param data Serialized string
 * @returns Deserialized inventory data
 */
export function DeserializeInventory(data: string): { inventory: Item[], rows: number, columns: number } {
    return UIInventoryUtils.deserializeInventory(data);
}

/**
 * Serialize items only to string
 * @param inventoryArray Array of items
 * @returns Serialized string
 */
export function SerializeItemsOnly(inventoryArray: Item[]): string {
    return UIInventoryUtils.serializeItemsOnly(inventoryArray);
}

/**
 * Deserialize items only from string
 * @param data Serialized string
 * @returns Array of items
 */
export function DeserializeItemsOnly(data: string): Item[] {
    return UIInventoryUtils.deserializeItemsOnly(data);
}

/**
 * Cleanup inventory system
 */
export function CleanupInventorySystem(): void {
    UIInventoryUtils.cleanupInventorySystem();
    const core = UIInventoryCore.getInstance();
    core.cleanup();
}

/**
 * Hide all inventories
 */
export function HideAllInventories(): void {
    const core = UIInventoryCore.getInstance();
    core.HideAllInventories();
}

/**
 * Enable or disable quick pickup
 * @param enable Whether to enable quick pickup
 */
export function EnableQuickPickup(enable: boolean): void {
    const core = UIInventoryCore.getInstance();
    core.IsQuickPickUpItem = enable;
}

/**
 * Check if quick pickup is enabled
 * @returns Whether quick pickup is enabled
 */
export function IsQuickPickupEnabled(): boolean {
    const core = UIInventoryCore.getInstance();
    return core.IsQuickPickUpItem;
}

/**
 * Set callback for main inventory open event
 * @param callback Callback function
 */
export function OnMainInventoryOpen(callback: () => void): void {
    const core = UIInventoryCore.getInstance();
    core.OnMainInventoryOpen(callback);
}

/**
 * Set callback for main inventory close event
 * @param callback Callback function
 */
export function OnMainInventoryClose(callback: () => void): void {
    const core = UIInventoryCore.getInstance();
    core.OnMainInventoryClose(callback);
}

/**
 * Set callback for other inventory open event
 * @param callback Callback function
 */
export function OnOtherInventoryOpen(callback: () => void): void {
    const core = UIInventoryCore.getInstance();
    core.OnOtherInventoryOpen(callback);
}

/**
 * Set callback for other inventory close event
 * @param callback Callback function
 */
export function OnOtherInventoryClose(callback: () => void): void {
    const core = UIInventoryCore.getInstance();
    core.OnOtherInventoryClose(callback);
}

/**
 * Set main inventory update callback
 * @param callback Update callback
 */
export function SetMainInventoryUpdateCallback(callback: { updateMethod: (items: Item[]) => void }): void {
    const core = UIInventoryCore.getInstance();
    core.SetMainInventoryUpdateCallback(callback);
}

/**
 * Toggle main inventory visibility
 */
export function ToggleMainInventory(): void {
    const core = UIInventoryCore.getInstance();
    core.toggleMainInventory();
}

/**
 * Check if main inventory is visible
 * @returns Whether main inventory is visible
 */
export function IsMainInventoryVisible(): boolean {
    const core = UIInventoryCore.getInstance();
    return core.IsMainInventoryVisible();
}

/**
 * Get other inventory instance
 * @returns Other inventory container element
 */
export function GetOtherInventoryInstance(): HTMLDivElement | null {
    const core = UIInventoryCore.getInstance();
    return core.GetOtherInventoryInstance();
}

// Export the core class for advanced usage
export { UIInventoryCore };

// Export utility classes for advanced usage
export { UIInventoryStyles, UIInventoryUtils, UIInventoryDrag, UIInventoryRender };

// Create inventoryManager object for backward compatibility
export const inventoryManager = {
    BindPlayerMainInventory,
    ShowOtherInventory,
    SerializeInventory,
    DeserializeInventory,
    SerializeItemsOnly,
    DeserializeItemsOnly,
    CleanupInventorySystem,
    HideAllInventories,
    EnableQuickPickup,
    IsQuickPickupEnabled,
    OnMainInventoryOpen,
    OnMainInventoryClose,
    OnOtherInventoryOpen,
    OnOtherInventoryClose,
    SetMainInventoryUpdateCallback,
    ToggleMainInventory,
    IsMainInventoryVisible,
    GetOtherInventoryInstance
};

// Default export for backward compatibility
export default {
    BindPlayerMainInventory,
    ShowOtherInventory,
    SerializeInventory,
    DeserializeInventory,
    SerializeItemsOnly,
    DeserializeItemsOnly,
    CleanupInventorySystem,
    HideAllInventories,
    EnableQuickPickup,
    IsQuickPickupEnabled,
    OnMainInventoryOpen,
    OnMainInventoryClose,
    OnOtherInventoryOpen,
    OnOtherInventoryClose,
    SetMainInventoryUpdateCallback,
    ToggleMainInventory,
    IsMainInventoryVisible,
    GetOtherInventoryInstance,
    UIInventoryCore,
    UIInventoryStyles,
    UIInventoryUtils,
    UIInventoryDrag,
    UIInventoryRender
};