import { hf_engine } from "../../engine.js";
import { IMGUIDebugButton } from "../UI/debug_ui/UIDbugButton.js";
import { Imgui_chunchun } from "../UI/imgui_lib/imgui.js";

var isAmbientLightDebugButtonsBound = false;

hf_engine.gl$_ubu_init(() => {

    //@ts-ignore
    AmbientLight.light_layer = hf_engine.runtime.layout.getLayer(AmbientLight.light_layer_name);
    if (AmbientLight.light_layer == null) return

    // Test day-night cycle: start from current color
    AmbientLight.simulat_day_night_cycle(
        150,                  
        160,                   
        AmbientLight.dya_light_rgb,          // Day color (slightly yellow)
        AmbientLight.night_light_rgb,      // Night color (deep blue)
        "current"              // Start from current color, automatically determine if closer to day or night
    );

    // Initialize debug buttons
    AmbientLight.initializeDebugButtons();

})


hf_engine.gl$_ubu_update(() => {
    AmbientLight.updateColorTransition()
    AmbientLight.updateInfoWindow()
})

export class AmbientLight {

    public static dya_light_rgb: [number, number, number] = [225/ 255, 225 / 255, 225 / 255]
    public static night_light_rgb: [number, number, number] = [28 / 255, 24 / 255, 57 / 255]  // Deep blue, easier to see the effect

    private static Layout_allow_name = "Level"
    public static light_layer_name = "Vignette"

    public static light_layer: IAnyProjectLayer | null = null;

    // Day-night cycle state
    public static dayNightCycle = {
        isRunning: false,
        currentPhase: "day" as "day" | "night",
        dayDuration: 0,
        nightDuration: 0,
        dayColor: [1, 1, 1] as [number, number, number],
        nightColor: [0, 0, 0] as [number, number, number],
        cycleTimer: null as number | null
    }

    // Event listeners for day-night transitions
    private static dayStartListeners: Array<() => void> = [];
    private static nightStartListeners: Array<() => void> = [];

    // Register listener for day start event
    public static onDayStart(callback: () => void): void {
        this.dayStartListeners.push(callback);
        console.log("Day start listener registered");
    }

    // Register listener for night start event
    public static onNightStart(callback: () => void): void {
        this.nightStartListeners.push(callback);
        console.log("Night start listener registered");
    }

    // Remove listener for day start event
    public static removeDayStartListener(callback: () => void): void {
        const index = this.dayStartListeners.indexOf(callback);
        if (index !== -1) {
            this.dayStartListeners.splice(index, 1);
            console.log("Day start listener removed");
        }
    }

    // Remove listener for night start event
    public static removeNightStartListener(callback: () => void): void {
        const index = this.nightStartListeners.indexOf(callback);
        if (index !== -1) {
            this.nightStartListeners.splice(index, 1);
            console.log("Night start listener removed");
        }
    }

