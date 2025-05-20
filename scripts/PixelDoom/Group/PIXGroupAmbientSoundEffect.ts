import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";
import { _Audio } from "../Module/PIXAudio.js";


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name!="Level") return;

    _Audio.AudioPlayCycle("NiaoJiao", -50, 3, "NiaoJiao")

}) 

