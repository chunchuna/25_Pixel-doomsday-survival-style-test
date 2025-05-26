import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { ClickObject, LastestChooseObject } from "../../Module/PIXClickObject.js";
import { CDType, UICDTimer } from "../../UI/time_cd_ui/UICd.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    // Clean up any existing timers from previous scene loads
    console.log("Cleaning up existing timers before creating new ones");
    UICDTimer.DestroyAllTimersAndVariables();

    for (var Gouhuos of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo.instances()) {
        GouHuo.ExtinguishedGouHuo(Gouhuos)
    }

})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {
        var ButtonConetent_id: string = e.data.ButtonContent_;
        if (ButtonConetent_id == "burn") {
            //@ts-ignore
            var ChooseGouHuo = LastestChooseObject as InstanceType.GouHuo
            GouHuo.BurnGouHuo(ChooseGouHuo)


        }

        if (ButtonConetent_id == "extinguished") {
            //@ts-ignore
            var ChooseGouHuo = LastestChooseObject as InstanceType.GouHuo
            GouHuo.ExtinguishedGouHuo(ChooseGouHuo)
        }

    })

})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
    if (!PlayerInstance) return



    for (var Gouhuos of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo.instances()) {


        var test = UICDTimer.CreateFromDirectVariable(() => Gouhuos.instVars.ChaiHuoLiang, 0, 100, CDType.CIRCLE_CLOCKWISE, "GouHuoRanLiao", Gouhuos.x - 25, Gouhuos.y - 50)
            .setSize(30, 30)
            .setColors("rgba(255, 165, 0, 0.8)", "rgba(50, 50, 50, 0.6)");


        Gouhuos.behaviors.Timer.startTimer(1, "gouhuoranshaojiance", "regular")
        Gouhuos.behaviors.Timer.addEventListener("timer", (e) => {

            if (e.tag === "gouhuoranshaojiance") {

                if (!Gouhuos.instVars.ZhengZaiRanShao) return
                if (Gouhuos.instVars.ChaiHuoLiang >= 0) {
                    Gouhuos.instVars.ChaiHuoLiang -= 1;
                } else if (Gouhuos.instVars.ChaiHuoLiang <= 0) {
                    GouHuo.ExtinguishedGouHuo(Gouhuos)
                }
            }

        })
    }

})

export class GouHuo {
    static BurnGouHuo(GouHuo: InstanceType.GouHuo) {

        if (!GouHuo) return
        if (GouHuo.instVars.ZhengZaiRanShao) return
        GouHuo.instVars.ZhengZaiRanShao = true;

        // Get layout and light layer first
        const layout = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.getLayout("Level");
        const lightLayer = layout.getLayer("Light");
        if (!lightLayer) return;

        // Process all children (fire light sources)
        for (const child of GouHuo.children()) {
            // Check if child is a GouHouGuang (fire light) instance
            if (child && child.objectType.name === "GouHouGuang") {
                const gouHuoLight = child as InstanceType.GouHouGuang;
                gouHuoLight.isVisible = true;
                gouHuoLight.moveToLayer(lightLayer);
            }


        }

        GouHuo.isVisible = true;
        console.warn("Burn GouHUO")
    }

    static ExtinguishedGouHuo(GouHuo: InstanceType.GouHuo) {
        if (!GouHuo) return;
        if (!GouHuo.instVars.ZhengZaiRanShao) return; // Already extinguished

        // Set campfire state to extinguished
        GouHuo.instVars.ZhengZaiRanShao = false;

        // Hide all fire light sources
        for (const child of GouHuo.children()) {
            if (child && child.objectType.name === "GouHouGuang") {
                const gouHuoLight = child as InstanceType.GouHouGuang;
                gouHuoLight.isVisible = false;
            }
        }
        GouHuo.isVisible = false;
        console.warn("Extinguished GouHuo")

    }
}
