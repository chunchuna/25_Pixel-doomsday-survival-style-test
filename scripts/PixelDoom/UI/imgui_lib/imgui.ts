import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

// 声明全局 ImGui 对象
declare global {
    var ImGui: any;
    var ImGui_Impl: any;
}

// 窗口配置接口
interface WindowConfig {
    title: string;
    isOpen: boolean;
    size?: { width: number; height: number };
    position?: { x: number; y: number };
    flags?: number;
    renderCallback?: () => void;
}

export class Imgui_chunchun {
    private static isInitialized: boolean = false;
    private static canvas: HTMLCanvasElement;
    private static gl: WebGLRenderingContext;
    private static windows: Map<string, WindowConfig> = new Map();
    private static sliderValue: number = 0.5;
    private static checkboxValue: boolean = false;
    
    // 异步加载脚本
    private static async loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    
    // 初始化 ImGui
    static async Initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log("ImGui 已经初始化");
            return;
        }
        
        try {
            console.log('开始加载 ImGui-JS...');
            
            // 加载 ImGui 和渲染器
            await this.loadScript('https://flyover.github.io/imgui-js/dist/imgui.umd.js');
            await this.loadScript('https://flyover.github.io/imgui-js/dist/imgui_impl.umd.js');
            
            console.log('ImGui-JS 加载完成');
            
            // 创建 Canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.zIndex = '1000';
            document.body.appendChild(this.canvas);
            
            // 获取 WebGL 上下文
            this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if (!this.gl) {
                throw new Error('无法获取 WebGL 上下文');
            }
            
            // 初始化 ImGui
            await ImGui.default();
            ImGui.CreateContext();
            
            // 初始化渲染器
            ImGui_Impl.Init(this.canvas);
            
            // 设置样式
            const io = ImGui.GetIO();
            io.ConfigFlags |= ImGui.ConfigFlags.NavEnableKeyboard;
            
            // 应用暗色主题
            ImGui.StyleColorsDark();
            
            // 设置鼠标事件处理
            this.setupMouseEventHandling();
            
            this.isInitialized = true;
            console.log('ImGui 初始化完成');
            
        } catch (error) {
            console.error('ImGui 初始化失败:', error);
            throw error;
        }
    }
    
    // 设置鼠标事件处理
    private static setupMouseEventHandling(): void {
        // canvas 始终接收事件，以便 ImGui 能够正常工作
        this.canvas.style.pointerEvents = 'auto';
        
        // 确保 canvas 不会阻止下方元素的选择
        this.canvas.style.userSelect = 'none';
        
        // 降低 z-index 避免覆盖某些高层级 UI
        this.canvas.style.zIndex = '1000';
        
        // 存储当前悬浮的元素
        let currentHoveredElement: Element | null = null;
        let isDragging = false;
        let dragTarget: Element | null = null;
        
        // 处理所有鼠标事件
        const handleMouseEvent = (e: Event) => {
            if (!(e instanceof MouseEvent)) return;
            
            const io = ImGui.GetIO();
            const isOverImGui = io.WantCaptureMouse || 
                               ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow) ||
                               ImGui.IsAnyItemHovered() ||
                               ImGui.IsAnyItemActive();
            
            if (!isOverImGui) {
                // 临时禁用 canvas 捕获
                this.canvas.style.pointerEvents = 'none';
                
                // 获取鼠标下的元素
                const element = document.elementFromPoint(e.clientX, e.clientY);
                
                // 恢复 canvas 捕获
                this.canvas.style.pointerEvents = 'auto';
                
                if (element && element !== this.canvas) {
                    // 处理悬浮状态变化
                    if (e.type === 'mousemove') {
                        // 如果悬浮元素改变了
                        if (currentHoveredElement !== element) {
                            // 对旧元素发送 mouseleave
                            if (currentHoveredElement) {
                                const leaveEvent = new MouseEvent('mouseleave', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    clientX: e.clientX,
                                    clientY: e.clientY,
                                    relatedTarget: element
                                });
                                currentHoveredElement.dispatchEvent(leaveEvent);
                                
                                const outEvent = new MouseEvent('mouseout', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window,
                                    clientX: e.clientX,
                                    clientY: e.clientY,
                                    relatedTarget: element
                                });
                                currentHoveredElement.dispatchEvent(outEvent);
                            }
                            
                            // 对新元素发送 mouseenter
                            currentHoveredElement = element;
                            const enterEvent = new MouseEvent('mouseenter', {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                clientX: e.clientX,
                                clientY: e.clientY,
                                relatedTarget: currentHoveredElement
                            });
                            element.dispatchEvent(enterEvent);
                            
                            const overEvent = new MouseEvent('mouseover', {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                clientX: e.clientX,
                                clientY: e.clientY,
                                relatedTarget: currentHoveredElement
                            });
                            element.dispatchEvent(overEvent);
                        }
                    }
                    
                    // 处理拖拽
                    if (e.type === 'mousedown') {
                        isDragging = true;
                        dragTarget = element;
                    } else if (e.type === 'mouseup') {
                        isDragging = false;
                        dragTarget = null;
                    }
                    
                    // 创建并发送事件
                    const newEvent = new MouseEvent(e.type, {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        detail: e.detail,
                        screenX: e.screenX,
                        screenY: e.screenY,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        shiftKey: e.shiftKey,
                        metaKey: e.metaKey,
                        button: e.button,
                        buttons: e.buttons,
                        relatedTarget: e.relatedTarget
                    });
                    
                    // 如果正在拖拽，确保事件发送到正确的目标
                    const targetElement = isDragging && dragTarget ? dragTarget : element;
                    targetElement.dispatchEvent(newEvent);
                    
                    // 阻止原始事件
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else {
                // 如果鼠标在 ImGui 上，清除悬浮状态
                if (currentHoveredElement) {
                    const leaveEvent = new MouseEvent('mouseleave', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: e.clientX,
                        clientY: e.clientY
                    });
                    currentHoveredElement.dispatchEvent(leaveEvent);
                    currentHoveredElement = null;
                }
            }
        };
        
        // 监听所有相关的鼠标事件
        const mouseEvents = [
            'mousedown', 'mouseup', 'click', 'dblclick', 
            'mousemove', 'mouseenter', 'mouseleave', 
            'mouseover', 'mouseout', 'contextmenu'
        ];
        
        mouseEvents.forEach(eventType => {
            this.canvas.addEventListener(eventType, handleMouseEvent, true);
        });
        
        // 处理鼠标滚轮事件
        this.canvas.addEventListener('wheel', (e: WheelEvent) => {
            const io = ImGui.GetIO();
            const isOverImGui = io.WantCaptureMouse || 
                               ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow);
            
            if (!isOverImGui) {
                this.canvas.style.pointerEvents = 'none';
                const element = document.elementFromPoint(e.clientX, e.clientY);
                this.canvas.style.pointerEvents = 'auto';
                
                if (element && element !== this.canvas) {
                    const wheelEvent = new WheelEvent('wheel', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        deltaX: e.deltaX,
                        deltaY: e.deltaY,
                        deltaZ: e.deltaZ,
                        deltaMode: e.deltaMode
                    });
                    element.dispatchEvent(wheelEvent);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);
    }
    
    // 检查是否有任何窗口被悬停
    private static isAnyWindowHovered(): boolean {
        // 检查是否有任何 ImGui 窗口被悬停
        return ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow);
    }
    
    // 渲染循环
    static Render(): void {
        if (!this.isInitialized) return;
        
        // 开始新帧
        ImGui_Impl.NewFrame(performance.now());
        ImGui.NewFrame();
        
        // 更新鼠标事件状态
        this.updateMouseEventState();
        
        // 渲染所有窗口
        this.windows.forEach((config, id) => {
            if (config.isOpen) {
                this.RenderWindow(config);
            }
        });
        
        // 渲染 ImGui
        ImGui.EndFrame();
        ImGui.Render();
        
        // 清空画布并渲染
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
    }
    
    // 更新鼠标事件状态
    private static updateMouseEventState(): void {
        // 这个方法现在不需要做任何事情
        // 所有的鼠标事件处理逻辑已经在 setupMouseEventHandling 中完成
        // 保留这个方法以避免破坏现有的调用
        
        /*
        const io = ImGui.GetIO();
        
        // 检查是否需要捕获鼠标
        const shouldCaptureMouse = io.WantCaptureMouse || 
                                  ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow) ||
                                  ImGui.IsAnyItemHovered() ||
                                  ImGui.IsAnyItemActive();
        
        // 动态设置 pointer-events
        if (shouldCaptureMouse) {
            if (this.canvas.style.pointerEvents !== 'auto') {
                this.canvas.style.pointerEvents = 'auto';
            }
        } else {
            if (this.canvas.style.pointerEvents !== 'none') {
                this.canvas.style.pointerEvents = 'none';
            }
        }
        */
    }
    
    // 渲染单个窗口
    private static RenderWindow(config: WindowConfig): void {
        // 设置窗口大小
        if (config.size) {
            ImGui.SetNextWindowSize(new ImGui.ImVec2(config.size.width, config.size.height), ImGui.Cond.FirstUseEver);
        }
        
        // 设置窗口位置
        if (config.position) {
            ImGui.SetNextWindowPos(new ImGui.ImVec2(config.position.x, config.position.y), ImGui.Cond.FirstUseEver);
        }
        
        // 开始窗口
        const flags = config.flags || 0;
        let isOpen = config.isOpen;
        if (ImGui.Begin(config.title, (value = isOpen) => config.isOpen = value, flags)) {
            // 执行自定义渲染回调
            if (config.renderCallback) {
                config.renderCallback();
            }
        }
        ImGui.End();
    }
    
        // 创建示例窗口
    static CreateExampleWindow(): void {
        
        const windowId = "example_window";
        
        this.windows.set(windowId, {
            title: "example_window",
            isOpen: true,
            size: { width: 400, height: 300 },
            position: { x: 50, y: 50 },
            renderCallback: () => {
                ImGui.Text("this is a  example_window");
                ImGui.Separator();
                
                if (ImGui.Button("click me")) {
                    console.log("button click");
                }
                
                ImGui.Text("you can add more sub here");
                
                // 滑块示例
                ImGui.SliderFloat("value", (value = this.sliderValue) => this.sliderValue = value, 0.0, 1.0);
                
                // 复选框示例
                ImGui.Checkbox("value", (value = this.checkboxValue) => this.checkboxValue = value);
                
                ImGui.Separator();
                ImGui.TextColored(new ImGui.ImVec4(0.5, 0.8, 1.0, 1.0), "hint：");
                ImGui.TextWrapped("when mouse not here the mouse can click other ui。");
                ImGui.TextWrapped("you can drag window to tests");
            }
        });
    }
    
    // 创建文本窗口
    static CreateTextWindow(id: string, title: string, text: string, position?: { x: number; y: number }): void {
        this.windows.set(id, {
            title: title,
            isOpen: true,
            position: position,
            renderCallback: () => {
                ImGui.TextWrapped(text);
            }
        });
    }
    
    // 创建输入窗口
    static CreateInputWindow(id: string, title: string, onSubmit: (text: string) => void): void {
        let inputText = "";
        
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 300, height: 150 },
            renderCallback: () => {
                ImGui.InputText("输入", (value = inputText) => inputText = value);
                
                if (ImGui.Button("确定")) {
                    onSubmit(inputText);
                    this.CloseWindow(id);
                }
                
                ImGui.SameLine();
                
                if (ImGui.Button("取消")) {
                    this.CloseWindow(id);
                }
            }
        });
    }
    
    // 创建确认对话框
    static CreateConfirmDialog(id: string, title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 300, height: 120 },
            flags: ImGui.WindowFlags.NoResize | ImGui.WindowFlags.NoCollapse,
            renderCallback: () => {
                ImGui.Text(message);
                ImGui.Separator();
                
                if (ImGui.Button("确定")) {
                    onConfirm();
                    this.CloseWindow(id);
                }
                
                ImGui.SameLine();
                
                if (ImGui.Button("取消")) {
                    if (onCancel) onCancel();
                    this.CloseWindow(id);
                }
            }
        });
    }
    
    // 创建工具窗口
    static CreateToolWindow(id: string, title: string, tools: Array<{ name: string; icon?: string; callback: () => void }>): void {
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 200, height: 400 },
            renderCallback: () => {
                tools.forEach((tool, index) => {
                    const buttonText = tool.icon ? `${tool.icon} ${tool.name}` : tool.name;
                    
                    if (ImGui.Button(buttonText, new ImGui.ImVec2(-1, 30))) {
                        tool.callback();
                    }
                    
                    if (index < tools.length - 1) {
                        ImGui.Spacing();
                    }
                });
            }
        });
    }
    
    // 创建属性编辑器窗口
    static CreatePropertyWindow(id: string, title: string, properties: any): void {
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 300, height: 400 },
            renderCallback: () => {
                for (const [key, value] of Object.entries(properties)) {
                    if (typeof value === 'number') {
                        let numValue = value as number;
                        ImGui.InputFloat(key, (v = numValue) => properties[key] = v);
                    } else if (typeof value === 'boolean') {
                        let boolValue = value as boolean;
                        ImGui.Checkbox(key, (v = boolValue) => properties[key] = v);
                    } else if (typeof value === 'string') {
                        let strValue = value as string;
                        ImGui.InputText(key, (v = strValue) => properties[key] = v);
                    }
                    
                    ImGui.Separator();
                }
            }
        });
    }
    
    
    // 关闭窗口
    static CloseWindow(id: string): void {
        const window = this.windows.get(id);
        if (window) {
            window.isOpen = false;
        }
    }
    
    // 销毁窗口
    static DestroyWindow(id: string): void {
        this.windows.delete(id);
    }
    
    // 显示/隐藏窗口
    static ToggleWindow(id: string): void {
        const window = this.windows.get(id);
        if (window) {
            window.isOpen = !window.isOpen;
        }
    }
    
    // 获取窗口状态
    static IsWindowOpen(id: string): boolean {
        const window = this.windows.get(id);
        return window ? window.isOpen : false;
    }
    
    // 销毁 ImGui
    static Destroy(): void {
        if (!this.isInitialized) return;
        
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
        
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        
        this.windows.clear();
        this.isInitialized = false;
    }
}

// 初始化钩子
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(async () => {
    try {
        await Imgui_chunchun.Initialize();
        //Imgui_chunchun.CreateExampleWindow();
        
    } catch (error) {
        console.error("ImGui 初始化失败:", error);
    }
});

// 更新钩子
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    Imgui_chunchun.Render();
});