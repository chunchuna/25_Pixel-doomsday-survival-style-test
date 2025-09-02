import { Unreal__ } from "../../../engine.js";
import { IMGUIDebugButton } from "../../UI/debug_ui/UIDbugButton.js";
import { DEBUG, UIDebug } from "../../UI/debug_ui/UIDebug.js";
import { VariableMonitoring } from "../../UI/debug_ui/UIvariableMonitoring.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";

// =============================================
// 数据定义
// =============================================
export let data = {
    RunGameTiems: 0,
    LevelGameData: "",
}

export let SaveSetting = {
    isUseDataEnterNewGame: false,
}

// =============================================
// 主要存档类
// =============================================
export class MixC3Save {
    static SaveGame(Slot: string) {
        Unreal__.runtime.callFunction("SaveGame", Slot)
        return Unreal__.runtime.globalVars.LastestSaveGameJson;
    }
    
    static LoadGame(Slot: string) {
        Unreal__.runtime.callFunction("LoadGame", Slot)
    }

    static LoadGameFromJson(Json: string) {
        Unreal__.runtime.callFunction("LoadGameByJson", Json)
    }
}

// =============================================
// 本地文件存取类
// =============================================
export class LocalSave {
    static DataRead() {
        LocalSave.readFromFile().then(_data => {
            if (_data) {
                data.RunGameTiems = _data.RunGameTiems || 0;
                data.LevelGameData = _data.LevelGameData || "";

                UISubtitleMain.ShowSubtitles("读取上传的游戏数据成功", 5)
            }
        });
    }

    static DataDownload() {
        LocalSave.saveToFile(data, "game_data.json")
        UISubtitleMain.ShowSubtitles("开始下载游戏数据", 5)
    }

    static saveToFile(data: any, filename: string, type = 'application/json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    static readFromFile(): Promise<any> {
        return new Promise((resolve) => {
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
}

// =============================================
// 初始化和事件监听
// =============================================

// 从存档数据加载游戏
Unreal__.GameBegin(() => {
    if (Unreal__.runtime.layout.name != "Level") return

    if (SaveSetting.isUseDataEnterNewGame) {
        if (Unreal__.runtime.layout.name == "Level") {
            if (data.LevelGameData) {
                MixC3Save.LoadGameFromJson(data.LevelGameData)
                UISubtitleMain.ShowSubtitles("从data.LevelGameData 加载存档数据", 5)
                SaveSetting.isUseDataEnterNewGame = false;
            }
        }
    }
})

// 主菜单初始化
Unreal__.GameBegin(() => {
    if (Unreal__.runtime.layout.name != "MainMenu") return
    const storedTimes = localStorage.getItem("run_game_times")
    data.RunGameTiems = storedTimes ? Number(storedTimes) : 0
    data.RunGameTiems += 1;
    console.log("RunGameTimes:" + data.RunGameTiems)
    localStorage.setItem("run_game_times", String(data.RunGameTiems))
    const storedData = localStorage.getItem("level_data")
    data.LevelGameData = storedData || ""
   
})

// 保存JSON数据事件处理
Unreal__.GameBegin(() => {
    Unreal__.GetEvent("Save:SavetoJson", async () => {
        await Unreal__.WAIT_TIME_FORM_PROMISE(1)
        data.LevelGameData = Unreal__.runtime.globalVars.LastestSaveGameJson;
        localStorage.setItem("level_data", data.LevelGameData)
        localStorage.setItem("run_game_times", String(data.RunGameTiems))
        console.log(data)

        UISubtitleMain.ShowSubtitles("json数据被存下来了", 5)
    })
})

// 保存和加载事件监听
Unreal__.GameBegin(() => {
    Unreal__.runtime.addEventListener("save", (e) => {
        UISubtitleMain.ShowSubtitles("正在储存游戏..", 5)
    })
    Unreal__.runtime.addEventListener("load", (e) => {
        UISubtitleMain.ShowSubtitles("正在从数据载入游戏..", 5)
    })
})

// =============================================
// 调试面板设置
// =============================================
var isBindButtonIntoDebugPanel = false;
Unreal__.GameBegin(() => {
    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true

    VariableMonitoring.AddValue("game_data", data)
    var save_cat = IMGUIDebugButton.AddCategory("save")
    if (save_cat) {
        // 保存游戏按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "save[c3tag && json]", () => {
            MixC3Save.SaveGame('cundang-001')
        })

        // 从C3标签加载游戏按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "load game from c3 tag", () => {
            MixC3Save.LoadGame("cundang-001")
        })

        // 从数据加载游戏按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "laod game from data", () => {
            if (!data.LevelGameData) {
                console.log("data no file data.LevelGameData")
                UISubtitleMain.ShowSubtitles("data no file data.LevelGameData", 5)
            }
            MixC3Save.LoadGameFromJson(data.LevelGameData)
        })

        // 下载游戏数据按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "download game data to local", () => {
            LocalSave.DataDownload()
        })

        // 导入游戏数据按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "import game data to local", () => {
            LocalSave.DataRead();
        })

        // 清除数据按钮
        IMGUIDebugButton.AddButtonToCategory(save_cat, "clear data and save to localstorege", () => {
            data.LevelGameData = ""
            data.RunGameTiems = 0;
            localStorage.setItem("level_data", data.LevelGameData)
            localStorage.setItem("run_game_times", String(data.RunGameTiems))
        })
    }
})
