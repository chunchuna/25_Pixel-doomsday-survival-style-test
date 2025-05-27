import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { FogStyle, FogType, PIXEffect_fog } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { _Audio } from "./PIXAudio.js";

export enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal",
    FOG = "Fog",
}

// 创建可以在外部直接修改的天气状态对象
export const WeatherState = {
    CurrentWeather: null as WEATHER_TYPE | null,
    CurrentInterval: null as number | null // 当前的计时器
};

// 声明全局变量
let visibilityChangeHandler: EventListener;
// 使用C3内部的计时器
var WeatherC3Timer: InstanceType.C3Ctimer
// 雾计时器管理
var FogTimer: InstanceType.C3Ctimer | null = null;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    WeatherC3Timer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Rain", -100, -100)
    handleWeather();
})

async function handleWeather() {
    Fog();
    Normal();
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(10)
    Rain();

    //Rain();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(3000); // 等待 3 秒
    // Normal();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(5000); // 等待 5 秒
    // Rain(); 
}

async function Rain() {

    if (WeatherC3Timer == null) return
    WeatherState.CurrentWeather = WEATHER_TYPE.RAIN;

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

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
    if (WeatherC3Timer.behaviors.Timer.isTimerRunning("rain")) {
        WeatherC3Timer.behaviors.Timer.stopTimer("rain")
    }

    // Stop rain audio
    _Audio.AudioStop("Rain");

    // Clean up fog
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

    // Gracefully destroy level fog
    PIXEffect_fog.DestroyFogWithFadeOut("whole_level_fog");
}

async function Fog() {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    console.log("Starting fog weather...");

    // Clean up any existing fog first
    cleanupFog();

    // Wait 2 seconds before starting fog
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(2)

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

    // Start repeating timer for fog replacement
    if (FogTimer) {
        FogTimer.behaviors.Timer.startTimer(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(25, 60), "fogtimer", "regular");

        FogTimer.behaviors.Timer.addEventListener("timer", (e) => {
            if (e.tag === "fogtimer") {
                // Check if we're still in the Level layout and fog weather is active
                if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") {
                    // Stop timer and clean up if not in Level or weather changed
                    console.log("Stopping fog due to layout change or weather change");
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
                if (FogTimer) {
                    FogTimer.behaviors.Timer.stopTimer("fogtimer");
                    FogTimer.behaviors.Timer.startTimer(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(30, 60), "fogtimer", "regular");
                }
            }
        });
    }
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

