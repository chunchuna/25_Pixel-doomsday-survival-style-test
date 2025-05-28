import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { FogStyle, FogType, PIXEffect_fog } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { _Audio } from "./PIXAudio.js";

export enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal",
}

// Create weather state object that can be modified externally
export const WeatherState = {
    CurrentWeather: null as WEATHER_TYPE | null,
    CurrentInterval: null as number | null, // Current timer
    FogEnabled: false as boolean // Independent fog state
};

// Global variables
let visibilityChangeHandler: EventListener;
// Use C3 internal timer
var WeatherC3Timer: InstanceType.C3Ctimer
// Fog timer management
var FogTimer: InstanceType.C3Ctimer | null = null;
// Track fog timer event listener to prevent duplicates
var FogTimerEventListenerAdded: boolean = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    WeatherC3Timer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Rain", -100, -100)
    handleWeather();
})

async function handleWeather() {
    EnableFog()
    Normal();
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(10)
    Rain();

    //Rain();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(3000); // Wait 3 seconds
    // Normal();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(5000); // Wait 5 seconds
    // Rain(); 
}

async function Rain() {

    if (WeatherC3Timer == null) return
    WeatherState.CurrentWeather = WEATHER_TYPE.RAIN;

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    // Don't clean up fog when switching to rain - fog is independent

    if (WeatherC3Timer.behaviors.Timer.isTimerRunning("rain")) {
        WeatherC3Timer.behaviors.Timer.stopTimer("rain")
    }

    _Audio.AudioPlayCycle("Rain", -10, 1, "Rain");

    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    var GameLayoutdth = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.width;
    var GameLayoutHeight = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.height;


    WeatherC3Timer.behaviors.Timer.startTimer(0.5, "rain", "regular")
    WeatherC3Timer.behaviors.Timer.addEventListener("timer", () => {
        for (let i = 0; i < 2; i++) {
            if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return
            RainDropSpriteClass.createInstance(
                "Rain",
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-100, GameLayoutdth),
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(0, 20),
                false
            );
        }
    })
}

async function Normal() {
    WeatherState.CurrentWeather = WEATHER_TYPE.NORMAL;

    // Stop rain timer
    if (WeatherC3Timer && WeatherC3Timer.behaviors.Timer.isTimerRunning("rain")) {
        WeatherC3Timer.behaviors.Timer.stopTimer("rain")
    }

    // Stop rain audio
    _Audio.AudioStop("Rain");

    // Don't clean up fog - fog is independent of weather
}

/**
 * Cleans up fog effects and timers
 */
function cleanupFog(): void {
    console.log("Cleaning up fog effects...");

    // Stop fog timer if running
    if (FogTimer && FogTimer.behaviors.Timer.isTimerRunning("fogtimer")) {
        FogTimer.behaviors.Timer.stopTimer("fogtimer");
    }

    // Use emergency cleanup to ensure all fog is destroyed
    PIXEffect_fog.EmergencyDestroyAllFog();

    // Reset fog timer event listener flag
    FogTimerEventListenerAdded = false;

    // Update fog state
    WeatherState.FogEnabled = false;

    console.log("Fog cleanup completed");
}

/**
 * Enables fog effect independent of weather
 */
