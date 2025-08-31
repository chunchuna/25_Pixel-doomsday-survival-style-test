import { hf_engine } from "../../../engine.js"
import { LastestChooseObject } from "../../Module/PIXClickObject.js"
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js"
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js"

// Common Actions   
hf_engine.gl$_ubu_update(() => {

    /** 已移除 */
    // GL_COMMAND_._TRY_ACTION_UPDATE("check", () => {
    //     GL_COMMAND_._draw("[color=yellow]" + LastestChooseObject.instVars.CheckDescribe + "[/color]")
    // })



})


hf_engine.gl$_ubu_init(() => {

    hf_engine.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {
        var ButtonConetent_id: string = e.data.ButtonContent_;
        if (ButtonConetent_id == "check") {
            //GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw(LastestChooseObject.instVars.CheckDescribe)
            UISubtitleMain.ShowSubtitles(LastestChooseObject.instVars.CheckDescribe, 10)
        }
    })

})



