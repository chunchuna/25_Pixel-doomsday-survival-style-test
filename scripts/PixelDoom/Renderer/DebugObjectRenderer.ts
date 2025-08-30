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

// Debug line render configuration interface
interface DebugLineConfig {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: { r: number; g: number; b: number; a: number };
    thickness: number;
    enabled: boolean;
    customLayer?: ILayer; // Optional custom layer for rendering
    updateCallback?: () => { startX: number; startY: number; endX: number; endY: number }; // Optional update callback for dynamic positioning
}

// Common color presets for debug rendering
export enum DebugColors {
    RED = "RED",
    GREEN = "GREEN",
    BLUE = "BLUE",
    YELLOW = "YELLOW",
    MAGENTA = "MAGENTA",
    CYAN = "CYAN",
    ORANGE = "ORANGE",
    PURPLE = "PURPLE",
    WHITE = "WHITE",
    GRAY = "GRAY"
}

export class DebugObjectRenderer {
    public static debugBoxes: Map<string, DebugBoxConfig> = new Map();
    public static debugLines: Map<string, DebugLineConfig> = new Map();
    private static isInitialized: boolean = false;
    private static currentColor: { r: number; g: number; b: number; a: number } = { r: 1, g: 0, b: 0, a: 1 }; // Default red
    private static currentThickness: number = 2; // Default thickness
    private static currentLayer: string | null = null; // Custom layer for next debug box
    private static currentHollowMode: boolean = true; // Default to hollow mode
    private static currentOffset: { x: number; y: number } = { x: 0, y: 0 }; // Offset for debug box position
    private static currentUpdateCallback: (() => { startX: number; startY: number; endX: number; endY: number }) | null = null; // Update callback for next line
    private static boundLayers: Set<ILayer> = new Set(); // Track which layers have event listeners
    public static renderCount: number = 0; // Track render calls - made public for external access
    private static lastRenderTime: number = 0;
    private static lineIdCounter: number = 0; // Counter for generating unique line IDs

    // Color preset mapping
    private static colorPresets: Map<DebugColors, { r: number; g: number; b: number }> = new Map([
        [DebugColors.RED, { r: 1, g: 0, b: 0 }],
        [DebugColors.GREEN, { r: 0, g: 1, b: 0 }],
        [DebugColors.BLUE, { r: 0, g: 0, b: 1 }],
        [DebugColors.YELLOW, { r: 1, g: 1, b: 0 }],
        [DebugColors.MAGENTA, { r: 1, g: 0, b: 1 }],
        [DebugColors.CYAN, { r: 0, g: 1, b: 1 }],
        [DebugColors.ORANGE, { r: 1, g: 0.5, b: 0 }],
        [DebugColors.PURPLE, { r: 0.5, g: 0, b: 1 }],
        [DebugColors.WHITE, { r: 1, g: 1, b: 1 }],
        [DebugColors.GRAY, { r: 0.5, g: 0.5, b: 0.5 }]
    ]);

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
            console.log(`[DebugObjectRenderer] Total debug lines to check: ${this.debugLines.size}`);
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

        // Render debug lines that belong to this specific layer
        this.debugLines.forEach((config, key) => {
            if (config.enabled) {
                // Use custom layer if specified, otherwise use default layer (first available)
                const targetLayer = config.customLayer || layer;

                if (targetLayer === layer) {
                    try {
                        this.renderDebugLine(renderer, config);
                        renderedOnThisLayer++;
                    } catch (error: any) {
                        console.error(`[DebugObjectRenderer] Error rendering debug line for ${key}: ${error.message}`);
                    }
                }
            }
        });

        // Debug: Log first few successful renders
        if (this.renderCount <= 3 && renderedOnThisLayer > 0) {

        }