export function EnableFog(): void {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    console.log("Enabling fog effect...");

    // Set fog state
    WeatherState.FogEnabled = true;

    // Clean up any existing fog first
    cleanupFog();
    WeatherState.FogEnabled = true; // Reset after cleanup

    // Wait 2 seconds before starting fog

    // Check if fog is still enabled after waiting
    if (!WeatherState.FogEnabled) {
        console.log("Fog was disabled during initialization, aborting fog creation");
        return;
    }

    // Create initial fog
    console.log("Creating initial level fog...");
    PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LEVEL, 60, "whole_level_fog")
        .setPosition(0, 0)
        .setSize(6000, 3000)
        .setScale(1.2);

    // Create or reuse timer for fog cycling
    if (!FogTimer) {
        FogTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
    }

    // Only add event listener once to prevent duplicates
    if (FogTimer && !FogTimerEventListenerAdded) {
        FogTimerEventListenerAdded = true;

        FogTimer.behaviors.Timer.addEventListener("timer", (e) => {
            if (e.tag === "fogtimer") {
                // Check if we're still in the Level layout and fog is enabled
                if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level" ||
                    !WeatherState.FogEnabled) {
                    // Stop timer and clean up if not in Level or fog disabled
                    console.log("Stopping fog due to layout change or fog disabled");
                    cleanupFog();
                    return;
                }

                console.log("Replacing level fog with new fog...");
                // Generate new fog with same ID - this will automatically fade out the old one
                PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LEVEL, 70, "whole_level_fog")
                    .setPosition(0, 0)
                    .setSize(6000, 3000)
                    .setScale(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(2, 2.5)); // Random scale for variety

                // Set next timer with random interval
                if (FogTimer && WeatherState.FogEnabled) {
                    FogTimer.behaviors.Timer.stopTimer("fogtimer");
                    FogTimer.behaviors.Timer.startTimer(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(30, 60), "fogtimer", "regular");
                }
            }
        });
    }

    // Start repeating timer for fog replacement
    if (FogTimer && WeatherState.FogEnabled) {
        FogTimer.behaviors.Timer.startTimer(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(25, 60), "fogtimer", "regular");
    }

}

/**
 * Disables fog effect
 */
export function DisableFog(): void {
    console.log("Disabling fog effect...");
    WeatherState.FogEnabled = false;
    cleanupFog();
}

/**
 * Toggles fog effect
 */
export function ToggleFog(): void {
    if (WeatherState.FogEnabled) {
        DisableFog();
    } else {
        EnableFog();
    }
}

async function Fog() {
    // This function is now replaced by EnableFog()
    // Keeping for compatibility but redirecting to new function
    console.warn("Fog() function is deprecated, use EnableFog() instead");
    EnableFog();
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    RainDropSpriteClass.addEventListener("instancecreate", (e) => {
        e.instance.angleDegrees = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(68, 70)
        //console.log(e.instance.angleDegrees)
        e.instance.behaviors.Timer.startTimer(5, "DestroyTimer", "once")
        e.instance.behaviors.Timer.addEventListener("timer", (e) => {
            //console.log(e.tag)
            if (e.tag == "destroytimer") {
                e.instance.destroy();
                //console.log("Rain Destroy")
            }
        })

    })
})

/**
 * Emergency cleanup function for weather system
 * Call this if weather gets stuck or fog won't clear
 */
export function EmergencyWeatherCleanup(): void {
    console.log("=== EMERGENCY WEATHER CLEANUP ===");

    // Reset weather state
    WeatherState.CurrentWeather = WEATHER_TYPE.NORMAL;
    WeatherState.FogEnabled = false;

    // Stop all timers
    if (WeatherC3Timer) {
        try {
            if (WeatherC3Timer.behaviors.Timer.isTimerRunning("rain")) {
                WeatherC3Timer.behaviors.Timer.stopTimer("rain");
            }
        } catch (error) {
            console.warn("Error stopping rain timer:", error);
        }
    }

    if (FogTimer) {
        try {
            if (FogTimer.behaviors.Timer.isTimerRunning("fogtimer")) {
                FogTimer.behaviors.Timer.stopTimer("fogtimer");
            }
        } catch (error) {
            console.warn("Error stopping fog timer:", error);
        }
    }

    // Force destroy all fog using emergency method
    try {
        PIXEffect_fog.EmergencyDestroyAllFog();
    } catch (error) {
        console.warn("Error during emergency fog cleanup:", error);
    }

    // Stop all audio
    try {
        _Audio.AudioStop("Rain");
    } catch (error) {
        console.warn("Error stopping rain audio:", error);
    }

    // Reset flags
    FogTimerEventListenerAdded = false;

    console.log("Emergency cleanup completed");
}

/**
 * Get current weather debug information
 */
