import { Unreal__ } from "../../engine.js";
import { GAME_TYPE } from "../Global/PIXGlobal.js";
import { _Audio } from "../Module/PIXAudio.js";


Unreal__.GameBegin(() => {
    
    if (Unreal__.runtime.layout.name!="Level") return;

    _Audio.AudioPlayCycle("NiaoJiao", -50, 3, "NiaoJiao")

}) 

