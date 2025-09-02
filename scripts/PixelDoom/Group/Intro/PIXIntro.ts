import { hf_engine } from "../../../engine.js";
import { LevelMain } from "../../Module/PIXLevel.js";

hf_engine.gl$_ubu_init(() => {
    if (hf_engine.runtime.layout.name == "Intro") {
        Intro.GoMainMenuLayout();
    }
})

class Intro {
    static async GoMainMenuLayout() {
        await hf_engine.WAIT_TIME_FORM_PROMISE(6)
        LevelMain.JumpOtehrLayoutFromLevel("MainMenu")

    }
}

class IntroAnimation{

}