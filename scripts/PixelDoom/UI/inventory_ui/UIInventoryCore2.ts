import type { Item, SlotPosition, InventoryUpdateCallback } from './UIInventoryTypes.js';
import { UIInventoryUtils } from './UIInventoryUtils.js';
import { UIInventoryDrag } from './UIInventoryDrag.js';
import { UIInventoryRender } from './UIInventoryRender.js';
import { UIInventoryCore } from './UIInventoryCore.js';

// 核心类的扩展部分 - 主要业务逻辑
export class UIInventoryCoreExtensions {
    // 绑定主库存
    public static bindPlayerMainInventory(
        core: UIInventoryCore,
        inventoryArray: Item[], 
        rows: number, 
        columns: number, 
        key: string
    ): { unbind: () => void, oneline: () => void } {
        console.log("绑定主库存，当前单列模式记忆状态:", core['shouldMainInventoryUseOnelineMode']);
        
        // 重置主库存数据，避免叠加
        core['mainInventoryData'] = [];
        core['slotPositions'] = [];

        // 重新赋值
        core['mainInventoryData'] = inventoryArray;
        core['mainInventoryRows'] = rows;
        core['mainInventoryColumns'] = columns;
        core['mainInventoryKey'] = key;
        
        // 检查并恢复上次的单列模式状态
        const wasOneLineMode = core['shouldMainInventoryUseOnelineMode'];
        core['isMainInventoryOnelineMode'] = wasOneLineMode;

        console.log("恢复后的单列模式状态:", core['isMainInventoryOnelineMode']);

        // 先渲染库存
        core['renderMainInventory']();

        // 创建解绑函数
        const unbindFunc = () => this.unbindMainInventory(core);

        // 创建oneline方法
        const onelineFunc = () => {
            if (!core['isMainInventoryOnelineMode']) {
                this.toggleMainInventoryOnelineMode(core);
            } else {
                console.log("主库存已经是单列模式，强制应用单列样式");
                
                core['isMainInventoryOnelineMode'] = true;
                core['shouldMainInventoryUseOnelineMode'] = true;
                
                setTimeout(() => {
                    if (core['mainInventoryContainer']) {
                        const newWidth = 300;
                        const newHeight = Math.max(core['MainInventoryWindowSize'][1], 500);
                        
                        core['mainInventoryContainer'].style.width = `${newWidth}px`;
                        core['mainInventoryContainer'].style.height = `${newHeight}px`;
                        core['MainInventoryWindowSize'] = [newWidth, newHeight];
                        
                        core['adjustGridBasedOnWindowSize'](core['mainInventoryContainer']);
                        
                        this.applyOnelineModeStyles(core['mainInventoryContainer']);
                        
                        console.log("主库存单列模式样式强制应用完成");
                    }
                }, 400);
            }
            
            return {
                unbind: unbindFunc,
                oneline: onelineFunc
            };
        };

        // 如果上次是单列模式，立即应用单列模式样式
        if (wasOneLineMode) {
            console.log("应用单列模式样式，延迟执行");
            setTimeout(() => {
                if (core['mainInventoryContainer']) {
                    console.log("开始应用单列模式样式");
                    
                    core['isMainInventoryOnelineMode'] = true;
                    core['shouldMainInventoryUseOnelineMode'] = true;
                    
                    const newWidth = 300;
                    const newHeight = Math.max(core['MainInventoryWindowSize'][1], 500);
                    
                    core['mainInventoryContainer'].style.width = `${newWidth}px`;
                    core['mainInventoryContainer'].style.height = `${newHeight}px`;
                    core['MainInventoryWindowSize'] = [newWidth, newHeight];
                    
                    core['adjustGridBasedOnWindowSize'](core['mainInventoryContainer']);
                    core['renderMainInventory']();
                    
                    setTimeout(() => {
                        if (core['mainInventoryContainer']) {
                            this.applyOnelineModeStyles(core['mainInventoryContainer']);
                            console.log("单列模式样式应用完成");
                        }
                    }, 100);
                }
            }, 500);
        }

        return {
            unbind: unbindFunc,
            oneline: onelineFunc
        };
    }

