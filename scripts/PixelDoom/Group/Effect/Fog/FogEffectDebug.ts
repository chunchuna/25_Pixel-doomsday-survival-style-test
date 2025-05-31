import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";
import { FogStyle, FogType, PIXEffect_fog } from "./PIXEffect_fog.js";

var isBindButtonIntoDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    
    // Single unified fog category
    var fog_category = IMGUIDebugButton.AddCategory("Fog");

    // === TOP PRIORITY: Window/Editor Triggering Buttons (Yellow Highlight) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Fog Property Editor", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            PIXEffect_fog.OpenFogEditor(fogInfo.fogs[0]);
        } else {
            var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            const x = PlayerInstance ? PlayerInstance.x : 400;
            const y = PlayerInstance ? PlayerInstance.y : 300;

            const testFog = PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "editor_test_fog")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300);

            PIXEffect_fog.OpenFogEditor("editor_test_fog");
        }
    }, "#FFD700");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Performance Monitor", () => {
        PIXEffect_fog.OpenPerformanceMonitor();
    }, "#FFD700");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "ImGui Fog Debug Window", () => {
        PIXEffect_fog.CreateImGuiFogDebugWindow();
    }, "#FFD700");

    // === FOG GENERATION BUTTONS (Default Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Whole Level Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.LEVEL, 0, "whole_level_fog")
            .setPosition(0, 0)
            .setSize(6000, 3000);

        PIXEffect_fog.OpenFogEditor("whole_level_fog");
        PIXEffect_fog.OpenPerformanceMonitor();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Optimized Large Fog", () => {
        const optimizedFog = PIXEffect_fog.GenerateLargeScaleFog(
            FogType.TEMPORARY,
            FogStyle.MYSTICAL,
            60,
            1920,
            1080,
            "optimized_large_fog"
        ).setLayer("HtmlUI_fix")
            .setOpacity(0.4)
            .setSpeed(0.6);

        PIXEffect_fog.OpenFogEditor("optimized_large_fog");

        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("=== Optimized Large Fog Performance ===");
            console.log(`Particles created: ${optimizedFog.getParticleCount()}`);
            console.log(`LOD Level: ${optimizedFog.getLODLevel()}`);
            console.log("Global stats:", stats);
        }, 500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Light Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 10)
            .setPosition(PlayerInstance.x - 200, PlayerInstance.y - 200)
            .setSize(400, 300)
            .setScale(1.2)
            .setSpeed(0.8)
            .setOpacity(0.4);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Heavy Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 15)
            .setPosition(PlayerInstance.x - 300, PlayerInstance.y - 250)
            .setSize(600, 500)
            .setScale(2.5)
            .setSpeed(0.6)
            .setOpacity(0.8)
            .setDensity(1.8);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Mystical Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 12)
            .setPosition(PlayerInstance.x - 250, PlayerInstance.y - 200)
            .setSize(500, 400)
            .setScale(1.8)
            .setSpeed(0.4)
            .setOpacity(0.7)
            .setColor("#9c27b0")
            .setLayers(4);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Toxic Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.TOXIC, 8)
            .setPosition(PlayerInstance.x - 150, PlayerInstance.y - 150)
            .setSize(300, 300)
            .setScale(1.6)
            .setSpeed(0.3)
            .setOpacity(0.9)
            .setColor("#4caf50")
            .setDensity(1.5);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Persistent Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "persistent_fog_1")
            .setPosition(PlayerInstance.x - 400, PlayerInstance.y - 300)
            .setSize(800, 600)
            .setScale(1.5)
            .setSpeed(1.0)
            .setOpacity(0.6);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Screen Fog", () => {
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 25)
            .setPosition(0, 0)
            .setSize(1920, 1080)
            .setScale(3.0)
            .setSpeed(0.5)
            .setOpacity(0.4)
            .setColor("#ffffff")
            .setDensity(0.8);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Generate Moving Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 30)
            .setPosition(PlayerInstance.x - 500, PlayerInstance.y - 300)
            .setSize(1000, 600)
            .setScale(1.0)
            .setSpeed(3.0)
            .setOpacity(0.3)
            .setColor("#87ceeb")
            .setDensity(0.6);
    });

    // === DESTRUCTION BUTTONS (Red Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Destroy All Fog", () => {
        PIXEffect_fog.DestroyAllFog();
    }, "#FF6B6B");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "EMERGENCY FOG CLEANUP", () => {
        PIXEffect_fog.EmergencyDestroyAllFog();
    }, "#FF4444");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Destroy All Fog Gracefully", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        console.log(`Gracefully destroying ${fogInfo.count} fog effects...`);

        fogInfo.fogs.forEach(fogId => {
            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
        });
    }, "#FF6B6B");

    // === INFORMATION BUTTONS (Blue Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Show Fog Info", () => {
        const info = PIXEffect_fog.GetFogInfo();
        console.log(`Active fog effects: ${info.count}`);
        console.log(`Fog IDs: ${info.fogs.join(", ")}`);

        info.fogs.forEach(fogId => {
            const fog = PIXEffect_fog.GetFog(fogId);
            if (fog) {
                console.log(`Fog ${fogId}:`, fog.getDebugInfo());
            }
        });
    }, "#4FC3F7");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Show Performance Stats", () => {
        const stats = PIXEffect_fog.GetPerformanceStats();
        console.log("=== Fog Performance Statistics ===");
        console.log(`Total Fogs: ${stats.totalFogs}`);
        console.log(`Total Particles: ${stats.totalParticles}/${stats.maxParticlesGlobal}`);
        console.log(`Max Particles Per Fog: ${stats.maxParticlesPerFog}`);
        console.log(`Performance Mode: ${stats.performanceMode ? 'ON' : 'OFF'}`);
        console.log(`LOD System: ${stats.lodEnabled ? 'ON' : 'OFF'}`);
        console.log(`Update Frequency: ${stats.updateFrequency}ms`);
        console.log(`Average Frame Time: ${stats.avgFrameTime}ms`);
        console.log(`Estimated FPS: ${stats.estimatedFPS}`);
        console.log(`Performance Level: ${(stats.avgPerformanceLevel * 100).toFixed(1)}%`);
        console.log(`LOD Distribution:`, stats.lodDistribution);
        console.log("================================");
    }, "#4FC3F7");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Show Pending Fog Info", () => {
        const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
        const fogInfo = PIXEffect_fog.GetFogInfo();

        console.log("=== PENDING FOG SYSTEM STATUS ===");
        console.log(`Active fogs: ${fogInfo.count}`);
        console.log(`Pending fogs: ${pendingInfo.count}`);

        if (fogInfo.count > 0) {
            console.log("Active fog IDs:", fogInfo.fogs);

            fogInfo.fogs.forEach(id => {
                const fog = PIXEffect_fog.GetFog(id);
                if (fog) {
                    const isFadingOut = (fog as any).isFadingOut;
                    const isFadingIn = (fog as any).isFadingIn;
                    let status = "ACTIVE";
                    if (isFadingOut) status = "FADING OUT";
                    else if (isFadingIn) status = "FADING IN";
                    console.log(`  ${id}: ${status}`);
                }
            });
        }

        if (pendingInfo.count > 0) {
            console.log("Pending fog IDs:", pendingInfo.pending);
        }

        console.log("================================");
    }, "#4FC3F7");

    // === PERFORMANCE CONTROL BUTTONS (Green Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Enable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(true);
    }, "#4CAF50");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Disable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(false);
    }, "#4CAF50");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Enable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(true);
    }, "#4CAF50");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Disable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(false);
    }, "#4CAF50");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Auto Optimize All Fog", () => {
        PIXEffect_fog.OptimizeAllFog();
    }, "#4CAF50");

    // === FADE CONTROL BUTTONS (Purple Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Set Fast Fade (500ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(500);
        PIXEffect_fog.SetFadeInDuration(500);
    }, "#9C27B0");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Set Normal Fade (2000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(2000);
        PIXEffect_fog.SetFadeInDuration(1500);
    }, "#9C27B0");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Set Slow Fade (5000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(5000);
        PIXEffect_fog.SetFadeInDuration(3000);
    }, "#9C27B0");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Show Fade Duration", () => {
        const fadeInDuration = PIXEffect_fog.GetFadeInDuration();
        const fadeOutDuration = PIXEffect_fog.GetFadeOutDuration();
        console.log(`Current fade-in duration: ${fadeInDuration}ms`);
        console.log(`Current fade-out duration: ${fadeOutDuration}ms`);
    }, "#9C27B0");

    // === TEST BUTTONS (Orange Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Test Fade Effects", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 3, "fade_test")
            .setPosition(x - 150, y - 150)
            .setSize(300, 300)
            .setOpacity(0.8)
            .setColor("#4fc3f7");

        console.log("Created 3-second fog to test fade-out effect");
    }, "#FF9800");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Test Fog Replacement", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("Creating first fog...");
        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.HEAVY, 0, "replacement_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#ff0000");

        setTimeout(() => {
            console.log("Replacing with new fog (should fade out old one)...");
            PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MYSTICAL, 0, "replacement_test")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300)
                .setOpacity(0.8)
                .setColor("#00ff00");
        }, 3000);
    }, "#FF9800");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Test Color Variations", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
        const positions = [
            [-300, -200], [-100, -200], [100, -200],
            [-300, 0], [-100, 0], [100, 0]
        ];

        colors.forEach((color, index) => {
            if (!PlayerInstance) return;
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 10, `color_test_${index}`)
                .setPosition(PlayerInstance.x + positions[index][0], PlayerInstance.y + positions[index][1])
                .setSize(200, 150)
                .setScale(1.0)
                .setOpacity(0.6)
                .setColor(color)
                .setSpeed(0.8);
        });
    }, "#FF9800");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Test Performance Stress", () => {
        console.log("Creating large fog instances for performance testing...");

        for (let i = 0; i < 3; i++) {
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 30, `perf_test_${i}`)
                .setPosition(i * 640, 0)
                .setSize(1920, 1080)
                .setOpacity(0.3)
                .setDensity(1.0);
        }

        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("Performance test results:", stats);
        }, 1000);
    }, "#FF9800");

    // === SCENE CHANGE TEST BUTTONS (Cyan Color) ===
    IMGUIDebugButton.AddButtonToCategory(fog_category, "Test Scene Change Cleanup", () => {
        console.log("Simulating scene change cleanup...");
        PIXEffect_fog.EmergencyDestroyAllFog();
    }, "#00BCD4");

    IMGUIDebugButton.AddButtonToCategory(fog_category, "Add Scene Change Listener", () => {
        console.log("Setting up scene change listener...");
        PIXEffect_fog.AddSceneChangeCleanup();
    }, "#00BCD4");
}); 