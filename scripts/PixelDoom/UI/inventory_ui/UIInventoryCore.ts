import type { Item, SlotPosition, InventoryUpdateCallback, IUIInventory } from './UIInventoryTypes.js';
import { UIInventoryStyles } from './UIInventoryStyles.js';
import { UIInventoryUtils } from './UIInventoryUtils.js';
import { UIInventoryDrag } from './UIInventoryDrag.js';
import { UIInventoryRender } from './UIInventoryRender.js';

// 库存UI管理类
export class UIInventoryCore implements IUIInventory {
    private static instance: UIInventoryCore;
    private mainInventoryContainer: HTMLDivElement;
    private otherInventoryContainer: HTMLDivElement;
    private itemDescriptionPanel: HTMLDivElement;
    private mainInventoryData: Item[] = [];
    private otherInventoryData: Item[] = [];
    private mainInventoryKey: string = '';
    private mainInventoryRows: number = 0;
    private mainInventoryColumns: number = 0;
    private otherInventoryRows: number = 0;
    private otherInventoryColumns: number = 0;
    private isMainInventoryVisible: boolean = false;
    private otherInventoryInstance: HTMLDivElement | null = null;
    private slotPositions: SlotPosition[] = []; // 存储每个格子的位置和物品信息
    private otherSlotPositions: SlotPosition[] = []; // 存储其他库存的格子位置和物品信息
    
    // 添加一个变量来存储原始库存数组的引用
    private originalInventoryArray: Item[] | null = null;
    // 添加一个变量来存储关闭其他库存的函数
    public closeOtherInventoryFunc: (() => any) | null = null;
    // 添加一个变量来存储更新回调
    private updateCallback: InventoryUpdateCallback | null = null;
    private mainInventoryCallback: ((items: Item[]) => void) | null = null;
    
    // 记录库存窗口拖拽后的位置    
    private MainInventoryWindowPosition: number[] = [0, 0]
    private OtherInventoryWindowPosition: number[] = [0, 0]
    // 添加记录窗口大小的变量
    private MainInventoryWindowSize: number[] = [0, 0] // [width, height]
    private OtherInventoryWindowSize: number[] = [0, 0] // [width, height]
    
    // 首先添加一个新的状态变量，用于标记是否正在处理物品拖拽
    private isHandlingItemDrag: boolean = false;
    
    // 添加单列模式标志
    private isMainInventoryOnelineMode: boolean = false;
    private isOtherInventoryOnelineMode: boolean = false;
    // 添加一个变量来记忆主库存的单列模式状态
    private shouldMainInventoryUseOnelineMode: boolean = false;
    // 添加一个Map来记忆每种其他库存的单列模式状态
    private otherInventoryTypeOnelineModes: Map<string, boolean> = new Map();
    private mainInventoryScrollPosition: number = 0;
    private otherInventoryScrollPosition: number = 0;
    
    // 添加快速拾取功能开关
    public IsQuickPickUpItem: boolean = true;

    // 添加四个回调函数属性，用于存储事件监听器
    private onMainInventoryOpenCallback: (() => void) | null = null;
    private onMainInventoryCloseCallback: (() => void) | null = null;
    private onOtherInventoryOpenCallback: (() => void) | null = null;
    private onOtherInventoryCloseCallback: (() => void) | null = null;

