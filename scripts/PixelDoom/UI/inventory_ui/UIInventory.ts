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

// 添加UIInventory接口声明，用于定义类型
interface IUIInventory {
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

// 库存UI管理类
class UIInventory implements IUIInventory {
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
    // 调整大小相关变量
    private isResizingWindow: boolean = false
    private resizedWindow: HTMLDivElement | null = null
    private windowResizeStartPos: { x: number, y: number, windowWidth: number, windowHeight: number } | null = null
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
    public BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): { unbind: () => void, oneline: () => void } {
        console.log("绑定主库存，当前单列模式记忆状态:", this.shouldMainInventoryUseOnelineMode);
        
        // 重置主库存数据，避免叠加
        this.mainInventoryData = [];
        this.slotPositions = [];

        // 重新赋值
        this.mainInventoryData = inventoryArray;
        this.mainInventoryRows = rows;
        this.mainInventoryColumns = columns;
        this.mainInventoryKey = key;
        
        // 检查并恢复上次的单列模式状态 - 保存临时变量
        const wasOneLineMode = this.shouldMainInventoryUseOnelineMode;
        // 确保isMainInventoryOnelineMode正确设置 - 这是渲染时会参考的变量
        this.isMainInventoryOnelineMode = wasOneLineMode;

        console.log("恢复后的单列模式状态:", this.isMainInventoryOnelineMode);

        // 先渲染库存
        this.renderMainInventory();

        // 创建解绑函数
        const unbindFunc = () => this.unbindMainInventory();

        // 创建oneline方法，保持对unbind的引用
        const onelineFunc = () => {
            // 如果当前不是单列模式，则切换到单列模式
            if (!this.isMainInventoryOnelineMode) {
                this.toggleMainInventoryOnelineMode();
            } else {
                // 如果已经是单列模式，仍然确保样式正确应用
                console.log("主库存已经是单列模式，强制应用单列样式");
                
                // 立即修改标志和记忆状态，确保状态一致
                this.isMainInventoryOnelineMode = true;
                this.shouldMainInventoryUseOnelineMode = true;
                
                setTimeout(() => {
                    if (this.mainInventoryContainer) {
                        // 在单列模式下调整窗口宽度
                        const newWidth = 300; // 更宽的窗口
                        const newHeight = Math.max(this.MainInventoryWindowSize[1], 500); // 保持高度或增加
                        
                        // 设置窗口尺寸
                        this.mainInventoryContainer.style.width = `${newWidth}px`;
                        this.mainInventoryContainer.style.height = `${newHeight}px`;
                        this.MainInventoryWindowSize = [newWidth, newHeight];
                        
                        // 调整网格适应窗口
                        this.adjustGridBasedOnWindowSize(this.mainInventoryContainer);
                        
                        // 额外强制应用单列模式样式到所有格子
                        const slots = this.mainInventoryContainer.querySelectorAll('.inventory-slot');
                        slots.forEach(slot => {
                            const slotElement = slot as HTMLElement;
                            slotElement.classList.add('oneline-slot');
                            slotElement.style.height = '30px';
                            
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
                        });
                        
                        console.log("主库存单列模式样式强制应用完成");
                    }
                }, 400); // 使用更长的延迟确保DOM已完全渲染
            }
            
            return {
                unbind: unbindFunc,
                oneline: onelineFunc
            };
        };

        // 如果上次是单列模式，立即应用单列模式样式 (使用setTimeout确保DOM已渲染)
        if (wasOneLineMode) {
            console.log("应用单列模式样式，延迟执行");
            // 使用较长的延迟确保渲染完成
            setTimeout(() => {
                if (this.mainInventoryContainer) {
                    console.log("开始应用单列模式样式");
                    
                    // 设置内部标志为单列模式
                    this.isMainInventoryOnelineMode = true;
                    this.shouldMainInventoryUseOnelineMode = true;
                    
                    // 在单列模式下调整窗口宽度
                    const newWidth = 300; // 更宽的窗口
                    const newHeight = Math.max(this.MainInventoryWindowSize[1], 500); // 保持高度或增加
                    
                    // 设置窗口尺寸
                    this.mainInventoryContainer.style.width = `${newWidth}px`;
                    this.mainInventoryContainer.style.height = `${newHeight}px`;
                    this.MainInventoryWindowSize = [newWidth, newHeight];
                    
                    // 调整网格以适应窗口
                    this.adjustGridBasedOnWindowSize(this.mainInventoryContainer);
                    
                    // 强制重新渲染一次
                    this.renderMainInventory();
                    
                    // 额外的延迟确保渲染完成后再应用样式
                    setTimeout(() => {
                        if (this.mainInventoryContainer) {
                            // 额外强制应用单列模式样式到所有格子
                            const slots = this.mainInventoryContainer.querySelectorAll('.inventory-slot');
                            slots.forEach(slot => {
                                const slotElement = slot as HTMLElement;
                                slotElement.classList.add('oneline-slot');
                                slotElement.style.height = '30px';
                                
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
                            });
                            
                            console.log("单列模式样式应用完成");
                        }
                    }, 100);
                }
            }, 500);
        }

        // 返回一个对象，其中包含解绑方法和单列模式切换方法
        return {
            unbind: unbindFunc,
            oneline: onelineFunc
        };
    }

    // 解绑主库存的方法
    public unbindMainInventory(): void {
        // 在解绑前记录当前单列模式状态
        // 注意：我们不修改 shouldMainInventoryUseOnelineMode，这确保状态被记忆
        const currentOnelineState = this.shouldMainInventoryUseOnelineMode;
        
        // 如果主库存当前显示，先隐藏它
        if (this.isMainInventoryVisible) {
            this.toggleMainInventory();
        }

        // 清空主库存数据
        this.mainInventoryData = [];
        this.slotPositions = [];
        this.mainInventoryRows = 0;
        this.mainInventoryColumns = 0;
        this.mainInventoryKey = '';

        // 移除键盘事件监听（如果有特定的处理器引用，可以更精确地移除）
        // 这里我们保留全局键盘监听器，因为它处理的不仅仅是主库存

        // 清除主库存回调
        this.mainInventoryCallback = null;

        // 重置内部单列模式状态标志，但保留记忆状态
        this.isMainInventoryOnelineMode = false; 
        // 确保记忆变量不变
        this.shouldMainInventoryUseOnelineMode = currentOnelineState;

        console.log("主库存已解绑，单列模式记忆状态保持为:", this.shouldMainInventoryUseOnelineMode);
    }

