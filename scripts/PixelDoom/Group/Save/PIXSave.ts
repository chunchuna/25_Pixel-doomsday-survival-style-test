import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

export var data = {
    RunGameTiems: 0,
    LevelGameData: "",
}
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "MainMenu") return
    data.RunGameTiems = Number(localStorage.getItem("run_game_times"))
    data.RunGameTiems += 1;
    console.log("run game times:" + data.RunGameTiems)
    localStorage.setItem("run_game_times", String(data.RunGameTiems))
    alert(data.RunGameTiems)
    //@ts-ignore
    data.LevelGameData = localStorage.getItem("level_data")
    console.log(data.LevelGameData)
    console.log(data.LevelGameData)



})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    //alert("123")
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("Save:SavetoJson", async () => {
        alert("json数据被存下来了")
        await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1)
        data.LevelGameData = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.LastestSaveGameJson;
        localStorage.setItem("level_data", data.LevelGameData)
    })
})



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("save", (e) => {
        alert("保存了游戏")
    })
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load", (e) => {
        alert("读取了游戏")
    })
})
document.addEventListener('keydown', (event: KeyboardEvent) => {
    // 示例检测
    if (event.key === 'p') {
        Save.SaveGame("test2")
    }
    if (event.key === 'o') {
        Save.LoadGame("test2")
    }
    if (event.key === 'l') {
        if (!data.LevelGameData) {
            console.log("data 不存在data.LevelGameData里")
        }
        console.log(data.LevelGameData)
        Save.LoadGameFromJson(data.LevelGameData)
        alert("从data.LevelGameData 加载存档数据")
    }
});
export class Save {
    static SaveGame(Slot: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("SaveGame", Slot)
        return pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.LastestSaveGameJson;

    }
    static LoadGame(Slot: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("LoadGame", Slot)
    }

    static LoadGameFromJson(Json: string) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("LoadGameByJson", Json)

    }

}
