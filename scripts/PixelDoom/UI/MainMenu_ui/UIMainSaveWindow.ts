import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";

/**
 * 主存档窗口类
 */
export class UIMainSaveWindow {
    private static instance: UIMainSaveWindow | null = null;
    private windowElement: HTMLElement | null = null;
    private contentElement: HTMLElement | null = null;
    private closeFunction: (() => void) | null = null;
    private saveSlots: { id: number, name: string, date: string }[] = [];
    
    /**
     * 获取单例实例
     */
    public static getInstance(): UIMainSaveWindow {
        if (!this.instance) {
            this.instance = new UIMainSaveWindow();
        }
        return this.instance;
    }
    
    /**
     * 私有构造函数，防止直接实例化
     */
    private constructor() {}
    
    /**
     * 显示存档窗口
     */
    public show(): void {
        // 如果窗口已经存在，则直接返回
        if (this.windowElement) {
            return;
        }
        
        // 创建窗口
        const result = UIWindowLib.createWindow(
            "存档管理",
            600,
            500,
            1.0
        );
        
        this.windowElement = result.windowElement;
        this.contentElement = result.contentElement;
        this.closeFunction = result.close;
        
        // 初始化窗口内容
        this.initContent();
    }
    
    /**
     * 关闭窗口
     */
    public close(): void {
        if (this.closeFunction) {
            this.closeFunction();
            this.windowElement = null;
            this.contentElement = null;
            this.closeFunction = null;
        }
    }
    
    /**
     * 显示窗口（兼容性方法）
     */
    public showWindow(): void {
        this.show();
    }
    
    /**
     * 关闭窗口（兼容性方法）
     */
    public closeWindow(): void {
        this.close();
    }
    
    /**
     * 初始化窗口内容
     */
    private initContent(): void {
        if (!this.contentElement) return;
        
        // 添加样式和HTML内容
        this.contentElement.innerHTML = `
            <style>
                .save-window-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    color: #e0e0e0;
                }
                
                .save-window-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    text-align: center;
                    color: #f0f0f0;
                }
                
                .save-slots-container {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    overflow-y: auto;
                    padding: 5px;
                    margin-bottom: 15px;
                    border: 1px solid #3c3c3c;
                    background-color: #232323;
                    border-radius: 4px;
                }
                
                .save-slot {
                    padding: 12px;
                    background-color: #2a2a2a;
                    border: 1px solid #444;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    position: relative;
                }
                
                .save-slot:hover {
                    background-color: #333;
                    border-color: #555;
                }
                
                .save-slot.selected {
                    background-color: #3a3a3a;
                    border-color: #666;
                }
                
                .save-slot.empty {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #666;
                    font-style: italic;
                }
                
                .save-slot-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .save-slot-name {
                    font-weight: bold;
                    color: #f0f0f0;
                }
                
                .save-slot-date {
                    font-size: 12px;
                    color: #999;
                }
                
                .save-slot-preview {
                    width: 100%;
                    height: 80px;
                    background-color: #1a1a1a;
                    border-radius: 3px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #666;
                    font-size: 12px;
                }
                
                .save-actions {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                }
                
                .save-button {
                    background-color: #444;
                    border: none;
                    color: #e0e0e0;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-weight: bold;
                    flex: 1;
                    margin: 0 5px;
                }
                
                .save-button:hover {
                    background-color: #555;
                }
                
                .save-button.download {
                    background-color: #2b5278;
                }
                
                .save-button.download:hover {
                    background-color: #366391;
                }
                
                .save-button.load {
                    background-color: #5a4a2d;
                }
                
                .save-button.load:hover {
                    background-color: #6d5935;
                }
                
                .save-button:disabled {
                    background-color: #333;
                    color: #666;
                    cursor: not-allowed;
                }
            </style>
            
            <div class="save-window-container">
                <div class="save-window-title">存档管理</div>
                
                <div class="save-slots-container" id="save-slots-container">
                    <!-- 存档插槽将在JS中动态生成 -->
                </div>
                
                <div class="save-actions">
                    <button class="save-button download" id="download-save-btn">下载存档</button>
                    <button class="save-button load" id="load-save-btn">读取存档</button>
                </div>
            </div>
        `;
        
        // 添加空存档插槽
        this.renderSaveSlots();
        
        // 添加按钮事件监听
        setTimeout(() => {
            const downloadBtn = this.contentElement?.querySelector('#download-save-btn') as HTMLButtonElement;
            const loadBtn = this.contentElement?.querySelector('#load-save-btn') as HTMLButtonElement;
            
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDownloadSave();
                }, true);
            }
            
