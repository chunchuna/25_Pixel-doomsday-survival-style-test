import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";



var GAME$_CHARACTER_SINE_ANIMATION: InstanceType.CharacterSineAnimation;
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("typescript test34234")
    //@ts-ignore
    GAME$_CHARACTER_SINE_ANIMATION = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterSineAnimation.getFirstInstance();

    if (GAME$_CHARACTER_CONTROLLER == null) {

        //@ts-ignore
        GAME$_CHARACTER_CONTROLLER = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterController.getFirstInstance();
        //console.log(GAME$_CHARACTER_CONTROLLER)

    }
    if (GAME$_CHARACTER_SINE_ANIMATION == null) return

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionISMoving", () => {

        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = true;

    })

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionNotMoving", () => {

        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = false;
        GAME$_CHARACTER_CONTROLLER.angle = 0;

    })

})



