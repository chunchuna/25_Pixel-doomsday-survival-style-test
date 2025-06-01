import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";
import { DebugObjectRenderer, DebugColors } from "../../../Renderer/DebugObjectRenderer.js";
import { Imgui_chunchun } from "../../../UI/imgui_lib/imgui.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        LayoutName !== "Level"
    ) return
    var fogSprite = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.FogSprite.createInstance("Fog", 0, 0, false)
    createFogAroundInstance(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.
        RedHairGirlSprite.getFirstInstance(), 20, 100, 3, 200)

    // Start the ImGui fog distance monitoring
    console.log("Starting ImGui fog distance monitoring...");

    // Use C3 timer instead of setTimeout
    const startupTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.C3Ctimer.createInstance("Other", 0, 0, false);

    if (startupTimer && startupTimer.behaviors.Timer) {
        const timer = startupTimer.behaviors.Timer;
        timer.startTimer(2, "startImGuiMonitor", "once");

        timer.addEventListener("timer", (e) => {
            if (e.tag === "startImGuiMonitor") {
                startFogDistanceMonitoring();
                // Clean up the startup timer
                startupTimer.destroy();
            }
        });
    }

    // Add debug buttons for fog monitoring
    setTimeout(() => {
        const fogCategoryId = IMGUIDebugButton.AddCategory("Fog System");
        
        IMGUIDebugButton.AddButtonToCategory(
            fogCategoryId,
            "Open Fog Monitor",
            () => {
                showFogDistanceDebugWindow();
                console.log("Fog distance monitor window opened");
            },
            "Open ImGui window to monitor all fog instances and their distances"
        );

        IMGUIDebugButton.AddButtonToCategory(
            fogCategoryId,
            "Start Auto Monitor",
            () => {
                startFogDistanceMonitoring();
                console.log("Started automatic fog distance monitoring");
            },
            "Start persistent fog monitoring with auto-refresh"
        );

        IMGUIDebugButton.AddColorButtonToCategory(
            fogCategoryId,
            "Clear All Fog",
            [1.0, 0.3, 0.3, 1.0], // Red color for destructive action
            () => {
                const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
                if (runtime) {
                    const fogInstances = runtime.objects.FogSprite.getAllInstances();
                    fogInstances.forEach(fog => {
                        if (fog && fog.destroy) {
                            fog.destroy();
                        }
                    });
                    console.log(`Cleared ${fogInstances.length} fog instances`);
                }
            },
            "WARNING: Remove all fog instances from the scene"
        );

        IMGUIDebugButton.AddButtonToCategory(
            fogCategoryId,
            "Create Test Fog",
            () => {
                const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
                if (runtime) {
                    const targetInstance = runtime.objects.RedHairGirlSprite.getFirstInstance();
                    if (targetInstance) {
                        createFogAroundInstance(targetInstance, 10, 150, 2, 300);
                        console.log("Created test fog instances around player");
                    } else {
                        console.log("No target instance found for fog creation");
                    }
                }
            },
            "Create 10 test fog instances around the player"
        );

        console.log("Fog debug buttons added to debug panel");
    }, 500);
})

// Structure to store fog instance data including debug elements
interface FogInstanceData {
    fogInstance: any;
    debugBoxKey: string;
    debugLineKey: string;
    textRenderer?: IRendererText;
}

// Global array to store fog data for ImGui display
let globalFogDistanceData: Array<{
    fogIndex: number;
    distance: number;
    maxDistance: number;
    position: { x: number; y: number };
    targetPosition: { x: number; y: number };
}> = [];

/**
 * Create fog instances around a target instance in a circular pattern
 * @param targetInstance - The instance to surround with fog
 * @param fogCount - Number of fog instances to create around the target
 * @param radius - Distance from the target instance (default: 100)
 * @param checkInterval - Interval in seconds to check fog distances (default: 2)
 * @param maxDistance - Maximum allowed distance before fog is destroyed (default: 500)
 */
