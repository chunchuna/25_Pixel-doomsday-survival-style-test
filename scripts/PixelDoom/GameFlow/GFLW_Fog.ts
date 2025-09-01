import { hf_engine } from "../../engine.js";
import { createFogAroundInstance, stopFogGeneration } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { AmbientLight } from "../Module/PIXAmbientLight.js";

hf_engine.gl$_ubu_init(() => {
    GFLW_Fog.initinstance();

    var AmbientGetNight = () => {
        GFLW_Fog.StartFog()
        AmbientLight.removeNightStartListener(AmbientGetNight)

    }

    var AmbientGetDay = () => {
        GFLW_Fog.StopFogGeneration()
        AmbientLight.removeDayStartListener(AmbientGetDay)
    }

    AmbientLight.onNightStart(AmbientGetNight)
    AmbientLight.onDayStart(AmbientGetDay)

})

class GFLW_Fog {
    static Player: InstanceType.RedHairGirlSprite | null = null

    static initinstance() {
        this.Player = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
    }
    static StartFog() {
        if (this.Player == null) return;
        createFogAroundInstance(this.Player, 15, 500, 2, 1000)
    }

    static StopFogGeneration() {
        stopFogGeneration(3)

    }

}
