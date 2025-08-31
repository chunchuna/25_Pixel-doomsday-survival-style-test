import { hf_engine } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";



hf_engine.gl$_ubu_init(() => {
    if(hf_engine.runtime.layout.name!="Level") return
    // c3 build in timer example
    
    var timer_c3 = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100)
    timer_c3.behaviors.Timer.startTimer(5, "test", "once")
    timer_c3.behaviors.Timer.addEventListener("timer", (e) => {
        if (e.tag = "test") {
            console.log("c3 build in timer test")
        }

    })
    //startTimer(duration: number, name: string, type?: TimerBehaviorTimerType): void;
    //type TimerBehaviorTimerType = "once" | "regular";

})



hf_engine.gl$_ubu_init(() => {
    if(hf_engine.runtime.layout.name!="Level") return
    // for Test

    var cd_system = IMGUIDebugButton.AddCategory("cd_system")


    IMGUIDebugButton.AddButtonToCategory(cd_system, "show 'CD' on player position", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance()
        if (!PlayerInstance) return


        UICDTimer.CreateCD(50, CDType.CIRCLE_CLOCKWISE).setPosition(PlayerInstance.x, PlayerInstance.y).OnTimeArrive(() => {
            UISubtitleMain.ShowSubtitles("CD IS Over!!!")

            console.warn("CD TEST IS OVER")
        }).setColors("rgba(162, 179, 238, 0.7)", "rgba(12, 12, 12, 0.16)").setSize(20, 20);
    })

    // Add more test buttons for each type
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test CIRCLE_DRAIN effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.CIRCLE_DRAIN, "test2", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("CIRCLE_DRAIN test completed"));
    })

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test CIRCLE_CLOCKWISE effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.CIRCLE_CLOCKWISE, "test3", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("CIRCLE_CLOCKWISE test completed"));
    })

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test PROGRESS_BAR effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        UICDTimer.CreateCD(5, CDType.PROGRESS_BAR, "test4", PlayerInstance.x, PlayerInstance.y)
            .OnTimeArrive(() => console.warn("PROGRESS_BAR test completed"));
    })
    
    // Add quick test buttons for fade effect with short duration
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test Fade Effect (0.3s)", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        
        // Create multiple short-duration countdown timers to test fade effect
        UICDTimer.CreateCD(0.3, CDType.CIRCLE_DRAIN, "fadetest1", PlayerInstance.x - 50, PlayerInstance.y - 50)
            .setSize(80, 80)
            .setColors("rgba(255, 0, 0, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("CIRCLE_DRAIN test completed"));
            
        UICDTimer.CreateCD(0.3, CDType.CIRCLE_CLOCKWISE, "fadetest2", PlayerInstance.x + 50, PlayerInstance.y - 50)
            .setSize(80, 80)
            .setColors("rgba(0, 255, 0, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("CIRCLE_CLOCKWISE test completed"));
            
        UICDTimer.CreateCD(0.3, CDType.PROGRESS_BAR, "fadetest3", PlayerInstance.x, PlayerInstance.y + 50)
            .setSize(150, 30)
            .setColors("rgba(0, 0, 255, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("PROGRESS_BAR test completed"));
            
        console.log("Started quick test - fade effect will show after 0.3 seconds");
    });
    
    // Add save system test button
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test Save System (30s Timer)", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        
        // Create a 30-second countdown for save system testing
        UICDTimer.CreateCD(30, CDType.CIRCLE_DRAIN, "savetest", PlayerInstance.x, PlayerInstance.y)
            .setSize(120, 120)
            .setColors("rgba(255, 165, 0, 0.8)", "rgba(0, 0, 0, 0.6)")
            .OnTimeArrive(() => {
                UISubtitleMain.ShowSubtitles("Save test countdown completed!");
                console.warn("Save test countdown completed");
            });
            
        console.log("Created 30-second countdown for save testing - can save and load game during countdown");
        UISubtitleMain.ShowSubtitles("Created 30s countdown, test save system");
    });

    // Add debug button to show active countdown timer info
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Show Active Timer Info", () => {
        UICDTimer.showDebugInfo();
    });

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
    protected id: string;
    protected htmlElement: any; // HTML element instance
    protected timerInstance: any; // C3 Timer instance
    protected duration: number;
    protected type: CDType;
    protected onTimeArriveCallback: (() => void) | null = null;
    protected isPaused: boolean = false;
    protected layer: string;
    protected timerTag: string;
    
    // 添加一个私有属性来跟踪当前进度
    protected _currentProgress: number = 0;
    
    // 淡出动画持续时间（毫秒）
    public static FADE_OUT_DURATION: number = 1500

    // Default colors for easy reference
    protected fillColor: string = "rgba(0, 255, 0, 0.7)";
    protected backgroundColor: string = "rgba(0, 0, 0, 0.5)";

    // Properties to store dimensions
    protected _width: number;
    protected _height: number;

    private constructor(id: string, duration: number, type: CDType, x?: number, y?: number, layer: string = "html_c3") {
        this.id = id;
        this.duration = duration;
        this.type = type;
        this.layer = layer;
        this.timerTag = `cd_${id}_${Date.now()}`;

        // Set default dimensions based on type
        this._width = this.type === CDType.PROGRESS_BAR ? 150 : 100;
        this._height = this.type === CDType.PROGRESS_BAR ? 30 : 100;

        // Calculate position
        let posX = 0;
        let posY = 0;

        // Use player position if coordinates not provided
        if (x === undefined || y === undefined) {
            const PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
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

        // Create HTML display element
        try {
            // Use any type to bypass type checking
            const objects = hf_engine.runtime.objects as any;
            this.htmlElement = objects.HTML_c3.createInstance(layer, posX, posY);
            
            // Use the predefined id instance variable to store countdown timer info
            // Format: "CD|timerId|type|duration|fillColor|backgroundColor"
            const expectedId = `CD|${this.id}|${this.type}|${this.duration}|${encodeURIComponent(this.fillColor)}|${encodeURIComponent(this.backgroundColor)}`;
            this.htmlElement.instVars.id = expectedId;
            
            // Verify HTML id was set correctly
            if (this.htmlElement.instVars.id !== expectedId) {
                console.error(`HTML instVars.id verification failed! Expected: ${expectedId}, Got: ${this.htmlElement.instVars.id}`);
            }
            
            // Set HTML element size
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            
            // Render initial HTML
        this.renderHTML();
            
            // Create C3 timer instance and set event listeners
            this.createTimerInstance();
            
            console.log(`Created ${this.type} countdown timer with ID: ${this.id}, duration: ${this.duration}s, position: (${posX}, ${posY})`);
        } catch (error: any) {
            console.error(`Failed to create CD timer: ${error.message}`);
        }
    }

    /**
     * Creates C3 timer instance
     */
    private createTimerInstance(): void {
        try {
            // Create C3 Timer instance
            const objects = hf_engine.runtime.objects as any;
            this.timerInstance = objects.C3Ctimer.createInstance("Other", -100, -100);
            
            // Set Timer id to match HTML id format: "CD|timerId|type|duration|fillColor|backgroundColor"
            const expectedId = `CD|${this.id}|${this.type}|${this.duration}|${encodeURIComponent(this.fillColor)}|${encodeURIComponent(this.backgroundColor)}`;
            this.timerInstance.instVars.id = expectedId;
            
            // Verify Timer id was set correctly
            if (this.timerInstance.instVars.id !== expectedId) {
                console.error(`Timer instVars.id verification failed! Expected: ${expectedId}, Got: ${this.timerInstance.instVars.id}`);
            }
            
            // Listen for timer events
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    // 直接开始淡出，保持当前进度状态（不更新为100%）
                    this.fadeOutAndDestroy();
                    
                    // Execute callback if provided
                    if (this.onTimeArriveCallback) {
                        this.onTimeArriveCallback();
                    }
                    
                    console.log("Countdown complete");
                }
            });

        // Start the timer
        this.start();

        } catch (error: any) {
            console.error(`Failed to create timer instance: ${error.message}`);
        }
    }

    /**
     * Creates a new countdown timer or returns existing one
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
        if (!this.isPaused && this.timerInstance) {
            this.isPaused = true;
            this.timerInstance.behaviors.Timer.setTimerPaused(this.timerTag, true);
            console.log(`Countdown paused`);
        }
    }

    /**
     * Resumes a paused countdown
     */
    public continue(): void {
        if (this.isPaused && this.timerInstance) {
            this.isPaused = false;
            this.timerInstance.behaviors.Timer.setTimerPaused(this.timerTag, false);
            console.log("Countdown resumed");
        }
    }

    /**
     * Sets the position of the countdown timer
     * @param x X position
     * @param y Y position
     */
    public setPosition(x: number, y: number): UICDTimer {
        if (this.htmlElement) {
            this.htmlElement.x = x;
            this.htmlElement.y = y;
        }
        return this;
    }

    /**
     * Sets the layer of the countdown timer
     * @param layer Layer name
     */
    public setLayer(layer: string): UICDTimer {
        if (this.htmlElement && this.layer !== layer) {
            // Store current position
            const x = this.htmlElement.x;
            const y = this.htmlElement.y;

            // Destroy current instance
            this.htmlElement.destroy();

            // Create new instance on the specified layer
            const objects = hf_engine.runtime.objects as any;
            this.htmlElement = objects.HTML_c3.createInstance(layer, x, y);
            this.layer = layer;

            // Set the id again after recreating HTML element
            this.htmlElement.instVars.id = `CD|${this.id}|${this.type}|${this.duration}|${encodeURIComponent(this.fillColor)}|${encodeURIComponent(this.backgroundColor)}`;
            console.log(`Reset HTML instVars.id after layer change: ${this.htmlElement.instVars.id}`);

            // Re-render HTML
            this.renderHTML();

            // Update visual based on current progress
            this.updateVisualFromTimer();
        }
        return this;
    }

    /**
     * Sets the size of the countdown timer
     * @param width Width in pixels
     * @param height Height in pixels
     */
    public setSize(width: number, height: number): UICDTimer {
        if (this.htmlElement) {
            try {
                // Store the new size
                this._width = width;
                this._height = height;

                // Set size directly on the HTML component
                this.htmlElement.width = width;
                this.htmlElement.height = height;

                // Update the container to match
                const containerHtml = `
                <div id="cd-container-${this.id}" style="position:relative; width:100%; height:100%; border-radius:${this.type === CDType.PROGRESS_BAR ? '15px' : '50%'};">
                </div>`;

                // Set the container HTML
                this.htmlElement.setContent(containerHtml, "html");

                // Update the visual to reflect current progress
                this.updateVisualFromTimer();

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
        if (this.htmlElement) {
            try {
                this.fillColor = fillColor;
                this.backgroundColor = backgroundColor;

                // Re-render the HTML with new colors
                this.renderHTML();

                // Update the visual based on current progress
                this.updateVisualFromTimer();

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
        try {
            // Stop timer first
            if (this.timerInstance && this.timerInstance.behaviors && this.timerInstance.behaviors.Timer) {
                try {
                    this.timerInstance.behaviors.Timer.stopTimer(this.timerTag);
                } catch (timerError: any) {
                    console.warn(`Error stopping timer: ${timerError.message}`);
                }
                
                try {
                    this.timerInstance.destroy();
                } catch (timerDestroyError: any) {
                    console.warn(`Error destroying timer instance: ${timerDestroyError.message}`);
                }
            }
            
            // Destroy HTML element
            if (this.htmlElement) {
                try {
                    this.htmlElement.destroy();
                } catch (htmlError: any) {
                    console.warn(`Error destroying HTML element: ${htmlError.message}`);
                }
            }
            
            // Clear references
            this.timerInstance = null;
            this.htmlElement = null;
            this.onTimeArriveCallback = null;
            
            // Remove from instances map
            UICDTimer.instances.delete(this.id);
            
            console.log(`Countdown timer ${this.id} destroyed`);
        } catch (error: any) {
            console.error(`Error in destroy method: ${error.message}`);
            
            // Force cleanup even if there were errors
            this.timerInstance = null;
            this.htmlElement = null;
            this.onTimeArriveCallback = null;
            UICDTimer.instances.delete(this.id);
        }
    }

    /**
     * Starts the countdown
     */
    private start(): void {
        if (this.timerInstance && this.timerInstance.behaviors.Timer) {
            // Use C3's Timer component to start the timer
            this.timerInstance.behaviors.Timer.startTimer(this.duration, this.timerTag, "once");
            
            // Start progress update loop
            this.startProgressUpdateLoop();
            
            console.log(`Countdown started for ${this.duration} seconds with tag ${this.timerTag}`);
        }
    }

    /**
     * Starts progress update loop
     */
    private startProgressUpdateLoop(): void {
        // Create an update function to update the visual effect
        const updateFunction = () => {
            // Check if HTML element is still valid and not destroyed
            if (!this.htmlElement || !this.timerInstance) {
                console.log("Update loop stopped - HTML element or timer instance no longer exists");
                return;
            }
            
            // Additional check to ensure HTML element is still valid
            try {
                // Try to access a property to verify the element is still valid
                const isValid = this.htmlElement.x !== undefined && this.htmlElement.y !== undefined;
                if (!isValid) {
                    console.log("Update loop stopped - HTML element is no longer valid");
                    return;
                }
                
                // Extra check: verify the HTML element is still in the instances list
                const stillInList = hf_engine.runtime.objects.HTML_c3
                    .getAllInstances()
                    .includes(this.htmlElement);
                if (!stillInList) {
                    console.log("Update loop stopped - HTML element no longer in instances list");
                    return;
                }
            } catch (error: any) {
                console.log("Update loop stopped - HTML element access failed:", error.message);
                return;
            }
            
            try {
                // If timer is still running, update visual effect
                if (this.timerInstance.behaviors.Timer.isTimerRunning(this.timerTag)) {
                    this.updateVisualFromTimer();
                    requestAnimationFrame(updateFunction);
                } else {
                    console.log("Update loop stopped - timer is no longer running");
                }
            } catch (error: any) {
                console.error(`Error in progress update loop: ${error.message}`);
                // Stop the update loop if there's an error
                console.log("Update loop stopped due to error");
            }
        };
        
        // Start update loop
        requestAnimationFrame(updateFunction);
    }

    /**
     * Gets current progress from C3 timer and updates visual
     */
    private updateVisualFromTimer(): void {
        try {
            if (!this.timerInstance || !this.timerInstance.behaviors.Timer) return;
            
            // Check if HTML element is still valid before updating
            if (!this.htmlElement) {
                console.log("Cannot update visual - HTML element no longer exists");
                return;
            }
            
            // Additional check to ensure HTML element is still valid
            try {
                // Try to access a property to verify the element is still valid
                const isValid = this.htmlElement.x !== undefined;
                if (!isValid) {
                    console.log("Cannot update visual - HTML element is no longer valid");
                    return;
                }
            } catch (elementError: any) {
                console.log("Cannot update visual - HTML element access failed:", elementError.message);
                return;
            }
            
            const timer = this.timerInstance.behaviors.Timer;
            
            // Check if timer is running
            if (timer.isTimerRunning(this.timerTag)) {
                // Get current time and total duration
                const currentTime = timer.getCurrentTime(this.timerTag);
                const duration = timer.getDuration(this.timerTag);
                
                // Calculate progress (from 1 to 0 for countdown effect)
                let progress = 0;
                if (duration > 0) {
                    // For countdown we need to invert the progress (1->0 instead of 0->1)
                    progress = 1 - (currentTime / duration);
                    
                    // Debug log to check values
                    //console.log(`Timer update - currentTime: ${currentTime}, duration: ${duration}, countdown progress: ${progress}`);
                }
                
                // Update visual effect
                this.updateVisual(progress);

                console.log(`Timer progress: ${progress} (currentTime: ${currentTime}, totalDuration: ${duration})`);
                
                // Calculate remaining time
                const remainingTime = duration - (duration * progress);
                console.log(`Remaining time: ${remainingTime.toFixed(1)}s`);
            }
        } catch (error: any) {
            console.error(`Failed to update from timer: ${error.message}`);
        }
    }

    /**
     * Performs fade-out animation and destroys the component when done
     */
    private fadeOutAndDestroy(): void {
        if (!this.htmlElement) return;

        console.log("Starting fade-out animation");

        try {
            // 保持当前状态（不强制设为100%）
            
            // 使用手动透明度淡出动画
            const totalDuration = UICDTimer.FADE_OUT_DURATION;
            const startTime = Date.now();
            const initialOpacity = 1.0;
            
            // 创建淡出效果函数
            const fadeStep = () => {
                if (!this.htmlElement) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / totalDuration, 1.0);
                const currentOpacity = initialOpacity * (1 - progress);
                
                // 应用透明度但保持当前视觉状态不变
                // 使用getCurrentVisualHtml方法获取当前进度的HTML
                const htmlContent = `
                <div style="position:relative; width:100%; height:100%; opacity:${currentOpacity};">
                    ${this.getCurrentVisualHtml()}
                </div>`;
                
                this.htmlElement.setContent(htmlContent, "html");
                
                // 如果淡出未完成，继续下一帧
                if (progress < 1.0) {
                    requestAnimationFrame(fadeStep);
                } else {
                    // 淡出完成，销毁计时器
                    if (this.htmlElement) {
                        this.htmlElement.destroy();
                        this.htmlElement = null;
                    }
                    
                    if (this.timerInstance) {
                        this.timerInstance.destroy();
                        this.timerInstance = null;
                    }
                    
                    UICDTimer.instances.delete(this.id);
                    console.log(`Countdown timer ${this.id} faded out and destroyed`);
                }
            };
            
            // 开始淡出动画
            requestAnimationFrame(fadeStep);
            
        } catch (error: any) {
            // 如果动画过程中发生任何错误，立即销毁
            console.error(`Error during fade animation: ${error.message}. Destroying immediately.`);
            this.destroy();
        }
    }

    /**
     * Gets the current visual content HTML based on timer type
     */
    private getContentHtml(): string {
        // Get the completed state (100%)
        switch (this.type) {
            case CDType.CIRCLE_FILL:
                return this.createCircleFillHtml(100);
            case CDType.CIRCLE_DRAIN:
                return this.createCircleDrainHtml(100);
            case CDType.CIRCLE_CLOCKWISE:
                return this.createClockwiseHtml(100);
            case CDType.CIRCLE_PULSE:
                return this.createPulseHtml(100, 1);
            case CDType.PROGRESS_BAR:
                return this.createProgressBarHtml(100);
            default:
                return this.createCircleFillHtml(100);
        }
    }

    /**
     * 根据当前进度获取HTML内容
     */
    private getCurrentVisualHtml(): string {
        // 使用当前保存的进度值生成HTML
        const displayProgress = this.type === CDType.CIRCLE_DRAIN ? 1 - this._currentProgress : this._currentProgress;
            const progressPercent = Math.min(100, Math.max(0, displayProgress * 100));

        // 根据类型返回相应的HTML
            switch (this.type) {
                case CDType.CIRCLE_FILL:
                return this.createCircleFillHtml(progressPercent);
                case CDType.CIRCLE_DRAIN:
                return this.createCircleDrainHtml(progressPercent);
                case CDType.CIRCLE_CLOCKWISE:
                return this.createClockwiseHtml(progressPercent);
                case CDType.CIRCLE_PULSE:
                return this.createPulseHtml(progressPercent, this._currentProgress);
                case CDType.PROGRESS_BAR:
                return this.createProgressBarHtml(progressPercent);
            default:
                return this.createCircleFillHtml(progressPercent);
        }
    }

    /**
     * Creates HTML for circle fill visualization
     */
    private createCircleFillHtml(progressPercent: number): string {
        return `
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
    }

    /**
     * Creates HTML for circle drain visualization
     */
    private createCircleDrainHtml(progressPercent: number): string {
        const invertedProgress = 100 - progressPercent;
        return `
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
    }

    /**
     * Creates HTML for clockwise visualization
     */
    private createClockwiseHtml(progressPercent: number): string {
        const degrees = progressPercent * 3.6;
        return `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; border-radius:50%; background:conic-gradient(${this.fillColor} 0deg, ${this.fillColor} ${degrees}deg, ${this.backgroundColor} ${degrees}deg, ${this.backgroundColor} 360deg);"></div>
            <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
        </div>`;
    }

    /**
     * Creates HTML for pulse visualization
     */
    private createPulseHtml(progressPercent: number, rawProgress: number): string {
        const scale = 0.8 + (Math.sin(rawProgress * Math.PI * 10) * 0.1);
        const degrees = progressPercent * 3.6;
        return `
        <div style="position:relative; width:100%; height:100%; transform:scale(${scale});">
            <div style="width:100%; height:100%; border-radius:50%; background:conic-gradient(${this.fillColor} 0deg, ${this.fillColor} ${degrees}deg, ${this.backgroundColor} ${degrees}deg, ${this.backgroundColor} 360deg);"></div>
            <div style="width:80%; height:80%; background-color:${this.backgroundColor}; border-radius:50%; position:absolute; top:10%; left:10%;"></div>
        </div>`;
    }

    /**
     * Creates HTML for progress bar visualization
     */
    private createProgressBarHtml(progressPercent: number): string {
        return `
        <div style="position:relative; width:100%; height:100%;">
            <div style="width:100%; height:100%; background-color:${this.backgroundColor}; border-radius:15px; overflow:hidden;">
                <div style="width:${progressPercent}%; height:100%; background-color:${this.fillColor};"></div>
            </div>
        </div>`;
    }

    private updateCircleFill(progressPercent: number): void {
        if (!this.htmlElement) return;
        try {
            this.htmlElement.setContent(this.createCircleFillHtml(progressPercent), "html");
        } catch (error: any) {
            console.error(`Failed to update circle fill: ${error.message}`);
        }
    }

    private updateCircleDrain(progressPercent: number): void {
        if (!this.htmlElement) return;
        try {
            this.htmlElement.setContent(this.createCircleDrainHtml(progressPercent), "html");
        } catch (error: any) {
            console.error(`Failed to update circle drain: ${error.message}`);
        }
    }

    private updateClockwise(progressPercent: number): void {
        if (!this.htmlElement) return;
        try {
            this.htmlElement.setContent(this.createClockwiseHtml(progressPercent), "html");
        } catch (error: any) {
            console.error(`Failed to update clockwise: ${error.message}`);
        }
    }

    private updatePulse(progressPercent: number, rawProgress: number): void {
        if (!this.htmlElement) return;
        try {
            this.htmlElement.setContent(this.createPulseHtml(progressPercent, rawProgress), "html");
        } catch (error: any) {
            console.error(`Failed to update pulse: ${error.message}`);
        }
    }

    private updateProgressBar(progressPercent: number): void {
        if (!this.htmlElement) return;
        try {
            this.htmlElement.setContent(this.createProgressBarHtml(progressPercent), "html");
        } catch (error: any) {
            console.error(`Failed to update progress bar: ${error.message}`);
        }
    }

    private updateVisual(progress: number): void {
        try {
            // Check if HTML element is still valid before updating
            if (!this.htmlElement) {
                console.log("Cannot update visual - HTML element no longer exists");
                return;
            }
            
            // Additional check to ensure HTML element is still valid
            try {
                // Try to access a property to verify the element is still valid
                const isValid = this.htmlElement.x !== undefined;
                if (!isValid) {
                    console.log("Cannot update visual - HTML element is no longer valid");
                    return;
                }
            } catch (elementError: any) {
                console.log("Cannot update visual - HTML element access failed:", elementError.message);
                return;
            }
            
            // 保存当前进度值，用于淡出时保持状态
            this._currentProgress = progress;
            
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

    private renderHTML(): void {
        try {
           
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;

        
            const containerHtml = `
            <style>
                #cd-container-${this.id} {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: ${this.type === CDType.PROGRESS_BAR ? '15px' : '50%'};
                    opacity: 1;
                    transition: opacity 0.1s ease; /* Add transition for any opacity changes */
                }
            </style>
            <!-- CD_MARKER:${this.id}|${this.type}|${this.duration} -->
            <div id="cd-container-${this.id}"></div>`;


            this.htmlElement.setContent(containerHtml, "html");


            this.updateVisual(0);

            console.log(`Rendered ${this.type} countdown timer HTML with size ${this._width}x${this._height}`);
        } catch (error: any) {
            console.error(`Failed to render countdown timer: ${error.message}`);
        }
    }

    /**
     * Sets the fade-out duration for all countdown timers
     * @param duration Duration in milliseconds
     */
    public static SetFadeOutDuration(duration: number): void {
        if (duration > 0) {
            UICDTimer.FADE_OUT_DURATION = duration;
            console.log(`Set fade-out duration to ${duration}ms`);
        }
    }

    /**
     * Reestablish timer connection (for use after save loading)
     */
    private reestablishTimerConnection(): void {
        if (!this.timerInstance || !this.timerInstance.behaviors.Timer) return;
        
        try {
            // Re-add event listeners
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    // Start fade out directly, maintain current progress state (don't update to 100%)
                    this.fadeOutAndDestroy();
                    
                    // Execute callback if provided
                    if (this.onTimeArriveCallback) {
                        this.onTimeArriveCallback();
                    }
                    
                    console.log("Countdown complete (reconnected)");
                }
            });
            
            console.log(`Reestablished timer connection for ${this.id}`);
        } catch (error: any) {
            console.error(`Failed to reestablish timer connection: ${error.message}`);
        }
    }

    /**
     * Scan and reconnect all existing countdown timer instances
     */
    public static scanAndReconnectAllTimers(): void {
        try {
            const objects = hf_engine.runtime.objects as any;
            
            // Scan all HTML_c3 instances to find countdown timers
            const htmlInstances = objects.HTML_c3.getAllInstances();
            const timerInstances = objects.C3Ctimer.getAllInstances();
            
            console.log(`Found ${htmlInstances.length} HTML instances and ${timerInstances.length} timer instances`);
            
            // Debug: Show all HTML instance ids
            htmlInstances.forEach((html: any, index: number) => {
                const idValue = html.instVars?.id;
                if (idValue && idValue.startsWith && idValue.startsWith("CD|")) {
                    console.log(`Found countdown timer HTML[${index}]: id="${idValue}", position=(${html.x}, ${html.y})`);
                }
            });
            
            // Debug: Show all Timer instance ids
            timerInstances.forEach((timer: any, index: number) => {
                const idValue = timer.instVars?.id;
                if (idValue && idValue.startsWith && idValue.startsWith("CD|")) {
                    console.log(`Found countdown timer Timer[${index}]: id="${idValue}"`);
                }
            });
            
            // Find all countdown timer HTML instances by parsing id
            const countdownHtmls: any[] = [];
            htmlInstances.forEach((htmlElement: any) => {
                try {
                    // Check if instVars.id starts with "CD|" to identify countdown timers
                    if (htmlElement.instVars?.id && htmlElement.instVars.id.startsWith("CD|")) {
                        countdownHtmls.push(htmlElement);
                        
                        // Parse the id to get timer info
                        const parts = htmlElement.instVars.id.split("|");
                        if (parts.length >= 4) {
                            const [prefix, timerId, type, duration] = parts;
                            console.log(`Found countdown timer HTML: ${timerId}, type: ${type}, duration: ${duration}`);
                        }
                    }
                } catch (error: any) {
                    console.warn(`Error checking HTML instance: ${error.message}`);
                }
            });
            
            console.log(`Found ${countdownHtmls.length} countdown timer HTML instances`);
            
            // If no countdown timers found by id, try backup method using HTML content markers
            if (countdownHtmls.length === 0) {
                console.log("No countdown timers found by instVars.id, trying backup method with HTML content markers...");
                
                htmlInstances.forEach((htmlElement: any) => {
                    try {
                        // Get HTML content and look for CD_MARKER
                        const content = htmlElement.getContent();
                        if (content && content.includes("CD_MARKER:")) {
                            const markerMatch = content.match(/CD_MARKER:([^|]+)\|([^|]+)\|([^|]+)/);
                            if (markerMatch) {
                                const [, timerId, type, duration] = markerMatch;
                                console.log(`Found countdown timer by marker: ${timerId}, type: ${type}, duration: ${duration}`);
                                countdownHtmls.push(htmlElement);
                                
                                // Set the instVars.id based on marker info (in case it was lost)
                                htmlElement.instVars.id = `CD|${timerId}|${type}|${duration}`;
                                console.log(`Restored HTML instVars.id from marker: ${htmlElement.instVars.id}`);
                            }
                        }
                    } catch (error: any) {
                        console.warn(`Error checking HTML content: ${error.message}`);
                    }
                });
                
                console.log(`Found ${countdownHtmls.length} countdown timer HTML instances using backup method`);
            }
            
            // Find all countdown timer Timer instances by parsing id
            const countdownTimers: any[] = [];
            timerInstances.forEach((timerElement: any) => {
                try {
                    // Check if instVars.id starts with "CD|" to identify countdown timers
                    if (timerElement.instVars?.id && timerElement.instVars.id.startsWith("CD|")) {
                        countdownTimers.push(timerElement);
                        
                        // Parse the id to get timer info
                        const parts = timerElement.instVars.id.split("|");
                        if (parts.length >= 4) {
                            const [prefix, timerId, type, duration] = parts;
                            console.log(`Found countdown timer Timer: ${timerId}, type: ${type}, duration: ${duration}`);
                        }
                    }
                } catch (error: any) {
                    console.warn(`Error checking Timer instance: ${error.message}`);
                }
            });
            
            console.log(`Found ${countdownTimers.length} countdown timer Timer instances`);
            
            // Handle case where we have Timer instances but no HTML instances
            if (countdownHtmls.length === 0 && countdownTimers.length > 0) {
                console.log("Found Timer instances but no HTML instances - recreating HTML elements...");
                
                countdownTimers.forEach((timerElement: any) => {
                    try {
                        // Parse timer id to get info
                        const parts = timerElement.instVars.id.split("|");
                        if (parts.length < 4) {
                            console.warn(`Invalid timer id format: ${timerElement.instVars.id}`);
                            return;
                        }
                        
                        const [prefix, timerId, typeStr, durationStr, encodedFillColor, encodedBackgroundColor, progressStr] = parts;
                        const type = typeStr as CDType;
                        const duration = parseFloat(durationStr);
                        
                        console.log(`Recreating HTML for timer: ${timerId}, type: ${type}, duration: ${duration}`);
                        
                        // Parse colors from timer id (with fallback to defaults)
                        let fillColor = "rgba(0, 255, 0, 0.7)";
                        let backgroundColor = "rgba(0, 0, 0, 0.5)";
                        
                        if (encodedFillColor && encodedBackgroundColor) {
                            try {
                                fillColor = decodeURIComponent(encodedFillColor);
                                backgroundColor = decodeURIComponent(encodedBackgroundColor);
                                console.log(`Parsed colors from timer id: fill=${fillColor}, bg=${backgroundColor}`);
                            } catch (decodeError: any) {
                                console.warn(`Failed to decode colors, using defaults: ${decodeError.message}`);
                            }
                        }
                        
                        // Parse saved progress (if available)
                        let savedProgress = 0;
                        if (progressStr) {
                            savedProgress = parseFloat(progressStr);
                            console.log(`Parsed saved progress from timer: ${(savedProgress * 100).toFixed(1)}%`);
                        }
                        
                        // Calculate remaining time based on saved progress
                        const elapsedTime = duration * savedProgress;
                        const remainingTime = duration - elapsedTime;
                        console.log(`Timer restoration: duration=${duration}s, elapsed=${elapsedTime.toFixed(1)}s, remaining=${remainingTime.toFixed(1)}s`);
                        
                        // Find player position for HTML placement
                        let posX = 0, posY = 0;
                        const PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
                        if (PlayerInstance) {
                            posX = PlayerInstance.x;
                            posY = PlayerInstance.y;
                        }
                        
                        // Create new HTML element
                        const objects = hf_engine.runtime.objects as any;
                        
                        // Try different layers to see if one is more stable
                        let newHtmlElement;
                        let layerUsed = "html_c3";
                        
                        try {
                            newHtmlElement = objects.HTML_c3.createInstance("html_c3", posX, posY);
                            console.log(`Created HTML element on html_c3 layer at position (${posX}, ${posY})`);
                        } catch (layerError: any) {
                            console.warn(`Failed to create on html_c3 layer: ${layerError.message}`);
                            try {
                                newHtmlElement = objects.HTML_c3.createInstance("UI", posX, posY);
                                layerUsed = "UI";
                                console.log(`Created HTML element on UI layer at position (${posX}, ${posY})`);
                            } catch (uiLayerError: any) {
                                console.error(`Failed to create on UI layer: ${uiLayerError.message}`);
                                return;
                            }
                        }
                        
                        console.log(`HTML element UID: ${newHtmlElement.uid}, Layer: ${layerUsed}`);
                        
                        // Set the instVars.id with countdown timer info
                        // Use parsed colors
                        newHtmlElement.instVars.id = `CD|${timerId}|${type}|${duration}|${encodeURIComponent(fillColor)}|${encodeURIComponent(backgroundColor)}`;
                        console.log(`Set HTML instVars.id: ${newHtmlElement.instVars.id}`);
                        
                        // Set default size
                        const width = type === CDType.PROGRESS_BAR ? 150 : 100;
                        const height = type === CDType.PROGRESS_BAR ? 30 : 100;
                        newHtmlElement.width = width;
                        newHtmlElement.height = height;
                        
                        console.log(`Set HTML size: ${width}x${height}`);
                        
                        // Check if HTML element is still valid immediately after creation
                        try {
                            const stillExists = newHtmlElement.x !== undefined && newHtmlElement.y !== undefined;
                            console.log(`HTML element still exists after setup: ${stillExists}`);
                        } catch (checkError: any) {
                            console.error(`HTML element check failed: ${checkError.message}`);
                            return; // Don't continue if HTML element is already invalid
                        }
                        
                        // Generate new timer tag since we can't recover the old one
                        const newTimerTag = `cd_${timerId}_${Date.now()}`;
                        console.log(`Generated new timer tag: ${newTimerTag}`);
                        
                        // Create new UICDTimer instance
                        const instance = Object.create(UICDTimer.prototype);
                        instance.id = timerId;
                        instance.htmlElement = newHtmlElement;
                        instance.timerInstance = timerElement;
                        instance.type = type;
                        instance.layer = layerUsed;
                        instance._width = width;
                        instance._height = height;
                        instance.fillColor = "rgba(0, 255, 0, 0.7)";
                        instance.backgroundColor = "rgba(0, 0, 0, 0.5)";
                        instance._currentProgress = savedProgress;
                        instance.isPaused = false;
                        instance.onTimeArriveCallback = null;
                        instance.timerTag = newTimerTag;
                        instance.duration = duration;
                        
                        // Ensure Timer also has the correct id
                        timerElement.instVars.id = `CD|${timerId}|${type}|${duration}|${encodeURIComponent(instance.fillColor)}|${encodeURIComponent(instance.backgroundColor)}`;
                        
                        // Stop any existing timers and start a new one with remaining time
                        timerElement.behaviors.Timer.stopAllTimers();
                        
                        // Start new timer with remaining time (not full duration)
                        if (remainingTime > 0) {
                            timerElement.behaviors.Timer.startTimer(remainingTime, newTimerTag, "once");
                            console.log(`Started timer with remaining time: ${remainingTime.toFixed(1)}s`);
                        } else {
                            // Timer already completed
                            console.log(`Timer already completed, not starting new timer`);
                        }
                        
                        // Render HTML and set current progress
                        instance.renderHTML();
                        instance.updateVisual(savedProgress);
                        
                        // Reestablish connections
                        instance.reestablishTimerConnection();
                        
                        // Only start update loop if timer is still running
                        if (remainingTime > 0) {
                            instance.startProgressUpdateLoop();
                        }
                        
                        // Add to instance mapping
                        UICDTimer.instances.set(timerId, instance);
                        
                        console.log(`Successfully recreated countdown timer: ${timerId}, restored to ${(savedProgress * 100).toFixed(1)}% progress`);
                        
                        // Add a delayed check to see if HTML element gets destroyed
                        setTimeout(() => {
                            try {
                                if (instance.htmlElement) {
                                    const stillExists = instance.htmlElement.x !== undefined && instance.htmlElement.y !== undefined;
                                    console.log(`HTML element still exists after 1 second: ${stillExists} (timer: ${timerId})`);
                                    if (!stillExists) {
                                        console.error(`HTML element was destroyed shortly after creation! (timer: ${timerId})`);
                                    }
                                } else {
                                    console.error(`HTML element reference is null after 1 second! (timer: ${timerId})`);
                                }
                            } catch (delayedCheckError: any) {
                                console.error(`Delayed check failed for timer ${timerId}: ${delayedCheckError.message}`);
                            }
                        }, 1000);
                        
                    } catch (error: any) {
                        console.error(`Error recreating HTML for timer: ${error.message}`);
                    }
                });
                
                console.log(`Recreated ${UICDTimer.instances.size} countdown timers from Timer instances`);
                return; // Skip the normal matching process since we handled it here
            }
            
            // Match HTML and Timer instances by their id
            countdownHtmls.forEach((htmlElement: any) => {
                try {
                    const htmlId = htmlElement.instVars.id;
                    
                    // Log HTML element details
                    console.log(`\nProcessing HTML element:`);
                    console.log(`  - instVars.id: ${htmlId}`);
                    console.log(`  - UID: ${htmlElement.uid}`);
                    console.log(`  - Position: (${htmlElement.x}, ${htmlElement.y})`);
                    console.log(`  - Size: ${htmlElement.width}x${htmlElement.height}`);
                    console.log(`  - Layer: ${htmlElement.layer}`);
                    
                    // Find corresponding Timer instance with matching id
                    // Compare only the base parts (ignore progress part if present)
                    const htmlParts = htmlId.split("|");
                    const htmlBaseId = htmlParts.slice(0, 6).join("|"); // Take first 6 parts (without progress)
                    
                    const matchingTimer = countdownTimers.find((timer: any) => {
                        const timerParts = timer.instVars.id.split("|");
                        const timerBaseId = timerParts.slice(0, 6).join("|");
                        return timerBaseId === htmlBaseId;
                    });
                    
                    if (matchingTimer) {
                        console.log(`  - Found matching timer with UID: ${matchingTimer.uid}`);
                        console.log(`  - Timer position: (${matchingTimer.x}, ${matchingTimer.y})`);
                        UICDTimer.recreateTimerFromSave(htmlElement, matchingTimer);
                    } else {
                        console.warn(`  - No matching timer found for countdown HTML: ${htmlId}`);
                        console.log(`  - HTML base ID: ${htmlBaseId}`);
                        console.log(`  - Available timer ids: ${countdownTimers.map((t: any) => t.instVars.id).join(", ")}`);
                        // If no corresponding Timer found, destroy this HTML
                        console.log(`  - Destroying orphaned HTML element`);
                        htmlElement.destroy();
                    }
                } catch (error: any) {
                    console.error(`Error processing countdown HTML: ${error.message}`);
                }
            });
            
        } catch (error: any) {
            console.error(`Failed to scan and reconnect timers: ${error.message}`);
        }
    }

    /**
     * Recreate countdown timer instance from save data
     */
    private static recreateTimerFromSave(oldHtmlElement: any, timerElement: any): void {
        try {
            // Parse id to get timer info: "CD|timerId|type|duration|fillColor|backgroundColor|progress"
            const parts = oldHtmlElement.instVars.id.split("|");
            if (parts.length < 4) {
                console.error(`Invalid countdown timer id format: ${oldHtmlElement.instVars.id}`);
                return;
            }
            
            const [prefix, timerId, typeStr, durationStr, encodedFillColor, encodedBackgroundColor, progressStr] = parts;
            const type = typeStr as CDType;
            const duration = parseFloat(durationStr);
            
            // Parse colors from timer id (with fallback to defaults)
            let fillColor = "rgba(0, 255, 0, 0.7)";
            let backgroundColor = "rgba(0, 0, 0, 0.5)";
            
            if (encodedFillColor && encodedBackgroundColor) {
                try {
                    fillColor = decodeURIComponent(encodedFillColor);
                    backgroundColor = decodeURIComponent(encodedBackgroundColor);
                    console.log(`Parsed colors from timer id: fill=${fillColor}, bg=${backgroundColor}`);
                } catch (decodeError: any) {
                    console.warn(`Failed to decode colors, using defaults: ${decodeError.message}`);
                }
            }
            
            // Parse saved progress (if available)
            let savedProgress = 0;
            if (progressStr) {
                savedProgress = parseFloat(progressStr);
                console.log(`Parsed saved progress from timer: ${(savedProgress * 100).toFixed(1)}%`);
            }
            
            console.log(`Recreating HTML for timer: ${timerId}, type: ${type}, duration: ${duration}`);
            
            // Calculate remaining time based on saved progress
            const elapsedTime = duration * savedProgress;
            const remainingTime = duration - elapsedTime;
            console.log(`Timer restoration: duration=${duration}s, elapsed=${elapsedTime.toFixed(1)}s, remaining=${remainingTime.toFixed(1)}s`);
            
            // REUSE the existing HTML element instead of creating new one
            const newHtmlElement = oldHtmlElement;
            console.log(`Reusing existing HTML element with UID: ${newHtmlElement.uid}`);
            
            // Ensure the id is still set correctly (it should already be set)
            newHtmlElement.instVars.id = `CD|${timerId}|${type}|${duration}|${encodeURIComponent(fillColor)}|${encodeURIComponent(backgroundColor)}`;
            
            // Ensure size is correct
            newHtmlElement.width = type === CDType.PROGRESS_BAR ? 150 : 100;
            newHtmlElement.height = type === CDType.PROGRESS_BAR ? 30 : 100;
            
            // Generate new timer tag since we can't recover the old one
            const newTimerTag = `cd_${timerId}_${Date.now()}`;
            
            // Create new UICDTimer instance
            const instance = Object.create(UICDTimer.prototype);
            instance.id = timerId;
            instance.htmlElement = newHtmlElement;
            instance.timerInstance = timerElement;
            instance.type = type;
            instance.layer = "html_c3";
            instance._width = type === CDType.PROGRESS_BAR ? 150 : 100;
            instance._height = type === CDType.PROGRESS_BAR ? 30 : 100;
            instance.fillColor = fillColor;  // Use parsed color
            instance.backgroundColor = backgroundColor;  // Use parsed color
            instance._currentProgress = savedProgress;  // Use saved progress
            instance.isPaused = false;
            instance.onTimeArriveCallback = null;
            instance.timerTag = newTimerTag;
            instance.duration = duration;
            
            // Ensure Timer also has the correct id
            timerElement.instVars.id = `CD|${timerId}|${type}|${duration}|${encodeURIComponent(instance.fillColor)}|${encodeURIComponent(instance.backgroundColor)}`;
            
            // Stop any existing timers and start a new one with remaining time
            timerElement.behaviors.Timer.stopAllTimers();
            
            // Start new timer with remaining time (not full duration)
            if (remainingTime > 0) {
                timerElement.behaviors.Timer.startTimer(remainingTime, newTimerTag, "once");
                console.log(`Started timer with remaining time: ${remainingTime.toFixed(1)}s`);
            } else {
                // Timer already completed
                console.log(`Timer already completed, not starting new timer`);
            }
            
            // Render HTML and set current progress
            instance.renderHTML();
            instance.updateVisual(savedProgress);
            
            // Reestablish connections
            instance.reestablishTimerConnection();
            
            // Only start update loop if timer is still running
            if (remainingTime > 0) {
                instance.startProgressUpdateLoop();
            }
            
            // Add to instance mapping
            UICDTimer.instances.set(timerId, instance);
            
            console.log(`Successfully recreated countdown timer: ${timerId}, restored to ${(savedProgress * 100).toFixed(1)}% progress`);
            
            // Add a delayed check to see if HTML element gets destroyed
            setTimeout(() => {
                try {
                    if (instance.htmlElement) {
                        const stillExists = instance.htmlElement.x !== undefined && instance.htmlElement.y !== undefined;
                        console.log(`HTML element still exists after 1 second: ${stillExists} (timer: ${timerId})`);
                        if (!stillExists) {
                            console.error(`HTML element was destroyed shortly after creation! (timer: ${timerId})`);
                        }
                    } else {
                        console.error(`HTML element reference is null after 1 second! (timer: ${timerId})`);
                    }
                } catch (delayedCheckError: any) {
                    console.error(`Delayed check failed for timer ${timerId}: ${delayedCheckError.message}`);
                }
            }, 1000);
            
        } catch (error: any) {
            console.error(`Error recreating HTML for timer: ${error.message}`);
        }
    }

    /**
     * Show debug information about active countdown timers
     */
    public static showDebugInfo(): void {
        console.log(`=== Countdown Timer Debug Info ===`);
        console.log(`Active instances: ${UICDTimer.instances.size}`);
        
        UICDTimer.instances.forEach((instance, id) => {
            console.log(`Timer ID: ${id}`);
            console.log(`  - Type: ${instance.type}`);
            console.log(`  - Duration: ${instance.duration}s`);
            console.log(`  - Current Progress: ${(instance._currentProgress * 100).toFixed(1)}%`);
            console.log(`  - Is Paused: ${instance.isPaused}`);
            console.log(`  - HTML Element Valid: ${instance.htmlElement ? 'Yes' : 'No'}`);
            console.log(`  - Timer Instance Valid: ${instance.timerInstance ? 'Yes' : 'No'}`);
            if (instance.htmlElement) {
                console.log(`  - Position: (${instance.htmlElement.x}, ${instance.htmlElement.y})`);
                console.log(`  - Size: ${instance.htmlElement.width}x${instance.htmlElement.height}`);
            }
        });
        
        console.log(`=== End Debug Info ===`);
    }
}