export async function createFogAroundInstance(
    targetInstance: any,
    fogCount: number,
    radius: number = 100,
    checkInterval: number = 2,
    maxDistance: number = 500
): Promise<void> {

    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1)
    alert(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName)
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName !== "Level") return

    if (!targetInstance || fogCount <= 0) {
        console.log("Invalid parameters for fog creation");
        return;
    }

    const centerX = targetInstance.x;
    const centerY = targetInstance.y;

    // Array to store fog instance data with debug elements
    const fogInstancesData: FogInstanceData[] = [];

    // Calculate angle step for equal distribution
    const angleStep = (2 * Math.PI) / fogCount;

    for (let i = 0; i < fogCount; i++) {
        const angle = i * angleStep;
        const fogX = centerX + Math.cos(angle) * radius;
        const fogY = centerY + Math.sin(angle) * radius;

        // Create fog instance at calculated position
        const fogInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
            RUN_TIME_.objects.FogSprite.createInstance("Fog", fogX, fogY, false);

        // Add debug visualization for this fog instance
        let boxKey = "";
        let lineKey = "";

        try {
            // Add debug box around fog instance
            boxKey = DebugObjectRenderer
                .setColorPreset(DebugColors.CYAN, 0.8)
                .setBoxThickness(2)
                .setHollow()
                .setLayer("GameContent")
                .RenderBoxtoInstance(fogInstance);

            // Add debug line connecting fog to target instance
            lineKey = DebugObjectRenderer
                .setColorPreset(DebugColors.YELLOW, 0.6)
                .setBoxThickness(1)
                .RenderLineBetweenInstances(fogInstance, targetInstance);

            console.log(`Added debug visualization for fog instance ${i + 1}`);
        } catch (error) {
            console.log(`Failed to add debug visualization for fog instance ${i + 1}: ${error}`);
        }

        // Store fog instance data
        const fogData: FogInstanceData = {
            fogInstance: fogInstance,
            debugBoxKey: boxKey,
            debugLineKey: lineKey
        };

        fogInstancesData.push(fogData);

        // Add fade-in effect to the fog instance
        try {
            const fadeBehavior = fogInstance.behaviors.Fade;
            if (fadeBehavior) {
                // Set fade parameters
                fadeBehavior.fadeInTime = 1.0;  // 1 second fade in
                fadeBehavior.waitTime = 99999;      // Long wait time
                fadeBehavior.fadeOutTime = 1.0;   // 1 second fade out when triggered

                // Start the fade effect
                fadeBehavior.startFade();
                console.log(`Started fade-in effect for fog instance ${i + 1}`);
            }
        } catch (error) {
            console.log(`Failed to apply fade effect to fog instance ${i + 1}: ${error}`);
        }

        console.log(`Created fog instance ${i + 1} at position (${fogX.toFixed(2)}, ${fogY.toFixed(2)})`);
    }

    // Create a timer instance for distance checking
    const timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.C3Ctimer.createInstance("Other", 0, 0, false);

    // Set up distance checking timer
    if (timerInstance && timerInstance.behaviors.Timer) {
        const timer = timerInstance.behaviors.Timer;

        // Start repeating timer for distance checking
        timer.startTimer(checkInterval, "fogDistanceCheck", "regular");

        // Add event listener for timer events
        timer.addEventListener("timer", (e) => {
            if (e.tag === "fogDistanceCheck") {
                checkFogDistancesWithDebug(targetInstance, fogInstancesData, maxDistance);
            }
        });

        console.log(`Started distance checking timer with ${checkInterval}s interval`);
    }

    console.log(`Successfully created ${fogCount} fog instances around target at (${centerX}, ${centerY})`);
}

/**
 * Check distances of fog instances and update debug visualizations
 * @param targetInstance - The target instance to measure distance from
 * @param fogInstancesData - Array of fog instances data with debug elements
 * @param maxDistance - Maximum allowed distance
 */
