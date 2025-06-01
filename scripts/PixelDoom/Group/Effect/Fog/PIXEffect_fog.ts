import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";
import { Imgui_chunchun } from "../../../UI/imgui_lib/imgui.js";


// Static class for managing fog around instances
export class PIXFogManager {
    public static fogInstancesMap: Map<any, FogInstanceData[]> = new Map();
    public static fogTimers: Map<any, InstanceType.C3Ctimer> = new Map();
    public static fadingOutFogInstances: Set<any> = new Set(); // Track fading out fog instances
    // Store max fog count for each target for debug display
    public static targetMaxFogCounts: Map<any, number> = new Map();

    // Debug properties
    private static debugInfo: any = {};
    private static lastPlayerPosition: { x: number, y: number } | null = null;
    private static generationCallCount: number = 0;
    private static lastGenerationTime: number = 0;
    
    // Fog creation interceptor for debugging
    private static fogCreationCount: number = 0;
    private static isInterceptorInstalled: boolean = false;

    static InstallFogCreationInterceptor(): void {
        if (this.isInterceptorInstalled) return;
        
        try {
            const originalCreateInstance = (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite as any).createInstance;
            
            (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite as any).createInstance = function(...args: any[]): any {
                PIXFogManager.fogCreationCount++;
                const stackTrace = new Error().stack;
                
                console.error(`🚨 FOG CREATION INTERCEPTED #${PIXFogManager.fogCreationCount}`);
                console.error(`   Args: Layer="${args[0]}", X=${args[1]}, Y=${args[2]}`);
                console.error(`   Stack trace:`);
                console.error(stackTrace);
                console.error(`   ========================`);
                
                return originalCreateInstance.apply(this, args);
            };
            
            this.isInterceptorInstalled = true;
            console.log("🔍 Fog creation interceptor installed!");
            
        } catch (error: any) {
            console.error(`Failed to install fog creation interceptor: ${error.message}`);
        }
    }

    static GenerateFogAroundInstance(
        targetInstance: any,
        maxFogCount: number = 10,
        maxDistance: number = 500,
        checkInterval: number = 3,
        fadeInTime: number = 1.0,
        fadeOutTime: number = 0.8
    ): void {
        // Track generation calls
        this.generationCallCount++;
        this.lastGenerationTime = Date.now();
        
        console.warn(`GenerateFogAroundInstance called #${this.generationCallCount} at ${new Date().toLocaleTimeString()}`);
        
        if (!targetInstance || pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name !== "Level") {
            return;
        }

        // Check if fog system already exists for this target
        const existingFogInstances = this.fogInstancesMap.get(targetInstance);
        const existingTimer = this.fogTimers.get(targetInstance);
        
        if (existingFogInstances && existingTimer) {
            console.warn(`[FOG SYSTEM] Fog already initialized for this target. Updating parameters only.`);
            
            // Update max fog count
            this.targetMaxFogCounts.set(targetInstance, maxFogCount);
            
            // Enforce new limit immediately
            this.EnforceFogLimit(targetInstance, maxFogCount);
            
            console.log(`[FOG SYSTEM] Updated fog limit to ${maxFogCount} for existing system.`);
            return;
        }

        // Store max fog count for this target
        this.targetMaxFogCounts.set(targetInstance, maxFogCount);

        // Clean up existing fog for this target
        this.CleanupFogForTarget(targetInstance);
        console.log(`[FOG INIT] Cleaned up existing fog for target`);

        // Initialize fog array for this target
        this.fogInstancesMap.set(targetInstance, []);
        console.log(`[FOG INIT] Initialized empty fog array for target`);

        // Create initial fog instances
        console.log(`[FOG INIT] About to create ${maxFogCount} initial fog instances`);
        this.CreateInitialFogInstances(targetInstance, maxFogCount, maxDistance, fadeInTime, fadeOutTime);
        
        // Verify after creation
        const createdArray = this.fogInstancesMap.get(targetInstance);
        console.log(`[FOG INIT] After CreateInitialFogInstances - Array length: ${createdArray ? createdArray.length : 'NULL'}`);

        // Setup timer for distance checking and fog maintenance
        console.log(`[FOG INIT] Setting up maintenance timer with ${checkInterval}s interval`);
        this.SetupFogMaintenanceTimer(targetInstance, maxFogCount, maxDistance, checkInterval, fadeInTime, fadeOutTime);
        
        console.log(`[FOG INIT] ✅ Fog system initialization completed for target`);
    }

    private static CreateInitialFogInstances(
        targetInstance: any,
        maxFogCount: number,
        maxDistance: number,
        fadeInTime: number,
        fadeOutTime: number
    ): void {
        console.log(`[FOG INIT] Starting CreateInitialFogInstances with maxFogCount=${maxFogCount}`);
        
        const fogInstances = this.fogInstancesMap.get(targetInstance) || [];
        console.log(`[FOG INIT] Initial array length: ${fogInstances.length}`);

        for (let i = 0; i < maxFogCount; i++) {
            const fogPosition = this.GetUniformFogPosition(targetInstance, maxDistance, i, maxFogCount);
            const fogInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite.createInstance(
                "Fog",
                fogPosition.x,
                fogPosition.y
            );

            console.log(`[FOG INIT] Created fog instance ${i + 1}/${maxFogCount} at position (${fogPosition.x.toFixed(1)}, ${fogPosition.y.toFixed(1)})`);

            // Setup fade behavior for new fog instance
            this.SetupFogFadeIn(fogInstance, fadeInTime, fadeOutTime);

            fogInstances.push({
                instance: fogInstance,
                direction: this.GetDirectionForIndex(i, maxFogCount),
                fadeInTime: fadeInTime,
                fadeOutTime: fadeOutTime
            });
            
            console.log(`[FOG INIT] Added to array. Current array length: ${fogInstances.length}`);
        }

        // CRITICAL FIX: Update the map with the modified array
        this.fogInstancesMap.set(targetInstance, fogInstances);
        
        console.log(`[FOG INIT] Completed! Final array length: ${fogInstances.length}`);
        console.log(`[FOG INIT] Map contains ${this.fogInstancesMap.size} target(s)`);
        
        // Immediate verification
        const verifyArray = this.fogInstancesMap.get(targetInstance);
        console.log(`[FOG INIT] Verification - Retrieved array length: ${verifyArray ? verifyArray.length : 'NULL'}`);
    }

