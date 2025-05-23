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
    private static expandedItems: Set<string> = new Set(); // 展开的项目ID集合
    private static maxDisplayLength: number = 50; // 变量值最大显示长度（降低到50字符）

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
            // 添加Escape键快速收起所有展开的变量
            if (event.key === 'Escape' && this.isVariableWindowVisible) {
                this.collapseAllVariables();
                event.preventDefault();
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

        // 添加变量显示长度控制按钮
        this.DebuPanelAddButton('变量显示长度+', () => {
            this.SetVariableDisplayMaxLength(this.maxDisplayLength + 10);
            console.log('当前变量显示长度: ' + this.maxDisplayLength);
        });

        this.DebuPanelAddButton('变量显示长度-', () => {
            this.SetVariableDisplayMaxLength(this.maxDisplayLength - 10);
            console.log('当前变量显示长度: ' + this.maxDisplayLength);
        });

        // 添加测试长文本按钮
        this.DebuPanelAddButton('测试长文本', () => {
            const testLongText = {
                shortText: "短文本",
                longText: "这是一个很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的测试文本",
                jsonData: {
                    name: "测试数据",
                    description: "这是一个包含很多属性的复杂对象，用来测试JSON序列化后的长文本显示功能",
                    properties: {
                        prop1: "属性1",
                        prop2: "属性2",
                        prop3: {
                            nestedProp: "嵌套属性",
                            anotherNested: "另一个嵌套属性"
                        }
                    },
                    array: ["元素1", "元素2", "元素3", "元素4", "元素5"]
                }
            };
            this.AddValue(testLongText);
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
        
        // 创建标题
        const title = document.createElement('span');
        title.textContent = '变量监控';
        
        // 创建控制按钮容器
        const controls = document.createElement('div');
        controls.className = 'variable-monitor-controls';
        
        // 创建全部收起按钮
        const collapseAllButton = document.createElement('button');
        collapseAllButton.className = 'variable-monitor-collapse-all';
        collapseAllButton.textContent = '收起全部';
        collapseAllButton.title = '收起所有展开的项目';
        collapseAllButton.addEventListener('click', () => {
            this.collapseAllVariables();
        });
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'variable-monitor-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            this.hideVariableMonitorWindow();
        });
        
        controls.appendChild(collapseAllButton);
        controls.appendChild(closeButton);
        header.appendChild(title);
        header.appendChild(controls);
        
        // 创建变量列表容器
        this.variableList = document.createElement('div');
        this.variableList.className = 'variable-monitor-list';
        
        // 创建空状态提示
        const emptyState = document.createElement('div');
        emptyState.className = 'variable-monitor-empty';
        emptyState.textContent = '未添加任何变量';
        this.variableList.appendChild(emptyState);
        
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
     * 设置变量显示最大长度
     */
    public static SetVariableDisplayMaxLength(length: number): void {
        this.maxDisplayLength = Math.max(20, Math.min(200, length));
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
    private static createVariableListItem(variableId: string, variableInfo: any, level: number = 0, parentPath: string = ''): void {
        // 隐藏空状态提示（如果有变量被添加）
        const emptyState = this.variableList?.querySelector('.variable-monitor-empty') as HTMLElement;
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        const listItem = document.createElement('div');
        listItem.className = 'variable-list-item';
        listItem.id = variableId;
        listItem.style.paddingLeft = (level * 20 + 8) + 'px'; // 层级缩进
        
        // 创建主要内容容器
        const mainContent = document.createElement('div');
        mainContent.className = 'variable-main-content';
        
        // 展开/折叠按钮（只对对象类型显示）
        const expandButton = document.createElement('button');
        expandButton.className = 'variable-expand-button';
        const canExpand = this.canVariableExpand(variableInfo.value);
        
        if (canExpand) {
            const isExpanded = this.expandedItems.has(variableId);
            expandButton.textContent = isExpanded ? '▼' : '▶';
            expandButton.addEventListener('click', () => {
                this.toggleVariableExpansion(variableId, variableInfo.value, level, parentPath);
            });
        } else {
            expandButton.textContent = '';
            expandButton.style.visibility = 'hidden';
        }
        
        // 变量名
        const nameSpan = document.createElement('span');
        nameSpan.className = 'variable-name';
        nameSpan.textContent = level === 0 ? variableInfo.name : this.getPropertyDisplayName(variableInfo.name, parentPath);
        
        // 变量值容器
        const valueContainer = document.createElement('div');
        valueContainer.className = 'variable-value-container';
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'variable-value';
        
        // 处理值显示
        const formattedValue = this.formatVariableValue(variableInfo.value);
        const needsTruncation = formattedValue.length > this.maxDisplayLength;
        
        if (needsTruncation) {
            // 创建截断显示
            const truncatedValue = formattedValue.substring(0, this.maxDisplayLength) + '...';
            valueSpan.textContent = truncatedValue;
            
            // 添加展开角标
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'variable-expand-indicator';
            expandIndicator.textContent = '📄';
            expandIndicator.title = '点击查看完整内容';
            
            const isTextExpanded = this.expandedItems.has(variableId + '_text');
            
            expandIndicator.addEventListener('click', () => {
                this.toggleTextExpansion(variableId, formattedValue, valueSpan);
            });
            
            valueContainer.appendChild(valueSpan);
            valueContainer.appendChild(expandIndicator);
        } else {
            valueSpan.textContent = formattedValue;
            valueContainer.appendChild(valueSpan);
        }
        
        // 变量类型和脚本信息（只在顶级显示）
        const metaInfo = document.createElement('div');
        metaInfo.className = 'variable-meta-info';
        
        if (level === 0) {
            const classSpan = document.createElement('span');
            classSpan.className = 'variable-class';
            classSpan.textContent = variableInfo.className;
            
            const scriptSpan = document.createElement('span');
            scriptSpan.className = 'variable-script';
            scriptSpan.textContent = variableInfo.scriptName;
            
            metaInfo.appendChild(classSpan);
            metaInfo.appendChild(scriptSpan);
        }
        
        // 删除按钮（只在顶级显示）
        const deleteButton = document.createElement('button');
        deleteButton.className = 'variable-delete';
        deleteButton.textContent = '×';
        deleteButton.style.display = level === 0 ? 'flex' : 'none';
        deleteButton.addEventListener('click', () => {
            this.removeVariable(variableId);
        });
        
        // 组装主要内容
        mainContent.appendChild(expandButton);
        mainContent.appendChild(nameSpan);
        mainContent.appendChild(valueContainer);
        mainContent.appendChild(metaInfo);
        mainContent.appendChild(deleteButton);
        
        listItem.appendChild(mainContent);
        
        // 为子项创建容器
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'variable-children-container';
        childrenContainer.id = variableId + '_children';
        childrenContainer.style.display = 'none';
        listItem.appendChild(childrenContainer);
        
        this.variableList!.appendChild(listItem);
        
        // 如果已展开，显示子项
        if (this.expandedItems.has(variableId) && canExpand) {
            this.expandVariable(variableId, variableInfo.value, level, parentPath);
        }
    }

    /**
     * 格式化变量值显示
     */
    private static formatVariableValue(value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') {
            // 对于长字符串不加引号，短字符串加引号便于识别
            if (value.length > 30) {
                return value;
            } else {
                return `"${value}"`;
            }
        }
        if (typeof value === 'object') {
            try {
                const jsonString = JSON.stringify(value);
                // 如果JSON字符串很长，进行格式化
                if (jsonString.length > this.maxDisplayLength) {
                    return JSON.stringify(value, null, 2);
                }
                return jsonString;
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
        
        // 清理相关的展开状态
        this.expandedItems.forEach(itemId => {
            if (itemId.startsWith(variableId)) {
                this.expandedItems.delete(itemId);
            }
        });
        
        // 如果没有变量了，显示空状态提示
        if (this.monitoredVariables.size === 0) {
            const emptyState = this.variableList?.querySelector('.variable-monitor-empty') as HTMLElement;
            if (emptyState) {
                emptyState.style.display = 'block';
            }
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
                const valueContainer = element.querySelector('.variable-value-container');
                if (valueContainer) {
                    const newValue = this.formatVariableValue(data.reference);
                    const needsTruncation = newValue.length > this.maxDisplayLength;
                    
                    // 清空现有内容
                    valueContainer.innerHTML = '';
                    
                    // 创建值显示元素
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'variable-value';
                    
                    if (needsTruncation) {
                        const truncatedValue = newValue.substring(0, this.maxDisplayLength) + '...';
                        valueSpan.textContent = truncatedValue;
                        
                        // 创建角标
                        const expandIndicator = document.createElement('span');
                        expandIndicator.className = 'variable-expand-indicator';
                        expandIndicator.textContent = '📄';
                        expandIndicator.title = '点击查看完整内容';
                        
                        expandIndicator.addEventListener('click', () => {
                            this.toggleTextExpansion(variableId, newValue, valueSpan);
                        });
                        
                        valueContainer.appendChild(valueSpan);
                        valueContainer.appendChild(expandIndicator);
                    } else {
                        valueSpan.textContent = newValue;
                        valueContainer.appendChild(valueSpan);
                    }
                    
                    // 添加更新动画效果
                    valueSpan.classList.add('variable-updated');
                    setTimeout(() => {
                        valueSpan.classList.remove('variable-updated');
                    }, 300);
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
            
            .variable-monitor-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .variable-monitor-collapse-all {
                background: rgba(76, 175, 80, 0.2);
                border: 1px solid rgba(76, 175, 80, 0.4);
                color: #4caf50;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                transition: all 0.2s;
                font-family: monospace;
            }
            
            .variable-monitor-collapse-all:hover {
                background: rgba(76, 175, 80, 0.4);
                color: #ffffff;
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
                scrollbar-width: thin; /* Firefox - 显示细滚动条 */
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1); /* Firefox滚动条颜色 */
            }
            
            /* Webkit浏览器（Chrome, Safari）滚动条样式 */
            .variable-monitor-list::-webkit-scrollbar {
                width: 8px;
                display: block !important; /* 强制显示滚动条 */
            }
            
            .variable-monitor-list::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            .variable-monitor-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            .variable-monitor-list::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .variable-list-item {
                display: block !important; /* 覆盖原有grid布局 */
                padding: 4px 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                transition: background-color 0.2s;
                margin: 1px 0;
            }
            
            .variable-main-content {
                display: flex;
                align-items: center;
                gap: 8px;
                min-height: 24px;
            }
            
            .variable-expand-button {
                background: none;
                border: none;
                color: #ffffff;
                cursor: pointer;
                font-size: 10px;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .variable-expand-button:hover {
                background-color: rgba(255, 255, 255, 0.1);
                transform: scale(1.1);
            }
            
            .variable-name {
                color: #4ecdc4;
                font-weight: bold;
                font-size: 11px;
                min-width: 80px;
                flex-shrink: 0;
            }
            
            .variable-child-name {
                color: #96ceb4;
                font-weight: normal;
            }
            
            .variable-value-container {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
                min-width: 0;
            }
            
            .variable-value {
                color: #ffeaa7;
                font-size: 10px;
                word-break: break-all;
                transition: all 0.3s;
                flex: 1;
                min-width: 0;
            }
            
            .variable-expand-indicator {
                background: none;
                border: none;
                color: #fd79a8;
                cursor: pointer;
                font-size: 12px;
                padding: 2px 4px;
                border-radius: 3px;
                transition: all 0.2s;
                flex-shrink: 0;
                background-color: rgba(253, 121, 168, 0.1);
            }
            
            .variable-expand-indicator:hover {
                background-color: rgba(253, 121, 168, 0.3);
                transform: scale(1.1);
            }
            
            .variable-meta-info {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .variable-class {
                color: #74b9ff;
                font-size: 9px;
                opacity: 0.8;
            }
            
            .variable-script {
                color: #fd79a8;
                font-size: 9px;
                opacity: 0.8;
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
                flex-shrink: 0;
            }
            
            .variable-delete:hover {
                background-color: rgba(255, 107, 107, 0.2);
            }
            
            .variable-children-container {
                margin-left: 16px;
                border-left: 1px solid rgba(255, 255, 255, 0.1);
                padding-left: 4px;
            }
            
            .variable-child-item {
                background-color: rgba(255, 255, 255, 0.02);
            }
            
            .variable-child-item:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            .variable-monitor-empty {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 40px 20px;
                font-size: 12px;
            }
            
            .variable-value.variable-updated {
                background-color: rgba(255, 234, 167, 0.3);
                transform: scale(1.02);
                border-radius: 3px;
                padding: 2px 4px;
                margin: -2px -4px;
            }
            
            .variable-text-expanded {
                background-color: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 4px !important;
                padding: 8px !important;
                margin: 4px 0 !important;
                white-space: pre-wrap !important;
                font-family: monospace !important;
                scrollbar-width: thin !important;
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1) !important;
            }
            
            .variable-text-expanded::-webkit-scrollbar {
                width: 6px;
            }
            
            .variable-text-expanded::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .variable-text-expanded::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }
        `;

        document.head.appendChild(styleElement);
    }

    /**
     * 判断变量是否可以展开
     */
    private static canVariableExpand(value: any): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') {
            if (Array.isArray(value)) return value.length > 0;
            return Object.keys(value).length > 0;
        }
        return false;
    }

    /**
     * 切换变量展开状态
     */
    private static toggleVariableExpansion(variableId: string, value: any, level: number, parentPath: string): void {
        const isExpanded = this.expandedItems.has(variableId);
        const expandButton = document.getElementById(variableId)?.querySelector('.variable-expand-button') as HTMLButtonElement;
        const childrenContainer = document.getElementById(variableId + '_children');
        
        if (isExpanded) {
            // 折叠
            this.expandedItems.delete(variableId);
            if (expandButton) expandButton.textContent = '▶';
            if (childrenContainer) {
                childrenContainer.style.display = 'none';
                childrenContainer.innerHTML = ''; // 清空子项
            }
        } else {
            // 展开
            this.expandedItems.add(variableId);
            if (expandButton) expandButton.textContent = '▼';
            this.expandVariable(variableId, value, level, parentPath);
        }
    }

    /**
     * 展开变量显示子项
     */
    private static expandVariable(variableId: string, value: any, level: number, parentPath: string): void {
        const childrenContainer = document.getElementById(variableId + '_children');
        if (!childrenContainer) return;
        
        childrenContainer.style.display = 'block';
        childrenContainer.innerHTML = ''; // 清空现有内容
        
        if (Array.isArray(value)) {
            // 处理数组
            value.forEach((item, index) => {
                const childId = variableId + '_child_' + index;
                const childInfo = {
                    name: `[${index}]`,
                    value: item,
                    className: typeof item,
                    scriptName: ''
                };
                
                // 创建子项元素
                this.createChildVariableItem(childId, childInfo, level + 1, parentPath + `[${index}]`, childrenContainer);
            });
        } else if (typeof value === 'object' && value !== null) {
            // 处理对象
            Object.keys(value).forEach(key => {
                const childId = variableId + '_child_' + key;
                const childInfo = {
                    name: key,
                    value: value[key],
                    className: typeof value[key],
                    scriptName: ''
                };
                
                // 创建子项元素
                this.createChildVariableItem(childId, childInfo, level + 1, parentPath + '.' + key, childrenContainer);
            });
        }
    }

    /**
     * 创建子变量项
     */
    private static createChildVariableItem(childId: string, childInfo: any, level: number, parentPath: string, container: HTMLElement): void {
        const listItem = document.createElement('div');
        listItem.className = 'variable-list-item variable-child-item';
        listItem.id = childId;
        listItem.style.paddingLeft = (level * 20 + 8) + 'px';
        
        // 创建主要内容容器
        const mainContent = document.createElement('div');
        mainContent.className = 'variable-main-content';
        
        // 展开/折叠按钮
        const expandButton = document.createElement('button');
        expandButton.className = 'variable-expand-button';
        const canExpand = this.canVariableExpand(childInfo.value);
        
        if (canExpand) {
            const isExpanded = this.expandedItems.has(childId);
            expandButton.textContent = isExpanded ? '▼' : '▶';
            expandButton.addEventListener('click', () => {
                this.toggleVariableExpansion(childId, childInfo.value, level, parentPath);
            });
        } else {
            expandButton.textContent = '';
            expandButton.style.visibility = 'hidden';
        }
        
        // 变量名
        const nameSpan = document.createElement('span');
        nameSpan.className = 'variable-name variable-child-name';
        nameSpan.textContent = childInfo.name;
        
        // 变量值容器
        const valueContainer = document.createElement('div');
        valueContainer.className = 'variable-value-container';
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'variable-value';
        
        // 处理值显示
        const formattedValue = this.formatVariableValue(childInfo.value);
        const needsTruncation = formattedValue.length > this.maxDisplayLength;
        
        if (needsTruncation) {
            const truncatedValue = formattedValue.substring(0, this.maxDisplayLength) + '...';
            valueSpan.textContent = truncatedValue;
            
            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'variable-expand-indicator';
            expandIndicator.textContent = '📄';
            expandIndicator.title = '点击查看完整内容';
            
            expandIndicator.addEventListener('click', () => {
                this.toggleTextExpansion(childId, formattedValue, valueSpan);
            });
            
            valueContainer.appendChild(valueSpan);
            valueContainer.appendChild(expandIndicator);
        } else {
            valueSpan.textContent = formattedValue;
            valueContainer.appendChild(valueSpan);
        }
        
        // 组装主要内容
        mainContent.appendChild(expandButton);
        mainContent.appendChild(nameSpan);
        mainContent.appendChild(valueContainer);
        
        listItem.appendChild(mainContent);
        
        // 为子项创建容器
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'variable-children-container';
        childrenContainer.id = childId + '_children';
        childrenContainer.style.display = 'none';
        listItem.appendChild(childrenContainer);
        
        container.appendChild(listItem);
        
        // 如果已展开，显示子项
        if (this.expandedItems.has(childId) && canExpand) {
            this.expandVariable(childId, childInfo.value, level, parentPath);
        }
    }

    /**
     * 获取属性显示名
     */
    private static getPropertyDisplayName(name: string, parentPath: string): string {
        return name;
    }

    /**
     * 切换文本展开状态
     */
    private static toggleTextExpansion(variableId: string, fullText: string, valueSpan: HTMLElement): void {
        const textExpandId = variableId + '_text';
        const isExpanded = this.expandedItems.has(textExpandId);
        
        if (isExpanded) {
            // 收起文本
            this.expandedItems.delete(textExpandId);
            const truncatedValue = fullText.substring(0, this.maxDisplayLength) + '...';
            valueSpan.textContent = truncatedValue;
            valueSpan.style.maxHeight = '';
            valueSpan.style.overflow = '';
            valueSpan.style.cursor = '';
            valueSpan.classList.remove('variable-text-expanded');
        } else {
            // 展开文本
            this.expandedItems.add(textExpandId);
            valueSpan.textContent = fullText;
            valueSpan.style.maxHeight = '200px'; // 限制最大高度
            valueSpan.style.overflow = 'auto'; // 添加滚动条
            valueSpan.style.cursor = 'pointer';
            valueSpan.classList.add('variable-text-expanded');
            
            // 添加点击收起的提示
            valueSpan.title = '点击收起';
            valueSpan.addEventListener('click', () => {
                this.toggleTextExpansion(variableId, fullText, valueSpan);
            }, { once: true }); // 只执行一次，避免重复绑定
        }
    }

    /**
     * 折叠所有展开的项目
     */
    private static collapseAllVariables(): void {
        this.expandedItems.clear();
        const allItems = document.querySelectorAll('.variable-list-item');
        allItems.forEach(item => {
            const expandButton = item.querySelector('.variable-expand-button') as HTMLButtonElement;
            if (expandButton) {
                expandButton.textContent = '▶';
            }
            const childrenContainer = item.querySelector('.variable-children-container') as HTMLElement;
            if (childrenContainer) {
                childrenContainer.style.display = 'none';
                childrenContainer.innerHTML = '';
            }
        });
    }
}
