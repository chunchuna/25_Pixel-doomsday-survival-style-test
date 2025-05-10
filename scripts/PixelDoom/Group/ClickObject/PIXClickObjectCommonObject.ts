import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js"
import { LastestChooseObject } from "../../Module/PIXClickObject.js"
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js"

// Common Actions   
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    GL_COMMAND_._TRY_ACTION_UPDATE("check", () => {
        GL_COMMAND_._draw("[color=yellow]" + LastestChooseObject.instVars.CheckDescribe + "[/color]")
    })

})
