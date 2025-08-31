import { hf_engine } from "../../engine.js";
import { PLAYER_MAIN_INVENTORY_LEVEL } from "../Group/Player/PIXPlayerInventory.js";
import { IMGUIDebugButton } from "../UI/debug_ui/UIDbugButton.js";
import { DEBUG } from "../UI/debug_ui/UIDebug.js";
import { VariableMonitoring } from "../UI/debug_ui/UIvariableMonitoring.js";
import type { DialogueSystem } from "../UI/dialogue_ui/UIDialogue.js";
import { UIInteractionPanelActionChooseMain } from "../UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js";
import { inventoryManager } from "../UI/inventory_ui/UIInventory.js";
import { LayoutTransition, TransitionType } from "../UI/layout_transition_ui/UILayoutTransition.js";
import { TransitionEffectType, UIScreenEffect } from "../UI/screeneffect_ui/UIScreenEffect.js";
import { _Audio } from "./PIXAudio.js";
import { WEATHER_TYPE, WeatherState } from "./PIXWeather.js";




export class LevelMain {
    static CameraZoomValue: number = 0.5;
    static CameraZoomTarget: number = 0.5;
    
    static async JumpOtehrLayoutFromLevel(LevelName: string) {

        // UIScreenEffect.FadeOut(800, TransitionEffectType.WIPE_RADIAL, async () => {
        //     pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout(LevelName)
        // })
        LayoutTransition.LeaveLayout(TransitionType.HOLE, 2).onFinish(() => {
            hf_engine.runtime.goToLayout(LevelName)
        })


    }
}


hf_engine.gl$_ubu_init(() => {

    if (hf_engine.runtime.layout.name != "Level") return

    // 初始化时设置初始值
    LevelMain.CameraZoomValue = 0.8;
    LevelMain.CameraZoomTarget = 0.35; // 确保两个值初始一致
    hf_engine.runtime.layout.scale = LevelMain.CameraZoomValue;

    // 添加键盘事件监听，用于调整缩放
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') {
            LevelMain.CameraZoomTarget = Math.min(LevelMain.CameraZoomTarget + 0.1, 2.0);
        } else if (e.key === '-' || e.key === '_') {
            LevelMain.CameraZoomTarget = Math.max(LevelMain.CameraZoomTarget - 0.1, 0.35);
        }
    });

    hf_engine.runtime.layout.scale = 1;


})


hf_engine.gl$_ubu_update(() => {
    //  平滑镜头缩放

    if (hf_engine.runtime.layout.name != "Level") return
    // 使用更合适的插值系数(0.05)来实现平滑过渡
    LevelMain.CameraZoomValue = hf_engine.Justlerp(LevelMain.CameraZoomValue, LevelMain.CameraZoomTarget, 0.05);
    //console.log("当前缩放: " + CameraZoomValue + ", 目标缩放: " + CameraZoomTarget);
    hf_engine.runtime.layout.scale = LevelMain.CameraZoomValue;

})

// debug 相关
var isBindButtonIntoDebugPanel = false;
hf_engine.gl$_ubu_init(() => {

    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    // IMGUI 面本绘制按钮
    var level_cat = IMGUIDebugButton.AddCategory("Level")

    if (level_cat) {

        IMGUIDebugButton.AddButtonToCategory(level_cat, "go layout [main_menu]", () => {
            if (hf_engine.runtime.layout.name == "MainMenu") return
            LevelMain.JumpOtehrLayoutFromLevel("MainMenu")
        })

    }
})


hf_engine.gl$_layout_end(() => {


    if (hf_engine.gl$_getlayoutname() !== "Level") return
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

    hf_engine.WAIT_TIME_FORM_PROMISE(0.1)

    // Close interaction panel 
    UIInteractionPanelActionChooseMain.CloseChoosePanle();
    // Clean up variable monitoring
    VariableMonitoring.CleanupDestroyed();
})

