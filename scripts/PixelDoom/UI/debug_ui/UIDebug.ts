/**
 * Debug UI System
 * 提供游戏内调试面板功能
 * 
 * 使用示例：
 * 
 * // 基本用法
 * DEBUG.DebugMainUI.AddValue(someVariable);
 * 
 * // 实时变量监控（推荐用于会变化的变量）
 * let gameScore = 0;
 * DEBUG.DebugMainUI.AddValueByReference(() => gameScore, '游戏分数');
 * 
 * // 监控对象属性
 * const player = { x: 0, y: 0, health: 100 };
 * DEBUG.DebugMainUI.AddValueByReference(() => player, '玩家对象');
 * DEBUG.DebugMainUI.AddValueByReference(() => player.x, '玩家X坐标');
 * DEBUG.DebugMainUI.AddValueByReference(() => player.health, '玩家血量');
 * 
 * // 监控计算值
 * DEBUG.DebugMainUI.AddValueByReference(() => new Date().toLocaleTimeString(), '当前时间');
 * DEBUG.DebugMainUI.AddValueByReference(() => Math.floor(Math.random() * 100), '随机数');
 * 
 * // 自定义字体设置
 * // 设置自定义字体路径（默认为 'Font/Roboto-Medium.ttf'）
 * UIDebug.SetCustomFontPath('Font/MyCustomFont.ttf');
 * 
 * // 注意：确保字体文件路径相对于项目根目录是正确的
 * // 字体文件格式支持：.ttf, .otf, .woff, .woff2
 */

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
import { VariableMonitoring } from "./UIvariableMonitoring.js";
import { UIConsole } from "./UIConsole.js";

export var DEBUG = {
    DebugMainUI: null as DebugPanelInstance | null,
}


var isCreatDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (!isCreatDebugPanel) {

        DEBUG.DebugMainUI = UIDebug.InitDebugPanel('m')
        //DEBUG.DebugMainUI.DoNotUseButtonPanel();
        DEBUG.DebugMainUI.InitConsoleCapture()
        isCreatDebugPanel = true
        //    } else {
        // 场景切换时检查并重新应用样式
        UIDebug.checkAndReapplyStyles();
    }

})

interface DebugPanelInstance {
    DebuPanelAddButton(name: string, callback: () => void): DebugPanelInstance;
    DebuPanelAddFatherButton(name: string): FatherButtonInstance;
    InitConsoleCapture(): DebugPanelInstance;
    AddValue(variable: any): DebugPanelInstance;
    AddValueByReference(variableGetter: () => any, variableName: string): DebugPanelInstance;
    DoNotUseButtonPanel(): DebugPanelInstance;
}

interface FatherButtonInstance {
    AddChildButton(name: string, callback: () => void): FatherButtonInstance;
    AddChildFatherButton(name: string): FatherButtonInstance;
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
    private static consolePosition: 'top' | 'bottom' = 'top'; // 控制台位置
    private static consoleFontSize: number = 24; // 控制台字体大小
    private static consoleUseBackplate: boolean = true; // 是否使用底板样式
    private static consoleBackplateColor: string = '74, 74, 74'; // 底板颜色（RGB）
    private static consoleBackplateOpacity: number = 0     // 底板透明度
    private static mouseX: number = 0; // 记录鼠标X位置
    private static mouseY: number = 0; // 记录鼠标Y位置
    private static isButtonPanelEnabled: boolean = true; // 按钮面板启用状态

    // 新增：随机控制台字体颜色相关变量
    private static consoleRandomColor: boolean = true; // 随机控制台字体颜色开关
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

    // 新增：自定义字体相关变量
    private static customFontPath: string = 'Font/ProggyClean.ttf'; // 自定义字体路径
    private static fontFamilyName: string = 'DebugUIFont'; // 字体族名称
    private static isFontLoaded: boolean = false; // 字体是否已加载

    // 新增：子菜单系统相关变量
    private static menuItems: Map<string, MenuItemData> = new Map(); // 菜单项数据
    private static currentOpenSubmenus: Set<string> = new Set(); // 当前打开的子菜单
    private static menuScrollTop: number = 0; // 菜单滚动位置
    private static menuMaxVisibleItems: number = 10; // 菜单最大可见项数
    private static submenuContainers: Map<string, HTMLElement> = new Map(); // 子菜单DOM容器
    private static submenuTimeouts: Map<string, number> = new Map(); // 子菜单延迟隐藏定时器

    // 新增：控制台文本折叠相关变量
    private static consoleTextCollapseThreshold: number = 200; // 控制台文本折叠阈值

    /**
     * 初始化调试面板
     * @param toggleKey 用于显示/隐藏面板的按键
     * @returns 调试面板实例
     */
    public static InitDebugPanel(toggleKey: string = '`'): DebugPanelInstance {
        // 尝试从localStorage恢复字体设置（如果之前有保存的话）
        const savedFontPath = localStorage.getItem('debug-ui-font-path');
        if (savedFontPath) {
            this.customFontPath = savedFontPath;
        }

        if (this.menuPanel) {
            console.warn('Debug panel already initialized');
            return this.createDebugPanelInstance();
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
        document.addEventListener('keydown', this.handleKeyDown);

        // 点击空白处隐藏菜单
        document.addEventListener('click', (event) => {
            if (this.isMenuVisible && this.menuPanel && !this.menuPanel.contains(event.target as Node)) {
                // 检查是否点击在任何子菜单上
                let clickedInSubmenu = false;
                this.submenuContainers.forEach((submenu) => {
                    if (submenu.contains(event.target as Node)) {
                        clickedInSubmenu = true;
                    }
                });

                // 如果没有点击在子菜单上，则隐藏所有菜单
                if (!clickedInSubmenu) {
                    this.hideMenu();
                }
            }
        });

        return this.createDebugPanelInstance();
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
            return this.createDebugPanelInstance();
        }

        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'debug-menu-button';
        button.addEventListener('click', () => {
            callback();
            this.hideMenu(); // 点击按钮后隐藏菜单
        });

        this.buttonsContainer.appendChild(button);

        return this.createDebugPanelInstance();
    }

