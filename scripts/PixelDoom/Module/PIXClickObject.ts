import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { GL_COMMAND_ } from "./PIXCommandAddon.js";


export var LastestChooseObject: InstanceType.ClickObjectEntity // 玩家最后选择的物体

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[ClickObject] init")
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 鼠标悬浮在交互物体上
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject", (e: any) => {
        console.log("[ClickObject] Mouse Over Object")
        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        ClickObject.EnableOutLine(GetChooseObject, true)

    })

    // 鼠标离开交互物体

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject-none", (e: any) => {
        console.log("[ClickObject] Mouse Over Object -NONE")
        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        for (var ALLClickObject of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.ClickObjectEntity.instances()) {
            ClickObject.EnableOutLine(ALLClickObject, false)
        }
    })


    //点击对象 
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseClickObject", (e: any) => {
        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        LastestChooseObject = GetChooseObject;

        ClickObject.GenerateInstructions(LastestChooseObject.instVars.Actions)

    })
})

export class ClickObject {
    static EnableOutLine(object: InstanceType.ClickObjectEntity, ifEnable: boolean) {
        object.effects[0].isActive = ifEnable;

    }

    static GenerateInstructions(ActionConetent: string) {
        GL_COMMAND_.ACTION_OPEN_();
        //GL_COMMAND_._draw(ActionConetent)
        GL_COMMAND_._draw("正在交互:" + LastestChooseObject.instVars.ObjectName)
        ActionConetent.split(',')
            .map(item => item.trim())
            .filter(item => item !== "")
            .forEach(trimmedItem => {
                const formattedAction = `[background=blue][action name=${trimmedItem} color=red]${trimmedItem}[/action][/background]`;
                GL_COMMAND_._draw(formattedAction);
            });
    }
}


// Common Actions   
// 通用交互指令
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

    // 当玩家选择了 Check 指令
    GL_COMMAND_._TRY_ACTION_UPDATE("check", () => {
        GL_COMMAND_._draw("[color=yellow]执行检查:" + LastestChooseObject.instVars.CheckDescribe+"[/color]")
    })


})





