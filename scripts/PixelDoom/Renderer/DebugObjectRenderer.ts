import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

// Debug box render configuration interface
interface DebugBoxConfig {
    instance: IWorldInstance;
    color: { r: number; g: number; b: number; a: number };
    thickness: number;
    enabled: boolean;
    customLayer?: ILayer; // Optional custom layer for rendering
    hollowMode: boolean; // Whether to render as hollow outline only
    offset: { x: number; y: number }; // Offset for debug box position
}

export class DebugObjectRenderer {
    public static debugBoxes: Map<string, DebugBoxConfig> = new Map();
    private static isInitialized: boolean = false;
    private static currentColor: { r: number; g: number; b: number; a: number } = { r: 1, g: 0, b: 0, a: 1 }; // Default red
    private static currentThickness: number = 2; // Default thickness
    private static currentLayer: string | null = null; // Custom layer for next debug box
    private static currentHollowMode: boolean = true; // Default to hollow mode
    private static currentOffset: { x: number; y: number } = { x: 0, y: 0 }; // Offset for debug box position
    private static boundLayers: Set<ILayer> = new Set(); // Track which layers have event listeners
    public static renderCount: number = 0; // Track render calls - made public for external access
    private static lastRenderTime: number = 0;

    // Initialize the renderer system
    public static initialize(): void {
        if (this.isInitialized) return;

        console.log("[DebugObjectRenderer] 🚀 Starting initialization...");
        console.log("[DebugObjectRenderer] Using manual binding approach since it works");

        this.isInitialized = true;
        console.log("[DebugObjectRenderer] ✅ Initialized");
    }

    // Setup afterdraw events for the first layer (like the successful test)
    private static onBeforeProjectStart(runtime: IRuntime): void {
        console.log("[DebugObjectRenderer] 🎬 onBeforeProjectStart called!");

        // Use layer 0 like in the successful test, but also try Render layer
        const layout = runtime.layout;

        // First, let's list all available layers for debugging
        const allLayers = layout.getAllLayers();
        console.log(`[DebugObjectRenderer] Available layers:`);
        allLayers.forEach((layer, index) => {
            console.log(`  ${index}: "${layer.name || 'unnamed'}" - visible: ${layer.isVisible}`);
        });

        // Try to get the Render layer first, fallback to layer 0
        let targetLayer = layout.getLayer("Render");
        if (!targetLayer) {
            console.log("[DebugObjectRenderer] Render layer not found, using layer 0");
            targetLayer = layout.getLayer(0);
        }

        if (targetLayer) {
            // Use direct addEventListener like in the successful test
            targetLayer.addEventListener("afterdraw", (e: any) => this.onAfterLayerDraw(runtime, e.renderer, targetLayer));
            console.log(`[DebugObjectRenderer] ✅ Successfully attached afterdraw to layer: ${targetLayer.name || 'layer 0'}`);
        } else {
            console.error("[DebugObjectRenderer] ❌ Could not find any layer to attach to!");
        }
    }

    // Handle afterdraw event for the specific layer
    public static onAfterLayerDraw(runtime: IRuntime, renderer: IRenderer, layer: ILayer): void {
        this.renderCount++;
        this.lastRenderTime = Date.now();

        let renderedOnThisLayer = 0;

        // Debug: Log first few render calls
        if (this.renderCount <= 3) {
            console.log(`[DebugObjectRenderer] 🎨 Render call #${this.renderCount} on layer: ${layer.name || 'unnamed'}`);
            console.log(`[DebugObjectRenderer] Total debug boxes to check: ${this.debugBoxes.size}`);
        }

        // Render debug boxes that belong to this specific layer (either custom layer or instance layer)
        this.debugBoxes.forEach((config, key) => {
            if (config.enabled) {
                // Use custom layer if specified, otherwise use instance's layer
                const targetLayer = config.customLayer || config.instance.layer;

                if (targetLayer === layer) {
                    try {
                        this.renderDebugBox(renderer, config);
                        renderedOnThisLayer++;
                    } catch (error: any) {
                        console.error(`[DebugObjectRenderer] Error rendering debug box for ${key}: ${error.message}`);
                    }
                }
            }
        });

        // Debug: Log first few successful renders
        if (this.renderCount <= 3 && renderedOnThisLayer > 0) {
            console.log(`[DebugObjectRenderer] ✅ Successfully rendered ${renderedOnThisLayer} debug boxes on layer: ${layer.name || 'unnamed'}`);
        }

        // Log rendering activity every 60 frames (about once per second at 60fps)
        if (this.renderCount % 60 === 0 && renderedOnThisLayer > 0) {
            console.log(`[DebugObjectRenderer] Rendered ${renderedOnThisLayer} debug boxes on layer: ${layer.name || 'unnamed'}`);
        }
    }

