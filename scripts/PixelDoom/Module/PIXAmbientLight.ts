import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    //@ts-ignore
    AmbientLight.light_layer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.getLayer(AmbientLight.light_layer_name);
    if (AmbientLight.light_layer == null) return
 
    AmbientLight.Simulat_edsunshine_cycle(5, AmbientLight.night_light_rgb)

})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    AmbientLight.updateColorTransition()
})

export class AmbientLight {

    public static dya_light_rgb: [number, number, number] = [255 / 255, 255 / 255, 255 / 255]
    public static night_light_rgb: [number, number, number] = [50 / 255, 50 / 255, 100 / 255]  // 深蓝色，更容易看出效果

    private static Layout_allow_name = "Level"
    public static light_layer_name = "Vignette"

    public static light_layer: IAnyProjectLayer | null = null;


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
        this.transition.startTime = performance.now() / 1000; // 转换为秒
        this.transition.duration = duration;
        this.transition.startColor = [...currentBgColor] as [number, number, number];
        this.transition.targetColor = [...target_rgb] as [number, number, number];
        
        console.log("开始颜色过渡", {
            startColor: this.transition.startColor,
            targetColor: this.transition.targetColor,
            duration: duration
        });
    }

 
    static updateColorTransition() {
        if (!this.transition.isActive || !this.light_layer) return;

        const currentTime = performance.now() / 1000; // 转换为秒
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
            console.log("颜色过渡完成", this.transition.currentColor);
        }
    }

  
    private static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    static Simulat_edsunshine_cycle(Time: number, target_rgb: [number, number, number]) {
        if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != this.Layout_allow_name) return
        if (!this.light_layer) return
        console.log("开始颜色过渡")


        this.startColorTransition(Time, target_rgb);
    }

}