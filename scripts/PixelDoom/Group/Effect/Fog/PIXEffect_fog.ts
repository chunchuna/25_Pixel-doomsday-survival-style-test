import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";
import { PLAYER_INVENTORY_ITEMS } from "../../Player/PIXPlayerInventory.js";
import { Imgui_chunchun } from "../../../UI/imgui_lib/imgui.js";

// Enum for different fog types
export enum FogType {
    PERSISTENT = "persistent",  // Fog that stays until manually destroyed
    TEMPORARY = "temporary"     // Fog that auto-destroys after duration
}

// Enum for fog visual styles
export enum FogStyle {
    LIGHT = "light",       // Light, wispy fog
    MEDIUM = "medium",     // Standard fog
    HEAVY = "heavy",       // Dense, thick fog
    MYSTICAL = "mystical", // Magical, colorful fog
    TOXIC = "toxic"        // Dangerous, green fog
}

export class PIXEffect_fog {
    private static instances: Map<string, PIXEffect_fog> = new Map();
    private static idCounter: number = 0;
    private static currentEditingFog: PIXEffect_fog | null = null;

    private id: string;
    private htmlElement: any; // HTML element instance
    private type: FogType;
    private style: FogStyle;
    private layer: string;
    private duration: number; // Duration in seconds (0 = persistent)

    // Position and size properties
    private _x: number = 0;
    private _y: number = 0;
    private _width: number = 800;  // HTML component size
    private _height: number = 600; // HTML component size

    // Fog parameters
    private fogParams = {
        density: 0.8,
        speed: 1.0,
        scale: 1.5,      // Fog particle scale
        opacity: 0.6,
        color: '#ffffff',
        layers: 3,
        // New parameters for better fog effect
        blur: 15,        // Blur amount for softer edges
        noiseScale: 0.5, // Noise pattern scale
        fadeEdges: 0.8,  // Edge fade amount
        mixBlendMode: 'screen', // Blend mode
        particleVariation: 0.3  // Size variation between particles
    };

    // Animation properties
    private particles: any[] = [];
    private animationId: number | null = null;
    private time: number = 0;
    private isDestroyed: boolean = false;

    // Auto-destroy timer
    private destroyTimer: number | null = null;

    private constructor(type: FogType, style: FogStyle = FogStyle.MEDIUM, duration: number = 0, layer: string = "html_c3") {
        this.id = `fog_${++PIXEffect_fog.idCounter}_${Date.now()}`;
        this.type = type;
        this.style = style;
        this.duration = duration;
        this.layer = layer;

        // Set default parameters based on style
        this.setDefaultParameters();

        // Create HTML element
        this.createHtmlElement();

        console.log(`Created ${this.style} fog with ID: ${this.id}, type: ${this.type}, duration: ${this.duration}s`);
    }

    /**
     * Generates a new fog effect
     * @param type Fog type (persistent or temporary)
     * @param style Visual style of the fog
     * @param duration Duration in seconds (only for temporary fog, 0 = persistent)
     * @param id Optional unique identifier
     */
    public static GenerateFog(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        id?: string
    ): PIXEffect_fog {
        // Generate ID if not provided
        if (!id) {
            id = `auto_${type}_${style}_${Date.now()}`;
        }

        // If instance with this ID already exists, destroy it first
        if (PIXEffect_fog.instances.has(id)) {
            PIXEffect_fog.instances.get(id)?.destroy();
        }

        // Create new instance
        const instance = new PIXEffect_fog(type, style, duration);
        instance.id = id; // Override the auto-generated ID
        PIXEffect_fog.instances.set(id, instance);

        return instance;
    }

