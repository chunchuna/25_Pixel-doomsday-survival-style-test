import { hf_engine } from "../../engine.js";

hf_engine.gl$_ubu_init(()=>{

    if(hf_engine.runtime.globalVars.GameType!="Level") return
    var IsNewGame = hf_engine.runtime.globalVars.NewGame;
    GFLW__EntrancePerformance.initinstance();
    //testplayermove()

    // if(IsNewGame){
    //     GFLW__EntrancePerformance.gp_hideplayer();
    //     GFLW__EntrancePerformance.ani__busentering();
    // }
    
    // GFLW__EntrancePerformance.bus?.behaviors.moveto.addEventListener("arrived",()=>{
    //     GFLW__EntrancePerformance.gp_showplayer();
    //     hf_engine.runtime.globalVars.NewGame=false;
    // })
})

async function  testplayermove(){
    GFLW__EntrancePerformance.initinstance();
    await hf_engine.WAIT_TIME_FORM_PROMISE(2)
    if(GFLW__EntrancePerformance.player==null) return;
    GFLW__EntrancePerformance.player.behaviors.MoveFunction.speed=1999;
    GFLW__EntrancePerformance.player.behaviors.MoveFunction.maxSpeed=2000;
    GFLW__EntrancePerformance.player.behaviors.MoveFunction.simulateControl("up")
    alert("move")
 
}


class GFLW__EntrancePerformance{

    static busgetthere =false;
    static player:null| InstanceType.RedHairGirlSprite=null;
    static bus:null|InstanceType.Bus= null;


    static initinstance(){
        this.bus =hf_engine.runtime.objects.Bus.getFirstInstance();
        this.player=hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
    }

    static ani__busentering(){
        this.bus =hf_engine.runtime.objects.Bus.getFirstInstance();
        if(this.bus==null) return;
        this.bus.x=-334
        this.bus.y=2450;

        // do move bus 
        this.bus.behaviors.moveto.speed=200;
       
        this.bus.behaviors.moveto.moveToPosition(741,2450)
        



    }

    static gp_hideplayer(){
        this.player=hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if(this.player==null) return;
        if(this.bus==null) return; 
        this.player.behaviors.MoveFunction.isIgnoringInput=true;

        this.player.isVisible=false;
        this.player.x=this.bus?.x;
        this.player.y=this.bus?.y-this.player.height;
        
        this.bus?.addChild(this.player,
            {"transformX":true,"transformY":true});
      

    }

    static async gp_showplayer(){
        this.bus =hf_engine.runtime.objects.Bus.getFirstInstance();
        this.player=hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if(this.player==null) return;
        if(this.bus==null) return;

        this.bus.removeChild(this.player)

        await hf_engine.WAIT_TIME_FORM_PROMISE(2)

        this.player.isVisible=true;
        // this.player.x=688;
        // this.player.y=2130;

        await hf_engine.WAIT_TIME_FORM_PROMISE(1)
         
        //this.player.behaviors.MoveFunction.simulateControl("up")
        this.player.behaviors.MoveTo.moveToPosition(688,1955)
        this.player.behaviors.MoveFunction.isIgnoringInput=false;

        
      

    }

}   

