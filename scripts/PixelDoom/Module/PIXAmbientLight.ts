import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    //@ts-ignore
    AmbientLight.light_layer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.getLayer(AmbientLight.light_layer_name);
    if (AmbientLight.light_layer == null) return

    // 测试昼夜循环：从当前颜色开始
    AmbientLight.simulat_day_night_cycle(
        50,                    // 白天到夜晚过渡10秒
        300,                    // 夜晚到白天过渡10秒
        AmbientLight.dya_light_rgb,          // 白天颜色（略带黄色）
        AmbientLight.night_light_rgb,      // 夜晚颜色（深蓝色）
        "current"              // 从当前颜色开始，自动判断接近白天还是夜晚
    );

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

    // 昼夜循环状态
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

    //日照日落循环
    static simulat_day_night_cycle(day_time: number, night_time: number, day_light: [number, number, number], night_light: [number, number, number], defaul_t: string) {
        if (!this.light_layer) return;

        // 停止之前的循环
        this.stopDayNightCycle();

        // 设置循环参数
        this.dayNightCycle.isRunning = true;
        this.dayNightCycle.dayDuration = day_time;
        this.dayNightCycle.nightDuration = night_time;
        this.dayNightCycle.dayColor = [...day_light] as [number, number, number];
        this.dayNightCycle.nightColor = [...night_light] as [number, number, number];

        // 处理默认状态
        if (defaul_t === "current") {
            // 获取当前颜色并判断更接近白天还是夜晚
            const currentColor = this.light_layer.backgroundColor;
            const dayDistance = this.colorDistance(currentColor, day_light);
            const nightDistance = this.colorDistance(currentColor, night_light);

            // 设置为距离更近的状态
            this.dayNightCycle.currentPhase = dayDistance <= nightDistance ? "day" : "night";

            console.log("从当前颜色开始", {
                当前颜色: currentColor,
                判定为: this.dayNightCycle.currentPhase,
                白天色差: dayDistance.toFixed(3),
                夜晚色差: nightDistance.toFixed(3)
            });
        } else {
            // 使用指定的默认状态
            this.dayNightCycle.currentPhase = defaul_t === "day" ? "day" : "night";

            // 设置初始颜色（立即切换到默认状态）
            const initialColor = this.dayNightCycle.currentPhase === "day" ? day_light : night_light;
            this.light_layer.backgroundColor = initialColor;
        }

        console.log("开始昼夜循环", {
            初始状态: this.dayNightCycle.currentPhase,
            白天时长: day_time + "秒",
            夜晚时长: night_time + "秒"
        });

        // 开始循环
        this.runDayNightCycle();
    }

    // 计算两个颜色之间的欧几里得距离
    private static colorDistance(color1: number[], color2: [number, number, number]): number {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            const diff = color1[i] - color2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    // 执行昼夜循环
    private static runDayNightCycle() {
        if (!this.dayNightCycle.isRunning) return;

        const nextPhase = this.dayNightCycle.currentPhase === "day" ? "night" : "day";
        const targetColor = nextPhase === "day" ? this.dayNightCycle.dayColor : this.dayNightCycle.nightColor;
        const transitionDuration = this.dayNightCycle.currentPhase === "day"
            ? this.dayNightCycle.dayDuration
            : this.dayNightCycle.nightDuration;

        console.log(`从${this.dayNightCycle.currentPhase}过渡到${nextPhase}，耗时${transitionDuration}秒`);

        // 开始颜色过渡
        this.startColorTransition(transitionDuration, targetColor);

        // 设置下一次切换
        this.dayNightCycle.cycleTimer = window.setTimeout(() => {
            this.dayNightCycle.currentPhase = nextPhase;
            this.runDayNightCycle(); // 递归调用，继续循环
        }, transitionDuration * 1000);
    }

    // 停止昼夜循环
    static stopDayNightCycle() {
        this.dayNightCycle.isRunning = false;
        if (this.dayNightCycle.cycleTimer !== null) {
            clearTimeout(this.dayNightCycle.cycleTimer);
            this.dayNightCycle.cycleTimer = null;
        }
        console.log("停止昼夜循环");
    }

}