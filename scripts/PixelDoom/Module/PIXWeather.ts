import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { _Audio } from "./PIXAudio.js";

enum WEATHER_TYPE {
    RAIN = "Rain",
    NORMAL = "Normal"
}
var CurrentWeather: WEATHER_TYPE | null = null;
var CurrentInterval: number | null = null; // 当前的计时器
// 声明全局变量
let visibilityChangeHandler: EventListener;

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

    if (CurrentInterval != null) {
        clearInterval(CurrentInterval);
        CurrentInterval = null;
    }

    _Audio.AudioPlayCycle("Rain", -10, 1, "Rain");

    var RainDropSpriteClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Raindrop;
    var GameLayoutdth = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.width;
    var GameLayoutHeight = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.height;
    
    // 定义可见性变化事件处理函数
    visibilityChangeHandler = function(event) {
        if (document.hidden) {
            // 页面不可见，清除定时器
            if (CurrentInterval != null) {
                clearInterval(CurrentInterval);
                CurrentInterval = null;
            }
        } else {
            // 页面重新可见，重新启动雨滴生成但避免集中生成
            if (CurrentInterval == null && CurrentWeather === WEATHER_TYPE.RAIN) {
                // 重新启动前先随机分散一些雨滴在屏幕上
                for (let i = 0; i < 20; i++) { 
                    RainDropSpriteClass.createInstance(
                        "Rain",
                        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-5000, GameLayoutdth),
                        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-500, GameLayoutHeight/2),
                        false
                    );
                }
                
                // 重新启动定时器
                CurrentInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
                    // 一次性创建多个雨滴，但数量减少，增加生成频率
                    for (let i = 0; i < 15; i++) {
                        RainDropSpriteClass.createInstance(
                            "Rain",
                            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-5000, GameLayoutdth),
                            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-500, 20),
                            false
                        );
                    }
                }, 0.1);
            }
        }
    } as EventListener;
    
    // 先移除任何已存在的监听器，避免重复
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    // 注册新的监听器
    document.addEventListener("visibilitychange", visibilityChangeHandler);
    
    // 初始启动雨滴生成
    CurrentInterval = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FROM_PROMIS_ERVYSECOND(() => {
        // 一次性创建多个雨滴，但减少数量并增加频率
        for (let i = 0; i < 15; i++) {
            RainDropSpriteClass.createInstance(
                "Rain",
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(-100, GameLayoutdth),
                pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GetRandomNumber(0, 20),
                false
            );
        }
    }, 0.1);
}

async function Normal() {
    CurrentWeather = WEATHER_TYPE.NORMAL;
    
    // 移除visibilitychange事件监听器
    if (visibilityChangeHandler) {
        document.removeEventListener("visibilitychange", visibilityChangeHandler);
    }
    
    if (CurrentInterval != null) {
        clearInterval(CurrentInterval);
        CurrentInterval = null;
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