    // 显示其他库存（如NPC或箱子库存）
    public ShowOtherInventory(inventoryArray: Item[], rows: number, columns: number, updateInfo?: InventoryUpdateCallback, InventoryName?: string): { close: () => void, oneline: () => void } {
        // 确保库存名称有效且唯一
        const inventoryKey = InventoryName && InventoryName.trim() !== '' ? InventoryName.trim() : 'default';
        
        // 如果已有打开的其他库存，先关闭它
        if (this.closeOtherInventoryFunc) {
            this.closeOtherInventoryFunc();
        }

        // 保存实例更新信息
        this.updateCallback = updateInfo || null;

        // 保存原始库存数组的引用
        this.originalInventoryArray = inventoryArray;

        // 创建深拷贝，避免引用共享问题
        this.otherInventoryData = inventoryArray.map(item => ({ ...item }));

        // 保存行列信息，用于渲染和后续操作
        this.otherInventoryRows = rows;
        this.otherInventoryColumns = columns;

        // 清除之前的其他库存实例
        if (this.otherInventoryInstance && this.otherInventoryInstance.parentNode) {
            this.otherInventoryInstance.parentNode.removeChild(this.otherInventoryInstance);
        }

        // 创建新的其他库存
        this.otherInventoryInstance = this.createInventoryContainer('other-inventory');
        
        // 修改：先设置为不可见，防止闪烁
        this.otherInventoryInstance.style.opacity = '0';
        
        document.body.appendChild(this.otherInventoryInstance);
        
        // 将库存名称保存到实例元素属性中(关键步骤)
        this.otherInventoryInstance.setAttribute('data-inventory-name', inventoryKey);

        // 判断是否记录了窗口位置
        if (this.OtherInventoryWindowPosition[0] !== 0 || this.OtherInventoryWindowPosition[1] !== 0) {
            this.otherInventoryInstance.style.left = `${this.OtherInventoryWindowPosition[0]}px`;
            this.otherInventoryInstance.style.top = `${this.OtherInventoryWindowPosition[1]}px`;
            this.otherInventoryInstance.style.right = 'auto';
            this.otherInventoryInstance.style.transform = "none";
        } else {
            // 设置其他库存的初始位置（右侧）
            this.otherInventoryInstance.style.left = 'auto';
            this.otherInventoryInstance.style.right = '50px';
            this.otherInventoryInstance.style.top = '50%';
            this.otherInventoryInstance.style.transform = 'translateY(-50%)';
        }

        this.otherInventoryInstance.style.display = 'flex';

        // 应用记忆的窗口大小
        if (this.OtherInventoryWindowSize[0] > 0 && this.OtherInventoryWindowSize[1] > 0) {
            this.otherInventoryInstance.style.width = `${this.OtherInventoryWindowSize[0]}px`;
            this.otherInventoryInstance.style.height = `${this.OtherInventoryWindowSize[1]}px`;
        }

        // 立即添加调整大小按钮
        const resizeButton = document.createElement('button');
        resizeButton.className = 'inventory-resize-button';
        resizeButton.innerHTML = `<div class="resize-icon">
            <span></span>
        </div>`;
        resizeButton.title = '拖拽调整窗口大小';

        // 添加鼠标按下事件以开始调整大小
        resizeButton.addEventListener('mousedown', (e) => {
            //console.log('其他库存角标被点击');

            // 只响应左键点击
            if (e.button === 0) {
                this.isResizingWindow = true;
                this.resizedWindow = this.otherInventoryInstance;

                // 获取容器当前大小
                const rect = this.otherInventoryInstance!.getBoundingClientRect();
                this.windowResizeStartPos = {
                    x: e.clientX,
                    y: e.clientY,
                    windowWidth: rect.width,
                    windowHeight: rect.height
                };

                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.otherInventoryInstance.appendChild(resizeButton);
        //console.log('直接添加了其他库存的大小调整按钮');

        // 检查并应用记忆的单列模式状态
        const rememberedOnelineMode = this.otherInventoryTypeOnelineModes.get(inventoryKey);
        if (rememberedOnelineMode !== undefined) {
            console.log(`恢复其他库存(${inventoryKey})记忆的单列模式状态:`, rememberedOnelineMode);
            this.isOtherInventoryOnelineMode = rememberedOnelineMode;
        } else {
            // 默认状态：不使用单列模式
            this.isOtherInventoryOnelineMode = false;
        }

        // 渲染其他库存
        this.renderOtherInventory(rows, columns, InventoryName);

        // 避免闪烁：直接渲染完成后显示容器并添加动画
        // 使用requestAnimationFrame来确保DOM已更新
        requestAnimationFrame(() => {
            if (this.otherInventoryInstance) {
                // 添加开启动画类，同时设置为可见
                this.otherInventoryInstance.classList.add('inventory-open');
                this.otherInventoryInstance.style.opacity = '1';
                
                // 调整网格以适应窗口大小
                this.adjustGridBasedOnWindowSize(this.otherInventoryInstance);
                
                // 如果需要应用单列模式，额外确认样式正确应用
                if (this.isOtherInventoryOnelineMode) {
                    setTimeout(() => {
                        if (this.otherInventoryInstance) {
                            // 在单列模式下调整窗口宽度
                            const newWidth = 300; // 更宽的窗口
                            const newHeight = Math.max(this.OtherInventoryWindowSize[1], 500); // 保持高度或增加
                            
                            this.otherInventoryInstance.style.width = `${newWidth}px`;
                            this.otherInventoryInstance.style.height = `${newHeight}px`;
                            this.OtherInventoryWindowSize = [newWidth, newHeight];
                            
                            // 额外强制再次应用单列模式样式
                            this.adjustGridBasedOnWindowSize(this.otherInventoryInstance);
                        }
                    }, 100);
                }
            }
        });

        // 触发其他库存打开事件回调
        if (this.onOtherInventoryOpenCallback) {
            this.onOtherInventoryOpenCallback();
        }

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
            // 触发其他库存关闭事件回调
            if (this.onOtherInventoryCloseCallback) {
                this.onOtherInventoryCloseCallback();
            }

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
        
        // 创建更强大的oneline函数，支持记忆和强制应用
        const onelineFunc = () => {
            const inventoryName = this.otherInventoryInstance?.getAttribute('data-inventory-name') || 'default';
            
            // 如果当前不是单列模式，则切换到单列模式
            if (!this.isOtherInventoryOnelineMode) {
                this.toggleOtherInventoryOnelineMode(); 
            } else {
                // 如果已经是单列模式，仍然确保样式正确应用
                console.log(`其他库存(${inventoryName})已经是单列模式，强制应用单列样式`);
                
                // 设置状态变量
                this.isOtherInventoryOnelineMode = true;
                this.otherInventoryTypeOnelineModes.set(inventoryName, true);
                
                setTimeout(() => {
                    if (this.otherInventoryInstance) {
                        // 在单列模式下调整窗口宽度
                        const newWidth = 300; // 更宽的窗口
                        const newHeight = Math.max(this.OtherInventoryWindowSize[1], 500); // 保持高度或增加
                        
                        // 设置窗口尺寸
                        this.otherInventoryInstance.style.width = `${newWidth}px`;
                        this.otherInventoryInstance.style.height = `${newHeight}px`;
                        this.OtherInventoryWindowSize = [newWidth, newHeight];
                        
                        // 调整网格适应窗口
                        this.adjustGridBasedOnWindowSize(this.otherInventoryInstance);
                        
                        // 额外强制应用单列模式样式到所有格子
                        const slots = this.otherInventoryInstance.querySelectorAll('.inventory-slot');
                        slots.forEach(slot => {
                            const slotElement = slot as HTMLElement;
                            slotElement.classList.add('oneline-slot');
                            slotElement.style.height = '30px';
                            
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
                        });
                        
                        console.log(`其他库存(${inventoryName})单列模式样式强制应用完成`);
                    }
                }, 200); // 使用更长的延迟确保DOM已完全渲染
            }
        };

        // 返回关闭方法、获取当前库存数据的方法和单列模式切换方法
        return {
            close: closeOtherInventory,
            oneline: onelineFunc
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
    // todo 库存窗口操作相关
    public toggleMainInventory(): void {
        this.isMainInventoryVisible = !this.isMainInventoryVisible;

        if (this.isMainInventoryVisible) {
            // 判断是否已经记录了窗口的位置
            if (this.MainInventoryWindowPosition[0] !== 0 || this.MainInventoryWindowPosition[1] !== 0) {
                this.mainInventoryContainer.style.left = `${this.MainInventoryWindowPosition[0]}px`;
                this.mainInventoryContainer.style.top = `${this.MainInventoryWindowPosition[1]}px`;
                this.mainInventoryContainer.style.transform = 'none'
            } else {
                // 根据默认位置设置初始位置（左侧）
                this.mainInventoryContainer.style.left = '50px';
                this.mainInventoryContainer.style.top = '50%';
                this.mainInventoryContainer.style.transform = 'translateY(-50%)';
            }

            // 应用记忆的窗口大小
            if (this.MainInventoryWindowSize[0] > 0 && this.MainInventoryWindowSize[1] > 0) {
                this.mainInventoryContainer.style.width = `${this.MainInventoryWindowSize[0]}px`;
                this.mainInventoryContainer.style.height = `${this.MainInventoryWindowSize[1]}px`;
            }

            // 先设置为不可见，防止闪烁
            this.mainInventoryContainer.style.opacity = '0';
            this.mainInventoryContainer.style.display = 'flex';

            // 确保调整大小按钮存在且可见
            this.ensureResizeButtonExists(this.mainInventoryContainer);

            // 使用requestAnimationFrame确保DOM更新后再应用动画
            requestAnimationFrame(() => {
                // 移除关闭动画类
                this.mainInventoryContainer.classList.remove('inventory-close');
                
                // 添加打开动画类并设置为可见
                this.mainInventoryContainer.classList.add('inventory-open');
                this.mainInventoryContainer.style.opacity = '1';
                
                // 调整网格以适应窗口大小
                setTimeout(() => {
                    this.adjustGridBasedOnWindowSize(this.mainInventoryContainer);
                }, 50);
            });

            // 触发主库存打开事件回调
            if (this.onMainInventoryOpenCallback) {
                this.onMainInventoryOpenCallback();
            }
        } else {
            // 触发主库存关闭事件回调
            if (this.onMainInventoryCloseCallback) {
                this.onMainInventoryCloseCallback();
            }

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

        // 处理窗口大小调整
        if (this.isResizingWindow && this.resizedWindow && this.windowResizeStartPos) {
            // 添加resizing类以应用样式
            if (!this.resizedWindow.classList.contains('resizing')) {
                this.resizedWindow.classList.add('resizing');
                //console.log('窗口正在调整大小'); // 添加调试信息
            }

            const dx = event.clientX - this.windowResizeStartPos.x;
            const dy = event.clientY - this.windowResizeStartPos.y;

            // 计算新的宽度和高度（设置最小值以避免窗口过小）
            const newWidth = Math.max(225, this.windowResizeStartPos.windowWidth + dx);
            const newHeight = Math.max(380, this.windowResizeStartPos.windowHeight + dy);

            // 更新窗口大小
            this.resizedWindow.style.width = `${newWidth}px`;
            this.resizedWindow.style.height = `${newHeight}px`;

            // 保存窗口大小信息
            if (this.resizedWindow.id === 'main-inventory') {
                this.MainInventoryWindowSize = [newWidth, newHeight];
                //console.log('主库存窗口大小已更新:', newWidth, newHeight); // 添加调试信息
            } else if (this.resizedWindow.id === 'other-inventory') {
                this.OtherInventoryWindowSize = [newWidth, newHeight];
                //console.log('其他库存窗口大小已更新:', newWidth, newHeight); // 添加调试信息
            }

            // 自动调整网格容器
            this.adjustGridBasedOnWindowSize(this.resizedWindow);
        }
    }

    // 添加方法调整网格布局以适应窗口大小
    private adjustGridBasedOnWindowSize(container: HTMLDivElement): void {
        // 找到对应的网格容器
        const gridContainer = container.querySelector('.inventory-grid') as HTMLDivElement;
        if (!gridContainer) {
            console.warn('无法找到网格容器');
            return;
        }

        // 判断是否是单列模式
        const isOnelineMode = (container.id === 'main-inventory' && this.isMainInventoryOnelineMode) || 
                             (container.id === 'other-inventory' && this.isOtherInventoryOnelineMode);
        
        // 获取当前的列数
        let columns: number;
        if (container.id === 'main-inventory') {
            columns = isOnelineMode ? 1 : this.mainInventoryColumns;
        } else {
            columns = isOnelineMode ? 1 : this.otherInventoryColumns;
        }

        // 获取窗口的宽度
        const containerWidth = container.clientWidth;

        // 计算可以放置的每个格子的大小（考虑固定间隔）
        // 减去左右内边距和格子间隔
        const availableWidth = containerWidth - 40; // 内边距
        const gapWidth = 5 * (columns - 1); // 所有格子间隔的总宽度
        const slotSize = isOnelineMode ? availableWidth : Math.floor((availableWidth - gapWidth) / columns); // 计算每个格子的大小

        //console.log(`调整格子大小: ${slotSize}px, 容器宽度: ${containerWidth}px, 列数: ${columns}, 单列模式: ${isOnelineMode}`);

        // 首先更新网格容器的列宽定义，确保固定列数
        if (isOnelineMode) {
            gridContainer.style.gridTemplateColumns = `1fr`; // 单列模式下使用1fr
            gridContainer.setAttribute('data-oneline', 'true'); // 添加自定义属性标记单列模式
        } else {
            gridContainer.style.gridTemplateColumns = `repeat(${columns}, ${slotSize}px)`;
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
        
        // 如果是单列模式，额外强制设置容器样式，防止样式失效
        if (isOnelineMode) {
            container.setAttribute('data-oneline-mode', 'true');
            
            // 如果是主库存，更新记忆变量
            if (container.id === 'main-inventory') {
                this.isMainInventoryOnelineMode = true;
                this.shouldMainInventoryUseOnelineMode = true;
            }
        } else {
            container.removeAttribute('data-oneline-mode');
        }
    }

    // 处理鼠标抬起事件（放置拖拽物品）
    private handleMouseUp(event: MouseEvent): void {
        // 处理窗口拖拽结束
        if (this.isDraggingWindow) {
            // 保存窗口位置
            if (this.draggedWindow) {
                // 拿到窗口的rect
                var rect = this.draggedWindow.getBoundingClientRect();
                // 根据窗口的类别分别记录为位置
                if (this.draggedWindow.id === 'main-inventory') {
                    this.MainInventoryWindowPosition = [rect.left, rect.top]

                } else if (this.draggedWindow.id === 'other-inventory') {
                    this.OtherInventoryWindowPosition = [rect.left, rect.top]

                }

            }

            this.isDraggingWindow = false;
            this.draggedWindow = null;
            this.windowDragStartPos = null;
            return;
        }

        // 处理窗口大小调整结束
        if (this.isResizingWindow) {
            // 移除resizing类
            if (this.resizedWindow && this.resizedWindow.classList.contains('resizing')) {
                this.resizedWindow.classList.remove('resizing');
            }

            this.isResizingWindow = false;
            this.resizedWindow = null;
            this.windowResizeStartPos = null;
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

        // 保存滚动位置并禁用滚动动画
        const scrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
        if (scrollContainer) {
            this.mainInventoryScrollPosition = scrollContainer.scrollTop;
            scrollContainer.style.scrollBehavior = 'auto';
        }

        // 设置标记表示正在处理物品拖拽
        this.isHandlingItemDrag = true;
        
        // 重新渲染主库存
        this.renderMainInventory();

        // 触发主库存更新回调
        this.triggerMainInventoryCallback();
        
        // 处理完毕后清除标记
        this.isHandlingItemDrag = false;
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
        // 设置正在处理物品拖拽的标记
        this.isHandlingItemDrag = true;

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
                // 最后清理拖拽标记
                this.isHandlingItemDrag = false;
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
                // 最后清理拖拽标记
                this.isHandlingItemDrag = false;
            }
        };

        // 添加一次性鼠标释放监听
        document.addEventListener('mouseup', mouseUpHandler);
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

        // 创建一个明确的尺寸调整按钮（完全重新设计）
        const resizeButton = document.createElement('button');
        resizeButton.className = 'inventory-resize-button';
        resizeButton.textContent = '↘'; // 使用明确的方向箭头
        resizeButton.title = '拖拽调整窗口大小';

        //console.log('创建拖拽尺寸角标'); // 添加调试信息

        // 添加鼠标按下事件以开始调整大小
        resizeButton.addEventListener('mousedown', (e) => {
            //console.log('角标被点击'); // 添加调试信息

            // 只响应左键点击
            if (e.button === 0) {
                this.isResizingWindow = true;
                this.resizedWindow = container;

                // 获取容器当前大小
                const rect = container.getBoundingClientRect();
                this.windowResizeStartPos = {
                    x: e.clientX,
                    y: e.clientY,
                    windowWidth: rect.width,
                    windowHeight: rect.height
                };

                e.preventDefault(); // 防止选中文本
                e.stopPropagation(); // 阻止事件冒泡
            }
        });

        container.appendChild(resizeButton);

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
        // 保存是否处于拖拽状态的标志
        const wasHandlingDrag = this.isHandlingItemDrag;
        
        // 保存当前滚动位置
        let mainScrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
        if (mainScrollContainer) {
            this.mainInventoryScrollPosition = mainScrollContainer.scrollTop;
        }
        
        // 创建一个克隆的HTML结构用于渲染，避免直接操作可见DOM
        let currentGrid = null;
        let mainGridClone = null;
        
        if (wasHandlingDrag && mainScrollContainer) {
            // 禁用滚动条过渡动画
            mainScrollContainer.style.scrollBehavior = 'auto';
            
            // 仅在拖拽操作时保留滚动容器，只更新网格内容
            currentGrid = mainScrollContainer.querySelector('.inventory-grid');
            if (currentGrid) {
                // 克隆当前网格结构
                mainGridClone = currentGrid.cloneNode(false);
            }
        }
        
        this.renderInventory(
            this.mainInventoryContainer,
            this.mainInventoryData,
            this.mainInventoryRows,
            this.mainInventoryColumns,
            // 传递一个标识，表示这是主库存
            false
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

    // 渲染其他库存 - 移除滚动位置记忆
    private renderOtherInventory(rows: number, columns: number, InventoryName?: string): void {
        // 保存是否处于拖拽状态的标志
        const wasHandlingDrag = this.isHandlingItemDrag;
        
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
        
        // 恢复拖拽状态标志
        this.isHandlingItemDrag = wasHandlingDrag;
    }

    // 通用渲染库存方法 - 修改滚动容器的创建方式
    private renderInventory(container: HTMLDivElement, items: Item[], rows: number, columns: number, isOtherInventory: boolean = false, InventoryName?: string): void {
        // 保存原有的滚动容器，以便稍后重用
        const existingScrollContainer = container.querySelector('.inventory-scroll-container') as HTMLElement;
        let savedScrollTop = 0;
        
        // 如果是主库存且在拖拽状态，保存滚动位置
        if (!isOtherInventory && this.isHandlingItemDrag && existingScrollContainer) {
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
            this.ensureResizeButtonExists(container);
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

            // 添加R键整理背包的提示文本
            const promptSpan = document.createElement('span');
            promptSpan.className = 'inventory-prompt';
            promptSpan.textContent = '[R]整理背包';

            headerDiv.appendChild(titleSpan);
            //headerDiv.appendChild(sortButton);
            headerDiv.appendChild(promptSpan);
        } else {
            // 添加其他库存的标题
            const titleSpan = document.createElement('span');
            titleSpan.className = 'inventory-title';
            if (InventoryName) {
                titleSpan.textContent = InventoryName;
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

        container.appendChild(headerDiv);

        // 创建库存网格
        const gridContainer = document.createElement('div');
        gridContainer.className = 'inventory-grid';

        // 判断是否是单列模式
        const isOnelineMode = (container.id === 'main-inventory' && this.isMainInventoryOnelineMode) || 
                            (container.id === 'other-inventory' && this.isOtherInventoryOnelineMode);
                            
        // 明确设置固定的列数和间隔
        if (isOnelineMode) {
            gridContainer.style.gridTemplateColumns = `1fr`; // 单列模式
        } else {
            gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }
        gridContainer.style.gap = '5px'; // 设置格子之间的固定间隔

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

        // 添加滚动条容器 - 对主库存特殊处理
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'inventory-scroll-container';
        
        // 如果是主库存且在拖拽操作中，设置滚动行为为自动(避免平滑滚动动画)
        if (!isOtherInventory && this.isHandlingItemDrag) {
            scrollContainer.style.scrollBehavior = 'auto';
        }
        
        scrollContainer.appendChild(gridContainer);
        container.appendChild(scrollContainer);
        
        // 如果是主库存且在拖拽状态，立即恢复滚动位置
        if (!isOtherInventory && this.isHandlingItemDrag) {
            if (savedScrollTop > 0 || this.mainInventoryScrollPosition > 0) {
                scrollContainer.scrollTop = savedScrollTop || this.mainInventoryScrollPosition;
            }
        }
        
        // 在非拖拽状态下调整格子大小
        if (!this.isHandlingItemDrag) {
            setTimeout(() => {
                this.adjustGridBasedOnWindowSize(container);
            }, 0);
        } else {
            // 即使在拖拽状态下，也要保持单列模式的样式
            setTimeout(() => {
                // 保持单列模式的布局
                if ((container.id === 'main-inventory' && this.isMainInventoryOnelineMode) || 
                    (container.id === 'other-inventory' && this.isOtherInventoryOnelineMode)) {
                    this.applyOnelineModeStyles(container);
                }
            }, 0);
        }
    }
    
    // 新增方法：为容器应用单列模式样式，即使在拖拽状态
    private applyOnelineModeStyles(container: HTMLDivElement): void {
        // 获取窗口的宽度
        const containerWidth = container.clientWidth;
        const availableWidth = containerWidth - 40; // 内边距
        
        // 获取网格容器并设置为1fr
        const gridContainer = container.querySelector('.inventory-grid') as HTMLDivElement;
        if (gridContainer) {
            gridContainer.style.gridTemplateColumns = `1fr`;
        }
        
        // 应用单列样式到所有格子
        const slots = container.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            const slotElement = slot as HTMLElement;
            slotElement.style.width = `${availableWidth}px`;
            slotElement.style.height = `30px`;
            slotElement.classList.add('oneline-slot');
            
            // 查找物品元素并添加单列样式
            const itemElement = slotElement.querySelector('.inventory-item');
            if (itemElement) {
                itemElement.classList.add('oneline-item');
                
                // 查找数量标签并添加单列样式
                const countLabel = itemElement.querySelector('.item-count');
                if (countLabel) {
                    countLabel.classList.add('oneline-count');
                }
            }
        });
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
        
        // 检查是否为单列模式，添加相应的类
        const isOnelineMode = (inventoryType === 'main' && this.isMainInventoryOnelineMode) || 
                             (inventoryType === 'other' && this.isOtherInventoryOnelineMode);
        if (isOnelineMode) {
            slot.classList.add('oneline-slot');
        }
        
        slot.setAttribute('data-slot-index', slotIndex.toString());
        slot.setAttribute('data-inventory-type', inventoryType);

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
            if (e.button === 0) {
                this.startDrag(item, count, slotIndex, itemElement, e, inventoryType);
                e.preventDefault(); // 防止选中文本
            }
            // 添加右键点击快速拾取功能（仅对其他库存有效）
            else if (e.button === 2 && inventoryType === 'other') {
                // 调用快速拾取方法
                this.handleQuickPickup(item, count, slotIndex);
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
    private createEmptySlot(slotIndex: number, inventoryType: 'main' | 'other'): HTMLDivElement {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
        
        // 检查是否为单列模式，添加相应的类
        const isOnelineMode = (inventoryType === 'main' && this.isMainInventoryOnelineMode) || 
                             (inventoryType === 'other' && this.isOtherInventoryOnelineMode);
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
                background-color: #000000;
                border: 1px solid #333333;
                border-radius: 2px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                padding: 10px;
                display: flex;
                flex-direction: column;
                width: 225px;
                height: 380px;
                opacity: 0;
                z-index: 5000;
                font-family: Arial, sans-serif;
                color: #d0d0d0;
                resize: none;
                overflow: hidden;
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
            }
            
            /* 新创建的库存容器初始状态 */
            .inventory-container:not(.inventory-open):not(.inventory-close) {
                opacity: 0;
                transform: scale(0.95);
            }
            
            /* 库存拖拽句柄 */
            .inventory-drag-handle {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 26px;
                cursor: move;
                z-index: 5002;
                user-select: none;
            }
            
            /* 调整大小按钮样式 */
            .inventory-resize-button {
                position: absolute;
                bottom: 3px;
                right: 3px;
                width: 10px;
                height: 10px;
                cursor: nwse-resize;
                z-index: 5010;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
                pointer-events: auto;
                opacity: 0.7;
            }
            
            /* 调整大小指示器的图标 */
            .resize-icon {
                position: relative;
                width: 100%;
                height: 100%;
                border-right: 2px solid #3a3a3a;
                border-bottom: 2px solid #3a3a3a;
            }
            
            /* 按钮悬停效果 */
            .inventory-resize-button:hover {
                opacity: 1;
            }
            
            /* 按钮激活效果 */
            .inventory-resize-button:active,
            .inventory-container.resizing .inventory-resize-button {
                opacity: 1;
            }
            
            /* 库存头部样式 */
            .inventory-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333333;
                color: #e0e0e0;
                z-index: 5001;
                pointer-events: auto;
                background-color: rgba(0, 0, 0, 0.29);
                padding: 5px 10px;
                border-radius: 2px;
                height: 15px;
            }
            
            /* 为库存类型添加不同的颜色 */
            #main-inventory .inventory-header {
                border-bottom-color: #333333;
            }
            
            #other-inventory .inventory-header {
                border-bottom-color: #333333;
            }
            
            .inventory-title {
                font-size: 11px;
                font-weight: normal;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 50%;
                text-align: left;
            }
            
            /* 提示文本样式 */
            .inventory-header span:last-child {
                font-size: 11px;
                font-style: italic;
                color: #aaaaaa;
                white-space: nowrap;
                text-align: right;
            }
            
            .sort-button, .close-button {
                background-color: #222222;
                color: #d0d0d0;
                border: 1px solid #333333;
                border-radius: 2px;
                padding: 5% 10% !important; 
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 5001;
                width: 20% !important; 
                height: 15% !important; 
                box-sizing: border-box; 
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px; 
                white-space: nowrap; 
            }
            
            .sort-button:hover, .close-button:hover {
                background-color: #333333;
                color: #ffffff;
            }
            
            .close-button {
                background-color: #332222;
            }
            
            .close-button:hover {
                background-color: #553333;
            }
            
            /* 库存打开动画 */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* 库存关闭动画 */
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }
            
            .inventory-open {
                animation: fadeIn 0.2s ease-out forwards;
            }
            
            .inventory-close {
                animation: fadeOut 0.2s ease-out forwards;
            }
            
            /* 整理完成通知 */
            .inventory-notification {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #000000;
                color: #e0e0e0;
                padding: 10px 20px;
                border-radius: 2px;
                border: 1px solid #333333;
                font-size: 14px;
                z-index: 5001;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                animation: notification-appear 0.2s ease-out;
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
                animation: notification-disappear 0.2s ease-out forwards;
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
                    transform: scale(1.1);
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
                margin-right: -10px;
                scrollbar-width: thin;
                scrollbar-color: #333333 #000000;
                width: 100%;
            }
            
            /* 自定义滚动条 */
            .inventory-scroll-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-track {
                background: #000000;
                border-radius: 2px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb {
                background-color: #333333;
                border-radius: 2px;
                border: 1px solid #000000;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb:hover {
                background-color: #444444;
            }
            
            /* 库存网格 */
            .inventory-grid {
                display: grid;
                gap: 5px;
                width: 100%;
                grid-auto-rows: auto;
                justify-content: start;
            }
            
            /* 为主库存和其他库存设置不同的默认位置和视觉样式 */
            #main-inventory {
                left: 25px;
                top: 50%;
                border-color: #333333;
            }
            
            #other-inventory {
                right: 50px;
                top: 50%;
                border-color: #333333;
            }
            
            /* 物品格子 */
            .inventory-slot {
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                aspect-ratio: 1 / 1;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                transition: all 0.2s ease;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                margin: 0;
                padding: 0;
            }
            
            .inventory-slot.empty {
                background-color: #0a0a0a;
            }
            
            /* 格子高亮效果 */
            .slot-highlight {
                border-color: #444444;
                background-color: #222222;
                box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
                z-index: 5001;
            }
            
            .slot-highlight.empty {
                background-color: #161616;
            }
            
            /* 源格子样式（拖拽来源） */
            .source-slot {
                background-color: #1a1a1a;
                border: 1px dashed #444444;
                opacity: 0.8;
            }
            
            /* 目标格子样式（可放置区域） */
            .target-slot {
                background-color: #222222;
                border: 1px solid #444444;
                box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
            }
            
            /* 物品样式 */
            .inventory-item {
                width: 90%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e0e0e0;
                font-size: 10px;
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
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                transform: scale(0.8);
                cursor: grabbing;
            }
            
            /* 物品选中效果 */
            .inventory-item.selected {
                transform: scale(1.05);
                background-color: #222222;
            }
            
            /* 物品数量标签 */
            .item-count {
                position: absolute;
                bottom: 2px;
                left: 2px;
                background-color: #000000;
                color: #e0e0e0;
                font-size: 8px;
                padding: 1px 4px;
                border-radius: 2px;
                pointer-events: none;
            }
            
            /* 物品描述面板 */
            .item-description-panel {
                position: fixed;
                background-color: #000000;
                border: 1px solid #333333;
                border-radius: 2px;
                padding: 10px;
                min-width: 200px;
                max-width: 300px;
                z-index: 5002;
                color: #e0e0e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .item-description-panel[style*="display: block"] {
                opacity: 1;
            }
            
            .item-name {
                font-size: 14px;
                font-weight: normal;
                margin-bottom: 5px;
                padding-bottom: 5px;
                border-bottom: 1px solid #333333;
            }
            
            .item-level {
                margin-bottom: 5px;
                font-size: 12px;
            }
            
            .item-description {
                font-size: 12px;
                line-height: 1.4;
            }
            
            /* 不同等级的颜色 */
            .level-top, .item-name[data-level="TOP"] {
                color: #e6c000;
            }
            
            .level-s, .item-name[data-level="S"] {
                color: #e65000;
            }
            
            .level-a\\+, .item-name[data-level="A+"] {
                color: #e60000;
            }
            
            .level-a, .item-name[data-level="A"] {
                color: #e63060;
            }
            
            .level-b, .item-name[data-level="B"] {
                color: #8030e0;
            }
            
            .level-c, .item-name[data-level="C"] {
                color: #3090e0;
            }
            
            .level-d, .item-name[data-level="D"] {
                color: #30c030;
            }
            
            .level-e, .item-name[data-level="E"] {
                color: #c0c0c0;
            }
            
            .level-low, .item-name[data-level="LOW"] {
                color: #909090;
            }
            
            .level-break, .item-name[data-level="BREAK"] {
                color: #606060;
            }
            
            /* 单列模式下的格子样式 */
            .inventory-slot.oneline-slot {
                border-radius: 2px;
                height: 30px !important;
                width: 100% !important;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                padding: 0 10px;
                box-sizing: border-box;
                margin-bottom: 2px;
            }
            
            /* 单列模式下的物品样式 */
            .inventory-item.oneline-item {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                font-size: 11px;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            /* 单列模式下的数量标签样式 */
            .item-count.oneline-count {
                position: static;
                margin-left: auto;
                margin-right: 5px;
                padding: 1px 5px;
                font-size: 10px;
                background-color: #000000;
                border-radius: 2px;
            }
            
            /* 单列模式下的高亮效果 */
            .oneline-slot.slot-highlight {
                background-color: #222222;
                border-color: #444444;
            }
            
            /* 单列模式下的源格子样式 */
            .oneline-slot.source-slot {
                background-color: #1a1a1a;
                border: 1px dashed #444444;
            }
            
            /* 单列模式下的目标格子样式 */
            .oneline-slot.target-slot {
                background-color: #222222;
                border: 1px solid #444444;
            }
            
            /* 飞行物品样式 */
            .flying-item {
                position: fixed;
                pointer-events: none;
                z-index: 6000;
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e0e0e0;
                font-size: 11px;
                text-align: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            /* 飞行物品数量标签 */
            .flying-item .item-count {
                position: absolute;
                bottom: 2px;
                right: 2px;
                background-color: #000000;
                color: #e0e0e0;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 2px;
            }
            
            /* 飞行物品高亮效果 */
            .flying-item {
                opacity: 0.9;
            }
            
            /* 提示文本样式 */
            .inventory-prompt {
                font-size: 11px;
                font-style: italic;
                color: #aaaaaa;
                white-space: nowrap;
                text-align: right;
                margin-left: auto;
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

        // 仅保存主库存的滚动位置
        const mainScrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
        if (mainScrollContainer) {
            this.mainInventoryScrollPosition = mainScrollContainer.scrollTop;
            // 禁用滚动动画
            mainScrollContainer.style.scrollBehavior = 'auto';
        }

        // 在处理物品传输前设置标记
        this.isHandlingItemDrag = true;

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
        
        // 处理完毕后清除标记
        this.isHandlingItemDrag = false;
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

    // 处理其他库存内部的拖拽 - 移除滚动位置记忆
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

        // 设置标记表示正在处理物品拖拽
        this.isHandlingItemDrag = true;

        // 重新渲染其他库存，保持行列不变
        this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
        
        // 处理完毕后清除标记
        this.isHandlingItemDrag = false;
    }

    // 更新其他库存的数据数组
    private updateOtherInventoryData(item: Item, count: number, action: 'add' | 'remove'): void {
        if (action === 'add') {
            // 添加物品到其他库存数组
            for (let i = 0; i < count; i++) {
                this.otherInventoryData.push({ ...item }); // 使用对象深拷贝，确保不共享引用
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
                    items.push({ ...item });
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
                this.originalInventoryArray!.push({ ...item });
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
                        items.push({ ...slot.item });
                    }
                }
            }
            // 触发回调函数
            this.mainInventoryCallback(items);
        }
    }

    // 清理角标按钮
    private cleanupResizeButtons(): void {
        // 移除所有已存在的调整大小按钮，防止重复添加
        const allButtons = document.querySelectorAll('.inventory-resize-button');
        allButtons.forEach(button => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
    }

    // 确保调整大小按钮存在并可见
    private ensureResizeButtonExists(container: HTMLDivElement): void {
        // 先移除容器中已存在的所有调整大小按钮
        const existingButtons = container.querySelectorAll('.inventory-resize-button');
        existingButtons.forEach(button => container.removeChild(button));

        // 创建一个新的调整大小按钮
        //console.log(`为容器 ${container.id} 创建调整大小按钮`);

        const resizeButton = document.createElement('button');
        resizeButton.className = 'inventory-resize-button';
        resizeButton.innerHTML = `<div class="resize-icon">
            <span></span>
        </div>`;
        resizeButton.title = '拖拽调整窗口大小';

        // 设置按钮样式确保可见
        resizeButton.style.display = 'flex';

        // 添加鼠标按下事件以开始调整大小
        resizeButton.addEventListener('mousedown', (e) => {
            // 只响应左键点击
            if (e.button === 0) {
                this.isResizingWindow = true;
                this.resizedWindow = container;

                // 获取容器当前大小
                const rect = container.getBoundingClientRect();
                this.windowResizeStartPos = {
                    x: e.clientX,
                    y: e.clientY,
                    windowWidth: rect.width,
                    windowHeight: rect.height
                };

                e.preventDefault();
                e.stopPropagation();
            }
        });

        container.appendChild(resizeButton);
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
      this.hideItemDescription();
      
      // 清理任何拖拽中的物品
      if (this.draggedItemGhost && this.draggedItemGhost.parentNode) {
        this.draggedItemGhost.parentNode.removeChild(this.draggedItemGhost);
      }
      
      // 重置拖拽状态
      this.draggedItem = null;
      this.draggedItemGhost = null;
      this.clickStartPos = null;
      this.isDragging = false;
    }

    // 添加主库存单列模式切换方法
    private toggleMainInventoryOnelineMode(): void {
        this.isMainInventoryOnelineMode = !this.isMainInventoryOnelineMode;
        // 记录当前状态，以便下次绑定时恢复
        this.shouldMainInventoryUseOnelineMode = this.isMainInventoryOnelineMode;
        
        console.log("切换主库存单列模式状态为:", this.isMainInventoryOnelineMode, 
            "记忆状态为:", this.shouldMainInventoryUseOnelineMode);
        
        if (this.isMainInventoryVisible) {
            // 先重新渲染库存内容
            this.renderMainInventory();
            
            // 调整窗口大小以适应单列模式
            if (this.isMainInventoryOnelineMode) {
                // 在单列模式下调整窗口宽度
                const newWidth = 300; // 更宽的窗口
                const newHeight = Math.max(this.MainInventoryWindowSize[1], 500); // 保持高度或增加
                
                this.mainInventoryContainer.style.width = `${newWidth}px`;
                this.mainInventoryContainer.style.height = `${newHeight}px`;
                this.MainInventoryWindowSize = [newWidth, newHeight];
            } else {
                // 恢复原来的窗口尺寸比例
                const newWidth = Math.max(225, this.MainInventoryWindowSize[0]);
                const newHeight = Math.max(380, this.MainInventoryWindowSize[1]);
                
                this.mainInventoryContainer.style.width = `${newWidth}px`;
                this.mainInventoryContainer.style.height = `${newHeight}px`;
            }
            
            // 调整网格以适应窗口大小
            setTimeout(() => {
                this.adjustGridBasedOnWindowSize(this.mainInventoryContainer);
                
                // 如果是单列模式，额外应用样式以确保正确显示
                if (this.isMainInventoryOnelineMode) {
                    // 额外强制应用单列模式样式到所有格子
                    const slots = this.mainInventoryContainer.querySelectorAll('.inventory-slot');
                    slots.forEach(slot => {
                        const slotElement = slot as HTMLElement;
                        slotElement.classList.add('oneline-slot');
                        slotElement.style.height = '30px';
                        
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
                    });
                    
                    console.log("主库存单列模式样式应用完成");
                }
            }, 200);
        }
    }
    
    // 添加其他库存单列模式切换方法
    private toggleOtherInventoryOnelineMode(): void {
        // 获取当前库存名称
        const inventoryName = this.otherInventoryInstance ? 
            this.otherInventoryInstance.getAttribute('data-inventory-name') || 'default' : 'default';
            
        // 切换状态
        this.isOtherInventoryOnelineMode = !this.isOtherInventoryOnelineMode;
        
        // 保存当前单列模式状态到Map中（这是重要的记忆部分）
        this.otherInventoryTypeOnelineModes.set(inventoryName, this.isOtherInventoryOnelineMode);
        
        console.log(`切换其他库存(${inventoryName})单列模式状态为:`, this.isOtherInventoryOnelineMode, 
            "记忆状态为:", this.otherInventoryTypeOnelineModes.get(inventoryName));
        
        // 如果实例可用，更新UI
        if (this.otherInventoryInstance) {
            // 先渲染库存内容
            this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns, inventoryName);
            
            // 调整窗口大小以适应单列模式
            if (this.isOtherInventoryOnelineMode) {
                // 在单列模式下调整窗口宽度
                const newWidth = 300; // 更宽的窗口
                const newHeight = Math.max(this.OtherInventoryWindowSize[1], 500); // 保持高度或增加
                
                this.otherInventoryInstance.style.width = `${newWidth}px`;
                this.otherInventoryInstance.style.height = `${newHeight}px`;
                this.OtherInventoryWindowSize = [newWidth, newHeight];
            } else {
                // 恢复原来的窗口尺寸比例
                const newWidth = Math.max(225, this.OtherInventoryWindowSize[0]);
                const newHeight = Math.max(380, this.OtherInventoryWindowSize[1]);
                
                this.otherInventoryInstance.style.width = `${newWidth}px`;
                this.otherInventoryInstance.style.height = `${newHeight}px`;
            }
            
            // 调整网格以适应窗口大小 - 使用更长的延迟并强制应用样式
            setTimeout(() => {
                if (this.otherInventoryInstance) {
                    this.adjustGridBasedOnWindowSize(this.otherInventoryInstance);
                    
                    // 如果是单列模式，额外应用样式以确保正确显示
                    if (this.isOtherInventoryOnelineMode) {
                        // 额外强制应用单列模式样式到所有格子
                        const slots = this.otherInventoryInstance.querySelectorAll('.inventory-slot');
                        slots.forEach(slot => {
                            const slotElement = slot as HTMLElement;
                            slotElement.classList.add('oneline-slot');
                            slotElement.style.height = '30px';
                            
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
                        });
                        
                        console.log("其他库存单列模式样式应用完成");
                    }
                }
            }, 200);
        }
    }

    // 处理快速拾取物品（右键点击）
    private handleQuickPickup(item: Item, count: number, sourceSlot: number): void {
        // 检查是否启用了快速拾取功能且主库存是否打开
        if (!this.IsQuickPickUpItem || !this.isMainInventoryVisible) {
            return;
        }
        
        // 获取其他库存中的源物品信息
        const otherInventorySlots = this.getOtherInventorySlots();
        const sourceItemInfo = otherInventorySlots[sourceSlot];
        
        if (!sourceItemInfo.item) return;
        
        // 查找主库存中合适的位置放置物品
        let targetSlot = -1;
        
        // 首先尝试找到相同物品的格子并合并
        for (let i = 0; i < this.slotPositions.length; i++) {
            const slotItem = this.slotPositions[i].item;
            if (slotItem && slotItem.itemName === item.itemName && this.slotPositions[i].count < 64) {
                // 找到相同物品且数量未满的格子
                targetSlot = i;
                break;
            }
        }
        
        // 如果没有找到相同物品的格子，尝试找一个空格子
        if (targetSlot === -1) {
            for (let i = 0; i < this.slotPositions.length; i++) {
                if (!this.slotPositions[i].item) {
                    // 找到空格子
                    targetSlot = i;
                    break;
                }
            }
        }
        
        // 如果找到了合适的格子
        if (targetSlot !== -1) {
            // 设置标记表示正在处理物品拖拽，避免自动调整格子大小
            this.isHandlingItemDrag = true;
            
            // 创建飞行动画效果
            this.createFlyingItemAnimation(item, sourceItemInfo.item, count, sourceSlot, targetSlot);
            
            // 处理物品转移
            const targetItem = this.slotPositions[targetSlot].item;
            if (targetItem && targetItem.itemName === item.itemName) {
                // 合并物品
                const totalCount = this.slotPositions[targetSlot].count + count;
                if (totalCount <= 64) {
                    // 可以完全合并
                    this.slotPositions[targetSlot].count = totalCount;
                    
                    // 清空其他库存中的对应项
                    sourceItemInfo.item = null;
                    sourceItemInfo.count = 0;
                } else {
                    // 部分合并
                    this.slotPositions[targetSlot].count = 64;
                    sourceItemInfo.count = totalCount - 64;
                }
            } else {
                // 放入空格子
                this.slotPositions[targetSlot].item = { ...item }; // 深拷贝
                this.slotPositions[targetSlot].count = count;
                
                // 清空其他库存中的对应项
                sourceItemInfo.item = null;
                sourceItemInfo.count = 0;
            }
            
            // 更新其他库存数组数据
            this.updateOtherInventoryData(item, count, 'remove');
            
            // 同步更新原始库存数组
            this.syncOriginalInventoryArray();
            
            // 保存主库存的滚动位置
            const mainScrollContainer = this.mainInventoryContainer.querySelector('.inventory-scroll-container') as HTMLElement;
            if (mainScrollContainer) {
                this.mainInventoryScrollPosition = mainScrollContainer.scrollTop;
                // 禁用滚动动画
                mainScrollContainer.style.scrollBehavior = 'auto';
            }
            
            // 重新渲染库存，但延迟等待动画完成
            setTimeout(() => {
                // 在渲染前确保仍然保持拖拽状态，避免格子大小调整
                const wasHandlingDrag = this.isHandlingItemDrag;
                
                // 渲染主库存
                this.renderMainInventory();
                
                // 恢复主库存滚动位置
                if (mainScrollContainer && this.mainInventoryScrollPosition > 0) {
                    mainScrollContainer.scrollTop = this.mainInventoryScrollPosition;
                }
                
                // 渲染其他库存
                this.renderOtherInventory(this.otherInventoryRows, this.otherInventoryColumns);
                
                // 触发主库存更新回调
                this.triggerMainInventoryCallback();
                
                // 再延迟一点时间后再清除拖拽标记，确保UI稳定
                setTimeout(() => {
                    this.isHandlingItemDrag = false;
                }, 50);
            }, 350); // 延迟渲染，等待动画完成
        } else {
            // 如果没有找到合适的格子，显示提示信息
            this.showInventoryFullNotification();
        }
    }
    
    // 创建物品飞行动画
    private createFlyingItemAnimation(item: Item, originalItem: Item | null, count: number, sourceSlot: number, targetSlot: number): void {
        // 如果其他库存实例不存在，则无法创建动画
        if (!this.otherInventoryInstance) return;
        
        // 获取源格子和目标格子的元素
        const sourceSlotEl = this.otherInventoryInstance.querySelector(`.inventory-slot[data-slot-index="${sourceSlot}"]`) as HTMLElement;
        const targetSlotEl = this.mainInventoryContainer.querySelector(`.inventory-slot[data-slot-index="${targetSlot}"]`) as HTMLElement;
        
        if (!sourceSlotEl || !targetSlotEl) return;
        
        // 获取源格子和目标格子的位置
        const sourceRect = sourceSlotEl.getBoundingClientRect();
        const targetRect = targetSlotEl.getBoundingClientRect();
        
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
            
            // 在目标格子添加高亮效果，但不触发格子大小调整
            targetSlotEl.classList.add('slot-highlight');
            setTimeout(() => {
                targetSlotEl.classList.remove('slot-highlight');
            }, 300);
        });
    }
    
    // 显示库存已满提示
    private showInventoryFullNotification(): void {
        const notification = document.createElement('div');
        notification.className = 'inventory-notification';
        notification.textContent = '库存已满';
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
}

// 导出公共接口
export function BindPlayerMainInventory(inventoryArray: Item[], rows: number, columns: number, key: string): { unbind: () => void, oneline: () => void } {
    return inventoryManager.BindPlayerMainInventory(inventoryArray, rows, columns, key);
}

export function ShowOtherInventory(
    inventoryArray: Item[],
    rows: number,
    columns: number,
    updateInfo?: InventoryUpdateCallback,
    InventoryName?: string
): { close: () => void, oneline: () => void } {
    return inventoryManager.ShowOtherInventory(inventoryArray, rows, columns, updateInfo, InventoryName);
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
export type { Item }
export { ItemLevel }
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

// 在导出部分添加此方法
export function HideAllInventories(): void {
  inventoryManager.HideAllInventories();
}

// 添加快速拾取功能开关控制方法
export function EnableQuickPickup(enable: boolean): void {
  if (inventoryManager) {
    inventoryManager.IsQuickPickUpItem = enable;
  }
}

// 获取快速拾取功能状态
export function IsQuickPickupEnabled(): boolean {
  if (inventoryManager) {
    return inventoryManager.IsQuickPickUpItem;
  }
  return true; // 默认启用
}

// 导出四个事件监听方法
export function OnMainInventoryOpen(callback: () => void): void {
  if (inventoryManager) {
    inventoryManager.OnMainInventoryOpen(callback);
  }
}

export function OnMainInventoryClose(callback: () => void): void {
  if (inventoryManager) {
    inventoryManager.OnMainInventoryClose(callback);
  }
}

export function OnOtherInventoryOpen(callback: () => void): void {
  if (inventoryManager) {
    inventoryManager.OnOtherInventoryOpen(callback);
  }
}

export function OnOtherInventoryClose(callback: () => void): void {
  if (inventoryManager) {
    inventoryManager.OnOtherInventoryClose(callback);
  }
}