import { Unreal__ } from "../../engine.js";
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

export class PIXLevel {
    static async GoToLayoutByTransitionEffect(LevelName: string) {
        LayoutTransition.LeaveLayout(TransitionType.HOLE, 2).onFinish(() => {
            Unreal__.runtime.goToLayout(LevelName)
        })
    }
}

// 相机相关 

Unreal__.GameBegin(()=>{Level2DCamera.CameraInit();Level2DCamera.ShortKey()})
Unreal__.GameUpdate(()=>{Level2DCamera.UpdateCamera()})
export class Level2DCamera {

    
    static CameraZoomValue: number = 0.3;
    static CameraZoomTarget: number = 0.5;

    static StandCameraZoomValue = 0.5;

    static CameraInit() {
        if (Unreal__.runtime.layout.name != "Level") return
        //Unreal__.runtime.layout.scale = Level2DCamera.StandCameraZoomValue;
        //Unreal__.runtime.layout.scale = Level2DCamera.CameraZoomTarget;
    }

    static ShortKey() {
        // 添加键盘事件监听，用于调整缩放
        
        document.addEventListener('keydown', (Event) => {
            if (Event.key === '+' || Event.key === '=') {
                Level2DCamera.CameraZoomTarget = Math.min(Level2DCamera.CameraZoomTarget + 0.1, 2.0);
            } else if (Event.key === '-' || Event.key === '_') {
                Level2DCamera.CameraZoomTarget = Math.max(Level2DCamera.CameraZoomTarget - 0.1, 0.35);
            }
        });
    }

    static UpdateCamera(){
        if (Unreal__.runtime.layout.name != "Level") return
        Level2DCamera.CameraZoomValue = Unreal__.Justlerp(Level2DCamera.CameraZoomValue, Level2DCamera.CameraZoomTarget, 0.05);
        //console.log("当前缩放: " + CameraZoomValue + ", 目标缩放: " + CameraZoomTarget);
        Unreal__.runtime.layout.scale = Level2DCamera.CameraZoomValue;

    }

}



// 离开Level
Unreal__.GameEnd(() => {

    if (Unreal__.GetGameCurrentLayoutName() !== "Level") return
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

    Unreal__.WAIT_TIME_FORM_PROMISE(0.1)

    // Close interaction panel 
    UIInteractionPanelActionChooseMain.CloseChoosePanle();
    // Clean up variable monitoring
    VariableMonitoring.CleanupDestroyed();
})


// ================================================================
// debug 相关
var isBindButtonIntoDebugPanel = false;
Unreal__.GameBegin(() => {

    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    // IMGUI 面本绘制按钮
    var level_cat = IMGUIDebugButton.AddCategory("Level")

    if (level_cat) {

        IMGUIDebugButton.AddButtonToCategory(level_cat, "go layout [main_menu]", () => {
            if (Unreal__.runtime.layout.name == "MainMenu") return
            PIXLevel.GoToLayoutByTransitionEffect("MainMenu")
        })

    }
})