    private static SetupFogFadeIn(fogInstance: any, fadeInTime: number, fadeOutTime: number): void {
        if (fogInstance.behaviors && fogInstance.behaviors.Fade) {
            // Configure fade behavior
            fogInstance.behaviors.Fade.fadeInTime = fadeInTime;
            fogInstance.behaviors.Fade.fadeOutTime = fadeOutTime;
            fogInstance.behaviors.Fade.waitTime = 9999; // No wait time between fade in and out

            // Start with fade in effect
            fogInstance.behaviors.Fade.startFade();
        }
    }

    private static SetupFogMaintenanceTimer(
        targetInstance: any,
        maxFogCount: number,
        maxDistance: number,
        checkInterval: number,
        fadeInTime: number,
        fadeOutTime: number
    ): void {
        // Create timer for this specific target
        const timer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance(
            "Other",
            -200,
            -200
        );

        this.fogTimers.set(targetInstance, timer);

        const timerTag = `fogcheck_${Date.now()}`;

        timer.behaviors.Timer.startTimer(checkInterval, timerTag, "regular");
        timer.behaviors.Timer.addEventListener("timer", (e) => {
            if (e.tag === timerTag.toLowerCase()) {
                this.MaintainFogInstances(targetInstance, maxFogCount, maxDistance, fadeInTime, fadeOutTime);
            }
        });
    }

