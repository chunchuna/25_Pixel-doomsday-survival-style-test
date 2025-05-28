import type { Item, DraggedItemInfo, ClickPosition, WindowDragPosition, WindowResizePosition } from './UIInventoryTypes.js';
import { UIInventoryUtils } from './UIInventoryUtils.js';

// 拖拽管理类
export class UIInventoryDrag {
    // 拖拽相关状态
    private static draggedItem: DraggedItemInfo | null = null;
    private static draggedItemGhost: HTMLElement | null = null;
    private static clickStartPos: ClickPosition | null = null;
    private static clickStartTime: number = 0;
    private static isDragging: boolean = false;
    
    // 窗口拖拽相关状态
    private static isDraggingWindow: boolean = false;
    private static draggedWindow: HTMLDivElement | null = null;
    private static windowDragStartPos: WindowDragPosition | null = null;
    
    // 窗口调整大小相关状态
    private static isResizingWindow: boolean = false;
    private static resizedWindow: HTMLDivElement | null = null;
    private static windowResizeStartPos: WindowResizePosition | null = null;

    // 获取拖拽状态
    public static getDraggedItem(): DraggedItemInfo | null {
        return this.draggedItem;
    }

    public static getIsDragging(): boolean {
        return this.isDragging;
    }

    public static getIsResizingWindow(): boolean {
        return this.isResizingWindow;
    }

    public static getIsDraggingWindow(): boolean {
        return this.isDraggingWindow;
    }

    // 开始拖拽物品
    public static startDrag(
        item: Item, 
        count: number, 
        sourceSlot: number, 
        element: HTMLElement, 
        event: MouseEvent, 
        inventoryType: 'main' | 'other',
        onDragEnd: (targetInfo: { slotIndex: number | null, inventoryType: 'main' | 'other' | null }) => void
    ): void {
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
            inventoryType: inventoryType
        };

        // 添加鼠标移动监听，用于高亮可以放置的格子
        const mouseMoveHandler = (e: MouseEvent) => {
            if (this.isDragging) {
                // 移除所有格子的目标高亮
                document.querySelectorAll('.inventory-slot.target-slot').forEach(slot => {
                    slot.classList.remove('target-slot');
                });

                // 获取当前鼠标下的格子并高亮
                const targetInfo = UIInventoryUtils.findSlotUnderMouse(e);
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
                this.cleanupDrag();
                return;
            }

            // 处理拖拽放置
            if (this.draggedItemGhost && this.draggedItem) {
                // 查找目标格子                 
                const targetInfo = UIInventoryUtils.findSlotUnderMouse(e);
                onDragEnd(targetInfo);

                // 清理拖拽状态
                this.cleanupDrag();
            }
        };

