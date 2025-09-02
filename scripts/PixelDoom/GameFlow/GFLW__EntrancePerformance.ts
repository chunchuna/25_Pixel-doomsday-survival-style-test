import { Unreal__ } from "../../engine.js";
import { Level2DCamera, PIXLevel } from "../Module/PIXLevel.js";



Unreal__.GameBegin(() => {

    if (Unreal__.runtime.globalVars.GameType != "Level") return


    GFLW__EntrancePerformance.initinstance();
    //testplayermove()

   
    GFLW__EntrancePerformance.BusFullShow();

    GFLW__EntrancePerformance.bus?.behaviors.moveto.addEventListener("arrived", () => {
        GFLW__EntrancePerformance.gp_showplayer();
        const levelVarsInstance = Unreal__.runtime
            .objects.LevelVars.getFirstInstance();
        if (levelVarsInstance) {
            levelVarsInstance.instVars.Bus = true;;
        }
    })
})




class GFLW__EntrancePerformance {

    static busgetthere = false;
    static player: null | InstanceType.RedHairGirlSprite = null;
    static bus: null | InstanceType.Bus = null;


    static async initinstance() {
        this.bus = Unreal__.runtime.objects.Bus.getFirstInstance();
        this.player = Unreal__.runtime.objects.RedHairGirlSprite.getFirstInstance();
    }

    static ani__busentering() {
        Level2DCamera.CameraZoomTarget = 0.65;
     
        this.bus = Unreal__.runtime.objects.Bus.getFirstInstance();
        if (this.bus == null) return;
        this.bus.x = -334
        this.bus.y = 2450;

        // do move bus 
        this.bus.behaviors.moveto.speed = 200;

        this.bus.behaviors.moveto.moveToPosition(741, 2450)




    }

    static gp_hideplayer() {
        this.player = Unreal__.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (this.player == null) return;
        if (this.bus == null) return;
        this.player.behaviors.MoveFunction.isIgnoringInput = true;

        this.player.isVisible = false;
        this.player.x = this.bus?.x;
        this.player.y = this.bus?.y - this.player.height;

        this.bus?.addChild(this.player,
            { "transformX": true, "transformY": true });


    }

    static async gp_showplayer() {
        this.bus = Unreal__.runtime.objects.Bus.getFirstInstance();
        this.player = Unreal__.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (this.player == null) return;
        if (this.bus == null) return;

        this.bus.removeChild(this.player)

        await Unreal__.WAIT_TIME_FORM_PROMISE(2)

        this.player.isVisible = true;
        // this.player.x=688;
        // this.player.y=2130;

        await Unreal__.WAIT_TIME_FORM_PROMISE(1)

        //this.player.behaviors.MoveFunction.simulateControl("up")
        this.player.behaviors.MoveTo.moveToPosition(688, 1955)
        this.player.behaviors.MoveTo.addEventListener("arrived", () => {
            this.player!.behaviors.MoveFunction.isIgnoringInput = false;
            Level2DCamera.CameraZoomTarget = 0.35;

        });

    }

     static async BusFullShow(){
        await Unreal__.WAIT_TIME_FORM_PROMISE(0.05)
        if (Unreal__.runtime
            .objects.LevelVars.getFirstInstance()
            ?.instVars.Bus == false) {
    
            GFLW__EntrancePerformance.gp_hideplayer();
            GFLW__EntrancePerformance.ani__busentering();
        }


    }

}

