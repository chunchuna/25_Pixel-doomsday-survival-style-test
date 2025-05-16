import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

// 物品等级枚举
enum ItemLevel {
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
interface Item {
    itemName: string;
    itemDescribe: string;
    itemLevel: ItemLevel;
}

// 格子位置接口
interface SlotPosition {
    index: number;
    item: Item | null;
    count: number;
}

// 库存数据接口（用于序列化）
interface SerializedInventory {
    items: SerializedItem[];
    rows: number;
    columns: number;
}

// 序列化的物品接口
interface SerializedItem {
    name: string;
    desc: string;
    level: string;
    count: number;
}

// 添加实例更新回调接口
interface InventoryUpdateCallback {
    instance: any;
    varName?: string;
    updateMethod?: (instance: any, items: Item[]) => void;
}

// 库存UI管理类
class UIInventory {
    private static instance: UIInventory;
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
    private draggedItem: { element: HTMLElement, data: Item, count: number, sourceSlot: number, inventoryType: 'main' | 'other' } | null = null;
    private draggedItemGhost: HTMLElement | null = null;
    // 添加新变量跟踪点击状态
    private clickStartPos: { x: number, y: number } | null = null;
    private clickStartTime: number = 0;
    private isDragging: boolean = false;
    
    // 窗口拖拽相关变量
    private isDraggingWindow: boolean = false;
    private draggedWindow: HTMLDivElement | null = null;
    private windowDragStartPos: { x: number, y: number, windowX: number, windowY: number } | null = null;
    
    // 添加一个变量来存储原始库存数组的引用
    private originalInventoryArray: Item[] | null = null;
    
    // 添加一个变量来存储关闭其他库存的函数
    private closeOtherInventoryFunc: (() => any) | null = null;

    // 添加一个变量来存储更新回调
    private updateCallback: InventoryUpdateCallback | null = null;

    private mainInventoryCallback: ((items: Item[]) => void) | null = null;

    private constructor() {
        this.initStyles();
        this.mainInventoryContainer = this.createInventoryContainer('main-inventory');
        this.otherInventoryContainer = this.createInventoryContainer('other-inventory');
        this.itemDescriptionPanel = this.createItemDescriptionPanel();

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
    public static getInstance(): UIInventory {
        if (!UIInventory.instance) {
            UIInventory.instance = new UIInventory();
        }
        return UIInventory.instance;
    }

    // 绑定主库存
    public BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): void {
        // 重置主库存数据，避免叠加
        this.mainInventoryData = [];
        this.slotPositions = [];
        
        // 重新赋值
        this.mainInventoryData = inventoryArray;
        this.mainInventoryRows = rows;
        this.mainInventoryColumns = columns;
        this.mainInventoryKey = key;

        this.renderMainInventory();
    }

    // 显示其他库存（如NPC或箱子库存）
    public ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number, updateInfo?: InventoryUpdateCallback,InventoryName?:string): { close: () => void } {
        // 如果已有打开的其他库存，先关闭它
        if (this.closeOtherInventoryFunc) {
            this.closeOtherInventoryFunc();
        }
        
        // 保存实例更新信息
        this.updateCallback = updateInfo || null;
        
        // 保存原始库存数组的引用
        this.originalInventoryArray = inventoryArray;
        
        // 创建深拷贝，避免引用共享问题
        this.otherInventoryData = inventoryArray.map(item => ({...item}));
        
        // 保存行列信息，用于渲染和后续操作
        this.otherInventoryRows = rows;
        this.otherInventoryColumns = columns;

        // 清除之前的其他库存实例
        if (this.otherInventoryInstance && this.otherInventoryInstance.parentNode) {
            this.otherInventoryInstance.parentNode.removeChild(this.otherInventoryInstance);
        }

        // 创建新的其他库存
        this.otherInventoryInstance = this.createInventoryContainer('other-inventory');
        document.body.appendChild(this.otherInventoryInstance);
        
        // 设置其他库存的初始位置（右侧）
        this.otherInventoryInstance.style.left = 'auto';
        this.otherInventoryInstance.style.right = '50px';
        this.otherInventoryInstance.style.top = '50%';
        this.otherInventoryInstance.style.transform = 'translateY(-50%)';
        this.otherInventoryInstance.style.display = 'flex';
        
        // 确保容器初始可见
        this.otherInventoryInstance.style.opacity = '0';

        // 渲染其他库存
        this.renderOtherInventory(rows, columns,InventoryName);
        
        // 添加动画效果
        setTimeout(() => {
            if (this.otherInventoryInstance) {
                this.otherInventoryInstance.classList.add('inventory-open');
            }
        }, 10); // 短延迟以确保DOM更新

        // 添加Escape键关闭库存的监听
        const escapeListener = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.otherInventoryInstance) {
                closeOtherInventory();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);

        // 创建关闭函数
        const closeOtherInventory = () => {
            // 移除Escape键监听
            document.removeEventListener('keydown', escapeListener);
            
            if (this.otherInventoryInstance) {
                // 添加关闭动画
                this.otherInventoryInstance.classList.remove('inventory-open');
                this.otherInventoryInstance.classList.add('inventory-close');
                
                // 监听动画结束后移除元素
                this.otherInventoryInstance.addEventListener('animationend', () => {
                    if (this.otherInventoryInstance && this.otherInventoryInstance.parentNode) {
                        this.otherInventoryInstance.parentNode.removeChild(this.otherInventoryInstance);
                        this.otherInventoryInstance = null;
                    }
                }, { once: true });
            }
            
            // 同步更新原始数组
            this.syncOriginalInventoryArray();
            
            // 调用实例更新回调，将数据更新回实例变量
            this.updateInstanceInventory();
            
            // 清空关闭函数引用
            this.closeOtherInventoryFunc = null;
            
            // 返回更新后的库存数组
            return this.otherInventoryData;
        };
        
        // 保存关闭函数的引用
        this.closeOtherInventoryFunc = closeOtherInventory;

