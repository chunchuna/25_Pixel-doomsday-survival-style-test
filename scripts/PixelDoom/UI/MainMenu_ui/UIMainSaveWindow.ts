import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { data, LocalSave, SaveSetting } from "../../Group/Save/PIXSave.js";
import { TransitionEffectType, UIScreenEffect } from "../screeneffect_ui/UIScreenEffect.js";
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";
import { GameMainScene } from "./UIMainMenu.js";

/**
 * 主存档窗口类
 */
export class UIMainSaveWindow {
    private static instance: UIMainSaveWindow | null = null;
    private windowElement: HTMLElement | null = null;
    private contentElement: HTMLElement | null = null;
    private closeFunction: (() => void) | null = null;
    private saveSlots: { id: number, name: string, date: string }[] = [];

    public Data: any;

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
    private constructor() { }

    /**
     * 显示存档窗口
     */
    public show(): void {
        // 如果窗口已经存在，则直接返回
        if (this.windowElement && document.body.contains(this.windowElement)) {
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

            UIMainSaveWindow.instance = null;
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
                    background-color: #1a3e5c;
                    border-radius: 3px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #aed4ff;
                    font-size: 12px;
                    box-shadow: 0 0 15px rgba(41, 121, 255, 0.4);
                    border: 1px solid #3a6d9a;
                    text-shadow: 0 0 5px rgba(173, 216, 255, 0.8);
                    transition: all 0.3s ease;
                }
                
                .save-slot-preview:hover {
                    box-shadow: 0 0 20px rgba(41, 121, 255, 0.6);
                    background-color: #204a6e;
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
                
                /* 滚动条样式 */
                .save-slots-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                .save-slots-container::-webkit-scrollbar-track {
                    background-color: #1a1a1a;
                    border-radius: 4px;
                }
                
                .save-slots-container::-webkit-scrollbar-thumb {
                    background-color: #444;
                    border-radius: 4px;
                }
                
                .save-slots-container::-webkit-scrollbar-thumb:hover {
                    background-color: #555;
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
                loadBtn.disabled = false;
            }
        }, 100);
    }

    /**
     * 渲染存档插槽
     */
    private renderSaveSlots(): void {
        console.warn(this.Data)
        const slotsContainer = this.contentElement?.querySelector('#save-slots-container');
        if (!slotsContainer) return;

        // 清空容器
        slotsContainer.innerHTML = '';

        // 检查Data是否为空
        if (data.LevelGameData==="") {
            //console.log(this.Data)
            // Data为空，不显示任何插槽
            slotsContainer.innerHTML = '<div class="no-save-message">没有可用的存档数据</div>';

            // 添加空状态的样式
            const style = document.createElement('style');
            style.textContent = `
                .no-save-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    color: #666;
                    font-style: italic;
                    font-size: 16px;
                }
            `;
            slotsContainer.appendChild(style);
            return;
        }

        // Data不为空，生成一个可用插槽
        const slotElement = document.createElement('div');
        slotElement.className = 'save-slot';
        slotElement.setAttribute('data-slot-id', '0');

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        slotElement.innerHTML = `
            <div class="save-slot-header">
                <div class="save-slot-name">当前游戏存档</div>
                <div class="save-slot-date">${dateStr}</div>
            </div>
            <div class="save-slot-preview">游戏存档数据可用</div>
        `;

        // 为存档插槽添加点击事件，但内部保持为空
        slotElement.addEventListener('click', (e) => {
            e.stopPropagation();
            UIScreenEffect.FadeOut(800, TransitionEffectType.WIPE_RADIAL, () => {
                SaveSetting.isUseDataEnterNewGame = true;
                GameMainScene.getInstance().HideALLMainMenuUI();
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level")

            })
        }, true);

        slotsContainer.appendChild(slotElement);

        // 添加选中样式
        slotElement.classList.add('selected');

        // 启用读取按钮
        const loadBtn = this.contentElement?.querySelector('#load-save-btn') as HTMLButtonElement;
        if (loadBtn) {
            loadBtn.disabled = false;
        }
    }

    /**
     * 选择存档插槽
     * @param slotId 插槽ID
     */
    private selectSlot(slotId: number): void {
        // 点击存档插槽的处理逻辑 - 保持为空供用户自行填写
    }

    /**
     * 处理下载存档
     */
    private handleDownloadSave(): void {
        // 直接使用PIXSave中的下载方法
        LocalSave.DataDownload();
        console.log('[存档窗口] 已调用下载存档功能');
    }

    /**
     * 处理读取存档
     */
    private handleLoadSave(): void {
        // 直接使用PIXSave中的读取方法
        LocalSave.DataRead();
        console.log('[存档窗口] 已调用读取存档功能');

        // 读取完成后关闭窗口
        setTimeout(() => {
            this.close();
        }, 500);
    }
}

// 引擎初始化时调用
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 可以在这里添加窗口启动逻辑
    // 例如：UIMainSaveWindow.getInstance().show();
    //UIMainSaveWindow.getInstance().Data = data;

});