    private static MaintainFogInstances(
        targetInstance: any,
        maxFogCount: number,
        maxDistance: number,
        fadeInTime: number,
        fadeOutTime: number
    ): void {
        if (!targetInstance || pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name !== "Level") {
            return;
        }

        const fogInstances = this.fogInstancesMap.get(targetInstance);
        if (!fogInstances) return;

        // Clean up invalid instances first
        for (let i = fogInstances.length - 1; i >= 0; i--) {
            const fogData = fogInstances[i];
            if (!fogData.instance.isValid) {
                fogInstances.splice(i, 1);
                this.fadingOutFogInstances.delete(fogData.instance);
            }
        }

        // Check distances and start fade out for fog instances that are too far
        let fadedOutCount = 0;
        for (let i = fogInstances.length - 1; i >= 0; i--) {
            const fogData = fogInstances[i];
            const distance = this.GetDistance(targetInstance, fogData.instance);
            if (distance > maxDistance && !this.fadingOutFogInstances.has(fogData.instance)) {
                // Start fade out process
                this.StartFogFadeOut(fogData.instance, fogData, fogInstances, i);
                fadedOutCount++;
            }
        }

        // Count current active fog (excluding fading out instances)
        console.log(`[FOG DEBUG] Calculating active fog count...`);
        console.log(`[FOG DEBUG] Total instances in array: ${fogInstances.length}`);
        console.log(`[FOG DEBUG] Fading out instances count: ${this.fadingOutFogInstances.size}`);
        
        // Debug each instance
        fogInstances.forEach((fogData, index) => {
            const isValid = (fogData.instance as any)?.isValid !== false;
            const isFading = this.fadingOutFogInstances.has(fogData.instance);
            console.log(`[FOG DEBUG] [${index}] Valid: ${isValid}, Fading: ${isFading}, Include in active: ${!isFading && isValid}`);
        });
        
        const activeFogCount = fogInstances.filter(fogData => 
            !this.fadingOutFogInstances.has(fogData.instance) && (fogData.instance as any)?.isValid !== false
        ).length;
        
        console.log(`[FOG DEBUG] Final active fog count: ${activeFogCount}`);
        
        const neededCount = Math.max(0, maxFogCount - activeFogCount);
        console.log(`[FOG DEBUG] Needed count: ${neededCount} (max: ${maxFogCount} - active: ${activeFogCount})`);
        
        console.log(`[FOG DEBUG] Will create fog: ${activeFogCount < maxFogCount ? 'YES' : 'NO'}`);
        
        // Store debug info for monitoring
        this.debugInfo = {
            totalInArray: fogInstances.length,
            fadingOut: this.fadingOutFogInstances.size,
            activeFog: activeFogCount,
            maxFog: maxFogCount,
            neededCount: neededCount,
            fadedOutThisCycle: fadedOutCount,
            playerMoved: this.GetDistance(targetInstance, this.lastPlayerPosition || targetInstance) > 5
        };
        
        // Update last player position
        this.lastPlayerPosition = { x: targetInstance.x, y: targetInstance.y };

        // CRITICAL FIX: Simplified and safe fog creation logic
        if (activeFogCount < maxFogCount) {
            // Calculate how many we can safely create
            const maxToCreate = maxFogCount - activeFogCount;
            const safeCreateCount = Math.min(maxToCreate, 3); // Limit creation per cycle to 3
            
            console.log(`[FOG DEBUG] Creating fog: activeFog=${activeFogCount}, maxFog=${maxFogCount}, willCreate=${safeCreateCount}`);
            
            for (let i = 0; i < safeCreateCount; i++) {
                // Create fog instance
                const totalIndex = activeFogCount + i;
                const fogPosition = this.GetUniformFogPosition(targetInstance, maxDistance, totalIndex, maxFogCount);
                const fogInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite.createInstance(
                    "Fog",
                    fogPosition.x,
                    fogPosition.y
                );

                // Setup fade in for new fog instance
                this.SetupFogFadeIn(fogInstance, fadeInTime, fadeOutTime);

                // Add to array
                fogInstances.push({
                    instance: fogInstance,
                    direction: this.GetDirectionForIndex(totalIndex, maxFogCount),
                    fadeInTime: fadeInTime,
                    fadeOutTime: fadeOutTime
                });
            }
            
            // Final count after creation
            const finalActiveCount = fogInstances.filter(fogData => 
                !this.fadingOutFogInstances.has(fogData.instance) && fogData.instance.isValid
            ).length;
            
            console.log(`[FOG DEBUG] Creation complete. Final active count: ${finalActiveCount}/${maxFogCount}`);
            
            // Emergency safety check - if we somehow exceeded the limit, remove excess
            if (finalActiveCount > maxFogCount) {
                console.error(`[FOG ERROR] Exceeded limit! Active: ${finalActiveCount}, Max: ${maxFogCount}. Removing excess.`);
                
                // Remove excess fog instances (latest created first)
                const excessCount = finalActiveCount - maxFogCount;
                for (let i = 0; i < excessCount; i++) {
                    // Find the last non-fading instance and remove it
                    for (let j = fogInstances.length - 1; j >= 0; j--) {
                        const fogData = fogInstances[j];
                        if (!this.fadingOutFogInstances.has(fogData.instance) && fogData.instance.isValid) {
                            fogData.instance.destroy();
                            fogInstances.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        } else {
            console.log(`[FOG DEBUG] No fog creation needed. Active: ${activeFogCount}/${maxFogCount}`);
        }

        // CRITICAL FIX: Update the map with the modified array
        // This ensures all changes to the array are persisted
        this.fogInstancesMap.set(targetInstance, fogInstances);

        // FINAL SAFETY: Always enforce fog limit at the end of maintenance
        this.EnforceFogLimit(targetInstance, maxFogCount);
    }

    private static StartFogFadeOut(fogInstance: any, fogData: FogInstanceData, fogInstances: FogInstanceData[], index: number): void {
        this.fadingOutFogInstances.add(fogInstance);

        if (fogInstance.behaviors && fogInstance.behaviors.Fade) {
            // Configure fade out
            fogInstance.behaviors.Fade.fadeInTime = 0; // No fade in
            fogInstance.behaviors.Fade.fadeOutTime = fogData.fadeOutTime;
            fogInstance.behaviors.Fade.waitTime = 0;

            // Add event listener for fade out completion
            const fadeOutHandler = (e: any) => {
                if (e.instance === fogInstance) {
                    fogInstance.behaviors.Fade.removeEventListener("fadeoutend", fadeOutHandler);
                    fogInstance.destroy();
                    this.fadingOutFogInstances.delete(fogInstance);

                    // Remove from fog instances array
                    const currentIndex = fogInstances.findIndex(data => data.instance === fogInstance);
                    if (currentIndex !== -1) {
                        fogInstances.splice(currentIndex, 1);
                        
                        // CRITICAL FIX: Update the map after array modification
                        // Find the target instance that owns this fog array
                        for (const [target, instances] of this.fogInstancesMap) {
                            if (instances === fogInstances) {
                                this.fogInstancesMap.set(target, fogInstances);
                                break;
                            }
                        }
                    }
                }
            };

            fogInstance.behaviors.Fade.addEventListener("fadeoutend", fadeOutHandler);
            fogInstance.behaviors.Fade.restartFade(); // Start fade out
        } else {
            // Fallback if no fade behavior
            fogInstance.destroy();
            this.fadingOutFogInstances.delete(fogInstance);
            fogInstances.splice(index, 1);
        }
    }

    private static GetUniformFogPosition(targetInstance: any, maxDistance: number, index: number, totalCount: number): { x: number, y: number } {
        const direction = this.GetDirectionForIndex(index, totalCount);
        const angle = this.GetAngleForDirection(direction, index, totalCount);
        const distance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(maxDistance * 0.3, maxDistance);

        const x = targetInstance.x + Math.cos(angle) * distance;
        const y = targetInstance.y + Math.sin(angle) * distance;

        return { x, y };
    }

    private static GetDirectionForIndex(index: number, totalCount: number): FogDirection {
        const quadrantSize = Math.ceil(totalCount / 4);
        const quadrant = Math.floor(index / quadrantSize);

        switch (quadrant) {
            case 0: return FogDirection.RIGHT;
            case 1: return FogDirection.DOWN;
            case 2: return FogDirection.LEFT;
            default: return FogDirection.UP;
        }
    }

    private static GetAngleForDirection(direction: FogDirection, index: number, totalCount: number): number {
        const quadrantSize = Math.ceil(totalCount / 4);
        const indexInQuadrant = index % quadrantSize;
        const angleRange = Math.PI / 2; // 90 degrees per quadrant
        const baseAngle = direction * (Math.PI / 2);
        const randomOffset = (angleRange / quadrantSize) * indexInQuadrant +
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-0.2, 0.2);

        return baseAngle + randomOffset;
    }

    private static GetDistance(instance1: any, instance2: any): number {
        const dx = instance1.x - instance2.x;
        const dy = instance1.y - instance2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static CleanupFogForTarget(targetInstance: any): void {
        const fogInstances = this.fogInstancesMap.get(targetInstance);
        if (fogInstances) {
            fogInstances.forEach(fogData => {
                if (fogData.instance.isValid) {
                    this.fadingOutFogInstances.delete(fogData.instance);
                    fogData.instance.destroy();
                }
            });
            this.fogInstancesMap.delete(targetInstance);
        }

        const timer = this.fogTimers.get(targetInstance);
        if (timer) {
            timer.destroy();
            this.fogTimers.delete(targetInstance);
        }

        // Clean up max fog count record
        this.targetMaxFogCounts.delete(targetInstance);
    }

    static CleanupAllFog(): void {
        this.fogInstancesMap.forEach((fogInstances, targetInstance) => {
            this.CleanupFogForTarget(targetInstance);
        });
        this.fogInstancesMap.clear();
        this.fogTimers.clear();
        this.fadingOutFogInstances.clear();
        this.targetMaxFogCounts.clear();
    }

    // Public method to get real-time debug information
    static GetRealTimeDebugInfo(): any {
        if (!this.fogInstancesMap || this.fogInstancesMap.size === 0) {
            return {
                totalInArray: 0,
                fadingOut: 0,
                activeFog: 0,
                maxFog: 0,
                neededCount: 0,
                fadedOutThisCycle: 0,
                playerMoved: false,
                systemStatus: "No fog system active"
            };
        }
        
        // Calculate real-time statistics
        let totalInArray = 0;
        let activeFog = 0;
        let maxFog = 0;
        
        // Iterate through all target instances
        for (const [targetInstance, instances] of this.fogInstancesMap) {
            if (instances && Array.isArray(instances)) {
                totalInArray += instances.length;
                
                // Count active (non-fading) fog instances
                const activeInstances = instances.filter(fogData => 
                    !this.fadingOutFogInstances.has(fogData.instance) && fogData.instance.isValid
                );
                activeFog += activeInstances.length;
                
                // Get actual max fog count for this target
                const targetMaxFog = this.targetMaxFogCounts.get(targetInstance) || 0;
                maxFog += targetMaxFog;
            }
        }
        
        const fadingOut = this.fadingOutFogInstances.size;
        const neededCount = Math.max(0, maxFog - activeFog);
        
        // Try to get additional info from stored debug info if available
        const storedDebugInfo = this.debugInfo;
        
        return {
            totalInArray: totalInArray,
            fadingOut: fadingOut,
            activeFog: activeFog,
            maxFog: maxFog,
            neededCount: neededCount,
            fadedOutThisCycle: storedDebugInfo?.fadedOutThisCycle || 0,
            playerMoved: storedDebugInfo?.playerMoved || false,
            systemStatus: "Active",
            realTimeUpdate: true,
            targetInstancesCount: this.fogInstancesMap.size,
            timersCount: this.fogTimers.size
        };
    }

    // Add emergency fog count enforcement
    private static EnforceFogLimit(targetInstance: any, maxFogCount: number): void {
        const fogInstances = this.fogInstancesMap.get(targetInstance);
        if (!fogInstances) return;

        // Count all valid active fog instances (excluding fading)
        const activeFogInstances = fogInstances.filter(fogData => 
            !this.fadingOutFogInstances.has(fogData.instance) && 
            fogData.instance.isValid
        );

        if (activeFogInstances.length > maxFogCount) {
            const excessCount = activeFogInstances.length - maxFogCount;
            console.error(`[FOG ENFORCEMENT] Found ${excessCount} excess fog instances. Removing immediately.`);
            
            // Remove excess instances from the end (most recently created)
            for (let i = 0; i < excessCount; i++) {
                const excessInstance = activeFogInstances[activeFogInstances.length - 1 - i];
                
                // Remove from array
                const arrayIndex = fogInstances.indexOf(excessInstance);
                if (arrayIndex !== -1) {
                    fogInstances.splice(arrayIndex, 1);
                }
                
                // Destroy the instance
                if (excessInstance.instance.isValid) {
                    excessInstance.instance.destroy();
                }
            }
            
            console.log(`[FOG ENFORCEMENT] Removed ${excessCount} excess fog instances. Current active: ${maxFogCount}`);
        }
        
        // CRITICAL FIX: Always update the map after any array modifications
        this.fogInstancesMap.set(targetInstance, fogInstances);
    }

    // Detailed fog analysis for debugging
    static AnalyzeFogSystem(): void {
        console.log("=== COMPREHENSIVE FOG SYSTEM ANALYSIS ===");
        
        try {
            // Get all FogSprite instances in the scene
            const allFogSprites = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite.getAllInstances();
            console.log(`🔍 Total FogSprite instances in scene: ${allFogSprites.length}`);
            
            // Analyze managed fog instances
            let totalManagedFog = 0;
            let totalActiveManagedFog = 0;
            const managedInstances = new Set();
            
            console.log(`📊 Managed fog targets: ${this.fogInstancesMap.size}`);
            
            for (const [target, fogDataArray] of this.fogInstancesMap) {
                console.log(`\n🎯 Target: ${target?.objectType?.name || 'Unknown'}`);
                console.log(`   Array length: ${fogDataArray.length}`);
                
                let targetActiveFog = 0;
                let targetFadingFog = 0;
                let targetInvalidFog = 0;
                
                fogDataArray.forEach((fogData, index) => {
                    managedInstances.add(fogData.instance);
                    
                    if (!fogData.instance.isValid) {
                        targetInvalidFog++;
                    } else if (this.fadingOutFogInstances.has(fogData.instance)) {
                        targetFadingFog++;
                    } else {
                        targetActiveFog++;
                    }
                    
                    // Log first few instances for detailed inspection
                    if (index < 3) {
                        console.log(`   [${index}] Valid: ${fogData.instance.isValid}, Fading: ${this.fadingOutFogInstances.has(fogData.instance)}`);
                    }
                });
                
                console.log(`   Active: ${targetActiveFog}, Fading: ${targetFadingFog}, Invalid: ${targetInvalidFog}`);
                console.log(`   Max allowed: ${this.targetMaxFogCounts.get(target) || 'Not set'}`);
                
                totalManagedFog += fogDataArray.length;
                totalActiveManagedFog += targetActiveFog;
            }
            
            // Include fading instances in managed count
            this.fadingOutFogInstances.forEach(instance => {
                managedInstances.add(instance);
            });
            
            console.log(`\n📈 Summary:`);
            console.log(`   Total managed fog in arrays: ${totalManagedFog}`);
            console.log(`   Total active managed fog: ${totalActiveManagedFog}`);
            console.log(`   Total fading fog: ${this.fadingOutFogInstances.size}`);
            console.log(`   Total managed instances (including fading): ${managedInstances.size}`);
            
            // Find unmanaged fog instances
            const unmanagedFog = allFogSprites.filter(fogSprite => !managedInstances.has(fogSprite));
            console.log(`\n🚨 Unmanaged fog instances: ${unmanagedFog.length}`);
            
            if (unmanagedFog.length > 0) {
                console.log("   ⚠️  These fog instances exist but are not managed by PIXFogManager:");
                unmanagedFog.slice(0, 5).forEach((fog, index) => {
                    console.log(`   [${index}] Position: (${fog.x.toFixed(1)}, ${fog.y.toFixed(1)}), Valid: ${(fog as any).isValid !== false}`);
                });
                if (unmanagedFog.length > 5) {
                    console.log(`   ... and ${unmanagedFog.length - 5} more`);
                }
            }
            
            // System state
            console.log(`\n⚙️  System State:`);
            console.log(`   Generation calls: ${this.generationCallCount}`);
            console.log(`   Active timers: ${this.fogTimers.size}`);
            console.log(`   Targets with max counts: ${this.targetMaxFogCounts.size}`);
            
            // Check for potential problems
            console.log(`\n🔧 Problem Detection:`);
            if (unmanagedFog.length > 0) {
                console.error(`   ❌ Found ${unmanagedFog.length} unmanaged fog instances!`);
            }
            if (totalManagedFog !== managedInstances.size) {
                console.error(`   ❌ Array count (${totalManagedFog}) doesn't match managed instances (${managedInstances.size})!`);
            }
            if (this.generationCallCount > 1) {
                console.warn(`   ⚠️  GenerateFogAroundInstance called ${this.generationCallCount} times - possible reinitialization`);
            }
            
            console.log("=== END FOG ANALYSIS ===\n");
            
        } catch (error: any) {
            console.error(`Failed to analyze fog system: ${error.message}`);
        }
    }
}

// Helper interface and enum for fog management
interface FogInstanceData {
    instance: any;
    direction: FogDirection;
    fadeInTime: number;
    fadeOutTime: number;
}

enum FogDirection {
    RIGHT = 0,
    DOWN = 1,
    LEFT = 2,
    UP = 3
}

// Export the main function for external use
export function GenerateFogAroundInstance(
    targetInstance: any,
    maxFogCount: number = 10,
    maxDistance: number = 500,
    checkInterval: number = 3,
    fadeInTime: number = 1.0,
    fadeOutTime: number = 0.8
): void {
    PIXFogManager.GenerateFogAroundInstance(targetInstance, maxFogCount, maxDistance, checkInterval, fadeInTime, fadeOutTime);
}

//=============================================================================
// IMGUI DEBUG PANEL INITIALIZATION
//=============================================================================

var isFogDebugPanelInitialized = false;

// Debug window state
var showFogDebugWindow = false;
var fogDebugUpdateTimer: InstanceType.C3Ctimer | null = null;
var fogDebugWindowId = "fog_debug_monitor_window";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (isFogDebugPanelInitialized) return;
    isFogDebugPanelInitialized = true;

    // Create fog system debug category
    var fogSystemCategory = IMGUIDebugButton.AddCategory("fog_system");

    // Debug info display button - now toggles ImGui window
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Toggle Fog Debug Window", () => {
        showFogDebugWindow = !showFogDebugWindow;
        
        if (showFogDebugWindow) {
            console.log("Fog debug window opened");
            createFogDebugWindow();
            startFogDebugWindowUpdates();
        } else {
            console.log("Fog debug window closed");
            closeFogDebugWindow();
            stopFogDebugWindowUpdates();
        }
    });

    // Add button to count all fog sprites in scene
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Count All Scene Fog Sprites", () => {
        try {
            const fogSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite;
            const allFogInstances = fogSpriteClass.getAllInstances();
            const managedFogCount = PIXFogManager.GetRealTimeDebugInfo().totalInArray;
            const generationCalls = (PIXFogManager as any).generationCallCount || 0;
            
            console.log("=== FOG SPRITE ANALYSIS ===");
            console.log(`Total FogSprite instances in scene: ${allFogInstances.length}`);
            console.log(`Managed by PIXFogManager: ${managedFogCount}`);
            console.log(`Unmanaged fog sprites: ${allFogInstances.length - managedFogCount}`);
            console.log(`GenerateFogAroundInstance call count: ${generationCalls}`);
            
            if (allFogInstances.length > managedFogCount) {
                console.warn(`🚨 PROBLEM DETECTED: ${allFogInstances.length - managedFogCount} fog sprites are not managed by the system!`);
                console.warn("This suggests fog sprites are being created outside of PIXFogManager");
            }
            
            if (generationCalls > 1) {
                console.warn(`⚠️ GenerateFogAroundInstance has been called ${generationCalls} times - this may be causing resets`);
            }
            
        } catch (error: any) {
            console.error(`Failed to count fog sprites: ${error.message}`);
        }
    });

    // Add comprehensive fog analysis button
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "🔍 Comprehensive Fog Analysis", () => {
        PIXFogManager.AnalyzeFogSystem();
    });

    // Add fog creation interceptor button
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "🚨 Install Fog Creation Interceptor", () => {
        PIXFogManager.InstallFogCreationInterceptor();
    });

    // Add detailed array state inspection
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "🔍 Inspect Array State", () => {
        try {
            var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            if (!PlayerInstance) {
                console.error("Player instance not found!");
                return;
            }

            console.log("=== DETAILED ARRAY STATE INSPECTION ===");
            
            const fogArray = PIXFogManager.fogInstancesMap.get(PlayerInstance);
            const maxFogCount = PIXFogManager.targetMaxFogCounts.get(PlayerInstance);
            
            console.log(`🎯 Target: ${PlayerInstance?.objectType?.name || 'Unknown'}`);
            console.log(`📊 Max fog count setting: ${maxFogCount || 'Not set'}`);
            console.log(`📦 Array exists: ${!!fogArray}`);
            console.log(`📦 Array length: ${fogArray ? fogArray.length : 'N/A'}`);
            
            if (fogArray) {
                console.log(`\n🔍 Array contents inspection:`);
                fogArray.forEach((fogData, index) => {
                    const instance = fogData.instance;
                    const isValid = (instance as any)?.isValid !== false;
                    const isFading = PIXFogManager.fadingOutFogInstances.has(instance);
                    
                    console.log(`[${index}] Valid: ${isValid}, Fading: ${isFading}, Position: (${instance?.x?.toFixed(1) || 'N/A'}, ${instance?.y?.toFixed(1) || 'N/A'})`);
                });
                
                // Count different types
                const validInstances = fogArray.filter(fogData => (fogData.instance as any)?.isValid !== false);
                const fadingInstances = fogArray.filter(fogData => PIXFogManager.fadingOutFogInstances.has(fogData.instance));
                const activeInstances = validInstances.filter(fogData => !PIXFogManager.fadingOutFogInstances.has(fogData.instance));
                
                console.log(`\n📈 Counts:`);
                console.log(`   Total in array: ${fogArray.length}`);
                console.log(`   Valid instances: ${validInstances.length}`);
                console.log(`   Fading instances: ${fadingInstances.length}`);
                console.log(`   Active instances: ${activeInstances.length}`);
                
                // Check if active count matches what's reported
                const reportedDebugInfo = PIXFogManager.GetRealTimeDebugInfo();
                console.log(`\n🔄 Comparison with reported data:`);
                console.log(`   Reported active fog: ${reportedDebugInfo.activeFog}`);
                console.log(`   Calculated active fog: ${activeInstances.length}`);
                console.log(`   Match: ${reportedDebugInfo.activeFog === activeInstances.length ? '✅' : '❌'}`);
            }
            
            // Check scene fog count
            const allSceneFog = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite.getAllInstances();
            console.log(`\n🌍 Scene fog instances: ${allSceneFog.length}`);
            
            console.log("=== END ARRAY INSPECTION ===\n");
            
        } catch (error: any) {
            console.error(`Failed to inspect array state: ${error.message}`);
        }
    });

    // Add button to clean up all unmanaged fog sprites
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Clean All Unmanaged Fog Sprites", () => {
        try {
            const fogSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.FogSprite;
            const allFogInstances = fogSpriteClass.getAllInstances();
            
            // Get all managed fog instances
            const managedFogInstances = new Set();
            PIXFogManager.fogInstancesMap.forEach((fogDataArray, target) => {
                fogDataArray.forEach(fogData => {
                    managedFogInstances.add(fogData.instance);
                });
            });
            
            // Also include fading out instances as managed
            PIXFogManager.fadingOutFogInstances.forEach(instance => {
                managedFogInstances.add(instance);
            });
            
            // Find and destroy unmanaged fog sprites
            let destroyedCount = 0;
            allFogInstances.forEach(fogInstance => {
                if (!managedFogInstances.has(fogInstance)) {
                    try {
                        if (fogInstance && (fogInstance as any).isValid !== false) {
                            fogInstance.destroy();
                            destroyedCount++;
                        }
                    } catch (error: any) {
                        console.warn(`Failed to destroy unmanaged fog instance: ${error.message}`);
                    }
                }
            });
            
            console.log(`🧹 CLEANUP COMPLETE: Destroyed ${destroyedCount} unmanaged fog sprites`);
            console.log(`Remaining managed fog sprites: ${managedFogInstances.size}`);
            
        } catch (error: any) {
            console.error(`Failed to clean unmanaged fog sprites: ${error.message}`);
        }
    });

    // Add button to manually enforce fog limits
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Force Fog Limit Enforcement", () => {
        try {
            var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            if (!PlayerInstance) {
                console.error("Player instance not found!");
                return;
            }

            const maxFog = PIXFogManager.targetMaxFogCounts.get(PlayerInstance) || 30;
            const beforeDebugInfo = PIXFogManager.GetRealTimeDebugInfo();
            
            console.log(`[MANUAL ENFORCEMENT] Before: Active=${beforeDebugInfo.activeFog}, Total=${beforeDebugInfo.totalInArray}, Max=${maxFog}`);
            
            // Force enforcement
            (PIXFogManager as any).EnforceFogLimit(PlayerInstance, maxFog);
            
            const afterDebugInfo = PIXFogManager.GetRealTimeDebugInfo();
            console.log(`[MANUAL ENFORCEMENT] After: Active=${afterDebugInfo.activeFog}, Total=${afterDebugInfo.totalInArray}, Max=${maxFog}`);
            
        } catch (error: any) {
            console.error(`Failed to enforce fog limits: ${error.message}`);
        }
    });

    // Test fog generation around player
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Generate Test Fog (10 units)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.GenerateFogAroundInstance(PlayerInstance, 10, 600, 2, 1.0, 0.8);
        console.log("Generated test fog around player (10 units, 600 distance)");
    });

    // Test fog generation with custom parameters
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Generate Heavy Fog (30 units)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.GenerateFogAroundInstance(PlayerInstance, 30, 1200, 2, 1.5, 1.0);
        console.log("Generated heavy fog around player (30 units, 1200 distance)");
    });

    // Test short range fog
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Generate Close Fog (15 units)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.GenerateFogAroundInstance(PlayerInstance, 15, 400, 1, 0.8, 0.5);
        console.log("Generated close-range fog around player (15 units, 400 distance)");
    });

    // Cleanup functions
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Clear Player Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.CleanupFogForTarget(PlayerInstance);
        console.log("Cleared fog for player");
    });

    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Clear All Fog", () => {
        PIXFogManager.CleanupAllFog();
        console.log("Cleared all fog instances");
    });

    // Real-time monitoring button
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Start Real-time Monitor", () => {
        const monitorFunction = () => {
            const debugInfo = GetFogDebugInfo();
            if (debugInfo) {
                console.log(`[FOG MONITOR] Active: ${debugInfo.activeFog}/${debugInfo.maxFog}, Fading: ${debugInfo.fadingOut}, Player Moved: ${debugInfo.playerMoved ? 'YES' : 'NO'}`);
            }
            
            // Continue monitoring using C3 timer
            try {
                const monitorTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
                const monitorTag = `fog_monitor_${Date.now()}`;
                
                monitorTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                    if (e.tag === monitorTag) {
                        monitorFunction();
                        monitorTimer.destroy();
                    }
                });
                
                monitorTimer.behaviors.Timer.startTimer(2, monitorTag, "once");
            } catch (error: any) {
                console.error(`Monitor timer failed: ${error.message}`);
            }
        };
        
        console.log("Started real-time fog monitoring (check console every 2 seconds)");
        monitorFunction();
    });

    // Fog parameter testing
    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Test Fast Fade (0.3s)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.GenerateFogAroundInstance(PlayerInstance, 5, 300, 1, 0.3, 0.3);
        console.log("Generated fast-fade fog for testing (0.3s fade times)");
    });

    IMGUIDebugButton.AddButtonToCategory(fogSystemCategory, "Test Slow Fade (3s)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) {
            console.error("Player not found!");
            return;
        }
        PIXFogManager.GenerateFogAroundInstance(PlayerInstance, 5, 300, 1, 3.0, 3.0);
        console.log("Generated slow-fade fog for testing (3s fade times)");
    });

    console.log("Fog system debug panel initialized");
});

