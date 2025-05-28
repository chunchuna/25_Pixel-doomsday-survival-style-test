import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { IMGUIDebugButton } from "../UI/debug_ui/UIDbugButton.js";
import { DebugObjectRenderer } from "./DebugObjectRenderer.js";

/**
 * IMGUI Debug Interface for DebugObjectRenderer
 * 为DebugObjectRenderer提供IMGUI调试界面
 */
export class DebugObjectRendererIMGUI {
    private static isInitialized: boolean = false;
    private static debugCategory: string = "";
    
    // Current debug settings
    private static currentColor = { r: 1, g: 0, b: 0, a: 1 }; // Default red
    private static currentThickness = 2;
    private static selectedObjectType = "";
    private static availableObjectTypes: string[] = [];

    /**
     * Initialize the IMGUI debug interface
     */
    public static initialize(): void {
        if (this.isInitialized) return;
        this.isInitialized = true;

        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
            this.setupDebugButtons();
            this.updateAvailableObjectTypes();
        });
    }

    /**
     * Setup debug buttons in IMGUI panel
     */
    private static setupDebugButtons(): void {
        // Create debug category for renderer
        this.debugCategory = IMGUIDebugButton.AddCategory("Debug Renderer");

        // === Basic Operations ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🎯 Debug Player", () => {
            this.debugPlayerObject();
        }, "Add debug box to player character");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🔍 Debug All Visible Objects", () => {
            this.debugAllVisibleObjects();
        }, "Add debug boxes to all visible objects on screen");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📍 Debug Objects Near Player", () => {
            this.debugObjectsNearPlayer();
        }, "Add debug boxes to objects near player position");

        // === Color Presets ===
        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🔴 Set Red Color", [1.0, 0.0, 0.0, 1.0], () => {
            this.setDebugColor(1, 0, 0, 1);
        }, "Set debug box color to red");

        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🟢 Set Green Color", [0.0, 1.0, 0.0, 1.0], () => {
            this.setDebugColor(0, 1, 0, 1);
        }, "Set debug box color to green");

        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🔵 Set Blue Color", [0.0, 0.0, 1.0, 1.0], () => {
            this.setDebugColor(0, 0, 1, 1);
        }, "Set debug box color to blue");

        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🟡 Set Yellow Color", [1.0, 1.0, 0.0, 1.0], () => {
            this.setDebugColor(1, 1, 0, 1);
        }, "Set debug box color to yellow");

        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🟣 Set Purple Color", [1.0, 0.0, 1.0, 1.0], () => {
            this.setDebugColor(1, 0, 1, 1);
        }, "Set debug box color to purple");

        // === Thickness Settings ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📏 Thickness: 1px", () => {
            this.setDebugThickness(1);
        }, "Set debug box thickness to 1 pixel");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📏 Thickness: 3px", () => {
            this.setDebugThickness(3);
        }, "Set debug box thickness to 3 pixels");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📏 Thickness: 5px", () => {
            this.setDebugThickness(5);
        }, "Set debug box thickness to 5 pixels");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📏 Thickness: 10px", () => {
            this.setDebugThickness(10);
        }, "Set debug box thickness to 10 pixels");

        // === Object Type Specific ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🎮 Debug Clickable Objects", () => {
            this.debugClickableObjects();
        }, "Add debug boxes to all clickable/interactive objects");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🖼️ Debug UI Elements", () => {
            this.debugUIElements();
        }, "Add debug boxes to UI elements");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🏠 Debug Static Objects", () => {
            this.debugStaticObjects();
        }, "Add debug boxes to static/background objects");

        // === Advanced Features ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🌈 Rainbow Debug Mode", () => {
            this.rainbowDebugMode();
        }, "Add colorful debug boxes to different object types");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📊 Show Debug Stats", () => {
            this.showDebugStats();
        }, "Display current debug box statistics");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🔄 Refresh Object List", () => {
            this.updateAvailableObjectTypes();
        }, "Update the list of available object types");

        // === Management ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "⏸️ Toggle All Debug Boxes", () => {
            this.toggleAllDebugBoxes();
        }, "Enable/disable all debug boxes");

        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🗑️ Clear All Debug Boxes", [1.0, 0.3, 0.3, 1.0], () => {
            this.clearAllDebugBoxes();
        }, "Remove all debug boxes");

        // === Diagnostics ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🔧 Test Render System", () => {
            this.testRenderSystem();
        }, "Test if the rendering system is working");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📋 Show Detailed Debug Info", () => {
            this.showDetailedDebugInfo();
        }, "Show comprehensive debug information");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🎯 Test Single Object", () => {
            this.testSingleObject();
        }, "Add a bright test box to one object");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🔍 Check Layer Info", () => {
            this.checkLayerInfo();
        }, "Display information about all layers");

        // === Quick Tests ===
        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "⚡ Quick Test - Random Objects", () => {
            this.quickTestRandomObjects();
        }, "Add debug boxes to 5 random objects for testing");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🎯 Quick Test - Mouse Position", () => {
            this.quickTestMousePosition();
        }, "Add debug boxes to objects near mouse cursor");

        // === Enhanced Diagnostics for Rendering Issues ===
        IMGUIDebugButton.AddColorButtonToCategory(this.debugCategory, "🚨 EMERGENCY RENDER TEST", [1.0, 0.0, 1.0, 1.0], () => {
            this.emergencyRenderTest();
        }, "Emergency test with maximum visibility settings");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🎯 Force Render Player", () => {
            this.forceRenderPlayer();
        }, "Force render player with extreme visibility settings");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "📐 Check Render Coordinates", () => {
            this.checkRenderCoordinates();
        }, "Check if coordinates are within viewport");

        IMGUIDebugButton.AddButtonToCategory(this.debugCategory, "🔍 Viewport Debug", () => {
            this.viewportDebug();
        }, "Debug viewport and camera settings");

        console.log("[DebugObjectRendererIMGUI] Debug buttons initialized");
    }

    /**
     * Debug player object
     */
    private static debugPlayerObject(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const playerObjectNames = ['Player', 'Character', 'PIXPlayer', 'MainCharacter', 'RedHairGirlSprite'];
        
        let playerFound = false;
        for (const objectName of playerObjectNames) {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const player = instances[0];
                    
                    DebugObjectRenderer
                        .setColor(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.currentColor.a)
                        .setBoxThickness(this.currentThickness)
                        .RenderBoxtoInstance(player);
                    
                    console.log(`[DebugRendererIMGUI] Added debug box to player: ${objectName}`);
                    playerFound = true;
                    break;
                }
            }
        }
        
        if (!playerFound) {
            console.warn("[DebugRendererIMGUI] No player object found");
        }
    }

    /**
     * Debug all visible objects on screen
     */
    private static debugAllVisibleObjects(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const layout = runtime.layout;
        const viewportLeft = layout.scrollX;
        const viewportRight = layout.scrollX + runtime.viewportWidth;
        const viewportTop = layout.scrollY;
        const viewportBottom = layout.scrollY + runtime.viewportHeight;
        
        let debuggedCount = 0;
        const allObjectTypes = Object.keys(runtime.objects);
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    // Check if object is visible on screen
                    if (instance.x >= viewportLeft && instance.x <= viewportRight &&
                        instance.y >= viewportTop && instance.y <= viewportBottom) {
                        
                        DebugObjectRenderer
                            .setColor(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.currentColor.a)
                            .setBoxThickness(this.currentThickness)
                            .RenderBoxtoInstance(instance);
                        debuggedCount++;
                    }
                });
            }
        }
        
        console.log(`[DebugRendererIMGUI] Added debug boxes to ${debuggedCount} visible objects`);
    }

    /**
     * Debug objects near player
     */
    private static debugObjectsNearPlayer(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const playerObjectNames = ['Player', 'Character', 'PIXPlayer', 'MainCharacter', 'RedHairGirlSprite'];
        
        let playerX = 0, playerY = 0;
        let playerFound = false;
        
        // Find player position
        for (const objectName of playerObjectNames) {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const player = instances[0];
                    playerX = player.x;
                    playerY = player.y;
                    playerFound = true;
                    break;
                }
            }
        }
        
        if (!playerFound) {
            console.warn("[DebugRendererIMGUI] No player found for position reference");
            return;
        }
        
        const radius = 200; // 200 pixel radius
        let debuggedCount = 0;
        const allObjectTypes = Object.keys(runtime.objects);
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    const distance = Math.sqrt(Math.pow(instance.x - playerX, 2) + Math.pow(instance.y - playerY, 2));
                    if (distance <= radius) {
                        DebugObjectRenderer
                            .setColor(this.currentColor.r, this.currentColor.g, this.currentColor.b, this.currentColor.a)
                            .setBoxThickness(this.currentThickness)
                            .RenderBoxtoInstance(instance);
                        debuggedCount++;
                    }
                });
            }
        }
        
        console.log(`[DebugRendererIMGUI] Added debug boxes to ${debuggedCount} objects near player (radius: ${radius}px)`);
    }

    /**
     * Debug clickable objects
     */
    private static debugClickableObjects(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const clickableObjectNames = ['ClickObject', 'Item', 'InteractiveObject', 'Button', 'PIXClickObject'];
        
        let debuggedCount = 0;
        clickableObjectNames.forEach((objectName) => {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    DebugObjectRenderer
                        .setColor(1, 1, 0, 0.8) // Yellow for clickable objects
                        .setBoxThickness(this.currentThickness)
                        .RenderBoxtoInstance(instance);
                    debuggedCount++;
                });
            }
        });
        
        console.log(`[DebugRendererIMGUI] Added debug boxes to ${debuggedCount} clickable objects`);
    }

    /**
     * Debug UI elements
     */
    private static debugUIElements(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const uiObjectNames = ['UIButton', 'UIPanel', 'UIText', 'HTML_c3', 'hudongtishi_ui'];
        
        let debuggedCount = 0;
        uiObjectNames.forEach((objectName) => {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    DebugObjectRenderer
                        .setColor(0, 0.5, 1, 0.6) // Blue for UI elements
                        .setBoxThickness(1)
                        .RenderBoxtoInstance(instance);
                    debuggedCount++;
                });
            }
        });
        
        console.log(`[DebugRendererIMGUI] Added debug boxes to ${debuggedCount} UI elements`);
    }

    /**
     * Debug static objects
     */
    private static debugStaticObjects(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const staticObjectNames = ['Sprite', 'TiledBackground', 'Background', 'StaticObject'];
        
        let debuggedCount = 0;
        staticObjectNames.forEach((objectName) => {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance, index: number) => {
                    if (index < 10) { // Limit to first 10 to avoid performance issues
                        DebugObjectRenderer
                            .setColor(0.5, 0.5, 0.5, 0.5) // Gray for static objects
                            .setBoxThickness(1)
                            .RenderBoxtoInstance(instance);
                        debuggedCount++;
                    }
                });
            }
        });
        
        console.log(`[DebugRendererIMGUI] Added debug boxes to ${debuggedCount} static objects`);
    }

    /**
     * Rainbow debug mode - different colors for different object types
     */
    private static rainbowDebugMode(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const colors = [
            { r: 1, g: 0, b: 0, a: 0.8 },    // Red
            { r: 0, g: 1, b: 0, a: 0.8 },    // Green
            { r: 0, g: 0, b: 1, a: 0.8 },    // Blue
            { r: 1, g: 1, b: 0, a: 0.8 },    // Yellow
            { r: 1, g: 0, b: 1, a: 0.8 },    // Magenta
            { r: 0, g: 1, b: 1, a: 0.8 },    // Cyan
            { r: 1, g: 0.5, b: 0, a: 0.8 },  // Orange
            { r: 0.5, g: 0, b: 1, a: 0.8 },  // Purple
        ];
        
        let debuggedCount = 0;
        let colorIndex = 0;
        const allObjectTypes = Object.keys(runtime.objects);
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const color = colors[colorIndex % colors.length];
                    
                    instances.forEach((instance: IWorldInstance, index: number) => {
                        if (index < 3) { // Limit to first 3 instances per type
                            DebugObjectRenderer
                                .setColor(color.r, color.g, color.b, color.a)
                                .setBoxThickness(2)
                                .RenderBoxtoInstance(instance);
                            debuggedCount++;
                        }
                    });
                    
                    colorIndex++;
                    console.log(`[DebugRendererIMGUI] ${objectTypeName}: ${Math.min(3, instances.length)} instances with color ${JSON.stringify(color)}`);
                }
            }
        }
        
        console.log(`[DebugRendererIMGUI] Rainbow mode: Added debug boxes to ${debuggedCount} objects with ${colorIndex} different colors`);
    }

    /**
     * Quick test with random objects
     */
    private static quickTestRandomObjects(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const allObjectTypes = Object.keys(runtime.objects);
        const testCount = 5;
        let debuggedCount = 0;
        
        for (let i = 0; i < testCount && i < allObjectTypes.length; i++) {
            const randomIndex = Math.floor(Math.random() * allObjectTypes.length);
            const objectTypeName = allObjectTypes[randomIndex];
            const objectType = (runtime.objects as any)[objectTypeName];
            
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const randomInstance = instances[Math.floor(Math.random() * instances.length)];
                    
                    DebugObjectRenderer
                        .setColor(Math.random(), Math.random(), Math.random(), 0.8)
                        .setBoxThickness(Math.floor(Math.random() * 5) + 1)
                        .RenderBoxtoInstance(randomInstance);
                    
                    debuggedCount++;
                    console.log(`[DebugRendererIMGUI] Random test ${i + 1}: ${objectTypeName}`);
                }
            }
        }
        
        console.log(`[DebugRendererIMGUI] Quick test: Added debug boxes to ${debuggedCount} random objects`);
    }

    /**
     * Quick test at mouse position
     */
    private static quickTestMousePosition(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // Get mouse position (this might need adjustment based on your input system)
        const mouseX = runtime.mouse.getMouseX();
        const mouseY = runtime.mouse.getMouseY();
        const radius = 100;
        
        let debuggedCount = 0;
        const allObjectTypes = Object.keys(runtime.objects);
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    const distance = Math.sqrt(Math.pow(instance.x - mouseX, 2) + Math.pow(instance.y - mouseY, 2));
                    if (distance <= radius) {
                        DebugObjectRenderer
                            .setColor(1, 0.5, 0, 0.9) // Orange
                            .setBoxThickness(3)
                            .RenderBoxtoInstance(instance);
                        debuggedCount++;
                    }
                });
            }
        }
        
        console.log(`[DebugRendererIMGUI] Mouse test: Added debug boxes to ${debuggedCount} objects near mouse (${mouseX}, ${mouseY})`);
    }

    /**
     * Set debug color
     */
    private static setDebugColor(r: number, g: number, b: number, a: number): void {
        this.currentColor = { r, g, b, a };
        console.log(`[DebugRendererIMGUI] Set debug color to RGBA(${r}, ${g}, ${b}, ${a})`);
    }

    /**
     * Set debug thickness
     */
    private static setDebugThickness(thickness: number): void {
        this.currentThickness = thickness;
        console.log(`[DebugRendererIMGUI] Set debug thickness to ${thickness}px`);
    }

    /**
     * Show debug statistics
     */
    private static showDebugStats(): void {
        const count = DebugObjectRenderer.getDebugBoxCount();
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const totalObjectTypes = Object.keys(runtime.objects).length;
        
        console.log("=== Debug Renderer Statistics ===");
        console.log(`Active debug boxes: ${count}`);
        console.log(`Available object types: ${totalObjectTypes}`);
        console.log(`Current color: RGBA(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b}, ${this.currentColor.a})`);
        console.log(`Current thickness: ${this.currentThickness}px`);
        console.log("================================");
    }

    /**
     * Update available object types
     */
    private static updateAvailableObjectTypes(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        this.availableObjectTypes = Object.keys(runtime.objects);
        console.log(`[DebugRendererIMGUI] Updated object types list: ${this.availableObjectTypes.length} types available`);
    }

    /**
     * Toggle all debug boxes
     */
    private static toggleAllDebugBoxes(): void {
        // This is a simple implementation - you might want to track the state
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const allObjectTypes = Object.keys(runtime.objects);
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    if (DebugObjectRenderer.hasDebugBox(instance)) {
                        // Toggle the debug box (this is a simplified approach)
                        DebugObjectRenderer.update(instance, false);
                        setTimeout(() => {
                            DebugObjectRenderer.update(instance, true);
                        }, 100);
                    }
                });
            }
        }
        
        console.log("[DebugRendererIMGUI] Toggled all debug boxes");
    }

    /**
     * Clear all debug boxes
     */
    private static clearAllDebugBoxes(): void {
        DebugObjectRenderer.clearAll();
        console.log("[DebugRendererIMGUI] Cleared all debug boxes");
    }

    // === Diagnostics ===
    private static testRenderSystem(): void {
        console.log("=== Testing Render System ===");
        DebugObjectRenderer.testRender();
        
        // Wait a moment then check if rendering is happening
        setTimeout(() => {
            const debugInfo = DebugObjectRenderer.getDebugInfo();
            console.log("=== Render System Test Results ===");
            console.log(`Render count: ${debugInfo.renderCount}`);
            console.log(`Time since last render: ${debugInfo.timeSinceLastRender}ms`);
            console.log(`Total debug boxes: ${debugInfo.totalDebugBoxes}`);
            console.log(`Enabled debug boxes: ${debugInfo.enabledDebugBoxes}`);
            
            if (debugInfo.renderCount === 0) {
                console.error("❌ Rendering system is NOT working - no render calls detected");
            } else if (debugInfo.timeSinceLastRender > 1000) {
                console.warn("⚠️ Rendering system may be stalled - last render was over 1 second ago");
            } else {
                console.log("✅ Rendering system appears to be working");
            }
        }, 1000);
    }

    private static showDetailedDebugInfo(): void {
        const debugInfo = DebugObjectRenderer.getDebugInfo();
        console.log("=== Detailed Debug Information ===");
        console.log("System Status:");
        console.log(`- Initialized: ${debugInfo.isInitialized}`);
        console.log(`- Total debug boxes: ${debugInfo.totalDebugBoxes}`);
        console.log(`- Enabled debug boxes: ${debugInfo.enabledDebugBoxes}`);
        console.log(`- Render count: ${debugInfo.renderCount}`);
        console.log(`- Last render time: ${new Date(debugInfo.lastRenderTime).toLocaleTimeString()}`);
        console.log(`- Time since last render: ${debugInfo.timeSinceLastRender}ms`);
        
        console.log("Current Settings:");
        console.log(`- Color: RGBA(${debugInfo.currentColor.r}, ${debugInfo.currentColor.g}, ${debugInfo.currentColor.b}, ${debugInfo.currentColor.a})`);
        console.log(`- Thickness: ${debugInfo.currentThickness}px`);
        
        console.log("Debug Boxes by Layer:");
        debugInfo.debugBoxesByLayer.forEach((boxes: any[], layerName: string) => {
            console.log(`- Layer "${layerName}": ${boxes.length} boxes`);
            boxes.forEach((box: any, index: number) => {
                if (index < 3) { // Show first 3 boxes per layer
                    console.log(`  - ${box.key}: pos(${box.position.x}, ${box.position.y}) size(${box.size.width}x${box.size.height}) enabled:${box.enabled}`);
                }
            });
            if (boxes.length > 3) {
                console.log(`  - ... and ${boxes.length - 3} more`);
            }
        });
        
        // Check viewport and camera info
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        if (runtime) {
            console.log("Viewport Information:");
            console.log(`- Viewport size: ${runtime.viewportWidth}x${runtime.viewportHeight}`);
            console.log(`- Layout scroll: (${runtime.layout.scrollX}, ${runtime.layout.scrollY})`);
            console.log(`- Layout size: ${runtime.layout.width}x${runtime.layout.height}`);
        }
    }

    private static testSingleObject(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // Clear existing debug boxes first
        DebugObjectRenderer.clearAll();
        
        // Find the first available object
        const allObjectTypes = Object.keys(runtime.objects);
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const testInstance = instances[0];
                    
                    // Add a very visible test debug box
                    DebugObjectRenderer
                        .setColor(1, 0, 1, 1) // Bright magenta
                        .setBoxThickness(10)   // Very thick
                        .RenderBoxtoInstance(testInstance);
                    
                    console.log(`[DebugRendererIMGUI] Added BRIGHT MAGENTA test box to ${objectTypeName}`);
                    console.log(`Position: (${testInstance.x}, ${testInstance.y})`);
                    console.log(`Size: ${testInstance.width}x${testInstance.height}`);
                    console.log(`Layer: ${testInstance.layer.name || 'unnamed'}`);
                    
                    // Also try to move camera to this object
                    try {
                        runtime.layout.scrollTo(testInstance.x, testInstance.y);
                        console.log(`Moved camera to object position`);
                    } catch (error: any) {
                        console.warn(`Could not move camera: ${error.message}`);
                    }
                    
                    return;
                }
            }
        }
        
        console.warn("[DebugRendererIMGUI] No objects found for single object test");
    }

    private static checkLayerInfo(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const layout = runtime.layout;
        const layers = layout.getAllLayers();
        
        console.log("=== Layer Information ===");
        console.log(`Total layers: ${layers.length}`);
        
        layers.forEach((layer, index) => {
            console.log(`Layer ${index}: "${layer.name || 'unnamed'}"`);
            console.log(`- Visible: ${layer.isVisible}`);
            console.log(`- Opacity: ${layer.opacity}`);
            console.log(`- Scale: ${layer.scale}`);
            console.log(`- Angle: ${layer.angle}`);
            console.log(`- Parallax: (${layer.parallaxX}, ${layer.parallaxY})`);
            
            // Count objects on this layer
            let objectCount = 0;
            const allObjectTypes = Object.keys(runtime.objects);
            for (const objectTypeName of allObjectTypes) {
                const objectType = (runtime.objects as any)[objectTypeName];
                if (objectType && objectType.getAllInstances) {
                    const instances = objectType.getAllInstances();
                    instances.forEach((instance: IWorldInstance) => {
                        if (instance.layer === layer) {
                            objectCount++;
                        }
                    });
                }
            }
            console.log(`- Objects on layer: ${objectCount}`);
            console.log("---");
        });
        
        // Check which layers have debug boxes
        const debugInfo = DebugObjectRenderer.getDebugInfo();
        console.log("Debug boxes by layer:");
        debugInfo.debugBoxesByLayer.forEach((boxes: any[], layerName: string) => {
            console.log(`- "${layerName}": ${boxes.length} debug boxes`);
        });
    }

    // === Enhanced Diagnostics for Rendering Issues ===
    private static emergencyRenderTest(): void {
        console.log("🚨 === EMERGENCY RENDER TEST === 🚨");
        
        // Clear all existing debug boxes
        DebugObjectRenderer.clearAll();
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // Test 1: Try to render a box at camera center
        const centerX = runtime.layout.scrollX + runtime.viewportWidth / 2;
        const centerY = runtime.layout.scrollY + runtime.viewportHeight / 2;
        
        console.log(`🎯 Test 1: Attempting to render at camera center (${centerX}, ${centerY})`);
        
        // Find any object to use as a test
        const allObjectTypes = Object.keys(runtime.objects);
        let testInstance: IWorldInstance | null = null;
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    testInstance = instances[0];
                    break;
                }
            }
        }
        
        if (testInstance) {
            // Temporarily move the test instance to camera center
            const originalX = testInstance.x;
            const originalY = testInstance.y;
            
            testInstance.x = centerX;
            testInstance.y = centerY;
            
            // Add EXTREMELY visible debug box
            DebugObjectRenderer
                .setColor(1, 0, 1, 1)  // Bright magenta
                .setBoxThickness(20)    // Very thick
                .RenderBoxtoInstance(testInstance);
            
            console.log(`✅ Added EMERGENCY debug box to ${testInstance.objectType.name}`);
            console.log(`📍 Position: (${testInstance.x}, ${testInstance.y})`);
            console.log(`📏 Size: ${testInstance.width}x${testInstance.height}`);
            console.log(`🎭 Layer: ${testInstance.layer.name || 'unnamed'}`);
            
            // Restore original position after 3 seconds
            setTimeout(() => {
                testInstance!.x = originalX;
                testInstance!.y = originalY;
                console.log("🔄 Restored object to original position");
            }, 3000);
            
            // Test 2: Force a manual render call
            console.log("🔧 Test 2: Forcing manual render...");
            DebugObjectRenderer.testRender();
            
            // Test 3: Check if afterdraw events are firing
            console.log("🔧 Test 3: Checking afterdraw events...");
            const layers = runtime.layout.getAllLayers();
            layers.forEach((layer, index) => {
                console.log(`Layer ${index} (${layer.name}): visible=${layer.isVisible}, opacity=${layer.opacity}`);
            });
            
        } else {
            console.error("❌ No objects found for emergency test!");
        }
    }

    private static forceRenderPlayer(): void {
        console.log("🎯 === FORCE RENDER PLAYER === 🎯");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // Clear existing debug boxes
        DebugObjectRenderer.clearAll();
        
        // Find player objects (common names)
        const playerNames = ['Player', 'RedHairGirlSprite', 'player', 'PlayerSprite', 'Character'];
        let playerFound = false;
        
        for (const playerName of playerNames) {
            const playerObjectType = (runtime.objects as any)[playerName];
            if (playerObjectType && playerObjectType.getAllInstances) {
                const playerInstances = playerObjectType.getAllInstances();
                if (playerInstances.length > 0) {
                    const player = playerInstances[0];
                    
                    console.log(`🎮 Found player: ${playerName}`);
                    console.log(`📍 Player position: (${player.x}, ${player.y})`);
                    console.log(`📏 Player size: ${player.width}x${player.height}`);
                    console.log(`🎭 Player layer: ${player.layer.name || 'unnamed'}`);
                    
                    // Move camera to player
                    runtime.layout.scrollTo(player.x, player.y);
                    console.log("📷 Moved camera to player");
                    
                    // Add EXTREMELY visible debug box
                    DebugObjectRenderer
                        .setColor(0, 1, 0, 1)  // Bright green
                        .setBoxThickness(15)    // Very thick
                        .RenderBoxtoInstance(player);
                    
                    console.log("✅ Added BRIGHT GREEN debug box to player");
                    
                    // Also add a second box with different color for comparison
                    setTimeout(() => {
                        DebugObjectRenderer
                            .setColor(1, 1, 0, 1)  // Yellow
                            .setBoxThickness(25)    // Even thicker
                            .RenderBoxtoInstance(player);
                        console.log("✅ Added YELLOW debug box to player (double layer)");
                    }, 500);
                    
                    playerFound = true;
                    break;
                }
            }
        }
        
        if (!playerFound) {
            console.error("❌ No player object found! Tried names:", playerNames);
            // List all available object types
            const allTypes = Object.keys(runtime.objects);
            console.log("Available object types:", allTypes);
        }
    }

    private static checkRenderCoordinates(): void {
        console.log("📐 === CHECKING RENDER COORDINATES === 📐");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const debugInfo = DebugObjectRenderer.getDebugInfo();
        
        console.log("🖥️ Viewport Information:");
        console.log(`- Viewport size: ${runtime.viewportWidth}x${runtime.viewportHeight}`);
        console.log(`- Camera position: (${runtime.layout.scrollX}, ${runtime.layout.scrollY})`);
        console.log(`- Layout size: ${runtime.layout.width}x${runtime.layout.height}`);
        
        const viewportLeft = runtime.layout.scrollX;
        const viewportRight = runtime.layout.scrollX + runtime.viewportWidth;
        const viewportTop = runtime.layout.scrollY;
        const viewportBottom = runtime.layout.scrollY + runtime.viewportHeight;
        
        console.log(`📺 Visible area: (${viewportLeft}, ${viewportTop}) to (${viewportRight}, ${viewportBottom})`);
        
        console.log("🎯 Debug Box Coordinates:");
        debugInfo.debugBoxesByLayer.forEach((boxes: any[], layerName: string) => {
            console.log(`📋 Layer "${layerName}":`);
            boxes.forEach((box: any, index: number) => {
                const isInViewport = 
                    box.position.x >= viewportLeft && 
                    box.position.x <= viewportRight &&
                    box.position.y >= viewportTop && 
                    box.position.y <= viewportBottom;
                
                const status = isInViewport ? "✅ IN VIEWPORT" : "❌ OUTSIDE VIEWPORT";
                console.log(`  - ${box.key}: (${box.position.x}, ${box.position.y}) ${status}`);
                
                if (!isInViewport) {
                    const distanceX = Math.min(Math.abs(box.position.x - viewportLeft), Math.abs(box.position.x - viewportRight));
                    const distanceY = Math.min(Math.abs(box.position.y - viewportTop), Math.abs(box.position.y - viewportBottom));
                    console.log(`    Distance from viewport: X=${distanceX.toFixed(0)}, Y=${distanceY.toFixed(0)}`);
                }
            });
        });
        
        // Suggest camera movement if objects are outside viewport
        if (debugInfo.totalDebugBoxes > 0) {
            console.log("💡 Suggestion: Use 'Force Render Player' to move camera to a debug object");
        }
    }

    private static viewportDebug(): void {
        console.log("🔍 === VIEWPORT DEBUG === 🔍");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const layout = runtime.layout;
        
        console.log("🖥️ Viewport & Camera Info:");
        console.log(`- Viewport: ${runtime.viewportWidth}x${runtime.viewportHeight}`);
        console.log(`- Camera: (${layout.scrollX}, ${layout.scrollY})`);
        console.log(`- Layout: ${layout.width}x${layout.height}`);
        console.log(`- Zoom: ${layout.scale || 'N/A'}`);
        
        console.log("🎭 Layer Debug Info:");
        const layers = layout.getAllLayers();
        layers.forEach((layer, index) => {
            console.log(`Layer ${index}: "${layer.name || 'unnamed'}"`);
            console.log(`  - Visible: ${layer.isVisible}`);
            console.log(`  - Opacity: ${layer.opacity}`);
            console.log(`  - Scale: ${layer.scale}`);
            console.log(`  - Parallax: (${layer.parallaxX}, ${layer.parallaxY})`);
            console.log(`  - Force own texture: ${(layer as any).forceOwnTexture || false}`);
            console.log(`  - Blend mode: ${(layer as any).blendMode || 'normal'}`);
        });
        
        console.log("🎨 Renderer Info:");
        try {
            const renderer = (runtime as any).renderer;
            if (renderer) {
                console.log(`- Renderer type: ${renderer.constructor.name}`);
                console.log(`- Canvas size: ${renderer.canvas?.width}x${renderer.canvas?.height}`);
                console.log(`- Device pixel ratio: ${window.devicePixelRatio}`);
            }
        } catch (error: any) {
            console.log(`- Renderer info unavailable: ${error.message}`);
        }
        
        // Test if we can draw anything at all
        console.log("🧪 Testing basic drawing capability...");
        try {
            const testLayer = layers[0];
            if (testLayer) {
                console.log(`✅ Will attempt to draw on layer: ${testLayer.name || 'unnamed'}`);
                
                // Force a test render
                DebugObjectRenderer.testRender();
                console.log("✅ Test render call completed");
            }
        } catch (error: any) {
            console.error(`❌ Drawing test failed: ${error.message}`);
        }
    }
}

// Auto-initialize when module is loaded
DebugObjectRendererIMGUI.initialize(); 