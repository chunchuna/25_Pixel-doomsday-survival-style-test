// gAME Enegine
// fcuk

enum GAME_STATES {
    INIT = "afteranylayoutstart",
    INIT_BEFORE = "beforeanylayoutstart",
    TICK = "tick",
    LAYOUT_END = "afteranylayoutend",

}

export class pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit {


    //The instance of the current runtime environment used to access the runtime API of the Construct 3 engine.
    //This variable will be initialized at engine startup through the ` CONSTRUCT3-INGINEENTERYPOINT `.
    public static RUN_TIME_: IRuntime;

    public static OBJECT: IConstructProjectObjects | any


    public static LayoutName: string;

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
    public static WAIT_TIME_FORM_PROMISE = (ms: number) => new Promise(res => setTimeout(res, ms * 1000)); // 秒

    public static WAIT_TIME_FROM_PROMIS_ERVYSECOND(callback: () => void, intervalSeconds: number): any { // Return C3Timer instance
        try {
            // Create C3 Timer instance for interval timing
            const timerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            const timerTag = `interval_${Date.now()}_${Math.random()}`;

            // Set up timer event listener
            timerInstance.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === timerTag) {
                    callback();
                    // Restart timer for next interval (regular timer behavior)
                    timerInstance.behaviors.Timer.startTimer(intervalSeconds, timerTag, "regular");
                }
            });

            // Start the timer
            timerInstance.behaviors.Timer.startTimer(intervalSeconds, timerTag, "regular");

            //console.log(`Started C3Timer interval with ${intervalSeconds}s interval`);
            return timerInstance; // Return timer instance for manual cleanup if needed
        } catch (error: any) {
            console.error(`Failed to create C3Timer interval: ${error.message}`);
            // Fallback to JavaScript setInterval
            const intervalMilliseconds = intervalSeconds * 1000;
            const intervalId = setInterval(callback, intervalMilliseconds);
            return intervalId;
        }
    }

    /**
     * Stops a C3Timer interval created by WAIT_TIME_FROM_PROMIS_ERVYSECOND
     * @param timerInstance The timer instance returned by WAIT_TIME_FROM_PROMIS_ERVYSECOND
     */
    public static STOP_C3TIMER_INTERVAL(timerInstance: any): void {
        try {
            if (timerInstance && timerInstance.behaviors && timerInstance.behaviors.Timer) {
                // Stop all timers on this instance and destroy it
                timerInstance.behaviors.Timer.stopAllTimers();
                timerInstance.destroy();
                console.log("Stopped C3Timer interval");
            } else if (typeof timerInstance === 'number') {
                // Fallback for JavaScript intervals
                clearInterval(timerInstance);
                console.log("Stopped JavaScript interval (fallback)");
            }
        } catch (error: any) {
            console.error(`Failed to stop timer: ${error.message}`);
        }
    }

    public static gl$_getlayoutname() {
        return pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name;
    }

    public static gl$_ubu_init = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener(GAME_STATES.INIT, Function);

        });
    }


    public static gl$_ubu_update = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener(GAME_STATES.TICK, Function);
        });
    };


    public static gl$_layout_end = (Function: () => void) => {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
            runtime.addEventListener(GAME_STATES.LAYOUT_END, Function)
        })
    }

    public static async gl$_call_eventhandle_(EventName: string, func: any,) {
        // @ts-ignore
        await (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE.addEventListener as any)(EventName, async (e) => {
            if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE == null) return;
            func(e);
        });
    }


    public static gl$_run_eventhandle_(EventName: string, parameter: any) {
        // @ts-ignore
        var event = new C3.Event(EventName, false,)
        event.data = parameter;
        //console.log(event)
        var handler = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.EventHandler.getFirstInstance();
        // @ts-ignore
        handler.dispatchEvent(event)
    }


    public static UBU_CLIENT_DRAW_FRAME = {

        gl$_ubu_init: (Fcuntion: () => void) => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
                runtime.addEventListener(GAME_STATES.INIT, Fcuntion);
            });
        },

        gl$_ubu_update: (Function: () => void) => {
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CONSTRUCT3_ENGINE_ENTRY_POINT(async runtime => {
                runtime.addEventListener(GAME_STATES.TICK, Function);
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



















pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name;


})


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