function checkFogDistancesWithDebug(targetInstance: any, fogInstancesData: FogInstanceData[], maxDistance: number): void {
    if (!targetInstance) return;

    const targetX = targetInstance.x;
    const targetY = targetInstance.y;

    for (let i = fogInstancesData.length - 1; i >= 0; i--) {
        const fogData = fogInstancesData[i];
        const fogInstance = fogData.fogInstance;

        if (!fogInstance || !fogInstance.isValid) {
            // Clean up debug elements for invalid instances
            if (fogData.debugBoxKey) {
                DebugObjectRenderer.Remove(fogData.debugBoxKey);
            }
            if (fogData.debugLineKey) {
                DebugObjectRenderer.removeDebugLine(fogData.debugLineKey);
            }
            if (fogData.textRenderer) {
                fogData.textRenderer.release();
            }

            // Remove invalid instances from array
            fogInstancesData.splice(i, 1);
            continue;
        }

        // Calculate distance between target and fog
        const distance = Math.sqrt(
            Math.pow(fogInstance.x - targetX, 2) +
            Math.pow(fogInstance.y - targetY, 2)
        );

        // Store distance in the fog instance's custom variable
        try {
            fogInstance.instVars.DistanceFromInstance = distance;
        } catch (error) {
            console.log(`Failed to store distance in fog ${i} instVars: ${error}`);
        }

        // Update debug box color based on distance
        try {
            if (distance > maxDistance * 0.8) {
                // Close to max distance - change to red
                DebugObjectRenderer.Remove(fogData.debugBoxKey);
                fogData.debugBoxKey = DebugObjectRenderer
                    .setColorPreset(DebugColors.RED, 0.9)
                    .setBoxThickness(3)
                    .setHollow()
                    .setLayer("GameContent")
                    .RenderBoxtoInstance(fogInstance);
            } else if (distance > maxDistance * 0.5) {
                // Medium distance - change to orange
                DebugObjectRenderer.Remove(fogData.debugBoxKey);
                fogData.debugBoxKey = DebugObjectRenderer
                    .setColorPreset(DebugColors.ORANGE, 0.8)
                    .setBoxThickness(2)
                    .setHollow()
                    .setLayer("GameContent")
                    .RenderBoxtoInstance(fogInstance);
            }
        } catch (error) {
            console.log(`Failed to update debug box color: ${error}`);
        }

        // Update global fog distance data for ImGui display
        const existingDataIndex = globalFogDistanceData.findIndex(data =>
            Math.abs(data.position.x - fogInstance.x) < 5 &&
            Math.abs(data.position.y - fogInstance.y) < 5
        );

        const fogDistanceInfo = {
            fogIndex: i + 1,
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            maxDistance: maxDistance,
            position: { x: Math.round(fogInstance.x), y: Math.round(fogInstance.y) },
            targetPosition: { x: Math.round(targetX), y: Math.round(targetY) }
        };

        if (existingDataIndex !== -1) {
            globalFogDistanceData[existingDataIndex] = fogDistanceInfo;
        } else {
            globalFogDistanceData.push(fogDistanceInfo);
        }

        if (distance > maxDistance) {
            console.log(`Fog instance at distance ${distance.toFixed(2)} exceeds maximum ${maxDistance}, starting fade-out`);

            // Clean up debug elements before destruction
            if (fogData.debugBoxKey) {
                DebugObjectRenderer.Remove(fogData.debugBoxKey);
            }
            if (fogData.debugLineKey) {
                DebugObjectRenderer.removeDebugLine(fogData.debugLineKey);
            }
            if (fogData.textRenderer) {
                fogData.textRenderer.release();
            }

            // Remove from global distance data
            globalFogDistanceData = globalFogDistanceData.filter(data =>
                !(Math.abs(data.position.x - fogInstance.x) < 5 &&
                    Math.abs(data.position.y - fogInstance.y) < 5)
            );

            // Start fade-out and destruction
            try {
                const fadeBehavior = fogInstance.behaviors.Fade;
                if (fadeBehavior) {
                    // Set fade-out parameters
                    fadeBehavior.fadeInTime = 0;
                    fadeBehavior.waitTime = 0;
                    fadeBehavior.fadeOutTime = 1.0;  // 1 second fade out

                    // Restart fade to begin fade-out
                    fadeBehavior.restartFade();

                    // Schedule destruction using C3 timer instead of setTimeout
                    const destructionTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
                        RUN_TIME_.objects.C3Ctimer.createInstance("DestructionTimer", 0, 0, false);

                    if (destructionTimer && destructionTimer.behaviors.Timer) {
                        const timer = destructionTimer.behaviors.Timer;
                        timer.startTimer(1.1, "destroyFog", "once");

                        timer.addEventListener("timer", (e) => {
                            if (e.tag === "destroyFog") {
                                if (fogInstance && fogInstance.isValid) {
                                    fogInstance.destroy();
                                }
                                // Clean up the timer instance
                                destructionTimer.destroy();
                            }
                        });
                    }
                }
            } catch (error) {
                console.log(`Failed to fade-out fog instance: ${error}`);
                // Directly destroy if fade fails
                fogInstance.destroy();
            }

            // Remove from tracking array
            fogInstancesData.splice(i, 1);
        }
    }
}

// Legacy function for backward compatibility
function checkFogDistances(targetInstance: any, fogInstances: any[], maxDistance: number): void {
    // Convert old format to new format for compatibility
    const fogInstancesData: FogInstanceData[] = fogInstances.map(fog => ({
        fogInstance: fog,
        debugBoxKey: "",
        debugLineKey: ""
    }));

    checkFogDistancesWithDebug(targetInstance, fogInstancesData, maxDistance);
}

//==============================================
// DEBUG FUNCTIONS - ImGui Distance Display
//==============================================

