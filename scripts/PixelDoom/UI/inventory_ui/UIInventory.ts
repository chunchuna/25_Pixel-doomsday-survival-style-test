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
    private isMainInventoryVisible: boolean = false;
    private otherInventoryInstance: HTMLDivElement | null = null;

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
        this.mainInventoryData = inventoryArray;
        this.mainInventoryRows = rows;
        this.mainInventoryColumns = columns;
        this.mainInventoryKey = key;
        
        this.renderMainInventory();
    }

    // 显示其他库存（如NPC或箱子库存）
    public ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number): { close: () => void } {
        this.otherInventoryData = inventoryArray;
        
        // 清除之前的其他库存实例
        if (this.otherInventoryInstance && this.otherInventoryInstance.parentNode) {
            this.otherInventoryInstance.parentNode.removeChild(this.otherInventoryInstance);
        }
        
        // 创建新的其他库存
        this.otherInventoryInstance = this.createInventoryContainer('other-inventory');
        document.body.appendChild(this.otherInventoryInstance);
        
        // 渲染其他库存
        this.renderOtherInventory(rows, columns);
        
        // 返回关闭方法
        return {
            close: () => {
                if (this.otherInventoryInstance && this.otherInventoryInstance.parentNode) {
                    this.otherInventoryInstance.parentNode.removeChild(this.otherInventoryInstance);
                    this.otherInventoryInstance = null;
                }
            }
        };
    }

    // 处理键盘按键
    private handleKeyPress(event: KeyboardEvent): void {
        if (event.key.toLowerCase() === this.mainInventoryKey.toLowerCase()) {
            this.toggleMainInventory();
        }
    }

    // 显示/隐藏主库存
    private toggleMainInventory(): void {
        this.isMainInventoryVisible = !this.isMainInventoryVisible;
        
        if (this.isMainInventoryVisible) {
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
    }

    // 创建库存容器
    private createInventoryContainer(id: string): HTMLDivElement {
        const container = document.createElement('div');
        container.id = id;
        container.className = 'inventory-container';
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
            this.mainInventoryColumns
        );
    }

    // 渲染其他库存
    private renderOtherInventory(rows: number, columns: number): void {
        if (this.otherInventoryInstance) {
            this.renderInventory(
                this.otherInventoryInstance,
                this.otherInventoryData,
                rows,
                columns
            );
        }
    }

    // 通用渲染库存方法
    private renderInventory(container: HTMLDivElement, items: Item[], rows: number, columns: number): void {
        // 清空容器
        container.innerHTML = '';
        
        // 创建库存网格
        const gridContainer = document.createElement('div');
        gridContainer.className = 'inventory-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 60px)`;
        
        // 分组物品，同名物品放在一起
        const groupedItems = this.groupItems(items);
        
        // 计算需要多少个格子
        const totalSlots = rows * columns;
        
        // 渲染物品到格子
        let slotIndex = 0;
        for (const [itemName, itemList] of groupedItems) {
            // 根据数量分组（每组最多64个）
            const itemGroups = this.splitIntoGroups(itemList, 64);
            
            for (const group of itemGroups) {
                if (slotIndex < totalSlots) {
                    const slot = this.createItemSlot(group, group.length);
                    gridContainer.appendChild(slot);
                    slotIndex++;
                } else {
                    // 如果格子不够放所有物品，就不再继续
                    console.warn('库存格子不足以显示所有物品');
                    break;
                }
            }
        }
        
        // 填充剩余的空格子
        for (let i = slotIndex; i < totalSlots; i++) {
            const emptySlot = this.createEmptySlot();
            gridContainer.appendChild(emptySlot);
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
    private createItemSlot(items: Item[], count: number): HTMLDivElement {
        if (items.length === 0) {
            return this.createEmptySlot();
        }
        
        const item = items[0]; // 同一组中所有物品都是相同的，所以取第一个
        
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
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
        
        slot.appendChild(itemElement);
        return slot;
    }

    // 创建空格子
    private createEmptySlot(): HTMLDivElement {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
        
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
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(25, 25, 25, 0.95);
                border: 2px solid #444;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                padding: 15px;
                z-index: 100;
                display: flex;
                flex-direction: column;
                max-height: 80vh;
                max-width: 90vw;
                opacity: 0;
            }
            
            /* 库存打开动画 */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            /* 库存关闭动画 */
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
            }
            
            .inventory-open {
                animation: fadeIn 0.3s ease-out forwards;
            }
            
            .inventory-close {
                animation: fadeOut 0.3s ease-out forwards;
            }
            
            /* 滚动条容器 */
            .inventory-scroll-container {
                overflow-y: auto;
                max-height: calc(80vh - 30px);
                padding-right: 10px;
                margin-right: -10px; /* 防止滚动条占用空间 */
                scrollbar-width: thin; /* Firefox */
            }
            
            /* 自定义滚动条 */
            .inventory-scroll-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-track {
                background: #222;
                border-radius: 4px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #777;
            }
            
            /* 库存网格 */
            .inventory-grid {
                display: grid;
                gap: 8px;
                width: 100%;
                grid-template-rows: repeat(auto-fill, minmax(60px, 60px));
                grid-auto-rows: 60px;
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
            }
            
            .inventory-slot.empty {
                background-color: #2a2a2a;
            }
            
            /* 格子高亮效果 */
            @keyframes pulseGlow {
                0% {
                    box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
                    border-color: #555;
                }
                50% {
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                    border-color: #888;
                }
                100% {
                    box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
                    border-color: #555;
                }
            }
            
            .slot-highlight {
                animation: pulseGlow 1.5s infinite;
                z-index: 5;
                border-color: #888;
                background-color: #444;
            }
            
            .slot-highlight.empty {
                background-color: #3a3a3a;
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
                cursor: pointer;
                position: relative;
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
                z-index: 200;
                color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
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
}

// 导出一个单例实例
export const inventoryManager = UIInventory.getInstance();

// 导出公共接口
export function BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): void {
    inventoryManager.BindPlayerMainInventory(inventoryArray, rows, columns, key);
}

export function ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number): { close: () => void } {
    return inventoryManager.ShowOtherInventory(inventoryArray, rows, columns);
}

// 重新导出类型
export type { ItemLevel, Item };

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    //测试item组
    var PlayerItems:Item[] =[{ itemName: "医疗包", itemDescribe: "恢复生命值", itemLevel: ItemLevel.A },
        { itemName: "医疗包", itemDescribe: "恢复生命值", itemLevel: ItemLevel.A },
        { itemName: "弹药", itemDescribe: "补充子弹", itemLevel: ItemLevel.B },]

    BindPlayerMainInventory(PlayerItems,5,30,"i")

})