export function GetFogDebugInfo(): any {
    // Use the new public method to get real-time debug information
    return PIXFogManager.GetRealTimeDebugInfo();
}

// Debug window update functions
function startFogDebugWindowUpdates(): void {
    if (fogDebugUpdateTimer) return; // Already running
    
    fogDebugUpdateTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
    const updateTag = "fog_debug_update";
    
    fogDebugUpdateTimer.behaviors.Timer.startTimer(0.1, updateTag, "regular"); // Update every 0.1 seconds
    fogDebugUpdateTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
        if (e.tag === updateTag && showFogDebugWindow) {
            updateFogDebugWindowContent();
        } else if (!showFogDebugWindow) {
            stopFogDebugWindowUpdates();
        }
    });
}

function stopFogDebugWindowUpdates(): void {
    if (fogDebugUpdateTimer) {
        fogDebugUpdateTimer.destroy();
        fogDebugUpdateTimer = null;
    }
}

function createFogDebugWindow(): void {
    try {
        // Create window using Imgui_chunchun system
        Imgui_chunchun.CreateTextWindow(
            fogDebugWindowId,
            "fog_debug_layer",
            "Initializing fog debug monitor...",
            { x: 400, y: 100 }
        );

        // Configure window properties
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(fogDebugWindowId);
            if (windowConfig) {
                windowConfig.size = { width: 350, height: 400 };
                windowConfig.isOpen = true;
                windowConfig.renderCallback = () => {
                    renderFogDebugWindowContent();
                };
            }
        }

        console.log("Fog debug window created successfully");
    } catch (error: any) {
        console.error(`Failed to create fog debug window: ${error.message}`);
    }
}

