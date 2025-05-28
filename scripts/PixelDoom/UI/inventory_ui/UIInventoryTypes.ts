// 物品等级枚举
export enum ItemLevel {
    Top = "TOP",
    S = "S",
    APlus = "A+",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    Low = "LOW",
    Break = "BREAK"
}

// 物品接口
export interface Item {
    itemName: string;
    itemDescribe: string;
    itemLevel: ItemLevel;
}

// 格子位置接口
export interface SlotPosition {
    index: number;
    item: Item | null;
    count: number;
}

// 库存数据接口（用于序列化）
export interface SerializedInventory {
    items: SerializedItem[];
    rows: number;
    columns: number;
}

// 序列化的物品接口
export interface SerializedItem {
    name: string;
    desc: string;
    level: string;
    count: number;
}

// 添加实例更新回调接口
export interface InventoryUpdateCallback {
    instance: any;
    varName?: string;
    updateMethod?: (instance: any, items: Item[]) => void;
}

// 拖拽物品信息接口
export interface DraggedItemInfo {
    element: HTMLElement;
    data: Item;
    count: number;
    sourceSlot: number;
    inventoryType: 'main' | 'other';
}

// 窗口拖拽位置信息接口
export interface WindowDragPosition {
    x: number;
    y: number;
    windowX: number;
    windowY: number;
}

// 窗口调整大小位置信息接口
export interface WindowResizePosition {
    x: number;
    y: number;
    windowWidth: number;
    windowHeight: number;
}

// 点击位置信息接口
export interface ClickPosition {
    x: number;
    y: number;
}

// 添加UIInventory接口声明，用于定义类型
export interface IUIInventory {
    // 公共属性
    IsQuickPickUpItem: boolean;
    closeOtherInventoryFunc: (() => any) | null;
    
    // 公共方法
    BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): { unbind: () => void, oneline: () => void };
    ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number, updateInfo?: InventoryUpdateCallback, InventoryName?: string): { close: () => void, oneline: () => void };
    HideAllInventories(): void;
    SetMainInventoryUpdateCallback(callback: { updateMethod: (items: Item[]) => void }): void;
    SerializeInventory(inventoryArray: Item[], rows: number, columns: number): string;
    DeserializeInventory(data: string): { inventory: Item[], rows: number, columns: number };
    SerializeItemsOnly(inventoryArray: Item[]): string;
    DeserializeItemsOnly(data: string): Item[];
} 