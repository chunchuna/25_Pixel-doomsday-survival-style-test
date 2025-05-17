import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";

export let data = {
    RunGameTiems: 0,
    LevelGameData: "",
}
export let SaveSetting = {
    isUseDataEnterNewGame: false,
}



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 玩家可以通过使用 数据进入游戏
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return

    if (SaveSetting.isUseDataEnterNewGame) {
        if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name == "Level") {
            if (data.LevelGameData) {
                Save.LoadGameFromJson(data.LevelGameData)
                UISubtitleMain.ShowSubtitles("从data.LevelGameData 加载存档数据", 5)
            }
        }
    }

})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "MainMenu") return
    data.RunGameTiems = Number(localStorage.getItem("run_game_times"))
    data.RunGameTiems += 1;
    console.log("run game times:" + data.RunGameTiems)
    localStorage.setItem("run_game_times", String(data.RunGameTiems))
    //alert(data.RunGameTiems)
    //@ts-ignore
    data.LevelGameData = localStorage.getItem("level_data")
    console.log(data.LevelGameData)
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("Save:SavetoJson", async () => {
        await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1)
        data.LevelGameData = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.LastestSaveGameJson;
        localStorage.setItem("level_data", data.LevelGameData)
        localStorage.setItem("run_game_times", String(data.RunGameTiems))

        UISubtitleMain.ShowSubtitles("json数据被存下来了", 5)
    })
})



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("save", (e) => {
        UISubtitleMain.ShowSubtitles("正在储存游戏..", 5)
    })
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load", (e) => {
        UISubtitleMain.ShowSubtitles("正在从数据载入游戏..", 5)
    })
})
document.addEventListener('keydown', (event: KeyboardEvent) => {
    // 示例检测
    if (event.key === 'p') {
        // 直接通过 C3自带的标识来储存 同时 存下json json默认传输给 LastestSaveGameJson这个全局变量
        Save.SaveGame("test2")
    }
    if (event.key === 'o') {
        // 直接通过 C3自带的标识来加载关卡存档
        Save.LoadGame("test2")
    }
    if (event.key === 'l') {
        // 通过 data.LevelGameData 来加载关卡存档
        if (!data.LevelGameData) {
            console.log("data 不存在data.LevelGameData里")
            UISubtitleMain.ShowSubtitles("data 不存在data.LevelGameData里", 5)
        }
        console.log(data.LevelGameData)
        Save.LoadGameFromJson(data.LevelGameData)
        UISubtitleMain.ShowSubtitles("从data.LevelGameData 加载存档数据", 5)
    }

    if (event.key == "z") {
        // 下载数据
        LocalSave.DataDownload()

    }

    if (event.key == "q") {
        // 读取数据
        LocalSave.DataRead();
    }
});

export class LocalSave {

    static DataRead() {
        readFromFile().then(_data => {
            if (_data) {
                data = _data
                UISubtitleMain.ShowSubtitles("读取上传的游戏数据成功", 5)
            }
        });
    }

    static DataDownload() {
        saveToFile(data, "game_data.json")
        UISubtitleMain.ShowSubtitles("开始下载游戏数据", 5)
    }
}

// 下载文件
export function saveToFile(data: any, filename: string, type = 'application/json') {
    // 创建Blob对象
    const blob = new Blob([JSON.stringify(data, null, 2)], { type });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 上传文件
export function readFromFile(): Promise<any> {
    return new Promise((resolve) => {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return resolve(null);

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const result = JSON.parse(event.target?.result as string);
                    resolve(result);
                } catch (error) {
                    console.error("文件解析错误", error);
                    UISubtitleMain.ShowSubtitles("文件解析错误", 5)
                    resolve(null);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    });
}

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