export function GetWeatherDebugInfo(): any {
    const fogInfo = PIXEffect_fog.GetFogInfo();
    const performanceStats = PIXEffect_fog.GetPerformanceStats();
    
    return {
        currentWeather: WeatherState.CurrentWeather,
        fogEnabled: WeatherState.FogEnabled,
        fogCount: fogInfo.count,
        fogIds: fogInfo.fogs,
        fogPerformance: performanceStats,
        timers: {
            rainTimerRunning: WeatherC3Timer ? WeatherC3Timer.behaviors.Timer.isTimerRunning("rain") : false,
            fogTimerRunning: FogTimer ? FogTimer.behaviors.Timer.isTimerRunning("fogtimer") : false,
            fogEventListenerAdded: FogTimerEventListenerAdded
        },
        layout: pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name
    };
}

/**
 * Force set weather to specific type with cleanup
 */
export function ForceSetWeather(weatherType: WEATHER_TYPE): void {
    console.log(`Force setting weather to: ${weatherType}`);

    // Emergency cleanup first
    EmergencyWeatherCleanup();

    // Wait a bit then set new weather
    setTimeout(() => {
        switch (weatherType) {
            case WEATHER_TYPE.NORMAL:
                Normal();
                break;
            case WEATHER_TYPE.RAIN:
                Rain();
                break;
        }
    }, 1000);
}

// Weather system debug buttons
import { IMGUIDebugButton } from "../UI/debug_ui/UIDbugButton.js";
import { Imgui_chunchun } from "../UI/imgui_lib/imgui.js";

var isWeatherDebugButtonsAdded = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (isWeatherDebugButtonsAdded) return;
    isWeatherDebugButtonsAdded = true;

    // Weather system category
    var weather_system = IMGUIDebugButton.AddCategory("weather_system");

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Force Rain Weather", () => {
        ForceSetWeather(WEATHER_TYPE.RAIN);
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Force Normal Weather", () => {
        ForceSetWeather(WEATHER_TYPE.NORMAL);
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Enable Fog Effect", () => {
        EnableFog();
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Disable Fog Effect", () => {
        DisableFog();
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Toggle Fog Effect", () => {
        ToggleFog();
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Emergency Weather Cleanup", () => {
        EmergencyWeatherCleanup();
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Open ImGui Debug Window", () => {
        CreateWeatherDebugWindow();
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Show Weather Debug Info", () => {
        const debugInfo = GetWeatherDebugInfo();
        console.log("=== WEATHER DEBUG INFO ===");
        console.log("Current Weather:", debugInfo.currentWeather);
        console.log("Fog Enabled:", WeatherState.FogEnabled);
        console.log("Layout:", debugInfo.layout);
        console.log("Fog Count:", debugInfo.fogCount);
        console.log("Fog IDs:", debugInfo.fogIds);
        console.log("Timers:", debugInfo.timers);
        console.log("Fog Performance:", debugInfo.fogPerformance);
        console.log("========================");
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Restart Weather System", () => {
        console.log("Restarting weather system...");
        EmergencyWeatherCleanup();
        setTimeout(() => {
            handleWeather();
        }, 2000);
    });

    // Test fog with different weather combinations
    IMGUIDebugButton.AddButtonToCategory(weather_system, "Test: Rain + Fog", () => {
        console.log("Testing Rain + Fog combination...");
        ForceSetWeather(WEATHER_TYPE.RAIN);
        setTimeout(() => {
            EnableFog();
        }, 1000);
    });

    IMGUIDebugButton.AddButtonToCategory(weather_system, "Test: Normal + Fog", () => {
        console.log("Testing Normal + Fog combination...");
        ForceSetWeather(WEATHER_TYPE.NORMAL);
        setTimeout(() => {
            EnableFog();
        }, 1000);
    });
});

/**
 * Create ImGui weather debug window
 */
