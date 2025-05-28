import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

// Debug box render configuration interface
interface DebugBoxConfig {
    instance: IWorldInstance;
    color: { r: number; g: number; b: number; a: number };
    thickness: number;
    enabled: boolean;
}

export class DebugObjectRenderer {
    private static debugBoxes: Map<string, DebugBoxConfig> = new Map();
    private static isInitialized: boolean = false;
    private static currentColor: { r: number; g: number; b: number; a: number } = { r: 1, g: 0, b: 0, a: 1 }; // Default red
    private static currentThickness: number = 2; // Default thickness
    private static renderCount: number = 0; // Track render calls
    private static lastRenderTime: number = 0;

    // Initialize the renderer system
    public static initialize(): void {
        if (this.isInitialized) return;

        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener("beforeprojectstart", () => this.onBeforeProjectStart(runtime));
        });

        this.isInitialized = true;
        console.log("[DebugObjectRenderer] Initialized");
    }

    // Setup layer drawing events
    private static onBeforeProjectStart(runtime: IRuntime): void {
        // Get all layers and attach afterdraw events
        const layout = runtime.layout;
        const layers = layout.getAllLayers();
        
        layers.forEach((layer, index) => {
            layer.addEventListener("afterdraw", (e) => this.onAfterLayerDraw(runtime, e.renderer, layer));
            console.log(`[DebugObjectRenderer] Attached afterdraw to layer ${index}: ${layer.name || 'unnamed'}`);
        });
        
        console.log(`[DebugObjectRenderer] Attached to ${layers.length} layers`);
    }

    // Handle afterdraw event for each layer
    private static onAfterLayerDraw(runtime: IRuntime, renderer: IRenderer, layer: ILayer): void {
        this.renderCount++;
        this.lastRenderTime = Date.now();
        
        let renderedOnThisLayer = 0;
        
        // Only render debug boxes that are on this layer
        this.debugBoxes.forEach((config, key) => {
            if (config.enabled && config.instance.layer === layer) {
                try {
                    this.renderDebugBox(renderer, config);
                    renderedOnThisLayer++;
                } catch (error: any) {
                    console.error(`[DebugObjectRenderer] Error rendering debug box for ${key}: ${error.message}`);
                }
            }
        });
        
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

        try {
            // Check if instance is still valid
            if (!instance) {
                console.warn(`[DebugObjectRenderer] Skipping invalid instance`);
                return;
            }

            // Set color fill mode for drawing lines
            renderer.setColorFillMode();
            renderer.setColorRgba(r, g, b, a);

            // Get instance bounds
            const left = instance.x - (instance.width / 2);
            const right = instance.x + (instance.width / 2);
            const top = instance.y - (instance.height / 2);
            const bottom = instance.y + (instance.height / 2);

            // Debug: Log first few renders to verify coordinates
            if (this.renderCount < 5) {
                console.log(`[DebugObjectRenderer] Rendering box at (${left}, ${top}) to (${right}, ${bottom}) with color RGBA(${r}, ${g}, ${b}, ${a})`);
            }

            // Draw box outline using lines with thickness
            // We draw multiple lines to simulate thickness
            for (let i = 0; i < thickness; i++) {
                const offset = i * 0.5; // Offset for thickness
                
                // Top line
                renderer.line(left - offset, top - offset, right + offset, top - offset);
                // Bottom line
                renderer.line(left - offset, bottom + offset, right + offset, bottom + offset);
                // Left line
                renderer.line(left - offset, top - offset, left - offset, bottom + offset);
                // Right line
                renderer.line(right + offset, top - offset, right + offset, bottom + offset);
            }

            // Alternative: Try using rect method as well for better visibility
            if (thickness >= 3) {
                // Draw a semi-transparent filled rectangle for thicker lines
                renderer.setColorRgba(r, g, b, a * 0.3); // More transparent fill
                renderer.rect2(left, top, right, bottom);
                
                // Reset color for outline
                renderer.setColorRgba(r, g, b, a);
            }

        } catch (error: any) {
            console.error(`[DebugObjectRenderer] Error in renderDebugBox: ${error.message}`);
        }
    }

    // Main function to render box around instance
    public static RenderBoxtoInstance(instance: IWorldInstance): typeof DebugObjectRenderer {
        const key = this.generateInstanceKey(instance);
        
        const config: DebugBoxConfig = {
            instance: instance,
            color: { ...this.currentColor },
            thickness: this.currentThickness,
            enabled: true
        };

        this.debugBoxes.set(key, config);
        console.log(`[DebugObjectRenderer] Added debug box for instance: ${key} at (${instance.x}, ${instance.y}) size: ${instance.width}x${instance.height} on layer: ${instance.layer.name || 'unnamed'}`);
        
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
                size: { width: config.instance.width, height: config.instance.height }
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
                        .setBoxThickness(5)
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
}

// Auto-initialize when module is loaded
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    DebugObjectRenderer.initialize();
});