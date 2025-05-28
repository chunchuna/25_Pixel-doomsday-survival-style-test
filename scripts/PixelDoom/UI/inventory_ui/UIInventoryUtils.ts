import type { Item, SerializedInventory, SerializedItem } from './UIInventoryTypes.js';
import { ItemLevel } from './UIInventoryTypes.js';

// 库存工具类
export class UIInventoryUtils {
    // 物品分组
    public static groupItems(items: Item[]): Map<string, Item[]> {
        const groupedItems = new Map<string, Item[]>();

        for (const item of items) {
            if (!groupedItems.has(item.itemName)) {
                groupedItems.set(item.itemName, []);
            }
            groupedItems.get(item.itemName)!.push(item);
        }

        return groupedItems;
    }

    // 将物品分组，每组最多maxPerGroup个
    public static splitIntoGroups<T>(items: T[], maxPerGroup: number): T[][] {
        const groups: T[][] = [];

        for (let i = 0; i < items.length; i += maxPerGroup) {
            groups.push(items.slice(i, i + maxPerGroup));
        }

        return groups;
    }

    // 序列化库存数据为字符串
    public static serializeInventory(inventoryArray: Item[], rows: number, columns: number): string {
        // 分组处理物品，统计数量
        const groupedItems = this.groupItems(inventoryArray);
        const serializedItems: SerializedItem[] = [];

        // 将分组后的物品转为序列化格式
        for (const [itemName, items] of groupedItems) {
            if (items.length > 0) {
                const item = items[0]; // 取第一个物品作为模板
                serializedItems.push({
                    name: item.itemName,
                    desc: item.itemDescribe,
                    level: item.itemLevel,
                    count: items.length
                });
            }
        }

        // 创建完整的序列化数据
        const data: SerializedInventory = {
            items: serializedItems,
            rows: rows,
            columns: columns
        };

        // 返回JSON字符串
        return JSON.stringify(data);
    }

    // 从字符串反序列化库存数据
    public static deserializeInventory(data: string): { inventory: Item[], rows: number, columns: number } {
        try {
            // 解析JSON数据
            const parsedData = JSON.parse(data) as SerializedInventory;
            const items: Item[] = [];

            // 重建物品数组
            for (const serializedItem of parsedData.items) {
                // 创建物品模板
                const item: Item = {
                    itemName: serializedItem.name,
                    itemDescribe: serializedItem.desc,
                    itemLevel: serializedItem.level as ItemLevel
                };

                // 按数量添加物品
                for (let i = 0; i < serializedItem.count; i++) {
                    // 创建物品的深拷贝，避免共享引用
                    items.push({ ...item });
                }
            }

            return {
                inventory: items,
                rows: parsedData.rows,
                columns: parsedData.columns
            };
        } catch (error) {
            console.error("反序列化库存数据失败:", error);
            return { inventory: [], rows: 4, columns: 6 }; // 默认值
        }
    }

    // 简化版序列化函数 - 仅序列化物品数组
    public static serializeItemsOnly(inventoryArray: Item[]): string {
        // 分组处理物品，统计数量
        const groupedItems = this.groupItems(inventoryArray);
        const serializedItems: SerializedItem[] = [];

        // 将分组后的物品转为序列化格式
        for (const [itemName, items] of groupedItems) {
            if (items.length > 0) {
                const item = items[0]; // 取第一个物品作为模板
                serializedItems.push({
                    name: item.itemName,
                    desc: item.itemDescribe,
                    level: item.itemLevel,
                    count: items.length
                });
            }
        }

        // 直接返回物品数组的JSON字符串
        return JSON.stringify(serializedItems);
    }

    // 简化版反序列化函数 - 仅处理物品数组
    public static deserializeItemsOnly(data: string): Item[] {
        try {
            // 解析JSON数据
            const serializedItems = JSON.parse(data) as SerializedItem[];
            const items: Item[] = [];

            // 重建物品数组
            for (const serializedItem of serializedItems) {
                // 创建物品模板
                const item: Item = {
                    itemName: serializedItem.name,
                    itemDescribe: serializedItem.desc,
                    itemLevel: serializedItem.level as ItemLevel
                };

                // 按数量添加物品
                for (let i = 0; i < serializedItem.count; i++) {
                    // 创建物品的深拷贝，避免共享引用
                    items.push({ ...item });
                }
            }

            return items;
        } catch (error) {
            console.error("反序列化物品数据失败:", error);
            return []; // 返回空数组
        }
    }

