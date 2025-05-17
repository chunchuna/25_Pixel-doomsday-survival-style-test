/**
 * Debug UI System
 * 提供游戏内调试面板功能
 */

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

})

interface DebugPanelInstance {
    DebuPanelAddButton(name: string, callback: () => void): DebugPanelInstance;
}

export class UIDebug {
    private static panel: HTMLDivElement | null = null;
    private static buttonsContainer: HTMLDivElement | null = null;
    private static isVisible: boolean = false;
    private static toggleKey: string = "";

    /**
     * 初始化调试面板
     * @param toggleKey 用于显示/隐藏面板的按键
     * @returns 调试面板实例
     */
    public static InitDebugPanel(toggleKey: string = '`'): DebugPanelInstance {
        if (this.panel) {
            console.warn('Debug panel already initialized');
            return {
                DebuPanelAddButton: (name: string, callback: () => void) => {
                    return UIDebug.DebuPanelAddButton(name, callback) as unknown as DebugPanelInstance;
                }
            };
        }

        this.toggleKey = toggleKey;

        // 创建面板样式
        this.createStyles();

        // 创建面板元素
        this.createPanelElement();

        // 添加键盘事件监听
        document.addEventListener('keydown', (event) => {
            if (event.key === this.toggleKey) {
                this.togglePanel();
            }
        });

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback) as unknown as DebugPanelInstance;
            }
        };
    }

    /**
     * 添加调试按钮到面板
     * @param name 按钮名称
     * @param callback 点击按钮时的回调函数
     * @returns UIDebug类实例，用于链式调用
     */
    public static DebuPanelAddButton(name: string, callback: () => void): DebugPanelInstance {
        if (!this.buttonsContainer) {
            console.error('Debug panel not initialized. Call InitDebugPanel first.');
            return {
                DebuPanelAddButton: (name: string, callback: () => void) => {
                    return UIDebug.DebuPanelAddButton(name, callback);
                }
            };
        }

        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'debug-panel-button';
        button.addEventListener('click', callback);

        this.buttonsContainer.appendChild(button);

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            }
        };
    }

    /**
     * 切换面板的显示状态
     */
    private static togglePanel(): void {
        if (!this.panel) return;

        this.isVisible = !this.isVisible;

        if (this.isVisible) {
            this.panel.classList.add('visible');
            this.panel.classList.remove('hidden');
        } else {
            this.panel.classList.add('hidden');
            this.panel.classList.remove('visible');
        }
    }

    /**
     * 创建调试面板HTML元素
     */
    private static createPanelElement(): void {
        // 创建主面板
        this.panel = document.createElement('div');
        this.panel.className = 'debug-panel hidden';

        // 创建面板头部
        const panelHeader = document.createElement('div');
        panelHeader.className = 'debug-panel-header';
        panelHeader.textContent = '🐞chunchun-debug-tool';

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'debug-panel-close';
        closeButton.textContent = 'X';
        closeButton.addEventListener('click', () => this.togglePanel());
        panelHeader.appendChild(closeButton);

        // 创建按钮容器
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'debug-panel-buttons';

        // 组装面板
        this.panel.appendChild(panelHeader);
        this.panel.appendChild(this.buttonsContainer);

        // 添加到文档
        document.body.appendChild(this.panel);
    }

    /**
     * 创建必要的样式
     */
    private static createStyles(): void {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .debug-panel {
                position: fixed;
                top: 50px;
                right: 20px;
                width: 150px;
                max-height: 80vh;
                background-color: rgba(40, 40, 40, 0.9);
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                font-family: monospace;
                z-index: 10000;
                transition: transform 0.3s, opacity 0.3s;
                overflow: hidden;
                scale:1;
            }
            
            .debug-panel.hidden {
                transform: translateX(350px);
                opacity: 0;
                pointer-events: none;
            }
            
            .debug-panel.visible {
                transform: translateX(0);
                opacity: 1;
            }
            
            .debug-panel-header {
                padding: 10px 15px;
                background-color: rgba(30, 30, 30, 0.95);
                border-bottom: 1px solid #555;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .debug-panel-close {
                background: none;
                border: none;
                color: #aaa;
                cursor: pointer;
                font-weight: bold;
                padding: 0 5px;
            }
            
            .debug-panel-close:hover {
                color: #fff;
            }
            
            .debug-panel-buttons {
                max-height: calc(80vh - 40px);
                overflow-y: auto;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size:5px;
            }
            
            .debug-panel-buttons::-webkit-scrollbar {
                width: 6px;
            }
            
            .debug-panel-buttons::-webkit-scrollbar-track {
                background: rgba(30, 30, 30, 0.3);
            }
            
            .debug-panel-buttons::-webkit-scrollbar-thumb {
                background-color: #555;
                border-radius: 6px;
            }
            
            .debug-panel-button {
                background-color: rgba(60, 60, 60, 0.9);
                border: 1px solid #555;
                border-radius: 4px;
                color: #ddd;
                cursor: pointer;
                font-family: monospace;
                padding: 8px 12px;
                text-align: left;
                transition: background-color 0.2s;
            }
            
            .debug-panel-button:hover {
                background-color: rgba(80, 80, 80, 0.9);
                color: #fff;
            }
        `;

        document.head.appendChild(styleElement);
    }
}
