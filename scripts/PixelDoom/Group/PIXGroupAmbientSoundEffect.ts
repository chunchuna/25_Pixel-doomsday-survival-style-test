import { hf_engine } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";
import { _Audio } from "../Module/PIXAudio.js";


hf_engine.gl$_ubu_init(() => {
    
    if (hf_engine.runtime.layout.name!="Level") return;

    _Audio.AudioPlayCycle("NiaoJiao", -50, 3, "NiaoJiao")

}) 