    // Render a single debug box
    private static renderDebugBox(renderer: IRenderer, config: DebugBoxConfig): void {
        const instance = config.instance;
        const { r, g, b, a } = config.color;
        const thickness = config.thickness;
        const hollowMode = config.hollowMode;
        const offset = config.offset;

        try {
            // Check if instance is still valid
            if (!instance) {
                console.warn(`[DebugObjectRenderer] Skipping invalid instance`);
                return;
            }

            // Set color fill mode for drawing lines
            renderer.setColorFillMode();
            renderer.setColorRgba(r, g, b, a);

            // Get instance bounds with offset applied
            const left = instance.x - (instance.width / 2) + offset.x;
            const right = instance.x + (instance.width / 2) + offset.x;
            const top = instance.y - (instance.height / 2) + offset.y;
            const bottom = instance.y + (instance.height / 2) + offset.y;

            // Debug: Log first few renders to verify coordinates
            if (this.renderCount <= 3) {
                console.log(`[DebugObjectRenderer] 🖌️ Drawing ${hollowMode ? 'HOLLOW' : 'FILLED'} box: (${left.toFixed(1)}, ${top.toFixed(1)}) to (${right.toFixed(1)}, ${bottom.toFixed(1)})`);
                console.log(`[DebugObjectRenderer] Color: RGBA(${r}, ${g}, ${b}, ${a}), Thickness: ${thickness}, Offset: (${offset.x}, ${offset.y})`);
            }

            // Set line width
            renderer.pushLineWidth(thickness);

            if (hollowMode) {
                // HOLLOW MODE: Only draw outline
                const rect = new DOMRect(left, top, right - left, bottom - top);
                renderer.lineRect2(rect);
            } else {
                // FILLED MODE: Draw outline + fill + extra lines for visibility

                // Method 1: Use lineRect for outline
                const rect = new DOMRect(left, top, right - left, bottom - top);
                renderer.lineRect2(rect);

                // Method 2: Draw individual thick lines for extra visibility
                for (let i = 0; i < thickness; i++) {
                    const offset = i - thickness / 2; // Center the thickness

                    // Top line
                    renderer.line(left + offset, top + offset, right - offset, top + offset);
                    // Bottom line  
                    renderer.line(left + offset, bottom - offset, right - offset, bottom - offset);
                    // Left line
                    renderer.line(left + offset, top + offset, left + offset, bottom - offset);
                    // Right line
                    renderer.line(right - offset, top + offset, right - offset, bottom - offset);
                }

                // Method 3: Draw a semi-transparent filled rectangle for extra visibility
                renderer.setColorRgba(r, g, b, a * 0.2); // Very transparent fill
                renderer.rect2(left, top, right, bottom);
            }

            // Restore line width
            renderer.popLineWidth();

        } catch (error: any) {
            console.error(`[DebugObjectRenderer] Error in renderDebugBox: ${error.message}`);
        }
    }

