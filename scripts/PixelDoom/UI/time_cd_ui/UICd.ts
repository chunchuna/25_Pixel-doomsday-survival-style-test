import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    // c3 build in timer example
    
    var timer_c3 = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100)
    timer_c3.behaviors.Timer.startTimer(5, "test", "once")
    timer_c3.behaviors.Timer.addEventListener("timer", (e) => {
        if (e.tag = "test") {
            console.log("c3 build in timer test")
        }

    })
    //startTimer(duration: number, name: string, type?: TimerBehaviorTimerType): void;
    //type TimerBehaviorTimerType = "once" | "regular";

})



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // for Test

    var cd_system = IMGUIDebugButton.AddCategory("cd_system")


    IMGUIDebugButton.AddButtonToCategory(cd_system, "show 'CD' on player position", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance()
        if (!PlayerInstance) return


        UICDTimer.CreateCD(50, CDType.CIRCLE_CLOCKWISE).setPosition(PlayerInstance.x, PlayerInstance.y).OnTimeArrive(() => {
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
    
    // 添加快速测试按钮，使用短时间测试淡出效果
    IMGUIDebugButton.AddButtonToCategory(cd_system, "测试淡出效果 (0.3秒)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return
        
        // 创建多个不同类型的短时间倒计时，测试淡出效果
        UICDTimer.CreateCD(0.3, CDType.CIRCLE_DRAIN, "fadetest1", PlayerInstance.x - 50, PlayerInstance.y - 50)
            .setSize(80, 80)
            .setColors("rgba(255, 0, 0, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("CIRCLE_DRAIN 测试完成"));
            
        UICDTimer.CreateCD(0.3, CDType.CIRCLE_CLOCKWISE, "fadetest2", PlayerInstance.x + 50, PlayerInstance.y - 50)
            .setSize(80, 80)
            .setColors("rgba(0, 255, 0, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("CIRCLE_CLOCKWISE 测试完成"));
            
        UICDTimer.CreateCD(0.3, CDType.PROGRESS_BAR, "fadetest3", PlayerInstance.x, PlayerInstance.y + 50)
            .setSize(150, 30)
            .setColors("rgba(0, 0, 255, 0.7)", "rgba(0, 0, 0, 0.5)")
            .OnTimeArrive(() => console.warn("PROGRESS_BAR 测试完成"));
            
        console.log("启动快速测试 - 0.3秒后将显示淡出效果");
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
    private id: string;
    private htmlElement: any; // HTML element instance
    private timerInstance: any; // C3 Timer instance
    private duration: number;
    private type: CDType;
    private onTimeArriveCallback: (() => void) | null = null;
    private isPaused: boolean = false;
    private layer: string;
    private timerTag: string;
    
    // 添加一个私有属性来跟踪当前进度
    private _currentProgress: number = 0;
    
    // 淡出动画持续时间（毫秒）
    public static FADE_OUT_DURATION: number = 1500

    // Default colors for easy reference
    private fillColor: string = "rgba(0, 255, 0, 0.7)";
    private backgroundColor: string = "rgba(0, 0, 0, 0.5)";

    // Properties to store dimensions
    private _width: number;
    private _height: number;

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

        // Create HTML display element
        try {
            // Use any type to bypass type checking
            const objects = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects as any;
            this.htmlElement = objects.HTML_c3.createInstance(layer, posX, posY);
            
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
            const objects = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects as any;
            this.timerInstance = objects.C3Ctimer.createInstance("Other", -100, -100);
            
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
            const objects = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects as any;
            this.htmlElement = objects.HTML_c3.createInstance(layer, x, y);
            this.layer = layer;

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
        if (this.timerInstance) {
            this.timerInstance.behaviors.Timer.stopTimer(this.timerTag);
            this.timerInstance.destroy();
            this.timerInstance = null;
        }

        if (this.htmlElement) {
            this.htmlElement.destroy();
            this.htmlElement = null;
        }

        UICDTimer.instances.delete(this.id);
        console.log(`Countdown timer ${this.id} destroyed`);
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
            if (!this.htmlElement || !this.timerInstance) return;
            
            try {
                // If timer is still running, update visual effect
                if (this.timerInstance.behaviors.Timer.isTimerRunning(this.timerTag)) {
                    this.updateVisualFromTimer();
                    requestAnimationFrame(updateFunction);
                }
            } catch (error: any) {
                console.error(`Error in progress update loop: ${error.message}`);
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
        this.htmlElement.setContent(this.createCircleFillHtml(progressPercent), "html");
    }

    private updateCircleDrain(progressPercent: number): void {
        this.htmlElement.setContent(this.createCircleDrainHtml(progressPercent), "html");
    }

    private updateClockwise(progressPercent: number): void {
        this.htmlElement.setContent(this.createClockwiseHtml(progressPercent), "html");
    }

    private updatePulse(progressPercent: number, rawProgress: number): void {
        this.htmlElement.setContent(this.createPulseHtml(progressPercent, rawProgress), "html");
    }

    private updateProgressBar(progressPercent: number): void {
        this.htmlElement.setContent(this.createProgressBarHtml(progressPercent), "html");
    }

    private updateVisual(progress: number): void {
        try {
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
}