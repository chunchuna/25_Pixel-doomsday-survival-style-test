import { hf_engine } from "../../../../engine.js";
import { DebugObjectRenderer, DebugColors } from "../../../Renderer/DebugObjectRenderer.js";
import { Imgui_chunchun } from "../../../UI/imgui_lib/imgui.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";

hf_engine.gl$_ubu_init(() => {

    if (hf_engine.
        LayoutName !== "Level"
    ) return
    var fogSprite = hf_engine.
        runtime.objects.FogSprite.createInstance("Fog", 0, 0, false)
    // createFogAroundInstance(hf_engine.
    //     runtime.objects.
    //     RedHairGirlSprite.getFirstInstance(), 50, 1000, 3, 1000)



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





var TargetInstance: null;
var MaxDsitance = 0;
var FogInstanceArray: InstanceType.FogSprite[] = [];
var MaxFogCount = 0; // 记录最大雾数量
var FogRadius = 100; // 记录雾的半径
var DebugRender = false;

// 新增：标记雾生成系统是否已经在运行
var IsFogSystemActive = false;

// 新增：存储雾实例与debug元素的映射关系
var FogDebugMap: Map<number, { boxKey: string; lineKey: string }> = new Map();

// Add a Set to track fog instances that are already fading out
var FogInstancesFadingOut: Set<number> = new Set();

// 存储雾生成定时器的引用
var FogGenerationTimer: any = null;

//实时获取雾和实例的距离

hf_engine.gl$_ubu_update(() => {

    if (hf_engine.LayoutName !== "Level") return
    if (TargetInstance == null) return;

    // Get all fog instances
    const fogInstances = Array.from(hf_engine.
        runtime.objects.FogSprite.instances());

    for (var FogSprites of fogInstances) {
        if (FogSprites == null) continue;

        FogSprites.instVars.DistanceFromInstance = hf_engine.
            //@ts-ignore
            CalculateDistancehahaShitCode(TargetInstance.x,
                //@ts-ignore
                TargetInstance.y, FogSprites.x, FogSprites.y);

        if (FogSprites.instVars.DistanceFromInstance > MaxDsitance) {
            // Check if this fog instance is already fading out
            if (!FogInstancesFadingOut.has(FogSprites.uid)) {
                // Mark this fog instance as fading out
                FogInstancesFadingOut.add(FogSprites.uid);

                // Start fade-out effect instead of direct destruction
                try {
                    const fadeBehavior = FogSprites.behaviors.Fade;
                    if (fadeBehavior) {
                        // Set fade-out parameters
                        fadeBehavior.fadeInTime = 0;      // No fade in
                        fadeBehavior.waitTime = 0;        // No wait time
                        fadeBehavior.fadeOutTime = 1.0;   // 1 second fade out

                        // Start the fade effect
                        fadeBehavior.startFade();
                        console.log(`Started fade-out for fog instance UID: ${FogSprites.uid}`);

                        // Clean up debug elements immediately when fade starts
                        cleanupFogDebugElements(FogSprites.uid);

                        // Set up a timer to clean up the tracking set after fade completes
                        const cleanupTimer = hf_engine.
                            runtime.objects.C3Ctimer.createInstance("Other", -200, -200, false);

                        if (cleanupTimer && cleanupTimer.behaviors.Timer) {
                            cleanupTimer.behaviors.Timer.startTimer(1.2, `cleanup_${FogSprites.uid}`, "once");
                            cleanupTimer.behaviors.Timer.addEventListener("timer", (e) => {
                                if (e.tag === `cleanup_${FogSprites.uid}`) {
                                    // Remove from tracking set after fade completes
                                    FogInstancesFadingOut.delete(FogSprites.uid);
                                    // Destroy the cleanup timer
                                    cleanupTimer.destroy();
                                    console.log(`Cleaned up tracking for fog UID: ${FogSprites.uid}`);
                                }
                            });
                        }
                    } else {
                        // Fallback: if no Fade behavior, destroy directly
                        console.log(`No Fade behavior found for fog UID: ${FogSprites.uid}, destroying directly`);
                        cleanupFogDebugElements(FogSprites.uid);
                        FogSprites.destroy();
                        FogInstancesFadingOut.delete(FogSprites.uid);
                    }
                } catch (error) {
                    console.log(`Failed to start fade-out for fog UID ${FogSprites.uid}: ${error}`);
                    // Fallback: destroy directly if fade fails
                    cleanupFogDebugElements(FogSprites.uid);
                    FogSprites.destroy();
                    FogInstancesFadingOut.delete(FogSprites.uid);
                }
            }
        }
    }
});

/**
 * Clean up debug elements (box and line) for a specific fog instance
 * @param fogUID - The UID of the fog instance
 */
function cleanupFogDebugElements(fogUID: number): void {
    // Only cleanup debug elements if DebugRender was enabled when they were created
    if (!DebugRender) {
        return; // No debug elements to clean up
    }

    const debugElements = FogDebugMap.get(fogUID);
    if (debugElements) {
        try {
            // Remove debug box
            if (debugElements.boxKey) {
                DebugObjectRenderer.Remove(debugElements.boxKey);
                console.log(`Removed debug box for fog UID: ${fogUID}`);
            }

            // Remove debug line
            if (debugElements.lineKey) {
                DebugObjectRenderer.removeDebugLine(debugElements.lineKey);
                console.log(`Removed debug line for fog UID: ${fogUID}`);
            }
        } catch (error) {
            console.log(`Failed to cleanup debug elements for fog UID ${fogUID}: ${error}`);
        }

        // Remove from mapping
        FogDebugMap.delete(fogUID);
        console.log(`Cleaned up debug elements for fog UID: ${fogUID}`);
    }
}

/**
 * Create fog instance with debug elements and register them
 * @param targetInstance - Target instance
 * @param fogX - Fog X position
 * @param fogY - Fog Y position
 * @param isReplacement - Whether this is a replacement fog (affects debug color)
 * @returns Created fog instance
 */
function createFogInstanceWithDebug(targetInstance: any, fogX: number, fogY: number, isReplacement: boolean = false): any {
    // Create fog instance at calculated position
    const fogInstance = hf_engine.
        runtime.objects.FogSprite.createInstance("Fog", fogX, fogY, false);

    // Only add debug visualization if DebugRender is enabled
    if (DebugRender) {
        let boxKey = "";
        let lineKey = "";

        try {
            // Choose color based on whether it's a replacement fog
            const boxColor = isReplacement ? DebugColors.GREEN : DebugColors.CYAN;

            // Add debug box around fog instance
            boxKey = DebugObjectRenderer
                .setColorPreset(boxColor, 0.8)
                .setBoxThickness(2)
                .setHollow()
                .setLayer("GameContent")
                .RenderBoxtoInstance(fogInstance);

            // Add debug line connecting fog to target instance
            lineKey = DebugObjectRenderer
                .setColorPreset(DebugColors.YELLOW, 0.6)
                .setBoxThickness(1)
                .RenderLineBetweenInstances(fogInstance, targetInstance);

            // Store the mapping between fog UID and debug elements
            FogDebugMap.set(fogInstance.uid, {
                boxKey: boxKey,
                lineKey: lineKey
            });

            console.log(`Added debug visualization for fog instance UID: ${fogInstance.uid} (${isReplacement ? 'replacement' : 'original'})`);
        } catch (error) {
            console.log(`Failed to add debug visualization for fog instance: ${error}`);
        }
    } else {
        console.log(`Created fog instance UID: ${fogInstance.uid} without debug visualization (DebugRender disabled)`);
    }

    // Add fade-in effect to the fog instance (this is independent of debug rendering)
    try {
        const fadeBehavior = fogInstance.behaviors.Fade;
        if (fadeBehavior) {
            // Set fade parameters
            fadeBehavior.fadeInTime = 1.0;  // 1 second fade in
            fadeBehavior.waitTime = 99999;      // Long wait time
            fadeBehavior.fadeOutTime = 1.0;   // 1 second fade out when triggered

            // Start the fade effect
            fadeBehavior.startFade();
            console.log(`Started fade-in effect for fog instance UID: ${fogInstance.uid}`);
        }
    } catch (error) {
        console.log(`Failed to apply fade effect to fog instance: ${error}`);
    }

    return fogInstance;
}

/**
 * Create fog instances around a target instance in a circular pattern
 * @param targetInstance - The instance to surround with fog
 * @param fogCount - Number of fog instances to create around the target
 * @param radius - Distance from the target instance (default: 100)
 * @param maxDistance - Maximum allowed distance before fog is destroyed (default: 500)
 */
export async function createFogAroundInstance(
    targetInstance: any,
    fogCount: number,
    radius: number = 100,
    checkInterval: number = 2,
    maxDistance: number = 500
): Promise<void> {

    await hf_engine.WAIT_TIME_FORM_PROMISE(1)
    if (hf_engine.LayoutName !== "Level") return
    
    // 检查是否已有雾系统在运行，如果有则先停止
    if (IsFogSystemActive) {
        console.log("Fog system already active. Stopping current system before creating a new one.");
        stopFogGeneration(0.5); // 快速淡出现有雾
        await hf_engine.WAIT_TIME_FORM_PROMISE(0.7); // 等待淡出完成
    }
    
    // 标记雾系统为活动状态
    IsFogSystemActive = true;
    console.log(`Starting new fog system with ${fogCount} instances`);

    // Set global variables for your distance calculation system
    TargetInstance = targetInstance;
    MaxDsitance = maxDistance;
    MaxFogCount = fogCount; // 记录最大雾数量
    FogRadius = radius; // 记录雾半径
    
    // Clear any existing fading out tracking to prevent issues with new fog generation
    FogInstancesFadingOut.clear();
    console.log("Cleared fog tracking for new fog generation cycle");

    var FogTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100)
    FogTimer.behaviors.Timer.startTimer(checkInterval, "fog_check_timer", "regular")
    FogTimer.behaviors.Timer.addEventListener("timer", (e) => {
        if (e.tag === "fog_check_timer") {
            // 检查当前雾实例数量
            const currentFogInstances = hf_engine.
                runtime.objects.FogSprite.getAllInstances();
            const currentFogCount = currentFogInstances.length;

           // console.log(`Current fog count: ${currentFogCount}, Max fog count: ${MaxFogCount}`);

            // 如果当前雾数量小于最大值，则补充雾实例
            if (currentFogCount < MaxFogCount && TargetInstance) {
                const missingFogCount = MaxFogCount - currentFogCount;
                console.log(`Need to create ${missingFogCount} more fog instances`);

                // 创建缺失的雾实例
                createMissingFogInstances(TargetInstance, missingFogCount, FogRadius);
            }
        }
    })
    
    // 保存定时器引用以便后续停止
    FogGenerationTimer = FogTimer;

    if (!targetInstance || fogCount <= 0) {
        console.log("Invalid parameters for fog creation");
        return;
    }

    const centerX = targetInstance.x;
    const centerY = targetInstance.y;

    // Calculate angle step for equal distribution
    const angleStep = (2 * Math.PI) / fogCount;

    for (let i = 0; i < fogCount; i++) {
        const angle = i * angleStep;
        const fogX = centerX + Math.cos(angle) * radius;
        const fogY = centerY + Math.sin(angle) * radius;

        // Use the new function to create fog with debug elements
        const fogInstance = createFogInstanceWithDebug(targetInstance, fogX, fogY, false);

        console.log(`Created fog instance ${i + 1} at position (${fogX.toFixed(2)}, ${fogY.toFixed(2)}) with UID: ${fogInstance.uid}`);
    }

    console.log(`Successfully created ${fogCount} fog instances around target at (${centerX}, ${centerY})`);
}

/**
 * Create missing fog instances to maintain the maximum count
 * @param targetInstance - The target instance to surround with fog
 * @param missingCount - Number of fog instances to create
 * @param radius - Distance from the target instance
 */
function createMissingFogInstances(targetInstance: any, missingCount: number, radius: number): void {
    if (!targetInstance || missingCount <= 0) return;

    const centerX = targetInstance.x;
    const centerY = targetInstance.y;

    // Get current fog instances to avoid overlapping positions
    const currentFogInstances = hf_engine.
        runtime.objects.FogSprite.getAllInstances();

    for (let i = 0; i < missingCount; i++) {
        // Find a suitable position that doesn't overlap with existing fog
        let fogX, fogY;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loop

        do {
            // Generate random angle for new fog position
            const angle = Math.random() * 2 * Math.PI;
            // Add some randomness to radius to avoid perfect circles
            const randomRadius = radius + (Math.random() - 0.5) * 50;
            fogX = centerX + Math.cos(angle) * randomRadius;
            fogY = centerY + Math.sin(angle) * randomRadius;
            attempts++;

            // Check if position is too close to existing fog instances
            let tooClose = false;
            for (const existingFog of currentFogInstances) {
                const distance = Math.sqrt(
                    Math.pow(fogX - existingFog.x, 2) +
                    Math.pow(fogY - existingFog.y, 2)
                );
                if (distance < 30) { // Minimum distance between fog instances
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose || attempts >= maxAttempts) break;
        } while (attempts < maxAttempts);

        // Use the new function to create replacement fog with debug elements
        const fogInstance = createFogInstanceWithDebug(targetInstance, fogX, fogY, true);

        console.log(`Created replacement fog instance ${i + 1} at position (${fogX.toFixed(2)}, ${fogY.toFixed(2)}) with UID: ${fogInstance.uid}`);
    }

    console.log(`Successfully created ${missingCount} replacement fog instances`);
}

/**
 * Stop fog generation and fade out all existing fog instances
 * This stops the timer that creates new fog and starts fade-out for all existing fog
 * @param fadeOutTime - Time in seconds for fog to fade out (default: 1.5)
 * @returns true if successfully stopped, false if no timer was running
 */
export function stopFogGeneration(fadeOutTime: number = 1.5): boolean {
    // Stop the fog generation timer
    if (FogGenerationTimer) {
        try {
            // Stop the timer that checks and creates new fog
            if (FogGenerationTimer.behaviors && FogGenerationTimer.behaviors.Timer) {
                FogGenerationTimer.behaviors.Timer.stopTimer("fog_check_timer");
            }
            
            // Destroy the timer object
            FogGenerationTimer.destroy();
            
            // Reset the timer reference
            FogGenerationTimer = null;
            
            // 标记雾系统为非活动状态
            IsFogSystemActive = false;
            console.log("Fog system marked as inactive");
            
            // Temporarily set MaxFogCount to 0 to prevent new fog creation during this cycle
            // We don't permanently reset it to allow fog generation in future nights
            const originalMaxFogCount = MaxFogCount;
            MaxFogCount = 0;
            
            // Create a timer to restore MaxFogCount after all fog has faded out
            const restoreTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -300, -300, false);
            if (restoreTimer && restoreTimer.behaviors.Timer) {
                // Wait a bit longer than fadeOutTime to ensure all fog is gone
                restoreTimer.behaviors.Timer.startTimer(fadeOutTime + 1.0, "restore_fog_count", "once");
                restoreTimer.behaviors.Timer.addEventListener("timer", (e) => {
                    if (e.tag === "restore_fog_count") {
                        // Restore the original MaxFogCount value
                        MaxFogCount = originalMaxFogCount;
                        console.log(`Restored MaxFogCount to ${MaxFogCount} for future fog generation`);
                        restoreTimer.destroy();
                    }
                });
            }
            
            // Get all existing fog instances
            const fogInstances = hf_engine.runtime.objects.FogSprite.getAllInstances();
            console.log(`Starting fade-out for ${fogInstances.length} existing fog instances`);
            
            // Start fade-out for all existing fog instances
            fogInstances.forEach(fogInstance => {
                if (!FogInstancesFadingOut.has(fogInstance.uid)) {
                    // Mark this fog instance as fading out
                    FogInstancesFadingOut.add(fogInstance.uid);
                    
                    try {
                        const fadeBehavior = fogInstance.behaviors.Fade;
                        if (fadeBehavior) {
                            // Set fade-out parameters
                            fadeBehavior.fadeInTime = 0;      // No fade in
                            fadeBehavior.waitTime = 0;        // No wait time
                            fadeBehavior.fadeOutTime = fadeOutTime;   // Fade out time
                            
                            // Start the fade effect
                            fadeBehavior.startFade();
                            console.log(`Started fade-out for fog instance UID: ${fogInstance.uid}`);
                            
                            // Clean up debug elements immediately when fade starts
                            cleanupFogDebugElements(fogInstance.uid);
                            
                            // Set up a timer to destroy the fog instance after fade completes
                            const cleanupTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -200, -200, false);
                            
                            if (cleanupTimer && cleanupTimer.behaviors.Timer) {
                                cleanupTimer.behaviors.Timer.startTimer(fadeOutTime + 0.2, `cleanup_${fogInstance.uid}`, "once");
                                cleanupTimer.behaviors.Timer.addEventListener("timer", (e) => {
                                    if (e.tag === `cleanup_${fogInstance.uid}`) {
                                        // Remove from tracking set and destroy fog instance after fade completes
                                        FogInstancesFadingOut.delete(fogInstance.uid);
                                        try {
                                            // Check if the instance still exists and is valid before destroying
                                            if (fogInstance && typeof fogInstance.destroy === 'function') {
                                                fogInstance.destroy();
                                            } else {
                                                console.log(`Fog instance ${fogInstance.uid} already destroyed or invalid`);
                                            }
                                        } catch (err) {
                                            console.log(`Error destroying fog instance ${fogInstance.uid}: ${err}`);
                                        }
                                        // Destroy the cleanup timer
                                        cleanupTimer.destroy();
                                    }
                                });
                            }
                        } else {
                            // Fallback: if no Fade behavior, destroy directly
                            console.log(`No Fade behavior found for fog UID: ${fogInstance.uid}, destroying directly`);
                            cleanupFogDebugElements(fogInstance.uid);
                            fogInstance.destroy();
                            FogInstancesFadingOut.delete(fogInstance.uid);
                        }
                    } catch (error) {
                        console.log(`Failed to start fade-out for fog UID ${fogInstance.uid}: ${error}`);
                        // Fallback: destroy directly if fade fails
                        cleanupFogDebugElements(fogInstance.uid);
                        fogInstance.destroy();
                        FogInstancesFadingOut.delete(fogInstance.uid);
                    }
                }
            });
            
            console.log("Fog generation stopped and all fog instances are fading out.");
            return true;
        } catch (error) {
            console.log(`Failed to stop fog generation: ${error}`);
            return false;
        }
    } else {
        console.log("No active fog generation timer found.");
        
        // 标记雾系统为非活动状态
        IsFogSystemActive = false;
        
        // Even if no timer is running, try to fade out any existing fog
        const fogInstances = hf_engine.runtime.objects.FogSprite.getAllInstances();
        if (fogInstances.length > 0) {
            console.log(`No timer found but fading out ${fogInstances.length} existing fog instances`);
            
            // Use the same fade-out logic as above
            fogInstances.forEach(fogInstance => {
                if (!FogInstancesFadingOut.has(fogInstance.uid)) {
                    FogInstancesFadingOut.add(fogInstance.uid);
                    
                    try {
                        const fadeBehavior = fogInstance.behaviors.Fade;
                        if (fadeBehavior) {
                            fadeBehavior.fadeInTime = 0;
                            fadeBehavior.waitTime = 0;
                            fadeBehavior.fadeOutTime = fadeOutTime;
                            fadeBehavior.startFade();
                            
                            cleanupFogDebugElements(fogInstance.uid);
                            
                            const cleanupTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -200, -200, false);
                            if (cleanupTimer && cleanupTimer.behaviors.Timer) {
                                cleanupTimer.behaviors.Timer.startTimer(fadeOutTime + 0.2, `cleanup_${fogInstance.uid}`, "once");
                                cleanupTimer.behaviors.Timer.addEventListener("timer", (e) => {
                                    if (e.tag === `cleanup_${fogInstance.uid}`) {
                                        FogInstancesFadingOut.delete(fogInstance.uid);
                                        try {
                                            // Check if the instance still exists and is valid before destroying
                                            if (fogInstance && typeof fogInstance.destroy === 'function') {
                                                fogInstance.destroy();
                                            } else {
                                                console.log(`Fog instance ${fogInstance.uid} already destroyed or invalid`);
                                            }
                                        } catch (err) {
                                            console.log(`Error destroying fog instance ${fogInstance.uid}: ${err}`);
                                        }
                                        cleanupTimer.destroy();
                                    }
                                });
                            }
                        } else {
                            cleanupFogDebugElements(fogInstance.uid);
                            fogInstance.destroy();
                            FogInstancesFadingOut.delete(fogInstance.uid);
                        }
                    } catch (error) {
                        cleanupFogDebugElements(fogInstance.uid);
                        fogInstance.destroy();
                        FogInstancesFadingOut.delete(fogInstance.uid);
                    }
                }
            });
            
            return true;
        }
        
        return false;
    }
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

    const runtime = hf_engine.runtime;
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
                                        // 先清理debug元素，再销毁雾实例
                                        cleanupFogDebugElements(fogInstance.uid);
                                        fogInstance.destroy();
                                        console.log(`Deleted fog instance #${index + 1} with UID: ${fogInstance.uid}`);
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

    const runtime = hf_engine.runtime;
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


