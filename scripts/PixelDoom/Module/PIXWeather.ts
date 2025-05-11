import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal"
}
var CurrentWeather = null;
// @ts-ignore
var CurrentInterval = null; // 当前的计时器

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return
    handleWeather();
})

async function handleWeather() {
    Rain();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(3000); // 等待 3 秒
    // Normal();
    // await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(5000); // 等待 5 秒
    // Rain(); 
}

async function Rain() {

    CurrentWeather = WEATHER_TYPE.RAIN;

    // @ts-ignore
    if (CurrentInterval != null) {
        // @ts-ignore
        clearInterval(CurrentInterval);
    }

    _Audio.AudioPlayCycle("Rain", -10, 1, "Rain");

    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    var GameLayoutdth = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.width;
    //console.log(GameLayoutdth)
    // CurrentInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
    //     var RainmDropSprite = RainDropSpriteClass.createInstance("Rain", pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-100, GameLayoutdth), 10, false)
    // }, 0.0000000000000001)

    CurrentInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
        // 一次性创建多个雨滴
        for (let i = 0; i < 90; i++) { // 每次创建10个雨滴
            RainDropSpriteClass.createInstance(
                "Rain",
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-100, GameLayoutdth),
                10,
                false
            );
        }
    }, 0.3);

}

async function Normal() {

    CurrentWeather = WEATHER_TYPE.NORMAL;
    // @ts-ignore
    if (CurrentInterval != null) {
        // @ts-ignore
        clearInterval(CurrentInterval);
    }

    _Audio.AudioStop("Rain")
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