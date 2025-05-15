import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("save",(e)=>{
        alert("保存了游戏")
    })
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load",(e)=>{
        alert("读取了游戏")
    })
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
   
    
    document.addEventListener('keydown', (event: KeyboardEvent) => {
        // 示例检测
        if (event.key === 'p') {
            Save.SaveGame("test2")
        }

        if (event.key === 'o') {
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

    static LoadGameFromJson(Json:string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("LoadGameByJson",Json)

    }


}
