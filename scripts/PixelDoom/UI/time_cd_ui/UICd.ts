import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";



// pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

//     // c3 build in timer example

//     var timer_c3 = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100)
//     timer_c3.behaviors.Timer.startTimer(5, "test", "once")
//     timer_c3.behaviors.Timer.addEventListener("timer", (e) => {
//         if (e.tag = "test") {
//             console.log("c3 build in timer test")
//         }

//     })
//     //startTimer(duration: number, name: string, type?: TimerBehaviorTimerType): void;
//     //type TimerBehaviorTimerType = "once" | "regular";

// })



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

    // Add quick test button for fade effect with short duration
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test fade effect (0.3s)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return

        // Create multiple short-duration timers to test fade effect
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

    // Add test buttons for variable-based timers
    var testVariable = { value: 50 }; // Test variable object

    IMGUIDebugButton.AddButtonToCategory(cd_system, "+5 testVariable", () => {
        testVariable.value += 5;
    }) 

    IMGUIDebugButton.AddButtonToCategory(cd_system, "-5 testVariable", () => {
        testVariable.value -= 5;
    })

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test variable UI - Circle Fill", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return

        // Reset test variable
        testVariable.value = 0;

        // Create variable-based timer
        UICDTimer.CreateFromVariables(testVariable, 0, 100, CDType.CIRCLE_FILL, "var_test1", PlayerInstance.x - 100, PlayerInstance.y)
            .setSize(80, 80)
            .setColors("rgba(255, 165, 0, 0.8)", "rgba(50, 50, 50, 0.6)");

        console.log("Created variable monitoring UI - Use console command to change value: testVariable.value = number(0-100)");

        // Make testVariable globally accessible for testing
        (window as any).testVariable = testVariable;
    });

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Test variable UI - Progress Bar", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return

        // Reset test variable
        testVariable.value = 25;

        // Create variable-based progress bar
        UICDTimer.CreateFromVariables(testVariable, 0, 100, CDType.PROGRESS_BAR, "var_test2", PlayerInstance.x, PlayerInstance.y + 100)
            .setSize(200, 25)
            .setColors("rgba(0, 255, 255, 0.9)", "rgba(30, 30, 30, 0.7)");

        console.log("Created progress bar variable monitoring UI - Use console command to change value: testVariable.value = number(0-100)");

        // Make testVariable globally accessible for testing
        (window as any).testVariable = testVariable;
    });

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Auto-changing variable test", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return

        // Create auto-changing variable
        var autoVariable = { value: 0 };
        var direction = 1;

        // Create multiple variable-based timers with different styles
        UICDTimer.CreateFromVariables(autoVariable, 0, 100, CDType.CIRCLE_CLOCKWISE, "auto_test1", PlayerInstance.x - 150, PlayerInstance.y - 50)
            .setSize(60, 60)
            .setColors("rgba(255, 100, 100, 0.8)", "rgba(40, 40, 40, 0.6)");

        UICDTimer.CreateFromVariables(autoVariable, 0, 100, CDType.CIRCLE_DRAIN, "auto_test2", PlayerInstance.x, PlayerInstance.y - 50)
            .setSize(60, 60)
            .setColors("rgba(100, 255, 100, 0.8)", "rgba(40, 40, 40, 0.6)");

        UICDTimer.CreateFromVariables(autoVariable, 0, 100, CDType.PROGRESS_BAR, "auto_test3", PlayerInstance.x - 75, PlayerInstance.y + 50)
            .setSize(150, 20)
            .setColors("rgba(100, 100, 255, 0.8)", "rgba(40, 40, 40, 0.6)");

        // Start auto-changing the variable
        const autoUpdate = () => {
            autoVariable.value += direction * 2;

            if (autoVariable.value >= 100) {
                direction = -1;
                autoVariable.value = 100;
            } else if (autoVariable.value <= 0) {
                direction = 1;
                autoVariable.value = 0;
            }

            // Use C3Timer instead of setTimeout for better integration
            try {
                const updateTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
                const updateTag = `auto_update_${Date.now()}_${Math.random()}`;
                
                updateTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                    if (e.tag === updateTag) {
                        autoUpdate();
                        updateTimer.destroy();
                    }
                });
                
                updateTimer.behaviors.Timer.startTimer(0.05, updateTag, "once"); // 50ms = 0.05s
            } catch (error: any) {
                console.error(`Failed to create auto-update timer: ${error.message}`);
                // Fallback to setTimeout
                setTimeout(autoUpdate, 50); // Update every 50ms
            }
        };

        autoUpdate();
        console.log("Started auto-changing variable test - variable will change between 0-100 automatically");
    });

    // Add management buttons
    IMGUIDebugButton.AddButtonToCategory(cd_system, "Destroy all timers", () => {
        UICDTimer.DestroyAllTimersAndVariables();
        console.log("Destroyed all timers");
    });

    IMGUIDebugButton.AddButtonToCategory(cd_system, "Show timer info", () => {
        const info = UICDTimer.GetTimerInfo();
        console.log(`Timer info: time-based=${info.timeBased}, variable-based=${info.variableBased}, total=${info.total}`);
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
    private static variableInstances: Map<string, UICDTimer> = new Map(); // For variable-based timers
    private id: string;
    private htmlElement: any; // HTML element instance
    private timerInstance: any; // C3 Timer instance
    private duration: number;
    private type: CDType;
    private onTimeArriveCallback: (() => void) | null = null;
    private isPaused: boolean = false;
    private layer: string;
    private timerTag: string;

    // Variable monitoring properties
    private isVariableBased: boolean = false;
    private monitoredVariable: any = null;
    private variableMinValue: number = 0;
    private variableMaxValue: number = 100;
    private lastVariableValue: number = 0;
    private variableUpdateLoop: number | null = null;
    private variableGetter: (() => number) | null = null; // Function to get current variable value

    // Private property to track current progress
    private _currentProgress: number = 0;

    // Fade-out animation duration (milliseconds)
    public static FADE_OUT_DURATION: number = 1500

    // Default colors for easy reference
    private fillColor: string = "rgba(0, 255, 0, 0.7)";
    private backgroundColor: string = "rgba(0, 0, 0, 0.5)";

    // Properties to store dimensions
    private _width: number;
    private _height: number;

    private constructor(id: string, duration: number, type: CDType, x?: number, y?: number, layer: string = "html_c3", isVariableBased: boolean = false) {
        this.id = id;
        this.duration = duration;
        this.type = type;
        this.layer = layer;
        this.timerTag = `cd_${id}_${Date.now()}`;
        this.isVariableBased = isVariableBased; // Set this early

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
            // Try to use HTML_c3 object first
            try {
                this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(layer, posX, posY);
                console.log(`Created HTML_c3 element successfully`);
            } catch (htmlError: any) {
                console.warn(`HTML_c3 object not available: ${htmlError.message}`);
                
                // Try alternative: use hudongtishi_ui as a fallback
                try {
                    this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.hudongtishi_ui.createInstance(layer, posX, posY, true);
                    console.log(`Created hudongtishi_ui element as fallback`);
                } catch (fallbackError: any) {
                    console.error(`No suitable UI object found for timer display: ${fallbackError.message}`);
                    console.error(`Available objects might not include HTML_c3 or hudongtishi_ui`);
                    
                    // Create a simple console-based timer as last resort
                    this.htmlElement = null;
                    console.warn(`Timer ${this.id} will run in console-only mode`);
                }
            }

            // Set HTML element size if element was created
            if (this.htmlElement) {
                this.htmlElement.width = this._width;
                this.htmlElement.height = this._height;

                // Render initial HTML
                this.renderHTML();
            }

            // Create C3 timer instance and set event listeners (only for time-based timers)
            if (!this.isVariableBased) {
                this.createTimerInstance();
            }

            console.log(`Created ${this.type} countdown timer with ID: ${this.id}, duration: ${this.duration}s, position: (${posX}, ${posY})`);
        } catch (error: any) {
            console.error(`Failed to create CD timer: ${error.message}`);
        }
    }

    /**
     * Constructor for variable-based timer
     */
    private static createVariableBasedTimer(
        id: string,
        monitoredVariable: any,
        minValue: number,
        maxValue: number,
        type: CDType,
        x?: number,
        y?: number,
        layer: string = "html_c3"
    ): UICDTimer {
        const instance = new UICDTimer(id, 0, type, x, y, layer, true);
        instance.monitoredVariable = monitoredVariable;
        instance.variableMinValue = minValue;
        instance.variableMaxValue = maxValue;
        
        // Set up variable getter function based on the type of monitored variable
        instance.setupVariableGetter();
        
        instance.lastVariableValue = instance.getVariableValue();

        // Start variable monitoring
        instance.startVariableMonitoring();

        return instance;
    }

    /**
     * Creates C3 timer instance
     */
    private createTimerInstance(): void {
        try {
            // Create C3 Timer instance using full runtime path
            this.timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);

            // Listen for timer events
            this.timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.timerTag) {
                    // Start fade-out directly, maintaining current progress state (don't update to 100%)
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

        // Create new instance (time-based timer)
        const instance = new UICDTimer(id, duration, type, x, y, layer, false);
        UICDTimer.instances.set(id, instance);
        return instance;
    }

    /**
     * Creates a variable-based timer UI that monitors a direct variable reference
     * This method allows you to pass a getter function that returns the current variable value
     * Usage: UICDTimer.CreateFromDirectVariable(() => Gouhuos.instVars.ChaiHuoLiang, 0, 100, CDType.CIRCLE_CLOCKWISE)
     * @param variableGetter Function that returns the current variable value
     * @param minValue Minimum value of the variable
     * @param maxValue Maximum value of the variable
     * @param type Visual style of the timer UI
     * @param id Unique identifier for this timer
     * @param x X position (default: player position)
     * @param y Y position (default: player position)
     * @param layer Layer name to create the timer on (default: "html_c3")
     */
    public static CreateFromDirectVariable(
        variableGetter: () => number,
        minValue: number,
        maxValue: number,
        type: CDType = CDType.CIRCLE_FILL,
        id: string = "direct_variable_default",
        x?: number,
        y?: number,
        layer: string = "html_c3"
    ): UICDTimer {
        // Use the regular CreateFromVariables method with the getter function
        return UICDTimer.CreateFromVariables(variableGetter, minValue, maxValue, type, id, x, y, layer);
    }

    /**
     * Creates a variable-based timer UI that monitors an instance variable directly
     * This is a convenience method for monitoring object properties like instance.instVars.property
     * @param instance The object instance containing the variable
     * @param propertyPath The property path (e.g., "instVars.ChaiHuoLiang")
     * @param minValue Minimum value of the variable
     * @param maxValue Maximum value of the variable
     * @param type Visual style of the timer UI
     * @param id Unique identifier for this timer
     * @param x X position (default: player position)
     * @param y Y position (default: player position)
     * @param layer Layer name to create the timer on (default: "html_c3")
     */
    public static CreateFromInstanceVariable(
        instance: any,
        propertyPath: string,
        minValue: number,
        maxValue: number,
        type: CDType = CDType.CIRCLE_FILL,
        id: string = "instance_variable_default",
        x?: number,
        y?: number,
        layer: string = "html_c3"
    ): UICDTimer {
        // Create a getter function that accesses the property path
        const variableGetter = () => {
            try {
                const pathParts = propertyPath.split('.');
                let current = instance;
                
                for (const part of pathParts) {
                    if (current && typeof current === 'object' && part in current) {
                        current = current[part];
                    } else {
                        console.warn(`Property path '${propertyPath}' not found on instance`);
                        return minValue;
                    }
                }
                
                const numValue = Number(current);
                return isNaN(numValue) ? minValue : numValue;
            } catch (error: any) {
                console.error(`Error accessing property path '${propertyPath}': ${error.message}`);
                return minValue;
            }
        };

        // Use the regular CreateFromVariables method with the getter function
        return UICDTimer.CreateFromVariables(variableGetter, minValue, maxValue, type, id, x, y, layer);
    }

    /**
     * Creates a variable-based timer UI that monitors a variable and displays progress
     * This method now supports direct variable monitoring by creating a smart wrapper
     * @param monitoredVariable The variable to monitor (can be object with property, direct value, or getter function)
     * @param minValue Minimum value of the variable
     * @param maxValue Maximum value of the variable
     * @param type Visual style of the timer UI
     * @param id Unique identifier for this timer
     * @param x X position (default: player position)
     * @param y Y position (default: player position)
     * @param layer Layer name to create the timer on (default: "html_c3")
     */
    public static CreateFromVariables(
        monitoredVariable: any,
        minValue: number,
        maxValue: number,
        type: CDType = CDType.CIRCLE_FILL,
        id: string = "variable_default",
        x?: number,
        y?: number,
        layer: string = "html_c3"
    ): UICDTimer {
        // If instance with this ID already exists, destroy it first
        if (UICDTimer.variableInstances.has(id)) {
            UICDTimer.variableInstances.get(id)?.destroy();
        }

        // For direct variable access, we need to create a smart monitoring approach
        // If the variable is a direct property access (like obj.prop), we create a getter function
        let smartVariable = monitoredVariable;
        
        // If it's a direct number or primitive, we can't monitor changes effectively
        // But we'll create a wrapper that can be updated
        if (typeof monitoredVariable === 'number' || typeof monitoredVariable === 'string') {
            console.warn("Direct primitive values cannot be monitored for changes. Consider using CreateFromInstanceVariable for object properties.");
            // Create a wrapper object that holds the initial value
            smartVariable = { value: Number(monitoredVariable) };
        }

        // Create new variable-based instance
        const instance = UICDTimer.createVariableBasedTimer(id, smartVariable, minValue, maxValue, type, x, y, layer);
        UICDTimer.variableInstances.set(id, instance);

        console.log(`Created variable-based timer UI with ID: ${id}, monitoring range: ${minValue}-${maxValue}`);
        return instance;
    }

    /**
     * Sets up the variable getter function based on the monitored variable type
     */
    private setupVariableGetter(): void {
        if (this.monitoredVariable === null || this.monitoredVariable === undefined) {
            this.variableGetter = () => this.variableMinValue;
            return;
        }

        // If it's already a function, use it directly
        if (typeof this.monitoredVariable === 'function') {
            this.variableGetter = this.monitoredVariable;
            return;
        }

        // If it's a direct number value, create a getter that always returns the current value
        if (typeof this.monitoredVariable === 'number') {
            // For direct number values, we need to create a reference that can be updated
            console.warn("Direct number values cannot be monitored for changes. Consider using CreateFromDirectVariable for dynamic monitoring.");
            this.variableGetter = () => this.monitoredVariable;
            return;
        }

        // If it's an object with a value property
        if (typeof this.monitoredVariable === 'object' && 'value' in this.monitoredVariable) {
            this.variableGetter = () => this.monitoredVariable.value;
            return;
        }

        // For other object types, try to access common property names or use the object itself
        if (typeof this.monitoredVariable === 'object') {
            // Check for common property names, including ChaiHuoLiang for your specific use case
            const commonProps = ['ChaiHuoLiang', 'value', 'val', 'amount', 'count', 'level'];
            for (const prop of commonProps) {
                if (prop in this.monitoredVariable) {
                    this.variableGetter = () => this.monitoredVariable[prop];
                    console.log(`Using property '${prop}' for variable monitoring`);
                    return;
                }
            }
            
            // If no common properties found, try to convert the object to number
            this.variableGetter = () => {
                const numValue = Number(this.monitoredVariable);
                return isNaN(numValue) ? this.variableMinValue : numValue;
            };
            return;
        }

        // Try to convert to number as fallback
        this.variableGetter = () => {
            const numValue = Number(this.monitoredVariable);
            return isNaN(numValue) ? this.variableMinValue : numValue;
        };
    }

    /**
     * Gets the current value from the monitored variable
     */
    private getVariableValue(): number {
        try {
            if (this.variableGetter) {
                const value = this.variableGetter();
                // Check if the value is valid (not NaN or undefined)
                if (typeof value === 'number' && !isNaN(value)) {
                    return value;
                } else {
                    // If getter returns invalid value, the object might be destroyed
                    console.warn(`Variable getter returned invalid value for timer ${this.id}, stopping monitoring`);
                    this.destroy();
                    return this.variableMinValue;
                }
            }

            // Fallback to original logic if getter is not set
            if (this.monitoredVariable === null || this.monitoredVariable === undefined) {
                return this.variableMinValue;
            }

            // If it's a direct number value
            if (typeof this.monitoredVariable === 'number') {
                return this.monitoredVariable;
            }

            // If it's an object with a value property
            if (typeof this.monitoredVariable === 'object' && 'value' in this.monitoredVariable) {
                return this.monitoredVariable.value;
            }

            // If it's a function, call it
            if (typeof this.monitoredVariable === 'function') {
                const value = this.monitoredVariable();
                if (typeof value === 'number' && !isNaN(value)) {
                    return value;
                } else {
                    console.warn(`Function returned invalid value for timer ${this.id}, stopping monitoring`);
                    this.destroy();
                    return this.variableMinValue;
                }
            }

            // Try to convert to number
            const numValue = Number(this.monitoredVariable);
            if (!isNaN(numValue)) {
                return numValue;
            }

            console.warn(`Unable to get numeric value from monitored variable, using min value`);
            return this.variableMinValue;
        } catch (error: any) {
            console.error(`Error getting variable value: ${error.message}`);
            // If there's an error accessing the variable, the object might be destroyed
            console.warn(`Stopping monitoring for timer ${this.id} due to error`);
            this.destroy();
            return this.variableMinValue;
        }
    }

    /**
     * Starts monitoring the variable for changes
     */
    private startVariableMonitoring(): void {
        if (!this.isVariableBased) return;

        const updateFunction = () => {
            // Only stop if this is no longer a variable-based timer or if it's been destroyed
            if (!this.isVariableBased || !this.variableUpdateLoop) {
                if (this.variableUpdateLoop) {
                    cancelAnimationFrame(this.variableUpdateLoop);
                    this.variableUpdateLoop = null;
                }
                return;
            }

            try {
                const currentValue = this.getVariableValue();

                // If getVariableValue destroyed the timer due to error, stop the loop
                if (!this.variableUpdateLoop) {
                    return;
                }

                // Only update if value has changed
                if (currentValue !== this.lastVariableValue) {
                    this.lastVariableValue = currentValue;

                    // Calculate progress (0-1) based on min/max values
                    const range = this.variableMaxValue - this.variableMinValue;
                    let progress = 0;

                    if (range > 0) {
                        progress = Math.max(0, Math.min(1, (currentValue - this.variableMinValue) / range));
                    }

                    // Update visual (this will handle null htmlElement gracefully)
                    this.updateVisual(progress);
                }

                // Continue monitoring only if the timer still exists
                if (this.variableUpdateLoop) {
                    this.variableUpdateLoop = requestAnimationFrame(updateFunction);
                }
            } catch (error: any) {
                console.error(`Error in variable monitoring: ${error.message}`);
                console.warn(`Stopping monitoring for timer ${this.id} due to error in monitoring loop`);
                // Stop monitoring and destroy the timer
                if (this.variableUpdateLoop) {
                    cancelAnimationFrame(this.variableUpdateLoop);
                    this.variableUpdateLoop = null;
                }
                this.destroy();
            }
        };

        // Start monitoring loop
        this.variableUpdateLoop = requestAnimationFrame(updateFunction);
        console.log(`Started variable monitoring for timer ${this.id}`);
    }

    /**
     * Updates the monitored variable reference (useful for dynamic variable binding)
     * @param newVariable New variable to monitor
     * @param newMinValue New minimum value (optional)
     * @param newMaxValue New maximum value (optional)
     */
    public updateMonitoredVariable(newVariable: any, newMinValue?: number, newMaxValue?: number): UICDTimer {
        if (!this.isVariableBased) {
            console.warn("Cannot update monitored variable on time-based timer");
            return this;
        }

        this.monitoredVariable = newVariable;

        if (newMinValue !== undefined) {
            this.variableMinValue = newMinValue;
        }

        if (newMaxValue !== undefined) {
            this.variableMaxValue = newMaxValue;
        }

        // Reset last value to force update
        this.lastVariableValue = this.getVariableValue() - 1;

        console.log(`Updated monitored variable for timer ${this.id}, new range: ${this.variableMinValue}-${this.variableMaxValue}`);
        return this;
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

            // Create new instance on the specified layer using full runtime path
            this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(layer, x, y);
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
        // Prevent multiple destructions
        if (!this.isVariableBased && !UICDTimer.instances.has(this.id)) {
            return; // Already destroyed
        }
        if (this.isVariableBased && !UICDTimer.variableInstances.has(this.id)) {
            return; // Already destroyed
        }

        // Stop variable monitoring if it's a variable-based timer
        if (this.isVariableBased && this.variableUpdateLoop) {
            cancelAnimationFrame(this.variableUpdateLoop);
            this.variableUpdateLoop = null;
        }

        if (this.timerInstance) {
            try {
                this.timerInstance.behaviors.Timer.stopTimer(this.timerTag);
                this.timerInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying timer instance: ${error.message}`);
            }
            this.timerInstance = null;
        }

        if (this.htmlElement) {
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying HTML element: ${error.message}`);
            }
            this.htmlElement = null;
        }

        // Remove from appropriate instances map
        if (this.isVariableBased) {
            UICDTimer.variableInstances.delete(this.id);
        } else {
            UICDTimer.instances.delete(this.id);
        }

        console.log(`${this.isVariableBased ? 'Variable-based' : 'Time-based'} timer ${this.id} destroyed`);
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
            // Maintain current state (don't force to 100%)

            // Use manual opacity fade-out animation
            const totalDuration = UICDTimer.FADE_OUT_DURATION;
            const startTime = Date.now();
            const initialOpacity = 1.0;

            // Create fade effect function
            const fadeStep = () => {
                if (!this.htmlElement) return;

                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / totalDuration, 1.0);
                const currentOpacity = initialOpacity * (1 - progress);

                // Apply opacity while maintaining current visual state
                // Use getCurrentVisualHtml method to get current progress HTML
                const htmlContent = `
                <div style="position:relative; width:100%; height:100%; opacity:${currentOpacity};">
                    ${this.getCurrentVisualHtml()}
                </div>`;

                this.htmlElement.setContent(htmlContent, "html");

                // If fade-out is not complete, continue to next frame
                if (progress < 1.0) {
                    requestAnimationFrame(fadeStep);
                } else {
                    // Fade-out complete, destroy timer
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

            // Start fade-out animation
            requestAnimationFrame(fadeStep);

        } catch (error: any) {
            // If any error occurs during animation, destroy immediately
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
     * Gets HTML content based on current progress
     */
    private getCurrentVisualHtml(): string {
        // Use current saved progress value to generate HTML
        const displayProgress = this.type === CDType.CIRCLE_DRAIN ? 1 - this._currentProgress : this._currentProgress;
        const progressPercent = Math.min(100, Math.max(0, displayProgress * 100));

        // Return corresponding HTML based on type
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
        if (this.htmlElement && this.htmlElement.setContent) {
            this.htmlElement.setContent(this.createCircleFillHtml(progressPercent), "html");
        }
    }

    private updateCircleDrain(progressPercent: number): void {
        if (this.htmlElement && this.htmlElement.setContent) {
            this.htmlElement.setContent(this.createCircleDrainHtml(progressPercent), "html");
        }
    }

    private updateClockwise(progressPercent: number): void {
        if (this.htmlElement && this.htmlElement.setContent) {
            this.htmlElement.setContent(this.createClockwiseHtml(progressPercent), "html");
        }
    }

    private updatePulse(progressPercent: number, rawProgress: number): void {
        if (this.htmlElement && this.htmlElement.setContent) {
            this.htmlElement.setContent(this.createPulseHtml(progressPercent, rawProgress), "html");
        }
    }

    private updateProgressBar(progressPercent: number): void {
        if (this.htmlElement && this.htmlElement.setContent) {
            this.htmlElement.setContent(this.createProgressBarHtml(progressPercent), "html");
        }
    }

    private updateVisual(progress: number): void {
        try {
            // Save current progress value for maintaining state during fade-out
            this._currentProgress = progress;

            // If no HTML element is available, provide console feedback
            if (!this.htmlElement) {
                const progressPercent = Math.min(100, Math.max(0, progress * 100));
                console.log(`Timer ${this.id} progress: ${progressPercent.toFixed(1)}% (console-only mode)`);
                return;
            }

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
            // If no HTML element is available, skip rendering
            if (!this.htmlElement) {
                console.log(`Timer ${this.id} running in console-only mode - no visual display`);
                return;
            }

            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;

            // Check if the element supports HTML content (like HTML_c3)
            if (this.htmlElement.setContent) {
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
            } else {
                // For non-HTML elements, just log the progress
                console.log(`Timer ${this.id} created but visual display not supported by this object type`);
            }
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
     * Gets a variable-based timer instance by ID
     * @param id Timer ID
     */
    public static GetVariableTimer(id: string): UICDTimer | undefined {
        return UICDTimer.variableInstances.get(id);
    }

    /**
     * Gets a time-based timer instance by ID
     * @param id Timer ID
     */
    public static GetTimer(id: string): UICDTimer | undefined {
        return UICDTimer.instances.get(id);
    }

    /**
     * Destroys all variable-based timers
     */
    public static DestroyAllVariableTimers(): void {
        const timers = Array.from(UICDTimer.variableInstances.values());
        timers.forEach(timer => timer.destroy());
        console.log(`Destroyed ${timers.length} variable-based timers`);
    }

    /**
     * Destroys all time-based timers
     */
    public static DestroyAllTimers(): void {
        const timers = Array.from(UICDTimer.instances.values());
        timers.forEach(timer => timer.destroy());
        console.log(`Destroyed ${timers.length} time-based timers`);
    }

    /**
     * Destroys all timers (both time-based and variable-based)
     */
    public static DestroyAllTimersAndVariables(): void {
        UICDTimer.DestroyAllTimers();
        UICDTimer.DestroyAllVariableTimers();
    }

    /**
     * Gets information about all active timers
     */
    public static GetTimerInfo(): { timeBased: number, variableBased: number, total: number } {
        const timeBasedCount = UICDTimer.instances.size;
        const variableBasedCount = UICDTimer.variableInstances.size;
        return {
            timeBased: timeBasedCount,
            variableBased: variableBasedCount,
            total: timeBasedCount + variableBasedCount
        };
    }
}