    private constructor() {
        UIInventoryStyles.initStyles();
        this.mainInventoryContainer = UIInventoryRender.createInventoryContainer('main-inventory');
        this.otherInventoryContainer = UIInventoryRender.createInventoryContainer('other-inventory');
        this.itemDescriptionPanel = UIInventoryRender.createItemDescriptionPanel();

        document.body.appendChild(this.mainInventoryContainer);
        document.body.appendChild(this.itemDescriptionPanel);

        this.mainInventoryContainer.style.display = 'none';
        this.itemDescriptionPanel.style.display = 'none';

        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        // 添加鼠标移动事件监听
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        // 添加鼠标抬起事件，用于放置拖拽物品
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    // 单例模式获取实例
    public static getInstance(): UIInventoryCore {
        if (!UIInventoryCore.instance) {
            UIInventoryCore.instance = new UIInventoryCore();
        }
        return UIInventoryCore.instance;
    }

    // 处理键盘按键
    private handleKeyPress(event: KeyboardEvent): void {
        if (event.key.toLowerCase() === this.mainInventoryKey.toLowerCase()) {
            this.toggleMainInventory();
        } else if (event.key.toLowerCase() === 'r' && this.isMainInventoryVisible) {
            // 按R键自动整理物品
            this.sortInventoryByQuality();
        } else if (event.key.toLowerCase() === 't' && this.isMainInventoryVisible) {
            // 按T键主动堆叠物品
            this.stackItems();
        } else if (event.key.toLowerCase() === 'escape') {
            // 按ESC键关闭库存
            this.handleEscapeKey();
        }
    }

    // 处理ESC键
    private handleEscapeKey(): void {
        // 优先关闭其他库存
        if (this.closeOtherInventoryFunc) {
            this.closeOtherInventoryFunc();
            return;
        }
        
        // 如果没有其他库存打开，关闭主库存
        if (this.isMainInventoryVisible) {
            this.toggleMainInventory();
        }
    }

    // 处理鼠标移动
    private handleMouseMove(event: MouseEvent): void {
        if (this.itemDescriptionPanel.style.display === 'block') {
            // 更新物品描述面板位置，使其跟随鼠标
            this.itemDescriptionPanel.style.left = `${event.clientX + 15}px`;
            this.itemDescriptionPanel.style.top = `${event.clientY + 15}px`;
        }

        // 处理物品拖拽
        UIInventoryDrag.updateDragGhost(event);

        // 处理窗口拖拽
        UIInventoryDrag.updateWindowDrag(event);

        // 处理窗口大小调整
        const resizeResult = UIInventoryDrag.updateWindowResize(event);
        if (resizeResult) {
            // 保存窗口大小信息
            const draggedWindow = UIInventoryDrag['resizedWindow']; // 访问私有属性需要特殊处理
            if (draggedWindow?.id === 'main-inventory') {
                this.MainInventoryWindowSize = [resizeResult.width, resizeResult.height];
            } else if (draggedWindow?.id === 'other-inventory') {
                this.OtherInventoryWindowSize = [resizeResult.width, resizeResult.height];
            }

            // 自动调整网格容器
            if (draggedWindow) {
                this.adjustGridBasedOnWindowSize(draggedWindow);
            }
        }
    }

    // 处理鼠标抬起事件
    private handleMouseUp(event: MouseEvent): void {
        // 处理窗口拖拽结束
        const windowPosition = UIInventoryDrag.endWindowDrag();
        if (windowPosition) {
            // 根据窗口的类别分别记录位置
            const draggedWindow = UIInventoryDrag['draggedWindow']; // 需要访问私有属性
            if (draggedWindow?.id === 'main-inventory') {
                this.MainInventoryWindowPosition = [windowPosition.left, windowPosition.top];
            } else if (draggedWindow?.id === 'other-inventory') {
                this.OtherInventoryWindowPosition = [windowPosition.left, windowPosition.top];
            }
            return;
        }

        // 处理窗口大小调整结束
        const windowSize = UIInventoryDrag.endWindowResize();
        if (windowSize) {
            return;
        }
    }

    // 序列化库存数据为字符串
    public SerializeInventory(inventoryArray: Item[], rows: number, columns: number): string {
        return UIInventoryUtils.serializeInventory(inventoryArray, rows, columns);
    }

    // 从字符串反序列化库存数据
    public DeserializeInventory(data: string): { inventory: Item[], rows: number, columns: number } {
        return UIInventoryUtils.deserializeInventory(data);
    }

    // 简化版序列化函数 - 仅序列化物品数组
    public SerializeItemsOnly(inventoryArray: Item[]): string {
        return UIInventoryUtils.serializeItemsOnly(inventoryArray);
    }

    // 简化版反序列化函数 - 仅处理物品数组
    public DeserializeItemsOnly(data: string): Item[] {
        return UIInventoryUtils.deserializeItemsOnly(data);
    }

    // 新增方法：为主库存设置更新回调
    public SetMainInventoryUpdateCallback(callback: { updateMethod: (items: Item[]) => void }): void {
        this.mainInventoryCallback = callback.updateMethod;
    }

    // 添加触发主库存回调的辅助方法
    private triggerMainInventoryCallback(): void {
        if (this.mainInventoryCallback) {
            // 从格子数据中提取所有物品
            const items: Item[] = [];
            for (const slot of this.slotPositions) {
                if (slot.item) {
                    // 根据数量添加物品
                    for (let i = 0; i < slot.count; i++) {
                        items.push({ ...slot.item });
                    }
                }
            }
            // 触发回调函数
            this.mainInventoryCallback(items);
        }
    }

    // 在UIInventory类中添加新方法
    public HideAllInventories(): void {
        // 隐藏主库存
        if (this.isMainInventoryVisible) {
            this.toggleMainInventory();
        }
        
        // 关闭其他库存(如果存在)
        if (this.closeOtherInventoryFunc) {
            this.closeOtherInventoryFunc();
            // 确保引用被清除
            this.closeOtherInventoryFunc = null;
        }
        
        // 隐藏物品描述面板
        UIInventoryRender.hideItemDescription();
        
        // 清理任何拖拽中的物品
        UIInventoryDrag.cleanupAll();
    }

    // 添加主库存打开事件监听方法
    public OnMainInventoryOpen(callback: () => void): void {
        this.onMainInventoryOpenCallback = callback;
    }

    // 添加主库存关闭事件监听方法
    public OnMainInventoryClose(callback: () => void): void {
        this.onMainInventoryCloseCallback = callback;
    }

    // 添加其他库存打开事件监听方法
    public OnOtherInventoryOpen(callback: () => void): void {
        this.onOtherInventoryOpenCallback = callback;
    }

    // 添加其他库存关闭事件监听方法
    public OnOtherInventoryClose(callback: () => void): void {
        this.onOtherInventoryCloseCallback = callback;
    }

    // 调整网格布局以适应窗口大小的包装方法
    private adjustGridBasedOnWindowSize(container: HTMLDivElement): void {
        if (container.id === 'main-inventory') {
            UIInventoryRender.adjustGridBasedOnWindowSize(container, this.mainInventoryRows, this.mainInventoryColumns);
        } else if (container.id === 'other-inventory') {
            UIInventoryRender.adjustGridBasedOnWindowSize(container, this.otherInventoryRows, this.otherInventoryColumns);
        }
    }

    // 根据品质排序库存
    private sortInventoryByQuality(): void {
        // 获取所有已放置的物品
        let itemsToSort: { item: Item, count: number }[] = [];

        // 从格子位置收集所有物品
        for (const slot of this.slotPositions) {
            if (slot.item !== null) {
                itemsToSort.push({
                    item: slot.item,
                    count: slot.count
                });
                // 清空原始格子
                slot.item = null;
                slot.count = 0;
            }
        }

        // 使用工具类排序
        itemsToSort = UIInventoryUtils.sortItemsByQuality(itemsToSort);

        // 重新放置排序后的物品
        let slotIndex = 0;
        for (const itemData of itemsToSort) {
            if (slotIndex < this.slotPositions.length) {
                this.slotPositions[slotIndex].item = itemData.item;
                this.slotPositions[slotIndex].count = itemData.count;
                slotIndex++;
            }
        }

        // 重新渲染库存
        this.renderMainInventory();

        // 触发主库存更新回调
        this.triggerMainInventoryCallback();

        // 添加整理完成的提示效果
        UIInventoryRender.showNotification(this.mainInventoryContainer, '整理完成');
    }

    // 主动堆叠物品
    private stackItems(): void {
        let hasChanges = false;
        
        // 遍历所有格子，寻找可以堆叠的物品
        for (let i = 0; i < this.slotPositions.length; i++) {
            const sourceSlot = this.slotPositions[i];
            if (!sourceSlot.item || sourceSlot.count <= 0) continue;
            
            const maxStack = sourceSlot.item.maxStack || 64;
            if (sourceSlot.count >= maxStack) continue; // 已经满堆叠，跳过
            
            // 寻找相同物品的其他格子进行合并
            for (let j = i + 1; j < this.slotPositions.length; j++) {
                const targetSlot = this.slotPositions[j];
                if (!targetSlot.item || targetSlot.count <= 0) continue;
                
                // 如果是相同物品，尝试合并
                if (sourceSlot.item.itemName === targetSlot.item.itemName) {
                    const canAdd = maxStack - sourceSlot.count;
                    if (canAdd > 0) {
                        const addCount = Math.min(canAdd, targetSlot.count);
                        sourceSlot.count += addCount;
                        targetSlot.count -= addCount;
                        
                        // 如果目标格子空了，清空它
                        if (targetSlot.count <= 0) {
                            targetSlot.item = null;
                            targetSlot.count = 0;
                        }
                        
                        hasChanges = true;
                        
                        // 如果源格子已满，停止合并
                        if (sourceSlot.count >= maxStack) {
                            break;
                        }
                    }
                }
            }
        }
        
        if (hasChanges) {
            // 重新渲染库存
            this.renderMainInventory();
            
            // 触发主库存更新回调
            this.triggerMainInventoryCallback();
            
            // 添加堆叠完成的提示效果
            UIInventoryRender.showNotification(this.mainInventoryContainer, '堆叠完成');
        } else {
            // 没有可堆叠的物品
            UIInventoryRender.showNotification(this.mainInventoryContainer, '没有可堆叠的物品');
        }
    }

    // 渲染主库存的包装方法
    private renderMainInventory(): void {
        // 保存是否处于拖拽状态的标志
        const wasHandlingDrag = this.isHandlingItemDrag;
        
        // 保存当前滚动位置
        let mainScrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
        if (mainScrollContainer) {
            this.mainInventoryScrollPosition = mainScrollContainer.scrollTop;
        }
        
        if (wasHandlingDrag && mainScrollContainer) {
            // 禁用滚动条过渡动画
            mainScrollContainer.style.scrollBehavior = 'auto';
        }
        
        // 使用渲染类进行渲染
        this.slotPositions = UIInventoryRender.renderInventory(
            this.mainInventoryContainer,
            this.mainInventoryData,
            this.mainInventoryRows,
            this.mainInventoryColumns,
            false, // 不是其他库存
            undefined, // 没有库存名称
            this.slotPositions, // 传入现有槽位数据
            this.handleSlotClick.bind(this), // 槽位点击处理
            undefined // 主库存不需要快速拾取
        );
        
        // 恢复拖拽状态标志
        this.isHandlingItemDrag = wasHandlingDrag;
        
        // 在拖拽操作中，立即恢复滚动位置，不使用延时
        if (wasHandlingDrag) {
            mainScrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
            if (mainScrollContainer && this.mainInventoryScrollPosition > 0) {
                // 立即恢复滚动位置，不使用动画
                mainScrollContainer.style.scrollBehavior = 'auto';
                mainScrollContainer.scrollTop = this.mainInventoryScrollPosition;
                
                // 确保网格容器渲染正确，使用requestAnimationFrame
                requestAnimationFrame(() => {
                    this.adjustGridBasedOnWindowSize(this.mainInventoryContainer);
                });
            }
        }
    }

    // 处理槽位点击事件
    private handleSlotClick(item: Item, count: number, slotIndex: number, element: HTMLElement, event: MouseEvent, inventoryType: 'main' | 'other'): void {
        // 设置正在处理物品拖拽的标记
        this.isHandlingItemDrag = true;

        UIInventoryDrag.startDrag(item, count, slotIndex, element, event, inventoryType, (targetInfo) => {
            this.handleDragEnd(targetInfo, slotIndex, inventoryType);
        });
    }

    // 处理拖拽结束事件
    private handleDragEnd(targetInfo: { slotIndex: number | null, inventoryType: 'main' | 'other' | null }, sourceSlot: number, sourceInventoryType: 'main' | 'other'): void {
        const draggedItem = UIInventoryDrag.getDraggedItem();
        if (!draggedItem) {
            this.isHandlingItemDrag = false;
            return;
        }

        if (targetInfo && targetInfo.slotIndex !== null) {
            // 检查是否拖回原来的格子（来源格子与目标格子相同）
            if (targetInfo.inventoryType === sourceInventoryType && targetInfo.slotIndex === sourceSlot) {
                // 拖回原位置，不需要任何操作，只需重新渲染以确保物品显示正确
                console.log("Item returned to original position");
                if (sourceInventoryType === 'main') {
                    this.renderMainInventory();
                    // Update quality effects after returning to original position
                    UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
                } else {
                    this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                    // Update quality effects after returning to original position
                    if (this.otherInventoryInstance) {
                        UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
                    }
                }

                // 添加回弹动画效果
                if (draggedItem.element) {
                    draggedItem.element.classList.add('slot-bounce');
                    setTimeout(() => {
                        const elements = document.querySelectorAll('.inventory-item.slot-bounce');
                        elements.forEach(el => el.classList.remove('slot-bounce'));
                    }, 300);
                }
            }
            // 同一库存内的物品交换
            else if (targetInfo.inventoryType === sourceInventoryType) {
                // 处理主库存的拖拽
                if (sourceInventoryType === 'main') {
                    this.handleMainInventoryDrop(targetInfo.slotIndex);
                }
                // 处理其他库存的拖拽
                else if (sourceInventoryType === 'other') {
                    this.handleOtherInventoryDrop(targetInfo.slotIndex);
                }
            }
            // 从主库存到其他库存
            else if (sourceInventoryType === 'main' && targetInfo.inventoryType === 'other') {
                this.handleItemTransfer('main-to-other', sourceSlot, targetInfo.slotIndex);
            }
            // 从其他库存到主库存
            else if (sourceInventoryType === 'other' && targetInfo.inventoryType === 'main') {
                this.handleItemTransfer('other-to-main', sourceSlot, targetInfo.slotIndex);
            }
        } else {
            // 未找到目标格子，物品回到原位置
            console.log("Item returned to original position");
            // 检查是主库存还是其他库存
            if (sourceInventoryType === 'main') {
                // 主库存不需要做任何事情，物品已经在原位置
                this.renderMainInventory(); // 重新渲染确保显示正确
                // Update quality effects after returning to original position
                UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
            } else if (sourceInventoryType === 'other') {
                // 其他库存不需要做任何事情，物品已经在原位置
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                // Update quality effects after returning to original position
                if (this.otherInventoryInstance) {
                    UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
                }
            }

            // 添加回弹动画效果
            if (draggedItem.element) {
                draggedItem.element.classList.add('slot-bounce');
                setTimeout(() => {
                    const elements = document.querySelectorAll('.inventory-item.slot-bounce');
                    elements.forEach(el => el.classList.remove('slot-bounce'));
                }, 300);
            }
        }

        // 处理完毕后清除标记
        this.isHandlingItemDrag = false;
    }

    // 处理主库存内的物品拖拽
    private handleMainInventoryDrop(targetSlotIndex: number): void {
        const draggedItem = UIInventoryDrag.getDraggedItem();
        if (!draggedItem) return;

        const sourceSlotIndex = draggedItem.sourceSlot;
        const targetSlot = this.slotPositions[targetSlotIndex];
        const sourceSlot = this.slotPositions[sourceSlotIndex];

        // 如果目标格子为空，直接移动物品
        if (!targetSlot.item) {
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = null;
            sourceSlot.count = 0;
        }
        // 如果目标格子有相同物品，尝试合并
        else if (targetSlot.item.itemName === sourceSlot.item?.itemName) {
            const totalCount = targetSlot.count + sourceSlot.count;
            const maxStack = targetSlot.item.maxStack || 64; // 默认最大堆叠数量为64
            
            if (totalCount <= maxStack) {
                // 可以完全合并
                targetSlot.count = totalCount;
                sourceSlot.item = null;
                sourceSlot.count = 0;
            } else {
                // 部分合并
                targetSlot.count = maxStack;
                sourceSlot.count = totalCount - maxStack;
            }
        }
        // 如果目标格子有不同物品，交换位置
        else {
            const tempItem = targetSlot.item;
            const tempCount = targetSlot.count;
            
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = tempItem;
            sourceSlot.count = tempCount;
        }

        this.renderMainInventory();
        this.triggerMainInventoryCallback();
        
        // Update quality effects after item movement
        UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
    }

    // 处理其他库存内的物品拖拽
    private handleOtherInventoryDrop(targetSlotIndex: number): void {
        const draggedItem = UIInventoryDrag.getDraggedItem();
        if (!draggedItem) return;

        // 获取其他库存的格子位置数据
        const otherSlotPositions = this.getOtherInventorySlotPositions();
        if (!otherSlotPositions) return;

        const sourceSlotIndex = draggedItem.sourceSlot;
        const targetSlot = otherSlotPositions[targetSlotIndex];
        const sourceSlot = otherSlotPositions[sourceSlotIndex];

        // 如果目标格子为空，直接移动物品
        if (!targetSlot.item) {
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = null;
            sourceSlot.count = 0;
        }
        // 如果目标格子有相同物品，尝试合并
        else if (targetSlot.item.itemName === sourceSlot.item?.itemName) {
            const totalCount = targetSlot.count + sourceSlot.count;
            const maxStack = targetSlot.item.maxStack || 64; // 默认最大堆叠数量为64
            
            if (totalCount <= maxStack) {
                // 可以完全合并
                targetSlot.count = totalCount;
                sourceSlot.item = null;
                sourceSlot.count = 0;
            } else {
                // 部分合并
                targetSlot.count = maxStack;
                sourceSlot.count = totalCount - maxStack;
            }
        }
        // 如果目标格子有不同物品，交换位置
        else {
            const tempItem = targetSlot.item;
            const tempCount = targetSlot.count;
            
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = tempItem;
            sourceSlot.count = tempCount;
        }

        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
        this.updateOriginalInventoryArray();
        
        // Update quality effects after item movement
        if (this.otherInventoryInstance) {
            UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
        }
    }

    // 处理物品在不同库存间的传输
    private handleItemTransfer(direction: 'main-to-other' | 'other-to-main', sourceSlotIndex: number, targetSlotIndex: number): void {
        const draggedItem = UIInventoryDrag.getDraggedItem();
        if (!draggedItem) return;

        if (direction === 'main-to-other') {
            this.transferFromMainToOther(sourceSlotIndex, targetSlotIndex);
        } else {
            this.transferFromOtherToMain(sourceSlotIndex, targetSlotIndex);
        }
    }

    // 从主库存转移到其他库存
    private transferFromMainToOther(sourceSlotIndex: number, targetSlotIndex: number): void {
        const otherSlotPositions = this.getOtherInventorySlotPositions();
        if (!otherSlotPositions) return;

        const sourceSlot = this.slotPositions[sourceSlotIndex];
        const targetSlot = otherSlotPositions[targetSlotIndex];

        if (!sourceSlot.item) return;

        // 如果目标格子为空，直接移动物品
        if (!targetSlot.item) {
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = null;
            sourceSlot.count = 0;
        }
        // 如果目标格子有相同物品，尝试合并
        else if (targetSlot.item.itemName === sourceSlot.item.itemName) {
            const totalCount = targetSlot.count + sourceSlot.count;
            const maxStack = targetSlot.item.maxStack || 64; // 默认最大堆叠数量为64
            
            if (totalCount <= maxStack) {
                // 可以完全合并
                targetSlot.count = totalCount;
                sourceSlot.item = null;
                sourceSlot.count = 0;
            } else {
                // 部分合并
                targetSlot.count = maxStack;
                sourceSlot.count = totalCount - maxStack;
            }
        }
        // 如果目标格子有不同物品，交换位置
        else {
            const tempItem = targetSlot.item;
            const tempCount = targetSlot.count;
            
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = tempItem;
            sourceSlot.count = tempCount;
        }

        this.renderMainInventory();
        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
        this.triggerMainInventoryCallback();
        this.updateOriginalInventoryArray();
        
        // Update quality effects after item transfer
        UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
        if (this.otherInventoryInstance) {
            UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
        }
    }

    // 从其他库存转移到主库存
    private transferFromOtherToMain(sourceSlotIndex: number, targetSlotIndex: number): void {
        const otherSlotPositions = this.getOtherInventorySlotPositions();
        if (!otherSlotPositions) return;

        const sourceSlot = otherSlotPositions[sourceSlotIndex];
        const targetSlot = this.slotPositions[targetSlotIndex];

        if (!sourceSlot.item) return;

        // 如果目标格子为空，直接移动物品
        if (!targetSlot.item) {
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = null;
            sourceSlot.count = 0;
        }
        // 如果目标格子有相同物品，尝试合并
        else if (targetSlot.item.itemName === sourceSlot.item.itemName) {
            const totalCount = targetSlot.count + sourceSlot.count;
            const maxStack = targetSlot.item.maxStack || 64; // 默认最大堆叠数量为64
            
            if (totalCount <= maxStack) {
                // 可以完全合并
                targetSlot.count = totalCount;
                sourceSlot.item = null;
                sourceSlot.count = 0;
            } else {
                // 部分合并
                targetSlot.count = maxStack;
                sourceSlot.count = totalCount - maxStack;
            }
        }
        // 如果目标格子有不同物品，交换位置
        else {
            const tempItem = targetSlot.item;
            const tempCount = targetSlot.count;
            
            targetSlot.item = sourceSlot.item;
            targetSlot.count = sourceSlot.count;
            sourceSlot.item = tempItem;
            sourceSlot.count = tempCount;
        }

        this.renderMainInventory();
        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
        this.triggerMainInventoryCallback();
        this.updateOriginalInventoryArray();
        
        // Update quality effects after item transfer
        UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
        if (this.otherInventoryInstance) {
            UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
        }
    }

    // 获取其他库存的格子位置数据
    private getOtherInventorySlotPositions(): SlotPosition[] | null {
        // 直接返回存储的其他库存槽位数据
        return this.otherSlotPositions.length > 0 ? this.otherSlotPositions : null;
    }

    // 更新原始库存数组
    private updateOriginalInventoryArray(): void {
        if (this.originalInventoryArray && this.updateCallback) {
            // 清空原始数组
            this.originalInventoryArray.length = 0;
            
            // 重新填充数组
            for (const slot of this.otherSlotPositions) {
                if (slot.item) {
                    for (let i = 0; i < slot.count; i++) {
                        this.originalInventoryArray.push({ ...slot.item });
                    }
                }
            }
        }

        // 触发更新回调
        if (this.updateCallback && this.originalInventoryArray) {
            if (this.updateCallback.updateMethod) {
                // 如果有自定义更新方法，使用它
                this.updateCallback.updateMethod(this.updateCallback.instance, this.originalInventoryArray);
            } else if (this.updateCallback.instance && this.updateCallback.varName) {
                // 否则使用默认的序列化更新方式
                const serializedData = UIInventoryUtils.serializeItemsOnly(this.originalInventoryArray);
                this.updateCallback.instance.instVars[this.updateCallback.varName] = serializedData;
            }
        }
    }

    // 渲染其他库存
    private renderOtherInventory(rows: number, columns: number): void {
        // 保存当前滚动位置
        let otherScrollContainer = this.otherInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
        if (otherScrollContainer) {
            this.otherInventoryScrollPosition = otherScrollContainer.scrollTop;
        }

        // 使用渲染类进行渲染
        this.otherSlotPositions = UIInventoryRender.renderInventory(
            this.otherInventoryContainer,
            this.otherInventoryData,
            rows,
            columns,
            true, // 是其他库存
            undefined, // 库存名称
            this.otherSlotPositions.length > 0 ? this.otherSlotPositions : undefined, // 传入现有槽位数据
            this.handleSlotClick.bind(this), // 槽位点击处理
            this.IsQuickPickUpItem ? this.handleQuickPickup.bind(this) : undefined // 快速拾取处理
        );

        // 恢复滚动位置
        setTimeout(() => {
            otherScrollContainer = this.otherInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
            if (otherScrollContainer && this.otherInventoryScrollPosition > 0) {
                otherScrollContainer.scrollTop = this.otherInventoryScrollPosition;
            }
        }, 0);
    }

    // 处理快速拾取
    private handleQuickPickup(item: Item, count: number, slotIndex: number): void {
        // 检查槽位索引是否有效
        if (slotIndex < 0 || slotIndex >= this.otherSlotPositions.length) {
            console.warn('Invalid slot index for quick pickup:', slotIndex);
            return;
        }

        const sourceSlot = this.otherSlotPositions[slotIndex];
        if (!sourceSlot.item || sourceSlot.count <= 0) {
            console.warn('No item in slot for quick pickup:', slotIndex);
            return;
        }

        // 使用槽位中的实际数量，而不是传入的count参数
        const actualCount = sourceSlot.count;
        const actualItem = sourceSlot.item;

        // 尝试将物品添加到主库存
        const success = this.addItemToMainInventory(actualItem, actualCount);
        
        if (success) {
            // 从其他库存中移除物品
            sourceSlot.item = null;
            sourceSlot.count = 0;

            // 重新渲染两个库存
            this.renderMainInventory();
            this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
            
            // 更新回调
            this.triggerMainInventoryCallback();
            this.updateOriginalInventoryArray();

            // Update quality effects after quick pickup
            UIInventoryUtils.updateAllSlotQualityEffects(this.mainInventoryContainer);
            if (this.otherInventoryInstance) {
                UIInventoryUtils.updateAllSlotQualityEffects(this.otherInventoryInstance);
            }

            // 显示拾取提示
            UIInventoryRender.showNotification(this.mainInventoryContainer, `Picked up ${actualItem.itemName} x${actualCount}`);
        } else {
            // 显示库存已满提示
            UIInventoryRender.showNotification(this.mainInventoryContainer, 'Inventory full');
        }
    }

    // 向主库存添加物品
    private addItemToMainInventory(item: Item, count: number): boolean {
        let remainingCount = count;

        // 首先尝试合并到现有的相同物品格子
        for (const slot of this.slotPositions) {
            if (slot.item && slot.item.itemName === item.itemName) {
                const maxStack = slot.item.maxStack || 64; // 默认最大堆叠数量为64
                const canAdd = maxStack - slot.count;
                
                if (canAdd > 0) {
                    const addCount = Math.min(canAdd, remainingCount);
                    slot.count += addCount;
                    remainingCount -= addCount;
                    
                    if (remainingCount <= 0) {
                        return true;
                    }
                }
            }
        }

        // 然后尝试放入空格子
        for (const slot of this.slotPositions) {
            if (!slot.item && remainingCount > 0) {
                const maxStack = item.maxStack || 64; // 默认最大堆叠数量为64
                const addCount = Math.min(maxStack, remainingCount);
                
                slot.item = { ...item };
                slot.count = addCount;
                remainingCount -= addCount;
                
                if (remainingCount <= 0) {
                    return true;
                }
            }
        }

        // 如果还有剩余物品，说明库存已满
        return remainingCount <= 0;
    }

    // 切换主库存显示状态
    public toggleMainInventory(): void {
        this.isMainInventoryVisible = !this.isMainInventoryVisible;
        
        if (this.isMainInventoryVisible) {
            this.mainInventoryContainer.style.display = 'block';
            this.mainInventoryContainer.style.opacity = '1';
            this.mainInventoryContainer.classList.add('inventory-open');
            this.mainInventoryContainer.classList.remove('inventory-close');
            
            // 渲染主库存内容
            this.renderMainInventory();
            
            // 恢复窗口位置和大小
            if (this.MainInventoryWindowPosition[0] !== 0 || this.MainInventoryWindowPosition[1] !== 0) {
                this.mainInventoryContainer.style.left = `${this.MainInventoryWindowPosition[0]}px`;
                this.mainInventoryContainer.style.top = `${this.MainInventoryWindowPosition[1]}px`;
            }
            
            if (this.MainInventoryWindowSize[0] !== 0 || this.MainInventoryWindowSize[1] !== 0) {
                this.mainInventoryContainer.style.width = `${this.MainInventoryWindowSize[0]}px`;
                this.mainInventoryContainer.style.height = `${this.MainInventoryWindowSize[1]}px`;
            }

            // 触发打开回调
            if (this.onMainInventoryOpenCallback) {
                this.onMainInventoryOpenCallback();
            }
        } else {
            this.mainInventoryContainer.classList.add('inventory-close');
            this.mainInventoryContainer.classList.remove('inventory-open');
            
            // 等待动画完成后隐藏
            setTimeout(() => {
                this.mainInventoryContainer.style.display = 'none';
                this.mainInventoryContainer.style.opacity = '0';
            }, 200);
            
            // 触发关闭回调
            if (this.onMainInventoryCloseCallback) {
                this.onMainInventoryCloseCallback();
            }
        }
    }

    // 设置主库存
    public SetMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): void {
        this.mainInventoryData = inventoryArray;
        this.mainInventoryRows = rows;
        this.mainInventoryColumns = columns;
        this.mainInventoryKey = key;

        // 初始化格子位置数据
        this.slotPositions = this.createSlotPositions(inventoryArray, rows * columns);

        // 如果库存当前可见，重新渲染
        if (this.isMainInventoryVisible) {
            this.renderMainInventory();
        }
    }

