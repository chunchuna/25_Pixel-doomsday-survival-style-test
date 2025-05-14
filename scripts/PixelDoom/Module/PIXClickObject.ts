import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { UIInteractionPanelActionChooseMain } from "../UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js";
import { UISubtitleMain } from "../UI/subtitle_ui/UISubtitle.js";
import { GL_COMMAND_ } from "./PIXCommandAddon.js";


export var LastestChooseObject: InstanceType.ClickObjectEntity // 玩家最后选择的物体

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[ClickObject] init")
})



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "Level") return
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.ClickObjectEntity.getFirstInstance() == null) return


    for (var ClickObjects of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.ClickObjectEntity.instances()) {
        var HuDongTishiInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_
            .objects.hudongtishi_ui.createInstance("HuDongTiShi_ui", ClickObjects.x, ClickObjects.y - ClickObjects.height / 2, true)

        ClickObjects.addChild(HuDongTishiInstance);
    }
})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 鼠标悬浮在交互物体上
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject", (e: any) => {
        console.log("[ClickObject] Mouse Over Object")
        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        ClickObject.EnableOutLine(GetChooseObject, true)
        document.documentElement.style.cursor = "pointer"

    })

    // 鼠标离开交互物体

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject-none", (e: any) => {
        console.log("[ClickObject] Mouse Over Object -NONE")
        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        for (var ALLClickObject of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.ClickObjectEntity.instances()) {
            ClickObject.EnableOutLine(ALLClickObject, false)
        }
        document.documentElement.style.cursor = "default"
    })


    //点击对象 
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseClickObject", (e: any) => {

        console.log("点击了交互物")

        var GetChooseObject: InstanceType.ClickObjectEntity = e.data.object;
        LastestChooseObject = GetChooseObject;


        /** 使用 GL_COMMAND 交互 （已移除） */
        //ClickObject.GenerateInstructions(LastestChooseObject.instVars.Actions)


        /** 使用 UI 交互 */

        /** 确保玩家没有在移动状态 */
        // var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        // if (PlayerInstance == null) return

        // if (PlayerInstance.behaviors.MoveFunction.vectorX > 0 || PlayerInstance.behaviors.MoveFunction.vectorY > 0) return

        /** 呼出UI */
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (PlayerInstance == null) return
        var GetLastestObject = LastestChooseObject;
        if (GetLastestObject == null) return
        var DistanceFromLastestObject = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CalculateDistancehahaShitCode(
            GetLastestObject.x,
            GetLastestObject.y,
            PlayerInstance.x,
            PlayerInstance.y)

        if (DistanceFromLastestObject == null) return
        if (DistanceFromLastestObject > ClickObject.ClickObjectClickMaxDistance) {

            UISubtitleMain.ShowSubtitles("超过了这个物品的交互范围!", 2)
            return
        }

        console.log(GetChooseObject.getChildAt(0)?.objectType.name)

        if (GetChooseObject.getChildAt(0)?.objectType.name == "hudongtishi_ui") {
            //@ts-ignore
            var Child: InstanceType.HuDongTiShi = GetChooseObject.getChildAt(0);
            GetChooseObject.removeChild(Child)
            // 销毁这个元素
            Child.setContent("", "html", "#HuDongTiShi");
        }


        ClickObject.GenerateInstructionsBy_interactionpanelactionchoose(LastestChooseObject.instVars.Actions)


    })
})



/** 玩家在移动的时候 关闭UI面板 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

    // var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
    // if (PlayerInstance == null) return

    // if (PlayerInstance.behaviors.MoveFunction.vectorX > 0 || PlayerInstance.behaviors.MoveFunction.vectorY > 0)
    //     //UIInteractionPanelActionChooseMain.CloseChoosePanle();
    //     return

})


/**玩家距离 超过和互动物的互动距离时 关闭UI面板 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    // 获取面板元素
    var UIpanel = document.getElementById('interaction_panel_action_choose_ui');
    // 如果面板不存在或已经隐藏，则不继续执行
    // @ts-ignore
    if (!UIpanel || UIpanel.style.display == 'none') return

    // 防止第一次点击时立即关闭的问题
    // 使用一个延迟变量，确保面板显示后有一个短暂的宽限期
    // @ts-ignore
    if (!UIpanel.hasAttribute('data-initialized')) {
        // @ts-ignore
        UIpanel.setAttribute('data-initialized', 'true');
        return; // 第一次检测时直接返回，不进行距离检查
    }

    var InteractionMaxDistance = ClickObject.ClickObjectClickMaxDistance;

    var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
    if (PlayerInstance == null) return

    /** 获取 最新的互动物 */
    var GetLastestObject = LastestChooseObject;
    if (GetLastestObject == null) return
    var DistanceFromLastestObject = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.CalculateDistancehahaShitCode(
        GetLastestObject.x,
        GetLastestObject.y,
        PlayerInstance.x,
        PlayerInstance.y)
    if (DistanceFromLastestObject > InteractionMaxDistance) {
        UIInteractionPanelActionChooseMain.CloseChoosePanle();
        // 重置初始化标记，下次显示面板时再次应用宽限期
        // @ts-ignore
        UIpanel.removeAttribute('data-initialized');
    }
})


export class ClickObject {

    /** 最大的交互距离 */
    static ClickObjectClickMaxDistance = 50;


    static EnableOutLine(object: InstanceType.ClickObjectEntity, ifEnable: boolean) {
        object.effects[0].isActive = ifEnable;

    }


    /** 通过 GL_COMMAND 生成指令列表 */
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

    /** 通过 UI 生成按钮列表 */
    static GenerateInstructionsBy_interactionpanelactionchoose(Content: string) {
        UIInteractionPanelActionChooseMain.ExplainConetntToButton(Content)
    }
}







