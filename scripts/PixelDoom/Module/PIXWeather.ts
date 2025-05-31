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

// Expose WeatherState globally for dynamic fog system
(globalThis as any).WeatherState = WeatherState;

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
    EnableDynamicFog(); // Use dynamic fog instead of static fog
    Normal();
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(10)
    Rain();

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

}




export function EnableDynamicFog(): PIXEffect_fog | void {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    console.log("Enabling dynamic fog effect...");

    // Set fog state
    WeatherState.FogEnabled = true;

    // Check if dynamic fog already exists
    const existingDynamicFog = PIXEffect_fog.GetFog("dynamic_level_fog");
    if (existingDynamicFog && (existingDynamicFog as any).isDynamic) {
        console.log("Dynamic fog already exists and is active");
        return existingDynamicFog;
    }


    WeatherState.FogEnabled = true; // Reset after cleanup

    // Check if fog is still enabled after waiting
    if (!WeatherState.FogEnabled) {
        console.log("Fog was disabled during initialization, aborting dynamic fog creation");
        return;
    }

    // Create dynamic fog with natural variation
    console.log("Creating dynamic level fog...");
    const dynamicFog = PIXEffect_fog.GenerateDynamicFog(FogStyle.LEVEL, "dynamic_level_fog", "html_c3", {
        intensityRange: { min: 0.4, max: 0.9 },  // 提高强度范围，确保可见性
        sizeRange: { min: 1.2, max: 1.8 },       // 使用更保守的尺寸范围，避免过小
        changeInterval: { min: 25, max: 45 },    // 适中的变化间隔
        disappearChance: 0.005,                  // 极低的消失概率
        disappearDuration: { min: 3, max: 8 },   // 短暂的消失时间
        transitionDuration: 15,                  // 平滑的过渡时间
        weatherInfluence: true,
        naturalVariation: true
    })
        .setPosition(0, 0)
        .setSize(6000, 3000)
        .setScale(1.5)      // 合理的初始缩放
        .setOpacity(0.8);   // 较高的初始透明度

    console.log("Dynamic fog enabled with weather influence and natural variation");
    return dynamicFog;
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

