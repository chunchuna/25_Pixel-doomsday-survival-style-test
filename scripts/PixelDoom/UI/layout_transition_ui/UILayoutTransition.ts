import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

/**
 * Transition type enumeration
 */
export enum TransitionType {
    HOLE = "hole"
}

/**
 * Transition controller for chaining methods
 */
export class TransitionController {
    private callback: (() => void) | null = null;

    constructor(private layoutTransition: LayoutTransition) {}

    /**
     * Set callback function to execute when transition finishes
     * @param callback Function to execute on completion
     */
    public onFinish(callback: () => void): TransitionController {
        this.callback = callback;
        this.layoutTransition.setCallback(this.callback);
        return this;
    }
}

/**
 * Layout transition class for scene transitions with circular mask effects
 */
export class LayoutTransition {
    private static container: HTMLDivElement | null = null;
    private static overlay: HTMLCanvasElement | null = null;
    private static styleElement: HTMLStyleElement | null = null;
    private static timerInstance: any = null;
    private static timerTag: string = "";
    private static isTransitioning: boolean = false;
    private static transitionCallback: (() => void) | null = null;
    private static currentTransitionType: 'enter' | 'leave' | null = null;
    private static animationId: number | null = null;

    private constructor() {
        // Private constructor for static class pattern
    }

    /**
     * Set callback function for transition completion
     * @param callback Function to execute when transition completes
     */
    public setCallback(callback: (() => void) | null): void {
        LayoutTransition.transitionCallback = callback;
    }