    // 创建格子位置数据
    private createSlotPositions(items: Item[], totalSlots: number): SlotPosition[] {
        const positions: SlotPosition[] = [];
        
        // 初始化所有格子为空
        for (let i = 0; i < totalSlots; i++) {
            positions.push({
                index: i,
                item: null,
                count: 0
            });
        }
        
        // 分组物品，同名物品放在一起
        const itemGroups = UIInventoryUtils.groupItems(items);
        
        // 填充物品数据
        let currentSlot = 0;
        for (const [itemName, itemList] of itemGroups) {
            if (currentSlot >= totalSlots) break;
            
            // 获取物品的最大堆叠数量
            const maxStack = itemList[0].maxStack || 64;
            
            // 根据最大堆叠数量分组
            const stackGroups = UIInventoryUtils.splitIntoGroups(itemList, maxStack);
            
            for (const group of stackGroups) {
                if (currentSlot < totalSlots) {
                    positions[currentSlot] = {
                        index: currentSlot,
                        item: group[0],
                        count: group.length
                    };
                    currentSlot++;
                } else {
                    console.warn('库存格子不足以显示所有物品');
                    break;
                }
            }
        }
        
        return positions;
    }

    // 显示其他库存的内部方法
    private showOtherInventoryInternal(inventoryArray: Item[], rows: number, columns: number, inventoryName?: string, updateCallback?: InventoryUpdateCallback): HTMLDivElement {
        this.otherInventoryData = inventoryArray;
        this.otherInventoryRows = rows;
        this.otherInventoryColumns = columns;
        this.originalInventoryArray = inventoryArray;
        this.updateCallback = updateCallback || null;

        // 初始化其他库存的槽位数据
        this.otherSlotPositions = this.createSlotPositions(inventoryArray, rows * columns);

        // 设置容器显示
        this.otherInventoryContainer.style.display = 'block';
        this.otherInventoryContainer.style.opacity = '1';
        this.otherInventoryContainer.classList.add('inventory-open');
        this.otherInventoryContainer.classList.remove('inventory-close');
        document.body.appendChild(this.otherInventoryContainer);

        // 恢复窗口位置和大小
        if (this.OtherInventoryWindowPosition[0] !== 0 || this.OtherInventoryWindowPosition[1] !== 0) {
            this.otherInventoryContainer.style.left = `${this.OtherInventoryWindowPosition[0]}px`;
            this.otherInventoryContainer.style.top = `${this.OtherInventoryWindowPosition[1]}px`;
        }
        
        if (this.OtherInventoryWindowSize[0] !== 0 || this.OtherInventoryWindowSize[1] !== 0) {
            this.otherInventoryContainer.style.width = `${this.OtherInventoryWindowSize[0]}px`;
            this.otherInventoryContainer.style.height = `${this.OtherInventoryWindowSize[1]}px`;
        }

        // 渲染其他库存
        this.renderOtherInventory(rows, columns);

        // 设置关闭函数
        this.closeOtherInventoryFunc = () => {
            this.otherInventoryContainer.classList.add('inventory-close');
            this.otherInventoryContainer.classList.remove('inventory-open');
            
            // 等待动画完成后隐藏
            setTimeout(() => {
                this.otherInventoryContainer.style.display = 'none';
                this.otherInventoryContainer.style.opacity = '0';
                if (this.otherInventoryContainer.parentNode) {
                    this.otherInventoryContainer.parentNode.removeChild(this.otherInventoryContainer);
                }
            }, 200);
            
            // 清空其他库存的槽位数据
            this.otherSlotPositions = [];
            this.closeOtherInventoryFunc = null;
            
            // 触发关闭回调
            if (this.onOtherInventoryCloseCallback) {
                this.onOtherInventoryCloseCallback();
            }
        };

        this.otherInventoryInstance = this.otherInventoryContainer;

        // 触发打开回调
        if (this.onOtherInventoryOpenCallback) {
            this.onOtherInventoryOpenCallback();
        }

        return this.otherInventoryContainer;
    }

