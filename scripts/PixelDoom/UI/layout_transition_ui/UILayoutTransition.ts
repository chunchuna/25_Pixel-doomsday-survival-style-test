import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

/**
 * Transition type enumeration
 */
export enum TransitionType {
    HOLE = "hole"
}

/**
 * Layout transition class for scene transitions with circular mask effects
 */
export class LayoutTransition {
    private static instance: LayoutTransition | null = null;
    private htmlElement: any = null;
    private timerInstance: any = null;
    private timerTag: string = "";
    private isTransitioning: boolean = false;
    private transitionCallback: (() => void) | null = null;

    private constructor() {
        // Private constructor for static class pattern
    }

    /**
     * Initialize the transition system
     */
    private static initialize(): void {
        if (!LayoutTransition.instance) {
            LayoutTransition.instance = new LayoutTransition();
        }
    }

    /**
     * Enter layout transition - screen starts with black mask, then circular hole expands from center
     * @param transitionType Type of transition effect
     * @param time Duration of transition in seconds
     * @param callback Optional callback function to execute when transition completes
     */
    public static EnterLayout(transitionType: TransitionType, time: number, callback?: () => void): void {
        LayoutTransition.initialize();
        const instance = LayoutTransition.instance!;
        
        if (instance.isTransitioning) {
            console.warn("Transition already in progress, ignoring new transition request");
            return;
        }

        instance.isTransitioning = true;
        instance.transitionCallback = callback || null;
        
        try {
            // Create HTML element for mask overlay
            instance.createMaskElement();
            
            // Set initial state - full black mask
            instance.setMaskState(0); // 0% = full mask
            
            // Create and start timer for transition
            instance.createTransitionTimer(time, true); // true for enter transition
            
            console.log(`Started enter layout transition with duration: ${time}s`);
        } catch (error: any) {
            console.error(`Failed to start enter layout transition: ${error.message}`);
            instance.cleanup();
        }
    }

    /**
     * Leave layout transition - screen starts clear, then black circle expands from center
     * @param transitionType Type of transition effect
     * @param time Duration of transition in seconds
     * @param callback Optional callback function to execute when transition completes
     */
    public static LeaveLayout(transitionType: TransitionType, time: number, callback?: () => void): void {
        LayoutTransition.initialize();
        const instance = LayoutTransition.instance!;
        
        if (instance.isTransitioning) {
            console.warn("Transition already in progress, ignoring new transition request");
            return;
        }

        instance.isTransitioning = true;
        instance.transitionCallback = callback || null;
        
        try {
            // Create HTML element for mask overlay
            instance.createMaskElement();
            
            // Set initial state - no mask (fully transparent)
            instance.setMaskState(100); // 100% = no mask
            
            // Create and start timer for transition
            instance.createTransitionTimer(time, false); // false for leave transition
            
            console.log(`Started leave layout transition with duration: ${time}s`);
        } catch (error: any) {
            console.error(`Failed to start leave layout transition: ${error.message}`);
            instance.cleanup();
        }
    }

    /**
     * Create HTML mask element
     */
    private createMaskElement(): void {
        try {
            // Get screen dimensions
            const screenWidth = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.width;
            const screenHeight = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.height;
            
            // Create HTML element on UI layer
            this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance("UI", 0, 0);
            this.htmlElement.width = screenWidth;
            this.htmlElement.height = screenHeight;
            
            // Set high z-index to ensure it's on top
            this.htmlElement.zElevation = 1000;
            
        } catch (error: any) {
            console.error(`Failed to create mask element: ${error.message}`);
            throw error;
        }
    }

    /**
     * Set mask state based on progress percentage
     * @param progress Progress from 0 to 100 (0 = full mask, 100 = no mask)
     */
    private setMaskState(progress: number): void {
        if (!this.htmlElement) return;
        
        try {
            const screenWidth = this.htmlElement.width;
            const screenHeight = this.htmlElement.height;
            const centerX = screenWidth / 2;
            const centerY = screenHeight / 2;
            
            // Calculate maximum radius needed to cover entire screen
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
            
            // Calculate current radius based on progress
            const currentRadius = (progress / 100) * maxRadius;
            
            // Create circular mask using CSS
            const maskHTML = `
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    mask: radial-gradient(circle at center, transparent ${currentRadius}px, black ${currentRadius + 1}px);
                    -webkit-mask: radial-gradient(circle at center, transparent ${currentRadius}px, black ${currentRadius + 1}px);
                    pointer-events: none;
                "></div>
            `;
            
            this.htmlElement.setInnerHTML(maskHTML);
            
        } catch (error: any) {
            console.error(`Failed to set mask state: ${error.message}`);
        }
    }

    /**
     * Create and start transition timer
     * @param duration Duration in seconds
     * @param isEnterTransition True for enter transition, false for leave transition
     */
    private createTransitionTimer(duration: number, isEnterTransition: boolean): void {
        try {
            // Create C3 Timer instance
            this.timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            this.timerTag = `layout_transition_${Date.now()}_${Math.random()}`;
            
            // Start update loop for smooth animation
            this.startAnimationLoop(duration, isEnterTransition);
            
            // Set up completion timer
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    this.onTransitionComplete();
                }
            });
            
            // Start completion timer
            this.timerInstance.behaviors.Timer.startTimer(duration, this.timerTag, "once");
            
        } catch (error: any) {
            console.error(`Failed to create transition timer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Start animation loop for smooth transition
     * @param duration Total duration in seconds
     * @param isEnterTransition True for enter transition, false for leave transition
     */
    private startAnimationLoop(duration: number, isEnterTransition: boolean): void {
        const startTime = Date.now();
        const durationMs = duration * 1000;
        
        const animate = () => {
            if (!this.isTransitioning) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            let maskProgress: number;
            if (isEnterTransition) {
                // Enter: 0% to 100% (mask disappears)
                maskProgress = progress * 100;
            } else {
                // Leave: 100% to 0% (mask appears)
                maskProgress = (1 - progress) * 100;
            }
            
            this.setMaskState(maskProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Handle transition completion
     */
    private onTransitionComplete(): void {
        console.log("Layout transition completed");
        
        // Execute callback if provided
        if (this.transitionCallback) {
            try {
                this.transitionCallback();
            } catch (error: any) {
                console.error(`Error executing transition callback: ${error.message}`);
            }
        }
        
        // Cleanup
        this.cleanup();
    }

    /**
     * Cleanup transition resources
     */
    private cleanup(): void {
        this.isTransitioning = false;
        this.transitionCallback = null;
        
        // Destroy timer
        if (this.timerInstance) {
            try {
                this.timerInstance.behaviors.Timer.stopTimer(this.timerTag);
                this.timerInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying transition timer: ${error.message}`);
            }
            this.timerInstance = null;
        }
        
        // Destroy HTML element
        if (this.htmlElement) {
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying transition HTML element: ${error.message}`);
            }
            this.htmlElement = null;
        }
        
        this.timerTag = "";
    }

    /**
     * Check if transition is currently in progress
     */
    public static IsTransitioning(): boolean {
        return LayoutTransition.instance?.isTransitioning || false;
    }

    /**
     * Force stop current transition
     */
    public static StopTransition(): void {
        if (LayoutTransition.instance) {
            LayoutTransition.instance.cleanup();
        }
    }
}
