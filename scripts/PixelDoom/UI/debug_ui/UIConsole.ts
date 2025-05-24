import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";

/**
 * IMGUI Console System
 * Provides in-game console functionality based on IMGUI
 */
export class UIConsole {
    private static windowId: string = "imgui_console_window";
    private static isInitialized: boolean = false;
    private static isVisible: boolean = false;
    private static consoleMessages: any[] = [];
    private static originalConsole: any = {};
    private static maxMessages: number = 1000;

    // Console appearance settings
    private static showTimestamps: boolean = true;
    private static showSourceInfo: boolean = true;
    private static useRandomColors: boolean = true;

    // Toggle key for console
    public static toggleKey: string = "`";

    /**
     * Initialize the console system
     */
    public static Initialize(): void {
        if (this.isInitialized) {
            console.warn("IMGUI Console already initialized");
            return;
        }

        console.log("Starting to initialize IMGUI console...");

        // Preload font first - this needs to be done before creating the console window
        this.preloadFont();

        // Wait for font to load
        setTimeout(() => {
            // Add direct font style application
            this.injectFontStyle();

            // Create console window
            this.createConsoleWindow();

            // Resize window (to ensure better layout)
            setTimeout(() => {
                this.resizeConsoleWindow();
            }, 100);

            // Override console methods to capture output
            this.overrideConsoleMethods();

            // Remove previous keyboard event listeners (avoid duplicates)
            try {
                const oldListener = (this as any)._keydownListener;
                if (oldListener) {
                    document.removeEventListener('keydown', oldListener, true);
                    console.log("Removed old keyboard event listener");
                }
            } catch (e) {
                console.warn("Error trying to remove old listener", e);
            }

            // Define keyboard event handler - ensure it runs in capture phase
            const keydownHandler = (event: KeyboardEvent) => {

                // Add hardcoded handling for 'n'
                if (event.key === 'n' || event.key === 'N' || event.key === this.toggleKey) {
                    console.log("Console toggle triggered");
                    this.Toggle();
                    event.preventDefault();
                    event.stopPropagation();
                }
            };

            // Save reference for later removal
            (this as any)._keydownListener = keydownHandler;

            // Add keyboard event listener - use capture phase to ensure priority
            document.addEventListener('keydown', keydownHandler, true);
            console.log(`Keyboard event listener added, current hotkey: ${this.toggleKey}`);

            // Remove global keyboard test to avoid duplicates
            this.setupGlobalKeyTest();

            this.isInitialized = true;
            console.log("IMGUI Console initialized");

            // Add welcome message
            this.consoleMessages.push({
                type: 'info',
                content: `Welcome to IMGUI Console! Press '${this.toggleKey}' key to toggle visibility.`,
                timestamp: new Date().toLocaleTimeString(),
                source: 'System'
            });

            // Add Chinese test message
            console.log("Chinese display test - This text should display correctly");
        }, 200);
    }