    // Trigger day start event
    private static triggerDayStart(): void {
        console.log("Day has started, notifying listeners");
        this.dayStartListeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error("Error in day start listener:", error);
            }
        });
    }

    // Trigger night start event
    private static triggerNightStart(): void {
        console.log("Night has started, notifying listeners");
        this.nightStartListeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error("Error in night start listener:", error);
            }
        });
    }

    public static transition = {
        isActive: false,
        startTime: 0,
        duration: 0,
        startColor: [0, 0, 0] as [number, number, number],
        targetColor: [0, 0, 0] as [number, number, number],
        currentColor: [0, 0, 0] as [number, number, number]
    }

    // Info window state
    private static readonly INFO_WINDOW_ID: string = "ambient_light_info_window";
    private static showInfoWindow: boolean = false;

    static startColorTransition(duration: number, target_rgb: [number, number, number]) {
        if (!this.light_layer) return;


        const currentBgColor = this.light_layer.backgroundColor;


        this.transition.isActive = true;
        this.transition.startTime = performance.now() / 1000; // Convert to seconds
        this.transition.duration = duration;
        this.transition.startColor = [...currentBgColor] as [number, number, number];
        this.transition.targetColor = [...target_rgb] as [number, number, number];

        console.log("Starting color transition", {
            startColor: this.transition.startColor,
            targetColor: this.transition.targetColor,
            duration: duration
        });
    }


    static updateColorTransition() {
        if (!this.transition.isActive || !this.light_layer) return;

        const currentTime = performance.now() / 1000; // Convert to seconds
        const elapsed = currentTime - this.transition.startTime;
        const progress = Math.min(elapsed / this.transition.duration, 1);

        for (let i = 0; i < 3; i++) {
            this.transition.currentColor[i] = this.lerp(
                this.transition.startColor[i],
                this.transition.targetColor[i],
                progress
            );
        }

        this.light_layer.backgroundColor = this.transition.currentColor;

        if (progress >= 1) {
            this.transition.isActive = false;
            console.log("Color transition completed", this.transition.currentColor);
        }
    }

    private static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    static Simulat_edsunshine_cycle(Time: number, target_rgb: [number, number, number]) {
        if (hf_engine.runtime.layout.name != this.Layout_allow_name) return
        if (!this.light_layer) return
        console.log("Starting color transition")

        this.startColorTransition(Time, target_rgb);
    }

    // Day-night cycle simulation
    static simulat_day_night_cycle(day_time: number, night_time: number, day_light: [number, number, number], night_light: [number, number, number], defaul_t: string) {
        if (!this.light_layer) return;

        // Stop previous cycle
        this.stopDayNightCycle();

        // Set cycle parameters
        this.dayNightCycle.isRunning = true;
        this.dayNightCycle.dayDuration = day_time;
        this.dayNightCycle.nightDuration = night_time;
        this.dayNightCycle.dayColor = [...day_light] as [number, number, number];
        this.dayNightCycle.nightColor = [...night_light] as [number, number, number];

        // Handle default state
        if (defaul_t === "current") {
            // Get current color and determine if closer to day or night
            const currentColor = this.light_layer.backgroundColor;
            const dayDistance = this.colorDistance(currentColor, day_light);
            const nightDistance = this.colorDistance(currentColor, night_light);

            // Set to the closer state
            this.dayNightCycle.currentPhase = dayDistance <= nightDistance ? "day" : "night";

            console.log("Starting from current color", {
                currentColor: currentColor,
                determinedAs: this.dayNightCycle.currentPhase,
                dayColorDifference: dayDistance.toFixed(3),
                nightColorDifference: nightDistance.toFixed(3)
            });
        } else {
            // Use specified default state
            this.dayNightCycle.currentPhase = defaul_t === "day" ? "day" : "night";

            // Set initial color (immediately switch to default state)
            const initialColor = this.dayNightCycle.currentPhase === "day" ? day_light : night_light;
            this.light_layer.backgroundColor = initialColor;
        }

        console.log("Starting day-night cycle", {
            initialState: this.dayNightCycle.currentPhase,
            dayDuration: day_time + " seconds",
            nightDuration: night_time + " seconds"
        });

        // Start cycle
        this.runDayNightCycle();
    }

    // Calculate Euclidean distance between two colors
    private static colorDistance(color1: number[], color2: [number, number, number]): number {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            const diff = color1[i] - color2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    // Execute day-night cycle
    private static runDayNightCycle() {
        if (!this.dayNightCycle.isRunning) return;

        const nextPhase = this.dayNightCycle.currentPhase === "day" ? "night" : "day";
        const targetColor = nextPhase === "day" ? this.dayNightCycle.dayColor : this.dayNightCycle.nightColor;
        const transitionDuration = this.dayNightCycle.currentPhase === "day"
            ? this.dayNightCycle.dayDuration
            : this.dayNightCycle.nightDuration;

        console.log(`Transitioning from ${this.dayNightCycle.currentPhase} to ${nextPhase}, duration: ${transitionDuration} seconds`);

        // Start color transition
        this.startColorTransition(transitionDuration, targetColor);

        // Set next switch
        this.dayNightCycle.cycleTimer = window.setTimeout(() => {
            // Update current phase
            this.dayNightCycle.currentPhase = nextPhase;
            
            // Trigger appropriate event
            if (nextPhase === "day") {
                this.triggerDayStart();
            } else {
                this.triggerNightStart();
            }
            
            this.runDayNightCycle(); // Recursive call to continue cycle
        }, transitionDuration * 1000);
    }

    // Stop day-night cycle
    static stopDayNightCycle() {
        this.dayNightCycle.isRunning = false;
        if (this.dayNightCycle.cycleTimer !== null) {
            clearTimeout(this.dayNightCycle.cycleTimer);
            this.dayNightCycle.cycleTimer = null;
        }
        console.log("Day-night cycle stopped");
    }

    static initializeDebugButtons() {
        if (isAmbientLightDebugButtonsBound) return;
        isAmbientLightDebugButtonsBound = true;

        // Create ambient light category
        var ambientLightCategory = IMGUIDebugButton.AddCategory("Ambient Light System");

        // Day-night cycle controls
        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Start Day-Night Cycle", () => {
            AmbientLight.simulat_day_night_cycle(
                150,  // Day to night: 2.5 minutes
                300,  // Night to day: 5 minutes  
                AmbientLight.dya_light_rgb,
                AmbientLight.night_light_rgb,
                "current"
            );
            console.log("Started day-night cycle with default settings");
        });

        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Stop Day-Night Cycle", () => {
            AmbientLight.stopDayNightCycle();
            console.log("Stopped day-night cycle");
        });

        // Quick transitions
        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Switch to Day", () => {
            AmbientLight.Simulat_edsunshine_cycle(10, AmbientLight.dya_light_rgb);
            console.log("Transitioning to day light");
        });

        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Switch to Night", () => {
            AmbientLight.Simulat_edsunshine_cycle(10, AmbientLight.night_light_rgb);
            console.log("Transitioning to night light");
        });

        // Fast cycle tests
        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Fast Day-Night Cycle (Test)", () => {
            AmbientLight.simulat_day_night_cycle(
                5,   // 5 seconds day to night
                5,   // 5 seconds night to day
                AmbientLight.dya_light_rgb,
                AmbientLight.night_light_rgb,
                "day"
            );
            console.log("Started fast day-night cycle for testing");
        });

        // Custom color tests
        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Sunrise Effect", [1.0, 0.7, 0.4, 1.0], () => {
            const sunriseColor: [number, number, number] = [1.0, 0.7, 0.4];
            AmbientLight.Simulat_edsunshine_cycle(8, sunriseColor);
            console.log("Transitioning to sunrise color");
        });

        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Sunset Effect", [0.9, 0.4, 0.2, 1.0], () => {
            const sunsetColor: [number, number, number] = [0.9, 0.4, 0.2];
            AmbientLight.Simulat_edsunshine_cycle(8, sunsetColor);
            console.log("Transitioning to sunset color");
        });

        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Blood Moon Effect", [0.8, 0.1, 0.1, 1.0], () => {
            const bloodMoonColor: [number, number, number] = [0.8, 0.1, 0.1];
            AmbientLight.Simulat_edsunshine_cycle(5, bloodMoonColor);
            console.log("Transitioning to blood moon color");
        });

        // Utility functions
        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Show Current Light Info", () => {
            AmbientLight.toggleInfoWindow();
        });

        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Reset to Default Day", () => {
            AmbientLight.stopDayNightCycle();
            if (AmbientLight.light_layer) {
                AmbientLight.light_layer.backgroundColor = [...AmbientLight.dya_light_rgb];
                console.log("Reset to default day light");
            }
        });

        // Advanced settings
        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Very Slow Day-Night Cycle (Demo)", () => {
            AmbientLight.simulat_day_night_cycle(
                600,  // 10 minutes day to night
                600,  // 10 minutes night to day
                AmbientLight.dya_light_rgb,
                AmbientLight.night_light_rgb,
                "current"
            );
            console.log("Started very slow day-night cycle for demonstration");
        });

        IMGUIDebugButton.AddButtonToCategory(ambientLightCategory, "Extreme Fast Day-Night Cycle (Stress Test)", () => {
            AmbientLight.simulat_day_night_cycle(
                1,   // 1 second day to night
                1,   // 1 second night to day
                AmbientLight.dya_light_rgb,
                AmbientLight.night_light_rgb,
                "day"
            );
            console.log("Started extreme fast day-night cycle for stress testing");
        });

        // Color customization tests
        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Deep Sea Effect", [0.1, 0.3, 0.6, 1.0], () => {
            const deepSeaColor: [number, number, number] = [0.1, 0.3, 0.6];
            AmbientLight.Simulat_edsunshine_cycle(6, deepSeaColor);
            console.log("Transitioning to deep sea color");
        });

        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Forest Effect", [0.2, 0.6, 0.3, 1.0], () => {
            const forestColor: [number, number, number] = [0.2, 0.6, 0.3];
            AmbientLight.Simulat_edsunshine_cycle(6, forestColor);
            console.log("Transitioning to forest color");
        });

        IMGUIDebugButton.AddColorButtonToCategory(ambientLightCategory, "Storm Effect", [0.4, 0.4, 0.5, 1.0], () => {
            const stormColor: [number, number, number] = [0.4, 0.4, 0.5];
            AmbientLight.Simulat_edsunshine_cycle(3, stormColor);
            console.log("Transitioning to storm color");
        });

        console.log("Ambient light debug buttons initialized");
    }

    static updateInfoWindow() {
        if (AmbientLight.showInfoWindow) {
            AmbientLight.renderInfoWindow();
        }
    }

    /**
     * Toggle the info window visibility
     */
    static toggleInfoWindow(): void {
        AmbientLight.showInfoWindow = !AmbientLight.showInfoWindow;
        
        if (AmbientLight.showInfoWindow) {
            AmbientLight.createInfoWindow();
            console.log("Ambient light info window opened");
        } else {
            AmbientLight.closeInfoWindow();
            console.log("Ambient light info window closed");
        }
    }

    /**
     * Create the info window
     */
    private static createInfoWindow(): void {
        if (!Imgui_chunchun) return;

        // Create info window
        const windowConfig = {
            title: "Ambient Light Info",
            isOpen: true,
            size: { width: 350, height: 300 },
            position: { x: 400, y: 50 },
            renderCallback: () => {
                AmbientLight.renderInfoWindowContent();
            }
        };

        // Add window to imgui system
        if ((Imgui_chunchun as any).windows) {
            (Imgui_chunchun as any).windows.set(AmbientLight.INFO_WINDOW_ID, windowConfig);
        }
    }

    /**
     * Close the info window
     */
    private static closeInfoWindow(): void {
        if (!Imgui_chunchun || !(Imgui_chunchun as any).windows) return;

        const windowConfig = (Imgui_chunchun as any).windows.get(AmbientLight.INFO_WINDOW_ID);
        if (windowConfig) {
            windowConfig.isOpen = false;
        }
    }

    /**
     * Render info window content
     */
    private static renderInfoWindow(): void {
        if (!Imgui_chunchun || !(Imgui_chunchun as any).windows) return;

        const windowConfig = (Imgui_chunchun as any).windows.get(AmbientLight.INFO_WINDOW_ID);
        if (!windowConfig) {
            AmbientLight.createInfoWindow();
            return;
        }

        // Update window state
        if (!windowConfig.isOpen && AmbientLight.showInfoWindow) {
            AmbientLight.showInfoWindow = false;
        }
    }

    /**
     * Render the content inside the info window
     */
    private static renderInfoWindowContent(): void {
        const ImGui = (globalThis as any).ImGui;
        if (!ImGui) return;

        try {
            // Current light layer info
            ImGui.Text("=== Light Layer Info ===");
            if (AmbientLight.light_layer) {
                const currentColor = AmbientLight.light_layer.backgroundColor;
                ImGui.Text(`Layer: ${AmbientLight.light_layer_name}`);
                ImGui.Text(`Current RGB: [${currentColor[0].toFixed(3)}, ${currentColor[1].toFixed(3)}, ${currentColor[2].toFixed(3)}]`);
            } else {
                ImGui.TextColored(new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0), "Light layer not found!");
            }

            ImGui.Separator();

            // Day-night cycle info
            ImGui.Text("=== Day-Night Cycle ===");
            ImGui.Text(`Status: ${AmbientLight.dayNightCycle.isRunning ? "RUNNING" : "STOPPED"}`);
            
            if (AmbientLight.dayNightCycle.isRunning) {
                ImGui.TextColored(new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0), `Current Phase: ${AmbientLight.dayNightCycle.currentPhase.toUpperCase()}`);
                ImGui.Text(`Day Duration: ${AmbientLight.dayNightCycle.dayDuration}s`);
                ImGui.Text(`Night Duration: ${AmbientLight.dayNightCycle.nightDuration}s`);
                
                const dayColor = AmbientLight.dayNightCycle.dayColor;
                const nightColor = AmbientLight.dayNightCycle.nightColor;
                ImGui.Text(`Day Color: [${dayColor[0].toFixed(3)}, ${dayColor[1].toFixed(3)}, ${dayColor[2].toFixed(3)}]`);
                ImGui.Text(`Night Color: [${nightColor[0].toFixed(3)}, ${nightColor[1].toFixed(3)}, ${nightColor[2].toFixed(3)}]`);
            }

            ImGui.Separator();

            // Transition info
            ImGui.Text("=== Color Transition ===");
            ImGui.Text(`Status: ${AmbientLight.transition.isActive ? "ACTIVE" : "INACTIVE"}`);
            
            if (AmbientLight.transition.isActive) {
                const elapsed = (performance.now() / 1000) - AmbientLight.transition.startTime;
                const progress = Math.min(elapsed / AmbientLight.transition.duration, 1);
                const progressPercent = (progress * 100).toFixed(1);
                
                ImGui.TextColored(new ImGui.ImVec4(0.3, 0.7, 1.0, 1.0), `Progress: ${progressPercent}%`);
                ImGui.Text(`Duration: ${AmbientLight.transition.duration.toFixed(1)}s`);
                ImGui.Text(`Elapsed: ${elapsed.toFixed(1)}s`);
                
                const startColor = AmbientLight.transition.startColor;
                const targetColor = AmbientLight.transition.targetColor;
                const currentColor = AmbientLight.transition.currentColor;
                
                ImGui.Text(`From: [${startColor[0].toFixed(3)}, ${startColor[1].toFixed(3)}, ${startColor[2].toFixed(3)}]`);
                ImGui.Text(`To: [${targetColor[0].toFixed(3)}, ${targetColor[1].toFixed(3)}, ${targetColor[2].toFixed(3)}]`);
                ImGui.Text(`Current: [${currentColor[0].toFixed(3)}, ${currentColor[1].toFixed(3)}, ${currentColor[2].toFixed(3)}]`);

                // Progress bar
                ImGui.ProgressBar(progress, new ImGui.ImVec2(-1, 0), `${progressPercent}%`);
            }

            ImGui.Separator();

            // Default colors reference
            ImGui.Text("=== Default Colors ===");
            const dayRgb = AmbientLight.dya_light_rgb;
            const nightRgb = AmbientLight.night_light_rgb;
            ImGui.Text(`Default Day: [${dayRgb[0].toFixed(3)}, ${dayRgb[1].toFixed(3)}, ${dayRgb[2].toFixed(3)}]`);
            ImGui.Text(`Default Night: [${nightRgb[0].toFixed(3)}, ${nightRgb[1].toFixed(3)}, ${nightRgb[2].toFixed(3)}]`);

        } catch (error: any) {
            ImGui.Text(`Error rendering info: ${error.message}`);
        }
    }

}