    // 解绑主库存的方法
    public static unbindMainInventory(core: UIInventoryCore): void {
        const currentOnelineState = core['shouldMainInventoryUseOnelineMode'];
        
        if (core['isMainInventoryVisible']) {
            core['toggleMainInventory']();
        }

        core['mainInventoryData'] = [];
        core['slotPositions'] = [];
        core['mainInventoryRows'] = 0;
        core['mainInventoryColumns'] = 0;
        core['mainInventoryKey'] = '';

        core['mainInventoryCallback'] = null;
        core['isMainInventoryOnelineMode'] = false; 
        core['shouldMainInventoryUseOnelineMode'] = currentOnelineState;

        console.log("主库存已解绑，单列模式记忆状态保持为:", core['shouldMainInventoryUseOnelineMode']);
    }

    // 显示其他库存
    public static showOtherInventory(
        core: UIInventoryCore,
        inventoryArray: Item[], 
        rows: number, 
        columns: number, 
        updateInfo?: InventoryUpdateCallback, 
        InventoryName?: string
    ): { close: () => void, oneline: () => void } {
        const inventoryKey = InventoryName && InventoryName.trim() !== '' ? InventoryName.trim() : 'default';
        
        if (core.closeOtherInventoryFunc) {
            core.closeOtherInventoryFunc();
        }

        core['updateCallback'] = updateInfo || null;
        core['originalInventoryArray'] = inventoryArray;
        core['otherInventoryData'] = inventoryArray.map(item => ({ ...item }));
        core['otherInventoryRows'] = rows;
        core['otherInventoryColumns'] = columns;

        if (core['otherInventoryInstance'] && core['otherInventoryInstance'].parentNode) {
            core['otherInventoryInstance'].parentNode.removeChild(core['otherInventoryInstance']);
        }

        core['otherInventoryInstance'] = UIInventoryRender.createInventoryContainer('other-inventory');
        core['otherInventoryInstance'].style.opacity = '0';
        
        document.body.appendChild(core['otherInventoryInstance']);
        core['otherInventoryInstance'].setAttribute('data-inventory-name', inventoryKey);

        // 设置位置和大小
        if (core['OtherInventoryWindowPosition'][0] !== 0 || core['OtherInventoryWindowPosition'][1] !== 0) {
            core['otherInventoryInstance'].style.left = `${core['OtherInventoryWindowPosition'][0]}px`;
            core['otherInventoryInstance'].style.top = `${core['OtherInventoryWindowPosition'][1]}px`;
            core['otherInventoryInstance'].style.right = 'auto';
            core['otherInventoryInstance'].style.transform = "none";
        } else {
            core['otherInventoryInstance'].style.left = 'auto';
            core['otherInventoryInstance'].style.right = '50px';
            core['otherInventoryInstance'].style.top = '50%';
            core['otherInventoryInstance'].style.transform = 'translateY(-50%)';
        }

        core['otherInventoryInstance'].style.display = 'flex';

        if (core['OtherInventoryWindowSize'][0] > 0 && core['OtherInventoryWindowSize'][1] > 0) {
            core['otherInventoryInstance'].style.width = `${core['OtherInventoryWindowSize'][0]}px`;
            core['otherInventoryInstance'].style.height = `${core['OtherInventoryWindowSize'][1]}px`;
        }

        // 检查并应用记忆的单列模式状态
        const rememberedOnelineMode = core['otherInventoryTypeOnelineModes'].get(inventoryKey);
        if (rememberedOnelineMode !== undefined) {
            console.log(`恢复其他库存(${inventoryKey})记忆的单列模式状态:`, rememberedOnelineMode);
            core['isOtherInventoryOnelineMode'] = rememberedOnelineMode;
        } else {
            core['isOtherInventoryOnelineMode'] = false;
        }

        // 渲染其他库存
        this.renderOtherInventory(core, rows, columns, InventoryName);

        // 显示容器并添加动画
        requestAnimationFrame(() => {
            if (core['otherInventoryInstance']) {
                core['otherInventoryInstance'].classList.add('inventory-open');
                core['otherInventoryInstance'].style.opacity = '1';
                
                core['adjustGridBasedOnWindowSize'](core['otherInventoryInstance']);
                
                if (core['isOtherInventoryOnelineMode']) {
                    setTimeout(() => {
                        if (core['otherInventoryInstance']) {
                            const newWidth = 300;
                            const newHeight = Math.max(core['OtherInventoryWindowSize'][1], 500);
                            
                            core['otherInventoryInstance'].style.width = `${newWidth}px`;
                            core['otherInventoryInstance'].style.height = `${newHeight}px`;
                            core['OtherInventoryWindowSize'] = [newWidth, newHeight];
                            
                            core['adjustGridBasedOnWindowSize'](core['otherInventoryInstance']);
                        }
                    }, 100);
                }
            }
        });

        // 触发其他库存打开事件回调
        if (core['onOtherInventoryOpenCallback']) {
            core['onOtherInventoryOpenCallback']();
        }

        // 添加Escape键关闭库存的监听
        const escapeListener = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && core['otherInventoryInstance']) {
                closeOtherInventory();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);

