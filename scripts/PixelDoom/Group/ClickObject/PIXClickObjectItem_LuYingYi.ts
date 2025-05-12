import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LastestChooseObject } from "../../Module/PIXClickObject.js";
import { GL_COMMAND_ } from "../../Module/PIXCommandAddon.js";
import { DialogueSystem } from "../../UI/dialogue_ui/UIDialogue.js";
import { UISubtitleMain } from "../../UI/subtitle_ui/UISubtitle.js";


var PlayerInstance: InstanceType.RedHairGirlSprite;


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // @ts-ignore
    PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
})




/** 使用 UI 交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", (e: any) => {

        var ButtonConetent: string = e.data.ButtonContent_;
        if (ButtonConetent == "use") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


            //GL_COMMAND_.GET_LAST_ACTION="refresh"
            // console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

            var LuyingYizi = LastestChooseObject;
            PlayerInstance.x = LuyingYizi.x
            PlayerInstance.y = LuyingYizi.y;

            UISubtitleMain.ShowSubtitles("你正在使用 [露营椅子]", 5)
        }

        if (ButtonConetent == "destroy") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            //GL_COMMAND_.ACTION_OPEN_();
            GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")
            UISubtitleMain.ShowSubtitles('<span style="color: red;">*此物品无法被破坏</span>', 5)
        }

        if (ButtonConetent == "find") {
            if (LastestChooseObject == null) return
            if (LastestChooseObject.instVars.ID != "LuYingYiZi") return
            var Dialogue =new DialogueSystem();
            Dialogue.ShowDialogue(`左->篝火余烬中飘起一缕青烟
右->（蹲下捻动炭灰）这堆火最多半小时前还有人...
左->潮湿的松针地上散落着登山绳和空罐头
左->choose:拨开灰烬检查
	右->（金属反光）烧烤架底下压着半块没烧完的薯片包装
	左->包装袋边缘沾着暗红色痕迹
右->（用树枝挑起）番茄酱？还是...血迹？
左->choose:查看登山绳断口
	右->断茬参差不齐，像是被岩石磨断的
	左->十米外灌木丛挂着断裂的绳头
左->continue
左->北面斜坡传来乌鸦刺耳的叫声
右->（握紧手电筒）这种季节不该有乌鸦聚集...
左->choose:走向斜坡查看
	右->（踢到碎石）等等！泥土里有指甲抓挠的痕迹！
	左->陡坡下方三米处卡着撕裂的冲锋衣碎片
左->choose:冒险攀下去
	右->（摸到岩石裂缝）这是...塞在石缝里的瑞士军刀？
	左->刀柄刻着"J&M 2023"的字样
右->（转动刀身）两个字母缩写，是情侣纪念品？
左->continue
左->东南方突然响起树枝断裂声
右->（躲到树后）脚步声！是熊？还是...
左->choose:屏息观察
	右->（瞳孔收缩）那件荧光绿外套！和游客中心失踪告示上的一样
	左->人影踉跄着消失在迷雾中
左->choose:追踪荧光绿身影
	右->（踩到软物）等等！树根下埋着数码相机
	左->储存卡最后视频是摇晃镜头里的狼嚎声
右->（擦掉镜头水渍）凌晨三点拍的，他们到底遭遇了什么？
左->浓雾中传来似人非人的呜咽
左->choose:打开相机闪光灯示警
	右->（强光刺破雾气）二十米外躺着昏迷的登山者！
	左->他手腕缠着用衬衣做的简陋止血带
	左->choose:检查止血带
		右->等等...这个蝴蝶结打法，和我在军校学的战场包扎术一模一样
	`)

        }


    })
})


/** 使用GL_COMMAND 的交互 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

    GL_COMMAND_._TRY_ACTION_UPDATE("use", () => {
        if (LastestChooseObject == null) return
        if (LastestChooseObject.instVars.ID != "LuYingYiZi") return


        //GL_COMMAND_.GET_LAST_ACTION="refresh"
        console.log(GL_COMMAND_.IN_GAME_CONSOLE_INSTANCE._lastAction)

        var LuyingYizi = LastestChooseObject;
        PlayerInstance.x = LuyingYizi.x
        PlayerInstance.y = LuyingYizi.y;

        // PlayerInstance.behaviors.MoveFunction.isEnabled = false;


    })


    GL_COMMAND_._TRY_ACTION_UPDATE("destroy", () => {
        if (LastestChooseObject == null) return
        if (LastestChooseObject.instVars.ID != "LuYingYiZi") return

        GL_COMMAND_._draw("[background=yellow][color=black]此物品无法被破坏[/color][/background]")

    })
})