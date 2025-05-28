import type { Item, SlotPosition } from './UIInventoryTypes.js';
import { UIInventoryUtils } from './UIInventoryUtils.js';
import { UIInventoryDrag } from './UIInventoryDrag.js';

// 渲染管理类
export class UIInventoryRender {
    // 创建库存容器
    public static createInventoryContainer(id: string): HTMLDivElement {
        const container = document.createElement('div');
        container.id = id;
        container.className = 'inventory-container';

        // 添加标题栏用于拖拽
        const dragHandle = document.createElement('div');
        dragHandle.className = 'inventory-drag-handle';

        // 添加鼠标按下事件以开始拖拽窗口
        dragHandle.addEventListener('mousedown', (e) => {
            // 只响应左键点击
            if (e.button === 0) {
                UIInventoryDrag.startWindowDrag(container, e);
                e.preventDefault(); // 防止选中文本
            }
        });

        container.appendChild(dragHandle);

        // 创建调整大小按钮
        const resizeButton = this.createResizeButton(container);
        container.appendChild(resizeButton);

        return container;
    }

    // 创建调整大小按钮
    private static createResizeButton(container: HTMLDivElement): HTMLButtonElement {
        const resizeButton = document.createElement('button');
        resizeButton.className = 'inventory-resize-button';
        resizeButton.innerHTML = `<div class="resize-icon">
            <span></span>
        </div>`;
        resizeButton.title = '拖拽调整窗口大小';

        // 添加鼠标按下事件以开始调整大小
        resizeButton.addEventListener('mousedown', (e) => {
            // 只响应左键点击
            if (e.button === 0) {
                UIInventoryDrag.startWindowResize(container, e);
                e.preventDefault(); // 防止选中文本
                e.stopPropagation(); // 阻止事件冒泡
            }
        });

        return resizeButton;
    }