    /**
     * Sets default parameters based on fog style
     */
    private setDefaultParameters(): void {
        switch (this.style) {
            case FogStyle.LIGHT:
                this.fogParams = {
                    density: 0.3,
                    speed: 0.5,
                    scale: 1.0,
                    opacity: 0.3,
                    color: '#ffffff',
                    layers: 2,
                    blur: 20,
                    noiseScale: 0.3,
                    fadeEdges: 0.9,
                    mixBlendMode: 'screen',
                    particleVariation: 0.4
                };
                break;
            case FogStyle.MEDIUM:
                this.fogParams = {
                    density: 0.8,
                    speed: 1.0,
                    scale: 1.5,
                    opacity: 0.6,
                    color: '#ffffff',
                    layers: 3,
                    blur: 15,
                    noiseScale: 0.5,
                    fadeEdges: 0.8,
                    mixBlendMode: 'screen',
                    particleVariation: 0.3
                };
                break;
            case FogStyle.HEAVY:
                this.fogParams = {
                    density: 1.5,
                    speed: 0.8,
                    scale: 2.0,
                    opacity: 0.8,
                    color: '#e0e0e0',
                    layers: 4,
                    blur: 10,
                    noiseScale: 0.7,
                    fadeEdges: 0.7,
                    mixBlendMode: 'multiply',
                    particleVariation: 0.2
                };
                break;
            case FogStyle.MYSTICAL:
                this.fogParams = {
                    density: 1.0,
                    speed: 0.6,
                    scale: 1.8,
                    opacity: 0.7,
                    color: '#9c27b0',
                    layers: 4,
                    blur: 25,
                    noiseScale: 0.4,
                    fadeEdges: 0.9,
                    mixBlendMode: 'screen',
                    particleVariation: 0.5
                };
                break;
            case FogStyle.TOXIC:
                this.fogParams = {
                    density: 1.2,
                    speed: 0.4,
                    scale: 1.6,
                    opacity: 0.8,
                    color: '#4caf50',
                    layers: 3,
                    blur: 12,
                    noiseScale: 0.6,
                    fadeEdges: 0.75,
                    mixBlendMode: 'multiply',
                    particleVariation: 0.25
                };
                break;
        }
    }

    /**
     * Creates the HTML element for the fog effect
     */
    private createHtmlElement(): void {
        try {
            // Create HTML element using HTML_c3 object
            this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(
                this.layer,
                this._x,
                this._y
            );

            // Set element size
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;

            // Initialize particles and start animation
            this.initParticles();
            this.renderHTML();
            this.startAnimation();

            // Start auto-destroy timer for temporary fog
            if (this.type === FogType.TEMPORARY && this.duration > 0) {
                this.startAutoDestroy();
            }

        } catch (error: any) {
            console.error(`Failed to create fog HTML element: ${error.message}`);
            this.htmlElement = null;
        }
    }

    /**
     * Initializes fog particles
     */
    private initParticles(): void {
        this.particles = [];
        const particleCount = Math.floor(this._width * this._height * 0.0001 * this.fogParams.density);
        
        for (let i = 0; i < particleCount; i++) {
            const baseSize = Math.random() * 100 + 50;
            const sizeVariation = 1 + (Math.random() - 0.5) * this.fogParams.particleVariation;
            
            this.particles.push({
                x: Math.random() * this._width,
                y: Math.random() * this._height,
                size: baseSize * sizeVariation,
                baseSpeedX: (Math.random() - 0.5) * 0.3 + 0.2,
                baseSpeedY: (Math.random() - 0.5) * 0.2 - 0.1,
                opacity: Math.random() * 0.3 + 0.1,
                layer: Math.floor(Math.random() * this.fogParams.layers),
                flowOffset: Math.random() * Math.PI * 2,
                flowAmplitude: Math.random() * 0.3 + 0.1,
                noiseOffset: Math.random() * 1000, // For noise pattern
                rotationSpeed: (Math.random() - 0.5) * 0.02 // Slow rotation
            });
        }
    }

