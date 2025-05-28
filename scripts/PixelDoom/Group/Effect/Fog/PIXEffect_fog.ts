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
    TOXIC = "toxic",
    LEVEL = "level"      // Dangerous, green fog
}

export class PIXEffect_fog {
    private static instances: Map<string, PIXEffect_fog> = new Map();
    private static idCounter: number = 0;
    private static currentEditingFog: PIXEffect_fog | null = null;

    // Performance optimization settings
    private static MAX_PARTICLES_GLOBAL: number = 500; // Global particle limit
    private static MAX_PARTICLES_PER_FOG: number = 150; // Per fog instance limit
    private static PERFORMANCE_MODE: boolean = true; // Auto performance mode
    private static LOD_ENABLED: boolean = true; // Level of Detail system
    private static UPDATE_FREQUENCY: number = 16; // Animation update frequency in ms

    protected id: string;
    protected htmlElement: any; // HTML element instance
    protected type: FogType;
    protected style: FogStyle;
    protected layer: string;
    protected duration: number; // Duration in seconds (0 = persistent)

    // Position and size properties
    protected _x: number = 0;
    protected _y: number = 0;
    protected _width: number = 800;  // HTML component size
    protected _height: number = 600; // HTML component size

    // Performance tracking
    protected lastFrameTime: number = 0;
    protected frameCount: number = 0;
    protected avgFrameTime: number = 16;
    protected performanceLevel: number = 1; // 1 = high, 0.5 = medium, 0.25 = low

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
        mixBlendMode: 'overlay', // Blend mode
        particleVariation: 0.3  // Size variation between particles
    };

    // Animation properties
    protected particles: any[] = [];
    protected animationId: number | null = null;
    protected time: number = 0;
    protected isDestroyed: boolean = false;

    // Performance optimization properties
    protected skipFrames: number = 0; // Skip frames for performance
    protected lodLevel: number = 1; // Level of detail (1 = full, 0.5 = half, 0.25 = quarter)
    protected isVisible: boolean = true; // Visibility culling
    protected lastUpdateTime: number = 0;

    // C3 Timer properties (replacing JavaScript timers)
    private timerInstance: any = null;
    private timerTag: string = "";

    // Fade-out animation properties
    private static FADE_OUT_DURATION: number = 12000; // 2 seconds fade-out
    private isFadingOut: boolean = false;
    private fadeStartTime: number = 0;
    private initialOpacity: number = 1.0;

    // Fade-in animation properties
    private static FADE_IN_DURATION: number = 10000; // 3 seconds fade-in
    private isFadingIn: boolean = false;
    private fadeInStartTime: number = 0;
    private targetOpacity: number = 1.0;

    private constructor(type: FogType, style: FogStyle = FogStyle.MEDIUM, duration: number = 0, layer: string = "html_c3") {
        this.id = `fog_${++PIXEffect_fog.idCounter}_${Date.now()}`;
        this.type = type;
        this.style = style;
        this.duration = duration;
        this.layer = layer;

        // Set default parameters based on style
        this.setDefaultParameters();

        // Store target opacity and start with 0 for fade-in effect
        this.targetOpacity = this.fogParams.opacity;
        this.fogParams.opacity = 0; // Start invisible

        // Create HTML element
        this.createHtmlElement();

        // Start fade-in animation
        this.startFadeIn();

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

        // If instance with this ID already exists, start fade-out for graceful replacement
        if (PIXEffect_fog.instances.has(id)) {
            const existingFog = PIXEffect_fog.instances.get(id);
            if (existingFog && !existingFog.isDestroyed) {
                console.log(`Replacing existing fog ${id} with fade-out transition`);
                existingFog.startFadeOut();
                // Remove from instances map immediately to allow new fog creation
                PIXEffect_fog.instances.delete(id);
            }
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
            case FogStyle.LEVEL:
                this.fogParams = {
                    density: 0.3,
                    speed: 0.6,
                    scale: 1.2,
                    opacity: 0.9,
                    color: '#ffffff',
                    layers: 2,
                    blur: 20,
                    noiseScale: 0.3,
                    fadeEdges: 0.9,
                    mixBlendMode: 'overlay',
                    particleVariation: 0.4
                };
                break;
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

            // Start auto-destroy timer for temporary fog using C3 timer
            if (this.type === FogType.TEMPORARY && this.duration > 0) {
                this.startC3Timer();
            }

        } catch (error: any) {
            console.error(`Failed to create fog HTML element: ${error.message}`);
            this.htmlElement = null;
        }
    }

    /**
     * Starts C3 timer for temporary fog destruction
     */
    private startC3Timer(): void {
        try {
            // Create C3 Timer instance
            this.timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            this.timerTag = `fog_${this.id}_${Date.now()}`;

            // Listen for timer events
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    console.log(`Fog ${this.id} timer completed, starting fade-out`);
                    this.startFadeOut();
                }
            });

            // Start the timer
            this.timerInstance.behaviors.Timer.startTimer(this.duration, this.timerTag, "once");
            //console.log(`Started C3 timer for fog ${this.id}, duration: ${this.duration}s`);

        } catch (error: any) {
            console.error(`Failed to create C3 timer for fog: ${error.message}`);
            // Fallback to JavaScript timer if C3 timer fails
            setTimeout(() => {
                this.startFadeOut();
            }, this.duration * 1000);
        }
    }

    /**
     * Starts fade-out animation
     */
    public startFadeOut(): void {
        if (this.isFadingOut || this.isDestroyed) return;

        this.isFadingOut = true;
        this.fadeStartTime = Date.now();
        this.initialOpacity = this.fogParams.opacity;

        console.log(`Starting fade-out for fog ${this.id}`);

        // Start fade-out animation loop
        this.fadeOutStep();
    }

    /**
     * Performs one step of fade-out animation
     */
    private fadeOutStep(): void {
        if (!this.isFadingOut || this.isDestroyed) return;

        const elapsed = Date.now() - this.fadeStartTime;
        const progress = Math.min(elapsed / PIXEffect_fog.FADE_OUT_DURATION, 1.0);

        // Calculate current opacity (fade from initial to 0)
        const currentOpacity = this.initialOpacity * (1 - progress);

        // Update fog opacity
        this.fogParams.opacity = currentOpacity;

        // Re-render with new opacity
        if (this.htmlElement) {
            this.renderHTML();
        }

        // Continue fade-out or destroy when complete
        if (progress < 1.0) {
            // Continue fade-out animation
            setTimeout(() => this.fadeOutStep(), 16); // ~60 FPS
        } else {
            // Fade-out complete, destroy fog
            console.log(`Fade-out complete for fog ${this.id}, destroying`);
            this.destroy();
        }
    }

    /**
     * Starts fade-in animation
     */
    private startFadeIn(): void {
        if (this.isFadingIn || this.isDestroyed) return;

        this.isFadingIn = true;
        this.fadeInStartTime = Date.now();

        console.log(`Starting fade-in for fog ${this.id}`);

        // Start fade-in animation loop
        this.fadeInStep();
    }

    /**
     * Performs one step of fade-in animation
     */
    private fadeInStep(): void {
        if (!this.isFadingIn || this.isDestroyed) return;

        const elapsed = Date.now() - this.fadeInStartTime;
        const progress = Math.min(elapsed / PIXEffect_fog.FADE_IN_DURATION, 1.0);

        // Calculate current opacity (fade from 0 to target)
        const currentOpacity = this.targetOpacity * progress;

        // Update fog opacity
        this.fogParams.opacity = currentOpacity;

        // Re-render with new opacity
        if (this.htmlElement) {
            this.renderHTML();
        }

        // Continue fade-in or complete when done
        if (progress < 1.0) {
            // Continue fade-in animation
            setTimeout(() => this.fadeInStep(), 16); // ~60 FPS
        } else {
            // Fade-in complete
            this.isFadingIn = false;
            this.fogParams.opacity = this.targetOpacity; // Ensure exact target opacity
            console.log(`Fade-in complete for fog ${this.id}`);
        }
    }

    /**
     * Starts auto-destroy timer for temporary fog
     */
    private startAutoDestroy(): void {
        // This method is now replaced by startC3Timer
        // Keeping it for compatibility but it does nothing
        console.warn("startAutoDestroy is deprecated, use startC3Timer instead");
    }

    /**
     * Initializes fog particles with performance optimizations
     */
    private initParticles(): void {
        this.particles = [];

        // Calculate base particle count
        let baseParticleCount = Math.floor(this._width * this._height * 0.0001 * this.fogParams.density);

        // Apply performance optimizations
        if (PIXEffect_fog.PERFORMANCE_MODE) {
            baseParticleCount = Math.floor(baseParticleCount * 0.5); // Reduce by 50% in performance mode
        }

        // Apply LOD (Level of Detail) based on fog size
        if (PIXEffect_fog.LOD_ENABLED) {
            const area = this._width * this._height;
            if (area > 1000000) { // Very large fog (1000x1000+)
                this.lodLevel = 0.25;
                baseParticleCount = Math.floor(baseParticleCount * 0.25);
            } else if (area > 500000) { // Large fog (700x700+)
                this.lodLevel = 0.5;
                baseParticleCount = Math.floor(baseParticleCount * 0.5);
            } else if (area > 200000) { // Medium fog (450x450+)
                this.lodLevel = 0.75;
                baseParticleCount = Math.floor(baseParticleCount * 0.75);
            } else {
                this.lodLevel = 1.0; // Small fog, full detail
            }
        }

        // Apply per-fog particle limit
        baseParticleCount = Math.min(baseParticleCount, PIXEffect_fog.MAX_PARTICLES_PER_FOG);

        // Check global particle limit
        const currentGlobalParticles = this.getTotalActiveParticles();
        const availableParticles = PIXEffect_fog.MAX_PARTICLES_GLOBAL - currentGlobalParticles;
        const finalParticleCount = Math.min(baseParticleCount, Math.max(0, availableParticles));

        console.log(`Fog ${this.id}: Area=${this._width}x${this._height}, LOD=${this.lodLevel}, Particles=${finalParticleCount}/${baseParticleCount}`);

        // Create particles with optimized distribution
        for (let i = 0; i < finalParticleCount; i++) {
            const baseSize = Math.random() * 100 + 50;
            const sizeVariation = 1 + (Math.random() - 0.5) * this.fogParams.particleVariation;

            // Scale particle size based on LOD
            const lodScaledSize = baseSize * sizeVariation * (1 + (1 - this.lodLevel) * 2); // Larger particles for lower LOD

            this.particles.push({
                x: Math.random() * this._width,
                y: Math.random() * this._height,
                size: lodScaledSize,
                baseSpeedX: (Math.random() - 0.5) * 0.3 + 0.2,
                baseSpeedY: (Math.random() - 0.5) * 0.2 - 0.1,
                opacity: Math.random() * 0.3 + 0.1,
                layer: Math.floor(Math.random() * this.fogParams.layers),
                flowOffset: Math.random() * Math.PI * 2,
                flowAmplitude: Math.random() * 0.3 + 0.1,
                noiseOffset: Math.random() * 1000, // For noise pattern
                rotationSpeed: (Math.random() - 0.5) * 0.02, // Slow rotation
                // Performance optimization: pre-calculate some values
                preCalcSin: Math.sin(Math.random() * Math.PI * 2),
                preCalcCos: Math.cos(Math.random() * Math.PI * 2),
                updateCounter: Math.floor(Math.random() * 10) // Stagger updates
            });
        }
    }

    /**
     * Gets total active particles across all fog instances
     */
    private getTotalActiveParticles(): number {
        let total = 0;
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                total += fog.particles.length;
            }
        });
        return total;
    }

    /**
     * Updates particle positions with performance optimizations
     */
    private updateParticles(): void {
        const currentTime = Date.now();

        // Performance monitoring
        if (this.lastFrameTime > 0) {
            const frameTime = currentTime - this.lastFrameTime;
            this.avgFrameTime = (this.avgFrameTime * 0.9) + (frameTime * 0.1); // Smooth average

            // Adjust performance level based on frame time
            if (this.avgFrameTime > 25) { // Below 40 FPS
                this.performanceLevel = 0.25;
                this.skipFrames = 3; // Update every 4th frame
            } else if (this.avgFrameTime > 20) { // Below 50 FPS
                this.performanceLevel = 0.5;
                this.skipFrames = 1; // Update every 2nd frame
            } else {
                this.performanceLevel = 1.0;
                this.skipFrames = 0; // Update every frame
            }
        }
        this.lastFrameTime = currentTime;

        // Skip frame if needed for performance
        if (this.skipFrames > 0 && this.frameCount % (this.skipFrames + 1) !== 0) {
            this.frameCount++;
            return;
        }

        // Optimized particle update with batching
        const flowTime = this.time * 0.0005;
        const speedMultiplier = this.fogParams.speed * this.performanceLevel;

        // Update particles in batches to reduce computation
        const batchSize = Math.max(1, Math.floor(this.particles.length * this.performanceLevel));
        const startIndex = (this.frameCount * batchSize) % this.particles.length;
        const endIndex = Math.min(startIndex + batchSize, this.particles.length);

        for (let i = startIndex; i < endIndex; i++) {
            const particle = this.particles[i];

            // Staggered updates for better performance
            particle.updateCounter++;
            if (particle.updateCounter % 2 !== 0 && this.performanceLevel < 1.0) {
                continue; // Skip this particle this frame
            }

            // Use pre-calculated values for better performance
            const flowX = particle.preCalcSin * particle.flowAmplitude * 0.5;
            const flowY = particle.preCalcCos * particle.flowAmplitude * 0.3;

            particle.x += (particle.baseSpeedX + flowX) * speedMultiplier;
            particle.y += (particle.baseSpeedY + flowY) * speedMultiplier;

            // Update noise offset less frequently for performance
            if (particle.updateCounter % 3 === 0) {
                particle.noiseOffset += 0.01;
                // Update pre-calculated values occasionally
                particle.preCalcSin = Math.sin(flowTime + particle.flowOffset);
                particle.preCalcCos = Math.cos(flowTime * 0.7 + particle.flowOffset);
            }

            // Wrap around screen (optimized boundary checking)
            const size = particle.size;
            if (particle.x > this._width + size) {
                particle.x = -size;
            } else if (particle.x < -size) {
                particle.x = this._width + size;
            }

            if (particle.y > this._height + size) {
                particle.y = -size;
            } else if (particle.y < -size) {
                particle.y = this._height + size;
            }
        }

        this.frameCount++;
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
     * Starts the animation loop with performance optimizations
     */
    private startAnimation(): void {
        const animate = () => {
            if (this.isDestroyed) return;

            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdateTime;

            // Adaptive frame rate based on performance
            let targetFrameTime = PIXEffect_fog.UPDATE_FREQUENCY;
            if (this.performanceLevel < 1.0) {
                targetFrameTime = Math.floor(PIXEffect_fog.UPDATE_FREQUENCY / this.performanceLevel);
            }

            // Only update if enough time has passed
            if (deltaTime >= targetFrameTime) {
                this.time += deltaTime;
                this.updateParticles();

                // Only re-render if particles were actually updated
                if (this.skipFrames === 0 || this.frameCount % (this.skipFrames + 1) === 0) {
                    this.renderHTML();
                }

                this.lastUpdateTime = currentTime;
            }

            // Use requestAnimationFrame when available, fallback to setTimeout
            if (typeof requestAnimationFrame !== 'undefined') {
                this.animationId = requestAnimationFrame(animate) as any;
            } else {
                this.animationId = setTimeout(animate, Math.max(8, targetFrameTime)) as any;
            }
        };

        this.lastUpdateTime = Date.now();
        animate();
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
        const newOpacity = Math.max(0, Math.min(1, opacity));

        // If currently fading in, update target opacity
        if (this.isFadingIn) {
            this.targetOpacity = newOpacity;
        } else {
            this.fogParams.opacity = newOpacity;
            this.targetOpacity = newOpacity;
        }

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

        // If HTML element exists, we need to recreate it on the new layer
        if (this.htmlElement) {
            // Store current state
            const wasDestroyed = this.isDestroyed;
            const currentId = this.id;

            // Temporarily stop animation
            if (this.animationId) {
                clearTimeout(this.animationId);
                this.animationId = null;
            }

            // Destroy only the HTML element, not the fog instance
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying fog HTML element during layer change: ${error.message}`);
            }
            this.htmlElement = null;

            // Recreate HTML element on new layer without destroying the instance
            this.createHtmlElementForLayerChange();
        }

        return this;
    }

    /**
     * Creates HTML element specifically for layer changes (doesn't affect instance management)
     */
    private createHtmlElementForLayerChange(): void {
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

            // Render HTML and restart animation
            this.renderHTML();
            this.startAnimation();

            console.log(`Fog ${this.id} recreated on layer: ${this.layer}`);

        } catch (error: any) {
            console.error(`Failed to recreate fog HTML element on new layer: ${error.message}`);
            this.htmlElement = null;
        }
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
     * Gets fog debug information
     */
    public getDebugInfo(): any {
        return {
            id: this.id,
            type: this.type,
            style: this.style,
            layer: this.layer,
            isDestroyed: this.isDestroyed,
            hasHtmlElement: !!this.htmlElement,
            position: { x: this._x, y: this._y },
            size: { width: this._width, height: this._height },
            duration: this.duration
        };
    }

    /**
     * Gets the number of particles in this fog instance
     */
    public getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * Gets the current LOD level
     */
    public getLODLevel(): number {
        return this.lodLevel;
    }

    /**
     * Gets the current performance level
     */
    public getPerformanceLevel(): number {
        return this.performanceLevel;
    }

    /**
     * Gets the average frame time
     */
    public getAverageFrameTime(): number {
        return this.avgFrameTime;
    }

    /**
     * Destroys the fog effect
     */
    public destroy(): void {
        this.isDestroyed = true;

        // Clear C3 timer
        if (this.timerInstance) {
            try {
                // Stop the timer if it's running
                if (this.timerTag && this.timerInstance.behaviors.Timer.isTimerRunning(this.timerTag)) {
                    this.timerInstance.behaviors.Timer.stopTimer(this.timerTag);
                }
                // Destroy the timer instance
                this.timerInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying C3 timer: ${error.message}`);
            }
            this.timerInstance = null;
        }

        // Clear animation loop (handle both setTimeout and requestAnimationFrame)
        if (this.animationId) {
            if (typeof cancelAnimationFrame !== 'undefined') {
                try {
                    cancelAnimationFrame(this.animationId as number);
                } catch (e) {
                    // Fallback to clearTimeout if cancelAnimationFrame fails
                    clearTimeout(this.animationId as number);
                }
            } else {
                clearTimeout(this.animationId as number);
            }
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

        // Clear particles array
        this.particles = [];

        // Remove from instances map
        PIXEffect_fog.instances.delete(this.id);

        // Clear from editor if this was being edited
        if (PIXEffect_fog.currentEditingFog === this) {
            PIXEffect_fog.currentEditingFog = null;
        }

        console.log(`Fog effect ${this.id} destroyed (particles cleared, performance optimized)`);
    }

    /**
     * Gracefully destroys the fog with fade-out animation
     */
    public destroyWithFadeOut(): void {
        if (this.isDestroyed || this.isFadingOut) return;

        console.log(`Starting graceful destruction of fog ${this.id} with fade-out`);
        this.startFadeOut();
    }

    /**
     * Gracefully destroys a fog by ID with fade-out animation
     * @param id Fog ID to destroy
     */
    public static DestroyFogWithFadeOut(id: string): boolean {
        const fog = PIXEffect_fog.instances.get(id);
        if (fog && !fog.isDestroyed) {
            fog.destroyWithFadeOut();
            return true;
        }
        return false;
    }

    /**
     * Sets the fade-out duration for all fog effects
     * @param duration Duration in milliseconds
     */
    public static SetFadeOutDuration(duration: number): void {
        if (duration > 0) {
            PIXEffect_fog.FADE_OUT_DURATION = duration;
            console.log(`Set fog fade-out duration to ${duration}ms`);
        }
    }

    /**
     * Shows fade duration
     */
    public static GetFadeOutDuration(): number {
        return PIXEffect_fog.FADE_OUT_DURATION;
    }

    /**
     * Sets global performance mode
     * @param enabled Enable performance mode (reduces particle count by 50%)
     */
    public static SetPerformanceMode(enabled: boolean): void {
        PIXEffect_fog.PERFORMANCE_MODE = enabled;
        console.log(`Performance mode ${enabled ? 'enabled' : 'disabled'}`);

        // Reinitialize all existing fog particles
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                fog.initParticles();
            }
        });
    }

    /**
     * Sets maximum particles per fog instance
     * @param maxParticles Maximum particles per fog
     */
    public static SetMaxParticlesPerFog(maxParticles: number): void {
        PIXEffect_fog.MAX_PARTICLES_PER_FOG = Math.max(10, maxParticles);
        console.log(`Max particles per fog set to: ${PIXEffect_fog.MAX_PARTICLES_PER_FOG}`);

        // Reinitialize all existing fog particles
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                fog.initParticles();
            }
        });
    }

    /**
     * Sets global maximum particles
     * @param maxParticles Global maximum particles
     */
    public static SetMaxParticlesGlobal(maxParticles: number): void {
        PIXEffect_fog.MAX_PARTICLES_GLOBAL = Math.max(50, maxParticles);
        console.log(`Global max particles set to: ${PIXEffect_fog.MAX_PARTICLES_GLOBAL}`);

        // Reinitialize all existing fog particles
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                fog.initParticles();
            }
        });
    }

    /**
     * Enables or disables LOD (Level of Detail) system
     * @param enabled Enable LOD system
     */
    public static SetLODEnabled(enabled: boolean): void {
        PIXEffect_fog.LOD_ENABLED = enabled;
        console.log(`LOD system ${enabled ? 'enabled' : 'disabled'}`);

        // Reinitialize all existing fog particles
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                fog.initParticles();
            }
        });
    }

    /**
     * Sets animation update frequency
     * @param frequency Update frequency in milliseconds (lower = faster)
     */
    public static SetUpdateFrequency(frequency: number): void {
        PIXEffect_fog.UPDATE_FREQUENCY = Math.max(8, frequency);
        console.log(`Update frequency set to: ${PIXEffect_fog.UPDATE_FREQUENCY}ms`);
    }

    /**
     * Gets performance statistics for all fog instances
     */
    public static GetPerformanceStats(): any {
        let totalParticles = 0;
        let totalFogs = 0;
        let avgFrameTime = 0;
        let avgPerformanceLevel = 0;
        let lodStats = { full: 0, high: 0, medium: 0, low: 0 };

        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed) {
                totalFogs++;
                totalParticles += fog.getParticleCount();
                avgFrameTime += fog.getAverageFrameTime();
                avgPerformanceLevel += fog.getPerformanceLevel();

                // LOD statistics
                const lodLevel = fog.getLODLevel();
                if (lodLevel >= 1.0) lodStats.full++;
                else if (lodLevel >= 0.75) lodStats.high++;
                else if (lodLevel >= 0.5) lodStats.medium++;
                else lodStats.low++;
            }
        });

        if (totalFogs > 0) {
            avgFrameTime /= totalFogs;
            avgPerformanceLevel /= totalFogs;
        }

        return {
            totalFogs,
            totalParticles,
            maxParticlesGlobal: PIXEffect_fog.MAX_PARTICLES_GLOBAL,
            maxParticlesPerFog: PIXEffect_fog.MAX_PARTICLES_PER_FOG,
            performanceMode: PIXEffect_fog.PERFORMANCE_MODE,
            lodEnabled: PIXEffect_fog.LOD_ENABLED,
            updateFrequency: PIXEffect_fog.UPDATE_FREQUENCY,
            avgFrameTime: Math.round(avgFrameTime * 100) / 100,
            avgPerformanceLevel: Math.round(avgPerformanceLevel * 100) / 100,
            estimatedFPS: totalFogs > 0 ? Math.round(1000 / avgFrameTime) : 0,
            lodDistribution: lodStats
        };
    }

    /**
     * Optimizes all fog instances for better performance
     */
    public static OptimizeAllFog(): void {
        console.log("Optimizing all fog instances...");

        const stats = PIXEffect_fog.GetPerformanceStats();

        // Auto-enable performance mode if too many particles
        if (stats.totalParticles > PIXEffect_fog.MAX_PARTICLES_GLOBAL * 0.8) {
            PIXEffect_fog.SetPerformanceMode(true);
        }

        // Reduce update frequency if performance is poor
        if (stats.avgFrameTime > 20) {
            PIXEffect_fog.SetUpdateFrequency(Math.max(PIXEffect_fog.UPDATE_FREQUENCY * 1.5, 32));
        }

        // Enable LOD if not already enabled
        if (!PIXEffect_fog.LOD_ENABLED) {
            PIXEffect_fog.SetLODEnabled(true);
        }

        console.log("Optimization complete. New stats:", PIXEffect_fog.GetPerformanceStats());
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
     * Emergency cleanup that destroys all fog instances and orphaned HTML elements
     */
    public static EmergencyDestroyAllFog(): void {
        console.log("=== EMERGENCY FOG CLEANUP ===");
        
        // First, destroy all tracked instances
        const fogs = Array.from(PIXEffect_fog.instances.values());
        fogs.forEach(fog => {
            try {
                fog.destroy();
            } catch (error) {
                console.warn(`Error destroying fog ${fog.id}:`, error);
            }
        });
        
        // Clear the instances map completely
        PIXEffect_fog.instances.clear();
        
        // Find and destroy orphaned HTML elements that might contain fog
        try {
            const htmlElements = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.getAllInstances();
            let destroyedOrphans = 0;
            
            htmlElements.forEach((htmlElement: any) => {
                try {
                    // Check if this HTML element contains fog-related content
                    if (htmlElement.getContent && typeof htmlElement.getContent === 'function') {
                        const content = htmlElement.getContent();
                        if (content && (content.includes('fog-particle') || content.includes('fog-'))) {
                            console.log(`Destroying orphaned fog HTML element`);
                            htmlElement.destroy();
                            destroyedOrphans++;
                        }
                    }
                } catch (error) {
                    console.warn(`Error checking/destroying HTML element:`, error);
                }
            });
            
            console.log(`Destroyed ${destroyedOrphans} orphaned fog HTML elements`);
        } catch (error) {
            console.warn(`Error during orphaned HTML cleanup:`, error);
        }
        
        // Reset static counters
        PIXEffect_fog.idCounter = 0;
        PIXEffect_fog.currentEditingFog = null;
        
        console.log(`Emergency cleanup completed: destroyed ${fogs.length} tracked fogs`);
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

            // Performance section
            if (ImGui.CollapsingHeader("Performance")) {
                ImGui.Text(`Particles: ${fog.getParticleCount()}`);
                ImGui.Text(`LOD Level: ${(fog.getLODLevel() * 100).toFixed(0)}%`);
                ImGui.Text(`Performance Level: ${(fog.getPerformanceLevel() * 100).toFixed(0)}%`);
                ImGui.Text(`Avg Frame Time: ${fog.getAverageFrameTime().toFixed(1)}ms`);

                ImGui.Separator();

                if (ImGui.Button("Optimize This Fog")) {
                    // Force reinitialize particles with current settings
                    fog.initParticles();
                }

                ImGui.SameLine();
                if (ImGui.Button("Show Global Stats")) {
                    const stats = PIXEffect_fog.GetPerformanceStats();
                    console.log("Global Performance Stats:", stats);
                }
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

    /**
     * Opens real-time performance monitoring window
     */
    public static OpenPerformanceMonitor(): void {
        const windowId = "fog_performance_monitor";

        // Close existing window if open
        if (Imgui_chunchun.IsWindowOpen(windowId)) {
            Imgui_chunchun.DestroyWindow(windowId);
        }

        // Create performance monitoring window
        PIXEffect_fog.createPerformanceMonitorWindow(windowId);
    }

    /**
     * Creates the real-time performance monitoring window
     */
    private static createPerformanceMonitorWindow(windowId: string): void {
        let updateInterval = 500; // Update every 500ms
        let lastUpdateTime = 0;
        let autoOptimize = false;
        let showDetailedStats = true;
        let showIndividualFogs = false;

        const renderCallback = () => {
            const currentTime = Date.now();

            // Update stats at specified interval
            if (currentTime - lastUpdateTime >= updateInterval) {
                lastUpdateTime = currentTime;
            }

            const stats = PIXEffect_fog.GetPerformanceStats();

            // Header with refresh controls
            ImGui.Text("Fog Performance Monitor");
            ImGui.Separator();

            // Update frequency control
            ImGui.Text("Update Frequency:");
            ImGui.SameLine();
            let intervalMs = updateInterval;
            if (ImGui.SliderInt("##interval", (value = intervalMs) => intervalMs = value, 100, 2000)) {
                updateInterval = intervalMs;
            }
            ImGui.SameLine();
            ImGui.Text("ms");

            // Auto-optimize toggle
            if (ImGui.Checkbox("Auto Optimize", (value = autoOptimize) => autoOptimize = value)) {
                if (autoOptimize && (stats.avgFrameTime > 20 || stats.totalParticles > stats.maxParticlesGlobal * 0.8)) {
                    PIXEffect_fog.OptimizeAllFog();
                }
            }

            ImGui.Separator();

            // Main performance stats
            if (ImGui.CollapsingHeader("System Overview", ImGui.TreeNodeFlags.DefaultOpen)) {
                // Performance indicators with color coding
                const fps = stats.estimatedFPS;
                const fpsColor = fps >= 50 ? new ImGui.ImVec4(0, 1, 0, 1) : fps >= 30 ? new ImGui.ImVec4(1, 1, 0, 1) : new ImGui.ImVec4(1, 0, 0, 1);
                ImGui.TextColored(fpsColor, `Estimated FPS: ${fps}`);

                const frameTimeColor = stats.avgFrameTime <= 16 ? new ImGui.ImVec4(0, 1, 0, 1) : stats.avgFrameTime <= 25 ? new ImGui.ImVec4(1, 1, 0, 1) : new ImGui.ImVec4(1, 0, 0, 1);
                ImGui.TextColored(frameTimeColor, `Avg Frame Time: ${stats.avgFrameTime}ms`);

                ImGui.Text(`Performance Level: ${(stats.avgPerformanceLevel * 100).toFixed(1)}%`);

                // Particle usage with progress bar
                const particleUsage = stats.totalParticles / stats.maxParticlesGlobal;
                const usageColor = particleUsage <= 0.6 ? new ImGui.ImVec4(0, 1, 0, 1) : particleUsage <= 0.8 ? new ImGui.ImVec4(1, 1, 0, 1) : new ImGui.ImVec4(1, 0, 0, 1);
                ImGui.TextColored(usageColor, `Particles: ${stats.totalParticles}/${stats.maxParticlesGlobal}`);
                ImGui.ProgressBar(particleUsage, new ImGui.ImVec2(-1, 0), `${(particleUsage * 100).toFixed(1)}%`);
            }

            // System settings
            if (ImGui.CollapsingHeader("System Settings")) {
                ImGui.Text(`Performance Mode: ${stats.performanceMode ? 'ON' : 'OFF'}`);
                ImGui.Text(`LOD System: ${stats.lodEnabled ? 'ON' : 'OFF'}`);
                ImGui.Text(`Update Frequency: ${stats.updateFrequency}ms`);
                ImGui.Text(`Max Particles Per Fog: ${stats.maxParticlesPerFog}`);

                ImGui.Separator();

                // Quick optimization buttons
                if (ImGui.Button("Enable Performance Mode")) {
                    PIXEffect_fog.SetPerformanceMode(true);
                }
                ImGui.SameLine();
                if (ImGui.Button("Optimize All")) {
                    PIXEffect_fog.OptimizeAllFog();
                }
            }

            // LOD distribution
            if (ImGui.CollapsingHeader("LOD Distribution")) {
                const lodStats = stats.lodDistribution;
                ImGui.Text(`Full Detail: ${lodStats.full} fogs`);
                ImGui.Text(`High Detail: ${lodStats.high} fogs`);
                ImGui.Text(`Medium Detail: ${lodStats.medium} fogs`);
                ImGui.Text(`Low Detail: ${lodStats.low} fogs`);

                // LOD pie chart representation using progress bars
                const totalLOD = lodStats.full + lodStats.high + lodStats.medium + lodStats.low;
                if (totalLOD > 0) {
                    ImGui.Separator();
                    ImGui.ProgressBar(lodStats.full / totalLOD, new ImGui.ImVec2(-1, 0), `Full: ${lodStats.full}`);
                    ImGui.ProgressBar(lodStats.high / totalLOD, new ImGui.ImVec2(-1, 0), `High: ${lodStats.high}`);
                    ImGui.ProgressBar(lodStats.medium / totalLOD, new ImGui.ImVec2(-1, 0), `Med: ${lodStats.medium}`);
                    ImGui.ProgressBar(lodStats.low / totalLOD, new ImGui.ImVec2(-1, 0), `Low: ${lodStats.low}`);
                }
            }

            // Individual fog instances
            if (ImGui.Checkbox("Show Individual Fogs", (value = showIndividualFogs) => showIndividualFogs = value)) {
                // Checkbox state changed
            }

            if (showIndividualFogs && ImGui.CollapsingHeader("Individual Fog Instances")) {
                PIXEffect_fog.instances.forEach((fog, id) => {
                    if (!fog.isDestroyed) {
                        const debugInfo = fog.getDebugInfo();
                        const particleCount = fog.getParticleCount();
                        const lodLevel = fog.getLODLevel();
                        const perfLevel = fog.getPerformanceLevel();

                        if (ImGui.TreeNode(`${id} (${particleCount} particles)`)) {
                            ImGui.Text(`Type: ${debugInfo.type}`);
                            ImGui.Text(`Style: ${debugInfo.style}`);
                            ImGui.Text(`Size: ${debugInfo.size.width}x${debugInfo.size.height}`);
                            ImGui.Text(`LOD: ${(lodLevel * 100).toFixed(0)}%`);
                            ImGui.Text(`Performance: ${(perfLevel * 100).toFixed(0)}%`);
                            ImGui.Text(`Frame Time: ${fog.getAverageFrameTime().toFixed(1)}ms`);

                            if (ImGui.Button(`Edit##${id}`)) {
                                PIXEffect_fog.OpenFogEditor(id);
                            }
                            ImGui.SameLine();
                            if (ImGui.Button(`Destroy##${id}`)) {
                                fog.destroy();
                            }

                            ImGui.TreePop();
                        }
                    }
                });
            }

            // Performance warnings
            if (stats.avgFrameTime > 25 || stats.totalParticles > stats.maxParticlesGlobal * 0.9) {
                ImGui.Separator();
                ImGui.TextColored(new ImGui.ImVec4(1, 0.5, 0, 1), "⚠ Performance Warning");

                if (stats.avgFrameTime > 25) {
                    ImGui.TextColored(new ImGui.ImVec4(1, 0, 0, 1), "• Frame time too high");
                }
                if (stats.totalParticles > stats.maxParticlesGlobal * 0.9) {
                    ImGui.TextColored(new ImGui.ImVec4(1, 0, 0, 1), "• Particle limit nearly reached");
                }

                if (ImGui.Button("Auto Fix Performance Issues")) {
                    PIXEffect_fog.OptimizeAllFog();
                }
            }

            // Close button
            ImGui.Separator();
            if (ImGui.Button("Close Monitor")) {
                Imgui_chunchun.CloseWindow(windowId);
            }
        };

        // Create the window using Imgui_chunchun
        const windowConfig = {
            title: "Fog Performance Monitor",
            isOpen: true,
            size: { width: 450, height: 700 },
            position: { x: 50, y: 50 },
            renderCallback: renderCallback
        };

        // Manually add to windows map (accessing private member)
        (Imgui_chunchun as any).windows.set(windowId, windowConfig);
    }

    /**
     * Creates an optimized large-scale fog effect for full-screen or map-wide coverage
     * @param type Fog type
     * @param style Fog style
     * @param duration Duration in seconds
     * @param width Width of the fog area
     * @param height Height of the fog area
     * @param id Optional ID
     */
    public static GenerateLargeScaleFog(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        width: number = 1920,
        height: number = 1080,
        id?: string
    ): PIXEffect_fog {
        // Auto-enable performance optimizations for large fog
        const wasPerformanceMode = PIXEffect_fog.PERFORMANCE_MODE;
        const wasLODEnabled = PIXEffect_fog.LOD_ENABLED;

        // Temporarily enable optimizations
        PIXEffect_fog.PERFORMANCE_MODE = true;
        PIXEffect_fog.LOD_ENABLED = true;

        // Generate ID if not provided
        if (!id) {
            id = `large_scale_${type}_${style}_${Date.now()}`;
        }

        // Create the fog instance
        const fog = PIXEffect_fog.GenerateFog(type, style, duration, id);

        // Set size and optimize for large scale
        fog.setSize(width, height)
            .setPosition(0, 0);

        // Apply large-scale optimizations
        if (width * height > 1000000) { // Very large (1M+ pixels)
            fog.setDensity(0.3)  // Reduce density significantly
                .setLayers(2)     // Fewer layers
                .setScale(3.0)    // Larger particles to compensate
                .setBlur(25);     // More blur for smoother look
        } else if (width * height > 500000) { // Large (500K+ pixels)
            fog.setDensity(0.5)
                .setLayers(3)
                .setScale(2.5)
                .setBlur(20);
        } else { // Medium large
            fog.setDensity(0.7)
                .setLayers(3)
                .setScale(2.0)
                .setBlur(15);
        }

        // Restore original settings
        PIXEffect_fog.PERFORMANCE_MODE = wasPerformanceMode;
        PIXEffect_fog.LOD_ENABLED = wasLODEnabled;

        console.log(`Created optimized large-scale fog: ${width}x${height}, particles: ${fog.particles.length}`);

        return fog;
    }

    /**
     * Sets the fade-in duration for all fog effects
     * @param duration Duration in milliseconds
     */
    public static SetFadeInDuration(duration: number): void {
        if (duration > 0) {
            PIXEffect_fog.FADE_IN_DURATION = duration;
            console.log(`Set fog fade-in duration to ${duration}ms`);
        }
    }

    /**
     * Gets the fade-in duration
     */
    public static GetFadeInDuration(): number {
        return PIXEffect_fog.FADE_IN_DURATION;
    }

    /**
     * Creates an ImGui debug window for fog system
     */
    public static CreateImGuiFogDebugWindow(): void {
        const windowId = "fog_debug_window";
        
        // Close existing window if open
        if (Imgui_chunchun.IsWindowOpen(windowId)) {
            Imgui_chunchun.DestroyWindow(windowId);
        }
        
        // Create fog debug window
        const renderCallback = () => {
            const fogInfo = PIXEffect_fog.GetFogInfo();
            const performanceStats = PIXEffect_fog.GetPerformanceStats();
            
            // Fog Overview Section
            if (ImGui.CollapsingHeader("Fog Overview", ImGui.TreeNodeFlags.DefaultOpen)) {
                // Active fog count with visual indicator
                ImGui.Text(`Active Fog Instances: ${fogInfo.count}`);
                
                if (fogInfo.count > 0) {
                    const fogProgress = Math.min(fogInfo.count / 10.0, 1.0); // Max 10 for full bar
                    const progressColor = fogProgress > 0.8 ? 
                        new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0) : // Red if too many
                        new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0);   // Green if normal
                    ImGui.PushStyleColor(ImGui.Col.PlotHistogram, progressColor);
                    ImGui.ProgressBar(fogProgress, new ImGui.ImVec2(-1, 0), `${fogInfo.count} instances`);
                    ImGui.PopStyleColor();
                    
                    // List fog IDs
                    ImGui.Text("Fog IDs:");
                    ImGui.Indent();
                    fogInfo.fogs.forEach((id: string) => {
                        ImGui.BulletText(id);
                        ImGui.SameLine();
                        if (ImGui.SmallButton(`Edit##${id}`)) {
                            PIXEffect_fog.OpenFogEditor(id);
                        }
                        ImGui.SameLine();
                        if (ImGui.SmallButton(`Destroy##${id}`)) {
                            PIXEffect_fog.DestroyFogWithFadeOut(id);
                        }
                    });
                    ImGui.Unindent();
                }
                
                ImGui.Separator();
                
                // Quick fog creation buttons
                if (ImGui.Button("Create Test Fog", new ImGui.ImVec2(100, 25))) {
                    PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 10, "test_fog")
                        .setPosition(400, 300)
                        .setSize(400, 300);
                }
                ImGui.SameLine();
                if (ImGui.Button("Create Level Fog", new ImGui.ImVec2(100, 25))) {
                    PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LEVEL, 60, "level_fog")
                        .setPosition(0, 0)
                        .setSize(6000, 3000);
                }
            }
            
            // Performance Section
            if (ImGui.CollapsingHeader("Performance Stats", ImGui.TreeNodeFlags.DefaultOpen)) {
                if (performanceStats) {
                    // Particle usage
                    ImGui.Text(`Total Particles: ${performanceStats.totalParticles}/${performanceStats.maxParticlesGlobal}`);
                    const particleRatio = performanceStats.maxParticlesGlobal > 0 ? 
                        performanceStats.totalParticles / performanceStats.maxParticlesGlobal : 0;
                    ImGui.ProgressBar(particleRatio, new ImGui.ImVec2(-1, 0), 
                        `${(particleRatio * 100).toFixed(1)}% used`);
                    
                    // FPS with color coding
                    ImGui.Text("Estimated FPS:");
                    ImGui.SameLine();
                    const fpsColor = performanceStats.estimatedFPS >= 50 ? 
                        new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : // Green
                        performanceStats.estimatedFPS >= 30 ? 
                        new ImGui.ImVec4(1.0, 1.0, 0.3, 1.0) : // Yellow
                        new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0);   // Red
                    ImGui.TextColored(fpsColor, `${performanceStats.estimatedFPS}`);
                    
                    // Frame time slider-like display
                    ImGui.Text(`Avg Frame Time: ${performanceStats.avgFrameTime.toFixed(2)}ms`);
                    const frameTimeRatio = Math.min(performanceStats.avgFrameTime / 33.33, 1.0); // 33.33ms = 30fps
                    ImGui.ProgressBar(frameTimeRatio, new ImGui.ImVec2(-1, 0), 
                        `${performanceStats.avgFrameTime.toFixed(1)}ms`);
                    
                    // Performance settings with checkboxes
                    ImGui.Separator();
                    ImGui.Text("Performance Settings:");
                    
                    let perfMode = performanceStats.performanceMode;
                    if (ImGui.Checkbox("Performance Mode", (value = perfMode) => perfMode = value)) {
                        // Only trigger when checkbox is actually clicked
                        if (perfMode !== performanceStats.performanceMode) {
                            PIXEffect_fog.SetPerformanceMode(perfMode);
                        }
                    }
                    
                    let lodEnabled = performanceStats.lodEnabled;
                    if (ImGui.Checkbox("LOD System", (value = lodEnabled) => lodEnabled = value)) {
                        // Only trigger when checkbox is actually clicked
                        if (lodEnabled !== performanceStats.lodEnabled) {
                            PIXEffect_fog.SetLODEnabled(lodEnabled);
                        }
                    }
                    
                    // Particle limits with sliders
                    ImGui.Separator();
                    let maxParticlesPerFog = performanceStats.maxParticlesPerFog;
                    if (ImGui.SliderInt("Max Particles Per Fog", 
                        (value = maxParticlesPerFog) => maxParticlesPerFog = value, 10, 300)) {
                        // Only trigger when slider is actually changed
                        if (maxParticlesPerFog !== performanceStats.maxParticlesPerFog) {
                            PIXEffect_fog.SetMaxParticlesPerFog(maxParticlesPerFog);
                        }
                    }
                    
                    let maxParticlesGlobal = performanceStats.maxParticlesGlobal;
                    if (ImGui.SliderInt("Max Particles Global", 
                        (value = maxParticlesGlobal) => maxParticlesGlobal = value, 50, 1000)) {
                        // Only trigger when slider is actually changed
                        if (maxParticlesGlobal !== performanceStats.maxParticlesGlobal) {
                            PIXEffect_fog.SetMaxParticlesGlobal(maxParticlesGlobal);
                        }
                    }
                }
            }
            
            // LOD Distribution Section
            if (ImGui.CollapsingHeader("LOD Distribution")) {
                if (performanceStats && performanceStats.lodDistribution) {
                    const lod = performanceStats.lodDistribution;
                    const total = lod.full + lod.high + lod.medium + lod.low;
                    
                    if (total > 0) {
                        // LOD distribution with progress bars
                        ImGui.Text(`Full Detail: ${lod.full}`);
                        ImGui.ProgressBar(lod.full / total, new ImGui.ImVec2(-1, 0), `${lod.full}`);
                        
                        ImGui.Text(`High Detail: ${lod.high}`);
                        ImGui.ProgressBar(lod.high / total, new ImGui.ImVec2(-1, 0), `${lod.high}`);
                        
                        ImGui.Text(`Medium Detail: ${lod.medium}`);
                        ImGui.ProgressBar(lod.medium / total, new ImGui.ImVec2(-1, 0), `${lod.medium}`);
                        
                        ImGui.Text(`Low Detail: ${lod.low}`);
                        ImGui.ProgressBar(lod.low / total, new ImGui.ImVec2(-1, 0), `${lod.low}`);
                    } else {
                        ImGui.Text("No fog instances for LOD analysis");
                    }
                }
            }
            
            // Quick Actions Section
            if (ImGui.CollapsingHeader("Quick Actions")) {
                // Cleanup actions
                if (ImGui.Button("Destroy All Fog", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.DestroyAllFog();
                }
                ImGui.SameLine();
                if (ImGui.Button("Emergency Cleanup", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.EmergencyDestroyAllFog();
                }
                
                ImGui.Separator();
                
                // Optimization actions
                if (ImGui.Button("Optimize All Fog", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.OptimizeAllFog();
                }
                ImGui.SameLine();
                if (ImGui.Button("Open Performance Monitor", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.OpenPerformanceMonitor();
                }
                
                ImGui.Separator();
                
                // Fade duration controls
                ImGui.Text("Fade Duration Controls:");
                if (ImGui.Button("Fast Fade (500ms)", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.SetFadeOutDuration(500);
                }
                ImGui.SameLine();
                if (ImGui.Button("Normal Fade (2000ms)", new ImGui.ImVec2(120, 25))) {
                    PIXEffect_fog.SetFadeOutDuration(2000);
                }
            }
            
            // System Info Section
            if (ImGui.CollapsingHeader("System Info")) {
                ImGui.Text(`Fade Out Duration: ${PIXEffect_fog.GetFadeOutDuration()}ms`);
                ImGui.Text(`Fade In Duration: ${PIXEffect_fog.GetFadeInDuration()}ms`);
                ImGui.Text(`Update Frequency: ${performanceStats?.updateFrequency || 'N/A'}ms`);
                
                ImGui.Separator();
                ImGui.Text("Window auto-refreshes every frame");
            }
            
            // Close button
            ImGui.Separator();
            if (ImGui.Button("Close Debug Window", new ImGui.ImVec2(-1, 30))) {
                Imgui_chunchun.CloseWindow(windowId);
            }
        };
        
        // Create the window
        const windowConfig = {
            title: "Fog System Debug",
            isOpen: true,
            size: { width: 450, height: 700 },
            position: { x: 500, y: 50 },
            renderCallback: renderCallback
        };
        
        // Manually add to windows map
        (Imgui_chunchun as any).windows.set(windowId, windowConfig);
        
        console.log("Fog debug window created");
    }
}


// For test
var isBindButtonIntoDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {


    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
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

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Performance Monitor", () => {
        PIXEffect_fog.OpenPerformanceMonitor();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Open ImGui Fog Debug", () => {
        PIXEffect_fog.CreateImGuiFogDebugWindow();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate bIG Fog FOR WHOLE GAME", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.LEVEL, 0, "whole_level_fog")
            .setPosition(0, 0)
            .setSize(6000, 3000)

        PIXEffect_fog.OpenFogEditor("whole_level_fog");
        PIXEffect_fog.OpenPerformanceMonitor();

    })

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate OPTIMIZED Large Fog", () => {
        // Use the new optimized method for large-scale fog
        const optimizedFog = PIXEffect_fog.GenerateLargeScaleFog(
            FogType.TEMPORARY,
            FogStyle.MYSTICAL,
            60,
            1920,
            1080,
            "optimized_large_fog"
        ).setLayer("HtmlUI_fix")
            .setOpacity(0.4)
            .setSpeed(0.6);

        PIXEffect_fog.OpenFogEditor("optimized_large_fog");

        // Show performance comparison
        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("=== Optimized Large Fog Performance ===");
            console.log(`Particles created: ${optimizedFog.getParticleCount()}`);
            console.log(`LOD Level: ${optimizedFog.getLODLevel()}`);
            console.log("Global stats:", stats);
        }, 500);
    });

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

    IMGUIDebugButton.AddButtonToCategory(fog_system, "EMERGENCY FOG CLEANUP", () => {
        PIXEffect_fog.EmergencyDestroyAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fog Info", () => {
        const info = PIXEffect_fog.GetFogInfo();
        console.log(`Active fog effects: ${info.count}`);
        console.log(`Fog IDs: ${info.fogs.join(", ")}`);

        // Show detailed info for each fog
        info.fogs.forEach(fogId => {
            const fog = PIXEffect_fog.GetFog(fogId);
            if (fog) {
                console.log(`Fog ${fogId}:`, fog.getDebugInfo());
            }
        });
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Edit Whole Level Fog", () => {
        const fog = PIXEffect_fog.GetFog("whole_level_fog");
        if (fog) {
            PIXEffect_fog.OpenFogEditor("whole_level_fog");
        } else {
            console.log("Whole level fog not found. Available fogs:", PIXEffect_fog.GetFogInfo().fogs);
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fade-out (3s fog)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 3, "fade_test")
            .setPosition(x - 150, y - 150)
            .setSize(300, 300)
            .setOpacity(0.8)
            .setColor("#4fc3f7");

        console.log("Created 3-second fog to test fade-out effect");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Fast Fade (500ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Normal Fade (2000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(2000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Slow Fade (5000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(5000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fade Duration", () => {
        const duration = PIXEffect_fog.GetFadeOutDuration();
        console.log(`Current fade-out duration: ${duration}ms`);
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

    // Performance optimization buttons
    var performance_category = IMGUIDebugButton.AddCategory("fog_performance");

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Open Performance Monitor", () => {
        PIXEffect_fog.OpenPerformanceMonitor();
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Show Performance Stats", () => {
        const stats = PIXEffect_fog.GetPerformanceStats();
        console.log("=== Fog Performance Statistics ===");
        console.log(`Total Fogs: ${stats.totalFogs}`);
        console.log(`Total Particles: ${stats.totalParticles}/${stats.maxParticlesGlobal}`);
        console.log(`Max Particles Per Fog: ${stats.maxParticlesPerFog}`);
        console.log(`Performance Mode: ${stats.performanceMode ? 'ON' : 'OFF'}`);
        console.log(`LOD System: ${stats.lodEnabled ? 'ON' : 'OFF'}`);
        console.log(`Update Frequency: ${stats.updateFrequency}ms`);
        console.log(`Average Frame Time: ${stats.avgFrameTime}ms`);
        console.log(`Estimated FPS: ${stats.estimatedFPS}`);
        console.log(`Performance Level: ${(stats.avgPerformanceLevel * 100).toFixed(1)}%`);
        console.log(`LOD Distribution:`, stats.lodDistribution);
        console.log("================================");
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Enable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(true);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Disable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(false);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Low Particle Limit (50)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(50);
        PIXEffect_fog.SetMaxParticlesGlobal(200);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Medium Particle Limit (100)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(100);
        PIXEffect_fog.SetMaxParticlesGlobal(400);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set High Particle Limit (200)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(200);
        PIXEffect_fog.SetMaxParticlesGlobal(800);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Enable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(true);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Disable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(false);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Fast Updates (8ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(8);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Normal Updates (16ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(16);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Slow Updates (32ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(32);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Auto Optimize All Fog", () => {
        PIXEffect_fog.OptimizeAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Test Large Fog Performance", () => {
        // Create multiple large fog instances to test performance
        console.log("Creating large fog instances for performance testing...");

        for (let i = 0; i < 3; i++) {
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 30, `perf_test_${i}`)
                .setPosition(i * 640, 0)
                .setSize(1920, 1080)
                .setOpacity(0.3)
                .setDensity(1.0);
        }

        // Show stats after creation
        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("Performance test results:", stats);
        }, 1000);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Reset Performance Settings", () => {
        PIXEffect_fog.SetPerformanceMode(false);
        PIXEffect_fog.SetMaxParticlesPerFog(150);
        PIXEffect_fog.SetMaxParticlesGlobal(500);
        PIXEffect_fog.SetLODEnabled(true);
        PIXEffect_fog.SetUpdateFrequency(16);
        console.log("Performance settings reset to defaults");
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

    // Fade-in controls
    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Fast Fade-in (500ms)", () => {
        PIXEffect_fog.SetFadeInDuration(500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Normal Fade-in (1500ms)", () => {
        PIXEffect_fog.SetFadeInDuration(1500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Slow Fade-in (3000ms)", () => {
        PIXEffect_fog.SetFadeInDuration(3000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fade-in Duration", () => {
        const fadeInDuration = PIXEffect_fog.GetFadeInDuration();
        const fadeOutDuration = PIXEffect_fog.GetFadeOutDuration();
        console.log(`Current fade-in duration: ${fadeInDuration}ms`);
        console.log(`Current fade-out duration: ${fadeOutDuration}ms`);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fade-in Effect", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("Creating fog with fade-in effect...");
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 10, "fade_in_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#9c27b0");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Graceful Replacement", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        // Create first fog
        console.log("Creating first fog...");
        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.HEAVY, 0, "replacement_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#ff0000");

        // Replace it after 3 seconds
        setTimeout(() => {
            console.log("Replacing with new fog (should fade out old one)...");
            PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MYSTICAL, 0, "replacement_test")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300)
                .setOpacity(0.8)
                .setColor("#00ff00");
        }, 3000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Graceful Destroy", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            const fogId = fogInfo.fogs[0];
            console.log(`Gracefully destroying fog: ${fogId}`);
            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
        } else {
            console.log("No fog to destroy");
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Destroy All Fog Gracefully", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        console.log(`Gracefully destroying ${fogInfo.count} fog effects...`);

        fogInfo.fogs.forEach(fogId => {
            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
        });
    });
}); 