function closeFogDebugWindow(): void {
    try {
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(fogDebugWindowId);
            if (windowConfig) {
                windowConfig.isOpen = false;
            }
        }

        // Alternative: try to remove the window entirely
        if (imgui.windows && imgui.windows.delete) {
            imgui.windows.delete(fogDebugWindowId);
        }

        console.log("Fog debug window closed");
    } catch (error: any) {
        console.error(`Failed to close fog debug window: ${error.message}`);
    }
}

function updateFogDebugWindowContent(): void {
    try {
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(fogDebugWindowId);
            if (windowConfig) {
                // Update window content with current debug info
                const debugInfo = GetFogDebugInfo();
                if (debugInfo) {
                    const content = generateDebugContent(debugInfo);
                    windowConfig.content = content;
                }
            }
        }
    } catch (error: any) {
        console.error(`Failed to update fog debug window: ${error.message}`);
    }
}

function generateDebugContent(debugInfo: any): string {
    let content = "=== FOG SYSTEM DEBUG MONITOR ===\n\n";
    
    content += "▓▓▓ Fog Count Analysis ▓▓▓\n";
    content += `Total in Array: ${debugInfo.totalInArray}\n`;
    content += `Currently Fading Out: ${debugInfo.fadingOut}\n`;
    content += `Active Fog Count: ${debugInfo.activeFog}\n`;
    content += `Max Fog Limit: ${debugInfo.maxFog}\n`;
    content += `Needed Count: ${debugInfo.neededCount}\n\n`;
    
    content += "▓▓▓ This Cycle ▓▓▓\n";
    content += `Faded Out This Cycle: ${debugInfo.fadedOutThisCycle}\n`;
    content += `Player Moved: ${debugInfo.playerMoved ? 'YES' : 'NO'}\n\n`;
    
    content += "▓▓▓ Status Warnings ▓▓▓\n";
    
    if (debugInfo.neededCount > 0 && !debugInfo.playerMoved && debugInfo.fadedOutThisCycle === 0) {
        content += "⚠️ WARNING: Creating fog without movement!\n";
    } else {
        content += "✅ Status: Normal\n";
    }
    
    if (debugInfo.activeFog > debugInfo.maxFog) {
        content += "❌ ERROR: Fog count exceeds limit!\n";
    }
    
    content += "\n▓▓▓ Progress ▓▓▓\n";
    const fogRatio = debugInfo.maxFog > 0 ? debugInfo.activeFog / debugInfo.maxFog : 0;
    const progressBars = Math.floor(fogRatio * 20);
    const progressBar = "█".repeat(progressBars) + "░".repeat(20 - progressBars);
    content += `[${progressBar}] ${(fogRatio * 100).toFixed(1)}%\n`;
    content += `${debugInfo.activeFog}/${debugInfo.maxFog} fog instances\n\n`;
    
    content += "Press 'Toggle Fog Debug Window' button to close\n";
    content += `Last Update: ${new Date().toLocaleTimeString()}`;
    
    return content;
}

