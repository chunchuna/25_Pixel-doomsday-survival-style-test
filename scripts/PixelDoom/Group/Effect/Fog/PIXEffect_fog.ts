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

    // Add pending fog creation system
    private static pendingFogCreations: Map<string, {
        type: FogType,
        style: FogStyle,
        duration: number,
        layer: string,
        callback?: (fog: PIXEffect_fog) => void,
        // Store additional properties for proper replacement
        position?: { x: number, y: number },
        size?: { width: number, height: number },
        fogParams?: any,
        customSettings?: {
            scale?: number,
            speed?: number,
            opacity?: number,
            color?: string,
            density?: number,
            layers?: number,
            blur?: number,
            noiseScale?: number,
            fadeEdges?: number,
            mixBlendMode?: string,
            particleVariation?: number
        }
    }> = new Map();

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
    protected duration: number = 0; // Duration in seconds (0 = persistent)

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

    // Dynamic fog properties
    protected isDynamic: boolean = false;
    protected dynamicConfig: {
        intensityRange: { min: number, max: number },
        sizeRange: { min: number, max: number },
        changeInterval: { min: number, max: number },
        disappearChance: number,
        disappearDuration: { min: number, max: number },
        transitionDuration: number,
        weatherInfluence: boolean,
        naturalVariation: boolean
    } | null = null;

    // Dynamic state tracking
    protected dynamicState: {
        currentIntensity: number,
        targetIntensity: number,
        currentSize: number,
        targetSize: number,
        isDisappeared: boolean,
        lastChangeTime: number,
        nextChangeTime: number,
        transitionStartTime: number,
        transitionDuration: number,
        baseOpacity: number,
        baseScale: number,
        baseDensity: number
    } | null = null;

    // Dynamic timer for C3
    protected dynamicTimer: any = null;
    protected dynamicTimerTag: string = "";

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

    // 首先，我需要在类中添加一个属性来跟踪计时器开始时间
    private timerStartTime: number = 0;

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

        
    }

    /**
     * Generates a new fog effect
     * @param type Fog type (persistent or temporary)
     * @param style Visual style of the fog
     * @param duration Duration in seconds (only for temporary fog, 0 = persistent)
     * @param id Optional unique identifier
     * @param layer Optional layer name (defaults to "html_c3")
     */
    public static GenerateFog(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        id?: string,
        layer: string = "html_c3"
    ): PIXEffect_fog {
        // Generate ID if not provided
        if (!id) {
            id = `auto_${type}_${style}_${Date.now()}`;
        }

        // Check if instance with this ID already exists
        if (PIXEffect_fog.instances.has(id)) {
            const existingFog = PIXEffect_fog.instances.get(id);
            if (existingFog && !existingFog.isDestroyed) {
                

                // Capture existing fog properties for replacement
                const existingProperties = {
                    position: { x: existingFog._x, y: existingFog._y },
                    size: { width: existingFog._width, height: existingFog._height },
                    fogParams: { ...existingFog.fogParams },
                    customSettings: {
                        // We'll apply new settings, but keep existing ones as fallback
                    }
                };

                // If existing fog is already fading out, queue the new fog creation
                if (existingFog.isFadingOut) {
                    
                    PIXEffect_fog.pendingFogCreations.set(id, {
                        type,
                        style,
                        duration,
                        layer,
                        position: existingProperties.position,
                        size: existingProperties.size,
                        fogParams: existingProperties.fogParams
                    });
                    return existingFog; // Return existing fog for now
                }

                // If existing fog is not fading out, start fade-out and queue new creation
                
                PIXEffect_fog.pendingFogCreations.set(id, {
                    type,
                    style,
                    duration,
                    layer,
                    position: existingProperties.position,
                    size: existingProperties.size,
                    fogParams: existingProperties.fogParams
                });

                existingFog.startFadeOut();
                return existingFog; // Return existing fog for now
            }
        }

        // No existing fog or existing fog is destroyed, create new one immediately
        const instance = new PIXEffect_fog(type, style, duration, layer);
        instance.id = id; // Override the auto-generated ID
        PIXEffect_fog.instances.set(id, instance);

        
        return instance;
    }

    /**
     * Generates a dynamic fog effect that continuously changes in intensity, size, and sometimes disappears
     * @param style Visual style of the fog
     * @param id Unique identifier for the dynamic fog
     * @param layer Optional layer name (defaults to "html_c3")
     * @param config Dynamic fog configuration
     */
    public static GenerateDynamicFog(
        style: FogStyle = FogStyle.MEDIUM,
        id?: string,
        layer: string = "html_c3",
        config?: {
            intensityRange?: { min: number, max: number },      // Opacity/density variation range (0-1)
            sizeRange?: { min: number, max: number },           // Size scale variation range (0.5-3.0)
            changeInterval?: { min: number, max: number },      // Time between changes in seconds
            disappearChance?: number,                           // Chance to completely disappear (0-1)
            disappearDuration?: { min: number, max: number },   // How long to stay disappeared
            transitionDuration?: number,                        // How long transitions take
            weatherInfluence?: boolean,                         // Whether weather affects fog behavior
            naturalVariation?: boolean                          // Enable natural random variations
        }
    ): PIXEffect_fog {
        // Generate ID if not provided
        if (!id) {
            id = `dynamic_${style}_${Date.now()}`;
        }

        // Default dynamic configuration
        const defaultConfig = {
            intensityRange: { min: 0.1, max: 0.9 },
            sizeRange: { min: 0.7, max: 2.5 },
            changeInterval: { min: 15, max: 45 },
            disappearChance: 0.15,
            disappearDuration: { min: 10, max: 30 },
            transitionDuration: 8,
            weatherInfluence: true,
            naturalVariation: true
        };

        const finalConfig = { ...defaultConfig, ...config };

        // Check if dynamic fog with this ID already exists
        if (PIXEffect_fog.instances.has(id)) {
            const existingFog = PIXEffect_fog.instances.get(id);
            if (existingFog && !existingFog.isDestroyed) {
                
                existingFog.updateDynamicConfig(finalConfig);
                return existingFog;
            }
        }

        // Create new dynamic fog instance
        const instance = new PIXEffect_fog(FogType.PERSISTENT, style, 0, layer);
        instance.id = id;
        PIXEffect_fog.instances.set(id, instance);

        // Initialize dynamic fog
        instance.initializeDynamicFog(finalConfig);

        
        return instance;
    }

    /**
     * Sets default parameters based on fog style
     */
    public setDefaultParameters(): void {
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
            } else if (this.isDynamic) {
                
            } else {
                
            }

        } catch (error: any) {
            console.error(`❌ Failed to create fog HTML element for ${this.id}: ${error.message}`);
            alert(`FAILED TO CREATE FOG: ${this.id} - ${error.message}`);
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
            this.timerStartTime = Date.now(); // Record start time

            // Listen for timer events
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    
                    this.startFadeOut();
                }
            });

            // Start the timer
            this.timerInstance.behaviors.Timer.startTimer(this.duration, this.timerTag, "once");
            

        } catch (error: any) {
            console.error(`Failed to create C3 timer for fog: ${error.message}`);
            // Fallback to JavaScript timer if C3 timer fails
            this.timerStartTime = Date.now();
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

        // Re-render with new opacity only if HTML element is valid
        if (this.htmlElement) {
            this.renderHTML();
        }

        // Continue fade-out or destroy when complete
        if (progress < 1.0) {
            // Continue fade-out animation
            setTimeout(() => this.fadeOutStep(), 16); // ~60 FPS
        } else {
            // Fade-out complete, destroy fog
            
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

        // Re-render with new opacity only if HTML element is valid
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
            
        }
    }

    /**
     * Starts auto-destroy timer for temporary fog
     */
    private startAutoDestroy(): void {
        // This method is now replaced by startC3Timer
        // Keeping it for compatibility but it does nothing
        
    }

    /**
     * Initializes fog particles with performance optimizations
     */
    private initParticles(): void {
        this.particles = [];

        // Calculate base particle count
        let baseParticleCount = Math.floor(this._width * this._height * 0.0001 * this.fogParams.density);

        // 为动态雾保证最小粒子数量
        if (this.isDynamic) {
            baseParticleCount = Math.max(baseParticleCount, 30); // 动态雾最少30个粒子
            
        }

        // Apply performance optimizations
        if (PIXEffect_fog.PERFORMANCE_MODE) {
            baseParticleCount = Math.floor(baseParticleCount * 0.7); // 减少性能模式的影响
        }

        // Apply LOD (Level of Detail) based on fog size
        if (PIXEffect_fog.LOD_ENABLED) {
            const area = this._width * this._height;
            if (area > 1000000) { // Very large fog (1000x1000+)
                this.lodLevel = 0.5; // 提高大雾的LOD级别
                baseParticleCount = Math.floor(baseParticleCount * 0.5);
            } else if (area > 500000) { // Large fog (700x700+)
                this.lodLevel = 0.75; // 提高LOD级别
                baseParticleCount = Math.floor(baseParticleCount * 0.75);
            } else if (area > 200000) { // Medium fog (450x450+)
                this.lodLevel = 0.9; // 提高LOD级别
                baseParticleCount = Math.floor(baseParticleCount * 0.9);
            } else {
                this.lodLevel = 1.0; // Small fog, full detail
            }
        }

        // Apply per-fog particle limit
        baseParticleCount = Math.min(baseParticleCount, PIXEffect_fog.MAX_PARTICLES_PER_FOG);

        // 为动态雾放宽全局粒子限制检查
        if (this.isDynamic) {
            // 动态雾不受全局粒子限制影响，确保可见性
            const finalParticleCount = Math.max(baseParticleCount, 25); // 至少25个粒子
            

            // 直接创建粒子，不检查全局限制
            this.createParticles(finalParticleCount);
        } else {
            // 静态雾使用原有的全局限制逻辑
            const currentGlobalParticles = this.getTotalActiveParticles();
            const availableParticles = PIXEffect_fog.MAX_PARTICLES_GLOBAL - currentGlobalParticles;
            const finalParticleCount = Math.min(baseParticleCount, Math.max(0, availableParticles));

            
            this.createParticles(finalParticleCount);
        }
    }

    // 新增：创建粒子的独立方法
    private createParticles(particleCount: number): void {
        // Create particles with optimized distribution
        for (let i = 0; i < particleCount; i++) {
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
        // Add comprehensive null checks and error handling
        if (!this.htmlElement) {
            
            return;
        }

        // Check if the HTML element is still valid (not destroyed)
        try {
            // Test if the element is still accessible
            if (!this.htmlElement.setContent || typeof this.htmlElement.setContent !== 'function') {
                
                this.handleInvalidElement();
                return;
            }

            // Additional check for element validity
            if (this.htmlElement.isDestroyed === true) {
                
                this.handleInvalidElement();
                return;
            }


            const fogHtml = this.generateFogHTML();

            // 检查生成的HTML内容
            if (!fogHtml || fogHtml.trim().length === 0) {
                console.error(`🌫️ Fog ${this.id}: Generated HTML is empty!`);
                return;
            }



            // 检查是否有可见的粒子
            const visibleParticles = this.particles.filter(p => {
                const layerOpacity = this.fogParams.opacity * p.opacity * (1 - p.layer * 0.15);
                return layerOpacity > 0.01; // 只有透明度大于0.01的才算可见
            });

            this.htmlElement.setContent(fogHtml, "html");

        } catch (error: any) {
            console.error(`🌫️ Fog ${this.id}: Error rendering HTML - ${error.message}`);
            console.error(`🌫️ Error stack:`, error.stack);
            // If we get an error, the element is likely invalid
            this.handleInvalidElement();
        }
    }

    /**
     * Handles invalid HTML element (likely due to scene change)
     */
    private handleInvalidElement(): void {
        

        // Mark element as null to prevent further render attempts
        this.htmlElement = null;

        // Stop animation to prevent further errors
        if (this.animationId) {
            if (typeof cancelAnimationFrame !== 'undefined') {
                try {
                    cancelAnimationFrame(this.animationId as number);
                } catch (e) {
                    clearTimeout(this.animationId as number);
                }
            } else {
                clearTimeout(this.animationId as number);
            }
            this.animationId = null;
        }

        // Optionally auto-destroy the fog instance
        // Uncomment the next line if you want fog to auto-destroy on scene change
        // this.destroy();
    }

    /**
     * Generates the HTML structure for the fog effect
     */
    private generateFogHTML(): string {

        if (this.particles.length === 0) {
            return `<div id="fog-${this.id}" style="position: relative; width: 100%; height: 100%; overflow: hidden; pointer-events: none;"><!-- No particles --></div>`;
        }

        let visibleParticleCount = 0;
        let totalOpacity = 0;

        const particlesHtml = this.particles.map((particle, index) => {
            const layerOpacity = this.fogParams.opacity * particle.opacity * (1 - particle.layer * 0.15);
            const layerScale = this.fogParams.scale * (1 - particle.layer * 0.05);
            const size = particle.size * layerScale;

            // 检查粒子是否可见
            if (layerOpacity <= 0.001 || size <= 0) {
                return ''; // 跳过不可见的粒子
            }

            visibleParticleCount++;
            totalOpacity += layerOpacity;

            const fogColor = this.hexToRgb(this.fogParams.color);

            // Create more natural gradient with noise-like effect
            const noiseValue = Math.sin(particle.noiseOffset) * 0.1 + 0.9;
            const finalOpacity = layerOpacity * noiseValue;

            // Calculate blur based on layer and settings
            const blurAmount = this.fogParams.blur + particle.layer * 2;

            // 确保粒子在可见区域内
            const particleX = Math.max(-size, Math.min(this._width + size, particle.x - size));
            const particleY = Math.max(-size, Math.min(this._height + size, particle.y - size));

            return `
            <div class="fog-particle" style="
                position: absolute;
                left: ${particleX}px;
                top: ${particleY}px;
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
        }).filter(html => html.length > 0).join('');
        ;

        if (visibleParticleCount === 0) {
            console.error(`🌫️ Fog ${this.id}: No visible particles generated! All particles are transparent or too small.`);
            // 生成一个测试粒子来确保有内容
            const testParticle = `
            <div class="fog-particle-test" style="
                position: absolute;
                left: 100px;
                top: 100px;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, 
                    rgba(255, 255, 255, 0.5) 0%, 
                    rgba(255, 255, 255, 0.2) 50%, 
                    rgba(255, 255, 255, 0) 100%);
                pointer-events: none;
                z-index: 1000;
            "></div>`;

            return `
            <div id="fog-${this.id}" style="
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
                filter: contrast(1.1) brightness(0.95);
                border: 2px solid red; /* Debug border */
            ">
                ${testParticle}
                <!-- Debug: No visible particles -->
            </div>`;
        }

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

            // Add check for valid HTML element before continuing animation
            if (!this.htmlElement) {
                
                return;
            }

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

                // Only re-render if particles were actually updated and HTML element is valid
                if ((this.skipFrames === 0 || this.frameCount % (this.skipFrames + 1) === 0) && this.htmlElement) {
                    this.renderHTML();
                }

                this.lastUpdateTime = currentTime;
            }

            // Continue animation only if not destroyed and HTML element is valid
            if (!this.isDestroyed && this.htmlElement) {
                // Use requestAnimationFrame when available, fallback to setTimeout
                if (typeof requestAnimationFrame !== 'undefined') {
                    this.animationId = requestAnimationFrame(animate) as any;
                } else {
                    this.animationId = setTimeout(animate, Math.max(8, targetFrameTime)) as any;
                }
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
            isFadingOut: this.isFadingOut,
            isFadingIn: this.isFadingIn,
            hasHtmlElement: !!this.htmlElement,
            hasTimerInstance: !!this.timerInstance,
            timerTag: this.timerTag,
            timerStartTime: this.timerStartTime,
            position: { x: this._x, y: this._y },
            size: { width: this._width, height: this._height },
            duration: this.duration,
            currentOpacity: this.fogParams.opacity,
            fadeProgress: this.isFadingOut ?
                Math.min((Date.now() - this.fadeStartTime) / PIXEffect_fog.FADE_OUT_DURATION, 1.0) :
                (this.isFadingIn ? Math.min((Date.now() - this.fadeInStartTime) / PIXEffect_fog.FADE_IN_DURATION, 1.0) : 0)
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
        // ADD DETAILED DEBUG TRACKING
        
        
        
        

        // Get call stack to see what's calling destroy
        try {
            throw new Error("Stack trace for fog destroy");
        } catch (e: any) {
            
        }

        // Alert for immediate visibility
        alert(`FOG DESTROYED: ${this.id} (Type: ${this.type}, Dynamic: ${this.isDynamic})`);

        this.isDestroyed = true;

        // Clear dynamic timer if exists
        if (this.dynamicTimer) {
            try {
                if (this.dynamicTimerTag && this.dynamicTimer.behaviors.Timer.isTimerRunning(this.dynamicTimerTag)) {
                    this.dynamicTimer.behaviors.Timer.stopTimer(this.dynamicTimerTag);
                }
                this.dynamicTimer.destroy();
            } catch (error: any) {
                
            }
            this.dynamicTimer = null;
        }

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

        // Destroy HTML element with better error handling
        if (this.htmlElement) {
            try {
                // Check if destroy method exists and element is not already destroyed
                if (this.htmlElement.destroy && typeof this.htmlElement.destroy === 'function') {
                    this.htmlElement.destroy();
                }
            } catch (error: any) {
                
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

        // Check if there's a pending fog creation for this ID
        if (PIXEffect_fog.pendingFogCreations.has(this.id)) {
            const pendingFog = PIXEffect_fog.pendingFogCreations.get(this.id)!;
            PIXEffect_fog.pendingFogCreations.delete(this.id);

            

            // Create the pending fog after a short delay to ensure cleanup is complete
            setTimeout(() => {
                const newFog = new PIXEffect_fog(pendingFog.type, pendingFog.style, pendingFog.duration, pendingFog.layer);
                newFog.id = this.id; // Use the same ID
                PIXEffect_fog.instances.set(this.id, newFog);

                // Apply saved properties if they exist
                if (pendingFog.position) {
                    newFog.setPosition(pendingFog.position.x, pendingFog.position.y);
                }

                if (pendingFog.size) {
                    newFog.setSize(pendingFog.size.width, pendingFog.size.height);
                }

                // Apply saved fog parameters (this preserves the visual settings)
                if (pendingFog.fogParams) {
                    // First set the new style's default parameters
                    newFog.setDefaultParameters();
                    // Then apply the saved parameters to maintain visual consistency
                    newFog.updateFogParams(pendingFog.fogParams);
                }

                // Apply any custom settings if they exist
                if (pendingFog.customSettings) {
                    const settings = pendingFog.customSettings;
                    if (settings.scale !== undefined) newFog.setScale(settings.scale);
                    if (settings.speed !== undefined) newFog.setSpeed(settings.speed);
                    if (settings.opacity !== undefined) newFog.setOpacity(settings.opacity);
                    if (settings.color !== undefined) newFog.setColor(settings.color);
                    if (settings.density !== undefined) newFog.setDensity(settings.density);
                    if (settings.layers !== undefined) newFog.setLayers(settings.layers);
                    if (settings.blur !== undefined) newFog.setBlur(settings.blur);
                    if (settings.noiseScale !== undefined) newFog.setNoiseScale(settings.noiseScale);
                    if (settings.fadeEdges !== undefined) newFog.setFadeEdges(settings.fadeEdges);
                    if (settings.mixBlendMode !== undefined) newFog.setMixBlendMode(settings.mixBlendMode);
                    if (settings.particleVariation !== undefined) newFog.setParticleVariation(settings.particleVariation);
                }

                

                // Call callback if provided
                if (pendingFog.callback) {
                    pendingFog.callback(newFog);
                }
            }, 100); // Small delay to ensure cleanup
        }

        
    }

    /**
     * Gracefully destroys the fog with fade-out animation
     */
    public destroyWithFadeOut(): void {
        if (this.isDestroyed || this.isFadingOut) return;

        
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
        
    }

    /**
     * Emergency cleanup that destroys all fog instances and orphaned HTML elements
     */
    public static EmergencyDestroyAllFog(): void {
        

        // Get call stack to see what's calling this
        try {
            throw new Error("Stack trace for emergency cleanup");
        } catch (e: any) {
            
        }

        alert("EMERGENCY FOG CLEANUP CALLED - Check console for details");

        // Clear all pending fog creations first
        const pendingCount = PIXEffect_fog.pendingFogCreations.size;
        PIXEffect_fog.pendingFogCreations.clear();
        

        // First, try graceful cleanup
        const fogs = Array.from(PIXEffect_fog.instances.values());
        fogs.forEach(fog => {
            try {
                fog.destroy();
            } catch (error) {
                
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
                            
                            if (htmlElement.destroy && typeof htmlElement.destroy === 'function') {
                                htmlElement.destroy();
                                destroyedOrphans++;
                            }
                        }
                    }
                } catch (error) {
                    
                }
            });

            
        } catch (error) {
            
        }

        // Reset static counters
        PIXEffect_fog.idCounter = 0;
        PIXEffect_fog.currentEditingFog = null;

        
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

                // Show fade status
                const isFadingOut = (fog as any).isFadingOut;
                const isFadingIn = (fog as any).isFadingIn;
                if (isFadingOut) {
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), "Status: FADING OUT");
                } else if (isFadingIn) {
                    ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.5, 1.0), "Status: FADING IN");
                } else {
                    ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0), "Status: ACTIVE");
                }

                // Show pending fog info
                const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
                if (pendingInfo.count > 0) {
                    ImGui.Separator();
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), `Pending Fogs: ${pendingInfo.count}`);
                    pendingInfo.pending.forEach(pendingId => {
                        ImGui.BulletText(pendingId);
                    });
                }

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

                        // Check if fog is fading out or fading in
                        const isFadingOut = (fog as any).isFadingOut;
                        const isFadingIn = (fog as any).isFadingIn;

                        // Create status indicator
                        let statusText = "";
                        let statusColor = new ImGui.ImVec4(1.0, 1.0, 1.0, 1.0); // White default

                        if (isFadingOut) {
                            statusText = " [FADING OUT]";
                            statusColor = new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0); // Orange
                        } else if (isFadingIn) {
                            statusText = " [FADING IN]";
                            statusColor = new ImGui.ImVec4(0.0, 1.0, 0.5, 1.0); // Green
                        } else {
                            statusText = " [ACTIVE]";
                            statusColor = new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0); // Green
                        }

                        if (ImGui.TreeNode(`${id} (${particleCount} particles)${statusText}`)) {
                            // Show status with color
                            ImGui.Text("Status:");
                            ImGui.SameLine();
                            ImGui.TextColored(statusColor, statusText.trim());

                            // Show fade progress if fading
                            if (isFadingOut || isFadingIn) {
                                const fadeStartTime = isFadingOut ? (fog as any).fadeStartTime : (fog as any).fadeInStartTime;
                                const fadeDuration = isFadingOut ? PIXEffect_fog.GetFadeOutDuration() : PIXEffect_fog.GetFadeInDuration();
                                const elapsed = Date.now() - fadeStartTime;
                                const progress = Math.min(elapsed / fadeDuration, 1.0);

                                ImGui.Text(`Fade Progress: ${(progress * 100).toFixed(1)}%`);
                                ImGui.ProgressBar(progress, new ImGui.ImVec2(-1, 0), `${(progress * 100).toFixed(1)}%`);

                                // Show current opacity
                                const currentOpacity = (fog as any).fogParams.opacity;
                                ImGui.Text(`Current Opacity: ${(currentOpacity * 100).toFixed(1)}%`);
                            }

                            // Show temporary fog duration progress
                            if (debugInfo.type === "temporary" && debugInfo.duration > 0 && !isFadingOut) {
                                const timerInstance = (fog as any).timerInstance;
                                const timerTag = (fog as any).timerTag;
                                const timerStartTime = (fog as any).timerStartTime || Date.now();

                                let remainingTime = 0;
                                let elapsedTime = 0;
                                let progress = 0;
                                let timerMethod = "Unknown";

                                // Method 1: Try to get remaining time from C3 timer
                                if (timerInstance && timerTag) {
                                    try {
                                        // Try different possible API methods
                                        if (timerInstance.behaviors && timerInstance.behaviors.Timer) {
                                            const timer = timerInstance.behaviors.Timer;

                                            // Try method 1: getRemainingTime
                                            if (typeof timer.getRemainingTime === 'function') {
                                                remainingTime = timer.getRemainingTime(timerTag);
                                                elapsedTime = debugInfo.duration - remainingTime;
                                                progress = Math.min(elapsedTime / debugInfo.duration, 1.0);
                                                timerMethod = "C3 getRemainingTime";
                                            }
                                            // Try method 2: check if timer is running and calculate manually
                                            else if (typeof timer.isTimerRunning === 'function' && timer.isTimerRunning(timerTag)) {
                                                const currentTime = Date.now();
                                                const elapsedMs = currentTime - timerStartTime;
                                                elapsedTime = elapsedMs / 1000;
                                                remainingTime = Math.max(0, debugInfo.duration - elapsedTime);
                                                progress = Math.min(elapsedTime / debugInfo.duration, 1.0);
                                                timerMethod = "C3 isTimerRunning + manual calc";
                                            }
                                            // Try method 3: access timer properties directly
                                            else if (timer.timers && timer.timers[timerTag]) {
                                                const timerObj = timer.timers[timerTag];
                                                if (timerObj.remainingTime !== undefined) {
                                                    remainingTime = timerObj.remainingTime;
                                                    elapsedTime = debugInfo.duration - remainingTime;
                                                    progress = Math.min(elapsedTime / debugInfo.duration, 1.0);
                                                    timerMethod = "C3 direct timer access";
                                                }
                                            }
                                        }
                                    } catch (error: any) {
                                        
                                    }
                                }

                                // Fallback: Calculate based on start time
                                if (timerMethod === "Unknown" || remainingTime === 0) {
                                    const currentTime = Date.now();
                                    const elapsedMs = currentTime - timerStartTime;
                                    elapsedTime = elapsedMs / 1000;
                                    remainingTime = Math.max(0, debugInfo.duration - elapsedTime);
                                    progress = Math.min(elapsedTime / debugInfo.duration, 1.0);
                                    timerMethod = "Fallback calculation";
                                }

                                ImGui.Separator();
                                ImGui.Text("Temporary Fog Timer:");
                                ImGui.Text(`Method: ${timerMethod}`);
                                ImGui.Text(`Remaining: ${remainingTime.toFixed(1)}s / ${debugInfo.duration}s`);
                                ImGui.Text(`Elapsed: ${elapsedTime.toFixed(1)}s`);

                                // Show timer instance info for debugging
                                if (timerInstance) {
                                    ImGui.Text(`Timer Instance: ${timerInstance ? 'EXISTS' : 'NULL'}`);
                                    ImGui.Text(`Timer Tag: ${timerTag || 'NONE'}`);

                                    // Try to show timer status
                                    try {
                                        if (timerInstance.behaviors && timerInstance.behaviors.Timer) {
                                            const timer = timerInstance.behaviors.Timer;
                                            if (typeof timer.isTimerRunning === 'function') {
                                                const isRunning = timer.isTimerRunning(timerTag);
                                                ImGui.Text(`Timer Running: ${isRunning ? 'YES' : 'NO'}`);
                                            }
                                        }
                                    } catch (e) {
                                        ImGui.Text("Timer Status: Error checking");
                                    }
                                } else {
                                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), "No Timer Instance");
                                }

                                // Progress bar with color coding
                                let progressColor = new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0); // Green
                                if (progress > 0.8) {
                                    progressColor = new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0); // Red
                                } else if (progress > 0.6) {
                                    progressColor = new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0); // Orange
                                } else if (progress > 0.4) {
                                    progressColor = new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0); // Yellow
                                }

                                ImGui.PushStyleColor(ImGui.Col.PlotHistogram, progressColor);
                                ImGui.ProgressBar(progress, new ImGui.ImVec2(-1, 0),
                                    `${(progress * 100).toFixed(1)}% (${elapsedTime.toFixed(1)}s elapsed)`);
                                ImGui.PopStyleColor();

                                // Show time until auto-destroy
                                if (remainingTime <= 10 && remainingTime > 0) {
                                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0),
                                        `⚠ Auto-destroy in ${remainingTime.toFixed(1)}s!`);
                                } else if (remainingTime <= 30 && remainingTime > 0) {
                                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0),
                                        `Auto-destroy in ${remainingTime.toFixed(1)}s`);
                                } else if (remainingTime <= 0) {
                                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0),
                                        "Timer expired - should be fading out");
                                }

                            } else if (debugInfo.type === "temporary" && debugInfo.duration > 0 && isFadingOut) {
                                // Show that temporary fog is in fade-out phase
                                ImGui.Separator();
                                ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0),
                                    "Temporary fog timer completed - now fading out");
                            } else if (debugInfo.type === "persistent") {
                                ImGui.Separator();
                                ImGui.TextColored(new ImGui.ImVec4(0.0, 0.8, 1.0, 1.0),
                                    "Persistent fog - no auto-destroy timer");
                            }

                            ImGui.Separator();
                            ImGui.Text(`Type: ${debugInfo.type}`);
                            ImGui.Text(`Style: ${debugInfo.style}`);
                            ImGui.Text(`Size: ${debugInfo.size.width}x${debugInfo.size.height}`);
                            ImGui.Text(`LOD: ${(lodLevel * 100).toFixed(0)}%`);
                            ImGui.Text(`Performance: ${(perfLevel * 100).toFixed(0)}%`);
                            ImGui.Text(`Frame Time: ${fog.getAverageFrameTime().toFixed(1)}ms`);

                            // Disable edit/destroy buttons if fading out
                            if (isFadingOut) {
                                ImGui.PushStyleVar(ImGui.StyleVar.Alpha, 0.5);
                                ImGui.Button(`Edit##${id}`); // Disabled
                                ImGui.SameLine();
                                ImGui.Button(`Destroy##${id}`); // Disabled
                                ImGui.PopStyleVar();
                                ImGui.SameLine();
                                ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), "(Fading out...)");
                            } else {
                                if (ImGui.Button(`Edit##${id}`)) {
                                    PIXEffect_fog.OpenFogEditor(id);
                                }
                                ImGui.SameLine();
                                if (ImGui.Button(`Destroy##${id}`)) {
                                    fog.destroy();
                                }

                                // Add graceful destroy button
                                ImGui.SameLine();
                                if (ImGui.Button(`Fade Out##${id}`)) {
                                    fog.destroyWithFadeOut();
                                }

                                // Add extend timer button for temporary fog
                                if (debugInfo.type === "temporary" && debugInfo.duration > 0) {
                                    ImGui.SameLine();
                                    if (ImGui.Button(`+30s##${id}`)) {
                                        const timerInstance = (fog as any).timerInstance;
                                        const timerTag = (fog as any).timerTag;
                                        if (timerInstance && timerTag) {
                                            try {
                                                // Stop current timer
                                                timerInstance.behaviors.Timer.stopTimer(timerTag);
                                                // Get remaining time and add 30 seconds
                                                const remainingTime = timerInstance.behaviors.Timer.getRemainingTime(timerTag);
                                                const newDuration = remainingTime + 30;
                                                // Start new timer with extended duration
                                                timerInstance.behaviors.Timer.startTimer(newDuration, timerTag, "once");
                                                
                                            } catch (error: any) {
                                                
                                            }
                                        }
                                    }
                                }
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
     * @param layer Optional layer name
     */
    public static GenerateLargeScaleFog(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        width: number = 1920,
        height: number = 1080,
        id?: string,
        layer: string = "html_c3"
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
        const fog = PIXEffect_fog.GenerateFog(type, style, duration, id, layer);

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

        

        return fog;
    }

    /**
     * Sets the fade-in duration for all fog effects
     * @param duration Duration in milliseconds
     */
    public static SetFadeInDuration(duration: number): void {
        if (duration > 0) {
            PIXEffect_fog.FADE_IN_DURATION = duration;
            
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
            const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
            const performanceStats = PIXEffect_fog.GetPerformanceStats();

            // Fog Overview Section
            if (ImGui.CollapsingHeader("Fog Overview", ImGui.TreeNodeFlags.DefaultOpen)) {
                // Active fog count with visual indicator
                ImGui.Text(`Active Fog Instances: ${fogInfo.count}`);

                // Pending fog count with visual indicator
                if (pendingInfo.count > 0) {
                    ImGui.SameLine();
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), `(${pendingInfo.count} pending)`);
                }

                if (fogInfo.count > 0) {
                    const fogProgress = Math.min(fogInfo.count / 10.0, 1.0); // Max 10 for full bar
                    const progressColor = fogProgress > 0.8 ?
                        new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0) : // Red if too many
                        new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0);   // Green if normal
                    ImGui.PushStyleColor(ImGui.Col.PlotHistogram, progressColor);
                    ImGui.ProgressBar(fogProgress, new ImGui.ImVec2(-1, 0), `${fogInfo.count} instances`);
                    ImGui.PopStyleColor();

                    // List fog IDs with status
                    ImGui.Text("Active Fog IDs:");
                    ImGui.Indent();
                    fogInfo.fogs.forEach((id: string) => {
                        const fog = PIXEffect_fog.GetFog(id);
                        let statusText = "";
                        let statusColor = new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0); // Green default

                        if (fog) {
                            const isFadingOut = (fog as any).isFadingOut;
                            const isFadingIn = (fog as any).isFadingIn;

                            if (isFadingOut) {
                                statusText = " [FADING OUT]";
                                statusColor = new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0); // Orange
                            } else if (isFadingIn) {
                                statusText = " [FADING IN]";
                                statusColor = new ImGui.ImVec4(0.0, 1.0, 0.5, 1.0); // Light green
                            } else {
                                statusText = " [ACTIVE]";
                                statusColor = new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0); // Green
                            }
                        }

                        ImGui.BulletText(id);
                        ImGui.SameLine();
                        ImGui.TextColored(statusColor, statusText);
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

                // Show pending fog information
                if (pendingInfo.count > 0) {
                    ImGui.Separator();
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), "Pending Fog Creations:");
                    ImGui.Indent();
                    pendingInfo.pending.forEach((id: string) => {
                        ImGui.BulletText(id);
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), "[WAITING FOR FADE-OUT]");
                        ImGui.SameLine();
                        if (ImGui.SmallButton(`Cancel##${id}`)) {
                            PIXEffect_fog.CancelPendingFog(id);
                        }
                    });
                    ImGui.Unindent();

                    // Pending fog controls
                    if (ImGui.Button("Cancel All Pending", new ImGui.ImVec2(120, 25))) {
                        PIXEffect_fog.CancelAllPendingFog();
                    }
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
                ImGui.SameLine();
                if (ImGui.Button("Test Replacement", new ImGui.ImVec2(100, 25))) {
                    // Test the new replacement logic
                    PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 5, "replacement_test")
                        .setPosition(400, 300)
                        .setSize(300, 200);

                    // Try to replace it immediately (should queue)
                    setTimeout(() => {
                        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 8, "replacement_test")
                            .setPosition(400, 300)
                            .setSize(300, 200);
                    }, 1000);
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

        
    }

    /**
     * Adds scene change detection and cleanup using runtime events
     */
    public static AddSceneChangeCleanup(): void {
        try {
            // Listen for layout end events (scene changes in C3)
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutend", (event: any) => {
                

                const fogInfo = PIXEffect_fog.GetFogInfo();
                if (fogInfo.count > 0) {
                    

                    // Option 1: Graceful fade-out for all fog (recommended)
                    fogInfo.fogs.forEach(fogId => {
                        PIXEffect_fog.DestroyFogWithFadeOut(fogId);
                    });

                    // Wait a bit for fade-out to complete before scene actually ends
                    // This ensures smooth transition
                } else {
                    
                }
            });

            // Listen for layout start events to handle emergency cleanup if needed
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutstart", (event: any) => {
                

                const fogInfo = PIXEffect_fog.GetFogInfo();
                if (fogInfo.count > 0) {
                    
                    PIXEffect_fog.EmergencyDestroyAllFog();
                }
            });

            // Optional: Listen for after layout start to recreate persistent fog if needed
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("afteranylayoutstart", (event: any) => {
                
                // You can add auto-recreation logic here if needed
                PIXEffect_fog.RecreateAfterSceneChange();
            });

            
        } catch (error: any) {
            
        }
    }

    /**
     * Enhanced method to handle emergency cleanup with better error handling
     */
    public static EmergencyCleanupOnSceneChange(): void {
        

        try {
            // First, try graceful cleanup
            const fogInfo = PIXEffect_fog.GetFogInfo();
            if (fogInfo.count > 0) {
                

                // Set very fast fade-out for emergency cleanup
                const originalFadeDuration = PIXEffect_fog.GetFadeOutDuration();
                PIXEffect_fog.SetFadeOutDuration(200); // Very fast fade

                // Start fade-out for all fog
                fogInfo.fogs.forEach(fogId => {
                    try {
                        PIXEffect_fog.DestroyFogWithFadeOut(fogId);
                    } catch (error: any) {
                        
                    }
                });

                // Wait a moment then do emergency cleanup
                setTimeout(() => {
                    PIXEffect_fog.EmergencyDestroyAllFog();
                    // Restore original fade duration
                    PIXEffect_fog.SetFadeOutDuration(originalFadeDuration);
                }, 300);

            } else {
                
            }
        } catch (error: any) {
            console.error(`Error during emergency scene change cleanup: ${error.message}`);
            // Fallback to immediate destruction
            PIXEffect_fog.EmergencyDestroyAllFog();
        }

        
    }

    /**
     * Sets up automatic fog cleanup with different strategies
     * @param strategy Cleanup strategy: 'graceful', 'immediate', or 'smart'
     */
    public static SetupAutoCleanup(strategy: 'graceful' | 'immediate' | 'smart' = 'smart'): void {
        try {
            // Remove existing listeners first to avoid duplicates
            // Note: C3 doesn't provide removeEventListener, so we track if already setup
            if ((PIXEffect_fog as any)._autoCleanupSetup) {
                
                return;
            }

            switch (strategy) {
                case 'graceful':
                    // Only use fade-out, slower but prettier
                    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutend", () => {
                        const fogInfo = PIXEffect_fog.GetFogInfo();
                        fogInfo.fogs.forEach(fogId => {
                            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
                        });
                    });
                    break;

                case 'immediate':
                    // Immediate destruction, fastest
                    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutend", () => {
                        PIXEffect_fog.EmergencyDestroyAllFog();
                    });
                    break;

                case 'smart':
                default:
                    // Smart strategy: graceful if time allows, emergency if needed
                    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutend", () => {
                        PIXEffect_fog.EmergencyCleanupOnSceneChange();
                    });

                    // Backup cleanup on scene start
                    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("beforeanylayoutstart", () => {
                        const fogInfo = PIXEffect_fog.GetFogInfo();
                        if (fogInfo.count > 0) {
                            
                            PIXEffect_fog.EmergencyDestroyAllFog();
                        }
                    });
                    break;
            }

            // Mark as setup to avoid duplicates
            (PIXEffect_fog as any)._autoCleanupSetup = true;
            

        } catch (error: any) {
            console.error(`Failed to setup auto cleanup: ${error.message}`);
        }
    }

    /**
     * Disables automatic fog cleanup (for testing or special cases)
     */
    public static DisableAutoCleanup(): void {
        (PIXEffect_fog as any)._autoCleanupSetup = false;
        
    }

    /**
     * Gets the current auto cleanup status
     */
    public static IsAutoCleanupEnabled(): boolean {
        return !!(PIXEffect_fog as any)._autoCleanupSetup;
    }

    /**
     * Recreates fog effects after scene change (if needed)
     */
    public static RecreateAfterSceneChange(): void {
        // This method can be called after scene change to recreate fog effects
        // You would need to store fog configurations and recreate them
        

        // Example: Recreate a basic level fog if needed
        // This is just an example - you'd implement based on your game's needs
        try {
            if (PIXEffect_fog.instances.size === 0) {
                // No fog exists, you might want to recreate default fog here
                
            }
        } catch (error: any) {
            
        }
    }

    /**
     * Enhanced GenerateFog with callback support for when fog is actually created
     * @param type Fog type (persistent or temporary)
     * @param style Visual style of the fog
     * @param duration Duration in seconds (only for temporary fog, 0 = persistent)
     * @param id Optional unique identifier
     * @param callback Optional callback when fog is actually created (useful for queued fogs)
     * @param layer Optional layer name (defaults to "html_c3")
     */
    public static GenerateFogWithCallback(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        id?: string,
        callback?: (fog: PIXEffect_fog) => void,
        layer: string = "html_c3"
    ): PIXEffect_fog {
        // Generate ID if not provided
        if (!id) {
            id = `auto_${type}_${style}_${Date.now()}`;
        }

        // Check if instance with this ID already exists
        if (PIXEffect_fog.instances.has(id)) {
            const existingFog = PIXEffect_fog.instances.get(id);
            if (existingFog && !existingFog.isDestroyed) {
                

                // If existing fog is already fading out, queue the new fog creation
                if (existingFog.isFadingOut) {
                    
                    PIXEffect_fog.pendingFogCreations.set(id, {
                        type,
                        style,
                        duration,
                        layer,
                        callback
                    });
                    return existingFog; // Return existing fog for now
                }

                // If existing fog is not fading out, start fade-out and queue new creation
                
                PIXEffect_fog.pendingFogCreations.set(id, {
                    type,
                    style,
                    duration,
                    layer,
                    callback
                });

                existingFog.startFadeOut();
                return existingFog; // Return existing fog for now
            }
        }

        // No existing fog or existing fog is destroyed, create new one immediately
        const instance = new PIXEffect_fog(type, style, duration, layer);
        instance.id = id; // Override the auto-generated ID
        PIXEffect_fog.instances.set(id, instance);

        

        // Call callback immediately since fog was created
        if (callback) {
            callback(instance);
        }

        return instance;
    }

    /**
     * Gets pending fog creation info for debugging
     */
    public static GetPendingFogInfo(): { count: number, pending: string[] } {
        const pendingIds = Array.from(PIXEffect_fog.pendingFogCreations.keys());
        return {
            count: pendingIds.length,
            pending: pendingIds
        };
    }

    /**
     * Cancels a pending fog creation
     * @param id Fog ID to cancel
     */
    public static CancelPendingFog(id: string): boolean {
        if (PIXEffect_fog.pendingFogCreations.has(id)) {
            PIXEffect_fog.pendingFogCreations.delete(id);
            
            return true;
        }
        return false;
    }

    /**
     * Cancels all pending fog creations
     */
    public static CancelAllPendingFog(): void {
        const count = PIXEffect_fog.pendingFogCreations.size;
        PIXEffect_fog.pendingFogCreations.clear();
        
    }

    /**
     * Enhanced GenerateFog that allows applying custom settings to replacement fog
     * @param type Fog type (persistent or temporary)
     * @param style Visual style of the fog
     * @param duration Duration in seconds (only for temporary fog, 0 = persistent)
     * @param id Optional unique identifier
     * @param layer Optional layer name (defaults to "html_c3")
     * @param customSettings Optional custom settings to apply to the fog
     */
    public static GenerateFogWithSettings(
        type: FogType,
        style: FogStyle = FogStyle.MEDIUM,
        duration: number = 0,
        id?: string,
        layer: string = "html_c3",
        customSettings?: {
            position?: { x: number, y: number },
            size?: { width: number, height: number },
            scale?: number,
            speed?: number,
            opacity?: number,
            color?: string,
            density?: number,
            layers?: number,
            blur?: number,
            noiseScale?: number,
            fadeEdges?: number,
            mixBlendMode?: string,
            particleVariation?: number
        }
    ): PIXEffect_fog {
        // Generate ID if not provided
        if (!id) {
            id = `auto_${type}_${style}_${Date.now()}`;
        }

        // Check if instance with this ID already exists
        if (PIXEffect_fog.instances.has(id)) {
            const existingFog = PIXEffect_fog.instances.get(id);
            if (existingFog && !existingFog.isDestroyed) {
                

                // Capture existing fog properties for replacement
                const existingProperties = {
                    position: customSettings?.position || { x: existingFog._x, y: existingFog._y },
                    size: customSettings?.size || { width: existingFog._width, height: existingFog._height },
                    fogParams: { ...existingFog.fogParams }
                };

                // Merge custom settings with existing properties
                const mergedCustomSettings = {
                    ...customSettings
                };

                // If existing fog is already fading out, queue the new fog creation
                if (existingFog.isFadingOut) {
                    
                    PIXEffect_fog.pendingFogCreations.set(id, {
                        type,
                        style,
                        duration,
                        layer,
                        position: existingProperties.position,
                        size: existingProperties.size,
                        fogParams: existingProperties.fogParams,
                        customSettings: mergedCustomSettings
                    });
                    return existingFog; // Return existing fog for now
                }

                // If existing fog is not fading out, start fade-out and queue new creation
                
                PIXEffect_fog.pendingFogCreations.set(id, {
                    type,
                    style,
                    duration,
                    layer,
                    position: existingProperties.position,
                    size: existingProperties.size,
                    fogParams: existingProperties.fogParams,
                    customSettings: mergedCustomSettings
                });

                existingFog.startFadeOut();
                return existingFog; // Return existing fog for now
            }
        }

        // No existing fog or existing fog is destroyed, create new one immediately
        const instance = new PIXEffect_fog(type, style, duration, layer);
        instance.id = id; // Override the auto-generated ID
        PIXEffect_fog.instances.set(id, instance);

        // Apply custom settings immediately if provided
        if (customSettings) {
            if (customSettings.position) {
                instance.setPosition(customSettings.position.x, customSettings.position.y);
            }
            if (customSettings.size) {
                instance.setSize(customSettings.size.width, customSettings.size.height);
            }
            if (customSettings.scale !== undefined) instance.setScale(customSettings.scale);
            if (customSettings.speed !== undefined) instance.setSpeed(customSettings.speed);
            if (customSettings.opacity !== undefined) instance.setOpacity(customSettings.opacity);
            if (customSettings.color !== undefined) instance.setColor(customSettings.color);
            if (customSettings.density !== undefined) instance.setDensity(customSettings.density);
            if (customSettings.layers !== undefined) instance.setLayers(customSettings.layers);
            if (customSettings.blur !== undefined) instance.setBlur(customSettings.blur);
            if (customSettings.noiseScale !== undefined) instance.setNoiseScale(customSettings.noiseScale);
            if (customSettings.fadeEdges !== undefined) instance.setFadeEdges(customSettings.fadeEdges);
            if (customSettings.mixBlendMode !== undefined) instance.setMixBlendMode(customSettings.mixBlendMode);
            if (customSettings.particleVariation !== undefined) instance.setParticleVariation(customSettings.particleVariation);
        }

        
        return instance;
    }

    /**
     * Gets the current position of the fog
     */
    public getPosition(): { x: number, y: number } {
        return { x: this._x, y: this._y };
    }

    /**
     * Gets the current size of the fog
     */
    public getSize(): { width: number, height: number } {
        return { width: this._width, height: this._height };
    }

    /**
     * Gets the fog style
     */
    public getStyle(): FogStyle {
        return this.style;
    }

    /**
     * Gets the fog type
     */
    public getType(): FogType {
        return this.type;
    }

    /**
     * Initializes dynamic fog behavior
     * @param config Dynamic fog configuration
     */
    public initializeDynamicFog(config: any): void {
        this.isDynamic = true;
        this.dynamicConfig = config;

        // Store base values for dynamic changes
        this.dynamicState = {
            currentIntensity: this.fogParams.opacity,
            targetIntensity: this.fogParams.opacity,
            currentSize: this.fogParams.scale,
            targetSize: this.fogParams.scale,
            isDisappeared: false,
            lastChangeTime: Date.now(),
            nextChangeTime: Date.now() + this.getRandomChangeInterval() * 1000,
            transitionStartTime: 0,
            transitionDuration: config.transitionDuration * 1000,
            baseOpacity: this.fogParams.opacity,
            baseScale: this.fogParams.scale,
            baseDensity: this.fogParams.density
        };

        // 确保动态雾有足够的密度和可见性
        if (this.fogParams.density < 0.5) {
            this.fogParams.density = 0.5;
            this.dynamicState.baseDensity = 0.5;
        }

        // Create dynamic timer for C3
        this.createDynamicTimer();
    }

    /**
     * Updates dynamic fog configuration
     * @param config New dynamic fog configuration
     */
    public updateDynamicConfig(config: any): void {
        if (!this.isDynamic) {
            
            return;
        }

        this.dynamicConfig = { ...this.dynamicConfig, ...config };

        // Update next change time if interval changed
        if (this.dynamicState) {
            this.dynamicState.nextChangeTime = Date.now() + this.getRandomChangeInterval() * 1000;
        }

        
    }

    /**
     * Creates C3 timer for dynamic fog changes
     */
    private createDynamicTimer(): void {
        try {
            this.dynamicTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            this.dynamicTimerTag = `dynamic_fog_${this.id}_${Date.now()}`;

            // Listen for timer events
            this.dynamicTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.dynamicTimerTag) {
                    this.processDynamicChange();
                    this.scheduleDynamicChange();
                }
            });

            // Schedule first change
            this.scheduleDynamicChange();

            
        } catch (error: any) {
            console.error(`Failed to create dynamic timer for fog: ${error.message}`);
        }
    }

    /**
     * Schedules the next dynamic change
     */
    private scheduleDynamicChange(): void {
        if (!this.dynamicTimer || !this.dynamicConfig || !this.dynamicState) return;

        const interval = this.getRandomChangeInterval();
        this.dynamicState.nextChangeTime = Date.now() + interval * 1000;

        try {
            this.dynamicTimer.behaviors.Timer.startTimer(interval, this.dynamicTimerTag, "once");
        } catch (error: any) {
            
        }
    }

    /**
     * Gets random change interval based on configuration
     */
    private getRandomChangeInterval(): number {
        if (!this.dynamicConfig) return 30;

        const min = this.dynamicConfig.changeInterval.min;
        const max = this.dynamicConfig.changeInterval.max;
        return pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(min, max);
    }

    /**
     * Processes a dynamic fog change
     */
    private processDynamicChange(): void {
        if (!this.dynamicConfig || !this.dynamicState || this.isDestroyed) {
            
            return;
        }

        

        const currentTime = Date.now();
        this.dynamicState.lastChangeTime = currentTime;

        // Check if fog should disappear
        if (!this.dynamicState.isDisappeared && Math.random() < this.dynamicConfig.disappearChance) {
            
            this.startFogDisappearance();
            return;
        }

        // If currently disappeared, check if should reappear
        if (this.dynamicState.isDisappeared) {
            
            this.startFogReappearance();
            return;
        }

        // Normal dynamic change
        
        this.generateNewTargets();
        this.startDynamicTransition();
    }

    /**
     * Starts fog disappearance
     */
    private startFogDisappearance(): void {
        if (!this.dynamicConfig || !this.dynamicState) return;


        this.dynamicState.isDisappeared = true;
        this.dynamicState.targetIntensity = 0;
        this.dynamicState.targetSize = 0.1;

        this.startDynamicTransition();

        // Schedule reappearance
        const disappearDuration = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(
            this.dynamicConfig.disappearDuration.min,
            this.dynamicConfig.disappearDuration.max
        );

        setTimeout(() => {
            if (!this.isDestroyed && this.dynamicState?.isDisappeared) {
                this.startFogReappearance();
            }
        }, disappearDuration * 1000);
    }

    /**
     * Starts fog reappearance
     */
    private startFogReappearance(): void {
        if (!this.dynamicConfig || !this.dynamicState) return;


        this.dynamicState.isDisappeared = false;
        this.generateNewTargets();
        this.startDynamicTransition();
    }

    /**
     * Generates new target values for dynamic changes
     */
    private generateNewTargets(): void {
        if (!this.dynamicConfig || !this.dynamicState) return;

        // Generate new intensity target
        let intensityMin = this.dynamicConfig.intensityRange.min;
        let intensityMax = this.dynamicConfig.intensityRange.max;

        // Weather influence
        if (this.dynamicConfig.weatherInfluence) {
            // Check if weather system is available and adjust based on weather
            try {
                // Access weather state through global scope if available
                if (typeof (globalThis as any).WeatherState !== 'undefined') {
                    const weatherState = (globalThis as any).WeatherState;
                    if (weatherState.CurrentWeather === "Rain") {
                        // Rain increases fog intensity
                        intensityMin = Math.min(intensityMin * 1.3, 1.0);
                        intensityMax = Math.min(intensityMax * 1.2, 1.0);
                    }
                }
            } catch (error) {
                // Weather module not available, continue without weather influence
            }
        }

        this.dynamicState.targetIntensity = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(intensityMin, intensityMax);

        // Generate new size target
        this.dynamicState.targetSize = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(
            this.dynamicConfig.sizeRange.min,
            this.dynamicConfig.sizeRange.max
        );

        // Natural variation - add some randomness to make it more natural
        if (this.dynamicConfig.naturalVariation) {
            const variation = 0.1;
            this.dynamicState.targetIntensity += (Math.random() - 0.5) * variation;
            this.dynamicState.targetSize += (Math.random() - 0.5) * variation;

            // Clamp values
            this.dynamicState.targetIntensity = Math.max(0, Math.min(1, this.dynamicState.targetIntensity));
            this.dynamicState.targetSize = Math.max(0.1, Math.min(5, this.dynamicState.targetSize));
        }

    }

    /**
     * Starts dynamic transition to new values
     */
    private startDynamicTransition(): void {
        if (!this.dynamicState) return;

        this.dynamicState.transitionStartTime = Date.now();

        // Start transition animation
        this.updateDynamicTransition();
    }

    /**
     * Updates dynamic transition animation
     */
    private updateDynamicTransition(): void {
        if (!this.dynamicState || !this.dynamicConfig || this.isDestroyed) return;

        const currentTime = Date.now();
        const elapsed = currentTime - this.dynamicState.transitionStartTime;
        const progress = Math.min(elapsed / this.dynamicState.transitionDuration, 1.0);

        // Smooth easing function (ease-in-out)
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Store previous values for comparison
        const prevIntensity = this.dynamicState.currentIntensity;
        const prevSize = this.dynamicState.currentSize;

        // Interpolate intensity
        const startIntensity = this.dynamicState.currentIntensity;
        const targetIntensity = this.dynamicState.targetIntensity;
        this.dynamicState.currentIntensity = startIntensity + (targetIntensity - startIntensity) * easedProgress;

        // Interpolate size
        const startSize = this.dynamicState.currentSize;
        const targetSize = this.dynamicState.targetSize;
        this.dynamicState.currentSize = startSize + (targetSize - startSize) * easedProgress;

        // 添加过渡调试信息（每10次更新输出一次，避免日志过多）
        if (Math.floor(progress * 20) !== Math.floor((progress - 0.05) * 20)) {
        }

        // Apply changes to fog
        this.applyDynamicChanges();

        // Continue transition or finish
        if (progress < 1.0) {
            setTimeout(() => this.updateDynamicTransition(), 50); // Update every 50ms for smooth animation
        } else {
            // Transition complete
            this.dynamicState.currentIntensity = this.dynamicState.targetIntensity;
            this.dynamicState.currentSize = this.dynamicState.targetSize;
        }
    }

    /**
     * Applies current dynamic values to fog parameters
     */
    private applyDynamicChanges(): void {
        if (!this.dynamicState || this.isDestroyed) return;

        // Apply intensity changes (affects opacity and density)
        const intensityFactor = this.dynamicState.currentIntensity;
        this.fogParams.opacity = this.dynamicState.baseOpacity * intensityFactor;
        this.fogParams.density = this.dynamicState.baseDensity * intensityFactor;

        // Apply size changes - 确保缩放不会太小
        const newScale = this.dynamicState.baseScale * this.dynamicState.currentSize;
        const minScale = 0.8; // 最小缩放，确保粒子可见
        this.fogParams.scale = Math.max(newScale, minScale);

        // 强制可见性检查 - 如果透明度太低，强制提高
        if (this.fogParams.opacity < 0.1) {
            
            this.fogParams.opacity = 0.3;
        }

        // 强制密度检查 - 如果密度太低，强制提高
        if (this.fogParams.density < 0.2) {
            
            this.fogParams.density = 0.5;
        }

        // 添加详细的调试信息

        // 检查粒子数量 - 如果太少，立即重新初始化
        if (this.particles.length < 10) {
            
            this.initParticles();
        }

        // 检查是否需要重新初始化粒子 - 减少重新初始化的频率
        const sizeDiff = Math.abs(this.dynamicState.currentSize - this.dynamicState.targetSize);
        if (sizeDiff > 1.0 && this.particles.length < 15) { // 提高阈值，减少重新初始化
            
            this.initParticles();
        }

        // Re-render if HTML element is valid
        if (this.htmlElement) {
            this.renderHTML();
        } else {
            console.error(`🌫️ HTML element is null for fog ${this.id}, cannot render - attempting to recreate`);
            // 尝试重新创建HTML元素
            try {
                this.createHtmlElement();
            } catch (error: any) {
                console.error(`🌫️ Failed to recreate HTML element for fog ${this.id}: ${error.message}`);
            }
        }
    }

    /**
     * Gets dynamic fog status information
     */
    public getDynamicStatus(): any {
        if (!this.isDynamic) {
            return { isDynamic: false };
        }

        return {
            isDynamic: true,
            config: this.dynamicConfig,
            state: this.dynamicState,
            nextChangeIn: this.dynamicState ? Math.max(0, (this.dynamicState.nextChangeTime - Date.now()) / 1000) : 0
        };
    }

    /**
     * Stops dynamic behavior and makes fog static
     */
    public stopDynamicBehavior(): void {
        if (!this.isDynamic) return;

        this.isDynamic = false;

        // Stop dynamic timer
        if (this.dynamicTimer) {
            try {
                if (this.dynamicTimerTag && this.dynamicTimer.behaviors.Timer.isTimerRunning(this.dynamicTimerTag)) {
                    this.dynamicTimer.behaviors.Timer.stopTimer(this.dynamicTimerTag);
                }
                this.dynamicTimer.destroy();
            } catch (error: any) {
                
            }
            this.dynamicTimer = null;
        }

        // Reset to base values
        if (this.dynamicState) {
            this.fogParams.opacity = this.dynamicState.baseOpacity;
            this.fogParams.scale = this.dynamicState.baseScale;
            this.fogParams.density = this.dynamicState.baseDensity;
        }

        this.dynamicConfig = null;
        this.dynamicState = null;

        
    }

    /**
     * Gets all dynamic fog instances
     */
    public static GetDynamicFogInstances(): PIXEffect_fog[] {
        const dynamicFogs: PIXEffect_fog[] = [];
        PIXEffect_fog.instances.forEach(fog => {
            if (!fog.isDestroyed && fog.isDynamic) {
                dynamicFogs.push(fog);
            }
        });
        return dynamicFogs;
    }

    /**
     * Gets dynamic fog information for debugging
     */
    public static GetDynamicFogInfo(): any {
        const dynamicFogs = PIXEffect_fog.GetDynamicFogInstances();
        const info = {
            count: dynamicFogs.length,
            fogs: dynamicFogs.map(fog => ({
                id: fog.getId(),
                status: fog.getDynamicStatus(),
                style: fog.getStyle(),
                position: fog.getPosition(),
                size: fog.getSize()
            }))
        };
        return info;
    }

    /**
     * Stops all dynamic fog behavior
     */
    public static StopAllDynamicFog(): void {
        const dynamicFogs = PIXEffect_fog.GetDynamicFogInstances();
        dynamicFogs.forEach(fog => {
            fog.stopDynamicBehavior();
        });
        
    }

    /**
     * Creates a preset dynamic fog configuration for different scenarios
     */
    public static CreatePresetDynamicFog(
        preset: 'subtle' | 'moderate' | 'dramatic' | 'mystical' | 'stormy',
        id?: string,
        layer: string = "html_c3"
    ): PIXEffect_fog {
        let style: FogStyle;
        let config: any;

        switch (preset) {
            case 'subtle':
                style = FogStyle.LIGHT;
                config = {
                    intensityRange: { min: 0.1, max: 0.4 },
                    sizeRange: { min: 0.8, max: 1.5 },
                    changeInterval: { min: 30, max: 60 },
                    disappearChance: 0.05,
                    disappearDuration: { min: 15, max: 40 },
                    transitionDuration: 15,
                    weatherInfluence: true,
                    naturalVariation: true
                };
                break;

            case 'moderate':
                style = FogStyle.MEDIUM;
                config = {
                    intensityRange: { min: 0.2, max: 0.7 },
                    sizeRange: { min: 0.9, max: 2.0 },
                    changeInterval: { min: 20, max: 45 },
                    disappearChance: 0.1,
                    disappearDuration: { min: 10, max: 30 },
                    transitionDuration: 10,
                    weatherInfluence: true,
                    naturalVariation: true
                };
                break;

            case 'dramatic':
                style = FogStyle.HEAVY;
                config = {
                    intensityRange: { min: 0.3, max: 0.9 },
                    sizeRange: { min: 1.0, max: 3.0 },
                    changeInterval: { min: 15, max: 35 },
                    disappearChance: 0.2,
                    disappearDuration: { min: 5, max: 20 },
                    transitionDuration: 8,
                    weatherInfluence: true,
                    naturalVariation: true
                };
                break;

            case 'mystical':
                style = FogStyle.MYSTICAL;
                config = {
                    intensityRange: { min: 0.4, max: 0.8 },
                    sizeRange: { min: 1.2, max: 2.5 },
                    changeInterval: { min: 25, max: 50 },
                    disappearChance: 0.15,
                    disappearDuration: { min: 8, max: 25 },
                    transitionDuration: 12,
                    weatherInfluence: false,
                    naturalVariation: true
                };
                break;

            case 'stormy':
                style = FogStyle.TOXIC;
                config = {
                    intensityRange: { min: 0.5, max: 1.0 },
                    sizeRange: { min: 1.5, max: 3.5 },
                    changeInterval: { min: 10, max: 25 },
                    disappearChance: 0.25,
                    disappearDuration: { min: 3, max: 15 },
                    transitionDuration: 6,
                    weatherInfluence: true,
                    naturalVariation: true
                };
                break;

            default:
                style = FogStyle.MEDIUM;
                config = {};
        }

        if (!id) {
            id = `dynamic_${preset}_fog`;
        }

        return PIXEffect_fog.GenerateDynamicFog(style, id, layer, config);
    }

    /**
     * Creates a simple test fog for debugging visibility issues
     */
    public static CreateTestFog(id: string = "test_fog"): PIXEffect_fog {
        

        const testFog = new PIXEffect_fog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "html_c3");
        testFog.id = id;

        // Set very visible parameters
        testFog.fogParams.opacity = 0.8;
        testFog.fogParams.scale = 2.0;
        testFog.fogParams.density = 1.0;
        testFog.fogParams.color = '#ffffff';
        testFog.fogParams.blur = 10;

        // Set position and size
        testFog.setPosition(200, 200);
        testFog.setSize(800, 600);

        // Force create particles
        testFog.particles = [];
        for (let i = 0; i < 50; i++) {
            testFog.particles.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: 100 + Math.random() * 50,
                baseSpeedX: 0,
                baseSpeedY: 0,
                opacity: 0.5,
                layer: 0,
                flowOffset: 0,
                flowAmplitude: 0,
                noiseOffset: 0,
                rotationSpeed: 0,
                preCalcSin: 1,
                preCalcCos: 1,
                updateCounter: 0
            });
        }

        PIXEffect_fog.instances.set(id, testFog);

        
        

        return testFog;
    }
}



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    PIXEffect_fog.SetupAutoCleanup('smart');

})

