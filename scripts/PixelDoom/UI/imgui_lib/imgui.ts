import { Unreal__ } from "../../../engine.js";
import { ImGuiFontManager } from "./FontManager.js";

// Declare global ImGui objects
declare global {
    var ImGui: any;
    var ImGui_Impl: any;
}

// Window configuration interface
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
    
    
    // Async script loading
    private static async loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    
    // Initialize ImGui
    static async Initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log("ImGui already initialized");
            return;
        }
        
        try {
            console.log('Starting to load ImGui-JS...');
            
            // Load ImGui and renderer from local files
            await this.loadScript('Resource/script/lib/imgui/imgui.umd.js');
            await this.loadScript('Resource/script/lib/imgui/imgui_impl.umd.js');
            console.log('ImGui-JS loading completed');
            
            // Create Canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'auto';
            this.canvas.style.zIndex = '1000';
            document.body.appendChild(this.canvas);
            
            // Get WebGL context
            this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
            if (!this.gl) {
                throw new Error('Failed to get WebGL context');
            }
            
            // Initialize ImGui
            await ImGui.default();
            ImGui.CreateContext();
            
            // Initialize renderer
            ImGui_Impl.Init(this.canvas);
            
            // Setup style
            const io = ImGui.GetIO();
            io.ConfigFlags |= ImGui.ConfigFlags.NavEnableKeyboard;
            
            // Apply dark theme
            ImGui.StyleColorsDark();
            
            // Setup mouse event handling
            this.setupMouseEventHandling();
            
            this.isInitialized = true;
            console.log('ImGui initialization completed');
            
        } catch (error) {
            console.error("ImGui initialization failed:", error);
            throw error;
        }
    }
    
    // Setup mouse event handling
    private static setupMouseEventHandling(): void {
        // Canvas always receives events so ImGui can work properly
        this.canvas.style.pointerEvents = 'auto';
        
        // Ensure canvas doesn't prevent selection of elements below
        this.canvas.style.userSelect = 'none';
        
        // Lower z-index to avoid covering certain high-level UI
        this.canvas.style.zIndex = '1000';
        
        // Store currently hovered element
        let currentHoveredElement: Element | null = null;
        let isDragging = false;
        let dragTarget: Element | null = null;
        
        // Handle all mouse events
        const handleMouseEvent = (e: Event) => {
            if (!(e instanceof MouseEvent)) return;
            
            const io = ImGui.GetIO();
            const isOverImGui = io.WantCaptureMouse || 
                               ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow) ||
                               ImGui.IsAnyItemHovered() ||
                               ImGui.IsAnyItemActive();
            
            if (!isOverImGui) {
                // Temporarily disable canvas capture
                this.canvas.style.pointerEvents = 'none';
                
                // Get element under mouse
                const element = document.elementFromPoint(e.clientX, e.clientY);
                
                // Restore canvas capture
                this.canvas.style.pointerEvents = 'auto';
                
                if (element && element !== this.canvas) {
                    // Handle hover state changes
                    if (e.type === 'mousemove') {
                        // If hovered element changed
                        if (currentHoveredElement !== element) {
                            // Send mouseleave to old element
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
                            
                            // Send mouseenter to new element
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
                    
                    // Handle dragging
                    if (e.type === 'mousedown') {
                        isDragging = true;
                        dragTarget = element;
                    } else if (e.type === 'mouseup') {
                        isDragging = false;
                        dragTarget = null;
                    }
                    
                    // Create and send event
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
                    
                    // If dragging, ensure event is sent to correct target
                    const targetElement = isDragging && dragTarget ? dragTarget : element;
                    targetElement.dispatchEvent(newEvent);
                    
                    // Prevent original event
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else {
                // If mouse is over ImGui, clear hover state
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
        
        // Listen to all relevant mouse events
        const mouseEvents = [
            'mousedown', 'mouseup', 'click', 'dblclick', 
            'mousemove', 'mouseenter', 'mouseleave', 
            'mouseover', 'mouseout', 'contextmenu'
        ];
        
        mouseEvents.forEach(eventType => {
            this.canvas.addEventListener(eventType, handleMouseEvent, true);
        });
        
        // Handle mouse wheel events
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
    
    // Check if any window is hovered
    private static isAnyWindowHovered(): boolean {
        // Check if any ImGui window is hovered
        return ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow);
    }
    
    // Render loop
    static Render(): void {
        if (!this.isInitialized) return;
        
        // Start new frame
        ImGui_Impl.NewFrame(performance.now());
        ImGui.NewFrame();
        
        // Update mouse event state
        this.updateMouseEventState();
        
        // Render all windows
        this.windows.forEach((config, id) => {
            if (config.isOpen) {
                this.RenderWindow(config);
            }
        });
        
        // Render ImGui
        ImGui.EndFrame();
        ImGui.Render();
        
        // Clear canvas and render
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
    }
    
    // Update mouse event state
    private static updateMouseEventState(): void {
        // This method now does not need to do anything
        // All mouse event handling logic is already completed in setupMouseEventHandling
        // Keeping this method to avoid breaking existing calls
        
        /*
        const io = ImGui.GetIO();
        
        // Check if mouse should be captured
        const shouldCaptureMouse = io.WantCaptureMouse || 
                                  ImGui.IsWindowHovered(ImGui.HoveredFlags.AnyWindow) ||
                                  ImGui.IsAnyItemHovered() ||
                                  ImGui.IsAnyItemActive();
        
        // Dynamically set pointer-events
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
    
    // Render single window
    private static RenderWindow(config: WindowConfig): void {
        // Set window size
        if (config.size) {
            ImGui.SetNextWindowSize(new ImGui.ImVec2(config.size.width, config.size.height), ImGui.Cond.FirstUseEver);
        }
        
        // Set window position
        if (config.position) {
            ImGui.SetNextWindowPos(new ImGui.ImVec2(config.position.x, config.position.y), ImGui.Cond.FirstUseEver);
        }
        
        // Start window
        const flags = config.flags || 0;
        let isOpen = config.isOpen;
        if (ImGui.Begin(config.title, (value = isOpen) => config.isOpen = value, flags)) {
            // Execute custom render callback
            if (config.renderCallback) {
                config.renderCallback();
            }
        }
        ImGui.End();
    }
    
    // Create example window
    static CreateExampleWindow(): void {
        
        const windowId = "example_window";
        
        this.windows.set(windowId, {
            title: "example_window",
            isOpen: true,
            size: { width: 400, height: 300 },
            position: { x: 50, y: 50 },
            renderCallback: () => {
                ImGui.Text("this is a  example_window 测试中文");
                ImGui.Separator();
                
                if (ImGui.Button("click me")) {
                    console.log("button click");
                }
                
                ImGui.Text("you can add more sub here");
                
                // Slider example
                ImGui.SliderFloat("value", (value = this.sliderValue) => this.sliderValue = value, 0.0, 1.0);
                
                // Checkbox example
                ImGui.Checkbox("value", (value = this.checkboxValue) => this.checkboxValue = value);
                
                ImGui.Separator();
                ImGui.TextColored(new ImGui.ImVec4(0.5, 0.8, 1.0, 1.0), "hint：");
                ImGui.TextWrapped("when mouse not here the mouse can click other ui。");
                ImGui.TextWrapped("you can drag window to tests");
            }
        });
    }
    
    // Create text window
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
    
    // Create input window
    static CreateInputWindow(id: string, title: string, onSubmit: (text: string) => void): void {
        let inputText = "";
        
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 300, height: 150 },
            renderCallback: () => {
                ImGui.InputText("Input", (value = inputText) => inputText = value);
                
                if (ImGui.Button("OK")) {
                    onSubmit(inputText);
                    this.CloseWindow(id);
                }
                
                ImGui.SameLine();
                
                if (ImGui.Button("Cancel")) {
                    this.CloseWindow(id);
                }
            }
        });
    }
    
    // Create confirm dialog
    static CreateConfirmDialog(id: string, title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
        this.windows.set(id, {
            title: title,
            isOpen: true,
            size: { width: 300, height: 120 },
            flags: ImGui.WindowFlags.NoResize | ImGui.WindowFlags.NoCollapse,
            renderCallback: () => {
                ImGui.Text(message);
                ImGui.Separator();
                
                if (ImGui.Button("OK")) {
                    onConfirm();
                    this.CloseWindow(id);
                }
                
                ImGui.SameLine();
                
                if (ImGui.Button("Cancel")) {
                    if (onCancel) onCancel();
                    this.CloseWindow(id);
                }
            }
        });
    }
    
    // Create tool window
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
    
    // Create property editor window
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
    
    
    // Close window
    static CloseWindow(id: string): void {
        const window = this.windows.get(id);
        if (window) {
            window.isOpen = false;
        }
    }
    
    // Destroy window
    static DestroyWindow(id: string): void {
        this.windows.delete(id);
    }
    
    // Show/hide window
    static ToggleWindow(id: string): void {
        const window = this.windows.get(id);
        if (window) {
            window.isOpen = !window.isOpen;
        }
    }
    
    // Get window state
    static IsWindowOpen(id: string): boolean {
        const config = this.windows.get(id);
        return config ? config.isOpen : false;
    }
    
    // Font management methods
    /**
     * Load Chinese font for ImGui
     * @param fontPath Path to Chinese TTF font file (e.g., 'Font/NotoSansCJK-Regular.ttf')
     * @param fontSize Font size in pixels (default: 16)
     */
    static async LoadChineseFont(fontPath: string, fontSize: number = 16): Promise<void> {
        if (!this.isInitialized) {
            throw new Error("ImGui must be initialized before loading fonts");
        }
        await ImGuiFontManager.LoadChineseFont(fontPath, fontSize);
    }

    /**
     * Load basic font (ASCII only) for testing
     * @param fontPath Path to font file
     * @param fontSize Font size in pixels (default: 16)
     */
    static async LoadBasicFont(fontPath: string, fontSize: number = 16): Promise<void> {
        if (!this.isInitialized) {
            throw new Error("ImGui must be initialized before loading fonts");
        }
        await ImGuiFontManager.LoadBasicFont(fontPath, fontSize);
    }

    /**
     * Load font with custom character set
     * @param fontPath Path to font file
     * @param fontSize Font size in pixels
     * @param characters String containing characters to include
     */
    static async LoadFontWithCustomChars(fontPath: string, fontSize: number, characters: string): Promise<void> {
        if (!this.isInitialized) {
            throw new Error("ImGui must be initialized before loading fonts");
        }
        await ImGuiFontManager.LoadFontWithCustomChars(fontPath, fontSize, characters);
    }

    /**
     * Initialize with default font only (safest option)
     */
    static InitializeWithDefaultFont(): void {
        ImGuiFontManager.InitializeWithDefaultFont();
    }

    /**
     * Push Chinese font for rendering
     */
    static PushChineseFont(): void {
        ImGuiFontManager.PushChineseFont();
    }

    /**
     * Pop font (restore previous font)
     */
    static PopFont(): void {
        ImGuiFontManager.PopFont();
    }

    /**
     * Check if Chinese font is loaded
     */
    static IsChineseFontLoaded(): boolean {
        return ImGuiFontManager.IsChineseFontLoaded();
    }

    // Destroy ImGui
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

// Initialize hook
Unreal__.GameBegin(async () => {
    try {
        await Imgui_chunchun.Initialize();
        //Imgui_chunchun.CreateExampleWindow();
        
    } catch (error) {
        console.error("ImGui initialization failed:", error);
    }
});

// Update hook
Unreal__.GameUpdate(() => {
    Imgui_chunchun.Render();
});