        // 创建关闭函数
        const closeOtherInventory = () => {
            if (core['onOtherInventoryCloseCallback']) {
                core['onOtherInventoryCloseCallback']();
            }

            document.removeEventListener('keydown', escapeListener);

            if (core['otherInventoryInstance']) {
                core['otherInventoryInstance'].classList.remove('inventory-open');
                core['otherInventoryInstance'].classList.add('inventory-close');

                core['otherInventoryInstance'].addEventListener('animationend', () => {
                    if (core['otherInventoryInstance'] && core['otherInventoryInstance'].parentNode) {
                        core['otherInventoryInstance'].parentNode.removeChild(core['otherInventoryInstance']);
                        core['otherInventoryInstance'] = null;
                    }
                }, { once: true });
            }

            this.syncOriginalInventoryArray(core);
            this.updateInstanceInventory(core);
            core.closeOtherInventoryFunc = null;

            return core['otherInventoryData'];
        };

        core.closeOtherInventoryFunc = closeOtherInventory;
        
        // 创建oneline函数
        const onelineFunc = () => {
            const inventoryName = core['otherInventoryInstance']?.getAttribute('data-inventory-name') || 'default';
            
            if (!core['isOtherInventoryOnelineMode']) {
                this.toggleOtherInventoryOnelineMode(core); 
            } else {
                console.log(`其他库存(${inventoryName})已经是单列模式，强制应用单列样式`);
                
                core['isOtherInventoryOnelineMode'] = true;
                core['otherInventoryTypeOnelineModes'].set(inventoryName, true);
                
                setTimeout(() => {
                    if (core['otherInventoryInstance']) {
                        const newWidth = 300;
                        const newHeight = Math.max(core['OtherInventoryWindowSize'][1], 500);
                        
                        core['otherInventoryInstance'].style.width = `${newWidth}px`;
                        core['otherInventoryInstance'].style.height = `${newHeight}px`;
                        core['OtherInventoryWindowSize'] = [newWidth, newHeight];
                        
                        core['adjustGridBasedOnWindowSize'](core['otherInventoryInstance']);
                        this.applyOnelineModeStyles(core['otherInventoryInstance']);
                        
                        console.log(`其他库存(${inventoryName})单列模式样式强制应用完成`);
                    }
                }, 200);
            }
        };