        // 返回关闭方法和获取当前库存数据的方法
        return { 
            close: closeOtherInventory
        };
    }

    // 处理键盘按键
    private handleKeyPress(event: KeyboardEvent): void {
        if (event.key.toLowerCase() === this.mainInventoryKey.toLowerCase()) {
            this.toggleMainInventory();
        } else if (event.key.toLowerCase() === 'r' && this.isMainInventoryVisible) {
            // 按R键自动整理物品
            this.sortInventoryByQuality();
        }
    }

    // 显示/隐藏主库存
    private toggleMainInventory(): void {
        this.isMainInventoryVisible = !this.isMainInventoryVisible;

        if (this.isMainInventoryVisible) {
            // 设置初始位置（左侧）
            this.mainInventoryContainer.style.left = '50px';
            this.mainInventoryContainer.style.top = '50%';
            this.mainInventoryContainer.style.transform = 'translateY(-50%)';
            this.mainInventoryContainer.style.display = 'flex';
            
            // 添加动画效果
            this.mainInventoryContainer.classList.remove('inventory-close');
            void this.mainInventoryContainer.offsetWidth; // 强制重绘
            this.mainInventoryContainer.classList.add('inventory-open');
        } else {
            // 添加关闭动画
            this.mainInventoryContainer.classList.remove('inventory-open');
            void this.mainInventoryContainer.offsetWidth; // 强制重绘
            this.mainInventoryContainer.classList.add('inventory-close');

            // 监听动画结束后隐藏
            this.mainInventoryContainer.addEventListener('animationend', () => {
                if (!this.isMainInventoryVisible) {
                    this.mainInventoryContainer.style.display = 'none';
                    this.itemDescriptionPanel.style.display = 'none';
                }
            }, { once: true });
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
        if (this.draggedItem && this.draggedItemGhost) {
            // 检查是否应该开始拖拽（移动超过5像素）
            if (!this.isDragging && this.clickStartPos) {
                const dx = Math.abs(event.clientX - this.clickStartPos.x);
                const dy = Math.abs(event.clientY - this.clickStartPos.y);
                
                if (dx > 5 || dy > 5) {
                    this.isDragging = true;
                    // 显示拖拽幽灵元素
                    if (this.draggedItemGhost) {
                        this.draggedItemGhost.style.display = 'flex';
                    }
                }
            }
            
            if (this.isDragging) {
                this.draggedItemGhost.style.left = `${event.clientX - 30}px`;
                this.draggedItemGhost.style.top = `${event.clientY - 30}px`;
            }
        }
        
        // 处理窗口拖拽
        if (this.isDraggingWindow && this.draggedWindow && this.windowDragStartPos) {
            const dx = event.clientX - this.windowDragStartPos.x;
            const dy = event.clientY - this.windowDragStartPos.y;
            
            const newX = this.windowDragStartPos.windowX + dx;
            const newY = this.windowDragStartPos.windowY + dy;
            
            this.draggedWindow.style.left = `${newX}px`;
            this.draggedWindow.style.top = `${newY}px`;
            // 移除默认的居中transform
            this.draggedWindow.style.transform = 'none';
        }
    }

    // 处理鼠标抬起事件（放置拖拽物品）
    private handleMouseUp(event: MouseEvent): void {
        // 处理窗口拖拽结束
        if (this.isDraggingWindow) {
            this.isDraggingWindow = false;
            this.draggedWindow = null;
            this.windowDragStartPos = null;
            return;
        }
        
        // 如果没有临时拖拽处理器，则清理全局状态
        // 注意：物品拖拽主要由startDrag中创建的mouseUpHandler处理
        if (!this.draggedItem) {
            this.clickStartPos = null;
            this.isDragging = false;
        }
    }

    // 处理主库存拖拽
    private handleMainInventoryDrop(targetSlot: number): void {
        if (!this.draggedItem) return;
        
        // 如果源格子和目标格子相同，不做任何处理（避免物品消失）
        if (targetSlot === this.draggedItem.sourceSlot) {
            console.log("源格子和目标格子相同，不进行操作");
            return;
        }
        
        // 如果目标格子有物品
        if (this.slotPositions[targetSlot].item) {
            // 相同物品，合并数量
            if (this.slotPositions[targetSlot].item!.itemName === this.draggedItem.data.itemName) {
                // 检查合并后是否超过64
                const totalCount = this.slotPositions[targetSlot].count + this.draggedItem.count;
                if (totalCount <= 64) {
                    // 可以完全合并
                    this.slotPositions[targetSlot].count = totalCount;
                    // 清空原始格子
                    this.slotPositions[this.draggedItem.sourceSlot].item = null;
                    this.slotPositions[this.draggedItem.sourceSlot].count = 0;
                } else {
                    // 部分合并
                    this.slotPositions[targetSlot].count = 64;
                    this.slotPositions[this.draggedItem.sourceSlot].count = totalCount - 64;
                }
            } else {
                // 不同物品，交换位置
                const tempItem = this.slotPositions[targetSlot].item;
                const tempCount = this.slotPositions[targetSlot].count;
                
                this.slotPositions[targetSlot].item = this.draggedItem.data;
                this.slotPositions[targetSlot].count = this.draggedItem.count;
                
                this.slotPositions[this.draggedItem.sourceSlot].item = tempItem;
                this.slotPositions[this.draggedItem.sourceSlot].count = tempCount;
            }
        } else {
            // 目标格子为空，直接放置
            this.slotPositions[targetSlot].item = this.draggedItem.data;
            this.slotPositions[targetSlot].count = this.draggedItem.count;
            
            // 清空原始格子
            this.slotPositions[this.draggedItem.sourceSlot].item = null;
            this.slotPositions[this.draggedItem.sourceSlot].count = 0;
        }
        
        // 重新渲染主库存
        this.renderMainInventory();
        
        // 触发主库存更新回调
        this.triggerMainInventoryCallback();
    }

    // 查找鼠标下方的格子
    private findSlotUnderMouse(event: MouseEvent): { slotIndex: number | null, inventoryType: 'main' | 'other' | null } {
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

    // 开始拖拽物品
    private startDrag(item: Item, count: number, sourceSlot: number, element: HTMLElement, event: MouseEvent, inventoryType: 'main' | 'other'): void {
        // 记录点击开始位置和时间
        this.clickStartPos = { x: event.clientX, y: event.clientY };
        this.clickStartTime = Date.now();
        this.isDragging = false;
        
        // 标记源格子的样式
        const sourceSlotElement = element.closest('.inventory-slot');
        if (sourceSlotElement) {
            sourceSlotElement.classList.add('source-slot');
        }
        
        // 创建拖拽时的物品幽灵元素
        this.draggedItemGhost = document.createElement('div');
        this.draggedItemGhost.className = 'dragged-item';
        this.draggedItemGhost.innerHTML = element.innerHTML;
        this.draggedItemGhost.style.width = '60px';
        this.draggedItemGhost.style.height = '60px';
        
        // 设置幽灵元素的初始位置
        const rect = element.getBoundingClientRect();
        this.draggedItemGhost.style.left = `${rect.left}px`;
        this.draggedItemGhost.style.top = `${rect.top}px`;
        
        // 初始时隐藏幽灵元素，直到确认是拖拽而非点击
        this.draggedItemGhost.style.display = 'none';
        
        // 添加到文档中
        document.body.appendChild(this.draggedItemGhost);
        
        // 记录拖拽的物品信息
        this.draggedItem = {
            element: element,
            data: item,
            count: count,
            sourceSlot: sourceSlot,
            inventoryType: inventoryType // 添加标记来源库存类型
        };
        
        // 添加鼠标移动监听，用于高亮可以放置的格子
        const mouseMoveHandler = (e: MouseEvent) => {
            if (this.isDragging) {
                // 移除所有格子的目标高亮
                document.querySelectorAll('.inventory-slot.target-slot').forEach(slot => {
                    slot.classList.remove('target-slot');
                });
                
                // 获取当前鼠标下的格子并高亮
                const targetInfo = this.findSlotUnderMouse(e);
                if (targetInfo && targetInfo.slotIndex !== null) {
                    const targetSlots = document.querySelectorAll('.inventory-slot');
                    for (let i = 0; i < targetSlots.length; i++) {
                        const slot = targetSlots[i];
                        const slotIndex = parseInt(slot.getAttribute('data-slot-index') || '-1');
                        const slotInventoryType = slot.getAttribute('data-inventory-type');
                        
                        if (slotIndex === targetInfo.slotIndex && slotInventoryType === targetInfo.inventoryType) {
                            slot.classList.add('target-slot');
                            break;
                        }
                    }
                }
            }
        };
        
        // 添加一次性鼠标移动监听
        document.addEventListener('mousemove', mouseMoveHandler);
        
        // 添加鼠标释放的事件监听，用于清理
        const mouseUpHandler = (e: MouseEvent) => {
            // 移除监听器
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            
            // 移除所有格子的目标高亮
            document.querySelectorAll('.inventory-slot.target-slot').forEach(slot => {
                slot.classList.remove('target-slot');
            });
            
            // 移除源格子样式
            document.querySelectorAll('.inventory-slot.source-slot').forEach(slot => {
                slot.classList.remove('source-slot');
            });
            
            // 计算从点击到释放的时间
            const clickDuration = Date.now() - this.clickStartTime;
            
            // 如果是单击而不是拖拽（短时间内且未移动太多）
            if (!this.isDragging && clickDuration < 300) {
                // 这里可以添加单击物品的处理逻辑，例如使用物品等
                console.log("物品被单击:", item.itemName);
                
                // 清理拖拽状态
                if (this.draggedItemGhost && this.draggedItemGhost.parentNode) {
                    this.draggedItemGhost.parentNode.removeChild(this.draggedItemGhost);
                }
                
                // 清理全局状态
                this.draggedItem = null;
                this.draggedItemGhost = null;
                this.clickStartPos = null;
                this.isDragging = false;
                return;
            }
            
            // 处理拖拽放置
            if (this.draggedItemGhost && this.draggedItem) {
                // 查找目标格子
                const targetInfo = this.findSlotUnderMouse(e);
                
                if (targetInfo && targetInfo.slotIndex !== null) {
                    // 检查是否拖回原来的格子（来源格子与目标格子相同）
                    if (targetInfo.inventoryType === this.draggedItem.inventoryType && 
                        targetInfo.slotIndex === this.draggedItem.sourceSlot) {
                        // 拖回原位置，不需要任何操作，只需重新渲染以确保物品显示正确
                        console.log("物品放回原位置");
                        if (this.draggedItem.inventoryType === 'main') {
                            this.renderMainInventory();
                        } else {
                            this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                        }
                        
                        // 添加回弹动画效果
                        if (this.draggedItem.element) {
                            this.draggedItem.element.classList.add('slot-bounce');
                            setTimeout(() => {
                                const elements = document.querySelectorAll('.inventory-item.slot-bounce');
                                elements.forEach(el => el.classList.remove('slot-bounce'));
                            }, 300);
                        }
                    }
                    // 同一库存内的物品交换
                    else if (targetInfo.inventoryType === this.draggedItem.inventoryType) {
                        // 处理主库存的拖拽
                        if (this.draggedItem.inventoryType === 'main') {
                            this.handleMainInventoryDrop(targetInfo.slotIndex);
                        } 
                        // 处理其他库存的拖拽
                        else if (this.draggedItem.inventoryType === 'other') {
                            this.handleOtherInventoryDrop(targetInfo.slotIndex);
                        }
                    } 
                    // 从主库存到其他库存
                    else if (this.draggedItem.inventoryType === 'main' && targetInfo.inventoryType === 'other') {
                        this.handleItemTransfer('main-to-other', this.draggedItem.sourceSlot, targetInfo.slotIndex);
                    }
                    // 从其他库存到主库存
                    else if (this.draggedItem.inventoryType === 'other' && targetInfo.inventoryType === 'main') {
                        this.handleItemTransfer('other-to-main', this.draggedItem.sourceSlot, targetInfo.slotIndex);
                    }
                } else {
                    // 未找到目标格子，物品回到原位置
                    console.log("物品回到原位置");
                    // 检查是主库存还是其他库存
                    if (this.draggedItem.inventoryType === 'main') {
                        // 主库存不需要做任何事情，物品已经在原位置
                        this.renderMainInventory(); // 重新渲染确保显示正确
                    } else if (this.draggedItem.inventoryType === 'other') {
                        // 其他库存不需要做任何事情，物品已经在原位置
                        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                    }
                    
                    // 添加回弹动画效果
                    if (this.draggedItem.element) {
                        this.draggedItem.element.classList.add('slot-bounce');
                        setTimeout(() => {
                            const elements = document.querySelectorAll('.inventory-item.slot-bounce');
                            elements.forEach(el => el.classList.remove('slot-bounce'));
                        }, 300);
                    }
                }
                
                // 清理拖拽状态
                if (this.draggedItemGhost.parentNode) {
                    this.draggedItemGhost.parentNode.removeChild(this.draggedItemGhost);
                }
                
                // 清理全局状态
                this.draggedItem = null;
                this.draggedItemGhost = null;
                this.clickStartPos = null;
                this.isDragging = false;
            }
        };
        
        // 添加一次性鼠标释放监听
        document.addEventListener('mouseup', mouseUpHandler);
    }

    // 根据品质排序库存
    private sortInventoryByQuality(): void {
        // 获取所有已放置的物品
        let itemsToSort: {item: Item, count: number}[] = [];
        
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
        
        // 根据品质排序（从高到低）
        itemsToSort.sort((a, b) => {
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
        const notification = document.createElement('div');
        notification.className = 'inventory-notification';
        notification.textContent = '整理完成';
        this.mainInventoryContainer.appendChild(notification);
        
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

    // 创建库存容器
    private createInventoryContainer(id: string): HTMLDivElement {
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
                this.isDraggingWindow = true;
                this.draggedWindow = container;
                
                // 获取容器当前位置
                const rect = container.getBoundingClientRect();
                this.windowDragStartPos = {
                    x: e.clientX,
                    y: e.clientY,
                    windowX: rect.left,
                    windowY: rect.top
                };
                
                e.preventDefault(); // 防止选中文本
            }
        });
        
        container.appendChild(dragHandle);
        return container;
    }

    // 创建物品描述面板
    private createItemDescriptionPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.className = 'item-description-panel';
        return panel;
    }

    // 渲染主库存
    private renderMainInventory(): void {
        this.renderInventory(
            this.mainInventoryContainer,
            this.mainInventoryData,
            this.mainInventoryRows,
            this.mainInventoryColumns,
            // 传递一个标识，表示这是主库存
            false
        );
    }

    // 渲染其他库存
    private renderOtherInventory(rows: number, columns: number,InventoryName?:string): void {
        if (this.otherInventoryInstance) {
            this.renderInventory(
                this.otherInventoryInstance,
                this.otherInventoryData,
                rows,
                columns,
                // 传递一个标识，表示这是其他库存
                true,
                InventoryName,
            );
        }
    }

    // 通用渲染库存方法
    private renderInventory(container: HTMLDivElement, items: Item[], rows: number, columns: number, isOtherInventory: boolean = false,InventoryName?:string): void {
        // 清空容器，但保留拖拽句柄
        const dragHandle = container.querySelector('.inventory-drag-handle');
        container.innerHTML = '';
        if (dragHandle) {
            container.appendChild(dragHandle);
        }

        // 创建标题和按钮区域
        const headerDiv = document.createElement('div');
        headerDiv.className = 'inventory-header';

        // 根据容器类型创建不同的标题和按钮
        if (!isOtherInventory) {
            const titleSpan = document.createElement('span');
            titleSpan.className = 'inventory-title';
            titleSpan.textContent = '我的';

            const sortButton = document.createElement('button');
            sortButton.className = 'sort-button';
            sortButton.textContent = '整理 (R)';
            sortButton.onclick = () => this.sortInventoryByQuality();

            headerDiv.appendChild(titleSpan);
            headerDiv.appendChild(sortButton);
        } else {
            // 添加其他库存的标题
            const titleSpan = document.createElement('span');
            titleSpan.className = 'inventory-title';
            if(InventoryName)
            {
                titleSpan.textContent = InventoryName;
            }else{
                titleSpan.textContent = "正在查看其它库存";
            }
            
            
            // 添加关闭按钮
            const closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.textContent = '关闭';
            closeButton.onclick = () => {
                // 获取关闭函数，这是一个全局函数
                const closeFunc = this.findCloseOtherInventoryFunction();
                if (closeFunc) {
                    closeFunc();
                }
            };

            headerDiv.appendChild(titleSpan);
            headerDiv.appendChild(closeButton);
        }

        container.appendChild(headerDiv);

        // 创建库存网格
        const gridContainer = document.createElement('div');
        gridContainer.className = 'inventory-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 60px)`;

        // 计算需要多少个格子
        const totalSlots = rows * columns;

        // 为不同库存使用不同的数据结构和处理逻辑
        if (container === this.mainInventoryContainer) {
            // 主库存的逻辑
            // 初始化或重置槽位数组
            if (this.slotPositions.length !== totalSlots) {
                this.slotPositions = [];
                for (let i = 0; i < totalSlots; i++) {
                    this.slotPositions.push({
                        index: i,
                        item: null,
                        count: 0
                    });
                }

                // 分组物品，同名物品放在一起
                const groupedItems = this.groupItems(items);

                // 填充物品到槽位
                let slotIndex = 0;
                for (const [itemName, itemList] of groupedItems) {
                    // 根据数量分组（每组最多64个）
                    const itemGroups = this.splitIntoGroups(itemList, 64);

                    for (const group of itemGroups) {
                        if (slotIndex < totalSlots) {
                            this.slotPositions[slotIndex].item = group[0]; // 取同一组中的第一个物品
                            this.slotPositions[slotIndex].count = group.length;
                            slotIndex++;
                        } else {
                            console.warn('库存格子不足以显示所有物品');
                            break;
                        }
                    }
                }
            }

            // 根据槽位信息渲染格子
            for (let i = 0; i < totalSlots; i++) {
                const slotInfo = this.slotPositions[i];
                let slot;

                if (slotInfo.item !== null) {
                    slot = this.createItemSlot([slotInfo.item], slotInfo.count, i, 'main');
                } else {
                    slot = this.createEmptySlot(i, 'main');
                }

                gridContainer.appendChild(slot);
            }
        } else {
            // 其他库存的逻辑
            // 分组物品，同名物品放在一起
            const groupedItems = this.groupItems(items);

            // 创建临时槽位数据，不影响主库存
            const otherSlotPositions: SlotPosition[] = [];
            for (let i = 0; i < totalSlots; i++) {
                otherSlotPositions.push({
                    index: i,
                    item: null,
                    count: 0
                });
            }

            // 填充物品到临时槽位
            let slotIndex = 0;
            for (const [itemName, itemList] of groupedItems) {
                // 根据数量分组（每组最多64个）
                const itemGroups = this.splitIntoGroups(itemList, 64);

                for (const group of itemGroups) {
                    if (slotIndex < totalSlots) {
                        otherSlotPositions[slotIndex].item = group[0];
                        otherSlotPositions[slotIndex].count = group.length;
                        slotIndex++;
                    } else {
                        console.warn('其他库存格子不足以显示所有物品');
                        break;
                    }
                }
            }

            // 渲染其他库存格子
            for (let i = 0; i < totalSlots; i++) {
                const slotInfo = otherSlotPositions[i];
                let slot;

                if (slotInfo.item !== null) {
                    slot = this.createItemSlot([slotInfo.item], slotInfo.count, i, 'other');
                } else {
                    slot = this.createEmptySlot(i, 'other');
                }

                gridContainer.appendChild(slot);
            }

            // 存储其他库存的数据到otherInventoryData属性中
            this.otherInventoryData = items;
        }

        // 添加滚动条容器
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'inventory-scroll-container';
        scrollContainer.appendChild(gridContainer);

        container.appendChild(scrollContainer);
    }

    // 物品分组
    private groupItems(items: Item[]): Map<string, Item[]> {
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
    private splitIntoGroups<T>(items: T[], maxPerGroup: number): T[][] {
        const groups: T[][] = [];

        for (let i = 0; i < items.length; i += maxPerGroup) {
            groups.push(items.slice(i, i + maxPerGroup));
        }

        return groups;
    }

    // 创建物品格子
    private createItemSlot(items: Item[], count: number, slotIndex: number, inventoryType: 'main' | 'other'): HTMLDivElement {
        if (items.length === 0) {
            return this.createEmptySlot(slotIndex, inventoryType);
        }

        const item = items[0]; // 同一组中所有物品都是相同的，所以取第一个

        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.setAttribute('data-slot-index', slotIndex.toString());
        slot.setAttribute('data-inventory-type', inventoryType);

        // 创建物品元素
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.setAttribute('data-item-name', item.itemName);
        itemElement.setAttribute('data-item-level', item.itemLevel);
        itemElement.textContent = item.itemName;

        // 添加物品数量标签
        if (count > 1) {
            const countLabel = document.createElement('div');
            countLabel.className = 'item-count';
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
            if (e.button === 0) {
                this.startDrag(item, count, slotIndex, itemElement, e, inventoryType);
                e.preventDefault(); // 防止选中文本
            }
        });

        slot.appendChild(itemElement);
        return slot;
    }

    // 创建空格子
    private createEmptySlot(slotIndex: number, inventoryType: 'main' | 'other'): HTMLDivElement {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
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
    private showItemDescription(item: Item): void {
        this.itemDescriptionPanel.innerHTML = `
            <div class="item-name" data-level="${item.itemLevel}">${item.itemName}</div>
            <div class="item-level">等级: <span class="level-${item.itemLevel.toLowerCase()}">${item.itemLevel}</span></div>
            <div class="item-description">${item.itemDescribe}</div>
        `;

        this.itemDescriptionPanel.style.display = 'block';
    }

    // 隐藏物品描述
    private hideItemDescription(): void {
        this.itemDescriptionPanel.style.display = 'none';
    }

    // 初始化CSS样式
    private initStyles(): void {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* 库存容器样式 */
            .inventory-container {
                position: fixed;
                background-color: rgba(25, 25, 25, 0.95);
                border: 2px solid #444;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                padding: 15px;
                display: flex;
                flex-direction: column;
                width: 300px; /* 固定宽度 (6格 * 60px + 间隙) */
                height: 380px; /* 固定高度 */
                opacity: 1; /* 默认设置为可见 */
                z-index:5000;
            }
            
            /* 新创建的库存容器初始状态 */
            .inventory-container:not(.inventory-open):not(.inventory-close) {
                opacity: 1; /* 确保默认可见 */
            }
            
            /* 库存拖拽句柄 */
            .inventory-drag-handle {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 40px;
                cursor: move;
                z-index: 5002;
            }
            
            /* 库存头部样式 */
            .inventory-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #444;
                color: #ccc;
                z-index: 5001;
                pointer-events: auto;
                /* 添加明显的背景色以便区分 */
                background-color: rgba(40, 40, 40, 0.8);
                padding: 10px;
                border-radius: 3px;
            }
            
            /* 为库存类型添加不同的颜色 */
            #main-inventory .inventory-header {
                border-bottom-color: #446688;
            }
            
            #other-inventory .inventory-header {
                border-bottom-color: #884466;
            }
            
            .inventory-title {
                font-size: 18px;
                font-weight: bold;
            }
            
            .sort-button, .close-button {
                background-color: #333;
                color: #ccc;
                border: 1px solid #555;
                border-radius: 3px;
                padding: 5px 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 5001;
            }
            
            .sort-button:hover, .close-button:hover {
                background-color: #444;
                color: #fff;
            }
            
            .close-button {
                background-color: #553333;
            }
            
            .close-button:hover {
                background-color: #774444;
            }
            
            /* 库存打开动画 */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            /* 库存关闭动画 */
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            .inventory-open {
                animation: fadeIn 0.3s ease-out forwards;
            }
            
            .inventory-close {
                animation: fadeOut 0.3s ease-out forwards;
            }
            
            /* 整理完成通知 */
            .inventory-notification {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(50, 50, 50, 0.9);
                color: #fff;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                z-index: 5001;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                animation: notification-appear 0.3s ease-out;
            }
            
            @keyframes notification-appear {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            .inventory-notification.fade-out {
                animation: notification-disappear 0.5s ease-out forwards;
            }
            
            @keyframes notification-disappear {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
            
            /* 物品回弹动画 */
            @keyframes slotBounce {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.15);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .slot-bounce {
                animation: slotBounce 0.3s ease;
            }
            
            /* 滚动条容器 */
            .inventory-scroll-container {
                overflow-y: auto;
                flex-grow: 1;
                padding-right: 10px;
                margin-right: -10px; /* 防止滚动条占用空间 */
                scrollbar-width: thin; /* Firefox */
                scrollbar-color: #444 #222; /* Firefox: thumb track */
            }
            
            /* 自定义滚动条 - 更精致的黑灰风格 */
            .inventory-scroll-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
                box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #444, #333);
                border-radius: 4px;
                border: 1px solid #1a1a1a;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #555, #444);
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb:active {
                background: linear-gradient(to bottom, #666, #555);
            }
            
            /* 库存网格 */
            .inventory-grid {
                display: grid;
                gap: 8px;
                width: 100%;
                grid-auto-rows: 60px;
            }
            
            /* 为主库存和其他库存设置不同的默认位置和视觉样式 */
            #main-inventory {
                left: 50px;
                top: 50%;
                border-color: #446688;
            }
            
            #other-inventory {
                right: 50px;
                top: 50%;
                border-color: #884466;
            }
            
            /* 物品格子 */
            .inventory-slot {
                background-color: #333;
                border: 1px solid #555;
                border-radius: 4px;
                aspect-ratio: 1 / 1;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
            }
            
            .inventory-slot.empty {
                background-color: #2a2a2a;
            }
            
            /* 格子高亮效果 */
            @keyframes pulseGlow {
                0% {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3), 0 0 2px rgba(255, 255, 255, 0.3);
                    border-color: #555;
                }
                50% {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 255, 255, 0.5);
                    border-color: #888;
                }
                100% {
                    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3), 0 0 2px rgba(255, 255, 255, 0.3);
                    border-color: #555;
                }
            }
            
            .slot-highlight {
                animation: pulseGlow 1.5s infinite;
                z-index: 5001;
                border-color: #888;
                background-color: #444;
            }
            
            .slot-highlight.empty {
                background-color: #3a3a3a;
            }
            
            /* 源格子样式（拖拽来源） */
            .source-slot {
                background-color: rgba(70, 70, 90, 0.5);
                border: 1px dashed #777;
                opacity: 0.8;
            }
            
            /* 目标格子样式（可放置区域） */
            .target-slot {
                background-color: rgba(70, 90, 70, 0.5);
                border: 2px solid #88aa88;
                box-shadow: 0 0 8px rgba(100, 255, 100, 0.3);
            }
            
            /* 物品样式 */
            .inventory-item {
                width: 90%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 14px;
                text-align: center;
                word-break: break-word;
                transition: all 0.2s ease;
                cursor: grab;
                position: relative;
                user-select: none;
            }
            
            /* 拖拽中的物品样式 */
            .inventory-item.dragging {
                opacity: 0.5;
                cursor: grabbing;
            }
            
            /* 被拖拽的物品幽灵元素 */
            .dragged-item {
                position: fixed;
                pointer-events: none;
                z-index: 5001;
                background-color: rgba(80, 80, 80, 0.9);
                border: 1px solid #888;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
                transform: scale(1.1);
                cursor: grabbing;
            }
            
            /* 物品选中效果 */
            .inventory-item.selected {
                transform: scale(1.1);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }
            
            /* 物品数量标签 */
            .item-count {
                position: absolute;
                bottom: 2px;
                left: 2px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                font-size: 12px;
                padding: 1px 4px;
                border-radius: 3px;
                pointer-events: none;
            }
            
            /* 物品描述面板 */
            .item-description-panel {
                position: fixed;
                background-color: rgba(25, 25, 25, 0.95);
                border: 1px solid #444;
                border-radius: 5px;
                padding: 10px;
                min-width: 200px;
                max-width: 300px;
                z-index: 5002;
                color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
                backdrop-filter: blur(2px);
            }
            
            .item-description-panel[style*="display: block"] {
                opacity: 1;
            }
            
            .item-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
                padding-bottom: 5px;
                border-bottom: 1px solid #555;
            }
            
            .item-level {
                margin-bottom: 5px;
            }
            
            .item-description {
                font-size: 14px;
                line-height: 1.4;
            }
            
            /* 不同等级的颜色 */
            .level-top, .item-name[data-level="TOP"] {
                color: #ffd700; /* 金色 */
            }
            
            .level-s, .item-name[data-level="S"] {
                color: #ff5500; /* 橙色 */
            }
            
            .level-a\\+, .item-name[data-level="A+"] {
                color: #ff0000; /* 红色 */
            }
            
            .level-a, .item-name[data-level="A"] {
                color: #ff3366; /* 粉红色 */
            }
            
            .level-b, .item-name[data-level="B"] {
                color: #9933ff; /* 紫色 */
            }
            
            .level-c, .item-name[data-level="C"] {
                color: #3399ff; /* 蓝色 */
            }
            
            .level-d, .item-name[data-level="D"] {
                color: #33cc33; /* 绿色 */
            }
            
            .level-e, .item-name[data-level="E"] {
                color: #cccccc; /* 银灰色 */
            }
            
            .level-low, .item-name[data-level="LOW"] {
                color: #999999; /* 灰色 */
            }
            
            .level-break, .item-name[data-level="BREAK"] {
                color: #666666; /* 暗灰色 */
            }
        `;

        document.head.appendChild(styleElement);
    }

    // 处理从一个库存到另一个库存的物品转移
    private handleItemTransfer(direction: 'main-to-other' | 'other-to-main', sourceSlot: number, targetSlot: number): void {
        if (!this.draggedItem) return;
        
        // 添加调试日志
        console.log(`物品传输: ${direction}，从槽位 ${sourceSlot} 到槽位 ${targetSlot}`);
        
        // 找到当前正在显示的其他库存，并获取其数据
        if (!this.otherInventoryInstance) {
            console.warn("无法找到其他库存实例");
            return;
        }

        // 从主库存转移到其他库存
        if (direction === 'main-to-other') {
            // 获取源物品信息
            const sourceItem = this.slotPositions[sourceSlot].item;
            const sourceCount = this.slotPositions[sourceSlot].count;
            
            if (!sourceItem) return;
            
            // 查找或创建其他库存中的目标位置
            const otherInventorySlots = this.getOtherInventorySlots();
            const targetItemInfo = otherInventorySlots[targetSlot];
            
            // 如果目标格子为空，直接转移
            if (!targetItemInfo.item) {
                // 更新其他库存数据
                targetItemInfo.item = sourceItem;
                targetItemInfo.count = sourceCount;
                
                // 更新其他库存数组数据
                this.updateOtherInventoryData(sourceItem, sourceCount, 'add');
                
                // 移除主库存中的项目
                this.slotPositions[sourceSlot].item = null;
                this.slotPositions[sourceSlot].count = 0;
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
            // 如果目标格子有相同物品，尝试合并
            else if (targetItemInfo.item.itemName === sourceItem.itemName) {
                // 计算合并后的总数
                const totalCount = targetItemInfo.count + sourceCount;
                
                // 如果合并后不超过上限
                if (totalCount <= 64) {
                    // 更新其他库存数据
                    targetItemInfo.count = totalCount;
                    
                    // 更新其他库存数组数据
                    this.updateOtherInventoryData(sourceItem, sourceCount, 'add');
                    
                    // 清空主库存中的项目
                    this.slotPositions[sourceSlot].item = null;
                    this.slotPositions[sourceSlot].count = 0;
                } 
                // 如果合并后超过上限
                else {
                    // 更新其他库存数据
                    targetItemInfo.count = 64;
                    
                    // 更新主库存中的剩余数量
                    this.slotPositions[sourceSlot].count = totalCount - 64;
                    
                    // 更新其他库存数组数据
                    this.updateOtherInventoryData(sourceItem, 64 - targetItemInfo.count, 'add');
                }
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
            // 如果目标格子有不同物品，交换位置
            else {
                // 保存目标物品信息
                const targetItem = targetItemInfo.item;
                const targetCount = targetItemInfo.count;
                
                // 更新其他库存数据
                targetItemInfo.item = sourceItem;
                targetItemInfo.count = sourceCount;
                
                // 更新主库存数据
                this.slotPositions[sourceSlot].item = targetItem;
                this.slotPositions[sourceSlot].count = targetCount;
                
                // 更新双方库存数组数据
                this.updateOtherInventoryData(sourceItem, sourceCount, 'add');
                this.updateOtherInventoryData(targetItem, targetCount, 'remove');
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
        }
        // 从其他库存转移到主库存
        else if (direction === 'other-to-main') {
            // 获取其他库存中的源物品信息
            const otherInventorySlots = this.getOtherInventorySlots();
            const sourceItemInfo = otherInventorySlots[sourceSlot];
            const sourceItem = sourceItemInfo.item;
            const sourceCount = sourceItemInfo.count;
            
            if (!sourceItem) return;
            
            // 获取主库存中的目标位置
            const targetItemInfo = this.slotPositions[targetSlot];
            
            // 如果目标格子为空，直接转移
            if (!targetItemInfo.item) {
                // 更新主库存数据
                targetItemInfo.item = sourceItem;
                targetItemInfo.count = sourceCount;
                
                // 移除其他库存中的项目
                sourceItemInfo.item = null;
                sourceItemInfo.count = 0;
                
                // 更新其他库存数组数据
                this.updateOtherInventoryData(sourceItem, sourceCount, 'remove');
                
                // 同步更新原始库存数组
                this.syncOriginalInventoryArray();
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
            // 如果目标格子有相同物品，尝试合并
            else if (targetItemInfo.item.itemName === sourceItem.itemName) {
                // 计算合并后的总数
                const totalCount = targetItemInfo.count + sourceCount;
                
                // 如果合并后不超过上限
                if (totalCount <= 64) {
                    // 更新主库存数据
                    targetItemInfo.count = totalCount;
                    
                    // 移除其他库存中的项目
                    sourceItemInfo.item = null;
                    sourceItemInfo.count = 0;
                    
                    // 更新其他库存数组数据
                    this.updateOtherInventoryData(sourceItem, sourceCount, 'remove');
                    
                    // 同步更新原始库存数组
                    this.syncOriginalInventoryArray();
                } 
                // 如果合并后超过上限
                else {
                    // 更新主库存数据
                    targetItemInfo.count = 64;
                    
                    // 更新其他库存中的剩余数量
                    sourceItemInfo.count = totalCount - 64;
                    
                    // 更新其他库存数组数据
                    this.updateOtherInventoryData(sourceItem, sourceCount - (totalCount - 64), 'remove');
                    
                    // 同步更新原始库存数组
                    this.syncOriginalInventoryArray();
                }
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
            // 如果目标格子有不同物品，交换位置
            else {
                // 保存目标物品信息
                const targetItem = targetItemInfo.item;
                const targetCount = targetItemInfo.count;
                
                // 更新主库存数据
                targetItemInfo.item = sourceItem;
                targetItemInfo.count = sourceCount;
                
                // 更新其他库存数据
                sourceItemInfo.item = targetItem;
                sourceItemInfo.count = targetCount;
                
                // 更新其他库存数组数据
                this.updateOtherInventoryData(sourceItem, sourceCount, 'remove');
                this.updateOtherInventoryData(targetItem, targetCount, 'add');
                
                // 同步更新原始库存数组
                this.syncOriginalInventoryArray();
                
                // 重新渲染两个库存
                this.renderMainInventory();
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
            }
        }
    }

    // 获取其他库存的格子数据
    private getOtherInventorySlots(): SlotPosition[] {
        const rows = this.otherInventoryRows;
        const cols = this.otherInventoryColumns;
        const totalSlots = rows * cols;
        
        const otherInventorySlots: SlotPosition[] = [];
        
        // 创建临时槽位数据
        for (let i = 0; i < totalSlots; i++) {
            otherInventorySlots.push({
                index: i,
                item: null,
                count: 0
            });
        }
        
        // 分组物品，同名物品放在一起
        const groupedItems = this.groupItems(this.otherInventoryData);
        
        // 填充物品到临时槽位
        let slotIndex = 0;
        for (const [itemName, itemList] of groupedItems) {
            // 根据数量分组（每组最多64个）
            const itemGroups = this.splitIntoGroups(itemList, 64);
            
            for (const group of itemGroups) {
                if (slotIndex < totalSlots) {
                    otherInventorySlots[slotIndex].item = group[0];
                    otherInventorySlots[slotIndex].count = group.length;
                    slotIndex++;
                } else {
                    console.warn('其他库存格子不足以显示所有物品');
                    break;
                }
            }
        }
        
        return otherInventorySlots;
    }

    // 处理其他库存内部的拖拽
    private handleOtherInventoryDrop(targetSlot: number): void {
        if (!this.draggedItem) return;
        
        // 如果源格子和目标格子相同，不做任何处理（避免物品消失）
        if (targetSlot === this.draggedItem.sourceSlot) {
            console.log("源格子和目标格子相同，不进行操作");
            return;
        }
        
        const otherInventorySlots = this.getOtherInventorySlots();
        const sourceSlot = this.draggedItem.sourceSlot;
        
        // 如果目标格子有物品
        if (otherInventorySlots[targetSlot].item) {
            // 相同物品，合并数量
            if (otherInventorySlots[targetSlot].item!.itemName === this.draggedItem.data.itemName) {
                // 检查合并后是否超过64
                const totalCount = otherInventorySlots[targetSlot].count + this.draggedItem.count;
                if (totalCount <= 64) {
                    // 可以完全合并
                    otherInventorySlots[targetSlot].count = totalCount;
                    // 清空原始格子
                    otherInventorySlots[sourceSlot].item = null;
                    otherInventorySlots[sourceSlot].count = 0;
                } else {
                    // 部分合并
                    otherInventorySlots[targetSlot].count = 64;
                    otherInventorySlots[sourceSlot].count = totalCount - 64;
                }
            } else {
                // 不同物品，交换位置
                const tempItem = otherInventorySlots[targetSlot].item;
                const tempCount = otherInventorySlots[targetSlot].count;
                
                otherInventorySlots[targetSlot].item = this.draggedItem.data;
                otherInventorySlots[targetSlot].count = this.draggedItem.count;
                
                otherInventorySlots[sourceSlot].item = tempItem;
                otherInventorySlots[sourceSlot].count = tempCount;
            }
        } else {
            // 目标格子为空，直接放置
            otherInventorySlots[targetSlot].item = this.draggedItem.data;
            otherInventorySlots[targetSlot].count = this.draggedItem.count;
            
            // 清空原始格子
            otherInventorySlots[sourceSlot].item = null;
            otherInventorySlots[sourceSlot].count = 0;
        }
        
        // 根据otherInventorySlots更新otherInventoryData
        this.otherInventoryData = [];
        for (const slot of otherInventorySlots) {
            if (slot.item) {
                for (let i = 0; i < slot.count; i++) {
                    this.otherInventoryData.push(slot.item);
                }
            }
        }
        
        // 同步更新原始库存数组
        this.syncOriginalInventoryArray();
        
        // 重新渲染其他库存，保持行列不变
        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
    }

    // 更新其他库存的数据数组
    private updateOtherInventoryData(item: Item, count: number, action: 'add' | 'remove'): void {
        if (action === 'add') {
            // 添加物品到其他库存数组
            for (let i = 0; i < count; i++) {
                this.otherInventoryData.push({...item}); // 使用对象深拷贝，确保不共享引用
            }
        } else {
            // 从其他库存数组移除物品
            let removedCount = 0;
            // 从后向前遍历以避免删除元素时索引变化的问题
            for (let i = this.otherInventoryData.length - 1; i >= 0; i--) {
                if (this.otherInventoryData[i].itemName === item.itemName && removedCount < count) {
                    this.otherInventoryData.splice(i, 1);
                    removedCount++;
                }
                if (removedCount >= count) break;
            }
        }
    }

    // 序列化库存数据为字符串
    public SerializeInventory(inventoryArray: Item[], rows: number, columns: number): string {
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
    public DeserializeInventory(data: string): { inventory: Item[], rows: number, columns: number } {
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
                    items.push({...item});
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
    public SerializeItemsOnly(inventoryArray: Item[]): string {
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
    public DeserializeItemsOnly(data: string): Item[] {
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
                    items.push({...item});
                }
            }
            
            return items;
        } catch (error) {
            console.error("反序列化物品数据失败:", error);
            return []; // 返回空数组
        }
    }

    // 获取原始库存数组的引用
    private getOriginalInventoryArray(): Item[] | null {
        return this.originalInventoryArray;
    }

    // 同步更新原始库存数组
    private syncOriginalInventoryArray(): void {
        if (this.originalInventoryArray) {
            this.originalInventoryArray.length = 0;
            this.otherInventoryData.forEach(item => {
                this.originalInventoryArray!.push({...item});
            });
        }
    }

    // 获取关闭其他库存的函数
    private findCloseOtherInventoryFunction(): (() => any) | null {
        return this.closeOtherInventoryFunc;
    }

    // 添加更新实例变量的方法
    private updateInstanceInventory(): void {
        if (!this.updateCallback) return;
        
        const instance = this.updateCallback.instance;
        if (!instance) return;
        
        // 将当前库存数据序列化后更新到实例变量
        const serializedData = this.SerializeItemsOnly(this.otherInventoryData);
        
        if (this.updateCallback.updateMethod) {
            // 使用自定义更新方法
            this.updateCallback.updateMethod(instance, this.otherInventoryData);
        } else if (this.updateCallback.varName) {
            // 使用变量名更新实例变量
            instance.instVars[this.updateCallback.varName] = serializedData;
        }
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
                        items.push({...slot.item});
                    }
                }
            }
            // 触发回调函数
            this.mainInventoryCallback(items);
        }
    }
}

// 导出公共接口
export function BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): void {
    inventoryManager.BindPlayerMainInventory(inventoryArray, rows, columns, key);
}

export function ShowOtherInventory(
    inventoryArray: Item[], 
    rows: number, 
    columns: number, 
    updateInfo?: InventoryUpdateCallback
): { close: () => void } {
    return inventoryManager.ShowOtherInventory(inventoryArray, rows, columns, updateInfo);
}

// 添加序列化和反序列化函数到导出接口
export function SerializeInventory(inventoryArray: Item[], rows: number, columns: number): string {
    return inventoryManager.SerializeInventory(inventoryArray, rows, columns);
}

export function DeserializeInventory(data: string): { inventory: Item[], rows: number, columns: number } {
    return inventoryManager.DeserializeInventory(data);
}

// 添加简化版序列化和反序列化函数到导出接口（仅物品数组）
export function SerializeItemsOnly(inventoryArray: Item[]): string {
    return inventoryManager.SerializeItemsOnly(inventoryArray);
}

export function DeserializeItemsOnly(data: string): Item[] {
    return inventoryManager.DeserializeItemsOnly(data);
}

// 添加一个清理函数，用于测试时重置库存系统
export function CleanupInventorySystem(): void {
    // 移除所有已添加的样式元素，防止样式重复
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(element => {
        if (element.textContent && element.textContent.includes('.inventory-container')) {
            element.parentNode?.removeChild(element);
        }
    });

    // 移除所有已添加的DOM元素
    const containers = document.querySelectorAll('.inventory-container, .item-description-panel, .dragged-item');
    containers.forEach(element => {
        element.parentNode?.removeChild(element);
    });
}

// 重新导出类型
export type {Item}
export {ItemLevel}
export let inventoryManager: UIInventory;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    // 导出一个单例实例
    inventoryManager = UIInventory.getInstance();

    // //测试item组
    // var PlayerItems: Item[] = [
    //     { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    //     { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    //     { itemName: "医疗包", itemDescribe: "恢复生命值，在战斗中使用可以快速回复HP", itemLevel: ItemLevel.A },
    //     { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
    //     { itemName: "弹药", itemDescribe: "补充子弹，可以为武器提供额外弹药", itemLevel: ItemLevel.B },
    //     { itemName: "手枪", itemDescribe: "标准手枪，伤害一般但射速较快", itemLevel: ItemLevel.C },
    //     { itemName: "霰弹枪", itemDescribe: "近距离威力巨大的武器", itemLevel: ItemLevel.B },
    //     { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
    //     { itemName: "能量饮料", itemDescribe: "提供短暂的移动速度提升", itemLevel: ItemLevel.D },
    //     { itemName: "破损的部件", itemDescribe: "看起来已经无法使用了", itemLevel: ItemLevel.Break },
    //     { itemName: "神秘宝石", itemDescribe: "散发着奇异光芒的宝石，似乎有特殊价值", itemLevel: ItemLevel.S },
    //     { itemName: "防弹衣", itemDescribe: "减少受到的伤害", itemLevel: ItemLevel.A },
    //     { itemName: "地图", itemDescribe: "显示周围地区的详细信息", itemLevel: ItemLevel.C },
    //     { itemName: "眼镜", itemDescribe: "普通的眼镜，似乎没什么特别之处", itemLevel: ItemLevel.Low },
    //     { itemName: "密码本", itemDescribe: "记录着一些重要的密码", itemLevel: ItemLevel.B },
    // ];

    // BindPlayerMainInventory(PlayerItems, 5, 6, "i");
});

// 导出实例更新回调接口
export type { InventoryUpdateCallback };