    // 创建物品描述面板
    public static createItemDescriptionPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.className = 'item-description-panel';
        return panel;
    }

    // 通用渲染库存方法
    public static renderInventory(
        container: HTMLDivElement, 
        items: Item[], 
        rows: number, 
        columns: number, 
        isOtherInventory: boolean = false, 
        inventoryName?: string,
        slotPositions?: SlotPosition[],
        onSlotClick?: (item: Item, count: number, slotIndex: number, element: HTMLElement, event: MouseEvent, inventoryType: 'main' | 'other') => void,
        onQuickPickup?: (item: Item, count: number, slotIndex: number) => void
    ): SlotPosition[] {
        // 保存原有的滚动容器，以便稍后重用
        const existingScrollContainer = container.querySelector('.inventory-scroll-container') as HTMLElement;
        let savedScrollTop = 0;
        
        // 如果是主库存且在拖拽状态，保存滚动位置
        if (!isOtherInventory && UIInventoryDrag.getIsDragging() && existingScrollContainer) {
            savedScrollTop = existingScrollContainer.scrollTop;
        }
        
        // 清空容器，但保留拖拽句柄
        const dragHandle = container.querySelector('.inventory-drag-handle');
        container.innerHTML = '';
        if (dragHandle) {
            container.appendChild(dragHandle);
        }

        // 保留调整大小按钮
        const oldResizeButton = container.querySelector('.inventory-resize-button');
        if (oldResizeButton) {
            container.appendChild(oldResizeButton);
        } else {
            // 如果没有调整大小按钮，添加一个
            const resizeButton = this.createResizeButton(container);
            container.appendChild(resizeButton);
        }

        // 创建标题和按钮区域
        const headerDiv = this.createHeader(isOtherInventory, inventoryName);
        container.appendChild(headerDiv);

        // 创建库存网格
        const { gridContainer, resultSlotPositions } = this.createInventoryGrid(
            container, items, rows, columns, isOtherInventory, slotPositions, onSlotClick, onQuickPickup
        );

        // 添加滚动条容器
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'inventory-scroll-container';
        
        // 如果是主库存且在拖拽操作中，设置滚动行为为自动(避免平滑滚动动画)
        if (!isOtherInventory && UIInventoryDrag.getIsDragging()) {
            scrollContainer.style.scrollBehavior = 'auto';
        }
        
        scrollContainer.appendChild(gridContainer);
        container.appendChild(scrollContainer);
        
        // 如果是主库存且在拖拽状态，立即恢复滚动位置
        if (!isOtherInventory && UIInventoryDrag.getIsDragging()) {
            if (savedScrollTop > 0) {
                scrollContainer.scrollTop = savedScrollTop;
            }
        }

        // Update quality effects for all slots after rendering
        UIInventoryUtils.updateAllSlotQualityEffects(container);

        return resultSlotPositions;
    }

    // 创建头部区域
    private static createHeader(isOtherInventory: boolean, inventoryName?: string): HTMLDivElement {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'inventory-header';

        // 根据容器类型创建不同的标题和按钮
        if (!isOtherInventory) {
            const titleSpan = document.createElement('span');
            titleSpan.className = 'inventory-title';
            titleSpan.textContent = '我的';

            // 添加R键整理背包的提示文本
            const promptSpan = document.createElement('span');
            promptSpan.className = 'inventory-prompt';
            promptSpan.textContent = '[R]整理 [T]堆叠';

            headerDiv.appendChild(titleSpan);
            headerDiv.appendChild(promptSpan);
        } else {
            // 添加其他库存的标题
            const titleSpan = document.createElement('span');
            titleSpan.className = 'inventory-title';
            if (inventoryName) {
                titleSpan.textContent = inventoryName;
            } else {
                titleSpan.textContent = "正在查看其它库存";
            }

            // 创建ESC提示文本，放在header里
            const promptSpan = document.createElement('span');
            promptSpan.className = 'inventory-prompt';
            promptSpan.textContent = '[ESC]关闭';

            headerDiv.appendChild(titleSpan);
            headerDiv.appendChild(promptSpan);
        }

        return headerDiv;
    }

    // 创建库存网格
    private static createInventoryGrid(
        container: HTMLDivElement,
        items: Item[],
        rows: number,
        columns: number,
        isOtherInventory: boolean,
        slotPositions?: SlotPosition[],
        onSlotClick?: (item: Item, count: number, slotIndex: number, element: HTMLElement, event: MouseEvent, inventoryType: 'main' | 'other') => void,
        onQuickPickup?: (item: Item, count: number, slotIndex: number) => void
    ): { gridContainer: HTMLDivElement, resultSlotPositions: SlotPosition[] } {
        const gridContainer = document.createElement('div');
        gridContainer.className = 'inventory-grid';

        // 判断是否是单列模式
        const isOnelineMode = container.getAttribute('data-oneline-mode') === 'true';
                            
        // 明确设置固定的列数和间隔
        if (isOnelineMode) {
            gridContainer.style.gridTemplateColumns = `1fr`; // 单列模式
        } else {
            gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }
        gridContainer.style.gap = '5px'; // 设置格子之间的固定间隔

        // 计算需要多少个格子
        const totalSlots = rows * columns;
        let resultSlotPositions: SlotPosition[];

        if (slotPositions && slotPositions.length > 0) {
            // 如果传入了槽位数据，直接使用
            resultSlotPositions = slotPositions;
        } else {
            // 没有槽位数据时，创建新的槽位数据
            resultSlotPositions = this.createSlotPositions(items, totalSlots);
        }

        // 渲染格子
        for (let i = 0; i < totalSlots; i++) {
            const slotInfo = resultSlotPositions[i];
            let slot: HTMLDivElement;

            if (slotInfo.item !== null) {
                slot = this.createItemSlot(
                    [slotInfo.item], 
                    slotInfo.count, 
                    i, 
                    isOtherInventory ? 'other' : 'main',
                    onSlotClick,
                    onQuickPickup
                );
            } else {
                slot = this.createEmptySlot(i, isOtherInventory ? 'other' : 'main');
            }

            gridContainer.appendChild(slot);
        }

        return { gridContainer, resultSlotPositions };
    }

    // 创建槽位数据
    private static createSlotPositions(items: Item[], totalSlots: number): SlotPosition[] {
        const slotPositions: SlotPosition[] = [];
        
        // 初始化槽位
        for (let i = 0; i < totalSlots; i++) {
            slotPositions.push({
                index: i,
                item: null,
                count: 0
            });
        }

        // 分组物品，同名物品放在一起
        const groupedItems = UIInventoryUtils.groupItems(items);

        // 填充物品到槽位
        let slotIndex = 0;
        for (const [itemName, itemList] of groupedItems) {
            // 获取物品的最大堆叠数量
            const maxStack = itemList[0].maxStack || 64;
            
            // 根据最大堆叠数量分组
            const itemGroups = UIInventoryUtils.splitIntoGroups(itemList, maxStack);

            for (const group of itemGroups) {
                if (slotIndex < totalSlots) {
                    slotPositions[slotIndex].item = group[0];
                    slotPositions[slotIndex].count = group.length;
                    slotIndex++;
                } else {
                    console.warn('库存格子不足以显示所有物品');
                    break;
                }
            }
        }

        return slotPositions;
    }

    // 创建物品格子
    public static createItemSlot(
        items: Item[], 
        count: number, 
        slotIndex: number, 
        inventoryType: 'main' | 'other',
        onSlotClick?: (item: Item, count: number, slotIndex: number, element: HTMLElement, event: MouseEvent, inventoryType: 'main' | 'other') => void,
        onQuickPickup?: (item: Item, count: number, slotIndex: number) => void
    ): HTMLDivElement {
        if (items.length === 0) {
            return this.createEmptySlot(slotIndex, inventoryType);
        }

        const item = items[0]; // 同一组中所有物品都是相同的，所以取第一个

        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
        // 检查是否为单列模式，添加相应的类
        const isOnelineMode = slot.closest('.inventory-container')?.getAttribute('data-oneline-mode') === 'true';
        if (isOnelineMode) {
            slot.classList.add('oneline-slot');
        }
        
        slot.setAttribute('data-slot-index', slotIndex.toString());
        slot.setAttribute('data-inventory-type', inventoryType);

        // Apply quality effect to slot based on item level
        UIInventoryUtils.applyQualityEffect(slot, item.itemLevel);

        // 创建物品元素
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        if (isOnelineMode) {
            itemElement.classList.add('oneline-item');
        }
        itemElement.setAttribute('data-item-name', item.itemName);
        itemElement.setAttribute('data-item-level', item.itemLevel);
        itemElement.textContent = item.itemName;

        // 添加物品数量标签
        if (count > 1) {
            const countLabel = document.createElement('div');
            countLabel.className = 'item-count';
            if (isOnelineMode) {
                countLabel.classList.add('oneline-count');
            }
            countLabel.textContent = count.toString();
            itemElement.appendChild(countLabel);
        }

        // 添加鼠标悬停事件
        slot.addEventListener('mouseenter', () => {
            // 添加选中效果
            slot.classList.add('slot-highlight');
            itemElement.classList.add('selected');

            // 显示物品描述
            this.showItemDescription(item);
        });

        // 添加鼠标离开事件
        slot.addEventListener('mouseleave', () => {
            // 移除选中效果
            slot.classList.remove('slot-highlight');
            itemElement.classList.remove('selected');

            // 隐藏物品描述
            this.hideItemDescription();
        });

        // 添加鼠标按下事件（开始拖拽）
        slot.addEventListener('mousedown', (e) => {
            // 只响应左键点击
            if (e.button === 0 && onSlotClick) {
                onSlotClick(item, count, slotIndex, itemElement, e, inventoryType);
                e.preventDefault(); // 防止选中文本
            }
            // 添加右键点击快速拾取功能（仅对其他库存有效）
            else if (e.button === 2 && inventoryType === 'other' && onQuickPickup) {
                onQuickPickup(item, count, slotIndex);
                e.preventDefault(); // 防止默认的右键菜单
                e.stopPropagation(); // 阻止事件冒泡
            }
        });

        // 添加右键菜单阻止功能
        slot.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // 阻止默认的右键菜单
            return false;
        });

        slot.appendChild(itemElement);
        return slot;
    }

    // 创建空格子
    public static createEmptySlot(slotIndex: number, inventoryType: 'main' | 'other'): HTMLDivElement {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
        
        // 检查是否为单列模式，添加相应的类
        const isOnelineMode = slot.closest('.inventory-container')?.getAttribute('data-oneline-mode') === 'true';
        if (isOnelineMode) {
            slot.classList.add('oneline-slot');
        }
        
        slot.setAttribute('data-slot-index', slotIndex.toString());
        slot.setAttribute('data-inventory-type', inventoryType);

        // 添加鼠标悬停事件，即使是空格子也有高亮效果
        slot.addEventListener('mouseenter', () => {
            slot.classList.add('slot-highlight');
        });

        // 添加鼠标离开事件
        slot.addEventListener('mouseleave', () => {
            slot.classList.remove('slot-highlight');
        });

        return slot;
    }

    // 显示物品描述
    public static showItemDescription(item: Item): void {
        const panel = document.querySelector('.item-description-panel') as HTMLDivElement;
        if (!panel) return;

        panel.innerHTML = `
            <div class="item-name" data-level="${item.itemLevel}">${item.itemName}</div>
            <div class="item-level">等级: <span class="level-${item.itemLevel.toLowerCase()}">${item.itemLevel}</span></div>
            <div class="item-description">${item.itemDescribe}</div>
        `;

        panel.style.display = 'block';
    }

    // 隐藏物品描述
    public static hideItemDescription(): void {
        const panel = document.querySelector('.item-description-panel') as HTMLDivElement;
        if (panel) {
            panel.style.display = 'none';
        }
    }

    // 调整网格布局以适应窗口大小
    public static adjustGridBasedOnWindowSize(container: HTMLDivElement, rows: number, columns: number): void {
        // 找到对应的网格容器
        const gridContainer = container.querySelector('.inventory-grid') as HTMLDivElement;
        if (!gridContainer) {
            console.warn('无法找到网格容器');
            return;
        }

        // 判断是否是单列模式
        const isOnelineMode = container.getAttribute('data-oneline-mode') === 'true';
        
        // 获取当前的列数
        const currentColumns = isOnelineMode ? 1 : columns;

        // 获取窗口的宽度
        const containerWidth = container.clientWidth;

        // 计算可以放置的每个格子的大小（考虑固定间隔）
        // 减去左右内边距和格子间隔
        const availableWidth = containerWidth - 40; // 内边距
        const gapWidth = 5 * (currentColumns - 1); // 所有格子间隔的总宽度
        const slotSize = isOnelineMode ? availableWidth : Math.floor((availableWidth - gapWidth) / currentColumns); // 计算每个格子的大小

        // 首先更新网格容器的列宽定义，确保固定列数
        if (isOnelineMode) {
            gridContainer.style.gridTemplateColumns = `1fr`; // 单列模式下使用1fr
            gridContainer.setAttribute('data-oneline', 'true'); // 添加自定义属性标记单列模式
        } else {
            gridContainer.style.gridTemplateColumns = `repeat(${currentColumns}, ${slotSize}px)`;
            gridContainer.removeAttribute('data-oneline');
        }
        gridContainer.style.gap = '5px'; // 确保间隔一致

        // 更新每个格子的样式
        const slots = container.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            const slotElement = slot as HTMLElement;
            if (isOnelineMode) {
                // 单列模式下，格子是长条形的
                slotElement.style.width = `${availableWidth}px`; // 使用计算出的可用宽度
                slotElement.style.height = `30px`; // 降低高度为固定值
                slotElement.classList.add('oneline-slot');
                
                // 找到物品元素并添加单列样式
                const itemElement = slotElement.querySelector('.inventory-item');
                if (itemElement) {
                    itemElement.classList.add('oneline-item');
                    
                    // 找到数量标签并添加单列样式
                    const countLabel = itemElement.querySelector('.item-count');
                    if (countLabel) {
                        countLabel.classList.add('oneline-count');
                    }
                }
            } else {
                // 正常模式下，格子是正方形的
                slotElement.style.width = `${slotSize}px`;
                slotElement.style.height = `${slotSize}px`;
                slotElement.classList.remove('oneline-slot');
                
                // 找到物品元素并移除单列样式
                const itemElement = slotElement.querySelector('.inventory-item');
                if (itemElement) {
                    itemElement.classList.remove('oneline-item');
                    
                    // 找到数量标签并移除单列样式
                    const countLabel = itemElement.querySelector('.item-count');
                    if (countLabel) {
                        countLabel.classList.remove('oneline-count');
                    }
                }
            }
        });
    }

    // 显示通知
    public static showNotification(container: HTMLDivElement, message: string): void {
        const notification = document.createElement('div');
        notification.className = 'inventory-notification';
        notification.textContent = message;
        container.appendChild(notification);

        // 动画结束后移除提示
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 1500);
    }
} 