    // 获取主库存可见状态
    public IsMainInventoryVisible(): boolean {
        return this.isMainInventoryVisible;
    }

    // 获取其他库存实例
    public GetOtherInventoryInstance(): HTMLDivElement | null {
        return this.otherInventoryInstance;
    }

    // 实现IUIInventory接口的方法
    public BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): { unbind: () => void, oneline: () => void } {
        this.SetMainInventory(inventoryArray, rows, columns, key);
        
        return {
            unbind: () => {
                // 解绑主库存
                this.mainInventoryData = [];
                this.slotPositions = [];
                if (this.isMainInventoryVisible) {
                    this.toggleMainInventory();
                }
            },
            oneline: () => {
                // 切换单列模式
                this.isMainInventoryOnelineMode = !this.isMainInventoryOnelineMode;
                if (this.isMainInventoryVisible) {
                    this.renderMainInventory();
                }
            }
        };
    }

    public ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number, updateInfo?: InventoryUpdateCallback, InventoryName?: string): { close: () => void, oneline: () => void } {
        const container = this.showOtherInventoryInternal(inventoryArray, rows, columns, InventoryName, updateInfo);
        
        return {
            close: () => {
                if (this.closeOtherInventoryFunc) {
                    this.closeOtherInventoryFunc();
                }
            },
            oneline: () => {
                // 切换单列模式
                this.isOtherInventoryOnelineMode = !this.isOtherInventoryOnelineMode;
                this.renderOtherInventory(rows, columns);
            }
        };
    }

    // 清理资源
    public cleanup(): void {
        // 移除事件监听器
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));

        // 清理拖拽状态
        UIInventoryDrag.cleanupAll();

        // 清理样式
        UIInventoryStyles.cleanupStyles();

        // 移除DOM元素
        if (this.mainInventoryContainer.parentNode) {
            this.mainInventoryContainer.parentNode.removeChild(this.mainInventoryContainer);
        }
        if (this.otherInventoryContainer.parentNode) {
            this.otherInventoryContainer.parentNode.removeChild(this.otherInventoryContainer);
        }
        if (this.itemDescriptionPanel.parentNode) {
            this.itemDescriptionPanel.parentNode.removeChild(this.itemDescriptionPanel);
        }

        // 重置实例
        UIInventoryCore.instance = null as any;
    }
} 