        // 添加一次性鼠标释放监听
        document.addEventListener('mouseup', mouseUpHandler);
    }

    // 更新拖拽幽灵元素位置
    public static updateDragGhost(event: MouseEvent): void {
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
    }

    // 开始窗口拖拽
    public static startWindowDrag(container: HTMLDivElement, event: MouseEvent): void {
        this.isDraggingWindow = true;
        this.draggedWindow = container;

        // 获取容器当前位置
        const rect = container.getBoundingClientRect();
        this.windowDragStartPos = {
            x: event.clientX,
            y: event.clientY,
            windowX: rect.left,
            windowY: rect.top
        };
    }

    // 更新窗口拖拽位置
    public static updateWindowDrag(event: MouseEvent): void {
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

    // 结束窗口拖拽
    public static endWindowDrag(): { left: number, top: number } | null {
        if (this.draggedWindow) {
            const rect = this.draggedWindow.getBoundingClientRect();
            const position = { left: rect.left, top: rect.top };
            
            this.isDraggingWindow = false;
            this.draggedWindow = null;
            this.windowDragStartPos = null;
            
            return position;
        }
        return null;
    }

    // 开始窗口大小调整
    public static startWindowResize(container: HTMLDivElement, event: MouseEvent): void {
        this.isResizingWindow = true;
        this.resizedWindow = container;

        // 获取容器当前大小
        const rect = container.getBoundingClientRect();
        this.windowResizeStartPos = {
            x: event.clientX,
            y: event.clientY,
            windowWidth: rect.width,
            windowHeight: rect.height
        };

        // 添加resizing类以应用样式
        if (!container.classList.contains('resizing')) {
            container.classList.add('resizing');
        }
    }

    // 更新窗口大小
    public static updateWindowResize(event: MouseEvent): { width: number, height: number } | null {
        if (this.isResizingWindow && this.resizedWindow && this.windowResizeStartPos) {
            const dx = event.clientX - this.windowResizeStartPos.x;
            const dy = event.clientY - this.windowResizeStartPos.y;

            // 计算新的宽度和高度（设置最小值以避免窗口过小）
            const newWidth = Math.max(225, this.windowResizeStartPos.windowWidth + dx);
            const newHeight = Math.max(380, this.windowResizeStartPos.windowHeight + dy);

            // 更新窗口大小
            this.resizedWindow.style.width = `${newWidth}px`;
            this.resizedWindow.style.height = `${newHeight}px`;

            return { width: newWidth, height: newHeight };
        }
        return null;
    }

    // 结束窗口大小调整
    public static endWindowResize(): { width: number, height: number } | null {
        if (this.resizedWindow) {
            // 移除resizing类
            if (this.resizedWindow.classList.contains('resizing')) {
                this.resizedWindow.classList.remove('resizing');
            }

            const rect = this.resizedWindow.getBoundingClientRect();
            const size = { width: rect.width, height: rect.height };

            this.isResizingWindow = false;
            this.resizedWindow = null;
            this.windowResizeStartPos = null;

            return size;
        }
        return null;
    }

    // 清理拖拽状态
    public static cleanupDrag(): void {
        if (this.draggedItemGhost && this.draggedItemGhost.parentNode) {
            this.draggedItemGhost.parentNode.removeChild(this.draggedItemGhost);
        }

        // 清理全局状态
        this.draggedItem = null;
        this.draggedItemGhost = null;
        this.clickStartPos = null;
        this.isDragging = false;
    }

    // 清理所有拖拽状态
    public static cleanupAll(): void {
        this.cleanupDrag();
        this.isDraggingWindow = false;
        this.draggedWindow = null;
        this.windowDragStartPos = null;
        this.isResizingWindow = false;
        this.resizedWindow = null;
        this.windowResizeStartPos = null;
    }

    // 创建物品飞行动画
    public static createFlyingItemAnimation(
        item: Item, 
        count: number, 
        sourceElement: HTMLElement, 
        targetElement: HTMLElement
    ): void {
        // 获取源格子和目标格子的位置
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // 创建飞行物品元素
        const flyingItem = document.createElement('div');
        flyingItem.className = 'flying-item';
        
        // 应用物品的样式
        flyingItem.textContent = item.itemName;
        flyingItem.setAttribute('data-item-level', item.itemLevel);
        
        // 如果数量大于1，添加数量标签
        if (count > 1) {
            const countLabel = document.createElement('div');
            countLabel.className = 'item-count';
            countLabel.textContent = count.toString();
            flyingItem.appendChild(countLabel);
        }
        
        // 设置初始位置和尺寸
        flyingItem.style.position = 'fixed';
        flyingItem.style.left = `${sourceRect.left}px`;
        flyingItem.style.top = `${sourceRect.top}px`;
        flyingItem.style.width = `${sourceRect.width}px`;
        flyingItem.style.height = `${sourceRect.height}px`;
        flyingItem.style.zIndex = '6000';
        flyingItem.style.background = 'rgba(60, 60, 100, 0.6)';
        flyingItem.style.borderRadius = '5px';
        flyingItem.style.display = 'flex';
        flyingItem.style.alignItems = 'center';
        flyingItem.style.justifyContent = 'center';
        flyingItem.style.color = '#fff';
        flyingItem.style.fontSize = '12px';
        flyingItem.style.boxShadow = '0 0 15px rgba(100, 200, 255, 0.7)';
        flyingItem.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        
        // 添加到文档中
        document.body.appendChild(flyingItem);
        
        // 强制回流，准备开始动画
        void flyingItem.offsetWidth;
        
        // 应用动画
        flyingItem.style.left = `${targetRect.left}px`;
        flyingItem.style.top = `${targetRect.top}px`;
        flyingItem.style.width = `${targetRect.width}px`;
        flyingItem.style.height = `${targetRect.height}px`;
        flyingItem.style.opacity = '0.8';
        flyingItem.style.transform = 'scale(0.8)';
        
        // 动画结束后移除元素
        flyingItem.addEventListener('transitionend', () => {
            if (flyingItem.parentNode) {
                flyingItem.parentNode.removeChild(flyingItem);
            }
            
            // 在目标格子添加高亮效果
            targetElement.classList.add('slot-highlight');
            setTimeout(() => {
                targetElement.classList.remove('slot-highlight');
            }, 300);
        });
    }
} 