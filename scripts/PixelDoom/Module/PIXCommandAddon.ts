import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";


export class GL_COMMAND_ {

    public static GET_LAST_ACTION: string;
    public static IN_GAME_CONSOLE_INSTANCE: any;

    public static COMMAND_OPEN = false;


    static ACTION_OPEN_() {
        //GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._acts.Open();
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("ConsoleOpen")
        GL_COMMAND_.COMMAND_OPEN = true;
    }

    static ACTION_CLOSE_() {
        // GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._acts.Close();
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("ConsoleClose")
        GL_COMMAND_.COMMAND_OPEN = false;
    }

    // static _draw(cont: string) {
    //     //GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._acts.Print(cont)
    //     const now = new Date();
    //     const hours = now.getHours().toString().padStart(2, '0');
    //     const minutes = now.getMinutes().toString().padStart(2, '0');
    //     const content_add_timetag = `[color=yellow]${hours}:${minutes}[/color] : ${cont}`;

    //     pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("ConsolePrint", content_add_timetag)

    // }

    static _draw(cont: string) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0'); // 添加秒数更专业

        // 优化后的日志格式（带时间标签和内容缩进）
        const content_add_timetag =
            `[color=#FFD700][${hours}:${minutes}:${seconds}][/color] » ${cont}`;
        // 金色时间标签 + 三角箭头分隔符

        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_
            .callFunction("ConsolePrint", content_add_timetag);
    }

    static _REGISTER_COMMAND_(command: string, par: string, des: string, help: string) {
        //GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction._acts.RegisterCommand()
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("ConsoleBindEvent", command, par, des, help)
    }

    public static _CLEAR_ALL_CONTENT_FROM_COMMAND() {
        //GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._acts.Clear();
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.callFunction("ConsoleClear");
    }

    public static _TRY_ACTION_UPDATE(ActionName: string, Fcuntion: () => void) {

        if (GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE == null) return;

        if (ActionName !== GL_COMMAND_.GET_LAST_ACTION) {
            if (GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction == ActionName) {
                Fcuntion();
                GL_COMMAND_.GET_LAST_ACTION = ActionName;
                GL_COMMAND_.GET_LAST_ACTION = "refresh"
                GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction = "refresh"
            }
        }

    }


    public static _TRY_ACTION_(ActionName: string, Fcuntion: () => void) {

        if (GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE == null) return;
        if (ActionName == GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction) {
            Function()
        }


    }

}



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log(" [GL_COMMAND] console init")
    //GL_COMMAND_.ACTION_OPEN_();

})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.InGameConsole.getFirstInstance();
    // GL_COMMAND_.ACTION_OPEN_()
    // GL_COMMAND_._draw("Draw")
    //console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE)

})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.UBU_CLIENT_DRAW_FRAME.gl$_ubu_update(() => {

    // GL_COMMAND_._TRY_ACTION_UPDATE("m_setting", () => {
    //     alert("try action")
    // })


})

