import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

export enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal"
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

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    WeatherC3Timer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Rain", -100, -100)
    handleWeather();
})

async function handleWeather() {
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
    if (WeatherC3Timer.behaviors.Timer.isTimerRunning("rain")) {
        WeatherC3Timer.behaviors.Timer.stopTimer("rain")
    }
    _Audio.AudioStop("Rain");
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

