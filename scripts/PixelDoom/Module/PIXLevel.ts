import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { DEBUG } from "../UI/debug_ui/UIDebug.js";
import type { DialogueSystem } from "../UI/dialogue_ui/UIDialogue.js";
import { inventoryManager } from "../UI/inventory_ui/UIInventory.js";
import { TransitionEffectType, UIScreenEffect } from "../UI/screeneffect_ui/UIScreenEffect.js";
import { _Audio } from "./PIXAudio.js";
import { WEATHER_TYPE, WeatherState } from "./PIXWeather.js";




var CameraZoomValue: number = 0.5;
var CameraZoomTarget = 0.5;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    // 初始化时设置初始值
    CameraZoomValue = 1;
    CameraZoomTarget = 0.5; // 确保两个值初始一致
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;

    // 添加键盘事件监听，用于调整缩放
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') {
            CameraZoomTarget = Math.min(CameraZoomTarget + 0.1, 2.0);
        } else if (e.key === '-' || e.key === '_') {
            CameraZoomTarget = Math.max(CameraZoomTarget - 0.1, 0.2);
        }
    });

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = 1;


})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    //  平滑镜头缩放

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return
    // 使用更合适的插值系数(0.05)来实现平滑过渡
    CameraZoomValue = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.Justlerp(CameraZoomValue, CameraZoomTarget, 0.05);
    //console.log("当前缩放: " + CameraZoomValue + ", 目标缩放: " + CameraZoomTarget);
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;

})

// debug 相关
var isBindButtonIntoDebugPanel = false;
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    //DEBUG 面板绘制 
    if (!DEBUG.DebugMainUI) return

    DEBUG.DebugMainUI.DebuPanelAddButton("跳转到mainmenu场景", () => {
        if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name == "MainMenu") return
        GAMEPLAY_LEVEL.JumpOtehrLayoutFromLevel("MainMenu")

    })
})

export class GAMEPLAY_LEVEL {
    static async JumpOtehrLayoutFromLevel(LevelName: string) {
       
        //关闭环境音效
        _Audio.AudioStop("NiaoJiao")
       
        //下雨需要关闭雨粒子 关闭雨声音乐
        if (WeatherState.CurrentWeather = WEATHER_TYPE.RAIN) {
            _Audio.AudioStopAll()
        }
       
        // 销毁dialogue 面板相关元素 因为他老是再阻挡其他面板 
        //@ts-ignore
        var DialogueWhole: DialogueSystem = DialogueMainController;
        DialogueWhole.DestroyDialogue();

        // 关闭 库存面板相关元素
        inventoryManager.HideAllInventories();
        
        await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(0.1)
        
        UIScreenEffect.FadeOut(800, TransitionEffectType.WIPE_RADIAL, async () => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout(LevelName)

        })
    }
}

