import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";



var PLAYER_IS_DO_WALK_SINE = false;
var GAME$_CHARACTER_SINE_ANIMATION: InstanceType.CharacterSineAnimation;
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    //@ts-ignore
    GAME$_CHARACTER_SINE_ANIMATION = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterSineAnimation.getFirstInstance();

    if (GAME$_CHARACTER_CONTROLLER == null) {

        //@ts-ignore
        GAME$_CHARACTER_CONTROLLER = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.CharacterController.getFirstInstance();
        //console.log(GAME$_CHARACTER_CONTROLLER)

    }
    if (GAME$_CHARACTER_SINE_ANIMATION == null) return

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionISMoving", () => {
        if (PLAYER_IS_DO_WALK_SINE == false) {
            if (GAME$_CHARACTER_SINE_ANIMATION == null) return
            GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = true;
            PLAYER_IS_DO_WALK_SINE = true;
        }
    })

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("CharacterControllerMoveFunctionNotMoving", () => {
        if (PLAYER_IS_DO_WALK_SINE == true) {
            if (GAME$_CHARACTER_SINE_ANIMATION == null) return
            GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = false;
            PLAYER_IS_DO_WALK_SINE = false;
            GAME$_CHARACTER_CONTROLLER.angle = 0;

        }
    })
})