        return {
            close: closeOtherInventory,
            oneline: onelineFunc
        };
    }

    // 显示/隐藏主库存
    public static toggleMainInventory(core: UIInventoryCore): void {
        core['isMainInventoryVisible'] = !core['isMainInventoryVisible'];

        if (core['isMainInventoryVisible']) {
            if (core['MainInventoryWindowPosition'][0] !== 0 || core['MainInventoryWindowPosition'][1] !== 0) {
                core['mainInventoryContainer'].style.left = `${core['MainInventoryWindowPosition'][0]}px`;
                core['mainInventoryContainer'].style.top = `${core['MainInventoryWindowPosition'][1]}px`;
                core['mainInventoryContainer'].style.transform = 'none'
            } else {
                core['mainInventoryContainer'].style.left = '50px';
                core['mainInventoryContainer'].style.top = '50%';
                core['mainInventoryContainer'].style.transform = 'translateY(-50%)';
            }

            if (core['MainInventoryWindowSize'][0] > 0 && core['MainInventoryWindowSize'][1] > 0) {
                core['mainInventoryContainer'].style.width = `${core['MainInventoryWindowSize'][0]}px`;
                core['mainInventoryContainer'].style.height = `${core['MainInventoryWindowSize'][1]}px`;
            }

            core['mainInventoryContainer'].style.opacity = '0';
            core['mainInventoryContainer'].style.display = 'flex';

            requestAnimationFrame(() => {
                core['mainInventoryContainer'].classList.remove('inventory-close');
                core['mainInventoryContainer'].classList.add('inventory-open');
                core['mainInventoryContainer'].style.opacity = '1';
                
                setTimeout(() => {
                    core['adjustGridBasedOnWindowSize'](core['mainInventoryContainer']);
                }, 50);
            });

            if (core['onMainInventoryOpenCallback']) {
                core['onMainInventoryOpenCallback']();
            }
        } else {
            if (core['onMainInventoryCloseCallback']) {
                core['onMainInventoryCloseCallback']();
            }

            core['mainInventoryContainer'].classList.remove('inventory-open');
            void core['mainInventoryContainer'].offsetWidth;
            core['mainInventoryContainer'].classList.add('inventory-close');

            core['mainInventoryContainer'].addEventListener('animationend', () => {
                if (!core['isMainInventoryVisible']) {
                    core['mainInventoryContainer'].style.display = 'none';
                    core['itemDescriptionPanel'].style.display = 'none';
                }
            }, { once: true });
        }
    }

    // 渲染其他库存
    private static renderOtherInventory(core: UIInventoryCore, rows: number, columns: number, InventoryName?: string): void {
        const wasHandlingDrag = core['isHandlingItemDrag'];
        
        if (core['otherInventoryInstance']) {
            UIInventoryRender.renderInventory(
                core['otherInventoryInstance'],
                core['otherInventoryData'],
                rows,
                columns,
                true, // 是其他库存
                InventoryName,
                undefined, // 其他库存不使用固定槽位
                core['handleSlotClick'].bind(core),
                this.handleQuickPickup.bind(this, core)
            );
        }
        
        core['isHandlingItemDrag'] = wasHandlingDrag;
    }

    // 处理快速拾取
    private static handleQuickPickup(core: UIInventoryCore, item: Item, count: number, sourceSlot: number): void {
        if (!core.IsQuickPickUpItem || !core['isMainInventoryVisible']) {
            return;
        }
        
        const otherInventorySlots = this.getOtherInventorySlots(core);
        const sourceItemInfo = otherInventorySlots[sourceSlot];
        
        if (!sourceItemInfo.item) return;
        
        // 查找主库存中合适的位置放置物品
        let targetSlot = -1;
        
        // 首先尝试找到相同物品的格子并合并
        for (let i = 0; i < core['slotPositions'].length; i++) {
            const slotItem = core['slotPositions'][i].item;
            if (slotItem && slotItem.itemName === item.itemName && core['slotPositions'][i].count < 64) {
                targetSlot = i;
                break;
            }
        }
        
        // 如果没有找到相同物品的格子，尝试找一个空格子
        if (targetSlot === -1) {
            for (let i = 0; i < core['slotPositions'].length; i++) {
                if (!core['slotPositions'][i].item) {
                    targetSlot = i;
                    break;
                }
            }
        }
        
        // 如果找到了合适的格子
        if (targetSlot !== -1) {
            core['isHandlingItemDrag'] = true;
            
            // 创建飞行动画效果
            const sourceSlotEl = core['otherInventoryInstance']?.querySelector(`.inventory-slot[data-slot-index="${sourceSlot}"]`) as HTMLElement;
            const targetSlotEl = core['mainInventoryContainer'].querySelector(`.inventory-slot[data-slot-index="${targetSlot}"]`) as HTMLElement;
            
            if (sourceSlotEl && targetSlotEl) {
                UIInventoryDrag.createFlyingItemAnimation(item, count, sourceSlotEl, targetSlotEl);
            }
            
            // 处理物品转移
            const targetItem = core['slotPositions'][targetSlot].item;
            if (targetItem && targetItem.itemName === item.itemName) {
                const totalCount = core['slotPositions'][targetSlot].count + count;
                if (totalCount <= 64) {
                    core['slotPositions'][targetSlot].count = totalCount;
                    sourceItemInfo.item = null;
                    sourceItemInfo.count = 0;
                } else {
                    core['slotPositions'][targetSlot].count = 64;
                    sourceItemInfo.count = totalCount - 64;
                }
            } else {
                core['slotPositions'][targetSlot].item = { ...item };
                core['slotPositions'][targetSlot].count = count;
                sourceItemInfo.item = null;
                sourceItemInfo.count = 0;
            }
            
            this.updateOtherInventoryData(core, item, count, 'remove');
            this.syncOriginalInventoryArray(core);
            
            const mainScrollContainer = core['mainInventoryContainer'].querySelector('.inventory-scroll-container') as HTMLElement;
            if (mainScrollContainer) {
                core['mainInventoryScrollPosition'] = mainScrollContainer.scrollTop;
                mainScrollContainer.style.scrollBehavior = 'auto';
            }
            
            setTimeout(() => {
                core['renderMainInventory']();
                
                if (mainScrollContainer && core['mainInventoryScrollPosition'] > 0) {
                    mainScrollContainer.scrollTop = core['mainInventoryScrollPosition'];
                }
                
                this.renderOtherInventory(core, core['otherInventoryRows'], core['otherInventoryColumns']);
                core['triggerMainInventoryCallback']();
                
                setTimeout(() => {
                    core['isHandlingItemDrag'] = false;
                }, 50);
            }, 350);
        } else {
            UIInventoryRender.showNotification(core['mainInventoryContainer'], '库存已满');
        }
    }

    // 其他辅助方法...
    private static getOtherInventorySlots(core: UIInventoryCore): SlotPosition[] {
        const rows = core['otherInventoryRows'];
        const cols = core['otherInventoryColumns'];
        const totalSlots = rows * cols;

        const otherInventorySlots: SlotPosition[] = [];

        for (let i = 0; i < totalSlots; i++) {
            otherInventorySlots.push({
                index: i,
                item: null,
                count: 0
            });
        }

        const groupedItems = UIInventoryUtils.groupItems(core['otherInventoryData']);

        let slotIndex = 0;
        for (const [itemName, itemList] of groupedItems) {
            const itemGroups = UIInventoryUtils.splitIntoGroups(itemList, 64);

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

    private static updateOtherInventoryData(core: UIInventoryCore, item: Item, count: number, action: 'add' | 'remove'): void {
        if (action === 'add') {
            for (let i = 0; i < count; i++) {
                core['otherInventoryData'].push({ ...item });
            }
        } else {
            let removedCount = 0;
            for (let i = core['otherInventoryData'].length - 1; i >= 0; i--) {
                if (core['otherInventoryData'][i].itemName === item.itemName && removedCount < count) {
                    core['otherInventoryData'].splice(i, 1);
                    removedCount++;
                }
                if (removedCount >= count) break;
            }
        }
    }

    private static syncOriginalInventoryArray(core: UIInventoryCore): void {
        if (core['originalInventoryArray']) {
            core['originalInventoryArray'].length = 0;
            core['otherInventoryData'].forEach(item => {
                core['originalInventoryArray']!.push({ ...item });
            });
        }
    }

    private static updateInstanceInventory(core: UIInventoryCore): void {
        if (!core['updateCallback']) return;

        const instance = core['updateCallback'].instance;
        if (!instance) return;

        const serializedData = UIInventoryUtils.serializeItemsOnly(core['otherInventoryData']);

        if (core['updateCallback'].updateMethod) {
            core['updateCallback'].updateMethod(instance, core['otherInventoryData']);
        } else if (core['updateCallback'].varName) {
            instance.instVars[core['updateCallback'].varName] = serializedData;
        }
    }

    // 单列模式相关方法
    private static toggleMainInventoryOnelineMode(core: UIInventoryCore): void {
        core['isMainInventoryOnelineMode'] = !core['isMainInventoryOnelineMode'];
        core['shouldMainInventoryUseOnelineMode'] = core['isMainInventoryOnelineMode'];
        
        console.log("切换主库存单列模式状态为:", core['isMainInventoryOnelineMode'], 
            "记忆状态为:", core['shouldMainInventoryUseOnelineMode']);
        
        if (core['isMainInventoryVisible']) {
            core['renderMainInventory']();
            
            if (core['isMainInventoryOnelineMode']) {
                const newWidth = 300;
                const newHeight = Math.max(core['MainInventoryWindowSize'][1], 500);
                
                core['mainInventoryContainer'].style.width = `${newWidth}px`;
                core['mainInventoryContainer'].style.height = `${newHeight}px`;
                core['MainInventoryWindowSize'] = [newWidth, newHeight];
            } else {
                const newWidth = Math.max(225, core['MainInventoryWindowSize'][0]);
                const newHeight = Math.max(380, core['MainInventoryWindowSize'][1]);
                
                core['mainInventoryContainer'].style.width = `${newWidth}px`;
                core['mainInventoryContainer'].style.height = `${newHeight}px`;
            }
            
            setTimeout(() => {
                core['adjustGridBasedOnWindowSize'](core['mainInventoryContainer']);
                
                if (core['isMainInventoryOnelineMode']) {
                    this.applyOnelineModeStyles(core['mainInventoryContainer']);
                    console.log("主库存单列模式样式应用完成");
                }
            }, 200);
        }
    }

    private static toggleOtherInventoryOnelineMode(core: UIInventoryCore): void {
        const inventoryName = core['otherInventoryInstance'] ? 
            core['otherInventoryInstance'].getAttribute('data-inventory-name') || 'default' : 'default';
            
        core['isOtherInventoryOnelineMode'] = !core['isOtherInventoryOnelineMode'];
        core['otherInventoryTypeOnelineModes'].set(inventoryName, core['isOtherInventoryOnelineMode']);
        
        console.log(`切换其他库存(${inventoryName})单列模式状态为:`, core['isOtherInventoryOnelineMode'], 
            "记忆状态为:", core['otherInventoryTypeOnelineModes'].get(inventoryName));
        
        if (core['otherInventoryInstance']) {
            this.renderOtherInventory(core, core['otherInventoryRows'], core['otherInventoryColumns'], inventoryName);
            
            if (core['isOtherInventoryOnelineMode']) {
                const newWidth = 300;
                const newHeight = Math.max(core['OtherInventoryWindowSize'][1], 500);
                
                core['otherInventoryInstance'].style.width = `${newWidth}px`;
                core['otherInventoryInstance'].style.height = `${newHeight}px`;
                core['OtherInventoryWindowSize'] = [newWidth, newHeight];
            } else {
                const newWidth = Math.max(225, core['OtherInventoryWindowSize'][0]);
                const newHeight = Math.max(380, core['OtherInventoryWindowSize'][1]);
                
                core['otherInventoryInstance'].style.width = `${newWidth}px`;
                core['otherInventoryInstance'].style.height = `${newHeight}px`;
            }
            
            setTimeout(() => {
                if (core['otherInventoryInstance']) {
                    core['adjustGridBasedOnWindowSize'](core['otherInventoryInstance']);
                    
                    if (core['isOtherInventoryOnelineMode']) {
                        this.applyOnelineModeStyles(core['otherInventoryInstance']);
                        console.log("其他库存单列模式样式应用完成");
                    }
                }
            }, 200);
        }
    }

    private static applyOnelineModeStyles(container: HTMLDivElement): void {
        const containerWidth = container.clientWidth;
        const availableWidth = containerWidth - 40;
        
        const gridContainer = container.querySelector('.inventory-grid') as HTMLDivElement;
        if (gridContainer) {
            gridContainer.style.gridTemplateColumns = `1fr`;
        }
        
        const slots = container.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            const slotElement = slot as HTMLElement;
            slotElement.style.width = `${availableWidth}px`;
            slotElement.style.height = `30px`;
            slotElement.classList.add('oneline-slot');
            
            const itemElement = slotElement.querySelector('.inventory-item');
            if (itemElement) {
                itemElement.classList.add('oneline-item');
                
                const countLabel = itemElement.querySelector('.item-count');
                if (countLabel) {
                    countLabel.classList.add('oneline-count');
                }
            }
        });
    }
} 