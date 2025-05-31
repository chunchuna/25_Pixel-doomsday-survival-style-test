import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";
import { IMGUIDebugButton } from "../../../UI/debug_ui/UIDbugButton.js";
import { FogStyle, FogType, PIXEffect_fog } from "./PIXEffect_fog.js";

var isBindButtonIntoDebugPanel = false;


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    // Setup automatic fog cleanup with smart strategy (default)


    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    // Test category for fog system
    var fog_system = IMGUIDebugButton.AddCategory("fog_system");

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Fog Property Editor", () => {
        // Get the first active fog for editing, or create one if none exists
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            PIXEffect_fog.OpenFogEditor(fogInfo.fogs[0]);
        } else {
            // Create a test fog for editing
            var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
            const x = PlayerInstance ? PlayerInstance.x : 400;
            const y = PlayerInstance ? PlayerInstance.y : 300;

            const testFog = PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "editor_test_fog")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300);

            PIXEffect_fog.OpenFogEditor("editor_test_fog");
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Performance Monitor", () => {
        PIXEffect_fog.OpenPerformanceMonitor();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Open ImGui Fog Debug", () => {
        PIXEffect_fog.CreateImGuiFogDebugWindow();
    });

    // Add new auto cleanup control buttons
    var auto_cleanup_category = IMGUIDebugButton.AddCategory("fog_auto_cleanup");

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Setup Smart Cleanup", () => {
        PIXEffect_fog.SetupAutoCleanup('smart');
        console.log("Smart auto cleanup enabled - graceful with emergency fallback");
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Setup Graceful Cleanup", () => {
        PIXEffect_fog.SetupAutoCleanup('graceful');
        console.log("Graceful auto cleanup enabled - fade-out only");
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Setup Immediate Cleanup", () => {
        PIXEffect_fog.SetupAutoCleanup('immediate');
        console.log("Immediate auto cleanup enabled - instant destruction");
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Check Auto Cleanup Status", () => {
        const isEnabled = PIXEffect_fog.IsAutoCleanupEnabled();
        console.log(`Auto cleanup is ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Disable Auto Cleanup", () => {
        PIXEffect_fog.DisableAutoCleanup();
        console.log("Auto cleanup disabled");
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Test Emergency Scene Cleanup", () => {
        PIXEffect_fog.EmergencyCleanupOnSceneChange();
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Manual Scene Change Setup", () => {
        console.log("Setting up manual scene change listener...");
        PIXEffect_fog.AddSceneChangeCleanup();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate bIG Fog FOR WHOLE GAME", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.LEVEL, 0, "whole_level_fog")
            .setPosition(0, 0)
            .setSize(6000, 3000)

        PIXEffect_fog.OpenFogEditor("whole_level_fog");
        PIXEffect_fog.OpenPerformanceMonitor();

    })

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate OPTIMIZED Large Fog", () => {
        // Use the new optimized method for large-scale fog
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

        // Show performance comparison
        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("=== Optimized Large Fog Performance ===");
            console.log(`Particles created: ${optimizedFog.getParticleCount()}`);
            console.log(`LOD Level: ${optimizedFog.getLODLevel()}`);
            console.log("Global stats:", stats);
        }, 500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Light Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 10)
            .setPosition(PlayerInstance.x - 200, PlayerInstance.y - 200)
            .setSize(400, 300)
            .setScale(1.2)
            .setSpeed(0.8)
            .setOpacity(0.4);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Heavy Fog", () => {
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

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Mystical Fog", () => {
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

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Toxic Fog", () => {
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

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Persistent Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "persistent_fog_1")
            .setPosition(PlayerInstance.x - 400, PlayerInstance.y - 300)
            .setSize(800, 600)
            .setScale(1.5)
            .setSpeed(1.0)
            .setOpacity(0.6);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Custom Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 20)
            .setPosition(PlayerInstance.x - 350, PlayerInstance.y - 250)
            .setSize(700, 500)
            .setScale(2.0)
            .setSpeed(1.5)
            .setOpacity(0.5)
            .setColor("#ff6b6b")
            .setDensity(1.2)
            .setLayers(5);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Screen Fog", () => {
        // Create full-screen fog effect
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 25)
            .setPosition(0, 0)
            .setSize(1920, 1080) // Full screen size
            .setScale(3.0)
            .setSpeed(0.5)
            .setOpacity(0.4)
            .setColor("#ffffff")
            .setDensity(0.8);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Generate Moving Fog", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Create fast-moving fog
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 30)
            .setPosition(PlayerInstance.x - 500, PlayerInstance.y - 300)
            .setSize(1000, 600)
            .setScale(1.0)
            .setSpeed(3.0) // Very fast movement
            .setOpacity(0.3)
            .setColor("#87ceeb")
            .setDensity(0.6);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Destroy All Fog", () => {
        PIXEffect_fog.DestroyAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "EMERGENCY FOG CLEANUP", () => {
        PIXEffect_fog.EmergencyDestroyAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fog Info", () => {
        const info = PIXEffect_fog.GetFogInfo();
        console.log(`Active fog effects: ${info.count}`);
        console.log(`Fog IDs: ${info.fogs.join(", ")}`);

        // Show detailed info for each fog
        info.fogs.forEach(fogId => {
            const fog = PIXEffect_fog.GetFog(fogId);
            if (fog) {
                console.log(`Fog ${fogId}:`, fog.getDebugInfo());
            }
        });
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Edit Whole Level Fog", () => {
        const fog = PIXEffect_fog.GetFog("whole_level_fog");
        if (fog) {
            PIXEffect_fog.OpenFogEditor("whole_level_fog");
        } else {
            console.log("Whole level fog not found. Available fogs:", PIXEffect_fog.GetFogInfo().fogs);
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fade-out (3s fog)", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 3, "fade_test")
            .setPosition(x - 150, y - 150)
            .setSize(300, 300)
            .setOpacity(0.8)
            .setColor("#4fc3f7");

        console.log("Created 3-second fog to test fade-out effect");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Fast Fade (500ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Normal Fade (2000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(2000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Slow Fade (5000ms)", () => {
        PIXEffect_fog.SetFadeOutDuration(5000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fade Duration", () => {
        const duration = PIXEffect_fog.GetFadeOutDuration();
        console.log(`Current fade-out duration: ${duration}ms`);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fog Layers", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Create multiple fog layers at different positions
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 15, "layer_1")
            .setPosition(PlayerInstance.x - 200, PlayerInstance.y - 200)
            .setSize(400, 300)
            .setOpacity(0.3)
            .setColor("#ffffff");

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 15, "layer_2")
            .setPosition(PlayerInstance.x - 100, PlayerInstance.y - 150)
            .setSize(400, 300)
            .setOpacity(0.4)
            .setColor("#e0e0e0");

        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 15, "layer_3")
            .setPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .setSize(400, 300)
            .setOpacity(0.5)
            .setColor("#cccccc");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Color Variations", () => {
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
    });

    // Performance optimization buttons
    var performance_category = IMGUIDebugButton.AddCategory("fog_performance");

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Open Performance Monitor", () => {
        PIXEffect_fog.OpenPerformanceMonitor();
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Show Performance Stats", () => {
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
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Enable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(true);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Disable Performance Mode", () => {
        PIXEffect_fog.SetPerformanceMode(false);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Low Particle Limit (50)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(50);
        PIXEffect_fog.SetMaxParticlesGlobal(200);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Medium Particle Limit (100)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(100);
        PIXEffect_fog.SetMaxParticlesGlobal(400);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set High Particle Limit (200)", () => {
        PIXEffect_fog.SetMaxParticlesPerFog(200);
        PIXEffect_fog.SetMaxParticlesGlobal(800);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Enable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(true);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Disable LOD System", () => {
        PIXEffect_fog.SetLODEnabled(false);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Fast Updates (8ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(8);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Normal Updates (16ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(16);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Set Slow Updates (32ms)", () => {
        PIXEffect_fog.SetUpdateFrequency(32);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Auto Optimize All Fog", () => {
        PIXEffect_fog.OptimizeAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Test Large Fog Performance", () => {
        // Create multiple large fog instances to test performance
        console.log("Creating large fog instances for performance testing...");

        for (let i = 0; i < 3; i++) {
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 30, `perf_test_${i}`)
                .setPosition(i * 640, 0)
                .setSize(1920, 1080)
                .setOpacity(0.3)
                .setDensity(1.0);
        }

        // Show stats after creation
        setTimeout(() => {
            const stats = PIXEffect_fog.GetPerformanceStats();
            console.log("Performance test results:", stats);
        }, 1000);
    });

    IMGUIDebugButton.AddButtonToCategory(performance_category, "Reset Performance Settings", () => {
        PIXEffect_fog.SetPerformanceMode(false);
        PIXEffect_fog.SetMaxParticlesPerFog(150);
        PIXEffect_fog.SetMaxParticlesGlobal(500);
        PIXEffect_fog.SetLODEnabled(true);
        PIXEffect_fog.SetUpdateFrequency(16);
        console.log("Performance settings reset to defaults");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Color Variations", () => {
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
    });

    // Fade-in controls
    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Fast Fade-in (500ms)", () => {
        PIXEffect_fog.SetFadeInDuration(500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Normal Fade-in (1500ms)", () => {
        PIXEffect_fog.SetFadeInDuration(1500);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Set Slow Fade-in (3000ms)", () => {
        PIXEffect_fog.SetFadeInDuration(3000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Show Fade-in Duration", () => {
        const fadeInDuration = PIXEffect_fog.GetFadeInDuration();
        const fadeOutDuration = PIXEffect_fog.GetFadeOutDuration();
        console.log(`Current fade-in duration: ${fadeInDuration}ms`);
        console.log(`Current fade-out duration: ${fadeOutDuration}ms`);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Fade-in Effect", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("Creating fog with fade-in effect...");
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 10, "fade_in_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#9c27b0");
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Graceful Replacement", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        // Create first fog
        console.log("Creating first fog...");
        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.HEAVY, 0, "replacement_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#ff0000");

        // Replace it after 3 seconds
        setTimeout(() => {
            console.log("Replacing with new fog (should fade out old one)...");
            PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MYSTICAL, 0, "replacement_test")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300)
                .setOpacity(0.8)
                .setColor("#00ff00");
        }, 3000);
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Graceful Destroy", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            const fogId = fogInfo.fogs[0];
            console.log(`Gracefully destroying fog: ${fogId}`);
            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
        } else {
            console.log("No fog to destroy");
        }
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Destroy All Fog Gracefully", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        console.log(`Gracefully destroying ${fogInfo.count} fog effects...`);

        fogInfo.fogs.forEach(fogId => {
            PIXEffect_fog.DestroyFogWithFadeOut(fogId);
        });
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Scene Change Cleanup", () => {
        console.log("Simulating scene change cleanup...");
        PIXEffect_fog.EmergencyDestroyAllFog();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Manual Scene Change Setup", () => {
        console.log("Setting up scene change listener...");
        PIXEffect_fog.AddSceneChangeCleanup();
    });

    IMGUIDebugButton.AddButtonToCategory(fog_system, "Test Invalid Element Handling", () => {
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            const fog = PIXEffect_fog.GetFog(fogInfo.fogs[0]);
            if (fog) {
                console.log("Testing invalid element handling...");
                // Manually trigger invalid element handling
                (fog as any).handleInvalidElement();
            }
        } else {
            console.log("No fog to test with");
        }
    });

    // Add scene change testing buttons
    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Create Test Fog for Scene Change", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        // Create multiple fog effects to test cleanup
        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.HEAVY, 0, "scene_test_1")
            .setPosition(x - 300, y - 200)
            .setSize(400, 300)
            .setOpacity(0.7)
            .setColor("#ff0000");

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MYSTICAL, 0, "scene_test_2")
            .setPosition(x, y - 200)
            .setSize(400, 300)
            .setOpacity(0.7)
            .setColor("#00ff00");

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.TOXIC, 0, "scene_test_3")
            .setPosition(x + 300, y - 200)
            .setSize(400, 300)
            .setOpacity(0.7)
            .setColor("#0000ff");

        console.log("Created 3 test fog effects for scene change testing");
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Simulate Scene End Event", () => {
        console.log("=== SIMULATING SCENE END EVENT ===");

        // Directly call the cleanup method since we can't dispatch events manually
        console.log("Calling emergency cleanup to simulate scene end...");
        PIXEffect_fog.EmergencyCleanupOnSceneChange();
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Simulate Scene Start Event", () => {
        console.log("=== SIMULATING SCENE START EVENT ===");

        // Check for orphaned fog effects like the real event handler would
        const fogInfo = PIXEffect_fog.GetFogInfo();
        if (fogInfo.count > 0) {
            console.log(`Found ${fogInfo.count} orphaned fog effects, performing emergency cleanup...`);
            PIXEffect_fog.EmergencyDestroyAllFog();
        } else {
            console.log("No orphaned fog effects found");
        }

        // Call recreate method
        PIXEffect_fog.RecreateAfterSceneChange();
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Test Full Scene Change Cycle", () => {
        console.log("=== TESTING FULL SCENE CHANGE CYCLE ===");

        // Create test fog
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.MEDIUM, 0, "cycle_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#ffff00");

        console.log("Created test fog, will simulate scene change in 3 seconds...");

        // Simulate scene end after 3 seconds
        setTimeout(() => {
            console.log("Simulating scene end...");
            PIXEffect_fog.EmergencyCleanupOnSceneChange();

            // Simulate scene start after another 2 seconds
            setTimeout(() => {
                console.log("Simulating scene start...");

                // Check for orphaned fog and cleanup
                const fogInfo = PIXEffect_fog.GetFogInfo();
                if (fogInfo.count > 0) {
                    console.log("Backup cleanup: removing orphaned fog effects");
                    PIXEffect_fog.EmergencyDestroyAllFog();
                }

                PIXEffect_fog.RecreateAfterSceneChange();

                // Check final state
                setTimeout(() => {
                    const finalInfo = PIXEffect_fog.GetFogInfo();
                    console.log(`Scene change cycle complete. Remaining fog: ${finalInfo.count}`);
                }, 1000);
            }, 2000);
        }, 3000);
    });

    IMGUIDebugButton.AddButtonToCategory(auto_cleanup_category, "Show Runtime Event Info", () => {
        console.log("=== RUNTIME EVENT INFORMATION ===");
        console.log("Available runtime events for scene changes:");
        console.log("- beforeanylayoutend: Triggered before any layout/scene ends");
        console.log("- afteranylayoutend: Triggered after any layout/scene ends");
        console.log("- beforeanylayoutstart: Triggered before any layout/scene starts");
        console.log("- afteranylayoutstart: Triggered after any layout/scene starts");
        console.log("");
        console.log("Current auto cleanup status:", PIXEffect_fog.IsAutoCleanupEnabled() ? "ENABLED" : "DISABLED");

        const fogInfo = PIXEffect_fog.GetFogInfo();
        console.log(`Current active fog effects: ${fogInfo.count}`);
        if (fogInfo.count > 0) {
            console.log("Active fog IDs:", fogInfo.fogs);
        }
    });

    // Add new test category for pending fog system
    var pending_fog_category = IMGUIDebugButton.AddCategory("pending_fog_system");

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Fog Replacement Logic", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING FOG REPLACEMENT LOGIC ===");

        // Create first fog
        console.log("Step 1: Creating initial fog...");
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 8, "replacement_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.8)
            .setColor("#ff0000");

        // Try to replace it after 2 seconds (should queue)
        setTimeout(() => {
            console.log("Step 2: Attempting to replace fog (should queue)...");
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 10, "replacement_test")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300)
                .setOpacity(0.8)
                .setColor("#00ff00");

            const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
            console.log(`Pending fogs after replacement attempt: ${pendingInfo.count}`);
        }, 2000);

        // Try to replace again after 4 seconds (should update queue)
        setTimeout(() => {
            console.log("Step 3: Attempting second replacement (should update queue)...");
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.TOXIC, 12, "replacement_test")
                .setPosition(x - 200, y - 200)
                .setSize(400, 300)
                .setOpacity(0.8)
                .setColor("#0000ff");

            const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
            console.log(`Pending fogs after second replacement: ${pendingInfo.count}`);
        }, 4000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Multiple ID Replacements", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING MULTIPLE ID REPLACEMENTS ===");

        // Create multiple fogs with different IDs
        const fogIds = ["test_fog_1", "test_fog_2", "test_fog_3"];
        const colors = ["#ff0000", "#00ff00", "#0000ff"];

        fogIds.forEach((id, index) => {
            console.log(`Creating fog ${id}...`);
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 6, id)
                .setPosition(x - 300 + (index * 200), y - 150)
                .setSize(180, 150)
                .setOpacity(0.7)
                .setColor(colors[index]);
        });

        // Try to replace all of them after 2 seconds
        setTimeout(() => {
            console.log("Attempting to replace all fogs...");
            const newColors = ["#ffff00", "#ff00ff", "#00ffff"];

            fogIds.forEach((id, index) => {
                PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 8, id)
                    .setPosition(x - 300 + (index * 200), y - 150)
                    .setSize(180, 150)
                    .setOpacity(0.7)
                    .setColor(newColors[index]);
            });

            const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
            console.log(`Total pending fogs: ${pendingInfo.count}`);
            console.log(`Pending IDs: ${pendingInfo.pending.join(", ")}`);
        }, 2000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Callback System", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING CALLBACK SYSTEM ===");

        // Create initial fog
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 5, "callback_test")
            .setPosition(x - 150, y - 150)
            .setSize(300, 300)
            .setOpacity(0.6)
            .setColor("#ffffff");

        // Use callback system to replace it
        setTimeout(() => {
            console.log("Using GenerateFogWithCallback...");
            PIXEffect_fog.GenerateFogWithCallback(
                FogType.TEMPORARY,
                FogStyle.HEAVY,
                8,
                "callback_test",
                (newFog: PIXEffect_fog) => {
                    console.log(`Callback triggered! New fog created: ${newFog.getId()}`);
                    newFog.setColor("#ff6b6b")
                        .setOpacity(0.8)
                        .setScale(2.0);
                    console.log("Applied custom settings via callback");
                }
            );
        }, 2000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Show Pending Fog Info", () => {
        const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
        const fogInfo = PIXEffect_fog.GetFogInfo();

        console.log("=== PENDING FOG SYSTEM STATUS ===");
        console.log(`Active fogs: ${fogInfo.count}`);
        console.log(`Pending fogs: ${pendingInfo.count}`);

        if (fogInfo.count > 0) {
            console.log("Active fog IDs:", fogInfo.fogs);

            // Show fade status for each active fog
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
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Cancel All Pending Fogs", () => {
        const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
        console.log(`Cancelling ${pendingInfo.count} pending fog creations...`);
        PIXEffect_fog.CancelAllPendingFog();
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Rapid Replacement", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING RAPID REPLACEMENT ===");

        // Create initial fog
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 10, "rapid_test")
            .setPosition(x - 200, y - 200)
            .setSize(400, 300)
            .setOpacity(0.7)
            .setColor("#ffffff");

        // Rapidly try to replace it multiple times
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
        const styles = [FogStyle.HEAVY, FogStyle.MYSTICAL, FogStyle.TOXIC, FogStyle.LIGHT, FogStyle.MEDIUM];

        colors.forEach((color, index) => {
            setTimeout(() => {
                console.log(`Rapid replacement ${index + 1}: ${color}`);
                PIXEffect_fog.GenerateFog(FogType.TEMPORARY, styles[index], 8, "rapid_test")
                    .setPosition(x - 200, y - 200)
                    .setSize(400, 300)
                    .setOpacity(0.7)
                    .setColor(color);

                const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
                console.log(`  Pending count: ${pendingInfo.count}`);
            }, (index + 1) * 500); // Every 500ms
        });
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Edge Cases", () => {
        console.log("=== TESTING EDGE CASES ===");

        // Test 1: Try to replace non-existent fog
        console.log("Test 1: Replacing non-existent fog...");
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 5, "non_existent_test")
            .setPosition(100, 100)
            .setSize(200, 200);

        // Test 2: Try to cancel non-existent pending fog
        setTimeout(() => {
            console.log("Test 2: Cancelling non-existent pending fog...");
            const result = PIXEffect_fog.CancelPendingFog("non_existent_pending");
            console.log(`Cancel result: ${result}`);
        }, 1000);

        // Test 3: Create fog, destroy it immediately, then try to replace
        setTimeout(() => {
            console.log("Test 3: Create, destroy, then replace...");
            const fog = PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 5, "destroy_test")
                .setPosition(300, 300)
                .setSize(200, 200);

            // Destroy immediately
            fog.destroy();

            // Try to replace
            setTimeout(() => {
                PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 5, "destroy_test")
                    .setPosition(300, 300)
                    .setSize(200, 200);
            }, 100);
        }, 2000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Stress Test Pending System", () => {
        console.log("=== STRESS TESTING PENDING SYSTEM ===");

        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        // Create 5 different fog IDs
        const fogIds = ["stress_1", "stress_2", "stress_3", "stress_4", "stress_5"];

        // Create initial fogs
        fogIds.forEach((id, index) => {
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 8, id)
                .setPosition(x - 400 + (index * 200), y - 200)
                .setSize(180, 150)
                .setOpacity(0.6)
                .setColor("#ffffff");
        });

        // Rapidly replace all of them multiple times
        for (let round = 1; round <= 3; round++) {
            setTimeout(() => {
                console.log(`Stress test round ${round}...`);
                const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

                fogIds.forEach((id, index) => {
                    PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 6, id)
                        .setPosition(x - 400 + (index * 200), y - 200)
                        .setSize(180, 150)
                        .setOpacity(0.7)
                        .setColor(colors[index]);
                });

                const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
                console.log(`Round ${round} - Pending: ${pendingInfo.count}, IDs: ${pendingInfo.pending.join(", ")}`);
            }, round * 1000);
        }

        // Show final status
        setTimeout(() => {
            const finalPending = PIXEffect_fog.GetPendingFogInfo();
            const finalActive = PIXEffect_fog.GetFogInfo();
            console.log("=== STRESS TEST COMPLETE ===");
            console.log(`Final active fogs: ${finalActive.count}`);
            console.log(`Final pending fogs: ${finalPending.count}`);
            console.log("============================");
        }, 5000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Size/Position Preservation", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING SIZE/POSITION PRESERVATION ===");

        // Create initial fog with specific size and position
        console.log("Step 1: Creating initial fog with custom size and position...");
        const initialFog = PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 8, "size_test")
            .setPosition(x - 300, y - 200)
            .setSize(600, 400)
            .setOpacity(0.8)
            .setColor("#ff0000")
            .setScale(2.0)
            .setDensity(1.5);

        console.log(`Initial fog - Position: (${initialFog.getPosition().x}, ${initialFog.getPosition().y}), Size: ${initialFog.getSize().width}x${initialFog.getSize().height}`);

        // Try to replace it after 2 seconds (should preserve size and position)
        setTimeout(() => {
            console.log("Step 2: Replacing fog (should preserve size and position)...");
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 10, "size_test");

            const pendingInfo = PIXEffect_fog.GetPendingFogInfo();
            console.log(`Pending fogs: ${pendingInfo.count}`);
        }, 2000);

        // Check the replacement fog after fade-out completes
        setTimeout(() => {
            const replacementFog = PIXEffect_fog.GetFog("size_test");
            if (replacementFog) {
                console.log(`Replacement fog - Position: (${replacementFog.getPosition().x}, ${replacementFog.getPosition().y}), Size: ${replacementFog.getSize().width}x${replacementFog.getSize().height}`);
                console.log("Size and position should be preserved!");
            } else {
                console.log("Replacement fog not found");
            }
        }, 5000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Custom Settings Method", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING CUSTOM SETTINGS METHOD ===");

        // Create initial fog
        console.log("Step 1: Creating initial fog...");
        PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 6, "custom_test")
            .setPosition(x - 200, y - 150)
            .setSize(400, 300)
            .setOpacity(0.6)
            .setColor("#ffffff");

        // Use GenerateFogWithSettings to replace with custom settings
        setTimeout(() => {
            console.log("Step 2: Using GenerateFogWithSettings to replace...");
            PIXEffect_fog.GenerateFogWithSettings(
                FogType.TEMPORARY,
                FogStyle.MYSTICAL,
                8,
                "custom_test",
                "html_c3",
                {
                    position: { x: x - 250, y: y - 200 }, // New position
                    size: { width: 500, height: 350 },    // New size
                    color: "#9c27b0",
                    scale: 2.5,
                    opacity: 0.9,
                    speed: 0.5
                }
            );
        }, 2000);

        // Check the result
        setTimeout(() => {
            const resultFog = PIXEffect_fog.GetFog("custom_test");
            if (resultFog) {
                console.log(`Result fog - Position: (${resultFog.getPosition().x}, ${resultFog.getPosition().y}), Size: ${resultFog.getSize().width}x${resultFog.getSize().height}`);
                console.log(`Color: ${resultFog.getFogParams().color}, Scale: ${resultFog.getFogParams().scale}`);
            }
        }, 5000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Test Property Inheritance", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== TESTING PROPERTY INHERITANCE ===");

        // Create initial fog with many custom properties
        console.log("Step 1: Creating fog with many custom properties...");
        const complexFog = PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.HEAVY, 5, "inheritance_test")
            .setPosition(x - 350, y - 250)
            .setSize(700, 500)
            .setOpacity(0.75)
            .setColor("#4caf50")
            .setScale(1.8)
            .setSpeed(0.7)
            .setDensity(1.3)
            .setLayers(4)
            .setBlur(18)
            .setNoiseScale(0.6);

        console.log("Initial fog properties:");
        console.log(`  Position: (${complexFog.getPosition().x}, ${complexFog.getPosition().y})`);
        console.log(`  Size: ${complexFog.getSize().width}x${complexFog.getSize().height}`);
        console.log(`  Color: ${complexFog.getFogParams().color}`);
        console.log(`  Scale: ${complexFog.getFogParams().scale}`);
        console.log(`  Opacity: ${complexFog.getFogParams().opacity}`);

        // Replace with different style but should inherit properties
        setTimeout(() => {
            console.log("Step 2: Replacing with different style (should inherit properties)...");
            PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 8, "inheritance_test");
        }, 2000);

        // Check inheritance
        setTimeout(() => {
            const inheritedFog = PIXEffect_fog.GetFog("inheritance_test");
            if (inheritedFog) {
                console.log("Inherited fog properties:");
                console.log(`  Position: (${inheritedFog.getPosition().x}, ${inheritedFog.getPosition().y}) - Should match initial`);
                console.log(`  Size: ${inheritedFog.getSize().width}x${inheritedFog.getSize().height} - Should match initial`);
                console.log(`  Color: ${inheritedFog.getFogParams().color} - Should be inherited`);
                console.log(`  Scale: ${inheritedFog.getFogParams().scale} - Should be inherited`);
                console.log(`  Opacity: ${inheritedFog.getFogParams().opacity} - Should be inherited`);
                console.log(`  Style: ${inheritedFog.getStyle()} - Should be MYSTICAL`);
            }
        }, 5000);
    });

    IMGUIDebugButton.AddButtonToCategory(pending_fog_category, "Compare Before/After Properties", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        const x = PlayerInstance ? PlayerInstance.x : 400;
        const y = PlayerInstance ? PlayerInstance.y : 300;

        console.log("=== COMPARING BEFORE/AFTER PROPERTIES ===");

        // Create fog and capture its properties
        const testFog = PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.TOXIC, 4, "compare_test")
            .setPosition(x - 400, y - 300)
            .setSize(800, 600)
            .setOpacity(0.85)
            .setColor("#ff6b6b")
            .setScale(2.2)
            .setSpeed(1.5)
            .setDensity(1.8);

        // Capture initial properties
        const initialProps = {
            position: testFog.getPosition(),
            size: testFog.getSize(),
            fogParams: testFog.getFogParams(),
            style: testFog.getStyle(),
            type: testFog.getType()
        };

        console.log("=== INITIAL PROPERTIES ===");
        console.log("Position:", initialProps.position);
        console.log("Size:", initialProps.size);
        console.log("Style:", initialProps.style);
        console.log("Type:", initialProps.type);
        console.log("Color:", initialProps.fogParams.color);
        console.log("Scale:", initialProps.fogParams.scale);
        console.log("Opacity:", initialProps.fogParams.opacity);
        console.log("Speed:", initialProps.fogParams.speed);
        console.log("Density:", initialProps.fogParams.density);

        // Replace after 2 seconds
        setTimeout(() => {
            console.log("Replacing fog...");
            PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.LIGHT, 0, "compare_test");
        }, 2000);

        // Compare after replacement
        setTimeout(() => {
            const replacedFog = PIXEffect_fog.GetFog("compare_test");
            if (replacedFog) {
                console.log("=== AFTER REPLACEMENT PROPERTIES ===");
                console.log("Position:", replacedFog.getPosition());
                console.log("Size:", replacedFog.getSize());
                console.log("Style:", replacedFog.getStyle(), "(should be LIGHT)");
                console.log("Type:", replacedFog.getType(), "(should be PERSISTENT)");
                console.log("Color:", replacedFog.getFogParams().color);
                console.log("Scale:", replacedFog.getFogParams().scale);
                console.log("Opacity:", replacedFog.getFogParams().opacity);
                console.log("Speed:", replacedFog.getFogParams().speed);
                console.log("Density:", replacedFog.getFogParams().density);

                console.log("=== COMPARISON RESULTS ===");
                const posMatch = replacedFog.getPosition().x === initialProps.position.x && replacedFog.getPosition().y === initialProps.position.y;
                const sizeMatch = replacedFog.getSize().width === initialProps.size.width && replacedFog.getSize().height === initialProps.size.height;

                console.log(`Position preserved: ${posMatch ? '✓' : '✗'}`);
                console.log(`Size preserved: ${sizeMatch ? '✓' : '✗'}`);
                console.log(`Style changed: ${replacedFog.getStyle() !== initialProps.style ? '✓' : '✗'}`);
                console.log(`Type changed: ${replacedFog.getType() !== initialProps.type ? '✓' : '✗'}`);
            } else {
                console.log("❌ Replacement fog not found!");
            }
        }, 6000);
    });
}); 