        // Log rendering activity every 60 frames (about once per second at 60fps)
        if (this.renderCount % 60 === 0 && renderedOnThisLayer > 0) {

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
                // console.log(`[DebugObjectRenderer] 🖌️ Drawing ${hollowMode ? 'HOLLOW' : 'FILLED'} box: (${left.toFixed(1)}, ${top.toFixed(1)}) to (${right.toFixed(1)}, ${bottom.toFixed(1)})`);
                // console.log(`[DebugObjectRenderer] Color: RGBA(${r}, ${g}, ${b}, ${a}), Thickness: ${thickness}, Offset: (${offset.x}, ${offset.y})`);
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

    // Render a single debug line
    private static renderDebugLine(renderer: IRenderer, config: DebugLineConfig): void {
        let { startX, startY, endX, endY } = config;
        const { r, g, b, a } = config.color;
        const thickness = config.thickness;

        try {
            // Call update callback if it exists to get dynamic position
            if (config.updateCallback) {
                const newPosition = config.updateCallback();
                startX = newPosition.startX;
                startY = newPosition.startY;
                endX = newPosition.endX;
                endY = newPosition.endY;
            }

            // Set color fill mode for drawing lines
            renderer.setColorFillMode();
            renderer.setColorRgba(r, g, b, a);

            // Debug: Log first few renders to verify coordinates
            if (this.renderCount <= 3) {
                // console.log(`[DebugObjectRenderer] 🖌️ Drawing line: (${startX.toFixed(1)}, ${startY.toFixed(1)}) to (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
                // console.log(`[DebugObjectRenderer] Color: RGBA(${r}, ${g}, ${b}, ${a}), Thickness: ${thickness}`);
            }

            // Set line width
            renderer.pushLineWidth(thickness);

            // Draw the line
            renderer.line(startX, startY, endX, endY);

            // Restore line width
            renderer.popLineWidth();

        } catch (error: any) {
            console.error(`[DebugObjectRenderer] Error in renderDebugLine: ${error.message}`);
        }
    }

    // Main function to render box around instance
    public static RenderBoxtoInstance(instance: IWorldInstance): string {
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

        return key; // Return the key for later reference
    }

    // Main function to render a custom line
    public static RenderLine(startX: number, startY: number, endX: number, endY: number): string {
        this.lineIdCounter++;
        const key = `line_${this.lineIdCounter}`;

        // Get custom layer if specified
        let customLayer: ILayer | undefined = undefined;
        if (this.currentLayer) {
            const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
            if (runtime && runtime.layout) {
                customLayer = runtime.layout.getLayer(this.currentLayer) || undefined;
                if (customLayer) {
                    console.log(`[DebugObjectRenderer] Using custom layer: ${this.currentLayer}`);
                } else {
                    console.warn(`[DebugObjectRenderer] Custom layer "${this.currentLayer}" not found, using default layer`);
                }
            }
        }

        // If no custom layer specified, try to get a default layer
        if (!customLayer) {
            const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
            if (runtime && runtime.layout) {
                const gameContentLayer = runtime.layout.getLayer("GameContent");
                const layer0 = runtime.layout.getLayer(0);
                customLayer = (gameContentLayer || layer0) as ILayer | undefined;
            }
        }

        const config: DebugLineConfig = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            color: { ...this.currentColor },
            thickness: this.currentThickness,
            enabled: true,
            customLayer: customLayer,
            updateCallback: this.currentUpdateCallback || undefined
        };

        this.debugLines.set(key, config);
        console.log(`[DebugObjectRenderer] Added debug line: ${key} from (${startX}, ${startY}) to (${endX}, ${endY})`);

        if (this.currentUpdateCallback) {
            console.log(`[DebugObjectRenderer] Line ${key} will update dynamically using callback`);
        }

        // Automatically bind afterdraw event to the target layer
        if (customLayer) {
            console.log(`[DebugObjectRenderer] Debug line will render on layer: ${customLayer.name || 'unnamed'}`);
            this.ensureLayerEventBinding(customLayer);
        }

        // Reset current layer after use
        this.currentLayer = null;

        // Reset current update callback after use
        this.currentUpdateCallback = null;

        return key; // Return the key for later reference
    }

