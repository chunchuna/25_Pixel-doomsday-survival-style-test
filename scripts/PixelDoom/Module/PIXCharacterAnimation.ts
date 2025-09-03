import { Unreal__ } from "../../engine.js";



var GAME$_CHARACTER_SINE_ANIMATION: InstanceType.CharacterSineAnimation;
var GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController;


Unreal__.GameBegin(() => {
    console.log("typescript test34234")
    //@ts-ignore
    GAME$_CHARACTER_SINE_ANIMATION = Unreal__.runtime.objects.CharacterSineAnimation.getFirstInstance();

    if (GAME$_CHARACTER_CONTROLLER == null) {
        //@ts-ignore
        GAME$_CHARACTER_CONTROLLER = Unreal__.runtime.objects.CharacterController.getFirstInstance();
        //console.log(GAME$_CHARACTER_CONTROLLER)
    }
    if (GAME$_CHARACTER_SINE_ANIMATION == null) return

    Unreal__.GetEvent("CharacterControllerMoveFunctionISMoving", () => {
        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        //GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = true;
        GAME$_CHARACTER_CONTROLLER.setAnimation("Walk")
    })

    Unreal__.GetEvent("CharacterControllerMoveFunctionNotMoving", () => {
        if (GAME$_CHARACTER_SINE_ANIMATION == null) return
        //GAME$_CHARACTER_SINE_ANIMATION.behaviors.CharacterWalkAnimtion.isEnabled = false;
        GAME$_CHARACTER_CONTROLLER.angle = 0;
        GAME$_CHARACTER_CONTROLLER.setAnimation("Idle")

    })

})