/**
 * Create ImGui window showing real-time fog distance information
 * Call this function to open the debug window for monitoring fog distances
 */
export function showFogDistanceDebugWindow(): void {
    console.log("Opening Fog Distance ImGui Window...");

    const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
    if (!runtime) {
        console.log("Runtime not available for debug window");
        return;
    }

    // Create ImGui window for fog monitoring
    const windowId = "fog_distance_monitor";
    const windows = (Imgui_chunchun as any).windows;

    // Remove existing window if it exists
    if (windows && windows.has(windowId)) {
        windows.delete(windowId);
    }

    // Create the window using the internal windows map
    if (windows) {
        windows.set(windowId, {
            title: "Fog Distance Monitor",
            isOpen: true,
            size: { width: 700, height: 650 },
            position: { x: 50, y: 50 },
            renderCallback: () => {
                // Get all fog instances
                const fogInstances = runtime.objects.FogSprite.getAllInstances();
                const targetInstance = runtime.objects.RedHairGirlSprite.getFirstInstance();

                // Display header information
                if (typeof ImGui !== 'undefined') {
                    // Header with statistics
                    ImGui.Text(`Total Fog Instances: ${fogInstances.length}`);
                    
                    if (targetInstance) {
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0), 
                            `Target: (${Math.round(targetInstance.x)}, ${Math.round(targetInstance.y)})`);
                    } else {
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "No Target Found!");
                    }

                    // Statistics
                    if (fogInstances.length > 0) {
                        let safeCount = 0;
                        let warningCount = 0;
                        let dangerCount = 0;
                        let totalDistance = 0;

                        fogInstances.forEach(fog => {
                            const distance = fog.instVars.DistanceFromInstance || 0;
                            totalDistance += distance;
                            const maxDistance = 200;
                            const distancePercent = (distance / maxDistance) * 100;
                            
                            if (distancePercent > 80) dangerCount++;
                            else if (distancePercent > 50) warningCount++;
                            else safeCount++;
                        });

                        const avgDistance = totalDistance / fogInstances.length;

                        ImGui.Text(`Status: `);
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0), `Safe: ${safeCount}`);
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), `Warning: ${warningCount}`);
                        ImGui.SameLine();
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), `Danger: ${dangerCount}`);
                        
                        ImGui.Text(`Average Distance: ${avgDistance.toFixed(2)}`);
                    }

                    ImGui.Separator();

                    if (fogInstances.length === 0) {
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.5, 1.0), "No fog instances found.");
                        ImGui.Text("Create fog instances first using createFogAroundInstance().");
                        
                        ImGui.Separator();
                        if (ImGui.Button("Create Test Fog")) {
                            if (targetInstance) {
                                createFogAroundInstance(targetInstance, 10, 150, 2, 300);
                                console.log("Created test fog instances from monitor window");
                            }
                        }
                    } else {
                        // Create a table for better organization
                        if (ImGui.BeginTable("FogTable", 7, ImGui.TableFlags.Borders | ImGui.TableFlags.RowBg | ImGui.TableFlags.Sortable)) {
                            // Table headers
                            ImGui.TableSetupColumn("Index", ImGui.TableColumnFlags.WidthFixed, 50);
                            ImGui.TableSetupColumn("UID", ImGui.TableColumnFlags.WidthFixed, 60);
                            ImGui.TableSetupColumn("Position", ImGui.TableColumnFlags.WidthFixed, 120);
                            ImGui.TableSetupColumn("Distance", ImGui.TableColumnFlags.WidthFixed, 80);
                            ImGui.TableSetupColumn("Status", ImGui.TableColumnFlags.WidthFixed, 80);
                            ImGui.TableSetupColumn("Percentage", ImGui.TableColumnFlags.WidthFixed, 80);
                            ImGui.TableSetupColumn("Actions", ImGui.TableColumnFlags.WidthFixed, 100);
                            ImGui.TableHeadersRow();

                            // Display each fog instance
                            fogInstances.forEach((fogInstance, index) => {
                                ImGui.TableNextRow();

                                const distance = fogInstance.instVars.DistanceFromInstance || 0;
                                const maxDistance = 200; // Current max distance being used
                                const distancePercent = Math.round((distance / maxDistance) * 100);

                                let status = "SAFE";
                                let statusColor = new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0); // Green

                                if (distancePercent > 80) {
                                    status = "DANGER";
                                    statusColor = new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0); // Red
                                } else if (distancePercent > 50) {
                                    status = "WARNING";
                                    statusColor = new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0); // Orange
                                }

                                // Index column
                                ImGui.TableSetColumnIndex(0);
                                ImGui.Text(`#${index + 1}`);

                                // UID column
                                ImGui.TableSetColumnIndex(1);
                                ImGui.Text(`${fogInstance.uid}`);

                                // Position column
                                ImGui.TableSetColumnIndex(2);
                                ImGui.Text(`(${Math.round(fogInstance.x)}, ${Math.round(fogInstance.y)})`);

                                // Distance column
                                ImGui.TableSetColumnIndex(3);
                                ImGui.Text(`${distance.toFixed(2)}`);

                                // Status column
                                ImGui.TableSetColumnIndex(4);
                                ImGui.TextColored(statusColor, status);

                                // Percentage column
                                ImGui.TableSetColumnIndex(5);
                                ImGui.Text(`${distancePercent}%`);

                                // Actions column
                                ImGui.TableSetColumnIndex(6);
                                if (ImGui.SmallButton(`Del##${index}`)) {
                                    if (fogInstance && fogInstance.destroy) {
                                        fogInstance.destroy();
                                        console.log(`Deleted fog instance #${index + 1}`);
                                    }
                                }
                                
                                if (ImGui.IsItemHovered()) {
                                    ImGui.BeginTooltip();
                                    ImGui.Text("Delete this fog instance");
                                    ImGui.EndTooltip();
                                }
                            });

                            ImGui.EndTable();
                        }

                        ImGui.Separator();

                        // Color guide
                        ImGui.Text("Visual Guide:");
                        ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 1.0, 1.0), "• CYAN Box = Normal distance (0-50%)");
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), "• ORANGE Box = Medium distance (50-80%)");
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "• RED Box = Danger zone (80%+)");
                        ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), "• YELLOW Lines = Connection to target");

                        ImGui.Separator();

                        // Control buttons
                        if (ImGui.Button("Refresh Data")) {
                            console.log("Manually refreshing fog data...");
                        }

                        ImGui.SameLine();

                        if (ImGui.Button("Clear All Fog")) {
                            fogInstances.forEach(fog => {
                                if (fog && fog.destroy) {
                                    fog.destroy();
                                }
                            });
                            console.log("Cleared all fog instances");
                        }

                        ImGui.SameLine();

                        if (ImGui.Button("Create More Fog")) {
                            if (targetInstance) {
                                createFogAroundInstance(targetInstance, 5, 200, 2, 300);
                                console.log("Created additional fog instances");
                            }
                        }

                        // Auto-refresh toggle
                        ImGui.Separator();
                        ImGui.Text("Auto-refresh every 1 second");
                        ImGui.SameLine();
                        if (ImGui.Button("Start Auto Monitor")) {
                            startFogDistanceMonitoring();
                        }
                    }
                }
            }
        });

        console.log("ImGui fog distance monitor window created successfully");
    } else {
        console.log("Failed to access ImGui windows map");
    }
}