    // Main function to render box around instance
    public static RenderBoxtoInstance(instance: IWorldInstance): typeof DebugObjectRenderer {
        const key = this.generateInstanceKey(instance);

        // Get custom layer if specified
        let customLayer: ILayer | undefined = undefined;
        if (this.currentLayer) {
            const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
            if (runtime && runtime.layout) {
                customLayer = runtime.layout.getLayer(this.currentLayer) || undefined;
                if (customLayer) {
                    console.log(`[DebugObjectRenderer] Using custom layer: ${this.currentLayer}`);
                } else {
                    console.warn(`[DebugObjectRenderer] Custom layer "${this.currentLayer}" not found, using instance's layer`);
                }
            }
        }

        const config: DebugBoxConfig = {
            instance: instance,
            color: { ...this.currentColor },
            thickness: this.currentThickness,
            enabled: true,
            customLayer: customLayer,
            hollowMode: this.currentHollowMode,
            offset: { ...this.currentOffset }
        };

        this.debugBoxes.set(key, config);
        console.log(`[DebugObjectRenderer] Added debug box for instance: ${key} at (${instance.x}, ${instance.y}) size: ${instance.width}x${instance.height}`);
        
        // Determine which layer to render on
        const targetLayer = customLayer || instance.layer;
        
        if (customLayer) {
            console.log(`[DebugObjectRenderer] Debug box will render on custom layer: ${customLayer.name || 'unnamed'}`);
        } else {
            console.log(`[DebugObjectRenderer] Debug box will render on instance's own layer: ${instance.layer.name || 'unnamed'}`);
        }
        
        // Automatically bind afterdraw event to the target layer
        this.ensureLayerEventBinding(targetLayer);
        
        // Reset current layer after use
        this.currentLayer = null;
        
        // Reset current offset after use
        this.currentOffset = { x: 0, y: 0 };
        
        return this;
    }

    // Set color for the next debug box
    public static setColor(r: number, g: number, b: number, a: number = 1): typeof DebugObjectRenderer {
        this.currentColor = { r, g, b, a };
        console.log(`[DebugObjectRenderer] Set color to RGBA(${r}, ${g}, ${b}, ${a})`);
        return this;
    }

