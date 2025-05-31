import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { PIXEffect_fog } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { PLAYER_MAIN_INVENTORY_LEVEL } from "../Group/Player/PIXPlayerInventory.js";
import { IMGUIDebugButton } from "../UI/debug_ui/UIDbugButton.js";
import { DEBUG } from "../UI/debug_ui/UIDebug.js";
import { VariableMonitoring } from "../UI/debug_ui/UIvariableMonitoring.js";
import type { DialogueSystem } from "../UI/dialogue_ui/UIDialogue.js";
import { UIInteractionPanelActionChooseMain } from "../UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js";
import { inventoryManager } from "../UI/inventory_ui/UIInventory.js";
import { TransitionEffectType, UIScreenEffect } from "../UI/screeneffect_ui/UIScreenEffect.js";
import { _Audio } from "./PIXAudio.js";
import { WEATHER_TYPE, WeatherState } from "./PIXWeather.js";




var CameraZoomValue: number = 0.5;
var CameraZoomTarget = 0.5;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    // 初始化时设置初始值
    CameraZoomValue = 0.8;
    CameraZoomTarget = 0.35; // 确保两个值初始一致
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;

    // 添加键盘事件监听，用于调整缩放
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') {
            CameraZoomTarget = Math.min(CameraZoomTarget + 0.1, 2.0);
        } else if (e.key === '-' || e.key === '_') {
            CameraZoomTarget = Math.max(CameraZoomTarget - 0.1, 0.35);
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
    var LevelFather = DEBUG.DebugMainUI.DebuPanelAddFatherButton("LEVEL")
    LevelFather.AddChildButton(" go main menu", () => {
        if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name == "MainMenu") return
        GAMEPLAY_LEVEL.JumpOtehrLayoutFromLevel("MainMenu")

    })

    // IMGUI 面本绘制按钮
    var level_cat = IMGUIDebugButton.AddCategory("Level")
    if (level_cat) {
        IMGUIDebugButton.AddButtonToCategory(level_cat, "go layout [main_menu]", () => {
            if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name == "MainMenu") return
            GAMEPLAY_LEVEL.JumpOtehrLayoutFromLevel("MainMenu")
        })

    }
})

export class GAMEPLAY_LEVEL {
    static async JumpOtehrLayoutFromLevel(LevelName: string) {

        UIScreenEffect.FadeOut(800, TransitionEffectType.WIPE_RADIAL, async () => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout(LevelName)
        })

    }
}


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_layout_end(() => {


    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_getlayoutname() !== "Level") return
    // Close environment sound effects
    //_Audio.AudioStop("NiaoJiao")

    // Rain needs to close rain particles and rain sound music
    if (WeatherState.CurrentWeather = WEATHER_TYPE.RAIN) {
        _Audio.AudioStopAll()
    }

    // Destroy dialogue panel related elements because it always blocks other panels 
    //@ts-ignore
    var DialogueWhole: DialogueSystem = DialogueMainController;
    DialogueWhole.DestroyDialogue();

    // Close inventory panel related elements
    inventoryManager.HideAllInventories();

    // Check if PLAYER_MAIN_INVENTORY_LEVEL.MAIN exists before calling unbind
    if (PLAYER_MAIN_INVENTORY_LEVEL.MAIN && typeof PLAYER_MAIN_INVENTORY_LEVEL.MAIN.unbind === 'function') {
        PLAYER_MAIN_INVENTORY_LEVEL.MAIN.unbind(); // Unbind main inventory
    }

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(0.1)

    // Close interaction panel 
    UIInteractionPanelActionChooseMain.CloseChoosePanle();
    // Clean up variable monitoring
    VariableMonitoring.CleanupDestroyed();
})