    /**
     * Initialize the transition system
     */
    private static initialize(): void {
        if (LayoutTransition.container) return; // Already initialized

        // Add CSS styles
        LayoutTransition.styleElement = document.createElement('style');
        LayoutTransition.styleElement.textContent = `
            .layout-transition-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999999999;
                overflow: hidden;
            }
            .layout-transition-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            /* Leave transition: Black circle expanding from center to cover screen */
            @keyframes blackCircleExpand {
                0% { 
                    clip-path: circle(0% at center);
                    opacity: 1;
                }
                100% { 
                    clip-path: circle(150% at center);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(LayoutTransition.styleElement);

        // Create container
        LayoutTransition.container = document.createElement('div');
        LayoutTransition.container.className = 'layout-transition-container';
        document.body.appendChild(LayoutTransition.container);

        // Create canvas for custom drawing
        LayoutTransition.overlay = document.createElement('canvas');
        LayoutTransition.overlay.className = 'layout-transition-canvas';
        LayoutTransition.container.appendChild(LayoutTransition.overlay);
        
        // Set canvas size and initialize
        LayoutTransition.resizeCanvas();
    }

    /**
     * Resize canvas to match screen size
     */
    private static resizeCanvas(): void {
        if (!LayoutTransition.overlay) return;
        
        LayoutTransition.overlay.width = window.innerWidth;
        LayoutTransition.overlay.height = window.innerHeight;
    }

    /**
     * Draw black mask with circular hole using Canvas
     * @param progress Progress from 0 to 1 (0 = no hole, 1 = full hole)
     */
    private static drawMaskWithHole(progress: number): void {
        if (!LayoutTransition.overlay) return;
        
        const canvas = LayoutTransition.overlay;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate maximum radius needed to cover entire screen from center
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        const currentRadius = progress * maxRadius;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (progress < 1) {
            // Draw black mask
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
            
            // Cut out circular hole using composite operation
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    /**
     * Enter layout transition - dissolves existing black mask from center outward to reveal scene
     * Effect: Black screen -> Center starts dissolving and expands outward -> Bright screen (scene visible)
     * If no mask exists, creates one first, then performs the dissolve effect
     * @param transitionType Type of transition effect
     * @param time Duration of transition in seconds
     * @param callback Optional callback function to execute when transition completes
     */
    public static EnterLayout(transitionType: TransitionType, time: number, callback?: () => void): TransitionController {
        LayoutTransition.initialize();
        
        if (LayoutTransition.isTransitioning) {
            console.warn("Transition already in progress, ignoring new transition request");
            return new TransitionController(new LayoutTransition());
        }

        LayoutTransition.isTransitioning = true;
        LayoutTransition.transitionCallback = callback || null;
        LayoutTransition.currentTransitionType = 'enter';
        
        try {
            if (!LayoutTransition.overlay) return new TransitionController(new LayoutTransition());
            
            // Ensure canvas is properly sized
            LayoutTransition.resizeCanvas();
            
            // Check if black mask already exists
            const maskAlreadyExists = LayoutTransition.IsMaskVisible();
            
            if (!maskAlreadyExists) {
                console.log("No black mask detected, creating one before enter transition");
                // Draw initial full black mask
                LayoutTransition.drawMaskWithHole(0);
            }
            
            // Start dissolve animation using requestAnimationFrame
            LayoutTransition.startDissolveAnimation(time);
            
            // Create timer for completion callback
            LayoutTransition.createTransitionTimer(time);
            
            console.log(`Started enter layout transition with duration: ${time}s`);
        } catch (error: any) {
            console.error(`Failed to start enter layout transition: ${error.message}`);
            LayoutTransition.cleanup();
        }

        return new TransitionController(new LayoutTransition());
    }

    /**
     * Start dissolve animation using requestAnimationFrame for smooth effect
     * @param duration Duration in seconds
     */
    private static startDissolveAnimation(duration: number): void {
        const startTime = Date.now();
        const durationMs = duration * 1000;
        
        const animate = () => {
            if (!LayoutTransition.isTransitioning) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            // Draw mask with expanding hole
            LayoutTransition.drawMaskWithHole(progress);
            
            if (progress < 1) {
                LayoutTransition.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Draw expanding black circle from center
     * @param progress Progress from 0 to 1 (0 = no circle, 1 = full coverage)
     */
    private static drawExpandingBlackCircle(progress: number): void {
        if (!LayoutTransition.overlay) return;
        
        const canvas = LayoutTransition.overlay;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate maximum radius needed to cover entire screen from center
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        const currentRadius = progress * maxRadius;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (progress > 0) {
            // Draw expanding black circle
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * Start black circle expansion animation
     * @param duration Duration in seconds
     */
    private static startBlackCircleAnimation(duration: number): void {
        const startTime = Date.now();
        const durationMs = duration * 1000;
        
        const animate = () => {
            if (!LayoutTransition.isTransitioning) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            // Draw expanding black circle
            LayoutTransition.drawExpandingBlackCircle(progress);
            
            if (progress < 1) {
                LayoutTransition.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Leave layout transition - screen starts bright, then black circle expands from center to cover entire screen
     * Effect: Bright screen (scene visible) -> Center black circle appears and expands -> Full black
     * @param transitionType Type of transition effect
     * @param time Duration of transition in seconds
     * @param callback Optional callback function to execute when transition completes
     */
    public static LeaveLayout(transitionType: TransitionType, time: number, callback?: () => void): TransitionController {
        LayoutTransition.initialize();
        
        if (LayoutTransition.isTransitioning) {
            console.warn("Transition already in progress, ignoring new transition request");
            return new TransitionController(new LayoutTransition());
        }

        LayoutTransition.isTransitioning = true;
        LayoutTransition.transitionCallback = callback || null;
        LayoutTransition.currentTransitionType = 'leave';
        
        try {
            if (!LayoutTransition.overlay) return new TransitionController(new LayoutTransition());
            
            // Ensure canvas is properly sized
            LayoutTransition.resizeCanvas();
            
            // Start black circle expansion animation
            LayoutTransition.startBlackCircleAnimation(time);
            
            // Create timer for completion callback
            LayoutTransition.createTransitionTimer(time);
            
            console.log(`Started leave layout transition with duration: ${time}s`);
        } catch (error: any) {
            console.error(`Failed to start leave layout transition: ${error.message}`);
            LayoutTransition.cleanup();
        }

        return new TransitionController(new LayoutTransition());
    }

    /**
     * Create and start transition timer
     * @param duration Duration in seconds
     */
    private static createTransitionTimer(duration: number): void {
        try {
            // Create C3 Timer instance
            LayoutTransition.timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            LayoutTransition.timerTag = `layout_transition_${Date.now()}_${Math.random()}`;
            
            // Set up completion timer
            LayoutTransition.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === LayoutTransition.timerTag) {
                    LayoutTransition.onTransitionComplete();
                }
            });
            
            // Start completion timer
            LayoutTransition.timerInstance.behaviors.Timer.startTimer(duration, LayoutTransition.timerTag, "once");
            
        } catch (error: any) {
            console.error(`Failed to create transition timer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Handle transition completion
     */
    private static onTransitionComplete(): void {
        console.log("Layout transition completed");
        
        // Execute callback if provided
        if (LayoutTransition.transitionCallback) {
            try {
                LayoutTransition.transitionCallback();
            } catch (error: any) {
                console.error(`Error executing transition callback: ${error.message}`);
            }
        }
        
        // Different cleanup behavior based on transition type
        if (LayoutTransition.currentTransitionType === 'enter') {
            // Enter transition: completely remove the mask
            LayoutTransition.cleanup();
        } else if (LayoutTransition.currentTransitionType === 'leave') {
            // Leave transition: keep the mask but stop the transition state
            LayoutTransition.cleanupButKeepMask();
        }
    }

    /**
     * Cleanup transition resources and completely remove mask
     */
    private static cleanup(): void {
        LayoutTransition.isTransitioning = false;
        LayoutTransition.transitionCallback = null;
        LayoutTransition.currentTransitionType = null;
        
        // Stop animation
        if (LayoutTransition.animationId) {
            cancelAnimationFrame(LayoutTransition.animationId);
            LayoutTransition.animationId = null;
        }
        
        // Destroy timer
        if (LayoutTransition.timerInstance) {
            try {
                LayoutTransition.timerInstance.behaviors.Timer.stopTimer(LayoutTransition.timerTag);
                LayoutTransition.timerInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying transition timer: ${error.message}`);
            }
            LayoutTransition.timerInstance = null;
        }
        
        // Clear canvas - completely remove mask
        if (LayoutTransition.overlay) {
            const ctx = LayoutTransition.overlay.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, LayoutTransition.overlay.width, LayoutTransition.overlay.height);
            }
        }
        
        LayoutTransition.timerTag = "";
    }

    /**
     * Cleanup transition resources but keep the mask visible (for leave transitions)
     */
    private static cleanupButKeepMask(): void {
        LayoutTransition.isTransitioning = false;
        LayoutTransition.transitionCallback = null;
        LayoutTransition.currentTransitionType = null;
        
        // Stop animation
        if (LayoutTransition.animationId) {
            cancelAnimationFrame(LayoutTransition.animationId);
            LayoutTransition.animationId = null;
        }
        
        // Destroy timer
        if (LayoutTransition.timerInstance) {
            try {
                LayoutTransition.timerInstance.behaviors.Timer.stopTimer(LayoutTransition.timerTag);
                LayoutTransition.timerInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying transition timer: ${error.message}`);
            }
            LayoutTransition.timerInstance = null;
        }
        
        // Keep canvas as full black mask
        if (LayoutTransition.overlay) {
            LayoutTransition.drawMaskWithHole(0); // Full black mask (no hole)
        }
        
        LayoutTransition.timerTag = "";
        
        console.log("Leave transition completed - black mask maintained");
    }

    /**
     * Check if transition is currently in progress
     */
    public static IsTransitioning(): boolean {
        return LayoutTransition.isTransitioning;
    }

    /**
     * Force stop current transition
     */
    public static StopTransition(): void {
        LayoutTransition.cleanup();
    }

    /**
     * Check if black mask is currently visible (covering the screen)
     */
    public static IsMaskVisible(): boolean {
        if (!LayoutTransition.overlay) return false;
        
        const ctx = LayoutTransition.overlay.getContext('2d');
        if (!ctx) return false;
        
        // Sample a few pixels to check if there's black content
        const width = LayoutTransition.overlay.width;
        const height = LayoutTransition.overlay.height;
        
        if (width === 0 || height === 0) return false;
        
        try {
            // Check center pixel and a few corner pixels
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Sample some pixels to see if there's any black content
            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3]; // Alpha channel
                if (alpha > 0) {
                    return true; // Found visible content
                }
            }
            return false;
        } catch (error: any) {
            console.warn("Error checking mask visibility:", error.message);
            return false;
        }
    }
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    //UIScreenEffect.FadeIn(800,TransitionEffectType.FADE,undefined)
    LayoutTransition.EnterLayout(TransitionType.HOLE,1)
})
