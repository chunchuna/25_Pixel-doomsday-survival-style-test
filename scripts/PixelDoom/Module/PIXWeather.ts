import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
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
// Track fog state to prevent multiple calls
let isFogEnabled: boolean = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    WeatherC3Timer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Rain", -100, -100)
    handleWeather();
})

async function handleWeather() {
    EnableFog(); // Use dynamic fog instead of static fog
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
        for (let i = 0; i < 50; i++) {
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

export function EnableFog(): void {
   
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

