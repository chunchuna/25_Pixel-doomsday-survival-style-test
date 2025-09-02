import { Unreal__ } from "../../../engine.js";
import { ClickObject, LastestChooseObject } from "../../Module/PIXClickObject.js";
import { IMGUIDebugButton } from "../../UI/debug_ui/UIDbugButton.js";
import { VariableMonitoring } from "../../UI/debug_ui/UIvariableMonitoring.js";
import { CDType, UICDTimer } from "../../UI/time_cd_ui/UICd.js";

Unreal__.GameBegin(() => {

    if (Unreal__.runtime.layout.name != "Level") return

    // Clean up any existing timers from previous scene loads
    console.log("Cleaning up existing timers before creating new ones");
    //UICDTimer.DestroyAllTimersAndVariables();

    for (var Gouhuos of Unreal__.runtime.objects.GouHuo.instances()) {
        GouHuo.BurnGouHuo(Gouhuos)
    }

})

// WHEN CREATED
Unreal__.CONSTRUCT3_ENGINE_ENTRY_POINT(() => {
    Unreal__.runtime
        .objects.GouHuo.addEventListener("instancecreate", (e) => {
            GouHuo.GouHuoInitSetting(e.instance)
            GouHuo.ExtinguishedGouHuo(e.instance)

        })


})

// WHEN INIT
Unreal__.GameBegin(() => {
    for (var Gouhuos of Unreal__.
        runtime.objects.GouHuo.instances()
    ) {
        GouHuo.GouHuoInitSetting(Gouhuos)
    }

    // WHEN LOAD
    Unreal__.runtime.
        addEventListener("load", () => {
            for (var Gouhuos of Unreal__.
                runtime.objects.GouHuo.instances()
            ) {
                GouHuo.GouHuoInitSetting(Gouhuos)
            }
        })

})



Unreal__.GameBegin(() => {
    Unreal__.GetEvent("ChoosePanleButtonClick:ClickButton", (e: any) => {
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

Unreal__.GameBegin(() => {
    var GouHuo = IMGUIDebugButton.AddCategory("GouHuo")
    IMGUIDebugButton.AddButtonToCategory(GouHuo, "Creat Gou Huo Near Player", () => {
        var playerInstance = Unreal__.
            runtime.objects.RedHairGirlSprite.getFirstInstance()
        if (!playerInstance) return

        var GouhuoNewCreated = Unreal__.
            runtime.objects.HuoYanm.createInstance("Object", playerInstance.x, playerInstance.y, true, "GouHuo")

    })
})




Unreal__.GameBegin(() => {



    var PlayerInstance = Unreal__.runtime.objects.RedHairGirlSprite.getFirstInstance();
    if (!PlayerInstance) return






    // for (var Gouhuos of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.GouHuo.instances()) {

    //     // Create a closure to capture the current Gouhuos instance
    //     (function (currentGouHuo) {

    //         // Pass the entire instVars object so it can track changes automatically
    //         VariableMonitoring.AddValue("GouHuoInstVars" + Gouhuos.uid, Gouhuos.instVars, String(Gouhuos.uid))

    //         console.log(`Creating timer for GouHuo ${currentGouHuo.uid} at position (${currentGouHuo.x}, ${currentGouHuo.y})`);

    //         var test = UICDTimer.CreateFromDirectVariable(
    //             () => currentGouHuo.instVars.ChaiHuoLiang,
    //             0,
    //             100,
    //             CDType.CIRCLE_CLOCKWISE,
    //             "GouHuoRanLiao" + String(currentGouHuo.uid),
    //             currentGouHuo.x - 25,
    //             currentGouHuo.y - 50
    //         )
    //             .setSize(30, 30)
    //             .setColors("rgba(255, 165, 0, 0.8)", "rgba(50, 50, 50, 0.6)");

    //         currentGouHuo.behaviors.Timer.startTimer(1, "gouhuoranshaojiance", "regular")
    //         currentGouHuo.behaviors.Timer.addEventListener("timer", (e) => {

    //             if (e.tag === "gouhuoranshaojiance") {

    //                 if (!currentGouHuo.instVars.ZhengZaiRanShao) return
    //                 if (currentGouHuo.instVars.ChaiHuoLiang >= 0) {
    //                     currentGouHuo.instVars.ChaiHuoLiang -= 1;


    //                 } else if (currentGouHuo.instVars.ChaiHuoLiang <= 0) {
    //                     GouHuo.ExtinguishedGouHuo(currentGouHuo)
    //                 }
    //             }

    //         })
    //     })(Gouhuos); // Pass the current Gouhuos instance to the closure
    // }

})

export class GouHuo {

    static GouHuoInitSetting(GouhuoInstance: InstanceType.GouHuo) {
        //alert(e.instance)
        //e.instance.destroy()
        var Gouhuo = GouhuoInstance


        var test = UICDTimer.CreateFromDirectVariable(
            () => Gouhuo.instVars.ChaiHuoLiang,
            0,
            100,
            CDType.CIRCLE_CLOCKWISE,
            "GouHuoRanLiao" + String(Gouhuo.uid),
            Gouhuo.x - 25,
            Gouhuo.y - 50).setSize(30, 30).setColors("rgba(255, 165, 0, 0.8)", "rgba(50, 50, 50, 0.6)");

        Gouhuo.behaviors.Timer.startTimer(1, "gouhuoranshaojiance", "regular")
        Gouhuo.behaviors.Timer.addEventListener("timer", (e) => {

            if (e.tag === "gouhuoranshaojiance") {

                if (!Gouhuo.instVars.ZhengZaiRanShao) return
                if (Gouhuo.instVars.ChaiHuoLiang >= 0) {
                    Gouhuo.instVars.ChaiHuoLiang -= 1;


                } else if (Gouhuo.instVars.ChaiHuoLiang <= 0) {
                    GouHuo.ExtinguishedGouHuo(Gouhuo)
                }
            }

        })

    }

    static BurnGouHuo(GouHuo: InstanceType.GouHuo) {

        if (!GouHuo) return
        if (GouHuo.instVars.ZhengZaiRanShao) return
        GouHuo.instVars.ZhengZaiRanShao = true;

        // Get layout and light layer first
        const layout = Unreal__.runtime.getLayout("Level");
        const lightLayer = layout.getLayer("LightAddtive");
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