export function CreateWeatherDebugWindow(): void {
    const windowId = "weather_debug_window";
    
    // Close existing window if open
    if (Imgui_chunchun.IsWindowOpen(windowId)) {
        Imgui_chunchun.DestroyWindow(windowId);
    }
    
    // Create weather debug window
    const renderCallback = () => {
        const debugInfo = GetWeatherDebugInfo();
        
        // Weather Status Section
        if (ImGui.CollapsingHeader("Weather Status", ImGui.TreeNodeFlags.DefaultOpen)) {
            // Current weather display with color coding
            ImGui.Text("Current Weather:");
            ImGui.SameLine();
            const weatherColor = debugInfo.currentWeather === "Rain" ? 
                new ImGui.ImVec4(0.3, 0.7, 1.0, 1.0) : // Blue for rain
                new ImGui.ImVec4(1.0, 1.0, 0.3, 1.0);   // Yellow for normal
            ImGui.TextColored(weatherColor, debugInfo.currentWeather || "None");
            
            // Layout info
            ImGui.Text(`Layout: ${debugInfo.layout}`);
            
            ImGui.Separator();
            
            // Weather control buttons
            if (ImGui.Button("Set Rain Weather", new ImGui.ImVec2(120, 25))) {
                ForceSetWeather(WEATHER_TYPE.RAIN);
            }
            ImGui.SameLine();
            if (ImGui.Button("Set Normal Weather", new ImGui.ImVec2(120, 25))) {
                ForceSetWeather(WEATHER_TYPE.NORMAL);
            }
        }
        
        // Fog Status Section
        if (ImGui.CollapsingHeader("Fog Status", ImGui.TreeNodeFlags.DefaultOpen)) {
            // Fog enabled status with checkbox
            let fogEnabled = debugInfo.fogEnabled;
            if (ImGui.Checkbox("Fog Enabled", (value = fogEnabled) => fogEnabled = value)) {
                // Only trigger when checkbox is actually clicked, not just rendered
                if (fogEnabled !== debugInfo.fogEnabled) {
                    if (fogEnabled) {
                        EnableFog();
                    } else {
                        DisableFog();
                    }
                }
            }
            
            // Fog count with progress bar
            ImGui.Text(`Active Fog Count: ${debugInfo.fogCount}`);
            if (debugInfo.fogCount > 0) {
                const fogProgress = Math.min(debugInfo.fogCount / 5.0, 1.0); // Max 5 for full bar
                const progressColor = fogProgress > 0.8 ? 
                    new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0) : // Red if too many
                    new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0);   // Green if normal
                ImGui.PushStyleColor(ImGui.Col.PlotHistogram, progressColor);
                ImGui.ProgressBar(fogProgress, new ImGui.ImVec2(-1, 0), `${debugInfo.fogCount} fogs`);
                ImGui.PopStyleColor();
            }
            
            // Fog IDs list
            if (debugInfo.fogIds && debugInfo.fogIds.length > 0) {
                ImGui.Text("Fog IDs:");
                ImGui.Indent();
                debugInfo.fogIds.forEach((id: string, index: number) => {
                    ImGui.BulletText(id);
                });
                ImGui.Unindent();
            }
            
            ImGui.Separator();
            
            // Fog control buttons
            if (ImGui.Button("Enable Fog", new ImGui.ImVec2(80, 25))) {
                EnableFog();
            }
            ImGui.SameLine();
            if (ImGui.Button("Disable Fog", new ImGui.ImVec2(80, 25))) {
                DisableFog();
            }
            ImGui.SameLine();
            if (ImGui.Button("Toggle Fog", new ImGui.ImVec2(80, 25))) {
                ToggleFog();
            }
        }
        
        // Timer Status Section
        if (ImGui.CollapsingHeader("Timer Status")) {
            const timers = debugInfo.timers;
            
            // Rain timer status
            ImGui.Text("Rain Timer:");
            ImGui.SameLine();
            const rainColor = timers.rainTimerRunning ? 
                new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : // Green if running
                new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0);   // Gray if stopped
            ImGui.TextColored(rainColor, timers.rainTimerRunning ? "Running" : "Stopped");
            
            // Fog timer status
            ImGui.Text("Fog Timer:");
            ImGui.SameLine();
            const fogTimerColor = timers.fogTimerRunning ? 
                new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : // Green if running
                new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0);   // Gray if stopped
            ImGui.TextColored(fogTimerColor, timers.fogTimerRunning ? "Running" : "Stopped");
            
            // Event listener status
            ImGui.Text("Fog Event Listener:");
            ImGui.SameLine();
            const listenerColor = timers.fogEventListenerAdded ? 
                new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : // Green if added
                new ImGui.ImVec4(1.0, 0.7, 0.3, 1.0);   // Orange if not added
            ImGui.TextColored(listenerColor, timers.fogEventListenerAdded ? "Added" : "Not Added");
        }
        
        // Performance Section
        if (ImGui.CollapsingHeader("Fog Performance")) {
            const perf = debugInfo.fogPerformance;
            
            if (perf) {
                // Total particles with slider-like display
                ImGui.Text(`Total Particles: ${perf.totalParticles}/${perf.maxParticlesGlobal}`);
                const particleRatio = perf.maxParticlesGlobal > 0 ? perf.totalParticles / perf.maxParticlesGlobal : 0;
                ImGui.ProgressBar(particleRatio, new ImGui.ImVec2(-1, 0), 
                    `${(particleRatio * 100).toFixed(1)}% used`);
                
                // FPS display with color coding
                ImGui.Text("Estimated FPS:");
                ImGui.SameLine();
                const fpsColor = perf.estimatedFPS >= 50 ? 
                    new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : // Green for good FPS
                    perf.estimatedFPS >= 30 ? 
                    new ImGui.ImVec4(1.0, 1.0, 0.3, 1.0) : // Yellow for medium FPS
                    new ImGui.ImVec4(1.0, 0.3, 0.3, 1.0);   // Red for low FPS
                ImGui.TextColored(fpsColor, `${perf.estimatedFPS}`);
                
                // Frame time
                ImGui.Text(`Avg Frame Time: ${perf.avgFrameTime.toFixed(2)}ms`);
                
                // Performance mode indicators
                ImGui.Text("Performance Mode:");
                ImGui.SameLine();
                ImGui.TextColored(
                    perf.performanceMode ? new ImGui.ImVec4(1.0, 1.0, 0.3, 1.0) : new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                    perf.performanceMode ? "ON" : "OFF"
                );
                
                ImGui.Text("LOD System:");
                ImGui.SameLine();
                ImGui.TextColored(
                    perf.lodEnabled ? new ImGui.ImVec4(0.3, 1.0, 0.3, 1.0) : new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                    perf.lodEnabled ? "ON" : "OFF"
                );
            }
        }
        
        // Quick Actions Section
        if (ImGui.CollapsingHeader("Quick Actions")) {
            // Test combinations
            if (ImGui.Button("Test: Rain + Fog", new ImGui.ImVec2(120, 25))) {
                ForceSetWeather(WEATHER_TYPE.RAIN);
                setTimeout(() => EnableFog(), 1000);
            }
            ImGui.SameLine();
            if (ImGui.Button("Test: Normal + Fog", new ImGui.ImVec2(120, 25))) {
                ForceSetWeather(WEATHER_TYPE.NORMAL);
                setTimeout(() => EnableFog(), 1000);
            }
            
            ImGui.Separator();
            
            // Emergency actions
            if (ImGui.Button("Emergency Cleanup", new ImGui.ImVec2(120, 25))) {
                EmergencyWeatherCleanup();
            }
            ImGui.SameLine();
            if (ImGui.Button("Restart Weather", new ImGui.ImVec2(120, 25))) {
                EmergencyWeatherCleanup();
                setTimeout(() => handleWeather(), 2000);
            }
        }
        
        // Auto-refresh toggle
        ImGui.Separator();
        ImGui.Text("Window will auto-refresh every frame");
        
        // Close button
        if (ImGui.Button("Close Debug Window", new ImGui.ImVec2(-1, 30))) {
            Imgui_chunchun.CloseWindow(windowId);
        }
    };
    
    // Create the window
    const windowConfig = {
        title: "Weather System Debug",
        isOpen: true,
        size: { width: 400, height: 600 },
        position: { x: 50, y: 50 },
        renderCallback: renderCallback
    };
    
    // Manually add to windows map
    (Imgui_chunchun as any).windows.set(windowId, windowConfig);
    
    console.log("Weather debug window created");
}