    // Simplified function to render line between two instances with auto-update
    public static RenderLineBetweenInstances(fromInstance: IWorldInstance, toInstance: IWorldInstance): string {
        this.lineIdCounter++;
        const key = `line_${this.lineIdCounter}`;

        // Get custom layer if specified, otherwise use fromInstance's layer
        let customLayer: ILayer | undefined = undefined;
        if (this.currentLayer) {
            const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
            if (runtime && runtime.layout) {
                customLayer = runtime.layout.getLayer(this.currentLayer) || undefined;
                if (customLayer) {
                    console.log(`[DebugObjectRenderer] Using custom layer: ${this.currentLayer}`);
                } else {
                    console.warn(`[DebugObjectRenderer] Custom layer "${this.currentLayer}" not found, using fromInstance's layer`);
                }
            }
        }

        // If no custom layer specified, use fromInstance's layer
        if (!customLayer) {
            customLayer = fromInstance.layer;
        }

        const config: DebugLineConfig = {
            startX: fromInstance.x,
            startY: fromInstance.y,
            endX: toInstance.x,
            endY: toInstance.y,
            color: { ...this.currentColor },
            thickness: this.currentThickness,
            enabled: true,
            customLayer: customLayer,
            updateCallback: () => {
                if (fromInstance && toInstance) {
                    return {
                        startX: fromInstance.x,
                        startY: fromInstance.y,
                        endX: toInstance.x,
                        endY: toInstance.y
                    };
                }
                return { startX: 0, startY: 0, endX: 0, endY: 0 };
            }
        };

        this.debugLines.set(key, config);
        console.log(`[DebugObjectRenderer] Added auto-updating line: ${key} between ${this.generateInstanceKey(fromInstance)} and ${this.generateInstanceKey(toInstance)}`);

        // Automatically bind afterdraw event to the target layer
        this.ensureLayerEventBinding(customLayer);

        // Reset current layer after use
        this.currentLayer = null;

        return key; // Return the key for later reference
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

    // Set color using preset enumeration
    public static setColorPreset(colorPreset: DebugColors, a: number = 1): typeof DebugObjectRenderer {
        const preset = this.colorPresets.get(colorPreset);
        if (preset) {
            this.currentColor = {
                r: preset.r,
                g: preset.g,
                b: preset.b,
                a: a
            };
            console.log(`[DebugObjectRenderer] Set color to ${colorPreset} preset: RGBA(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b}, ${this.currentColor.a})`);
        } else {
            console.warn(`[DebugObjectRenderer] Unknown color preset: ${colorPreset}, using current color`);
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

    // Set update callback for the next debug line (for dynamic positioning)
    public static setUpdateCallback(callback: () => { startX: number; startY: number; endX: number; endY: number }): typeof DebugObjectRenderer {
        this.currentUpdateCallback = callback;
        console.log(`[DebugObjectRenderer] Set update callback for dynamic line positioning`);
        return this;
    }

    // Update specific line position directly
    public static updateLinePosition(lineKey: string, startX: number, startY: number, endX: number, endY: number): void {
        const config = this.debugLines.get(lineKey);
        if (config) {
            config.startX = startX;
            config.startY = startY;
            config.endX = endX;
            config.endY = endY;
            console.log(`[DebugObjectRenderer] Updated line position: ${lineKey} from (${startX}, ${startY}) to (${endX}, ${endY})`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug line not found for position update: ${lineKey}`);
        }
    }

    // Set update callback for existing line
    public static setLineUpdateCallback(lineKey: string, callback: () => { startX: number; startY: number; endX: number; endY: number }): void {
        const config = this.debugLines.get(lineKey);
        if (config) {
            config.updateCallback = callback;
            console.log(`[DebugObjectRenderer] Set update callback for existing line: ${lineKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug line not found for callback update: ${lineKey}`);
        }
    }

    // Remove update callback from existing line (make it static)
    public static removeLineUpdateCallback(lineKey: string): void {
        const config = this.debugLines.get(lineKey);
        if (config) {
            config.updateCallback = undefined;
            console.log(`[DebugObjectRenderer] Removed update callback from line: ${lineKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug line not found for callback removal: ${lineKey}`);
        }
    }

    // Update/enable continuous rendering for a specific debug box by key
    public static update(debugBoxKey: string, enable: boolean = true): void {
        const config = this.debugBoxes.get(debugBoxKey);
        if (config) {
            config.enabled = enable;
            console.log(`[DebugObjectRenderer] ${enable ? 'Enabled' : 'Disabled'} debug box: ${debugBoxKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug box not found for update: ${debugBoxKey}`);
        }
    }

    // Legacy update method for instances (for backward compatibility)
    public static updateByInstance(instance: IWorldInstance, enable: boolean = true): void {
        const key = this.generateInstanceKey(instance);
        this.update(key, enable);
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
        this.debugLines.clear();
        console.log("[DebugObjectRenderer] Cleared all debug boxes and lines");
    }

    // Generate unique key for instance
    private static generateInstanceKey(instance: IWorldInstance): string {
        return `${instance.objectType.name}_${instance.uid}`;
    }

    // Get current debug box count
    public static getDebugBoxCount(): number {
        return this.debugBoxes.size;
    }

    // Get current debug line count
    public static getDebugLineCount(): number {
        return this.debugLines.size;
    }

    // Get total debug object count (boxes + lines)
    public static getTotalDebugObjectCount(): number {
        return this.debugBoxes.size + this.debugLines.size;
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
            totalDebugLines: this.debugLines.size,
            enabledDebugBoxes: Array.from(this.debugBoxes.values()).filter(config => config.enabled).length,
            enabledDebugLines: Array.from(this.debugLines.values()).filter(config => config.enabled).length,
            renderCount: this.renderCount,
            lastRenderTime: this.lastRenderTime,
            timeSinceLastRender: Date.now() - this.lastRenderTime,
            isInitialized: this.isInitialized,
            currentColor: this.currentColor,
            currentThickness: this.currentThickness,
            currentOffset: this.currentOffset,
            debugBoxesByLayer: new Map(),
            debugLinesByLayer: new Map()
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

        // Group debug lines by layer
        this.debugLines.forEach((config, key) => {
            const layerName = config.customLayer?.name || 'default';
            if (!info.debugLinesByLayer.has(layerName)) {
                info.debugLinesByLayer.set(layerName, []);
            }
            info.debugLinesByLayer.get(layerName).push({
                key,
                enabled: config.enabled,
                startPoint: { x: config.startX, y: config.startY },
                endPoint: { x: config.endX, y: config.endY },
                color: config.color,
                thickness: config.thickness
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

    // Close/disable a specific debug box by its key
    public static Close(debugBoxKey: string): void {
        const config = this.debugBoxes.get(debugBoxKey);
        if (config) {
            config.enabled = false;
            console.log(`[DebugObjectRenderer] ✅ Closed debug box: ${debugBoxKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug box not found: ${debugBoxKey}`);
        }
    }

    // Permanently remove a debug box by its key
    public static Remove(debugBoxKey: string): void {
        if (this.debugBoxes.delete(debugBoxKey)) {
            console.log(`[DebugObjectRenderer] ✅ Removed debug box: ${debugBoxKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug box not found: ${debugBoxKey}`);
        }
    }

    // Reopen/enable a specific debug box by its key
    public static Open(debugBoxKey: string): void {
        const config = this.debugBoxes.get(debugBoxKey);
        if (config) {
            config.enabled = true;
            console.log(`[DebugObjectRenderer] ✅ Opened debug box: ${debugBoxKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug box not found: ${debugBoxKey}`);
        }
    }

    // Remove debug line by key
    public static removeDebugLine(lineKey: string): void {
        if (this.debugLines.delete(lineKey)) {
            console.log(`[DebugObjectRenderer] Removed debug line: ${lineKey}`);
        }
    }

    // Update debug line enable/disable state
    public static updateLine(lineKey: string, enable: boolean = true): void {
        const config = this.debugLines.get(lineKey);
        if (config) {
            config.enabled = enable;
            console.log(`[DebugObjectRenderer] ${enable ? 'Enabled' : 'Disabled'} debug line: ${lineKey}`);
        } else {
            console.warn(`[DebugObjectRenderer] ⚠️ Debug line not found for update: ${lineKey}`);
        }
    }

    // Clear all debug lines only
    public static clearAllLines(): void {
        this.debugLines.clear();
        console.log("[DebugObjectRenderer] Cleared all debug lines");
    }

    // Draw debug boxes for all instances of a given object type or from a single instance
    public static DrawBoxesForAllInstances(instanceOrObjectType: IWorldInstance | any): string[] {
        const keys: string[] = [];

        try {
            // Preserve current settings before the loop
            const savedColor = { ...this.currentColor };
            const savedThickness = this.currentThickness;
            const savedLayer = this.currentLayer;
            const savedHollowMode = this.currentHollowMode;
            const savedOffset = { ...this.currentOffset };

            let objectType: any;
            let instances: IWorldInstance[];

            // Check if input is an instance or object type
            if (instanceOrObjectType && 'objectType' in instanceOrObjectType) {
                // It's an instance, get its object type
                objectType = instanceOrObjectType.objectType;
                instances = Array.from(objectType.instances());
                console.log(`[DebugObjectRenderer] Drawing boxes for all instances of ${objectType.name} (detected from instance)`);
            } else {
                // It's an object type
                objectType = instanceOrObjectType;
                instances = Array.from(objectType.instances());
                console.log(`[DebugObjectRenderer] Drawing boxes for all instances of ${objectType.name} (direct object type)`);
            }

            // Draw box for each instance
            instances.forEach((instance: IWorldInstance, index: number) => {
                // Restore settings before each call since RenderBoxtoInstance resets them
                this.currentColor = { ...savedColor };
                this.currentThickness = savedThickness;
                this.currentLayer = savedLayer;
                this.currentHollowMode = savedHollowMode;
                this.currentOffset = { ...savedOffset };

                const key = this.RenderBoxtoInstance(instance);
                keys.push(key);
                console.log(`[DebugObjectRenderer] Drew box ${index + 1}/${instances.length} for ${objectType.name} instance at (${instance.x.toFixed(1)}, ${instance.y.toFixed(1)})`);
            });

            console.log(`[DebugObjectRenderer] ✅ Successfully drew ${instances.length} debug boxes for ${objectType.name}`);

        } catch (error: any) {
            console.error(`[DebugObjectRenderer] ❌ Error in DrawBoxesForAllInstances: ${error.message}`);
        }

        return keys; // Return all keys for later reference
    }

    // Draw lines connecting all instances of a given type to the player instance
    public static DrawLineConenctPlayerForAllInstacne(playerInstance: IWorldInstance, otherInstanceOrObjectType: IWorldInstance | any): string[] {
        const keys: string[] = [];

        try {
            // Preserve current settings before the loop
            const savedColor = { ...this.currentColor };
            const savedThickness = this.currentThickness;
            const savedLayer = this.currentLayer;
            const savedUpdateCallback = this.currentUpdateCallback;

            let objectType: any;
            let instances: IWorldInstance[];

            // Check if input is an instance or object type
            if (otherInstanceOrObjectType && 'objectType' in otherInstanceOrObjectType) {
                // It's an instance, get its object type
                objectType = otherInstanceOrObjectType.objectType;
                instances = Array.from(objectType.instances());
                //console.log(`[DebugObjectRenderer] Drawing lines from all instances of ${objectType.name} to player (detected from instance)`);
            } else {
                // It's an object type
                objectType = otherInstanceOrObjectType;
                instances = Array.from(objectType.instances());
                //console.log(`[DebugObjectRenderer] Drawing lines from all instances of ${objectType.name} to player (direct object type)`);
            }

            // Draw line from each instance to player
            instances.forEach((instance: IWorldInstance, index: number) => {
                // Restore settings before each call since RenderLineBetweenInstances resets them
                this.currentColor = { ...savedColor };
                this.currentThickness = savedThickness;
                this.currentLayer = savedLayer;
                this.currentUpdateCallback = savedUpdateCallback;

                const key = this.RenderLineBetweenInstances(playerInstance, instance);
                keys.push(key);
                console.log(`[DebugObjectRenderer] Drew line ${index + 1}/${instances.length} from ${objectType.name} instance at (${instance.x.toFixed(1)}, ${instance.y.toFixed(1)}) to player at (${playerInstance.x.toFixed(1)}, ${playerInstance.y.toFixed(1)})`);
            });

            console.log(`[DebugObjectRenderer] ✅ Successfully drew ${instances.length} lines connecting ${objectType.name} instances to player`);

        } catch (error: any) {
            console.error(`[DebugObjectRenderer] ❌ Error in DrawLineConenctPlayerForAllInstacne: ${error.message}`);
        }

        return keys; // Return all keys for later reference
    }
}



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_layout_end(() => {

    DebugObjectRenderer.clearAll();

})

// Auto-initialize when module is loaded
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    
    DebugObjectRenderer.initialize();

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_getlayoutname() !== "Level") return

    var playerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
    if (playerInstance) {
        var playerBox = DebugObjectRenderer.setColor(1, 0, 1, 1).setOffset(0, -70).setBoxThickness(2).setHollow().setLayer("GameContent").RenderBoxtoInstance(playerInstance);
    }

    var ClickObject = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.ClickObjectEntity;
    ///var GouHuoBox = DebugObjectRenderer.setColorPreset(DebugColors.GREEN).setBoxThickness(2).setLayer("GameContent").DrawBoxesForAllInstances(ClickObject);
    if (playerInstance) {
        var ObjectLine = DebugObjectRenderer.setColorPreset(DebugColors.ORANGE).setBoxThickness(2).DrawLineConenctPlayerForAllInstacne(playerInstance, ClickObject)
    }

    var NPCObject = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.NPC;
    if (playerInstance) {
        var NPCBox = DebugObjectRenderer.setBoxThickness(2).setColorPreset(DebugColors.PURPLE).DrawBoxesForAllInstances(NPCObject)
        var ObjectLine = DebugObjectRenderer.setColorPreset(DebugColors.ORANGE).setBoxThickness(2).DrawLineConenctPlayerForAllInstacne(playerInstance, NPCObject)
    }

    
    





});

// Usage Examples:

// Example 1: Using color presets for all GouHuo instances
// Method A: Pass a single GouHuo instance, function auto-detects type and iterates all instances of same type
// const gouhuoInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo.getFirstInstance();
// const boxKeys = DebugObjectRenderer.setColorPreset(DebugColors.RED).DrawBoxesForAllInstances(gouhuoInstance);

// Method B: Pass object type directly
// const boxKeys2 = DebugObjectRenderer.setColorPreset(DebugColors.GREEN).DrawBoxesForAllInstances(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo);

// Example 2: Connect all GouHuo instances to player with different colors
// const playerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
// const lineKeys = DebugObjectRenderer.setColorPreset(DebugColors.BLUE).DrawLineConenctPlayerForAllInstacne(playerInstance, pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo);

// Example 3: Mix different color methods
// DebugObjectRenderer.setColorPreset(DebugColors.YELLOW, 0.8).setBoxThickness(3).setLayer("GameContent").RenderBoxtoInstance(someInstance);
// DebugObjectRenderer.setColor(1, 0, 0, 1).RenderBoxtoInstance(anotherInstance); // Custom RGB
// DebugObjectRenderer.setColorHex("#FF5500", 0.9).RenderBoxtoInstance(thirdInstance); // Hex color

// Available color presets:
// DebugColors.RED, DebugColors.GREEN, DebugColors.BLUE, DebugColors.YELLOW, DebugColors.MAGENTA
// DebugColors.CYAN, DebugColors.ORANGE, DebugColors.PURPLE, DebugColors.WHITE, DebugColors.GRAY
