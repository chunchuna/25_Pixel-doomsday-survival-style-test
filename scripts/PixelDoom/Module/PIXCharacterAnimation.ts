import { hf_engine } from "../../engine.js";



var GAME$_CHARACTER_SINE_ANIMATION: InstanceType.CharacterSineAnimation;
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;


hf_engine.gl$_ubu_init(() => {
    console.log("typescript test34234")
    //@ts-ignore
    GAME$_CHARACTER_SINE_ANIMATION = hf_engine.runtime.objects.CharacterSineAnimation.getFirstInstance();

    if (GAME$_CHARACTER_CONTROLLER == null) {

        //@ts-ignore
        GAME$_CHARACTER_CONTROLLER = hf_engine.runtime.objects.CharacterController.getFirstInstance();
        //console.log(GAME$_CHARACTER_CONTROLLER)

    }
    if (GAME$_CHARACTER_SINE_ANIMATION == null) return

    hf_engine.gl$_call_eventhandle_("CharacterControllerMoveFunctionISMoving", () => {

        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = true;

    })

    hf_engine.gl$_call_eventhandle_("CharacterControllerMoveFunctionNotMoving", () => {

        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = false;
        GAME$_CHARACTER_CONTROLLER.angle = 0;

    })

})