    // 根据品质排序物品
    public static sortItemsByQuality(items: { item: Item, count: number }[]): { item: Item, count: number }[] {
        // 根据品质排序（从高到低）
        return items.sort((a, b) => {
            const levelOrder = [
                ItemLevel.Top,
                ItemLevel.S,
                ItemLevel.APlus,
                ItemLevel.A,
                ItemLevel.B,
                ItemLevel.C,
                ItemLevel.D,
                ItemLevel.E,
                ItemLevel.Low,
                ItemLevel.Break
            ];

            const indexA = levelOrder.indexOf(a.item.itemLevel);
            const indexB = levelOrder.indexOf(b.item.itemLevel);

            // 先按品质排序
            if (indexA !== indexB) {
                return indexA - indexB;
            }

            // 品质相同，按名称排序
            return a.item.itemName.localeCompare(b.item.itemName);
        });
    }

    // 查找鼠标下方的格子
    public static findSlotUnderMouse(event: MouseEvent): { slotIndex: number | null, inventoryType: 'main' | 'other' | null } {
        const slots = document.querySelectorAll('.inventory-slot');

        // 添加容错距离（像素）
        const tolerance = 5;

        for (let i = 0; i < slots.length; i++) {
            const rect = slots[i].getBoundingClientRect();

            // 使用容错扩展区域检查
            if (
                event.clientX >= rect.left - tolerance &&
                event.clientX <= rect.right + tolerance &&
                event.clientY >= rect.top - tolerance &&
                event.clientY <= rect.bottom + tolerance
            ) {
                const slotIndex = parseInt(slots[i].getAttribute('data-slot-index') || '-1');
                const inventoryType = slots[i].getAttribute('data-inventory-type') as 'main' | 'other';

                return { slotIndex, inventoryType };
            }
        }

        // 如果没有找到匹配的格子，尝试找到最近的一个格子
        let closestSlot = null;
        let minDistance = Number.MAX_VALUE;

        for (let i = 0; i < slots.length; i++) {
            const rect = slots[i].getBoundingClientRect();

            // 计算鼠标与格子中心的距离
            const centerX = (rect.left + rect.right) / 2;
            const centerY = (rect.top + rect.bottom) / 2;
            const distance = Math.sqrt(
                Math.pow(event.clientX - centerX, 2) +
                Math.pow(event.clientY - centerY, 2)
            );

            // 如果距离在一定范围内(约30px)且比之前找到的更近
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                closestSlot = slots[i];
            }
        }

        // 如果找到了最近的格子
        if (closestSlot) {
            const slotIndex = parseInt(closestSlot.getAttribute('data-slot-index') || '-1');
            const inventoryType = closestSlot.getAttribute('data-inventory-type') as 'main' | 'other';

            return { slotIndex, inventoryType };
        }

        return { slotIndex: null, inventoryType: null };
    }

    // 清理DOM元素
    public static cleanupInventorySystem(): void {
        // 移除所有已添加的DOM元素
        const containers = document.querySelectorAll('.inventory-container, .item-description-panel, .dragged-item');
        containers.forEach(element => {
            element.parentNode?.removeChild(element);
        });
    }

    // 获取物品品质对应的CSS类名
    public static getQualityClassName(itemLevel: string): string {
        switch (itemLevel.toUpperCase()) {
            case 'TOP':
                return 'quality-top';
            case 'S':
                return 'quality-s';
            case 'A+':
                return 'quality-aplus';
            case 'A':
                return 'quality-a';
            case 'B':
                return 'quality-b';
            case 'C':
                return 'quality-c';
            case 'D':
                return 'quality-d';
            case 'E':
                return 'quality-e';
            case 'LOW':
                return 'quality-low';
            case 'BREAK':
                return 'quality-break';
            default:
                return '';
        }
    }

    // 应用品质效果到格子
    public static applyQualityEffect(slotElement: HTMLElement, itemLevel: string): void {
        // 先移除所有品质类
        this.removeQualityEffect(slotElement);
        
        // 添加新的品质类
        const qualityClass = this.getQualityClassName(itemLevel);
        if (qualityClass) {
            slotElement.classList.add(qualityClass);
        }
    }

    // 移除格子的品质效果
    public static removeQualityEffect(slotElement: HTMLElement): void {
        const qualityClasses = [
            'quality-top', 'quality-s', 'quality-aplus', 'quality-a', 
            'quality-b', 'quality-c', 'quality-d', 'quality-e', 
            'quality-low', 'quality-break'
        ];
        
        qualityClasses.forEach(className => {
            slotElement.classList.remove(className);
        });
    }

    // 更新所有格子的品质效果
    public static updateAllSlotQualityEffects(container: HTMLElement): void {
        const slots = container.querySelectorAll('.inventory-slot');
        
        slots.forEach(slot => {
            const slotElement = slot as HTMLElement;
            const itemElement = slotElement.querySelector('.inventory-item');
            
            if (itemElement) {
                // 有物品的格子，应用品质效果
                const itemLevel = itemElement.getAttribute('data-item-level');
                if (itemLevel) {
                    this.applyQualityEffect(slotElement, itemLevel);
                }
            } else {
                // 空格子，移除品质效果
                this.removeQualityEffect(slotElement);
            }
        });
    }
} 