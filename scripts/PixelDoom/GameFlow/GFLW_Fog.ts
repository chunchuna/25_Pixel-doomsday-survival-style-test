import { hf_engine } from "../../engine.js";
import { createFogAroundInstance, stopFogGeneration } from "../Group/Effect/Fog/PIXEffect_fog.js";
import { AmbientLight } from "../Module/PIXAmbientLight.js";

hf_engine.gl$_ubu_init(() => {
    GFLW_Fog.initinstance();
    // 监听白天黑夜 用于生成和销毁雾
    GFLW_Fog.AmbientGetNight = () => {
        GFLW_Fog.StartFog()
    }
    GFLW_Fog.AmbientGetDay = () => {
        GFLW_Fog.StopFogGeneration()
    }
    AmbientLight.onNightStart(GFLW_Fog.AmbientGetNight)
    AmbientLight.onDayStart(GFLW_Fog.AmbientGetDay)

})

hf_engine.gl$_layout_end(() => {
    if (hf_engine.runtime.layout.name !== "Level") return

  
    if (GFLW_Fog.AmbientGetDay && GFLW_Fog.AmbientGetNight) {
        AmbientLight.removeDayStartListener(GFLW_Fog.AmbientGetDay)
        AmbientLight.removeNightStartListener(GFLW_Fog.AmbientGetNight)


    }
})

class GFLW_Fog {

    static AmbientGetNight: any;
    static AmbientGetDay: any;

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