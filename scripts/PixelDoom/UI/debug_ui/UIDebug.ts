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
    AddValue(variable: any): DebugPanelInstance;
}

export class UIDebug {
    private static menuPanel: HTMLDivElement | null = null;
    private static buttonsContainer: HTMLDivElement | null = null;
    private static isMenuVisible: boolean = false;
    private static toggleKey: string = "";
    private static consoleContainer: HTMLDivElement | null = null;
    private static originalConsole: any = {};
    private static isConsoleEnabled: boolean = false;
    private static alwaysShowConsole: boolean = true; // 控制台始终显示的标志
    private static consolePosition: 'top' | 'bottom' = 'bottom'; // 控制台位置
    private static consoleFontSize: number = 10; // 控制台字体大小
    private static consoleUseBackplate: boolean = true; // 是否使用底板样式
    private static consoleBackplateColor: string = '20, 30, 60'; // 底板颜色（RGB）
    private static consoleBackplateOpacity: number = 0.5; // 底板透明度
    private static mouseX: number = 0; // 记录鼠标X位置
    private static mouseY: number = 0; // 记录鼠标Y位置
    
    // 新增：随机控制台字体颜色相关变量
    private static consoleRandomColor: boolean = false; // 随机控制台字体颜色开关
    private static consoleColorRandomGroupSize: number = 3; // 字体颜色行数控制随机（1-5）
    private static currentColorGroup: string = '#ffffff'; // 当前颜色组使用的颜色
    private static colorGroupCounter: number = 0; // 当前颜色组计数器
    private static availableColors: string[] = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
        '#fd79a8', '#fdcb6e', '#6c5ce7', '#74b9ff', '#00b894',
        '#e17055', '#a29bfe', '#fd79a8', '#fdcb6e', '#55a3ff'
    ]; // 可用颜色列表
    
    // 新增：变量监控窗口相关变量
    private static variableMonitorWindow: HTMLDivElement | null = null;
    private static variableList: HTMLDivElement | null = null;
    private static monitoredVariables: Map<string, any> = new Map(); // 监控的变量列表
    private static isVariableWindowVisible: boolean = false;
    private static isDragging: boolean = false;
    private static dragOffset: { x: number; y: number } = { x: 0, y: 0 };

    /**
     * 初始化调试面板
     * @param toggleKey 用于显示/隐藏面板的按键
     * @returns 调试面板实例
     */
    public static InitDebugPanel(toggleKey: string = '`'): DebugPanelInstance {
        if (this.menuPanel) {
            console.warn('Debug panel already initialized');
            return {
                DebuPanelAddButton: (name: string, callback: () => void) => {
                    return UIDebug.DebuPanelAddButton(name, callback);
                },
                InitConsoleCapture: () => {
                    return UIDebug.InitConsoleCapture();
                },
                AddValue: (variable: any) => {
                    return UIDebug.AddValue(variable);
                }
            };
        }

        this.toggleKey = toggleKey;

        // 创建面板样式
        this.createStyles();

        // 创建菜单元素
        this.createMenuElement();

        // 创建控制台元素
        this.createConsoleElement();

        // 创建变量监控窗口
        this.createVariableMonitorWindow();

        // 添加鼠标移动事件监听，记录鼠标位置
        document.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });

        // 添加键盘事件监听
        document.addEventListener('keydown', (event) => {
            if (event.key.toLocaleLowerCase() === this.toggleKey.toLocaleLowerCase()) {
                this.toggleMenu();
            }
        });

        // 点击空白处隐藏菜单
        document.addEventListener('click', (event) => {
            if (this.isMenuVisible && this.menuPanel && !this.menuPanel.contains(event.target as Node)) {
                this.hideMenu();
            }
        });

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            },
            AddValue: (variable: any) => {
                return UIDebug.AddValue(variable);
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
                },
                AddValue: (variable: any) => {
                    return UIDebug.AddValue(variable);
                }
            };
        }

        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'debug-menu-button';
        button.addEventListener('click', () => {
            callback();
            this.hideMenu(); // 点击按钮后隐藏菜单
        });

        this.buttonsContainer.appendChild(button);

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            },
            AddValue: (variable: any) => {
                return UIDebug.AddValue(variable);
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
                },
                AddValue: (variable: any) => {
                    return UIDebug.AddValue(variable);
                }
            };
        }

        this.isConsoleEnabled = true;

        // 替换原始console方法
        this.overrideConsoleMethods();

        // 添加清除控制台按钮
        this.DebuPanelAddButton('清除控制台', () => {
            if (this.consoleContainer) {
                this.consoleContainer.innerHTML = '';
            }
        });

        // 添加变量监控窗口控制按钮
        this.DebuPanelAddButton('显示变量监控', () => {
            this.toggleVariableMonitorWindow();
        });

        // 添加随机颜色控制按钮
        this.DebuPanelAddButton('切换随机颜色', () => {
            this.SetConsoleRandomColor(!this.consoleRandomColor);
        });

        // 添加设置颜色组大小按钮
        this.DebuPanelAddButton('颜色组大小+', () => {
            this.SetConsoleColorGroupSize(this.consoleColorRandomGroupSize + 1);
        });

        this.DebuPanelAddButton('颜色组大小-', () => {
            this.SetConsoleColorGroupSize(this.consoleColorRandomGroupSize - 1);
        });

        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            },
            AddValue: (variable: any) => {
                return UIDebug.AddValue(variable);
            }
        };
    }

    /**
     * 设置控制台是否始终显示
     * @param show 是否始终显示
     */
    public static SetConsoleAlwaysShow(show: boolean): void {
        this.alwaysShowConsole = show;
        if (this.consoleContainer) {
            this.consoleContainer.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * 设置控制台位置
     * @param position 位置 'top' 或 'bottom'
     */
    public static SetConsolePosition(position: 'top' | 'bottom'): void {
        this.consolePosition = position;
        this.updateConsoleStyles();
    }

    /**
     * 设置控制台字体大小
     * @param size 字体大小（像素）
     */
    public static SetConsoleFontSize(size: number): void {
        this.consoleFontSize = size;
        this.updateConsoleStyles();
    }

    /**
     * 设置是否使用底板样式
     * @param use 是否使用底板
     */
    public static SetConsoleUseBackplate(use: boolean): void {
        this.consoleUseBackplate = use;
        this.updateConsoleStyles();
    }

    /**
     * 设置控制台底板颜色
     * @param color RGB颜色字符串，例如 '40, 40, 40'
     */
    public static SetConsoleBackplateColor(color: string): void {
        this.consoleBackplateColor = color;
        this.updateConsoleStyles();
    }

    /**
     * 设置控制台底板透明度
     * @param opacity 透明度值，0-1之间
     */
    public static SetConsoleBackplateOpacity(opacity: number): void {
        this.consoleBackplateOpacity = Math.max(0, Math.min(1, opacity));
        this.updateConsoleStyles();
    }

    /**
     * 更新控制台样式
     */
    private static updateConsoleStyles(): void {
        if (!this.consoleContainer) return;
        
        // 更新位置
        if (this.consolePosition === 'top') {
            this.consoleContainer.style.bottom = 'auto';
            this.consoleContainer.style.top = '0';
        } else {
            this.consoleContainer.style.top = 'auto';
            this.consoleContainer.style.bottom = '0';
        }

        // 更新字体大小
        this.consoleContainer.style.fontSize = this.consoleFontSize + 'px';
        
        // 更新底板样式类
        if (this.consoleUseBackplate) {
            this.consoleContainer.classList.add('use-backplate');
        } else {
            this.consoleContainer.classList.remove('use-backplate');
        }
        
        // 更新CSS变量
        this.consoleContainer.style.setProperty('--backplate-color', this.consoleBackplateColor);
        this.consoleContainer.style.setProperty('--backplate-opacity', this.consoleBackplateOpacity.toString());
    }

    /**
     * 创建控制台元素
     */
    private static createConsoleElement(): void {
        // 创建控制台容器，固定在底部
        this.consoleContainer = document.createElement('div');
        this.consoleContainer.className = 'debug-console';
        this.consoleContainer.style.display = this.alwaysShowConsole ? 'block' : 'none';
        
        // 应用初始样式设置
        this.updateConsoleStyles();
        
        // 添加鼠标滚轮事件监听
        document.addEventListener('wheel', (event) => {
            if (!this.consoleContainer || !this.alwaysShowConsole) return;
            
            // 根据控制台位置判断滚动区域
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const mouseY = event.clientY;
            const threshold = viewportHeight * 0.3; // 30%的区域
            
            let shouldScroll = false;
            if (this.consolePosition === 'bottom') {
                // 底部时，鼠标在屏幕底部30%区域时响应
                shouldScroll = mouseY > (viewportHeight - threshold);
            } else {
                // 顶部时，鼠标在屏幕顶部30%区域时响应
                shouldScroll = mouseY < threshold;
            }
            
            if (shouldScroll) {
                const delta = event.deltaY;
                this.consoleContainer.scrollTop += delta;
                
                // 防止页面滚动
                if (this.consoleContainer.scrollHeight > this.consoleContainer.clientHeight) {
                    event.preventDefault();
                }
            }
        }, { passive: false });
        
        // 添加到文档
        document.body.appendChild(this.consoleContainer);
    }

    /**
     * 创建变量监控窗口
     */
    private static createVariableMonitorWindow(): void {
        // 创建变量监控窗口容器
        this.variableMonitorWindow = document.createElement('div');
        this.variableMonitorWindow.className = 'variable-monitor-window';
        this.variableMonitorWindow.style.display = 'none';
        
        // 创建窗口头部（用于拖拽）
        const header = document.createElement('div');
        header.className = 'variable-monitor-header';
        header.textContent = '变量监控';
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'variable-monitor-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            this.hideVariableMonitorWindow();
        });
        header.appendChild(closeButton);
        
        // 创建变量列表容器
        this.variableList = document.createElement('div');
        this.variableList.className = 'variable-monitor-list';
        
        // 组装窗口
        this.variableMonitorWindow.appendChild(header);
        this.variableMonitorWindow.appendChild(this.variableList);
        
        // 添加拖拽功能
        this.setupWindowDragAndDrop(header);
        
        // 添加到文档
        document.body.appendChild(this.variableMonitorWindow);
    }

    /**
     * 设置窗口拖拽功能
     */
    private static setupWindowDragAndDrop(header: HTMLElement): void {
        header.addEventListener('mousedown', (e) => {
            if (e.target === header || header.contains(e.target as Node)) {
                this.isDragging = true;
                const rect = this.variableMonitorWindow!.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                
                document.addEventListener('mousemove', this.handleWindowDrag);
                document.addEventListener('mouseup', this.handleWindowDragEnd);
                e.preventDefault();
            }
        });
    }

    /**
     * 处理窗口拖拽
     */
    private static handleWindowDrag = (e: MouseEvent): void => {
        if (!this.isDragging || !this.variableMonitorWindow) return;
        
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        this.variableMonitorWindow.style.left = newX + 'px';
        this.variableMonitorWindow.style.top = newY + 'px';
    }

    /**
     * 处理窗口拖拽结束
     */
    private static handleWindowDragEnd = (): void => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleWindowDrag);
        document.removeEventListener('mouseup', this.handleWindowDragEnd);
    }

    /**
     * 显示变量监控窗口
     */
    private static showVariableMonitorWindow(): void {
        if (!this.variableMonitorWindow) return;
        this.variableMonitorWindow.style.display = 'block';
        this.isVariableWindowVisible = true;
    }

    /**
     * 隐藏变量监控窗口
     */
    private static hideVariableMonitorWindow(): void {
        if (!this.variableMonitorWindow) return;
        this.variableMonitorWindow.style.display = 'none';
        this.isVariableWindowVisible = false;
    }

    /**
     * 切换变量监控窗口显示状态
     */
    private static toggleVariableMonitorWindow(): void {
        if (this.isVariableWindowVisible) {
            this.hideVariableMonitorWindow();
        } else {
            this.showVariableMonitorWindow();
        }
    }

    /**
     * 获取随机颜色（用于控制台消息）
     */
    private static getRandomColor(): string {
        return this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
    }

    /**
     * 获取当前控制台消息应该使用的颜色
     */
    private static getCurrentConsoleColor(): string {
        if (!this.consoleRandomColor) {
            return '#ffffff'; // 默认白色
        }
        
        // 如果计数器达到组大小，则重新选择颜色
        if (this.colorGroupCounter >= this.consoleColorRandomGroupSize) {
            this.currentColorGroup = this.getRandomColor();
            this.colorGroupCounter = 0;
        }
        
        this.colorGroupCounter++;
        return this.currentColorGroup;
    }

    /**
     * 设置控制台随机颜色
     */
    public static SetConsoleRandomColor(enable: boolean): void {
        this.consoleRandomColor = enable;
        if (enable) {
            this.currentColorGroup = this.getRandomColor();
            this.colorGroupCounter = 0;
        }
    }

    /**
     * 设置控制台颜色组大小
     */
    public static SetConsoleColorGroupSize(size: number): void {
        this.consoleColorRandomGroupSize = Math.max(1, Math.min(5, size));
    }

    /**
     * 添加要监控的变量
     */
    public static AddValue(variable: any): DebugPanelInstance {
        if (!this.variableList) {
            console.error('Variable monitor window not initialized.');
            return {
                DebuPanelAddButton: (name: string, callback: () => void) => {
                    return UIDebug.DebuPanelAddButton(name, callback);
                },
                InitConsoleCapture: () => {
                    return UIDebug.InitConsoleCapture();
                },
                AddValue: (variable: any) => {
                    return UIDebug.AddValue(variable);
                }
            };
        }

        // 生成唯一ID
        const variableId = 'var_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 获取变量信息
        const variableInfo = this.getVariableInfo(variable);
        
        // 存储变量引用
        this.monitoredVariables.set(variableId, {
            reference: variable,
            info: variableInfo
        });
        
        // 创建变量显示元素
        this.createVariableListItem(variableId, variableInfo);
        
        // 启动监控更新
        this.startVariableMonitoring();
        
        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            },
            AddValue: (variable: any) => {
                return UIDebug.AddValue(variable);
            }
        };
    }

    /**
     * 获取变量信息
     */
    private static getVariableInfo(variable: any): any {
        const stack = (new Error()).stack;
        const scriptName = this.extractScriptName(stack);
        
        return {
            name: this.getVariableName(variable),
            value: variable,
            className: this.getClassName(variable),
            scriptName: scriptName
        };
    }

    /**
     * 获取变量名（尽力而为）
     */
    private static getVariableName(variable: any): string {
        if (variable && variable.constructor && variable.constructor.name) {
            return variable.constructor.name;
        }
        return typeof variable;
    }

    /**
     * 获取类名
     */
    private static getClassName(variable: any): string {
        if (variable && variable.constructor) {
            return variable.constructor.name;
        }
        return typeof variable;
    }

    /**
     * 从堆栈中提取脚本名
     */
    private static extractScriptName(stack: string | undefined): string {
        if (!stack) return 'unknown';
        
        const lines = stack.split('\n');
        for (let i = 2; i < lines.length; i++) { // 跳过前两行
            const match = lines[i].match(/\/([^\/]+\.(?:js|ts))/);
            if (match) {
                return match[1];
            }
        }
        return 'unknown';
    }

    /**
     * 创建变量列表项
     */
    private static createVariableListItem(variableId: string, variableInfo: any): void {
        const listItem = document.createElement('div');
        listItem.className = 'variable-list-item';
        listItem.id = variableId;
        
        // 变量名
        const nameSpan = document.createElement('span');
        nameSpan.className = 'variable-name';
        nameSpan.textContent = variableInfo.name;
        
        // 变量值
        const valueSpan = document.createElement('span');
        valueSpan.className = 'variable-value';
        valueSpan.textContent = this.formatVariableValue(variableInfo.value);
        
        // 变量类
        const classSpan = document.createElement('span');
        classSpan.className = 'variable-class';
        classSpan.textContent = variableInfo.className;
        
        // 脚本名
        const scriptSpan = document.createElement('span');
        scriptSpan.className = 'variable-script';
        scriptSpan.textContent = variableInfo.scriptName;
        
        // 删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.className = 'variable-delete';
        deleteButton.textContent = '×';
        deleteButton.addEventListener('click', () => {
            this.removeVariable(variableId);
        });
        
        listItem.appendChild(nameSpan);
        listItem.appendChild(valueSpan);
        listItem.appendChild(classSpan);
        listItem.appendChild(scriptSpan);
        listItem.appendChild(deleteButton);
        
        this.variableList!.appendChild(listItem);
    }

    /**
     * 格式化变量值显示
     */
    private static formatVariableValue(value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch {
                return '[Object]';
            }
        }
        return String(value);
    }

    /**
     * 移除变量监控
     */
    private static removeVariable(variableId: string): void {
        this.monitoredVariables.delete(variableId);
        const element = document.getElementById(variableId);
        if (element) {
            element.remove();
        }
    }

    /**
     * 启动变量监控更新
     */
    private static startVariableMonitoring(): void {
        // 避免重复启动
        if ((this as any).monitoringInterval) return;
        
        (this as any).monitoringInterval = setInterval(() => {
            this.updateVariableDisplay();
        }, 100); // 每100ms更新一次
    }

    /**
     * 更新变量显示
     */
    private static updateVariableDisplay(): void {
        this.monitoredVariables.forEach((data, variableId) => {
            const element = document.getElementById(variableId);
            if (element) {
                const valueSpan = element.querySelector('.variable-value');
                if (valueSpan) {
                    const newValue = this.formatVariableValue(data.reference);
                    if (valueSpan.textContent !== newValue) {
                        valueSpan.textContent = newValue;
                        // 添加更新动画效果
                        valueSpan.classList.add('variable-updated');
                        setTimeout(() => {
                            valueSpan.classList.remove('variable-updated');
                        }, 300);
                    }
                }
            }
        });
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

        // 创建消息包装容器
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'console-message-wrapper';

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

        // 应用随机颜色（如果启用）
        if (this.consoleRandomColor) {
            const color = this.getCurrentConsoleColor();
            messageElement.style.color = color;
        }

        // 将消息元素添加到包装容器
        messageWrapper.appendChild(messageElement);

        // 添加到容器
        this.consoleContainer.appendChild(messageWrapper);

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
     * 切换菜单的显示状态
     */
    private static toggleMenu(): void {
        if (!this.menuPanel) return;

        this.isMenuVisible = !this.isMenuVisible;

        if (this.isMenuVisible) {
            this.showMenu();
        } else {
            this.hideMenu();
        }
    }

    /**
     * 显示菜单
     */
    private static showMenu(): void {
        if (!this.menuPanel) return;
        
        // 设置菜单位置为鼠标位置
        const menuWidth = 180; // 菜单宽度
        const menuHeight = 400; // 菜单最大高度
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // 计算菜单位置，确保不超出屏幕边界
        let left = this.mouseX;
        let top = this.mouseY;
        
        // 如果菜单会超出右边界，则向左显示
        if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - 10;
        }
        
        // 如果菜单会超出下边界，则向上显示
        if (top + menuHeight > viewportHeight) {
            top = viewportHeight - menuHeight - 10;
        }
        
        this.menuPanel.style.left = left + 'px';
        this.menuPanel.style.top = top + 'px';
        this.menuPanel.style.display = 'block';
        this.isMenuVisible = true;
    }

    /**
     * 隐藏菜单
     */
    private static hideMenu(): void {
        if (!this.menuPanel) return;
        this.menuPanel.style.display = 'none';
        this.isMenuVisible = false;
    }

    /**
     * 创建菜单HTML元素
     */
    private static createMenuElement(): void {
        // 创建主菜单
        this.menuPanel = document.createElement('div');
        this.menuPanel.className = 'debug-menu';
        this.menuPanel.style.display = 'none';

        // 创建按钮容器
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'debug-menu-buttons';

        // 直接添加按钮容器，去掉标题头部
        this.menuPanel.appendChild(this.buttonsContainer);

        // 添加到文档
        document.body.appendChild(this.menuPanel);
    }

    /**
     * 创建必要的样式
     */
    private static createStyles(): void {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* 控制台样式 */
            .debug-console {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                max-height: 36vh;
                overflow-y: auto;
                color: #ffffff;
                font-family: monospace;
                z-index: 9999999999999;
                padding: 5px;
                scrollbar-width: none; /* Firefox */
                font-size: 9px;
                word-break: break-word;
                white-space: pre-wrap;
                pointer-events: none; /* 使控制台不拦截下方UI的鼠标事件 */
                --backplate-color: 40, 40, 40;
                --backplate-opacity: 0.2;
            }
            
            .debug-console::-webkit-scrollbar {
                display: none; /* Chrome, Safari */
            }
            
            /* 右键菜单风格 */
            .debug-menu {
                position: fixed;
                min-width: 150px;
                border-radius: 6px;
                color: #ffffff;
                font-family: monospace;
                z-index: 10000;
                overflow: hidden;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
                background-color: rgba(45, 45, 45, 0.95);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .debug-menu-buttons {
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                max-height: 400px;
            }
            
            .debug-menu-button {
                background: none;
                border: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #eee;
                cursor: pointer;
                font-family: monospace;
                padding: 10px 15px;
                text-align: left;
                transition: all 0.15s;
                font-size: 11px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            
            .debug-menu-button:last-child {
                border-bottom: none;
            }
            
            .debug-menu-button:hover {
                background-color: rgba(80, 120, 200, 0.7);
                color: #fff;
            }
            
            /* 控制台消息包装容器 - 确保每个消息独占一行 */
            .console-message-wrapper {
                display: block;
                width: 100%;
                margin: 0;
                padding: 0;
            }
            
            /* 控制台消息样式 - 宽度跟随内容 */
            .console-message {
                margin: 2px 0;
                padding: 2px 5px;
                font-family: monospace;
                pointer-events: none; /* 确保控制台消息完全不拦截点击事件 */
                display: inline-block; /* 使用inline-block让宽度跟随内容 */
                border-radius: 2px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                box-sizing: border-box;
                max-width: 100%; /* 最大宽度不超过容器 */
            }
            
            /* 使用底板样式时的消息样式 */
            .debug-console.use-backplate .console-message {
                background-color: rgba(var(--backplate-color), var(--backplate-opacity));
                margin: 3px 0;
            }
            
            .console-timestamp {
                color: rgba(136, 136, 136, 0.9);
                font-size: 0.85em;
                margin-right: 4px;
            }
            
            /* 普通日志 */
            .console-log {
                color: rgba(204, 204, 204, 0.95);
            }
            
            /* 信息日志 - 蓝色底板 */
            .console-info {
                color: rgba(123, 184, 255, 0.95);
                background-color: rgba(30, 60, 120, 0.4) !important;
            }
            
            /* 警告日志 - 黄色底板 */
            .console-warn {
                color: rgba(255, 218, 119, 0.95);
                background-color: rgba(120, 90, 0, 0.4) !important;
            }
            
            /* 错误日志 - 红色底板 */
            .console-error {
                color: rgba(255, 119, 119, 0.95);
                background-color: rgba(120, 0, 0, 0.4) !important;
            }
            
            /* 调试日志 - 绿色底板 */
            .console-debug {
                color: rgba(119, 255, 177, 0.95);
                background-color: rgba(0, 80, 40, 0.4) !important;
            }
            
            /* 变量监控窗口样式 */
            .variable-monitor-window {
                position: fixed;
                top: 20%;
                left: 20%;
                width: 600px;
                height: 400px;
                background-color: rgba(30, 30, 30, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                z-index: 10001;
                font-family: monospace;
                color: #ffffff;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .variable-monitor-header {
                background-color: rgba(50, 50, 50, 0.8);
                padding: 10px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                cursor: move;
                user-select: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                font-size: 12px;
            }
            
            .variable-monitor-close {
                background: none;
                border: none;
                color: #ff6b6b;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                transition: background-color 0.2s;
            }
            
            .variable-monitor-close:hover {
                background-color: rgba(255, 107, 107, 0.2);
            }
            
            .variable-monitor-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                font-size: 11px;
            }
            
            .variable-list-item {
                display: grid;
                grid-template-columns: 1fr 2fr 1fr 1fr auto;
                gap: 10px;
                padding: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                align-items: center;
                transition: background-color 0.2s;
            }
            
            .variable-list-item:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            .variable-name {
                color: #4ecdc4;
                font-weight: bold;
                word-break: break-all;
            }
            
            .variable-value {
                color: #ffeaa7;
                word-break: break-all;
                transition: all 0.3s;
            }
            
            .variable-value.variable-updated {
                background-color: rgba(255, 234, 167, 0.3);
                transform: scale(1.02);
            }
            
            .variable-class {
                color: #74b9ff;
                word-break: break-all;
            }
            
            .variable-script {
                color: #fd79a8;
                word-break: break-all;
            }
            
            .variable-delete {
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                font-size: 14px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                transition: background-color 0.2s;
            }
            
            .variable-delete:hover {
                background-color: rgba(255, 107, 107, 0.2);
            }
        `;

        document.head.appendChild(styleElement);
    }
}