            if (loadBtn) {
                loadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLoadSave();
                }, true);
                
                // 初始状态禁用读取按钮
                loadBtn.disabled = true;
            }
        }, 100);
    }
    
    /**
     * 渲染存档插槽
     */
    private renderSaveSlots(): void {
        const slotsContainer = this.contentElement?.querySelector('#save-slots-container');
        if (!slotsContainer) return;
        
        // 清空容器
        slotsContainer.innerHTML = '';
        
        // 如果没有存档，显示空插槽
        if (this.saveSlots.length === 0) {
            // 创建6个空存档插槽
            for (let i = 0; i < 6; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'save-slot empty';
                emptySlot.setAttribute('data-slot-id', i.toString());
                emptySlot.textContent = '空存档槽';
                
                emptySlot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectSlot(i);
                }, true);
                
                slotsContainer.appendChild(emptySlot);
            }
        } else {
            // 显示现有存档
            this.saveSlots.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.className = 'save-slot';
                slotElement.setAttribute('data-slot-id', slot.id.toString());
                
                slotElement.innerHTML = `
                    <div class="save-slot-header">
                        <div class="save-slot-name">${slot.name}</div>
                        <div class="save-slot-date">${slot.date}</div>
                    </div>
                    <div class="save-slot-preview">存档预览</div>
                `;
                
                slotElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectSlot(slot.id);
                }, true);
                
                slotsContainer.appendChild(slotElement);
            });
            
            // 添加额外的空存档槽，确保总数为6
            const remainingSlots = 6 - this.saveSlots.length;
            for (let i = 0; i < remainingSlots; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'save-slot empty';
                emptySlot.setAttribute('data-slot-id', (this.saveSlots.length + i).toString());
                emptySlot.textContent = '空存档槽';
                
                emptySlot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectSlot(this.saveSlots.length + i);
                }, true);
                
                slotsContainer.appendChild(emptySlot);
            }
        }
    }
    
    /**
     * 选择存档插槽
     */
    private selectSlot(slotId: number): void {
        // 移除所有已选择的样式
        const allSlots = this.contentElement?.querySelectorAll('.save-slot');
        allSlots?.forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // 添加选中样式
        const selectedSlot = this.contentElement?.querySelector(`[data-slot-id="${slotId}"]`);
        if (selectedSlot) {
            selectedSlot.classList.add('selected');
        }
        
        // 启用/禁用按钮
        const loadBtn = this.contentElement?.querySelector('#load-save-btn') as HTMLButtonElement;
        if (loadBtn) {
            // 检查是否为有效存档
            const isValidSave = this.saveSlots.some(slot => slot.id === slotId);
            loadBtn.disabled = !isValidSave;
        }
    }
    
    /**
     * 处理下载存档
     */
    private handleDownloadSave(): void {
        // 获取选中的插槽
        const selectedSlot = this.contentElement?.querySelector('.save-slot.selected');
        if (!selectedSlot) {
            console.log('请先选择一个存档槽!');
            return;
        }
        
        const slotId = parseInt(selectedSlot.getAttribute('data-slot-id') || '-1');
        if (slotId < 0) return;
        
        // 只输出控制台提示
        console.log(`[存档窗口] 下载存档到槽位 ${slotId}`);
    }
    
    /**
     * 处理读取存档
     */
    private handleLoadSave(): void {
        // 获取选中的插槽
        const selectedSlot = this.contentElement?.querySelector('.save-slot.selected');
        if (!selectedSlot) {
            console.log('请先选择一个存档!');
            return;
        }
        
        const slotId = parseInt(selectedSlot.getAttribute('data-slot-id') || '-1');
        if (slotId < 0) return;
        
        // 只输出控制台提示
        console.log(`[存档窗口] 从槽位 ${slotId} 读取存档`);
        
        // 读取成功后关闭窗口
        this.close();
    }
}

// 引擎初始化时调用
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 可以在这里添加窗口启动逻辑
    // 例如：UIMainSaveWindow.getInstance().show();
});
