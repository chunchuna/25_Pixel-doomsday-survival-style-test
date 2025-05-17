import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";


// new eventhandler test

// pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
//     pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("MouseClick", (e: any) => {
//         console.log("MouseClick")
//         console.log(e.data)
//         console.log(e.data.state)
//     },)
// })


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[CharacterController] init")
})


//@ts-ignore
var GAME$_KEYBOARD_INSTAHCE: IConstructProjectObjects.Keyboard;
//@ts-ignore
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.GameType != GAME_TYPE.LEVEL) return



    //@ts-ignore
    GAME$_KEYBOARD_INSTAHCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.Keyboard;
    console.log(GAME$_KEYBOARD_INSTAHCE)


    //@ts-ignore
    GAME$_CHARACTER_CONTROLLER = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterController.getFirstInstance();
    console.log(GAME$_CHARACTER_CONTROLLER)

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

    if (GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX > 0 || GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY > 0) {

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




