import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal"
}
var CurrentWeather = null;
// @ts-ignore
var CurrentInterval = null; // 当前的计时器

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    handleWeather();
})

async function handleWeather() {
    Rain(); // 开始下雨
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(3000); // 等待 3 秒
    Normal(); // 关闭小雨
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(5000); // 等待 5 秒
    Rain(); // 重新开始下雨
}


async function Rain() {

    CurrentWeather = WEATHER_TYPE.RAIN;

    console.log("开始下雨")
    // @ts-ignore
    if (CurrentInterval != null) {
        // @ts-ignore
        clearInterval(CurrentInterval);
    }

    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    var GameLayoutdth = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.width;
    //console.log(GameLayoutdth)
    CurrentInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
        var RainmDropSprite = RainDropSpriteClass.createInstance("Rain", pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-100, GameLayoutdth), 10, false)
    }, 0.0001)

}

async function Normal() {

    CurrentWeather = WEATHER_TYPE.NORMAL;
    // @ts-ignore
    if (CurrentInterval != null) {
        // @ts-ignore
        clearInterval(CurrentInterval);
    }
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    RainDropSpriteClass.addEventListener("instancecreate", (e) => {
        e.instance.angleDegrees = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(68, 70)
        console.log(e.instance.angleDegrees)
        e.instance.behaviors.Timer.startTimer(5, "DestroyTimer", "once")
        e.instance.behaviors.Timer.addEventListener("timer", (e) => {
            //console.log(e.tag)
            if (e.tag == "destroytimer") {
                e.instance.destroy();
                console.log("Rain Destroy")
            }
        })

    })
})