    /**
     * Create the console window using IMGUI
     */
    private static createConsoleWindow(): void {
        // Create the console window
        Imgui_chunchun.CreateTextWindow(
            this.windowId,
            "console_window",
            "",
            { x: 50, y: 50 }
        );

        // Configure the window
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                windowConfig.size = { width: 800, height: 500 };
                windowConfig.isOpen = false; // Default to closed
                windowConfig.renderCallback = () => {
                    this.renderConsoleWindow();
                };

                // 添加滚动条鼠标事件处理，确保当鼠标在滚动条上时工作正常
                this.setupScrollHandling();
            }
        }
    }

    /**
     * 设置滚动处理
     */
    private static setupScrollHandling(): void {
        const ImGui = globalThis.ImGui;
        if (!ImGui) return;

        // Record scroll state
        this.isScrolling = false;
        this.lastScrollY = 0;
        this.scrollChangeTimeout = null;

        // Mouse down listener
        const mouseDownHandler = (e: MouseEvent) => {
            if (!this.isVisible) return;

            // Check if ImGui captured the mouse
            try {
                const io = ImGui.GetIO();
                if (io.WantCaptureMouse) {
                    // Record press position for later drag detection
                    this.mouseDownPos = { x: e.clientX, y: e.clientY };
                    this.checkIfDraggingScrollbar(e);
                }
            } catch (err) {
                console.warn("Scrollbar mouse down detection failed:", err);
            }
        };

        // Mouse move listener - for drag detection
        const mouseMoveHandler = (e: MouseEvent) => {
            if (!this.isVisible || !this.mouseDownPos) return;

            try {
                // If mouse moved beyond threshold and not already scrolling
                const deltaY = Math.abs(e.clientY - this.mouseDownPos.y);
                if (deltaY > 5 && !this.isScrolling) {
                    this.checkIfDraggingScrollbar(e);
                }
            } catch (err) {
                console.warn("Scrollbar mouse move detection failed:", err);
            }
        };

        // Mouse up listener - stop dragging state
        const mouseUpHandler = () => {
            if (this.isScrolling) {
                console.log("Stopped scrollbar dragging");

                // Delay check if at bottom
                clearTimeout(this.scrollChangeTimeout as any);
                this.scrollChangeTimeout = setTimeout(() => {
                    this.checkIfAtBottom();
                }, 200);
            }

            this.isScrolling = false;
            this.mouseDownPos = null;
        };

        // Wheel listener
        const wheelHandler = (e: WheelEvent) => {
            if (!this.isVisible) return;

            try {
                const io = ImGui.GetIO();
                if (io.WantCaptureMouse) {
                    // Disable auto-scroll when scrolling up
                    if (e.deltaY < 0) {
                        this.shouldAutoScroll = false;
                    } else if (e.deltaY > 0) {
                        // When scrolling down, check if near bottom
                        clearTimeout(this.scrollChangeTimeout as any);
                        this.scrollChangeTimeout = setTimeout(() => {
                            this.checkIfAtBottom();
                        }, 100);
                    }
                }
            } catch (err) {
                console.warn("Wheel event handling failed:", err);
            }
        };

        // Add event listeners
        window.addEventListener('mousedown', mouseDownHandler, { passive: true });
        window.addEventListener('mousemove', mouseMoveHandler, { passive: true });
        window.addEventListener('mouseup', mouseUpHandler, { passive: true });
        window.addEventListener('wheel', wheelHandler, { passive: true });

        // Save references for later removal
        (this as any)._mouseDownHandler = mouseDownHandler;
        (this as any)._mouseMoveHandler = mouseMoveHandler;
        (this as any)._mouseUpHandler = mouseUpHandler;
        (this as any)._wheelHandler = wheelHandler;

        console.log("Scrollbar event handlers configured");
    }

    /**
     * 检查是否在拖动滚动条
     */
    private static checkIfDraggingScrollbar(e: MouseEvent): void {
        try {
            const ImGui = globalThis.ImGui;
            if (!ImGui) return;

            const io = ImGui.GetIO();
            if (!io.WantCaptureMouse) return;

            // Check if mouse is in scrollbar area (near window edge)
            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const consoleRect = {
                right: rect.right - 20,
                left: rect.right - 40,
                top: rect.top + 40,
                bottom: rect.bottom - 40
            };

            // Check if mouse is in scrollbar area
            if (e.clientX >= consoleRect.left && e.clientX <= consoleRect.right) {
                this.isScrolling = true;
                this.shouldAutoScroll = false;
                console.log("Detected scrollbar drag, auto-scroll disabled");
            }
        } catch (err) {
            console.warn("Scrollbar drag detection failed:", err);
        }
    }

    /**
     * 检查是否滚动到了底部
     */
    private static checkIfAtBottom(): void {
        try {
            const ImGui = globalThis.ImGui;
            if (!ImGui) return;

            const currentScrollY = ImGui.GetScrollY();
            const maxScrollY = ImGui.GetScrollMaxY();

            // If near bottom, enable auto-scroll
            if (maxScrollY - currentScrollY < 20) {
                this.shouldAutoScroll = true;
            }
        } catch (err) {
        }
    }

    // 滚动状态记录
    private static isScrolling: boolean = false;
    private static mouseDownPos: { x: number, y: number } | null = null;
    private static lastScrollY: number = 0;
    private static scrollChangeTimeout: number | null = null;

    /**
     * Render the console window
     */
    private static renderConsoleWindow(): void {
        const ImGui = globalThis.ImGui;

        // 设置IO状态以确保鼠标事件正确处理
        const io = ImGui.GetIO();
        io.WantCaptureMouse = true; // 确保ImGui捕获鼠标事件

        try {
            // 配置字体以支持中文字符
            this.configureFontForMultiLanguage(ImGui);
        } catch (e) {
            console.warn("配置字体时出错:", e);
        }

        // Control bar
        if (ImGui.Button("Clear")) {
            this.consoleMessages = [];
        }

        ImGui.SameLine();

        // 修正Checkbox的处理方式
        // 创建指向this.showTimestamps的引用值
        const showTimestampsRef = [this.showTimestamps];
        if (ImGui.Checkbox("Timestamps", showTimestampsRef)) {
            // 直接从引用数组读取更新后的值
            this.showTimestamps = showTimestampsRef[0];
        }

        ImGui.SameLine();

        // 同样处理Source Info复选框
        const showSourceInfoRef = [this.showSourceInfo];
        if (ImGui.Checkbox("Source Info", showSourceInfoRef)) {
            this.showSourceInfo = showSourceInfoRef[0];
        }

        ImGui.SameLine();

        // 同样处理Random Colors复选框
        const useRandomColorsRef = [this.useRandomColors];
        if (ImGui.Checkbox("Random Colors", useRandomColorsRef)) {
            this.useRandomColors = useRandomColorsRef[0];
        }

        ImGui.SameLine();

        // 添加自动滚动复选框
        const autoScrollRef = [this.shouldAutoScroll];
        if (ImGui.Checkbox("Auto Scroll", autoScrollRef)) {
            this.shouldAutoScroll = autoScrollRef[0];
        }


        // Display console messages
        const contentHeight = ImGui.GetContentRegionAvail().y - 40; // Reserve space for input

        // 使用ImGuiWindowFlags避免滚动条问题
        const windowFlags = ImGui.WindowFlags.HorizontalScrollbar;

        if (ImGui.BeginChild("ConsoleMessages", new ImGui.ImVec2(0, contentHeight), true, windowFlags)) {
            // 减少当显示消息过多时的性能影响
            const visibleMessages = this.getVisibleMessages(this.consoleMessages);

            for (const message of visibleMessages) {
                // Display message with color based on type
                let color;
                switch (message.type) {
                    case 'error':
                        color = new ImGui.ImVec4(1.0, 0.4, 0.4, 1.0);
                        break;
                    case 'warn':
                        color = new ImGui.ImVec4(1.0, 0.8, 0.2, 1.0);
                        break;
                    case 'info':
                        color = new ImGui.ImVec4(0.4, 0.8, 1.0, 1.0);
                        break;
                    case 'debug':
                        color = new ImGui.ImVec4(0.5, 1.0, 0.5, 1.0);
                        break;
                    default:
                        color = message.color || new ImGui.ImVec4(1.0, 1.0, 1.0, 1.0);
                }

                // Display source if enabled
                if (this.showSourceInfo && message.source) {
                    this.renderASCIISafeText(
                        ImGui,
                        `[${message.source}]`,
                        new ImGui.ImVec4(1.0, 0.5, 0.5, 1.0)
                    );
                    ImGui.SameLine();
                }

                // Display timestamp if enabled
                if (this.showTimestamps && message.timestamp) {
                    this.renderASCIISafeText(
                        ImGui,
                        `[${message.timestamp}]`,
                        new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0)
                    );
                    ImGui.SameLine();
                }

                // 确保消息内容是字符串
                let displayContent = typeof message.content === 'string'
                    ? message.content
                    : String(message.content);

                // 截断过长的消息以避免性能问题
                if (displayContent.length > 1000) {
                    displayContent = displayContent.substring(0, 1000) + "...";
                }

                // 使用支持中文的安全文本渲染方法
                this.renderASCIISafeText(ImGui, displayContent, color);
            }

            // Auto-scroll to bottom (只有当shouldAutoScroll为true时)
            if (this.shouldAutoScroll) {
                ImGui.SetScrollHereY(1.0);
            }
        }
        ImGui.EndChild();

        ImGui.Separator();
    }

    /**
     * 只返回可能在当前视图中可见的消息，以提高性能
     */
    private static getVisibleMessages(messages: any[]): any[] {
        // 如果消息数量较少，直接返回全部
        if (messages.length < 100) {
            return messages;
        }

        // 否则返回最后的一部分消息
        return messages.slice(-100);
    }

    // 控制是否自动滚动到底部
    private static shouldAutoScroll: boolean = true;

    /**
     * Override console methods to capture output
     */
    private static overrideConsoleMethods(): void {
        // Save original methods
        this.originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        // Override log method
        console.log = (...args: any[]) => {
            this.addConsoleMessage('log', args);
            this.originalConsole.log(...args);
        };

        // Override info method
        console.info = (...args: any[]) => {
            this.addConsoleMessage('info', args);
            this.originalConsole.info(...args);
        };

        // Override warn method
        console.warn = (...args: any[]) => {
            this.addConsoleMessage('warn', args);
            this.originalConsole.warn(...args);
        };

        // Override error method
        console.error = (...args: any[]) => {
            this.addConsoleMessage('error', args);
            this.originalConsole.error(...args);
        };

        // Override debug method
        console.debug = (...args: any[]) => {
            this.addConsoleMessage('debug', args);
            this.originalConsole.debug(...args);
        };
    }

    /**
     * Format a value for display
     */
    private static formatValue(value: any): string {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        if (typeof value === 'object') {
            try {
                // 创建新的WeakSet用于此次调用
                const seenObjects = new WeakSet();

                // 尝试将对象转换为JSON字符串
                return JSON.stringify(value, (key, val) => {
                    // 处理循环引用
                    if (typeof val === 'object' && val !== null) {
                        if (seenObjects.has(val)) {
                            return '[Circular Reference]';
                        }
                        seenObjects.add(val);
                    }
                    return val;
                }, 2);
            } catch (e) {
                // 如果转换失败，返回简单的字符串表示
                return String(value);
            }
        }

        return String(value);
    }

    /**
     * Add a console message
     */
    private static addConsoleMessage(type: string, args: any[]): void {
        if (!this.isInitialized) return;

        // Get calling source information
        const stack = (new Error()).stack;
        let scriptName = this.extractScriptName(stack);

        // 如果仍然找不到来源，尝试从args中推断
        if (scriptName === 'script' || scriptName === 'unknown') {
            // 查看args中是否有常见的标识符
            const fullArgs = args.join(' ');
            if (fullArgs.includes('PIX')) {
                const match = fullArgs.match(/PIX[A-Z][a-zA-Z]+/);
                if (match) {
                    scriptName = match[0];
                }
            }
        }

        // Process args into a single content value
        let content: string;
        try {
            if (args.length === 1) {
                content = this.formatValue(args[0]);
            } else {
                content = args.map(arg => this.formatValue(arg)).join(' ');
            }

            // 确保内容是有效的字符串
            if (typeof content !== 'string') {
                content = String(content);
            }
        } catch (e) {
            content = `[Error formatting message: ${e}]`;
        }

        // Create the message
        const message = {
            type,
            content,
            timestamp: new Date().toLocaleTimeString(),
            source: scriptName
        };

        // Add to messages
        this.consoleMessages.push(message);

        // Limit console history size
        if (this.consoleMessages.length > this.maxMessages) {
            this.consoleMessages.shift();
        }
    }

    /**
     * Extract script name from stack trace
     */
    private static extractScriptName(stack: string | undefined): string {
        if (!stack) return 'unknown';

        try {
            // 分析整个调用堆栈
            const lines = stack.split('\n');

            // 构建忽略文件列表 - 这些文件不应作为来源
            const ignoreFiles = [
                'uiconsole.js', 'uiconsole.ts',
                'console.js', 'console.ts',
                'imgui.js', 'imgui.ts',
                'uidebug.js', 'uidebug.ts',
                'engine.js', 'engine.ts'
            ];

            // 跳过UIConsole内部的调用，找到真正的外部调用者
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];

                // 跳过空行
                if (!line) continue;

                // 尝试匹配脚本路径
                const match = line.match(/\/([^\/]+\.(?:js|ts))/);
                if (match) {
                    const scriptName = match[1];

                    // 跳过内部文件，找到外部调用者
                    if (!ignoreFiles.some(ignoreFile =>
                        scriptName.toLowerCase().includes(ignoreFile.toLowerCase()))) {
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
                    /at\s+(?:\w+\s+)?\(([^)]+\.(?:js|ts))/,  // at function (filename.js)
                    /at\s+([^\/\\]+\.(?:js|ts))/,      // at filename.js
                    /([^\/\\]+\.(?:js|ts))/            // 简单匹配
                ];

                for (const pattern of patterns) {
                    const match = line.match(pattern);
                    if (match) {
                        const fileName = match[1];

                        // 检查是否在忽略列表中
                        if (!ignoreFiles.some(ignoreFile =>
                            fileName.toLowerCase().includes(ignoreFile.toLowerCase()))) {
                            return fileName;
                        }
                    }
                }
            }

            // 模块名称匹配 - 尝试提取PIX前缀的模块
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // 匹配PIX开头的模块名
                const moduleMatch = line.match(/PIX[A-Za-z0-9_]+/);
                if (moduleMatch) {
                    return moduleMatch[0];
                }

                // 尝试从路径中提取模块名
                if (line.includes('/')) {
                    const pathParts = line.split('/');
                    for (const part of pathParts) {
                        if (part.startsWith('PIX') || part.includes('PixelDoom')) {
                            return part;
                        }
                    }
                }
            }

            return 'script';
        } catch (e) {
            console.warn("提取脚本名称时出错:", e);
            return 'script';
        }
    }

    /**
     * Show the console
     */
    public static Show(): void {
        if (!this.isInitialized) {
            console.log("Show: Console not initialized, initializing now...");
            this.Initialize();
        }

        console.log("Attempting to show console...");
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                console.log("Found window config, setting to visible");
                windowConfig.isOpen = true;
                this.isVisible = true;
            } else {
                console.error("Window config not found:", this.windowId);
            }
        } else {
            console.error("Cannot access imgui.windows");
        }
    }

    /**
     * Hide the console
     */
    public static Hide(): void {
        console.log("Attempting to hide console...");
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                console.log("Found window config, setting to hidden");
                windowConfig.isOpen = false;
                this.isVisible = false;
            } else {
                console.error("Window config not found:", this.windowId);
            }
        } else {
            console.error("Cannot access imgui.windows");
        }
    }

    /**
     * Toggle console visibility
     */
    public static Toggle(): void {
        console.log(`Toggle status before: visible=${this.isVisible}`);

        if (!this.isInitialized) {
            console.log("Console not initialized, initializing now...");
            this.Initialize();
        }

        try {
            if (this.isVisible) {
                console.log("Console currently visible, hiding...");
                this.Hide();
            } else {
                console.log("Console currently hidden, showing...");
                this.Show();
                // Re-enable auto-scroll when showing console
                this.shouldAutoScroll = true;
            }

            // Ensure state is correctly set
            const imgui = Imgui_chunchun as any;
            if (imgui.windows && imgui.windows.get) {
                const windowConfig = imgui.windows.get(this.windowId);
                if (windowConfig) {
                    console.log(`Window config isOpen=${windowConfig.isOpen}, console isVisible=${this.isVisible}`);

                    // Ensure both states are consistent
                    if (windowConfig.isOpen !== this.isVisible) {
                        console.log("Fixing inconsistent state");
                        windowConfig.isOpen = this.isVisible;
                    }
                }
            }

            console.log(`Toggle status after: visible=${this.isVisible}`);
        } catch (error) {
            console.error("Error during Toggle:", error);
            // Try to reset if error occurs
            this.Reset();
        }
    }

    /**
     * Clear all console messages
     */
    public static Clear(): void {
        this.consoleMessages = [];
    }

    /**
     * Check if console is visible
     */
    public static IsVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Set whether to use random colors for logs
     */
    public static SetUseRandomColors(use: boolean): void {
        this.useRandomColors = use;
    }

    /**
     * Check if random colors are enabled
     */
    public static IsUsingRandomColors(): boolean {
        return this.useRandomColors;
    }

    /**
     * Set whether to show timestamps
     */
    public static SetShowTimestamps(show: boolean): void {
        this.showTimestamps = show;
    }

    /**
     * Check if timestamps are being shown
     */
    public static IsShowingTimestamps(): boolean {
        return this.showTimestamps;
    }

    /**
     * Set whether to show source information
     */
    public static SetShowSourceInfo(show: boolean): void {
        this.showSourceInfo = show;
    }

    /**
     * Check if source information is being shown
     */
    public static IsShowingSourceInfo(): boolean {
        return this.showSourceInfo;
    }

    /**
     * Set the toggle key for console
     */
    public static SetToggleKey(key: string): void {
        const oldKey = this.toggleKey;
        this.toggleKey = key;
        console.log(`控制台热键已从 '${oldKey}' 更改为 '${key}'`);
    }

    /**
     * 添加全局键盘事件测试
     */
    private static setupGlobalKeyTest(): void {
        // Remove any existing test listener
        try {
            const oldTestListener = (this as any)._testKeyListener;
            if (oldTestListener) {
                window.removeEventListener('keydown', oldTestListener);
                console.log("Removed old test keyboard listener");
            }
        } catch (e) {
            console.warn("Error trying to remove old test listener", e);
        }

        // Create new test listener
        const testListener = (event: KeyboardEvent) => {
            // Only log n key to reduce console noise
            if (event.key === 'n') {
                console.log(`Global keyboard event: n key detected (hotkey=${this.toggleKey})`);
            }
        };

        // Save reference for future removal
        (this as any)._testKeyListener = testListener;

        // Add test listener
        window.addEventListener('keydown', testListener);
        console.log("Added global keyboard test listener");
    }

    /**
     * 完全重置控制台状态
     * 用于解决任何初始化问题
     */
    public static Reset(): void {
        console.log("Resetting IMGUI console...");

        // Clear existing event listeners
        try {
            const oldKeyListener = (this as any)._keydownListener;
            if (oldKeyListener) {
                document.removeEventListener('keydown', oldKeyListener, true);
                console.log("Removed keyboard event listener");
            }

            const oldTestListener = (this as any)._testKeyListener;
            if (oldTestListener) {
                window.removeEventListener('keydown', oldTestListener);
                console.log("Removed test keyboard listener");
            }

            const oldWheelListener = (this as any)._wheelHandler;
            if (oldWheelListener) {
                window.removeEventListener('wheel', oldWheelListener);
                console.log("Removed wheel event listener");
            }

            // Remove new mouse event listeners
            const oldMouseDownListener = (this as any)._mouseDownHandler;
            if (oldMouseDownListener) {
                window.removeEventListener('mousedown', oldMouseDownListener);
                console.log("Removed mouse down event listener");
            }

            const oldMouseMoveListener = (this as any)._mouseMoveHandler;
            if (oldMouseMoveListener) {
                window.removeEventListener('mousemove', oldMouseMoveListener);
                console.log("Removed mouse move event listener");
            }

            const oldMouseUpListener = (this as any)._mouseUpHandler;
            if (oldMouseUpListener) {
                window.removeEventListener('mouseup', oldMouseUpListener);
                console.log("Removed mouse up event listener");
            }
        } catch (e) {
            console.warn("Error removing event listeners", e);
        }

        // Reset state
        this.isInitialized = false;
        this.isVisible = false;
        this.consoleMessages = [];
        this.shouldAutoScroll = true;
        this.isScrolling = false;
        this.mouseDownPos = null;
        this.lastScrollY = 0;
        this.scrollChangeTimeout = null;

        // Clear any existing timers
        if (this.scrollChangeTimeout) {
            clearTimeout(this.scrollChangeTimeout);
            this.scrollChangeTimeout = null;
        }

        // Re-initialize
        this.Initialize();
        console.log("IMGUI console has been reset");
    }

    /**
     * Check if console is initialized
     */
    public static IsInitialized(): boolean {
        return this.isInitialized;
    }

    // 修改字体配置方法
    private static isFontConfigured: boolean = false;
    private static configureFontForMultiLanguage(ImGui: any): void {
        // Only configure once
        if (this.isFontConfigured) return;

        try {
            const io = ImGui.GetIO();

            // Configure to use ProggyClean.ttf font
            if (io && io.Fonts) {
                // Explicitly load ProggyClean font
                console.log("Loading ProggyClean.ttf font...");

                // Set font path and size
                const fontPath = "Font/ProggyClean.ttf";
                const fontSize = 13.0;

                try {
                    // Try different methods to load the font
                    if (io.Fonts.AddFontFromFileTTF) {
                        try {
                            // Method 1: Direct load without config
                            const font = io.Fonts.AddFontFromFileTTF(fontPath, fontSize);
                            console.log("Method 1: Font loaded:", font ? "success" : "failed");
                        } catch (e) {
                            console.warn("Method 1 loading failed:", e);

                            try {
                                // Method 2: Use null as config
                                const font = io.Fonts.AddFontFromFileTTF(fontPath, fontSize, null);
                                console.log("Method 2: Font loaded:", font ? "success" : "failed");
                            } catch (e2) {
                                console.warn("Method 2 loading failed:", e2);

                                try {
                                    // Method 3: Try using default font
                                    if (io.Fonts.AddFontDefault) {
                                        const defaultFont = io.Fonts.AddFontDefault();
                                        console.log("Method 3: Using default font:", defaultFont ? "success" : "failed");
                                    }
                                } catch (e3) {
                                    console.warn("Could not load any font:", e3);
                                }
                            }
                        }

                        // Try rebuilding font texture
                        try {
                            if (io.Fonts.Build) {
                                io.Fonts.Build();
                                console.log("Font texture rebuilt");
                            } else if (io.Fonts.GetTexDataAsRGBA32) {
                                // Some ImGui implementations need explicit texture data request to trigger rebuild
                                io.Fonts.GetTexDataAsRGBA32();
                                console.log("Triggered font texture rebuild via GetTexDataAsRGBA32");
                            }
                        } catch (buildError) {
                            console.warn("Failed to rebuild font texture:", buildError);
                        }
                    } else {
                        console.log("This ImGui implementation doesn't support AddFontFromFileTTF");
                    }
                } catch (fontError) {
                    console.warn("Error during font loading process:", fontError);
                }

                // Use global font scale as fallback
                if (io.hasOwnProperty('FontGlobalScale')) {
                    io.FontGlobalScale = 1.1;
                    console.log("Applied global font scale: 1.1");
                }

                // Try to directly set font file path (some ImGui implementations might support this)
                try {
                    if (io.hasOwnProperty('FontFilename')) {
                        io.FontFilename = fontPath;
                        console.log("Directly set font file path:", fontPath);
                    }
                } catch (e) {
                    console.log("Failed to set font path directly:", e);
                }

                // Mark as configured
                this.isFontConfigured = true;
                console.log("Font configuration complete");
            } else {
                console.warn("Cannot access ImGui font system");
            }
        } catch (e) {
            console.warn("Font configuration failed:", e);
        }
    }

    /**
     * 预加载字体
     */
    private static preloadFont(): void {
        console.log("Preloading ProggyClean.ttf font...");

        try {
            const fontLoader = new FontFace('IMGUI_Console_Font', 'url(Font/ProggyClean.ttf)');

            fontLoader.load().then((loadedFace) => {
                //@ts-ignore
                document.fonts.add(loadedFace);
                console.log('ProggyClean.ttf font preloaded successfully (FontFace API)');
            }).catch((error) => {
                console.warn('Font preloading failed (FontFace API):', error);
                this.preloadFontWithCSS();
            });
        } catch (e) {
            console.warn('FontFace API unavailable:', e);
            this.preloadFontWithCSS();
        }
    }

    /**
     * 使用CSS预加载字体
     */
    private static preloadFontWithCSS(): void {
        try {
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'IMGUI_Console_Font';
                    src: url('Font/ProggyClean.ttf') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            `;
            document.head.appendChild(style);
            console.log('ProggyClean.ttf font preloaded successfully (CSS @font-face)');

            const testElement = document.createElement('div');
            testElement.style.fontFamily = 'IMGUI_Console_Font';
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            testElement.textContent = 'Font Preload Test';
            document.body.appendChild(testElement);

            setTimeout(() => {
                document.body.removeChild(testElement);
            }, 100);
        } catch (e) {
            console.warn('CSS font preloading failed:', e);
        }
    }

    /**
     * Render text, ensuring Chinese characters display correctly
     */
    private static renderASCIISafeText(ImGui: any, text: string, color: any): void {
        if (!text) {
            ImGui.TextColored(color, "");
            return;
        }

        // Check if text contains Chinese characters
        const hasChinese = /[\u4e00-\u9fa5]/.test(text);

        if (hasChinese) {
            // Contains Chinese characters, try different display methods
            try {
                // Method 1: Use Unicode code points directly
                // Convert string to Unicode escape sequence
                const unicodeText = this.convertToUnicodeEscapeSequence(text);

                // Use eval function to convert Unicode escape sequences back to string
                // Note: eval is normally avoided in production, but is used here for debugging purposes
                try {
                    const evalText = eval(`"${unicodeText}"`);
                    ImGui.TextColored(color, evalText);
                    return;
                } catch (evalError) {
                    console.warn("Unicode escape sequence evaluation failed:", evalError);
                }
            } catch (e) {
                console.warn("Unicode code point conversion failed:", e);
            }

            try {
                // Method 2: Display one character at a time
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (i > 0) ImGui.SameLine(0, 0); // Connect characters without spacing
                    ImGui.TextColored(color, char);
                }
                return;
            } catch (charError) {
                console.warn("Character-by-character display failed:", charError);
            }

            try {
                // Method 3: Display Unicode escape sequences
                const asciiSafe = text.replace(/[^\x00-\x7F]/g, (char) => {
                    return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
                });
                ImGui.TextColored(color, asciiSafe);
                return;
            } catch (escapeError) {
                console.warn("Unicode escape sequence display failed:", escapeError);
            }
        } else {
            // No Chinese characters, display directly
            try {
                ImGui.TextColored(color, text);
                return;
            } catch (e) {
                console.warn("Normal text display failed:", e);
            }
        }

        // Final fallback: Display ASCII characters only
        try {
            const pureAscii = text.replace(/[^\x00-\x7F]/g, "?");
            ImGui.TextColored(color, pureAscii);
        } catch (fallbackError) {
            // If all methods fail, display error message
            try {
                ImGui.TextColored(color, "[Text rendering error]");
            } catch (finalError) {
                // Cannot display any text, just log error
                console.error("Cannot render any text:", finalError);
            }
        }
    }

    /**
     * Convert string to Unicode escape sequence
     */
    private static convertToUnicodeEscapeSequence(text: string): string {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            if (char > 127) {
                // Non-ASCII character, convert to Unicode escape sequence
                result += `\\u${char.toString(16).padStart(4, '0')}`;
            } else {
                // ASCII character, add directly
                const escChar = text[i];
                // Handle special characters
                if (escChar === '"') {
                    result += '\\"';
                } else if (escChar === '\\') {
                    result += '\\\\';
                } else if (escChar === '\n') {
                    result += '\\n';
                } else if (escChar === '\r') {
                    result += '\\r';
                } else if (escChar === '\t') {
                    result += '\\t';
                } else {
                    result += escChar;
                }
            }
        }
        return result;
    }

    /**
     * 向文档中注入字体样式
     */
    private static injectFontStyle(): void {
        // Create style element
        const style = document.createElement('style');
        style.id = 'imgui-console-font-style';
        style.textContent = `
            /* IMGUI Console Font */
            @font-face {
                font-family: 'IMGUIConsoleFont';
                src: url('Font/ProggyClean.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }
            
            /* Ensure font is applied to ImGui elements */
            canvas {
                font-family: 'IMGUIConsoleFont', monospace !important;
            }
            
            /* Add font preload for ImGui elements */
            #IMGUI_CONSOLE_PRELOAD {
                font-family: 'IMGUIConsoleFont', monospace;
                position: absolute;
                visibility: hidden;
                pointer-events: none;
            }
        `;

        // Add to document head
        document.head.appendChild(style);

        // Add preload element
        const preloadElement = document.createElement('div');
        preloadElement.id = 'IMGUI_CONSOLE_PRELOAD';
        preloadElement.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        document.body.appendChild(preloadElement);

        console.log("IMGUI console font style injected into document");
    }

    /**
     * 调整控制台窗口大小和位置
     */
    private static resizeConsoleWindow(): void {
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                // Adjust to more appropriate size
                windowConfig.size = {
                    width: Math.min(800, window.innerWidth * 0.8),
                    height: Math.min(500, window.innerHeight * 0.7)
                };

                // Adjust position to screen center
                windowConfig.position = {
                    x: (window.innerWidth - windowConfig.size.width) / 2,
                    y: (window.innerHeight - windowConfig.size.height) / 2
                };

                console.log("Adjusted console window size and position");
            }
        }
    }
}

// Modify initialization process to ensure console works correctly
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // Check if console is already initialized to avoid duplicates
    if (!UIConsole.IsInitialized()) {
        console.log("Initializing IMGUI console...");

        // Clear all old event listeners (prevent multiple bindings)
        try {
            const oldKeyListener = (UIConsole as any)._keydownListener;
            if (oldKeyListener) {
                document.removeEventListener('keydown', oldKeyListener, true);
                console.log("Removed old keyboard event listener");
            }

            const oldTestListener = (UIConsole as any)._testKeyListener;
            if (oldTestListener) {
                window.removeEventListener('keydown', oldTestListener);
                console.log("Removed old test keyboard listener");
            }
        } catch (e) {
            console.warn("Error removing old listeners", e);
        }

        // Inject global font style early
        const injectGlobalFontStyle = () => {
            try {
                const style = document.createElement('style');
                style.textContent = `
                    @font-face {
                        font-family: 'ProggyClean';
                        src: url('Font/ProggyClean.ttf') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }
                    
                    /* Preload display element */
                    #imgui-font-preload {
                        position: absolute;
                        visibility: hidden;
                        font-family: 'ProggyClean', monospace;
                        pointer-events: none;
                    }
                    
                    /* Apply to canvas */
                    canvas {
                        font-family: 'ProggyClean', monospace !important;
                    }
                `;
                document.head.appendChild(style);

                // Create preload element
                const preload = document.createElement('div');
                preload.id = 'imgui-font-preload';
                preload.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                document.body.appendChild(preload);

                console.log("Global font style injected");
                return true;
            } catch (e) {
                console.warn("Failed to inject global font style:", e);
                return false;
            }
        };

        // Immediately inject global font style
        injectGlobalFontStyle();

        // Wait for ImGui to fully initialize
        const checkAndInitImGui = () => {
            // Check if ImGui is ready
            if (typeof globalThis.ImGui !== 'undefined') {
                const ImGui = globalThis.ImGui;
                try {
                    // Try to configure ImGui font directly
                    const io = ImGui.GetIO();
                    if (io && io.Fonts) {
                        // Get font size
                        const fontSize = io.FontGlobalScale * 13.0;
                        console.log(`ImGui ready, font scale: ${io.FontGlobalScale}, expected font size: ${fontSize}`);

                        // Initialize console
                        setTimeout(() => {
                            UIConsole.Initialize();
                            console.log("IMGUI Console system ready");

                            // Set N key as hotkey and actively log
                            UIConsole.SetToggleKey('n');
                            console.log(`Console hotkey set to: 'n'`);

                            // Add global variable for direct browser console access
                            (window as any).IMGUIConsole = UIConsole;

                            // Explicitly set to hidden state, no longer auto-show
                            UIConsole.Hide();
                            console.log("IMGUI console initialized, press 'n' to open");

                            // Add reset function to global for debugging
                            (window as any).resetIMGUIConsole = () => {
                                UIConsole.Reset();
                                return "IMGUI console has been reset";
                            };

                            // Add global hotkey test function
                            (window as any).testConsoleKey = () => {
                                UIConsole.Toggle();
                                return `Console current state: ${UIConsole.IsVisible() ? 'visible' : 'hidden'}`;
                            };
                        }, 100);
                    } else {
                        console.warn("ImGui loaded but IO or Fonts unavailable, delaying initialization");
                        setTimeout(checkAndInitImGui, 100);
                    }
                } catch (e) {
                    console.warn("Error during ImGui initialization check:", e);
                    setTimeout(checkAndInitImGui, 100);
                }
            } else {
                console.log("ImGui not ready yet, waiting...");
                setTimeout(checkAndInitImGui, 100);
            }
        };

        // Start checking if ImGui is ready
        setTimeout(checkAndInitImGui, 200);
    } else {
        console.log("IMGUI console already initialized");
        // Even if already initialized, ensure hotkey is correctly set
        UIConsole.SetToggleKey('n');
    }
});