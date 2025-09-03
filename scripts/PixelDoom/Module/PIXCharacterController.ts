import { Unreal__ } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";
import { UIInteractionPanelActionChooseMain } from "../UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js";


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

    static SitDown: boolean = false;

    static async TogglePlayerCharacterSitState() {
        if (this.SitDown) {
            Unreal__.SendEvent("CharacterControllerStand", "")
        }
        if (!this.SitDown) {
            this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.stop();
            this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.setVector(0,0);
            Unreal__.SendEvent("CharacterControllerSeat", "")
        }
    }
}




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

// Input 
// 坐下
Unreal__.GameBegin(() => {
    document.addEventListener("keydown", (Event: any) => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return

        if(PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isIgnoringInput) return

        if (Event.key === "c") {
            PlayerController.TogglePlayerCharacterSitState();
        }
    })
    if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return

    PlayerController.GAME$_CHARACTER_CONTROLLER.addEventListener("animationend", (Event) => {
        if (Event.animationName == "Seat") {
            PlayerController.SitDown = true;
        }
        if (Event.animationName == "Stand") {
            PlayerController.SitDown = false;

        }

    })

})

// 移动
Unreal__.GameUpdate(() => {
    if (Unreal__.runtime.globalVars.GameType != GAME_TYPE.LEVEL) return
    if (PlayerController.GAME$_KEYBOARD_INSTAHCE == null) return
    if (PlayerController.GAME$_CHARACTER_CONTROLLER == null) return

    if(PlayerController.SitDown) return
    if(PlayerController.GAME$_CHARACTER_CONTROLLER.animationName=="Seat" || PlayerController.GAME$_CHARACTER_CONTROLLER.animationName=="Stand") return

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

// Disable player movement when interaction is active
Unreal__.GameBegin(() => {
    UIInteractionPanelActionChooseMain.OnInteractionOpen(() => {
        // First stop the player completely, then disable movement

        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.stop();
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.setVector(0, 0);
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isEnabled = false;
    })

    UIInteractionPanelActionChooseMain.OnInteractionClose(() => {
        if (!PlayerController.GAME$_CHARACTER_CONTROLLER) return
        PlayerController.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isEnabled = true;
    })

})


