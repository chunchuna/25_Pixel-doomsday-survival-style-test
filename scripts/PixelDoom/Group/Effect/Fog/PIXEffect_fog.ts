import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    var fogSprite = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.FogSprite.createInstance("Fog", 0, 0, false)
    createFogAroundInstance(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
        RUN_TIME_.objects.
        RedHairGirlSprite.getFirstInstance(), 20, 100
    )
})

/**
 * Create fog instances around a target instance in a circular pattern
 * @param targetInstance - The instance to surround with fog
 * @param fogCount - Number of fog instances to create around the target
 * @param radius - Distance from the target instance (default: 100)
 */
export async function createFogAroundInstance(targetInstance: any, fogCount: number, radius: number = 100): Promise<void> {

    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1)
    alert(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName)
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName !== "Level") return

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

        // Create fog instance at calculated position
        const fogInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.
            RUN_TIME_.objects.FogSprite.createInstance("Fog", fogX, fogY, false);

        // Add fade-in effect to the fog instance
        try {
            const fadeBehavior = fogInstance.behaviors.Fade;
            if (fadeBehavior) {
                // Set fade parameters
                fadeBehavior.fadeInTime = 1.0;  // 1 second fade in
                fadeBehavior.waitTime = 99999;      // No wait time
                fadeBehavior.fadeOutTime = 0;   // No fade out initially
                
                // Start the fade effect
                fadeBehavior.startFade();
                console.log(`Started fade-in effect for fog instance ${i + 1}`);
            }
        } catch (error) {
            console.log(`Failed to apply fade effect to fog instance ${i + 1}: ${error}`);
        }
        
        console.log(`Created fog instance ${i + 1} at position (${fogX.toFixed(2)}, ${fogY.toFixed(2)})`);
    }

    console.log(`Successfully created ${fogCount} fog instances around target at (${centerX}, ${centerY})`);
}