    /**
     * Updates particle positions
     */
    private updateParticles(): void {
        this.particles.forEach(particle => {
            const flowTime = this.time * 0.0005;
            const flowX = Math.sin(flowTime + particle.flowOffset) * particle.flowAmplitude * 0.5;
            const flowY = Math.cos(flowTime * 0.7 + particle.flowOffset) * particle.flowAmplitude * 0.3;
            
            particle.x += (particle.baseSpeedX + flowX) * this.fogParams.speed;
            particle.y += (particle.baseSpeedY + flowY) * this.fogParams.speed;

            // Update noise offset for organic movement
            particle.noiseOffset += 0.01;

            // Wrap around screen
            if (particle.x > this._width + particle.size) {
                particle.x = -particle.size;
            }
            if (particle.x < -particle.size) {
                particle.x = this._width + particle.size;
            }
            if (particle.y > this._height + particle.size) {
                particle.y = -particle.size;
            }
            if (particle.y < -particle.size) {
                particle.y = this._height + particle.size;
            }
        });
    }

    /**
     * Renders the fog HTML content
     */
    private renderHTML(): void {
        if (!this.htmlElement || !this.htmlElement.setContent) return;

        const fogHtml = this.generateFogHTML();
        this.htmlElement.setContent(fogHtml, "html");
    }

    /**
     * Generates the HTML structure for the fog effect
     */
    private generateFogHTML(): string {
        const particlesHtml = this.particles.map((particle, index) => {
            const layerOpacity = this.fogParams.opacity * particle.opacity * (1 - particle.layer * 0.15);
            const layerScale = this.fogParams.scale * (1 - particle.layer * 0.05);
            const size = particle.size * layerScale;
            
            const fogColor = this.hexToRgb(this.fogParams.color);
            
            // Create more natural gradient with noise-like effect
            const noiseValue = Math.sin(particle.noiseOffset) * 0.1 + 0.9;
            const finalOpacity = layerOpacity * noiseValue;
            
            // Calculate blur based on layer and settings
            const blurAmount = this.fogParams.blur + particle.layer * 2;
            
            return `
            <div class="fog-particle" style="
                position: absolute;
                left: ${particle.x - size}px;
                top: ${particle.y - size}px;
                width: ${size * 2}px;
                height: ${size * 2}px;
                border-radius: 50%;
                background: radial-gradient(circle, 
                    rgba(${fogColor.r}, ${fogColor.g}, ${fogColor.b}, ${finalOpacity * 0.6}) 0%, 
                    rgba(${fogColor.r}, ${fogColor.g}, ${fogColor.b}, ${finalOpacity * 0.3}) 30%, 
                    rgba(${fogColor.r}, ${fogColor.g}, ${fogColor.b}, ${finalOpacity * 0.1}) 60%, 
                    rgba(${fogColor.r}, ${fogColor.g}, ${fogColor.b}, 0) 100%);
                mix-blend-mode: ${this.fogParams.mixBlendMode};
                filter: blur(${blurAmount}px);
                pointer-events: none;
                z-index: ${particle.layer};
                transform: rotate(${particle.noiseOffset * 10}deg);
                transition: all 0.1s ease-out;
            "></div>`;
        }).join('');

        return `
        <div id="fog-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            filter: contrast(1.1) brightness(0.95);
        ">
            ${particlesHtml}
        </div>`;
    }