    /**
     * 初始化控制台捕获功能
     * @returns 调试面板实例
     */
    public static InitConsoleCapture(): DebugPanelInstance {
        if (this.isConsoleEnabled) {
            console.warn('Console capture already initialized');
            return this.createDebugPanelInstance();
        }

        this.isConsoleEnabled = true;

        // 替换原始console方法
        this.overrideConsoleMethods();


        var DebugFather = this.DebuPanelAddFatherButton("DEBUG")
        DebugFather.AddChildButton('clear console', () => {
            if (this.consoleContainer) {
                this.consoleContainer.innerHTML = '';
            }
            // 同时清除IMGUI控制台
            UIConsole.Clear();
        })

        // 添加变量监控窗口控制按钮
        DebugFather.AddChildButton('show monitoring', () => {
            this.toggleVariableMonitorWindow();
        })

        DebugFather.AddChildButton("打开控制台", () => {
            UIDebug.SetConsoleAlwaysShow(true)
        })

        DebugFather.AddChildButton("关闭控制台", () => {
            UIDebug.SetConsoleAlwaysShow(false)
        })



        return this.createDebugPanelInstance();
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
     * 设置控制台文本折叠阈值
     * @param threshold 文本长度阈值，超过此长度的文本将被折叠
     */
    public static SetConsoleTextCollapseThreshold(threshold: number): void {
        this.consoleTextCollapseThreshold = Math.max(50, threshold);
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
     * 设置自定义字体路径
     * @param fontPath 字体文件路径，相对于项目根目录
     * @example UIDebug.SetCustomFontPath('Font/MyFont.ttf');
     */
    public static SetCustomFontPath(fontPath: string): void {
        this.customFontPath = fontPath;
        this.isFontLoaded = false;

        // 保存字体路径到localStorage，以便场景切换后恢复
        try {
            localStorage.setItem('debug-ui-font-path', fontPath);
        } catch (e) {
            console.warn('Failed to save font path to localStorage:', e);
        }

        // 如果样式已经创建，重新创建以应用新字体
        const existingStyle = document.getElementById('debug-ui-styles');
        if (existingStyle) {
            existingStyle.remove();
            this.createStyles();
        }
    }

    /**
     * 检查并重新应用样式（用于场景切换时）
     */
    public static checkAndReapplyStyles(): void {
        const existingStyle = document.getElementById('debug-ui-styles');
        if (!existingStyle) {
            // 样式元素不存在，重新创建
            this.createStyles();

            // 同时重新应用控制台样式
            this.updateConsoleStyles();
        } else {
            // 样式元素存在，但可能被其他样式覆盖
            // 将其移动到head的最后，确保优先级最高
            existingStyle.remove();
            document.head.appendChild(existingStyle);
        }

        // 检查并恢复控制台元素
        if (this.isConsoleEnabled && !document.body.contains(this.consoleContainer)) {
            // 控制台元素不在DOM中，重新添加
            if (this.consoleContainer) {
                document.body.appendChild(this.consoleContainer);
            }
        }

        // 检查并恢复变量监控窗口
        if (this.isVariableWindowVisible && this.variableMonitorWindow && !document.body.contains(this.variableMonitorWindow)) {
            document.body.appendChild(this.variableMonitorWindow);
        }

        // 检查并恢复菜单面板
        if (this.menuPanel && !document.body.contains(this.menuPanel)) {
            document.body.appendChild(this.menuPanel);
        }

        // 恢复所有子菜单容器
        this.submenuContainers.forEach((submenu, id) => {
            if (!document.body.contains(submenu)) {
                document.body.appendChild(submenu);
            }
        });
    }

    /**
     * 强制刷新字体设置
     * 如果字体显示不正确，可以手动调用此方法
     */
    public static RefreshFont(): void {
        // 移除现有样式
        const existingStyle = document.getElementById('debug-ui-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // 重新创建样式
        this.createStyles();

        // 重新应用控制台样式
        this.updateConsoleStyles();

        console.log(`DEBUG UI字体已刷新: ${this.customFontPath}`);
    }

    /**
     * 添加要监控的变量
     */
    public static AddValue(variable: any): DebugPanelInstance;
    public static AddValue(variableGetter: () => any, variableName?: string): DebugPanelInstance;
    public static AddValue(variableOrGetter: any | (() => any), variableName?: string): DebugPanelInstance {
        if (!this.variableList) {
            console.error('Variable monitor window not initialized.');
            return this.createDebugPanelInstance();
        }

        // 生成唯一ID
        const variableId = 'var_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 判断是否为函数引用
        const isFunction = typeof variableOrGetter === 'function';
        let currentValue: any;
        let getter: (() => any) | null = null;

        if (isFunction) {
            // 函数引用方式
            getter = variableOrGetter as () => any;
            try {
                currentValue = getter();
            } catch (error) {
                currentValue = `[Error: ${error}]`;
            }
        } else {
            // 直接值方式
            currentValue = variableOrGetter;
        }

        // 获取变量信息
        const variableInfo = this.getVariableInfo(currentValue, variableName);

        // 存储变量引用
        this.monitoredVariables.set(variableId, {
            reference: isFunction ? null : variableOrGetter, // 直接值时存储引用
            getter: getter, // 函数引用时存储getter
            info: variableInfo,
            isFunction: isFunction,
            lastValue: this.deepClone(currentValue), // 存储上次的值用于比较
            lastFormattedValue: this.formatVariableValue(currentValue) // 存储上次格式化的值
        });

        // 创建变量显示元素
        this.createVariableListItem(variableId, variableInfo);

        // 启动监控更新
        this.startVariableMonitoring();

        return this.createDebugPanelInstance();
    }

    /**
     * 通过函数引用添加要监控的变量（推荐用于实时变化的变量）
     * @param variableGetter 获取变量值的函数
     * @param variableName 变量显示名称
     * @returns 调试面板实例
     */
    public static AddValueByReference(variableGetter: () => any, variableName: string): DebugPanelInstance {
        return this.AddValue(variableGetter, variableName);
    }

    /**
     * 获取变量信息
     */
    private static getVariableInfo(variable: any, variableName?: string): any {
        const stack = (new Error()).stack;
        const scriptName = this.extractScriptName(stack);

        return {
            name: variableName || this.getVariableName(variable),
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

        // 跳过UIDebug内部的调用，找到真正的外部调用者
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // 匹配脚本路径
            const match = line.match(/\/([^\/]+\.(?:js|ts))/);
            if (match) {
                const scriptName = match[1];

                // 跳过UIDebug.js相关的调用，找到外部调用者
                if (scriptName.toLowerCase() !== 'uidebug.js' &&
                    scriptName.toLowerCase() !== 'uidebug.ts') {
                    return scriptName;
                }
            }
        }

        // 如果没有找到外部脚本，尝试更宽松的匹配
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // 尝试匹配更多格式的路径
            const patterns = [
                /([^\/\\]+\.(?:js|ts)):\d+:\d+/,  // filename.js:line:col
                /at\s+[^(]*\(([^)]+\.(?:js|ts))/,  // at function (filename.js)
                /([^\/\\]+\.(?:js|ts))/            // 简单匹配
            ];

            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    const scriptName = match[1];
                    if (scriptName.toLowerCase() !== 'uidebug.js' &&
                        scriptName.toLowerCase() !== 'uidebug.ts') {
                        return scriptName;
                    }
                }
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

        // 应用同样的优化逻辑：可展开对象时不显示📄角标
        const shouldShowTextExpansion = needsTruncation && !canExpand;

        if (shouldShowTextExpansion) {
            const truncatedValue = formattedValue.substring(0, this.maxDisplayLength) + '...';
            valueSpan.textContent = truncatedValue;

            const expandIndicator = document.createElement('span');
            expandIndicator.className = 'variable-expand-indicator';
            expandIndicator.textContent = '📄';
            expandIndicator.title = '点击查看完整内容';

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
                // 对于对象类型，始终显示简短的表示，不显示完整内容
                if (Array.isArray(value)) {
                    return `Array(${value.length})`;
                } else {
                    const keys = Object.keys(value);
                    return `Object{${keys.length} keys}`;
                }
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
            if (!element) return;

            // 获取当前值
            let currentValue: any;
            if (data.isFunction && data.getter) {
                try {
                    currentValue = data.getter();
                } catch (error) {
                    currentValue = `[Error: ${error}]`;
                }
            } else {
                currentValue = data.reference;
            }

            // 检查值是否发生变化
            const hasChanged = !this.deepEqual(currentValue, data.lastValue);

            if (hasChanged) {
                // 更新存储的值
                data.lastValue = this.deepClone(currentValue);

                // 格式化新值
                const newFormattedValue = this.formatVariableValue(currentValue);
                data.lastFormattedValue = newFormattedValue;

                // 更新显示
                const valueContainer = element.querySelector('.variable-value-container');
                if (valueContainer) {
                    const needsTruncation = newFormattedValue.length > this.maxDisplayLength;

                    // 检查是否可以展开对象结构
                    const canExpand = this.canVariableExpand(currentValue);
                    const shouldShowTextExpansion = needsTruncation && !canExpand;

                    // 清空现有内容
                    valueContainer.innerHTML = '';

                    // 创建值显示元素
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'variable-value';

                    if (shouldShowTextExpansion) {
                        const truncatedValue = newFormattedValue.substring(0, this.maxDisplayLength) + '...';
                        valueSpan.textContent = truncatedValue;

                        // 创建角标
                        const expandIndicator = document.createElement('span');
                        expandIndicator.className = 'variable-expand-indicator';
                        expandIndicator.textContent = '📄';
                        expandIndicator.title = '点击查看完整内容';

                        expandIndicator.addEventListener('click', () => {
                            this.toggleTextExpansion(variableId, newFormattedValue, valueSpan);
                        });

                        valueContainer.appendChild(valueSpan);
                        valueContainer.appendChild(expandIndicator);
                    } else {
                        valueSpan.textContent = newFormattedValue;
                        valueContainer.appendChild(valueSpan);
                    }

                    // 添加更新动画效果
                    valueSpan.classList.add('variable-updated');
                    setTimeout(() => {
                        valueSpan.classList.remove('variable-updated');
                    }, 300);

                    // 更新展开按钮状态（如果对象结构发生变化）
                    const expandButton = element.querySelector('.variable-expand-button') as HTMLButtonElement;
                    if (expandButton) {
                        const canExpandNow = this.canVariableExpand(currentValue);
                        if (canExpandNow) {
                            const isExpanded = this.expandedItems.has(variableId);
                            expandButton.textContent = isExpanded ? '▼' : '▶';
                            expandButton.style.visibility = 'visible';

                            // 如果当前是展开状态，需要重新展开以显示新的内容
                            if (isExpanded) {
                                this.expandVariable(variableId, currentValue, 0, '');
                            }
                        } else {
                            expandButton.textContent = '';
                            expandButton.style.visibility = 'hidden';
                        }
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

        // 获取调用来源信息
        const stack = (new Error()).stack;
        const scriptName = this.extractScriptName(stack);

        // 创建消息包装容器
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'console-message-wrapper';

        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `console-message console-${type}`;

        // 创建来源信息元素
        const sourceElement = document.createElement('span');
        sourceElement.className = 'console-source';
        sourceElement.textContent = `[${scriptName}]`;

        // 添加时间戳
        const timestamp = document.createElement('span');
        timestamp.className = 'console-timestamp';
        const now = new Date();
        timestamp.textContent = `[${now.toLocaleTimeString()}] `;

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

        // 创建消息内容元素
        const contentElement = document.createElement('span');
        contentElement.className = 'console-content';

        // 检查是否需要折叠
        if (messageContent.length > this.consoleTextCollapseThreshold) {
            contentElement.textContent = messageContent.substring(0, this.consoleTextCollapseThreshold) + '...';
        } else {
            contentElement.textContent = messageContent;
        }

        // 按顺序添加元素：来源 -> 时间戳 -> 内容
        messageElement.appendChild(sourceElement);
        messageElement.appendChild(timestamp);
        messageElement.appendChild(contentElement);

        // 应用随机颜色（如果启用）
        if (this.consoleRandomColor) {
            const color = this.getCurrentConsoleColor();
            contentElement.style.color = color;
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
     * 切换控制台消息的展开/折叠状态
     */
    /*
    private static toggleConsoleMessage(messageId: string, collapsedContent: HTMLElement, expandedContent: HTMLElement, toggleButton: HTMLElement): void {
        const isExpanded = this.consoleExpandedMessages.has(messageId);

        if (isExpanded) {
            // 折叠
            collapsedContent.style.display = 'inline';
            expandedContent.style.display = 'none';
            toggleButton.textContent = '📄';
            toggleButton.title = 'Click to expand';
            this.consoleExpandedMessages.delete(messageId);
        } else {
            // 展开
            collapsedContent.style.display = 'none';
            expandedContent.style.display = 'block';
            toggleButton.textContent = '📋';
            toggleButton.title = 'Click to collapse';
            this.consoleExpandedMessages.add(messageId);
        }
    }
    */

    /**
     * 切换菜单的显示状态
     */
    private static toggleMenu(): void {
        if (!this.menuPanel || !this.isButtonPanelEnabled) return;

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

        // 隐藏所有子菜单并重置箭头状态
        this.hideAllSubmenus();
        this.resetAllArrows();
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
        styleElement.id = 'debug-ui-styles'; // 添加ID以便后续查找和替换
        styleElement.textContent = `
            /* 自定义字体声明 */
            @font-face {
                font-family: '${this.fontFamilyName}';
                src: url('${this.customFontPath}') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap; /* 提高字体加载性能 */
            }
            
            /* 强制所有DEBUG UI元素使用自定义字体 */
            .debug-console,
            .debug-console *,
            .debug-menu,
            .debug-menu *,
            .variable-monitor-window,
            .variable-monitor-window *,
            .debug-submenu,
            .debug-submenu * {
                font-family: '${this.fontFamilyName}', monospace !important;
            }
            
            /* 控制台样式 */
            .debug-console {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 30%;
                max-height: 50vh;
                overflow-y: auto;
                color: #ffffff;
                font-family: '${this.fontFamilyName}', monospace !important;
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
                font-family: '${this.fontFamilyName}', monospace !important;
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
                scrollbar-width: thin; /* Firefox - 显示细滚动条 */
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(60, 60, 60, 0.8); /* Firefox滚动条颜色 */
            }
            
            /* Webkit浏览器（Chrome, Safari）主菜单滚动条样式 */
            .debug-menu-buttons::-webkit-scrollbar {
                width: 8px;
                display: block !important; /* 强制显示滚动条 */
            }
            
            .debug-menu-buttons::-webkit-scrollbar-track {
                background: rgba(60, 60, 60, 0.8);
                border-radius: 4px;
            }
            
            .debug-menu-buttons::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                border: 1px solid rgba(45, 45, 45, 0.5);
            }
            
            .debug-menu-buttons::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .debug-menu-button {
                background: none;
                border: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                color: #eee;
                cursor: pointer;
                font-family: '${this.fontFamilyName}', monospace !important;
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
                font-family: '${this.fontFamilyName}', monospace !important;
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
            
            /* 控制台来源信息样式 */
            .console-source {
                color:hsl(0, 84.30%, 50.00%) !important; /* 红色字体 */
                background-color: rgba(217, 235, 23, 0.78); /* 红色底板 */
                border: 1px solid rgba(3, 26, 80, 0.3);
                border-radius: 3px;
                padding: 1px 6px;
                font-size: 0.8em;
                font-weight: bold;
                margin-right: 6px;
                display: inline-block;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(2px);
            }
            
            /* 控制台内容样式 */
            .console-content {
                flex: 1;
            }
            
            /* 控制台内容容器样式 */
            .console-content-container {
                display: flex;
                align-items: flex-start;
                gap: 6px;
                flex: 1;
            }
            
            /* 折叠状态的控制台内容 */
            .console-content-collapsed {
                flex: 1;
                word-break: break-word;
            }
            
            /* 展开状态的控制台内容 */
            .console-content-expanded {
                flex: 1;
                max-height: 200px;
                overflow-y: auto;
                background-color: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 8px;
                margin: 4px 0;
                white-space: pre-wrap;
                font-family: '${this.fontFamilyName}', monospace !important;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
            }
            
            /* 展开内容的滚动条样式 */
            .console-content-expanded::-webkit-scrollbar {
                width: 6px;
            }
            
            .console-content-expanded::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .console-content-expanded::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }
            
            .console-content-expanded::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            /* 控制台切换按钮样式 */
            .console-toggle-button {
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
                pointer-events: auto;
            }
            
            .console-toggle-button:hover {
                background-color: rgba(253, 121, 168, 0.3);
                transform: scale(1.1);
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
                font-family: '${this.fontFamilyName}', monospace !important;
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
                font-family: '${this.fontFamilyName}', monospace !important;
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
                overflow-y: auto !important;
                padding: 10px;
                font-size: 11px;
                scrollbar-width: thin; /* Firefox - 显示细滚动条 */
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1); /* Firefox滚动条颜色 */
                max-height: 100%; /* 确保有明确的高度限制 */
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
                font-family: '${this.fontFamilyName}', monospace !important;
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
            
            /* 子菜单系统样式 */
            .debug-menu-folder {
                position: relative;
            }
            
            .debug-menu-folder.active {
                background-color: rgba(80, 120, 200, 0.3) !important;
                color: #fff !important;
            }
            
            .debug-menu-arrow {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 8px;
                color: rgba(255, 255, 255, 0.6);
                transition: transform 0.2s;
                pointer-events: none;
            }
            
            .debug-menu-folder:hover .debug-menu-arrow {
                color: #fff;
                transform: translateY(-50%) scale(1.2);
            }
            
            .debug-menu-folder.active .debug-menu-arrow {
                color: #fff;
                transform: translateY(-50%) rotate(90deg);
            }
            
            .debug-submenu {
                position: fixed;
                min-width: 150px;
                border-radius: 6px;
                color: #ffffff;
                font-family: '${this.fontFamilyName}', monospace !important;
                z-index: 10001;
                overflow: hidden;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
                background-color: rgba(45, 45, 45, 0.95);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: none;
            }
            
            .debug-submenu-buttons {
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                max-height: 400px;
                scrollbar-width: thin; /* Firefox - 显示细滚动条 */
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(60, 60, 60, 0.8); /* Firefox滚动条颜色 */
            }
            
            /* Webkit浏览器（Chrome, Safari）子菜单滚动条样式 */
            .debug-submenu-buttons::-webkit-scrollbar {
                width: 8px;
                display: block !important; /* 强制显示滚动条 */
            }
            
            .debug-submenu-buttons::-webkit-scrollbar-track {
                background: rgba(60, 60, 60, 0.8);
                border-radius: 4px;
            }
            
            .debug-submenu-buttons::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                border: 1px solid rgba(45, 45, 45, 0.5);
            }
            
            .debug-submenu-buttons::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .debug-menu-scroll-arrow {
                background: rgba(80, 120, 200, 0.8);
                border: none;
                color: #fff;
                cursor: pointer;
                font-family: '${this.fontFamilyName}', monospace !important;
                padding: 5px 15px;
                text-align: center;
                font-size: 10px;
                transition: background-color 0.2s;
            }
            
            .debug-menu-scroll-arrow:hover {
                background: rgba(80, 120, 200, 1);
            }
            
            .debug-menu-scroll-up::before {
                content: "▲ 向上";
            }
            
            .debug-menu-scroll-down::before {
                content: "▼ 向下";
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

        // 应用同样的优化逻辑：可展开对象时不显示📄角标
        const shouldShowTextExpansion = needsTruncation && !canExpand;

        if (shouldShowTextExpansion) {
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

    /**
     * 添加父级按钮到面板（支持子菜单）
     * @param name 按钮名称
     * @returns 父按钮实例
     */
    public static DebuPanelAddFatherButton(name: string): FatherButtonInstance {
        if (!this.buttonsContainer) {
            console.error('Debug panel not initialized. Call InitDebugPanel first.');
            return this.createEmptyFatherButtonInstance();
        }

        const itemId = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 创建菜单项数据
        const menuItemData: MenuItemData = {
            id: itemId,
            name: name,
            type: 'folder',
            children: new Map()
        };

        this.menuItems.set(itemId, menuItemData);

        // 创建菜单项DOM元素
        this.createMenuItemElement(menuItemData);

        return this.createFatherButtonInstance(itemId);
    }

    /**
     * 创建父按钮实例
     */
    private static createFatherButtonInstance(itemId: string): FatherButtonInstance {
        return {
            AddChildButton: (name: string, callback: () => void) => {
                return this.addChildButton(itemId, name, callback);
            },
            AddChildFatherButton: (name: string) => {
                return this.addChildFatherButton(itemId, name);
            }
        };
    }

    /**
     * 创建空的父按钮实例（用于错误情况）
     */
    private static createEmptyFatherButtonInstance(): FatherButtonInstance {
        return {
            AddChildButton: (name: string, callback: () => void) => {
                console.error('Cannot add child button: parent not initialized');
                return this.createEmptyFatherButtonInstance();
            },
            AddChildFatherButton: (name: string) => {
                console.error('Cannot add child folder: parent not initialized');
                return this.createEmptyFatherButtonInstance();
            }
        };
    }

    /**
     * 添加子按钮
     */
    private static addChildButton(parentId: string, name: string, callback: () => void): FatherButtonInstance {
        const parentItem = this.menuItems.get(parentId);
        if (!parentItem || !parentItem.children) {
            console.error('Parent menu item not found');
            return this.createEmptyFatherButtonInstance();
        }

        const childId = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const childItemData: MenuItemData = {
            id: childId,
            name: name,
            type: 'button',
            callback: callback,
            parent: parentId
        };

        parentItem.children.set(childId, childItemData);
        this.menuItems.set(childId, childItemData);

        return this.createFatherButtonInstance(parentId);
    }

    /**
     * 添加子文件夹
     */
    private static addChildFatherButton(parentId: string, name: string): FatherButtonInstance {
        const parentItem = this.menuItems.get(parentId);
        if (!parentItem || !parentItem.children) {
            console.error('Parent menu item not found');
            return this.createEmptyFatherButtonInstance();
        }

        const childId = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const childItemData: MenuItemData = {
            id: childId,
            name: name,
            type: 'folder',
            children: new Map(),
            parent: parentId
        };

        parentItem.children.set(childId, childItemData);
        this.menuItems.set(childId, childItemData);

        return this.createFatherButtonInstance(childId);
    }

    /**
     * 创建菜单项DOM元素
     */
    private static createMenuItemElement(itemData: MenuItemData): void {
        const button = document.createElement('button');
        button.textContent = itemData.name;
        button.className = itemData.type === 'folder' ? 'debug-menu-button debug-menu-folder' : 'debug-menu-button';
        button.id = itemData.id;

        if (itemData.type === 'folder') {
            // 文件夹类型，添加箭头指示器
            const arrow = document.createElement('span');
            arrow.className = 'debug-menu-arrow';
            arrow.textContent = '▶';
            button.appendChild(arrow);

            // 使用鼠标悬停展开子菜单（类似Windows右键菜单）
            button.addEventListener('mouseenter', () => {
                // 先关闭同级的其他子菜单
                this.closeSiblingSubmenus(itemData.id);
                // 显示当前子菜单
                this.showSubmenu(itemData.id);
                button.classList.add('active');
                arrow.textContent = '▼';
            });

            // 鼠标离开时设置延迟隐藏
            button.addEventListener('mouseleave', () => {
                this.hideSubmenuDelayed(itemData.id);
            });
        } else {
            // 按钮类型，添加点击事件
            button.addEventListener('click', () => {
                if (itemData.callback) {
                    itemData.callback();
                }
                this.hideMenu();
            });
        }

        this.buttonsContainer!.appendChild(button);
    }

    /**
     * 切换子菜单显示状态
     */
    private static toggleSubmenu(itemId: string): void {
        const isCurrentlyOpen = this.currentOpenSubmenus.has(itemId);
        const submenuContainer = this.submenuContainers.get(itemId);
        const button = document.getElementById(itemId);
        const arrow = button?.querySelector('.debug-menu-arrow');

        if (isCurrentlyOpen && submenuContainer) {
            // 隐藏子菜单
            submenuContainer.style.display = 'none';
            this.currentOpenSubmenus.delete(itemId);

            // 更新按钮状态
            if (button) button.classList.remove('active');
            if (arrow) arrow.textContent = '▶';

            // 递归隐藏所有子级菜单
            this.hideChildSubmenus(itemId);
        } else {
            // 显示子菜单
            this.showSubmenu(itemId);

            // 更新按钮状态
            if (button) button.classList.add('active');
            if (arrow) arrow.textContent = '▼';
        }
    }

    /**
     * 显示子菜单
     */
    private static showSubmenu(itemId: string): void {
        const menuItem = this.menuItems.get(itemId);
        if (!menuItem || !menuItem.children || menuItem.children.size === 0) return;

        // 清除隐藏定时器
        const timeout = this.submenuTimeouts.get(itemId);
        if (timeout) {
            clearTimeout(timeout);
            this.submenuTimeouts.delete(itemId);
        }

        // 获取或创建子菜单容器
        let submenuContainer = this.submenuContainers.get(itemId);
        if (!submenuContainer) {
            // 创建新的子菜单容器
            submenuContainer = this.createSubmenuContainer(itemId, menuItem);
            this.submenuContainers.set(itemId, submenuContainer);
            // 添加到文档
            document.body.appendChild(submenuContainer);
        }

        // 每次显示时都重新定位（确保位置正确）
        this.positionSubmenu(itemId, submenuContainer);

        // 显示子菜单
        submenuContainer.style.display = 'block';
        this.currentOpenSubmenus.add(itemId);
    }

    /**
     * 创建子菜单容器
     */
    private static createSubmenuContainer(parentId: string, parentItem: MenuItemData): HTMLElement {
        const submenu = document.createElement('div');
        submenu.className = 'debug-submenu';
        submenu.id = 'submenu_' + parentId;

        // 鼠标进入子菜单时，取消隐藏定时器
        submenu.addEventListener('mouseenter', () => {
            const timeout = this.submenuTimeouts.get(parentId);
            if (timeout) {
                clearTimeout(timeout);
                this.submenuTimeouts.delete(parentId);
            }
        });

        // 鼠标离开子菜单时，设置延迟隐藏
        submenu.addEventListener('mouseleave', () => {
            this.hideSubmenuDelayed(parentId);
        });

        // 创建按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'debug-submenu-buttons';

        // 添加子菜单项
        if (parentItem.children) {
            parentItem.children.forEach((childItem) => {
                const button = document.createElement('button');
                button.textContent = childItem.name;
                button.className = childItem.type === 'folder' ? 'debug-menu-button debug-menu-folder' : 'debug-menu-button';
                button.id = childItem.id;

                if (childItem.type === 'folder') {
                    // 文件夹类型，添加箭头指示器
                    const arrow = document.createElement('span');
                    arrow.className = 'debug-menu-arrow';
                    arrow.textContent = '▶';
                    button.appendChild(arrow);

                    // 使用鼠标悬停展开子菜单
                    button.addEventListener('mouseenter', () => {
                        // 先关闭同级的其他子菜单
                        this.closeSiblingSubmenus(childItem.id);
                        // 显示当前子菜单
                        this.showSubmenu(childItem.id);
                        button.classList.add('active');
                        arrow.textContent = '▼';
                    });

                    // 鼠标离开时设置延迟隐藏
                    button.addEventListener('mouseleave', () => {
                        this.hideSubmenuDelayed(childItem.id);
                    });
                } else {
                    // 按钮类型，添加点击事件
                    button.addEventListener('click', () => {
                        if (childItem.callback) {
                            childItem.callback();
                        }
                        this.hideAllSubmenus();
                        this.hideMenu();
                    });
                }

                buttonsContainer.appendChild(button);
            });
        }

        submenu.appendChild(buttonsContainer);

        // 阻止子菜单内部点击冒泡到document
        submenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return submenu;
    }

    /**
     * 定位子菜单
     */
    private static positionSubmenu(parentId: string, submenuContainer: HTMLElement): void {
        const parentButton = document.getElementById(parentId);
        if (!parentButton) return;

        const parentRect = parentButton.getBoundingClientRect();
        const submenuWidth = 150; // 子菜单宽度
        const submenuHeight = submenuContainer.offsetHeight || 200; // 预估高度

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 判断父按钮是在主菜单还是在子菜单中
        const isInMainMenu = parentButton.closest('.debug-menu') !== null;
        const isInSubmenu = parentButton.closest('.debug-submenu') !== null;

        let left: number;
        let top: number;

        if (isInMainMenu) {
            // 主菜单的子菜单：显示在右侧
            left = parentRect.right + 5;
            top = parentRect.top;

            // 检查是否超出右边界
            if (left + submenuWidth > viewportWidth) {
                left = parentRect.left - submenuWidth - 5; // 显示在左侧
            }
        } else if (isInSubmenu) {
            // 子菜单的子菜单：尝试多个位置避免重合
            const positions = [
                // 右侧
                { left: parentRect.right + 5, top: parentRect.top },
                // 左侧
                { left: parentRect.left - submenuWidth - 5, top: parentRect.top },
                // 右侧偏下
                { left: parentRect.right + 5, top: parentRect.bottom - 10 },
                // 左侧偏下
                { left: parentRect.left - submenuWidth - 5, top: parentRect.bottom - 10 },
                // 右侧偏上
                { left: parentRect.right + 5, top: parentRect.top - 30 },
                // 左侧偏上
                { left: parentRect.left - submenuWidth - 5, top: parentRect.top - 30 }
            ];

            // 选择最佳位置（不超出边界且不与现有子菜单重合）
            let bestPosition = positions[0];
            for (const pos of positions) {
                if (pos.left >= 10 &&
                    pos.left + submenuWidth <= viewportWidth - 10 &&
                    pos.top >= 10 &&
                    pos.top + submenuHeight <= viewportHeight - 10) {

                    // 检查是否与现有子菜单重合
                    if (!this.checkSubmenuOverlap(pos.left, pos.top, submenuWidth, submenuHeight)) {
                        bestPosition = pos;
                        break;
                    }
                }
            }

            left = bestPosition.left;
            top = bestPosition.top;
        } else {
            // 默认位置
            left = parentRect.right + 5;
            top = parentRect.top;
        }

        // 最后的边界检查和调整
        if (left < 10) left = 10;
        if (left + submenuWidth > viewportWidth - 10) {
            left = viewportWidth - submenuWidth - 10;
        }

        if (top < 10) top = 10;
        if (top + submenuHeight > viewportHeight - 10) {
            top = viewportHeight - submenuHeight - 10;
        }

        submenuContainer.style.left = left + 'px';
        submenuContainer.style.top = top + 'px';
    }

    /**
     * 检查子菜单是否与现有子菜单重合
     */
    private static checkSubmenuOverlap(left: number, top: number, width: number, height: number): boolean {
        for (const [_, submenu] of this.submenuContainers) {
            if (submenu.style.display === 'none') continue;

            const submenuRect = submenu.getBoundingClientRect();
            const submenuLeft = submenuRect.left;
            const submenuTop = submenuRect.top;
            const submenuRight = submenuLeft + submenuRect.width;
            const submenuBottom = submenuTop + submenuRect.height;

            const newRight = left + width;
            const newBottom = top + height;

            // 检查是否重合（带一些边距）
            const margin = 20;
            if (!(newRight + margin < submenuLeft ||
                left - margin > submenuRight ||
                newBottom + margin < submenuTop ||
                top - margin > submenuBottom)) {
                return true; // 有重合
            }
        }
        return false; // 无重合
    }

    /**
     * 延迟隐藏子菜单
     */
    private static hideSubmenuDelayed(itemId: string): void {
        // 清除之前的定时器
        const existingTimeout = this.submenuTimeouts.get(itemId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // 设置新的延迟隐藏定时器
        const timeout = setTimeout(() => {
            const submenuContainer = this.submenuContainers.get(itemId);
            const button = document.getElementById(itemId);

            if (submenuContainer) {
                submenuContainer.style.display = 'none';
            }

            this.currentOpenSubmenus.delete(itemId);
            this.submenuTimeouts.delete(itemId);

            // 重置按钮状态
            if (button) {
                button.classList.remove('active');
                const arrow = button.querySelector('.debug-menu-arrow');
                if (arrow) arrow.textContent = '▶';
            }

            // 同时隐藏所有子级菜单
            this.hideChildSubmenus(itemId);
        }, 200); // 200ms延迟，更快的响应

        this.submenuTimeouts.set(itemId, timeout);
    }

    /**
     * 隐藏指定项目的所有子级子菜单
     */
    private static hideChildSubmenus(parentId: string): void {
        const parentItem = this.menuItems.get(parentId);
        if (!parentItem || !parentItem.children) return;

        parentItem.children.forEach((childItem) => {
            const childSubmenu = this.submenuContainers.get(childItem.id);
            if (childSubmenu) {
                childSubmenu.style.display = 'none';
                this.currentOpenSubmenus.delete(childItem.id);

                // 清除定时器
                const timeout = this.submenuTimeouts.get(childItem.id);
                if (timeout) {
                    clearTimeout(timeout);
                    this.submenuTimeouts.delete(childItem.id);
                }

                // 递归隐藏更深层的子菜单
                this.hideChildSubmenus(childItem.id);
            }
        });
    }

    /**
     * 隐藏所有子菜单
     */
    private static hideAllSubmenus(): void {
        this.submenuContainers.forEach((submenu) => {
            submenu.style.display = 'none';
        });
        this.currentOpenSubmenus.clear();
    }

    /**
     * 重置所有箭头方向
     */
    private static resetAllArrows(): void {
        const allArrows = document.querySelectorAll('.debug-menu-arrow');
        allArrows.forEach(arrow => {
            arrow.textContent = '▶';
        });

        // 重置所有文件夹按钮的active状态
        const allFolderButtons = document.querySelectorAll('.debug-menu-folder');
        allFolderButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    /**
     * 深度克隆对象
     */
    private static deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }

        if (typeof obj === 'object') {
            const cloned: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }

        return obj;
    }

    /**
     * 深度比较两个值是否相等
     */
    private static deepEqual(a: any, b: any): boolean {
        if (a === b) return true;

        if (a === null || b === null) return a === b;
        if (typeof a !== typeof b) return false;

        if (typeof a !== 'object') return a === b;

        if (Array.isArray(a) !== Array.isArray(b)) return false;

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!this.deepEqual(a[key], b[key])) return false;
        }

        return true;
    }

    /**
     * 关闭同级的其他子菜单
     */
    private static closeSiblingSubmenus(currentItemId: string): void {
        const currentItem = this.menuItems.get(currentItemId);
        if (!currentItem) return;

        const parentId = currentItem.parent;

        // 获取父菜单的所有子项
        let siblings: Map<string, MenuItemData> | undefined;

        if (!parentId) {
            // 主菜单级别
            siblings = new Map();
            this.menuItems.forEach((item, id) => {
                if (!item.parent && item.type === 'folder' && id !== currentItemId) {
                    siblings!.set(id, item);
                }
            });
        } else {
            // 子菜单级别
            const parentItem = this.menuItems.get(parentId);
            if (parentItem && parentItem.children) {
                siblings = new Map();
                parentItem.children.forEach((item, id) => {
                    if (item.type === 'folder' && id !== currentItemId) {
                        siblings!.set(id, item);
                    }
                });
            }
        }

        // 关闭所有同级子菜单
        if (siblings) {
            siblings.forEach((_, siblingId) => {
                const submenuContainer = this.submenuContainers.get(siblingId);
                const button = document.getElementById(siblingId);

                if (submenuContainer && submenuContainer.style.display !== 'none') {
                    submenuContainer.style.display = 'none';
                    this.currentOpenSubmenus.delete(siblingId);

                    // 重置按钮状态
                    if (button) {
                        button.classList.remove('active');
                        const arrow = button.querySelector('.debug-menu-arrow');
                        if (arrow) arrow.textContent = '▶';
                    }

                    // 递归隐藏其子菜单
                    this.hideChildSubmenus(siblingId);
                }

                // 清除隐藏定时器
                const timeout = this.submenuTimeouts.get(siblingId);
                if (timeout) {
                    clearTimeout(timeout);
                    this.submenuTimeouts.delete(siblingId);
                }
            });
        }
    }

    // 在 UIDebug 类中添加这个私有方法
    private static createDebugPanelInstance(): DebugPanelInstance {
        return {
            DebuPanelAddButton: (name: string, callback: () => void) => {
                return UIDebug.DebuPanelAddButton(name, callback);
            },
            DebuPanelAddFatherButton: (name: string) => {
                return UIDebug.DebuPanelAddFatherButton(name);
            },
            InitConsoleCapture: () => {
                return UIDebug.InitConsoleCapture();
            },
            AddValue: (variable: any) => {
                return UIDebug.AddValue(variable);
            },
            AddValueByReference: (variableGetter: () => any, variableName: string) => {
                return UIDebug.AddValueByReference(variableGetter, variableName);
            },
            DoNotUseButtonPanel: () => {
                return UIDebug.DoNotUseButtonPanel();
            }
        };
    }

    /**
     * 禁用按钮面板功能
     * @returns 调试面板实例
     */
    public static DoNotUseButtonPanel(): DebugPanelInstance {
        this.isButtonPanelEnabled = false;

        // 隐藏菜单面板
        if (this.menuPanel) {
            this.hideMenu();
            // 移除键盘事件监听
            document.removeEventListener('keydown', this.handleKeyDown);
            // 重新添加一个只处理其他功能的键盘监听
            document.addEventListener('keydown', this.handleKeyDownWithoutMenu);
        }

        console.log("Debug button panel has been disabled");
        return this.createDebugPanelInstance();
    }

    /**
     * 处理键盘事件的函数（含菜单功能）
     */
    private static handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key.toLocaleLowerCase() === this.toggleKey.toLocaleLowerCase()) {
            this.toggleMenu();
        }
        // Escape键快速收起所有展开的变量
        if (event.key === 'Escape' && this.isVariableWindowVisible) {
            this.collapseAllVariables();
            event.preventDefault();
        }
    }

    /**
     * 处理键盘事件的函数（不含菜单功能）
     */
    private static handleKeyDownWithoutMenu = (event: KeyboardEvent): void => {
        // 只处理Escape键收起变量
        if (event.key === 'Escape' && this.isVariableWindowVisible) {
            this.collapseAllVariables();
            event.preventDefault();
        }
    }
}

// 菜单项数据结构
interface MenuItemData {
    id: string;
    name: string;
    type: 'button' | 'folder';
    callback?: () => void;
    children?: Map<string, MenuItemData>;
    parent?: string;
}

