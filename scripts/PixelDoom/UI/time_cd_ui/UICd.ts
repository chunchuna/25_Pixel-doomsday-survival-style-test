import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // for Test

    var cd_system = IMGUIDebugButton.AddCategory("cd_system")


    IMGUIDebugButton.AddButtonToCategory(cd_system, "show 'CD' on player position", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance()
        if (!PlayerInstance) return


        UICDTimer.CreateCD(10, CDType.CIRCLE_CLOCKWISE).setPosition(PlayerInstance.x, PlayerInstance.y).OnTimeArrive(() => {
            UISubtitleMain.ShowSubtitles("CD IS Over!!!")

            console.warn("CD TEST IS OVER")
        }).setColors("rgba(162, 179, 238, 0.7)", "rgba(12, 12, 12, 0.16)").setSize(20, 20);
    })

    // Add more test buttons for each type
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test CIRCLE_DRAIN effect", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.CIRCLE_DRAIN, "test2", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("CIRCLE_DRAIN test completed"));
    })

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test CIRCLE_CLOCKWISE effect", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.CIRCLE_CLOCKWISE, "test3", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("CIRCLE_CLOCKWISE test completed"));
    })

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test PROGRESS_BAR effect", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.PROGRESS_BAR, "test4", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("PROGRESS_BAR test completed"));
    })

});

// Enum for different countdown visual styles
export enum CDType {
    CIRCLE_FILL = "circleFill",       // Circle fills from empty to full
    CIRCLE_DRAIN = "circleDrain",     // Circle drains from full to empty
    CIRCLE_CLOCKWISE = "clockwise",   // Circle fills clockwise
    CIRCLE_PULSE = "pulse",           // Circle with pulsing effect
    PROGRESS_BAR = "progressBar"      // Horizontal progress bar
}

export class UICDTimer {
    private static instances: Map<string, UICDTimer> = new Map();
    private id: string;
    private htmlInstance: any;
    private startTime: number = 0;
    private duration: number;
    private type: CDType;
    private onTimeArriveCallback: (() => void) | null = null;
    private animationFrameId: number | null = null;
    private isPaused: boolean = false;
    private pausedTimeRemaining: number = 0;
    private layer: string;

    // Store default colors for easy reference
    private fillColor: string = "rgba(0, 255, 0, 0.7)";
    private backgroundColor: string = "rgba(0, 0, 0, 0.5)";

    // Add private properties to store dimensions
    private _width: number;
    private _height: number;

    private constructor(id: string, duration: number, type: CDType, x?: number, y?: number, layer: string = "html_c3") {
        this.id = id;
        this.duration = duration;
        this.type = type;
        this.layer = layer;
        
        // Set default dimensions based on type
        this._width = this.type === CDType.PROGRESS_BAR ? 150 : 100;
        this._height = this.type === CDType.PROGRESS_BAR ? 30 : 100;
        
        // Calculate position consistently
        let posX = 0;
        let posY = 0;
        
        // Get player instance for positioning if coordinates not provided
        if (x === undefined || y === undefined) {
            const PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            if (PlayerInstance) {
                posX = PlayerInstance.x;
                posY = PlayerInstance.y;
            } else {
                console.error("Failed to find player instance for positioning the CD timer");
            }
        } else {
            posX = x;
            posY = y;
        }
        
        // Create HTML instance with precise positioning
        this.htmlInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(layer, posX, posY);
        
        // Render the appropriate HTML based on timer type
        this.renderHTML();
        
        // Start the timer
        this.start();
        
        console.log(`Created ${this.type} countdown timer with ID: ${this.id}, duration: ${this.duration}s, position: (${posX}, ${posY})`);
    }

    /**
     * Creates a new countdown timer or returns an existing one
     * @param duration Duration in seconds
     * @param type Visual style of the countdown
     * @param id Unique identifier for this timer
     * @param x X position (default: player position)
     * @param y Y position (default: player position)
     * @param layer Layer name to create the timer on (default: "html_c3")
     */
    public static CreateCD(
        duration: number,
        type: CDType = CDType.CIRCLE_FILL,
        id: string = "default",
        x?: number,
        y?: number,
        layer: string = "html_c3"
    ): UICDTimer {
        // If instance with this ID already exists, destroy it first
        if (UICDTimer.instances.has(id)) {
            UICDTimer.instances.get(id)?.destroy();
        }

        // Create new instance
        const instance = new UICDTimer(id, duration, type, x, y, layer);
        UICDTimer.instances.set(id, instance);
        return instance;
    }