hf_engine.gl$_ubu_init(() => {

    // Start the ImGui fog distance monit

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
    
    IMGUIDebugButton.AddButtonToCategory(
        fogCategoryId,
        "Stop Fog Generation",
        () => {
            stopFogGeneration();
            console.log("Stopped fog generation, existing fog will dissipate naturally");
        },
        "Stop creating new fog instances but allow existing ones to dissipate naturally"
    );

    IMGUIDebugButton.AddColorButtonToCategory(
        fogCategoryId,
        "Clear All Fog",
        [1.0, 0.3, 0.3, 1.0], // Red color for destructive action
        () => {
            const runtime = hf_engine.runtime;
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
            const runtime = hf_engine.runtime;
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

    IMGUIDebugButton.AddButtonToCategory(
        fogCategoryId,
        "Clean Debug Elements",
        () => {
            // 清理所有debug元素
            FogDebugMap.forEach((debugElements, fogUID) => {
                try {
                    if (debugElements.boxKey) {
                        DebugObjectRenderer.Remove(debugElements.boxKey);
                    }
                    if (debugElements.lineKey) {
                        DebugObjectRenderer.removeDebugLine(debugElements.lineKey);
                    }
                } catch (error) {
                    console.log(`Failed to cleanup debug elements for fog UID ${fogUID}: ${error}`);
                }
            });
            FogDebugMap.clear();
            console.log("Cleaned up all fog debug elements");
        },
        "Clean up all debug boxes and lines for fog instances"
    );

    IMGUIDebugButton.AddButtonToCategory(
        fogCategoryId,
        "Show Debug Info",
        () => {
            console.log(`Total debug mappings: ${FogDebugMap.size}`);
            FogDebugMap.forEach((debugElements, fogUID) => {
                console.log(`Fog UID ${fogUID}: Box=${debugElements.boxKey}, Line=${debugElements.lineKey}`);
            });
        },
        "Show debug information about fog-debug element mappings"
    );

    console.log("Fog debug buttons added to debug panel");
})