    // Set color using hex string
    public static setColorHex(hex: string, a: number = 1): typeof DebugObjectRenderer {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            this.currentColor = {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255,
                a: a
            };
            console.log(`[DebugObjectRenderer] Set color from hex ${hex} to RGBA(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b}, ${this.currentColor.a})`);
        }
        return this;
    }

    // Set box thickness
    public static setBoxThickness(thickness: number): typeof DebugObjectRenderer {
        this.currentThickness = Math.max(1, thickness);
        console.log(`[DebugObjectRenderer] Set thickness to ${this.currentThickness}px`);
        return this;
    }

    // Set custom layer for the next debug box
    public static setLayer(layerName: string): typeof DebugObjectRenderer {
        this.currentLayer = layerName;
        console.log(`[DebugObjectRenderer] Set custom layer to: ${layerName}`);
        return this;
    }

    // Set hollow mode (outline only)
    public static setHollow(): typeof DebugObjectRenderer {
        this.currentHollowMode = true;
        console.log(`[DebugObjectRenderer] Set to HOLLOW mode (outline only)`);
        return this;
    }

    // Set filled mode (outline + fill)
    public static setFilled(): typeof DebugObjectRenderer {
        this.currentHollowMode = false;
        console.log(`[DebugObjectRenderer] Set to FILLED mode (outline + fill)`);
        return this;
    }

    // Set offset for the next debug box
    public static setOffset(x: number, y: number): typeof DebugObjectRenderer {
        this.currentOffset = { x, y };
        console.log(`[DebugObjectRenderer] Set offset to (${x}, ${y})`);
        return this;
    }

    // Update/enable continuous rendering for a specific instance
    public static update(instance: IWorldInstance, enable: boolean = true): typeof DebugObjectRenderer {
        const key = this.generateInstanceKey(instance);
        const config = this.debugBoxes.get(key);

        if (config) {
            config.enabled = enable;
            console.log(`[DebugObjectRenderer] ${enable ? 'Enabled' : 'Disabled'} debug box for instance: ${key}`);
        }

        return this;
    }

    // Remove debug box for specific instance
    public static removeDebugBox(instance: IWorldInstance): void {
        const key = this.generateInstanceKey(instance);
        if (this.debugBoxes.delete(key)) {
            console.log(`[DebugObjectRenderer] Removed debug box for instance: ${key}`);
        }
    }

    // Clear all debug boxes
    public static clearAll(): void {
        this.debugBoxes.clear();
        console.log("[DebugObjectRenderer] Cleared all debug boxes");
    }

    // Generate unique key for instance
    private static generateInstanceKey(instance: IWorldInstance): string {
        return `${instance.objectType.name}_${instance.uid}`;
    }

    // Get current debug box count
    public static getDebugBoxCount(): number {
        return this.debugBoxes.size;
    }

    // Check if instance has debug box
    public static hasDebugBox(instance: IWorldInstance): boolean {
        const key = this.generateInstanceKey(instance);
        return this.debugBoxes.has(key);
    }

    // Debug method to check rendering status
    public static getDebugInfo(): any {
        const info = {
            totalDebugBoxes: this.debugBoxes.size,
            enabledDebugBoxes: Array.from(this.debugBoxes.values()).filter(config => config.enabled).length,
            renderCount: this.renderCount,
            lastRenderTime: this.lastRenderTime,
            timeSinceLastRender: Date.now() - this.lastRenderTime,
            isInitialized: this.isInitialized,
            currentColor: this.currentColor,
            currentThickness: this.currentThickness,
            currentOffset: this.currentOffset,
            debugBoxesByLayer: new Map()
        };

        // Group debug boxes by layer
        this.debugBoxes.forEach((config, key) => {
            const layerName = config.instance.layer.name || 'unnamed';
            if (!info.debugBoxesByLayer.has(layerName)) {
                info.debugBoxesByLayer.set(layerName, []);
            }
            info.debugBoxesByLayer.get(layerName).push({
                key,
                enabled: config.enabled,
                position: { x: config.instance.x, y: config.instance.y },
                size: { width: config.instance.width, height: config.instance.height },
                offset: config.offset,
                hollowMode: config.hollowMode
            });
        });

        return info;
    }

    // Force a test render to verify the system is working
    public static testRender(): void {
        console.log("[DebugObjectRenderer] Starting test render...");

        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        if (!runtime) {
            console.error("[DebugObjectRenderer] Runtime not available for test");
            return;
        }

        // Find any object to test with
        const allObjectTypes = Object.keys(runtime.objects);
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const testInstance = instances[0];

                    // Add a bright test debug box
                    this.setColor(1, 0, 1, 1) // Bright magenta
                        .setBoxThickness(5).setLayer("GameContent")
                        .RenderBoxtoInstance(testInstance);

                    console.log(`[DebugObjectRenderer] Added test debug box to ${objectTypeName} at (${testInstance.x}, ${testInstance.y})`);

                    // Log debug info
                    const debugInfo = this.getDebugInfo();
                    console.log("[DebugObjectRenderer] Debug info:", debugInfo);

                    return;
                }
            }
        }

        console.warn("[DebugObjectRenderer] No objects found for test render");
    }

    // Automatically bind afterdraw events to layers that need them
    private static ensureLayerEventBinding(layer: ILayer): void {
        if (this.boundLayers.has(layer)) {
            return; // Already bound
        }

        try {
            const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
            if (!runtime) {
                console.warn("[DebugObjectRenderer] Runtime not available for event binding");
                return;
            }

            layer.addEventListener("afterdraw", (e: any) => {
                this.onAfterLayerDraw(runtime, e.renderer, layer);
            });

            this.boundLayers.add(layer);
            console.log(`[DebugObjectRenderer] ✅ Auto-bound afterdraw event to layer: ${layer.name || 'unnamed'}`);
        } catch (error: any) {
            console.error(`[DebugObjectRenderer] ❌ Failed to bind to layer ${layer.name}: ${error.message}`);
        }
    }
}

// Auto-initialize when module is loaded
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[DebugObjectRenderer] 🔧 Starting initialization...");
    
    DebugObjectRenderer.initialize();
    
    var playerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
    if (playerInstance) {
        DebugObjectRenderer.setColor(1, 0, 1, 1).setOffset(0,-70).setBoxThickness(2).setHollow().setLayer("GameContent").RenderBoxtoInstance(playerInstance)
        console.log("[DebugObjectRenderer] 🎯 Debug box added for player instance with BRIGHT MAGENTA color and HOLLOW mode");
    }
});