    /**
     * Sets callback function to be executed when countdown finishes
     */
    public OnTimeArrive(callback: () => void): UICDTimer {
        this.onTimeArriveCallback = callback;
        return this;
    }

    /**
     * Pauses the countdown
     */
    public pause(): void {
        if (!this.isPaused && this.animationFrameId !== null) {
            this.isPaused = true;
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;

            // Calculate remaining time
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.pausedTimeRemaining = Math.max(0, this.duration - elapsed);

            console.log(`Countdown paused with ${this.pausedTimeRemaining.toFixed(2)} seconds remaining`);
        }
    }

    /**
     * Resumes a paused countdown
     */
    public continue(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.startTime = Date.now() - ((this.duration - this.pausedTimeRemaining) * 1000);
            this.update();
            console.log("Countdown resumed");
        }
    }

    /**
     * Sets the position of the countdown timer
     * @param x X position
     * @param y Y position
     */
    public setPosition(x: number, y: number): UICDTimer {
        if (this.htmlInstance) {
            this.htmlInstance.x = x;
            this.htmlInstance.y = y;
        }
        return this;
    }

    /**
     * Sets the layer of the countdown timer
     * @param layer Layer name
     */
    public setLayer(layer: string): UICDTimer {
        if (this.htmlInstance && this.layer !== layer) {
            // Store current position
            const x = this.htmlInstance.x;
            const y = this.htmlInstance.y;

            // Destroy current instance
            this.htmlInstance.destroy();

            // Create new instance on the specified layer
            this.htmlInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(layer, x, y);
            this.layer = layer;

            // Re-render HTML
            this.renderHTML();

            // Update visual based on current progress
            const elapsed = (Date.now() - this.startTime) / 1000;
            const progress = Math.min(1, elapsed / this.duration);
            this.updateVisual(progress);
        }
        return this;
    }

    /**
     * Sets the size of the countdown timer
     * @param width Width in pixels
     * @param height Height in pixels
     */
    public setSize(width: number, height: number): UICDTimer {
        if (this.htmlInstance) {
            try {
                // Store the new size
                this._width = width;
                this._height = height;
                
                // Set size directly on the HTML component
                this.htmlInstance.width = width;
                this.htmlInstance.height = height;
                
                // Update the container to match
                const containerHtml = `
                <div id="cd-container-${this.id}" style="position:relative; width:100%; height:100%; border-radius:${this.type === CDType.PROGRESS_BAR ? '15px' : '50%'};">
                </div>`;
                
                // Set the container HTML
                this.htmlInstance.setContent(containerHtml, "html");
                
                // Update the visual to reflect current progress
                const elapsed = (Date.now() - this.startTime) / 1000;
                const progress = Math.min(1, elapsed / this.duration);
                this.updateVisual(progress);
                
                console.log(`Set size to ${width}x${height}`);
            } catch (error: any) {
                console.error(`Failed to set size: ${error.message}`);
            }
        }
        return this;
    }

    /**
     * Sets the color of the countdown timer
     * @param fillColor Color for the fill/progress part (e.g. "rgba(0, 255, 0, 0.7)")
     * @param backgroundColor Color for the background part (e.g. "rgba(0, 0, 0, 0.3)")
     */
    public setColors(fillColor: string, backgroundColor: string): UICDTimer {
        if (this.htmlInstance) {
            try {
                this.fillColor = fillColor;
                this.backgroundColor = backgroundColor;

                // Re-render the HTML with new colors
                this.renderHTML();

                // Update the visual based on current progress
                const elapsed = (Date.now() - this.startTime) / 1000;
                const progress = Math.min(1, elapsed / this.duration);
                this.updateVisual(progress);

                console.log(`Updated colors: fill=${fillColor}, bg=${backgroundColor}`);
            } catch (error: any) {
                console.error(`Failed to set colors: ${error.message}`);
            }
        }
        return this;
    }

    /**
     * Destroys the countdown timer and removes the HTML element
     */
    public destroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.htmlInstance) {
            this.htmlInstance.destroy();
            this.htmlInstance = null;
        }

        UICDTimer.instances.delete(this.id);
        console.log(`Countdown timer ${this.id} destroyed`);
    }

    /**
     * Starts the countdown
     */
    private start(): void {
        this.startTime = Date.now();
        this.update();
        console.log(`Countdown started for ${this.duration} seconds`);
    }

    /**
     * Updates the countdown visual and checks for completion
     */
    private update(): void {
        if (this.isPaused) return;

        const now = Date.now();
        const elapsed = (now - this.startTime) / 1000;
        const remaining = Math.max(0, this.duration - elapsed);
        const progress = Math.min(1, elapsed / this.duration);

        // Update the visual based on progress
        this.updateVisual(progress);

        // Check if countdown is complete
        if (remaining <= 0) {
            // Countdown complete
            this.updateVisual(1); // Ensure visual shows 100%

            // Start the fade-out animation
            this.fadeOutAndDestroy();

            // Execute callback if provided
            if (this.onTimeArriveCallback) {
                this.onTimeArriveCallback();
            }

            console.log("Countdown complete");

            // Clean up animation
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            return;
        }

        // Continue the animation loop
        this.animationFrameId = requestAnimationFrame(() => this.update());
    }

    /**
     * Performs fade-out animation and destroys the component when done
     */
    private fadeOutAndDestroy(): void {
        if (!this.htmlInstance) return;
        
        console.log("Starting fade-out animation");
        
        try {
            // First, add a style with animation to the container
            const animationStyle = `
            <style>
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                #cd-container-${this.id} {
                    animation: fadeOut 1s ease forwards;
                }
            </style>`;
            
            // Apply the animation style
            this.htmlInstance.setContent(animationStyle, "html", "", true);
            
            // Set a timeout to destroy after animation completes
            setTimeout(() => {
                if (this.htmlInstance) {
                    this.htmlInstance.destroy();
                    this.htmlInstance = null;
                    UICDTimer.instances.delete(this.id);
                    console.log(`Countdown timer ${this.id} faded out and destroyed`);
                }
            }, 1100); // Animation duration + small buffer
        } catch (error: any) {
            // If any error occurs during animation, fall back to immediate destroy
            console.error(`Error during fade animation: ${error.message}. Destroying immediately.`);
            if (this.htmlInstance) {
                this.htmlInstance.destroy();
                this.htmlInstance = null;
                UICDTimer.instances.delete(this.id);
            }
        }
    }

    /**
     * Updates the visual representation based on the current progress
     */
    private updateVisual(progress: number): void {
        try {
            // Adjust progress for visualization based on type
            const displayProgress = this.type === CDType.CIRCLE_DRAIN ? 1 - progress : progress;
            
            // Format the display progress as a percentage (0-100)
            const progressPercent = Math.min(100, Math.max(0, displayProgress * 100));
            
            // Update the visual display based on type
            switch (this.type) {
                case CDType.CIRCLE_FILL:
                    this.updateCircleFill(progressPercent);
                    break;
                    
                case CDType.CIRCLE_DRAIN:
                    this.updateCircleDrain(progressPercent);
                    break;
                    
                case CDType.CIRCLE_CLOCKWISE:
                    this.updateClockwise(progressPercent);
                    break;
                    
                case CDType.CIRCLE_PULSE:
                    this.updatePulse(progressPercent, progress);
                    break;
                    
                case CDType.PROGRESS_BAR:
                    this.updateProgressBar(progressPercent);
                    break;
            }
        } catch (error: any) {
            console.error(`Failed to update countdown visual: ${error.message}`);
        }
    }

    private updateCircleFill(progressPercent: number): void {
        // For the CIRCLE_FILL type, we need to update both the fill rotation and the mask
        const html = `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; position:relative;">
                <div style="width:50%; height:100%; position:absolute; overflow:hidden; transform:rotate(${Math.min(180, progressPercent * 3.6)}deg);">
                    <div style="width:100%; height:100%; position:absolute; background-color:${this.fillColor}; transform-origin:center right; transform:rotate(${Math.min(180, progressPercent * 3.6)}deg);"></div>
                </div>
                <div style="width:50%; height:100%; position:absolute; overflow:hidden; transform:rotate(180deg);">
                    <div style="width:100%; height:100%; position:absolute; background-color:${this.fillColor}; transform-origin:center right; transform:rotate(${Math.max(0, (progressPercent - 50) * 3.6)}deg); opacity:${progressPercent > 50 ? 1 : 0};"></div>
                </div>
                <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
            </div>
        </div>`;

        this.htmlInstance.setContent(html, "html");
    }

    private updateCircleDrain(progressPercent: number): void {
        // For CIRCLE_DRAIN, we need to invert the progress (100% -> 0%)
        const invertedProgress = 100 - progressPercent;

        // Create the HTML for the draining circle effect
        const html = `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; position:relative;">
                <div style="width:50%; height:100%; position:absolute; overflow:hidden; transform:rotate(${Math.min(180, invertedProgress * 3.6)}deg);">
                    <div style="width:100%; height:100%; position:absolute; background-color:${this.fillColor}; transform-origin:center right; transform:rotate(${Math.min(180, invertedProgress * 3.6)}deg);"></div>
                </div>
                <div style="width:50%; height:100%; position:absolute; overflow:hidden; transform:rotate(180deg);">
                    <div style="width:100%; height:100%; position:absolute; background-color:${this.fillColor}; transform-origin:center right; transform:rotate(${Math.max(0, (invertedProgress - 50) * 3.6)}deg); opacity:${invertedProgress > 50 ? 1 : 0};"></div>
                </div>
                <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
            </div>
        </div>`;

        this.htmlInstance.setContent(html, "html");
    }

    private updateClockwise(progressPercent: number): void {
        // Create a CSS conic gradient for the clockwise timer
        const degrees = progressPercent * 3.6;
        const html = `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; border-radius:50%; background:conic-gradient(${this.fillColor} 0deg, ${this.fillColor} ${degrees}deg, ${this.backgroundColor} ${degrees}deg, ${this.backgroundColor} 360deg);"></div>
            <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
        </div>`;

        this.htmlInstance.setContent(html, "html");
    }

    private updatePulse(progressPercent: number, rawProgress: number): void {
        // Calculate a pulsing effect using sine
        const scale = 0.8 + (Math.sin(rawProgress * Math.PI * 10) * 0.1);
        const degrees = progressPercent * 3.6;

        const html = `
        <div style="position:relative; width:100%; height:100%; transform:scale(${scale});">
            <div style="width:100%; height:100%; border-radius:50%; background:conic-gradient(${this.fillColor} 0deg, ${this.fillColor} ${degrees}deg, ${this.backgroundColor} ${degrees}deg, ${this.backgroundColor} 360deg);"></div>
            <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
        </div>`;

        this.htmlInstance.setContent(html, "html");
    }

    private updateProgressBar(progressPercent: number): void {
        // Create a simple progress bar
        const html = `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; background-color:${this.backgroundColor}; border-radius:15px; overflow:hidden;">
                <div style="width:${progressPercent}%; height:100%; background-color:${this.fillColor};"></div>
            </div>
        </div>`;

        this.htmlInstance.setContent(html, "html");
    }

    /**
     * Renders the initial HTML and CSS for the countdown timer
     */
    private renderHTML(): void {
        try {
            // Set the component size directly
            this.htmlInstance.width = this._width;
            this.htmlInstance.height = this._height;
            
            // Create a container with a unique ID for this timer that uses 100% of the component size
            // Include base styles directly in the HTML
            const containerHtml = `
            <style>
                #cd-container-${this.id} {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: ${this.type === CDType.PROGRESS_BAR ? '15px' : '50%'};
                    opacity: 1;
                    transition: opacity 0.3s ease; /* Add transition for any opacity changes */
                }
            </style>
            <div id="cd-container-${this.id}"></div>`;
            
            // Set the container HTML
            this.htmlInstance.setContent(containerHtml, "html");
            
            // Initialize with 0% progress
            this.updateVisual(0);
            
            console.log(`Rendered ${this.type} countdown timer HTML with size ${this._width}x${this._height}`);
        } catch (error: any) {
            console.error(`Failed to render countdown timer: ${error.message}`);
        }
    }
}