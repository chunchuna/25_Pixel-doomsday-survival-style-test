import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    //@ts-ignore
    AmbientLight.light_layer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.getLayer(AmbientLight.light_layer_name);
    if (AmbientLight.light_layer == null) return

    // Test day-night cycle: start from current color
    AmbientLight.simulat_day_night_cycle(
        150,                    // Day to night transition 10 seconds
        300,                    // Night to day transition 10 seconds
        AmbientLight.dya_light_rgb,          // Day color (slightly yellow)
        AmbientLight.night_light_rgb,      // Night color (deep blue)
        "current"              // Start from current color, automatically determine if closer to day or night
    );

})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    AmbientLight.updateColorTransition()
})

export class AmbientLight {

    public static dya_light_rgb: [number, number, number] = [225/ 255, 225 / 255, 225 / 255]
    public static night_light_rgb: [number, number, number] = [28 / 255, 24 / 255, 57 / 255]  // Deep blue, easier to see the effect

    private static Layout_allow_name = "Level"
    public static light_layer_name = "Vignette"

    public static light_layer: IAnyProjectLayer | null = null;

    // Day-night cycle state
    private static dayNightCycle = {
        isRunning: false,
        currentPhase: "day" as "day" | "night",
        dayDuration: 0,
        nightDuration: 0,
        dayColor: [1, 1, 1] as [number, number, number],
        nightColor: [0, 0, 0] as [number, number, number],
        cycleTimer: null as number | null
    }

    private static transition = {
        isActive: false,
        startTime: 0,
        duration: 0,
        startColor: [0, 0, 0] as [number, number, number],
        targetColor: [0, 0, 0] as [number, number, number],
        currentColor: [0, 0, 0] as [number, number, number]
    }


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
        if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != this.Layout_allow_name) return
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
            this.dayNightCycle.currentPhase = nextPhase;
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

}