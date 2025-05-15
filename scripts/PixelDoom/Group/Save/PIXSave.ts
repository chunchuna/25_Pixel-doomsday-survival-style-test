import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
   
    
    document.addEventListener('keydown', (event: KeyboardEvent) => {
        // 示例检测
        if (event.key === 'p') {
            alert("保存")
            Save.SaveGame("test2")
        }

        if (event.key === 'o') {
            alert("读取")
            Save.LoadGame("test2")
        }
    });

})

export class Save {
    static SaveGame(Slot: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("SaveGame", Slot)
        return pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.LastestSaveGameJson;

    }

    static LoadGame(Slot: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("LoadGame", Slot)
    }

    static LoadGameFromJson() {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("LoadGameByJson")

    }


}
