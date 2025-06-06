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
    private static overlay: HTMLDivElement | null = null;
    private static styleElement: HTMLStyleElement | null = null;
    private static timerInstance: any = null;
    private static timerTag: string = "";
    private static isTransitioning: boolean = false;
    private static transitionCallback: (() => void) | null = null;
    private static currentTransitionType: 'enter' | 'leave' | null = null;

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
            .layout-transition-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #000;
                opacity: 0;
            }
            
            /* Circular hole transition animations */
            /* Enter transition: Dissolve black mask by expanding transparent hole from center */
            @keyframes maskDissolveOut {
                0% { 
                    clip-path: circle(0% at center);
                    opacity: 1;
                }
                100% { 
                    clip-path: circle(150% at center);
                    opacity: 0;
                }
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

        // Create overlay
        LayoutTransition.overlay = document.createElement('div');
        LayoutTransition.overlay.className = 'layout-transition-overlay';
        LayoutTransition.container.appendChild(LayoutTransition.overlay);
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
            
            // Check if black mask already exists (from previous LeaveLayout)
            const maskAlreadyExists = LayoutTransition.IsMaskVisible();
            
            if (!maskAlreadyExists) {
                // No mask exists, create one first
                console.log("No black mask detected, creating one before enter transition");
                LayoutTransition.overlay.style.cssText = '';
                LayoutTransition.overlay.style.opacity = '1';
                LayoutTransition.overlay.style.backgroundColor = '#000';
                LayoutTransition.overlay.style.clipPath = 'circle(150% at center)';
                LayoutTransition.overlay.style.animation = 'none';
                
                // Force reflow to ensure mask is visible
                LayoutTransition.overlay.offsetHeight;
            }
            
            // Ensure we start from full black mask state
            LayoutTransition.overlay.style.animation = 'none';
            LayoutTransition.overlay.style.opacity = '1';
            LayoutTransition.overlay.style.backgroundColor = '#000';
            LayoutTransition.overlay.style.clipPath = 'circle(0% at center)';
            
            // Force reflow
            LayoutTransition.overlay.offsetHeight;
            
            // Start dissolve animation (mask dissolving from center outward)
            LayoutTransition.overlay.style.animation = `maskDissolveOut ${time * 1000}ms ease-out forwards`;
            
            // Create and start timer for completion
            LayoutTransition.createTransitionTimer(time);
            
            console.log(`Started enter layout transition with duration: ${time}s`);
        } catch (error: any) {
            console.error(`Failed to start enter layout transition: ${error.message}`);
            LayoutTransition.cleanup();
        }

        return new TransitionController(new LayoutTransition());
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
            
            // Set initial state - no mask (completely transparent, screen is bright)
            LayoutTransition.overlay.style.cssText = '';
            LayoutTransition.overlay.style.opacity = '0';
            LayoutTransition.overlay.style.backgroundColor = '#000';
            LayoutTransition.overlay.style.clipPath = 'circle(0% at center)';
            
            // Force reflow
            LayoutTransition.overlay.offsetHeight;
            
            // Make overlay visible and start black circle expansion
            LayoutTransition.overlay.style.opacity = '1';
            LayoutTransition.overlay.style.animation = `blackCircleExpand ${time * 1000}ms ease-in forwards`;
            
            // Create and start timer for completion
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
        
        // Reset overlay - completely remove mask
        if (LayoutTransition.overlay) {
            LayoutTransition.overlay.style.cssText = '';
            LayoutTransition.overlay.style.opacity = '0';
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
        
        // Keep overlay visible - ensure it stays as full black mask
        if (LayoutTransition.overlay) {
            LayoutTransition.overlay.style.animation = 'none';
            LayoutTransition.overlay.style.opacity = '1';
            LayoutTransition.overlay.style.backgroundColor = '#000';
            LayoutTransition.overlay.style.clipPath = 'circle(150% at center)';
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
        
        const isOpaque = LayoutTransition.overlay.style.opacity === '1';
        const isFullCoverage = LayoutTransition.overlay.style.clipPath === 'circle(150% at center)' ||
                              LayoutTransition.overlay.style.clipPath === '';
        
        return isOpaque && (isFullCoverage || LayoutTransition.overlay.style.clipPath === '');
    }
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    //UIScreenEffect.FadeIn(800,TransitionEffectType.FADE,undefined)
    LayoutTransition.EnterLayout(TransitionType.HOLE,3)
})
