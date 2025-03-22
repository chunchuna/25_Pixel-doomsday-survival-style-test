
// gAME Enegine
// fcuk

enum GAME_STATES {
    INIT = "afteranylayoutstart",
    TICK = "tick",

}

export class pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit {


    //The instance of the current runtime environment used to access the runtime API of the Construct 3 engine.
    //This variable will be initialized at engine startup through the ` CONSTRUCT3-INGINEENTERYPOINT `.
    public static RUN_TIME_: IRuntime;

    public static OBJECT: IConstructProjectObjects | any

    //The entry point function of Construct 3 engine, used to register callbacks at startup.
    //This function will be called at engine startup, passing in the current runtime environment (` IRuntime `).
    //Developers can register initialization logic or event listeners through this function.
    public static CONSTRUCT3_ENGINE_ENTRY_POINT = runOnStartup;

    //An event handler instance in the Construct 3 engine.
    //This instance is used to listen for and process events in the engine, such as user input, game logic events, etc.
    //If the event handler is not initialized or not found, the value is' null '.
    public static GET_CONSTRUCT3_EVENTHANDL_INSTANCE: InstanceType.EventHandler | null;

    //A utility function used to create a Promise with a specified delay time.
    //This function is typically used to implement asynchronous wait logic, such as delaying the execution of certain operations or simulating asynchronous tasks.
    //The parameter 'ms' represents the delay time (in milliseconds).
    public static WAIT_TIME_FORM_PROMISE = (ms: number) => new Promise(res => setTimeout(res, ms)); // 使用的毫秒

    public static WAIT_TIME_FROM_PROMIS_ERVYSECOND(callback: () => void, intervalSeconds: number): number {
        const intervalMilliseconds = intervalSeconds * 1000; // 将秒转换为毫秒
        const intervalId = setInterval(callback, intervalMilliseconds); // 启动计时器
        return intervalId; // 返回计时器 ID
    }








    public static gl$_ubu_init = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener("afteranylayoutstart", Function);
        });
    }


    public static gl$_ubu_update = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener("tick", Function);
        });
    };


    public static async gl$_call_eventhandle_(EventName: string, func: any) {
        // @ts-ignore
        await (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE.addEventListener as any)(EventName, async () => {
            if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE == null) return;
            func();
        });
    }


    public static gl$_run_eventhandle_(EventName: string, parameter: any[]) {
        // @ts-ignore
        var event = new C3.Event(EventName, false, parameter)
        //console.log(event)
        var handler = this.RUN_TIME_.objects.EventHandler.getFirstInstance();
        // @ts-ignore
        handler.dispatchEvent(event, parameter)
    }


    public static gl_ubu_init_$$LEVEL = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener("afteranylayoutstart", () => {
                if (runtime.globalVars.GameType === "Level") Function();
            });
        });
    }


    public static gl_ubu_update$$LEVEL = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener("tick", () => {
                if (runtime.globalVars.GameType === "Level") Function();
            });
        });
    };

    public static UBU_CLIENT_DRAW_FRAME = {

        gl$_ubu_init: (Fcuntion: () => void) => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
                runtime.addEventListener("afteranylayoutstart", Fcuntion);
            });
        },

        gl$_ubu_update: (Function: () => void) => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
                runtime.addEventListener("tick", Function);
            });
        },
    };


    public static Justlerp = (start: number, end: number, t: number): number => (1 - t) * start + t * end;

    public static GetRandomNumber(min: number, max: number, isFloat: boolean = false): number {
        if (isFloat) {
            // 生成浮点数
            return Math.random() * (max - min) + min;
        } else {
            // 生成整数
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }


    public static CalculateDistancehahaShitCode = (x1: number, y1: number, x2: number, y2: number): number => {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }


    public static TryGetHandlerAgainFuckThisHandler() {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.EventHandler.getFirstInstance();
    }
}

// Engine here

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_ = runtime;
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.OBJECT = runtime.objects;
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.TryGetHandlerAgainFuckThisHandler();

});

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    //@ts-ignore
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.EventHandler.getFirstInstance();
    console.log("[engine] handler" + pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE)
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE == null) {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.EventHandler.getFirstInstance();
        console.log("[engine] try agagin get handler")
    }
});








