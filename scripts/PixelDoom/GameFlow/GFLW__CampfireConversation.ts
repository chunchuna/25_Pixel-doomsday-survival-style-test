import { hf_engine } from "../../engine.js";
import { AdvanceBubble } from "../UI/bubble_ui/UIAdvanceBubble.js";
import { BubbleType } from "../UI/bubble_ui/UIBubble.js";
import { PIXArea } from "../Module/PIXArea.js";
import { DebugColors, DebugObjectRenderer } from "../Renderer/DebugObjectRenderer.js";
import { DEBUG } from "../UI/debug_ui/UIDebug.js";


hf_engine.gl$_ubu_init(() => {
    GFLW__CampfireConversation.InitInstance();
    GFLW__CampfireConversation.InitArea();

    // Example: Set callbacks for campfire area
    GFLW__CampfireConversation.EnterExitAreaCallbacks();
    //Draw Area
    DebugObjectRenderer.setLayer("GameContent").setColorPreset(DebugColors.YELLOW).setBoxThickness(1).RenderPolygonFromPoints(GFLW__CampfireConversation.TriggerArea)
})

hf_engine.gl$_ubu_update(() => {
    GFLW__CampfireConversation.UpdateArea();
})

class GFLW__CampfireConversation {
    static Player: InstanceType.RedHairGirlSprite | null = null
    static TriggerArea: [number, number][] = [[1157,686],[1848,657],[1898,1042],[1168,1021]]


    static AREA_ID: string = "campfire_area"

    static InitInstance() {
        this.Player = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();


    }

    static InitArea() {
        // Initialize the area with the player and trigger area
        if (this.Player) {
            PIXArea.Create(this.AREA_ID, this.TriggerArea, this.Player);
        }

    }

    static UpdateArea() {
        // Update the area with player position
        if (this.Player) {
            PIXArea.Update(this.AREA_ID, this.Player.x, this.Player.y);
        }
    }

    static EnterExitAreaCallbacks() {
        // Set enter callback
        PIXArea.SetEnterCallback(this.AREA_ID, () => {
            console.log("Player enter campfire area");

            if (!hf_engine.runtime.objects.LevelVars.getFirstInstance()?.instVars.CampFireConverstion) {
                this.Dialogue_DouMaoNanRen_ShouJiNvRen();
                //@ts-ignore
                const levelVarsInstance = hf_engine.runtime.objects.LevelVars.getFirstInstance();
                if (levelVarsInstance) {
                    levelVarsInstance.instVars.CampFireConverstion = true;
                }
            }

        });

        // Set exit callback
        PIXArea.SetExitCallback(this.AREA_ID, () => {
            console.log("Player exited campfire area");
            // Add your code here for when player exits the area
            // For example: end dialogue, hide UI, etc.
        });
    }

    static Dialogue_DouMaoNanRen_ShouJiNvRen() {
        var DouMaoNanRenInstance = hf_engine
            .runtime.objects.DouMaoNanRen.getFirstInstance();
        var ShouJiNvRenInstance = hf_engine
            .runtime.objects.ShouJiNvRen.getFirstInstance();

            
        if (!DouMaoNanRenInstance || !ShouJiNvRenInstance) return
        var NPCShouJiNvRen = AdvanceBubble.SetNPC("ShouJiNvRen", ShouJiNvRenInstance.x - 100, ShouJiNvRenInstance.y);
        var NPCDouMaoNanRen = AdvanceBubble.SetNPC("DouMaoNanRen", DouMaoNanRenInstance.x - 100, DouMaoNanRenInstance.y);

        var TestDialogue = AdvanceBubble.CreateContinuousDialogue()
            .AddContent(NPCDouMaoNanRen, "你看，又来一个倒霉鬼。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "这鬼天气，雨就没停过。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "上山的路都被冲垮了，根本走不了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "我试着往下游走，结果发现那边的桥也被淹了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "咱们现在就像被困在这座小岛上，只能等雨停了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "不过看这架势，短时间内是别想了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "唉，本来是来放松的，结果成了荒野求生。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "是啊，这雨下得太急了，简直像是老天在哭泣。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我的手机完全没有信号，根本打不通电话。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我联系了营地管理员，但电话一直占线。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "现在连紧急呼叫都发不出去。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我感觉我们真的被困住了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "别担心，他们肯定会派人来查看的。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "只是时间问题。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "你带了多少食物和水？", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "只够一天的量，我没想到会发生这种事。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我的帐篷也漏雨了，半夜被冻醒了好几次。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "我的帐篷还算结实，可以分你一些空间。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "现在不是逞强的时候。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "咱们得一起想办法，不能坐以待毙。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "你有没有看到河流的水位线？", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我早上看了，比昨天涨了不少。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "而且水流很急。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "那看来是无法淌水过去了。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "我们得节约食物，尽量少活动。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "你说会不会有野兽出没？", BubbleType.SPEECH, true, 20)
            .AddContent(NPCShouJiNvRen, "我听到了奇怪的声音。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "别自己吓自己，应该是风声或者雨滴落到树叶上的声音。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "我得去检查一下绳索，免得帐篷被风吹走。", BubbleType.SPEECH, true, 20)
            .AddContent(NPCDouMaoNanRen, "你帮我看着点篝火，别让它熄灭了。", BubbleType.SPEECH, true, 20);

        // 使用SetPressNext模式，并启用按键提示图标
        AdvanceBubble.PlayContinuousDialogue(TestDialogue)
            .SetPressNext()
            .EnableKeyPrompt(true, "#ffffff", 20) // 启用白色按键提示，大小为20px

        // 自动播放模式的代码，可以通过注释切换测试

        // AdvanceBubble.PlayContinuousDialogue(TestDialogue)
        //     .SetAutoNext()
        //     .SetWaitTime(3)
        //     .SetRandomRepeat(-1);
    }
}

