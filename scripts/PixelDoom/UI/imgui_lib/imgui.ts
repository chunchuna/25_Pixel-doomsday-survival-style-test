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
            this.canvas.style.zIndex = '9999';
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
            
            this.isInitialized = true;
            console.log('ImGui 初始化完成');
            
        } catch (error) {
            console.error('ImGui 初始化失败:', error);
            throw error;
        }
    }
    
    // 渲染循环
    static Render(): void {
        if (!this.isInitialized) return;
        
        // 开始新帧
        ImGui_Impl.NewFrame(performance.now());
        ImGui.NewFrame();
        
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
            title: "示例窗口",
            isOpen: true,
            size: { width: 400, height: 300 },
            position: { x: 50, y: 50 },
            renderCallback: () => {
                ImGui.Text("这是一个示例窗口!");
                ImGui.Separator();
                
                if (ImGui.Button("点击我")) {
                    console.log("按钮被点击了!");
                }
                
                ImGui.Text("你可以在这里添加更多控件");
                
                // 滑块示例
                ImGui.SliderFloat("滑块", (value = this.sliderValue) => this.sliderValue = value, 0.0, 1.0);
                
                // 复选框示例
                ImGui.Checkbox("复选框", (value = this.checkboxValue) => this.checkboxValue = value);
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
        Imgui_chunchun.CreateExampleWindow();
    } catch (error) {
        console.error("ImGui 初始化失败:", error);
    }
});

// 更新钩子
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    Imgui_chunchun.Render();
});