    /**
     * Converts hex color to RGB
     */
    private hexToRgb(hex: string): { r: number, g: number, b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    /**
     * Starts the animation loop
     */
    private startAnimation(): void {
        const animate = () => {
            if (this.isDestroyed) return;

            this.time += 16;
            this.updateParticles();
            this.renderHTML();

            this.animationId = setTimeout(animate, 16); // ~60 FPS
        };

        animate();
    }

    /**
     * Starts auto-destroy timer for temporary fog
     */
    private startAutoDestroy(): void {
        if (this.duration <= 0) return;

        this.destroyTimer = setTimeout(() => {
            this.destroy();
        }, this.duration * 1000);
    }

    /**
     * Sets the fog scale (particle size multiplier)
     * @param scale Scale multiplier
     */
    public setScale(scale: number): PIXEffect_fog {
        this.fogParams.scale = scale;
        return this;
    }

    /**
     * Sets the fog movement speed
     * @param speed Speed multiplier
     */
    public setSpeed(speed: number): PIXEffect_fog {
        this.fogParams.speed = speed;
        return this;
    }

    /**
     * Sets the fog opacity
     * @param opacity Opacity value (0-1)
     */
    public setOpacity(opacity: number): PIXEffect_fog {
        this.fogParams.opacity = Math.max(0, Math.min(1, opacity));
        return this;
    }

    /**
     * Sets the fog color
     * @param color Hex color string
     */
    public setColor(color: string): PIXEffect_fog {
        this.fogParams.color = color;
        return this;
    }

    /**
     * Sets the position of the fog effect
     * @param x X position
     * @param y Y position
     */
    public setPosition(x: number, y: number): PIXEffect_fog {
        this._x = x;
        this._y = y;

        if (this.htmlElement) {
            this.htmlElement.x = x;
            this.htmlElement.y = y;
        }

        return this;
    }

    /**
     * Sets the layer for the HTML element
     * @param layer Layer name
     */
    public setLayer(layer: string): PIXEffect_fog {
        this.layer = layer;
        // Note: Layer change requires recreating the element
        if (this.htmlElement) {
            this.destroy();
            this.createHtmlElement();
        }
        return this;
    }

    /**
     * Sets the size of the HTML component (not fog scale)
     * @param width Width in pixels
     * @param height Height in pixels
     */
    public setSize(width: number, height: number): PIXEffect_fog {
        this._width = width;
        this._height = height;

        if (this.htmlElement) {
            this.htmlElement.width = width;
            this.htmlElement.height = height;
            // Reinitialize particles for new size
            this.initParticles();
        }

        return this;
    }

    /**
     * Sets fog density (particle count multiplier)
     * @param density Density multiplier
     */
    public setDensity(density: number): PIXEffect_fog {
        this.fogParams.density = density;
        this.initParticles(); // Reinitialize particles
        return this;
    }

    /**
     * Sets number of fog layers
     * @param layers Number of layers (1-5)
     */
    public setLayers(layers: number): PIXEffect_fog {
        this.fogParams.layers = Math.max(1, Math.min(5, layers));
        this.initParticles(); // Reinitialize particles
        return this;
    }

    /**
     * Sets blur amount
     * @param blur Blur amount in pixels
     */
    public setBlur(blur: number): PIXEffect_fog {
        this.fogParams.blur = Math.max(0, blur);
        return this;
    }

    /**
     * Sets noise scale
     * @param noiseScale Noise scale multiplier
     */
    public setNoiseScale(noiseScale: number): PIXEffect_fog {
        this.fogParams.noiseScale = Math.max(0, noiseScale);
        return this;
    }

    /**
     * Sets edge fade amount
     * @param fadeEdges Edge fade amount (0-1)
     */
    public setFadeEdges(fadeEdges: number): PIXEffect_fog {
        this.fogParams.fadeEdges = Math.max(0, Math.min(1, fadeEdges));
        return this;
    }

    /**
     * Sets mix blend mode
     * @param mode CSS mix-blend-mode value
     */
    public setMixBlendMode(mode: string): PIXEffect_fog {
        this.fogParams.mixBlendMode = mode;
        return this;
    }

    /**
     * Sets particle size variation
     * @param variation Variation amount (0-1)
     */
    public setParticleVariation(variation: number): PIXEffect_fog {
        this.fogParams.particleVariation = Math.max(0, Math.min(1, variation));
        this.initParticles(); // Reinitialize particles
        return this;
    }

    /**
     * Gets fog parameters for editing
     */
    public getFogParams(): any {
        return { ...this.fogParams };
    }

    /**
     * Updates fog parameters from editor
     */
    public updateFogParams(params: any): void {
        this.fogParams = { ...this.fogParams, ...params };
        this.initParticles(); // Reinitialize particles with new params
    }

    /**
     * Gets fog ID
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Destroys the fog effect
     */
    public destroy(): void {
        this.isDestroyed = true;

        // Clear timers
        if (this.destroyTimer) {
            clearTimeout(this.destroyTimer);
            this.destroyTimer = null;
        }

        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }

        // Destroy HTML element
        if (this.htmlElement) {
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying fog HTML element: ${error.message}`);
            }
            this.htmlElement = null;
        }

        // Remove from instances map
        PIXEffect_fog.instances.delete(this.id);

        // Clear from editor if this was being edited
        if (PIXEffect_fog.currentEditingFog === this) {
            PIXEffect_fog.currentEditingFog = null;
        }

        console.log(`Fog effect ${this.id} destroyed`);
    }

    /**
     * Gets a fog instance by ID
     * @param id Fog ID
     */
    public static GetFog(id: string): PIXEffect_fog | undefined {
        return PIXEffect_fog.instances.get(id);
    }

    /**
     * Destroys all active fog effects
     */
    public static DestroyAllFog(): void {
        const fogs = Array.from(PIXEffect_fog.instances.values());
        fogs.forEach(fog => fog.destroy());
        console.log(`Destroyed ${fogs.length} fog effects`);
    }

    /**
     * Gets information about all active fog effects
     */
    public static GetFogInfo(): { count: number, fogs: string[] } {
        const fogIds = Array.from(PIXEffect_fog.instances.keys());
        return {
            count: fogIds.length,
            fogs: fogIds
        };
    }

    /**
     * Opens fog property editor for a specific fog instance
     */
    public static OpenFogEditor(fogId: string): void {
        const fog = PIXEffect_fog.instances.get(fogId);
        if (!fog) {
            console.warn(`Fog with ID ${fogId} not found`);
            return;
        }

        PIXEffect_fog.currentEditingFog = fog;
        
        // Create ImGui property editor window
        const windowId = "fog_property_editor";
        
        // Close existing window if open
        if (Imgui_chunchun.IsWindowOpen(windowId)) {
            Imgui_chunchun.DestroyWindow(windowId);
        }

        // Create new property editor window
        PIXEffect_fog.createFogPropertyWindow(windowId, fog);
    }

    /**
     * Creates the fog property editor window
     */
    private static createFogPropertyWindow(windowId: string, fog: PIXEffect_fog): void {
        const params = fog.getFogParams();
        
        // Create a copy of parameters for editing
        let editParams = { ...params };

        const renderCallback = () => {
            // Fog info section
            if (ImGui.CollapsingHeader("Fog Information")) {
                ImGui.Text(`ID: ${fog.getId()}`);
                ImGui.Text(`Type: ${fog.type}`);
                ImGui.Text(`Style: ${fog.style}`);
                ImGui.Separator();
            }

            // Basic properties
            if (ImGui.CollapsingHeader("Basic Properties", ImGui.TreeNodeFlags.DefaultOpen)) {
                // Density
                let density = editParams.density;
                if (ImGui.SliderFloat("Density", (value = density) => density = value, 0.1, 3.0)) {
                    editParams.density = density;
                    fog.updateFogParams(editParams);
                }

                // Speed
                let speed = editParams.speed;
                if (ImGui.SliderFloat("Speed", (value = speed) => speed = value, 0.1, 5.0)) {
                    editParams.speed = speed;
                    fog.updateFogParams(editParams);
                }

                // Scale
                let scale = editParams.scale;
                if (ImGui.SliderFloat("Scale", (value = scale) => scale = value, 0.5, 5.0)) {
                    editParams.scale = scale;
                    fog.updateFogParams(editParams);
                }

                // Opacity
                let opacity = editParams.opacity;
                if (ImGui.SliderFloat("Opacity", (value = opacity) => opacity = value, 0.0, 1.0)) {
                    editParams.opacity = opacity;
                    fog.updateFogParams(editParams);
                }

                // Layers
                let layers = editParams.layers;
                if (ImGui.SliderInt("Layers", (value = layers) => layers = value, 1, 5)) {
                    editParams.layers = layers;
                    fog.updateFogParams(editParams);
                }
            }

            // Advanced properties
            if (ImGui.CollapsingHeader("Advanced Properties")) {
                // Blur
                let blur = editParams.blur;
                if (ImGui.SliderFloat("Blur", (value = blur) => blur = value, 0, 50)) {
                    editParams.blur = blur;
                    fog.updateFogParams(editParams);
                }

                // Noise Scale
                let noiseScale = editParams.noiseScale;
                if (ImGui.SliderFloat("Noise Scale", (value = noiseScale) => noiseScale = value, 0.0, 2.0)) {
                    editParams.noiseScale = noiseScale;
                    fog.updateFogParams(editParams);
                }

                // Fade Edges
                let fadeEdges = editParams.fadeEdges;
                if (ImGui.SliderFloat("Fade Edges", (value = fadeEdges) => fadeEdges = value, 0.0, 1.0)) {
                    editParams.fadeEdges = fadeEdges;
                    fog.updateFogParams(editParams);
                }

                // Particle Variation
                let particleVariation = editParams.particleVariation;
                if (ImGui.SliderFloat("Particle Variation", (value = particleVariation) => particleVariation = value, 0.0, 1.0)) {
                    editParams.particleVariation = particleVariation;
                    fog.updateFogParams(editParams);
                }

                // Mix Blend Mode
                ImGui.Text("Mix Blend Mode:");
                const blendModes = ["screen", "multiply", "overlay", "soft-light", "hard-light", "color-dodge", "color-burn"];
                blendModes.forEach(mode => {
                    if (ImGui.RadioButton(mode, editParams.mixBlendMode === mode)) {
                        editParams.mixBlendMode = mode;
                        fog.updateFogParams(editParams);
                    }
                });
            }

            // Color section
            if (ImGui.CollapsingHeader("Color")) {
                ImGui.Text("Color (Hex):");
                let colorText = editParams.color;
                if (ImGui.InputText("##color", (value = colorText) => colorText = value)) {
                    if (/^#[0-9A-F]{6}$/i.test(colorText)) {
                        editParams.color = colorText;
                        fog.updateFogParams(editParams);
                    }
                }

                // Preset colors
                ImGui.Text("Presets:");
                const presetColors = [
                    { name: "White", color: "#ffffff" },
                    { name: "Gray", color: "#808080" },
                    { name: "Blue", color: "#4fc3f7" },
                    { name: "Purple", color: "#9c27b0" },
                    { name: "Green", color: "#4caf50" },
                    { name: "Red", color: "#f44336" },
                    { name: "Yellow", color: "#ffeb3b" }
                ];

                presetColors.forEach(preset => {
                    if (ImGui.Button(preset.name)) {
                        editParams.color = preset.color;
                        fog.updateFogParams(editParams);
                    }
                    ImGui.SameLine();
                });
                ImGui.NewLine();
            }

            // Actions
            ImGui.Separator();
            if (ImGui.Button("Reset to Default")) {
                fog.setDefaultParameters();
                editParams = fog.getFogParams();
            }
            ImGui.SameLine();
            if (ImGui.Button("Close Editor")) {
                Imgui_chunchun.CloseWindow(windowId);
                PIXEffect_fog.currentEditingFog = null;
            }
        };

        // Create the window using Imgui_chunchun
        const windowConfig = {
            title: `Fog Editor - ${fog.getId()}`,
            isOpen: true,
            size: { width: 400, height: 600 },
            position: { x: 100, y: 100 },
            renderCallback: renderCallback
        };

        // Manually add to windows map (accessing private member)
        (Imgui_chunchun as any).windows.set(windowId, windowConfig);
    }
}


// For test

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // Test category for fog system
    var fog_system = IMGUIDebugButton.AddCategory("fog_system");

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Fog Property Editor", () => {
        // Get the first active fog for editing, or create one if none exists
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            PIXEffect_fog.OpenFogEditor(fogInfo.fogs[0]);
        } else {
            // Create a test fog for editing
            var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            const x = PlayerInstance ? PlayerInstance.x : 400;
            const y = PlayerInstance ? PlayerInstance.y : 300;
            
            const testFog = PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "editor_test_fog")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300);
            
            PIXEffect_fog.OpenFogEditor("editor_test_fog");
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate bIG Fog FOR WHOLE GAME", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MYSTICAL, 10,"whole level fog")
            .setPosition(-1920, -1080)
            .setSize(1920, 1080)
            .setScale(1.2)
            .setSpeed(0.8)
            .setOpacity(0.4).setLayer("HtmlUI_fix")

        PIXEffect_fog.OpenFogEditor("whole level fog")

    })


    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Light Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 10)
            .setPosition(PlayerInstance.x - 200, PlayerInstance.y - 200)
            .setSize(400, 300)
            .setScale(1.2)
            .setSpeed(0.8)
            .setOpacity(0.4);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Heavy Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 15)
            .setPosition(PlayerInstance.x - 300, PlayerInstance.y - 250)
            .setSize(600, 500)
            .setScale(2.5)
            .setSpeed(0.6)
            .setOpacity(0.8)
            .setDensity(1.8);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Mystical Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 12)
            .setPosition(PlayerInstance.x - 250, PlayerInstance.y - 200)
            .setSize(500, 400)
            .setScale(1.8)
            .setSpeed(0.4)
            .setOpacity(0.7)
            .setColor("#9c27b0")
            .setLayers(4);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Toxic Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.TOXIC, 8)
            .setPosition(PlayerInstance.x - 150, PlayerInstance.y - 150)
            .setSize(300, 300)
            .setScale(1.6)
            .setSpeed(0.3)
            .setOpacity(0.9)
            .setColor("#4caf50")
            .setDensity(1.5);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Persistent Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "persistent_fog_1")
            .setPosition(PlayerInstance.x - 400, PlayerInstance.y - 300)
            .setSize(800, 600)
            .setScale(1.5)
            .setSpeed(1.0)
            .setOpacity(0.6);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Custom Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 20)
            .setPosition(PlayerInstance.x - 350, PlayerInstance.y - 250)
            .setSize(700, 500)
            .setScale(2.0)
            .setSpeed(1.5)
            .setOpacity(0.5)
            .setColor("#ff6b6b")
            .setDensity(1.2)
            .setLayers(5);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Screen Fog", () => {
        // Create full-screen fog effect
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 25)
            .setPosition(0, 0)
            .setSize(1920, 1080) // Full screen size
            .setScale(3.0)
            .setSpeed(0.5)
            .setOpacity(0.4)
            .setColor("#ffffff")
            .setDensity(0.8);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Moving Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Create fast-moving fog
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 30)
            .setPosition(PlayerInstance.x - 500, PlayerInstance.y - 300)
            .setSize(1000, 600)
            .setScale(1.0)
            .setSpeed(3.0) // Very fast movement
            .setOpacity(0.3)
            .setColor("#87ceeb")
            .setDensity(0.6);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Destroy All Fog", () => {
        PIXEffect_fog.DestroyAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fog Info", () => {
        const info = PIXEffect_fog.GetFogInfo();
        console.log(`Active fog effects: ${info.count}`);
        console.log(`Fog IDs: ${info.fogs.join(", ")}`);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fog Layers", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Create multiple fog layers at different positions
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 15, "layer_1")
            .setPosition(PlayerInstance.x - 200, PlayerInstance.y - 200)
            .setSize(400, 300)
            .setOpacity(0.3)
            .setColor("#ffffff");

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 15, "layer_2")
            .setPosition(PlayerInstance.x - 100, PlayerInstance.y - 150)
            .setSize(400, 300)
            .setOpacity(0.4)
            .setColor("#e0e0e0");

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 15, "layer_3")
            .setPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .setSize(400, 300)
            .setOpacity(0.5)
            .setColor("#cccccc");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Color Variations", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
        const positions = [
            [-300, -200], [-100, -200], [100, -200],
            [-300, 0], [-100, 0], [100, 0]
        ];

        colors.forEach((color, index) => {
            if (!PlayerInstance) return;
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 10, `color_test_${index}`)
                .setPosition(PlayerInstance.x + positions[index][0], PlayerInstance.y + positions[index][1])
                .setSize(200, 150)
                .setScale(1.0)
                .setOpacity(0.6)
                .setColor(color)
                .setSpeed(0.8);
        });
    });
}); 