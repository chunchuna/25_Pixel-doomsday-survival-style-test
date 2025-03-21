import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";


enum GAME_TYPE {
    LEVEL = "Level",

}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[CharacterController] init")
})


//@ts-ignore
var GAME$_KEYBOARD_INSTAHCE: IConstructProjectObjects.Keyboard;
//@ts-ignore
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.GameType != GAME_TYPE.LEVEL) return


    // Get KEYBOARD
    //@ts-ignore

    if (GAME$_KEYBOARD_INSTAHCE == null) {
        GAME$_KEYBOARD_INSTAHCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Keyboard;
        console.log(GAME$_KEYBOARD_INSTAHCE)

    }


    // Get PLAYER
    //@ts-ignore
    if (GAME$_CHARACTER_CONTROLLER == null) {

        //@ts-ignore
        GAME$_CHARACTER_CONTROLLER = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterController.getFirstInstance();
        console.log(GAME$_CHARACTER_CONTROLLER)

    }


})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    if (GAME$_CHARACTER_CONTROLLER == null) return;

    //console.log(GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX)

    if (GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX < -0) {
        GAME$_CHARACTER_CONTROLLER.width = - Math.abs(GAME$_CHARACTER_CONTROLLER.width)
    }

    if (GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX > 0) {
        GAME$_CHARACTER_CONTROLLER.width = Math.abs(GAME$_CHARACTER_CONTROLLER.width)
    }
})




pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.GameType != GAME_TYPE.LEVEL) return
    if (GAME$_KEYBOARD_INSTAHCE == null) return
    if (GAME$_CHARACTER_CONTROLLER == null) return

    if (GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyW")) {
        GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("up");
    }
    if (GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyS")) {
        GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("down");
    }
    if (GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyA")) {
        GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("left");
    }
    if (GAME$_KEYBOARD_INSTAHCE.isKeyDown("KeyD")) {
        GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.simulateControl("right");
    }
})  
