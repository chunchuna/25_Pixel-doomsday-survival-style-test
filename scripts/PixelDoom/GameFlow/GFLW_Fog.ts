import { hf_engine } from "../../engine.js";
import { createFogAroundInstance } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { AmbientLight } from "../Module/PIXAmbientLight.js";

hf_engine.gl$_ubu_init(()=>{
    GFLW_Fog.initinstance();
    GFLW_Fog.OnGetNight();

})

class GFLW_Fog{
    static Player:InstanceType.RedHairGirlSprite|null=null

    static initinstance(){
        this.Player=hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
    }
    static StartFog(){
        if(this.Player==null) return;
        createFogAroundInstance(this.Player,15,500,2,1000)
    }

    static OnGetNight(){
        var NightCallBaclk =()=>{
            this.StartFog()
            AmbientLight.removeNightStartListener(NightCallBaclk)
            
        }
        AmbientLight.onNightStart(NightCallBaclk)
    }
}
