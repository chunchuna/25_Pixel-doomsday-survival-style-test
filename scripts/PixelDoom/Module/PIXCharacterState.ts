import { Unreal__ } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";

export enum CharacterState {
    Idle,
    Walking,
    // 坐下站立
    SittingDown,
    Sitting,
    StandingUp,
    // 互动
    Interacting,
    // 打伞
    OpeningUmbrella,
    CloseingUmbrella,
    UmbrellaIdle,
    UmbrellaWalk,

}

export class CharacterStateManager {
    private static currentState: CharacterState;
    private static GAME$_CHARACTER_CONTROLLER: InstanceType.CharacterController | null = null;

    public static Init() {
        this.GAME$_CHARACTER_CONTROLLER = Unreal__.runtime.objects.CharacterController.getFirstInstance();
        if (!this.GAME$_CHARACTER_CONTROLLER) {
            console.error("CharacterController not found!");
            return;
        }

        this.SwitchState(CharacterState.Idle);

        this.GAME$_CHARACTER_CONTROLLER.addEventListener("animationend", (event: any) => this.OnAnimationEnd(event));
    }

    public static SwitchState(newState: CharacterState) {
        if (this.currentState === newState) return;

        this.OnExitState(this.currentState);
        this.currentState = newState;
        this.OnEnterState(this.currentState);
    }

    public static GetCurrentState(): CharacterState {
        return this.currentState;
    }

    private static OnEnterState(state: CharacterState) {
        if (!this.GAME$_CHARACTER_CONTROLLER) return;

        switch (state) {
            case CharacterState.Idle:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("Idle");
                break;
            case CharacterState.Walking:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("Walk");
                break;
            case CharacterState.SittingDown:
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.stop();
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.setVector(0, 0);
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("Seat");
                break;
            case CharacterState.Sitting:
                // The character is now in a sitting state.
                break;
            case CharacterState.StandingUp:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("Stand");
                break;
            case CharacterState.Interacting:
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.stop();
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.setVector(0, 0);
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isEnabled = false;

                const isMoving = this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX !== 0 || this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY !== 0;
                if (isMoving) {
                    this.GAME$_CHARACTER_CONTROLLER.setAnimation("Idle");
                }
                break;

            case CharacterState.UmbrellaIdle:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("UmbrellaIdle")
                break
            case CharacterState.UmbrellaWalk:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("UmbrellaWalk")
                break
            case CharacterState.OpeningUmbrella:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("OpeningUmbrella")
                break
            case CharacterState.CloseingUmbrella:
                this.GAME$_CHARACTER_CONTROLLER.setAnimation("CloseingUmbrella")
                break
        }
    }

    private static OnExitState(state: CharacterState) {
        if (!this.GAME$_CHARACTER_CONTROLLER) return;

        switch (state) {
            case CharacterState.Interacting:
                this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.isEnabled = true;
                break;
            // Add other exit logic if needed
        }
    }

    private static OnAnimationEnd(event: { animationName: string; }) {
        switch (event.animationName) {
            case "Seat":
                this.SwitchState(CharacterState.Sitting);
                break;
            case "Stand":
                this.SwitchState(CharacterState.Idle);
                break;
            case "OpeningUmbrella":
                this.SwitchState(CharacterState.UmbrellaIdle)
                break
            case "CloseingUmbrella":
                this.SwitchState(CharacterState.Idle)
                break
        }
    }

    public static Update() {
        if (!this.GAME$_CHARACTER_CONTROLLER) return;

        switch (this.currentState) {
            case CharacterState.Idle:
                if (this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX !== 0 || this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY !== 0) {
                    this.SwitchState(CharacterState.Walking);
                }
                break;
            case CharacterState.Walking:
                if (this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX === 0 && this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY === 0) {
                    this.SwitchState(CharacterState.Idle);
                }
                break;

            // 如果是打伞状态
            case CharacterState.UmbrellaIdle:
                if (this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX !== 0 || this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY !== 0) {
                    this.SwitchState(CharacterState.UmbrellaWalk);
                }
                break;
            case CharacterState.UmbrellaWalk:
                if (this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorX === 0 && this.GAME$_CHARACTER_CONTROLLER.behaviors.MoveFunction.vectorY === 0) {
                    this.SwitchState(CharacterState.UmbrellaIdle);
                }
                break;

        }
    }
}

Unreal__.GameBegin(() => {
    // A short delay to ensure the character instance is ready.
    setTimeout(() => {
        if (Unreal__.runtime.globalVars.GameType !== GAME_TYPE.LEVEL) return;
        CharacterStateManager.Init();
    }, 100);
});

Unreal__.GameUpdate(() => {
    if (Unreal__.runtime.globalVars.GameType !== GAME_TYPE.LEVEL) return;
    CharacterStateManager.Update();
});