function renderFogDebugWindowContent(): void {
    const ImGui = (globalThis as any).ImGui;
    if (!ImGui) return;
    
    try {
        const debugInfo = GetFogDebugInfo();
        
        if (debugInfo) {
            // Main stats section
            ImGui.TextColored(new ImGui.ImVec4(0.2, 0.8, 1.0, 1.0), "=== Fog Count Analysis ===");
            ImGui.Text(`Total in Array: ${debugInfo.totalInArray}`);
            ImGui.Text(`Currently Fading Out: ${debugInfo.fadingOut}`);
            ImGui.Text(`Active Fog Count: ${debugInfo.activeFog}`);
            ImGui.Text(`Max Fog Limit: ${debugInfo.maxFog}`);
            ImGui.Text(`Needed Count: ${debugInfo.neededCount}`);
            
            ImGui.Separator();
            
            // This cycle section
            ImGui.TextColored(new ImGui.ImVec4(0.2, 1.0, 0.8, 1.0), "=== This Cycle ===");
            ImGui.Text(`Faded Out This Cycle: ${debugInfo.fadedOutThisCycle}`);
            
            // Player movement status with color
            if (debugInfo.playerMoved) {
                ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0), "Player Moved: YES");
            } else {
                ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0), "Player Moved: NO");
            }
            
            ImGui.Separator();
            
            // Warning section
            ImGui.TextColored(new ImGui.ImVec4(1.0, 0.8, 0.2, 1.0), "=== Status Warnings ===");
            
            if (debugInfo.neededCount > 0 && !debugInfo.playerMoved && debugInfo.fadedOutThisCycle === 0) {
                ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "WARNING: Creating fog without movement!");
            } else {
                ImGui.TextColored(new ImGui.ImVec4(0.0, 1.0, 0.0, 1.0), "Status: Normal");
            }
            
            if (debugInfo.activeFog > debugInfo.maxFog) {
                ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "ERROR: Fog count exceeds limit!");
            }
            
            ImGui.Separator();
            
            // Progress bar for fog count
            const fogRatio = debugInfo.maxFog > 0 ? debugInfo.activeFog / debugInfo.maxFog : 0;
            ImGui.ProgressBar(fogRatio, new ImGui.ImVec2(-1, 0), `${debugInfo.activeFog}/${debugInfo.maxFog}`);
            
            // Close button
            if (ImGui.Button("Close Debug Window")) {
                showFogDebugWindow = false;
                closeFogDebugWindow();
                stopFogDebugWindowUpdates();
            }
            
        } else {
            ImGui.TextColored(new ImGui.ImVec4(1.0, 0.5, 0.0, 1.0), "No debug info available");
            ImGui.Text("Fog system not running");
            
            if (ImGui.Button("Close")) {
                showFogDebugWindow = false;
                closeFogDebugWindow();
                stopFogDebugWindowUpdates();
            }
        }
        
    } catch (error: any) {
        console.error(`Error rendering fog debug window: ${error.message}`);
    }
}

function renderFogDebugWindow(): void {
    // This function is now replaced by the Imgui_chunchun system
    // Keep it for compatibility but it should not be called
    console.warn("renderFogDebugWindow called - this should use the new system");
}

