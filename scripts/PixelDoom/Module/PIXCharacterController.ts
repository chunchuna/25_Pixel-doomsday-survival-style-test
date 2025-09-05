import { Unreal__ } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";
import { UIInteractionPanelActionChooseMain } from "../UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js";
import { CharacterStateManager, CharacterState } from "./PIXCharacterState.js";


// new eventhandler test

// pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
//     pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("MouseClick", (e: any) => {
//         console.log("MouseClick")
//         console.log(e.data)
//         console.log(e.data.state)
//     },)
// })


Unreal__.GameBegin(() => {
    console.log("[CharacterController] init")
})




class PlayerController {
    //@ts-ignore
    static GAME$_KEYBOARD_INSTAHCE: IConstructProjectObjects.Keyboard;
    //@ts-ignore
    static GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;

}



// 初始化
Unreal__.GameBegin(() => {

    if (Unreal__.runtime.globalVars.GameType != GAME_TYPE.LEVEL) return
    //@ts-ignore
    PlayerController.GAME$_KEYBOARD_INSTAHCE = Unreal__.runtime.objects.Keyboard;
    console.log(PlayerController.GAME$_KEYBOARD_INSTAHCE)
    //@ts-ignore
    PlayerController.GAME$_CHARACTER_CONTROLLER = Unreal__.runtime.objects.CharacterController.getFirstInstance();
    console.log(PlayerController.GAME$_CHARACTER_CONTROLLER)

})

// 翻转
Unreal__.GameUpdate(() => {
    if (PlayerController.GAME$_CHARACTER_CONTROLLER == null) return;

    //console.log(GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX)

    if (PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX < -0) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.width = - Math.abs(PlayerController.GAME$_CHARACTER_CONTROLLER.width)
    }

    if (PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX > 0) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.width = Math.abs(PlayerController.GAME$_CHARACTER_CONTROLLER.width)
    }
})

// =========INPUT
// 坐下
Unreal__.GameBegin(() => {
    document.addEventListener("keydown", (Event: any) => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return

        if (PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isIgnoringInput) return

        if (Event.key === "c") {
            const currentState = CharacterStateManager.GetCurrentState();
            if (currentState === CharacterState.Sitting) {
                CharacterStateManager.SwitchState(CharacterState.StandingUp);
            } else if (currentState === CharacterState.Idle) {
                CharacterStateManager.SwitchState(CharacterState.SittingDown);
            }
        }
    })
})
// 打伞
Unreal__.GameBegin(() => {
    document.addEventListener("keydown", (Event) => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return

        if (PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isIgnoringInput) return
        if (Event.key === "t") {
            const currentState = CharacterStateManager.GetCurrentState();
            if (currentState === CharacterState.Idle) {
                CharacterStateManager.SwitchState(CharacterState.OpeningUmbrella);
            }
            if (currentState === CharacterState.UmbrellaIdle) {
                CharacterStateManager.SwitchState(CharacterState.CloseingUmbrella);
            }
        }

    })



})

// 移动
Unreal__.GameUpdate(() => {
    if (Unreal__.runtime.globalVars.GameType != GAME_TYPE.LEVEL) return
    if (PlayerController.GAME$_KEYBOARD_INSTAHCE == null) return
    if (PlayerController.GAME$_CHARACTER_CONTROLLER == null) return

    const currentState = CharacterStateManager.GetCurrentState();
    if (currentState !== CharacterState.Idle && currentState !== CharacterState.Walking && currentState !== CharacterState.UmbrellaIdle
        && currentState !== CharacterState.UmbrellaWalk) {
        return;
    }

    if (PlayerController.GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyW")) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("up");
    }
    if (PlayerController.GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyS")) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("down");
    }
    if (PlayerController.GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyA")) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("left");
    }
    if (PlayerController.GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyD")) {
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("right");
    }
})

// 互动时
Unreal__.GameBegin(() => {
    UIInteractionPanelActionChooseMain.OnInteractionOpen(() => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return
        CharacterStateManager.SwitchState(CharacterState.Interacting);
    })

    UIInteractionPanelActionChooseMain.OnInteractionClose(() => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return
        CharacterStateManager.SwitchState(CharacterState.Idle);
    })

})


