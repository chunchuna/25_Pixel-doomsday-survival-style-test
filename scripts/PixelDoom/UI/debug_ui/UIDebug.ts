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
    private static posX: number = 20;
    private static posY: number = 50;
    private static width: number = 200;
    private static height: number = 600;
    private static resizer: HTMLDivElement | null = null;
    
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
                    return UIDebug.DebuPanelAddButton(name, callback);
                }
            };
        }
        
        this.toggleKey = toggleKey;
        
        // 从localStorage加载面板位置和大小
        this.loadPanelSettings();
        
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
                return UIDebug.DebuPanelAddButton(name, callback);
            }
        };
    }
    
    /**
     * 添加调试按钮到面板
     * @param name 按钮名称
     * @param callback 点击按钮时的回调函数
     * @returns 调试面板实例
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
            
            // 关闭面板时保存位置
            this.savePanelSettings();
        }
    }
    
    /**
     * 创建调试面板HTML元素
     */
    private static createPanelElement(): void {
        // 创建主面板
        this.panel = document.createElement('div');
        this.panel.className = 'debug-panel hidden';
        this.panel.style.top = this.posY + 'px';
        this.panel.style.right = this.posX + 'px';
        this.panel.style.width = this.width + 'px';
        this.panel.style.height = this.height + 'px';
        
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
        
        // 添加拖拽功能
        this.addDragBehavior(panelHeader);
        
        // 创建按钮容器
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'debug-panel-buttons';
        // 设置按钮容器高度，使其适应面板高度
        this.buttonsContainer.style.height = (this.height - 30) + 'px'; // 减去头部高度
        
        // 创建大小调整器
        this.resizer = document.createElement('div');
        this.resizer.className = 'debug-panel-resizer';
        this.addResizeBehavior(this.resizer);
        
        // 组装面板
        this.panel.appendChild(panelHeader);
        this.panel.appendChild(this.buttonsContainer);
        this.panel.appendChild(this.resizer);
        
        // 添加到文档
        document.body.appendChild(this.panel);
    }
    
    /**
     * 添加拖拽行为
     */
    private static addDragBehavior(element: HTMLElement): void {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        
        element.style.cursor = 'move';
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - (this.panel?.getBoundingClientRect().left || 0);
            offsetY = e.clientY - (this.panel?.getBoundingClientRect().top || 0);
            
            e.preventDefault();
            
            // 添加临时鼠标移动和释放事件
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !this.panel) return;
            
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            
            this.panel.style.left = newLeft + 'px';
            this.panel.style.top = newTop + 'px';
            // 拖动时使用left而非right属性定位
            this.panel.style.right = 'auto';
            
            // 更新位置变量
            this.posX = window.innerWidth - newLeft - this.width;
            this.posY = newTop;
            
            e.preventDefault();
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            
            // 移除临时事件
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // 保存位置
            this.savePanelSettings();
        };
    }
    
    /**
     * 添加调整大小行为
     */
    private static addResizeBehavior(element: HTMLElement): void {
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;
        
        element.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startW = this.panel?.offsetWidth || 0;
            startH = this.panel?.offsetHeight || 0;
            
            e.preventDefault();
            
            // 添加临时鼠标移动和释放事件
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !this.panel || !this.buttonsContainer) return;
            
            const newWidth = startW + (e.clientX - startX);
            const newHeight = startH + (e.clientY - startY);
            
            // 设置最小尺寸
            this.width = Math.max(100, newWidth);
            this.height = Math.max(120, newHeight);
            
            this.panel.style.width = this.width + 'px';
            this.panel.style.height = this.height + 'px';
            
            // 更新按钮容器高度
            this.buttonsContainer.style.height = (this.height - 30) + 'px'; // 减去头部高度
            
            e.preventDefault();
        };
        
        const handleMouseUp = () => {
            isResizing = false;
            
            // 移除临时事件
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // 保存尺寸
            this.savePanelSettings();
        };
    }
    
    /**
     * 保存面板设置
     */
    private static savePanelSettings(): void {
        const settings = {
            posX: this.posX,
            posY: this.posY,
            width: this.width,
            height: this.height,
            isVisible: this.isVisible
        };
        
        try {
            localStorage.setItem('debugPanelSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save debug panel settings');
        }
    }
    
    /**
     * 加载面板设置
     */
    private static loadPanelSettings(): void {
        try {
            const savedSettings = localStorage.getItem('debugPanelSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.posX = settings.posX;
                this.posY = settings.posY;
                this.width = settings.width;
                this.height = settings.height;
                this.isVisible = settings.isVisible;
            }
        } catch (e) {
            console.warn('Failed to load debug panel settings');
        }
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
                background-color: rgba(40, 40, 40, 0.9);
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                font-family: monospace;
                z-index: 10000;
                transition: transform 0.3s, opacity 0.3s;
                overflow: hidden;
                scale:1;
                display: flex;
                flex-direction: column;
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
                padding: 5px 8px;
                background-color: rgba(30, 30, 30, 0.95);
                border-bottom: 1px solid #555;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                user-select: none;
                flex-shrink: 0;
                height: 20px;
            }
            
            .debug-panel-close {
                background: none;
                border: none;
                color: #aaa;
                cursor: pointer;
                font-weight: bold;
                padding: 0 5px;
                font-size: 10px;
            }
            
            .debug-panel-close:hover {
                color: #fff;
            }
            
            .debug-panel-buttons {
                overflow-y: auto;
                padding: 5px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-size:5px;
                flex-grow: 1;
            }
            
            .debug-panel-buttons::-webkit-scrollbar {
                width: 4px;
            }
            
            .debug-panel-buttons::-webkit-scrollbar-track {
                background: rgba(30, 30, 30, 0.3);
            }
            
            .debug-panel-buttons::-webkit-scrollbar-thumb {
                background-color: #555;
                border-radius: 4px;
            }
            
            .debug-panel-button {
                background-color: rgba(60, 60, 60, 0.9);
                border: 1px solid #555;
                border-radius: 3px;
                color: #ddd;
                cursor: pointer;
                font-family: monospace;
                padding: 4px 6px;
                text-align: left;
                transition: background-color 0.2s;
                font-size: 9px;
                height: 20px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                min-height: 20px;
                flex-shrink: 0;
            }
            
            .debug-panel-button:hover {
                background-color: rgba(80, 80, 80, 0.9);
                color: #fff;
            }
            
            .debug-panel-resizer {
                position: absolute;
                width: 10px;
                height: 10px;
                bottom: 0;
                right: 0;
                cursor: nwse-resize;
                background: linear-gradient(135deg, transparent 50%, #888 50%, #aaa 75%, #ccc 100%);
                border-radius: 0 0 4px 0;
                z-index: 10001;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}