/**
 * Create a persistent ImGui monitoring window with auto-refresh
 */
export function startFogDistanceMonitoring(): void {
    console.log("Starting persistent fog distance ImGui monitoring...");

    const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
    if (!runtime) {
        console.log("Runtime not available for monitoring");
        return;
    }

    // Show the ImGui window
    showFogDistanceDebugWindow();

    // Create a timer for auto-refresh
    const monitorTimer = runtime.objects.C3Ctimer.createInstance("Other", 0, 0, false);

    if (monitorTimer && monitorTimer.behaviors.Timer) {
        const timer = monitorTimer.behaviors.Timer;
        timer.startTimer(1, "fogImGuiRefresh", "regular"); // Update every 1 second

        timer.addEventListener("timer", (e) => {
            if (e.tag === "fogImGuiRefresh") {
                // ImGui window will automatically refresh when rendered
                // We just log occasionally for debugging
                const fogInstances = runtime.objects.FogSprite.getAllInstances();
                if (fogInstances.length > 0) {
                    console.log(`ImGui Monitor: ${fogInstances.length} fog instances active`);
                }
            }
        });

        console.log("ImGui fog monitoring started with auto-refresh");
    }
}

/**
 * Get current fog distance data for external monitoring
 * @returns Array of fog distance information
 */
export function getFogDistanceData(): typeof globalFogDistanceData {
    return [...globalFogDistanceData]; // Return copy to prevent external modification
}

/**
 * Clear all fog distance monitoring data
 */
export function clearFogDistanceData(): void {
    globalFogDistanceData = [];
    console.log("Cleared all fog distance monitoring data");
}