/**
 * Debug UI System
 * 提供游戏内调试面板功能
 */

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
export var DEBUG = {
    DebugMainUI: null as DebugPanelInstance | null,
}


var isCreatDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (!isCreatDebugPanel) {
        
        DEBUG.DebugMainUI = UIDebug.InitDebugPanel('m')
        DEBUG.DebugMainUI.InitConsoleCapture()
        isCreatDebugPanel = true
    }

})

interface DebugPanelInstance {
    DebuPanelAddButton(name: string, callback: () => void): DebugPanelInstance;
    InitConsoleCapture(): DebugPanelInstance;
}

export class UIDebug {
    private static panel: HTMLDivElement | null = null;
    private static buttonsContainer: HTMLDivElement | null = null;
    private static isVisible: boolean = false;
    private static toggleKey: string = "";
    private static posX: number = 20;
    private static posY: number = 50;
    private static width: number = 500;
    private static height: number = 300;
    private static resizer: HTMLDivElement | null = null;
    private static consoleContainer: HTMLDivElement | null = null;
    private static originalConsole: any = {};
    private static isConsoleEnabled: boolean = false;

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
                },
                InitConsoleCapture: () => {
                    return UIDebug.InitConsoleCapture();
                }
            };
        }

        this.toggleKey = toggleKey;

        // 从localStorage加载面板位置和大小
        //this.loadPanelSettings();

        // 创建面板样式
        this.createStyles();

        // 创建面板元素
        this.createPanelElement();

        // 添加键盘事件监听
        document.addEventListener('keydown', (event) => {
            if (event.key.toLocaleLowerCase() === this.toggleKey.toLocaleLowerCase()) {
                this.togglePanel();
            }
        });

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
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
                },
                InitConsoleCapture: () => {
                    return UIDebug.InitConsoleCapture();
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
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            }
        };
    }

    /**
     * 初始化控制台捕获功能
     * @returns 调试面板实例
     */
    public static InitConsoleCapture(): DebugPanelInstance {
        if (this.isConsoleEnabled) {
            console.warn('Console capture already initialized');
            return {
                DebuPanelAddButton: (name: string, callback: () => void) => {
                    return UIDebug.DebuPanelAddButton(name, callback);
                },
                InitConsoleCapture: () => {
                    return UIDebug.InitConsoleCapture();
                }
            };
        }

        this.isConsoleEnabled = true;

        // 创建console显示容器
        this.createConsoleContainer();

        // 替换原始console方法
        this.overrideConsoleMethods();

        // 添加清除控制台按钮
        this.DebuPanelAddButton('清除控制台', () => {
            if (this.consoleContainer) {
                this.consoleContainer.innerHTML = '';
            }
        });

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            }
        };
    }

    /**
     * 创建控制台容器
     */
    private static createConsoleContainer(): void {
        if (!this.panel) return;

        // 创建tab容器
        const tabContainer = document.createElement('div');
        tabContainer.className = 'debug-panel-tabs';

        // 创建按钮tab
        const buttonsTab = document.createElement('div');
        buttonsTab.className = 'debug-panel-tab active';
        buttonsTab.textContent = '调试按钮';
        buttonsTab.addEventListener('click', () => {
            if (this.buttonsContainer && this.consoleContainer) {
                buttonsTab.classList.add('active');
                consoleTab.classList.remove('active');
                this.buttonsContainer.style.display = 'flex';
                this.consoleContainer.style.display = 'none';
            }
        });

        // 创建控制台tab
        const consoleTab = document.createElement('div');
        consoleTab.className = 'debug-panel-tab';
        consoleTab.textContent = '控制台';
        consoleTab.addEventListener('click', () => {
            if (this.buttonsContainer && this.consoleContainer) {
                consoleTab.classList.add('active');
                buttonsTab.classList.remove('active');
                this.buttonsContainer.style.display = 'none';
                this.consoleContainer.style.display = 'block';
            }
        });

        tabContainer.appendChild(buttonsTab);
        tabContainer.appendChild(consoleTab);

        // 在header之后添加tab
        if (this.panel.firstChild && this.panel.firstChild.nextSibling) {
            this.panel.insertBefore(tabContainer, this.panel.firstChild.nextSibling);
        }

        // 创建控制台容器
        this.consoleContainer = document.createElement('div');
        this.consoleContainer.className = 'debug-panel-console';
        this.consoleContainer.style.display = 'none';

        // 在tab之后添加控制台容器
        this.panel.insertBefore(this.consoleContainer, tabContainer.nextSibling);
    }

    /**
     * 替换原始console方法以捕获输出
     */
    private static overrideConsoleMethods(): void {
        // 保存原始方法
        this.originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        // 替换log方法
        console.log = (...args: any[]) => {
            this.addConsoleMessage('log', args);
            this.originalConsole.log(...args);
        };

        // 替换info方法
        console.info = (...args: any[]) => {
            this.addConsoleMessage('info', args);
            this.originalConsole.info(...args);
        };

        // 替换warn方法
        console.warn = (...args: any[]) => {
            this.addConsoleMessage('warn', args);
            this.originalConsole.warn(...args);
        };

        // 替换error方法
        console.error = (...args: any[]) => {
            this.addConsoleMessage('error', args);
            this.originalConsole.error(...args);
        };

        // 替换debug方法
        console.debug = (...args: any[]) => {
            this.addConsoleMessage('debug', args);
            this.originalConsole.debug(...args);
        };
    }

    /**
     * 添加控制台消息到显示容器
     */
    private static addConsoleMessage(type: string, args: any[]): void {
        if (!this.consoleContainer || !this.isConsoleEnabled) return;

        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `console-message console-${type}`;

        // 处理不同类型的参数
        let messageContent = '';
        args.forEach((arg, index) => {
            if (typeof arg === 'object') {
                try {
                    const jsonStr = JSON.stringify(arg, null, 2);
                    messageContent += jsonStr;
                } catch (e) {
                    messageContent += String(arg);
                }
            } else {
                messageContent += String(arg);
            }

            if (index < args.length - 1) {
                messageContent += ' ';
            }
        });

        messageElement.textContent = messageContent;

        // 添加时间戳
        const timestamp = document.createElement('span');
        timestamp.className = 'console-timestamp';
        const now = new Date();
        timestamp.textContent = `[${now.toLocaleTimeString()}] `;
        messageElement.prepend(timestamp);

        // 添加到容器
        this.consoleContainer.appendChild(messageElement);

        // 自动滚动到底部
        this.consoleContainer.scrollTop = this.consoleContainer.scrollHeight;

        // 限制最大消息数量，防止内存过度使用
        while (this.consoleContainer.childElementCount > 1000) {
            if (this.consoleContainer.firstChild) {
                this.consoleContainer.removeChild(this.consoleContainer.firstChild);
            }
        }
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
        
        // 默认居中显示窗口
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // 计算居中位置
        this.posX = Math.max(0, (viewportWidth - this.width) / 2);
        this.posY = Math.max(0, (viewportHeight - this.height) / 2);
        
        this.panel.style.left = this.posX + 'px';
        this.panel.style.top = this.posY + 'px';
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
            
            // 计算新位置
            const newLeft = Math.max(0, e.clientX - offsetX);
            const newTop = Math.max(0, e.clientY - offsetY);
            
            // 限制不超出屏幕边界
            const maxLeft = window.innerWidth - this.width;
            const maxTop = window.innerHeight - this.height;
            
            // 保存位置并应用
            this.posX = Math.min(maxLeft, newLeft);
            this.posY = Math.min(maxTop, newTop);
            
            this.panel.style.left = this.posX + 'px';
            this.panel.style.top = this.posY + 'px';
            
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
                background-color: rgba(40, 40, 40, 0.9);
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                font-family: monospace;
                z-index: 10000;
                transition: opacity 0.3s;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                scale:1.2;
            }
            
            .debug-panel.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .debug-panel.visible {
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
            
            .debug-panel-tabs {
                display: flex;
                height: 24px;
                background-color: rgba(30, 30, 30, 0.85);
                border-bottom: 1px solid #555;
                flex-shrink: 0;
            }
            
            .debug-panel-tab {
                padding: 4px 10px;
                font-size: 9px;
                cursor: pointer;
                user-select: none;
                border-right: 1px solid #555;
                display: flex;
                align-items: center;
            }
            
            .debug-panel-tab.active {
                background-color: rgba(60, 60, 60, 0.9);
                color: #fff;
            }
            
            .debug-panel-tab:hover:not(.active) {
                background-color: rgba(50, 50, 50, 0.9);
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
            
            .debug-panel-console {
                overflow-y: auto;
                padding: 5px;
                flex-grow: 1;
                font-size: 9px;
                word-break: break-word;
                white-space: pre-wrap;
                height: calc(100% - 54px); /* 减去头部和tabs高度 */
            }
            
            .debug-panel-console::-webkit-scrollbar,
            .debug-panel-buttons::-webkit-scrollbar {
                width: 4px;
            }
            
            .debug-panel-console::-webkit-scrollbar-track,
            .debug-panel-buttons::-webkit-scrollbar-track {
                background: rgba(30, 30, 30, 0.3);
            }
            
            .debug-panel-console::-webkit-scrollbar-thumb,
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
            
            .console-message {
                margin: 2px 0;
                border-bottom: 1px dotted #444;
                padding-bottom: 2px;
                font-family: monospace;
            }
            
            .console-timestamp {
                color: #888;
                font-size: 8px;
                margin-right: 4px;
            }
            
            .console-log {
                color: #ccc;
            }
            
            .console-info {
                color: #7bb8ff;
            }
            
            .console-warn {
                color: #ffda77;
                background-color: rgba(70, 60, 0, 0.2);
            }
            
            .console-error {
                color: #ff7777;
                background-color: rgba(70, 0, 0, 0.2);
            }
            
            .console-debug {
                color: #77ffb1;
            }
        `;

        document.head.appendChild(styleElement);
    }
}
