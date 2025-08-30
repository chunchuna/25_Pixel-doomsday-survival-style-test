import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { BubbleType, UIBubble } from "./UIBubble.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
 
    if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.GameType!="Level") return
    
    // 初始化高级气泡系统
    //alert("UIAdvanceBubble init")
    Dialogue_DouMaoNanRen_ShouJiNvRen();

    
    
})


function Dialogue_DouMaoNanRen_ShouJiNvRen() {
    
    var DouMaoNanRenInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit
    .RUN_TIME_.objects.DouMaoNanRen.getFirstInstance();

    var ShouJiNvRenInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit
    .RUN_TIME_.objects.ShouJiNvRen.getFirstInstance();
    if(!DouMaoNanRenInstance || !ShouJiNvRenInstance) return
    var NPCShouJiNvRen = AdvanceBubble.SetNPC("ShouJiNvRen", ShouJiNvRenInstance.x-100, ShouJiNvRenInstance.y);
    var NPCDouMaoNanRen = AdvanceBubble.SetNPC("DouMaoNanRen", DouMaoNanRenInstance.x-100, DouMaoNanRenInstance.y);
    
    var TestDialogue = AdvanceBubble.CreateContinuousDialogue()
    .AddContent(NPCDouMaoNanRen,"你看，又来一个倒霉鬼。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"这鬼天气，雨就没停过。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"上山的路都被冲垮了，根本走不了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"我试着往下游走，结果发现那边的桥也被淹了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"咱们现在就像被困在这座小岛上，只能等雨停了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"不过看这架势，短时间内是别想了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"唉，本来是来放松的，结果成了荒野求生。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"是啊，这雨下得太急了，简直像是老天在哭泣。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我的手机完全没有信号，根本打不通电话。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我联系了营地管理员，但电话一直占线。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"现在连紧急呼叫都发不出去。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我感觉我们真的被困住了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"别担心，他们肯定会派人来查看的。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"只是时间问题。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"你带了多少食物和水？",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"只够一天的量，我没想到会发生这种事。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我的帐篷也漏雨了，半夜被冻醒了好几次。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"我的帐篷还算结实，可以分你一些空间。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"现在不是逞强的时候。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"咱们得一起想办法，不能坐以待毙。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"你有没有看到河流的水位线？",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我早上看了，比昨天涨了不少。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"而且水流很急。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"那看来是无法淌水过去了。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"我们得节约食物，尽量少活动。",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"你说会不会有野兽出没？",BubbleType.SPEECH,true,20)
    .AddContent(NPCShouJiNvRen,"我听到了奇怪的声音。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"别自己吓自己，应该是风声或者雨滴落到树叶上的声音。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"我得去检查一下绳索，免得帐篷被风吹走。",BubbleType.SPEECH,true,20)
    .AddContent(NPCDouMaoNanRen,"你帮我看着点篝火，别让它熄灭了。",BubbleType.SPEECH,true,20);

    // 使用SetPressNext模式，并启用按键提示图标
    // AdvanceBubble.PlayContinuousDialogue(TestDialogue)
    //     .SetPressNext()
    //     .EnableKeyPrompt(true, "#ffffff", 20) // 启用白色按键提示，大小为20px
    //     .SetRandomRepeat(-1);
    
    // 自动播放模式的代码，可以通过注释切换测试
    
    AdvanceBubble.PlayContinuousDialogue(TestDialogue)
        .SetAutoNext()
        .SetWaitTime(3)
        .SetRandomRepeat(-1);
    
}

// NPC对象接口定义
interface INPC {
    name: string;
    x: number;
    y: number;
}

// 对话内容接口定义
interface IDialogueContent {
    npc: INPC;
    content: string;
    type: BubbleType;
    typewriterEnabled: boolean;
    typewriterSpeed: number;
    bubbleInstance?: UIBubble;
}

// 连续对话接口定义
interface IContinuousDialogue {
    id: string;
    contents: IDialogueContent[];
    currentIndex: number;
    isPlaying: boolean;
}

// 定义带有AddContent方法的对话接口
interface IContinuousDialogueWithMethods extends IContinuousDialogue {
    AddContent(npc: INPC, content: string, type: BubbleType, typewriterEnabled: boolean, typewriterSpeed: number): IContinuousDialogueWithMethods;
}

export class AdvanceBubble {
    // 存储所有NPC对象
    private static npcs: Map<string, INPC> = new Map();
    
    // 存储所有连续对话
    private static dialogues: Map<string, IContinuousDialogue> = new Map();
    
    // 当前正在播放的对话ID
    private static currentPlayingDialogueId: string | null = null;
    
    // 用于自动播放的计时器
    private static autoPlayTimer: any = null;
    private static autoPlayTimerTag: string = "";
    
    // 随机重复对话设置
    private static repeatSettings: Map<string, { count: number, current: number }> = new Map();
    
    // 用于按键监听
    private static keyPressListener: any = null;
    private static nextKey: string = " "; // 默认使用空格键（空格的键值是空字符串）
    
    // 默认等待时间(秒)
    private static defaultWaitTime: number = 0.2;

    // 调试模式
    private static debugMode: boolean = true;
    
    // 按键提示设置
    private static keyPromptEnabled: boolean = true; // 默认启用按键提示
    private static keyPromptColor: string = "#ffffff"; // 按键提示颜色
    private static keyPromptSize: number = 24; // 按键提示大小

    /**
     * 设置NPC对象
     * @param name NPC名称
     * @param x X坐标
     * @param y Y坐标
     * @returns NPC对象
     */
    public static SetNPC(name: string, x: number, y: number): INPC {
        // 创建NPC对象
        const npc: INPC = {
            name,
            x,
            y
        };
        
        // 存储NPC对象
        this.npcs.set(name, npc);
        
        return npc;
    }
    
    /**
     * 创建连续对话
     * @returns 连续对话对象
     */
    public static CreateContinuousDialogue(): IContinuousDialogueWithMethods {
        const id = `dialogue_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const dialogue: IContinuousDialogue = {
            id,
            contents: [],
            currentIndex: 0,
            isPlaying: false
        };
        
        this.dialogues.set(id, dialogue);
        
        // 创建带有AddContent方法的对象
        const dialogueWithMethods = dialogue as IContinuousDialogueWithMethods;
        
        // 添加内容方法
        dialogueWithMethods.AddContent = (npc: INPC, content: string, type: BubbleType, typewriterEnabled: boolean, typewriterSpeed: number): IContinuousDialogueWithMethods => {
            dialogue.contents.push({
                npc,
                content,
                type,
                typewriterEnabled,
                typewriterSpeed
            });
            
            return dialogueWithMethods;
        };
        
        return dialogueWithMethods;
    }
    
    /**
     * 播放连续对话
     * @param dialogue 连续对话对象
     * @returns 播放控制对象
     */
    public static PlayContinuousDialogue(dialogue: IContinuousDialogue): {
        SetAutoNext: () => { 
            SetWaitTime: (waitTime: number) => { SetRandomRepeat: (repeatCount: number) => void },
            SetRandomRepeat: (repeatCount: number) => void
        },
        SetPressNext: () => { 
            SetNextKey: (key: string) => { SetRandomRepeat: (repeatCount: number) => void },
            SetRandomRepeat: (repeatCount: number) => void,
            EnableKeyPrompt: (enabled: boolean, color?: string, size?: number) => { SetRandomRepeat: (repeatCount: number) => void }
        },
        SetRandomRepeat: (repeatCount: number) => void
    } {
        // 如果有正在播放的对话，先停止
        if (this.currentPlayingDialogueId) {
            this.StopContinuousDialogue(this.currentPlayingDialogueId);
        }
        
        // 设置当前播放的对话ID
        this.currentPlayingDialogueId = dialogue.id;
        dialogue.isPlaying = true;
        dialogue.currentIndex = 0;
        
        // 播放第一条内容
        this.playDialogueContent(dialogue, 0);
        
        // 返回控制对象
        return {
            SetAutoNext: () => {
                // 确保第一句话也有足够的等待时间
                this.setupAutoPlay(dialogue, true);
                return {
                    SetWaitTime: (waitTime: number) => {
                        this.setAutoPlayWaitTime(dialogue, waitTime);
                        return {
                            SetRandomRepeat: (repeatCount: number) => {
                                this.setupRandomRepeat(dialogue, repeatCount);
                            }
                        };
                    },
                    SetRandomRepeat: (repeatCount: number) => {
                        this.setupRandomRepeat(dialogue, repeatCount);
                    }
                };
            },
            SetPressNext: () => {
                this.setupKeyPress(dialogue);
                return {
                    SetNextKey: (key: string) => {
                        this.setNextKey(key);
                        return {
                            SetRandomRepeat: (repeatCount: number) => {
                                this.setupRandomRepeat(dialogue, repeatCount);
                            }
                        };
                    },
                    SetRandomRepeat: (repeatCount: number) => {
                        this.setupRandomRepeat(dialogue, repeatCount);
                    },
                    // 添加新的EnableKeyPrompt方法
                    EnableKeyPrompt: (enabled: boolean = true, color: string = "#ffffff", size: number = 24) => {
                        this.setKeyPrompt(dialogue, enabled, color, size);
                        return {
                            SetRandomRepeat: (repeatCount: number) => {
                                this.setupRandomRepeat(dialogue, repeatCount);
                            }
                        };
                    }
                };
            },
            SetRandomRepeat: (repeatCount: number) => {
                this.setupRandomRepeat(dialogue, repeatCount);
            }
        };
    }
    
    /**
     * 停止连续对话
     * @param dialogueId 对话ID
     */
    public static StopContinuousDialogue(dialogueId: string): void {
        const dialogue = this.dialogues.get(dialogueId);
        if (!dialogue) return;
        
        // 清除所有气泡
        dialogue.contents.forEach(content => {
            if (content.bubbleInstance) {
                // 使用fadeOut方法淡出气泡
                try {
                    content.bubbleInstance.fadeOut();
                } catch (error: any) {
                    console.warn(`Error fading out bubble: ${error.message}`);
                    // 如果淡出失败，直接销毁
                    content.bubbleInstance.destroy();
                }
                content.bubbleInstance = undefined;
            }
        });
        
        // 重置状态
        dialogue.isPlaying = false;
        dialogue.currentIndex = 0;
        
        // 清除自动播放计时器
        this.clearAutoPlayTimer();
        
        // 清除按键监听
        this.clearKeyPressListener();
        
        // 清除随机重复设置
        this.repeatSettings.delete(dialogueId);
        
        // 清除当前播放ID
        if (this.currentPlayingDialogueId === dialogueId) {
            this.currentPlayingDialogueId = null;
        }
    }
    
    /**
     * 播放对话内容
     * @param dialogue 对话对象
     * @param index 内容索引
     */
    private static playDialogueContent(dialogue: IContinuousDialogue, index: number): void {
        if (!dialogue) {
            console.error("Invalid dialogue object");
            return;
        }
        
        if (index < 0 || index >= dialogue.contents.length) {
            console.error(`Invalid dialogue index: ${index}, max: ${dialogue.contents.length - 1}`);
            // 如果索引超出范围，可能是对话结束了
            if (index >= dialogue.contents.length) {
                this.onDialogueComplete(dialogue);
            }
            return;
        }
        
        // 获取当前内容
        const content = dialogue.contents[index];
        if (!content) {
            console.error(`No content found at index ${index}`);
            return;
        }
        
        // 更新当前索引
        dialogue.currentIndex = index;
        
        if (this.debugMode) {
            console.log(`Starting to play dialogue content at index ${index}/${dialogue.contents.length - 1}`);
        }
        
        // 清除所有可能存在的气泡，确保不会有多个气泡同时显示
        dialogue.contents.forEach((c, i) => {
            if (c.bubbleInstance && i !== index) {
                try {
                    c.bubbleInstance.destroy();
                } catch (error: any) {
                    console.warn(`Error destroying bubble at index ${i}: ${error.message}`);
                }
                c.bubbleInstance = undefined;
            }
        });
        
        // 如果当前内容已经有气泡，先销毁
        if (content.bubbleInstance) {
            try {
                content.bubbleInstance.destroy();
            } catch (error: any) {
                console.warn(`Error destroying existing bubble at index ${index}: ${error.message}`);
            }
            content.bubbleInstance = undefined;
        }
        
        // 创建新气泡
        try {
            if (!content.npc) {
                console.error(`NPC not defined for dialogue content at index ${index}`);
                return;
            }
            
            const bubble = UIBubble.ShowBubble(
                content.content,
                0, // 持续时间设为0，由对话系统控制销毁
                content.type
            );
            
            if (!bubble) {
                console.error(`Failed to create bubble for dialogue content at index ${index}`);
                return;
            }
            
            // 设置位置
            bubble.setPosition(content.npc.x, content.npc.y + UIBubble.PositionYOffset);
            
            // 设置打字机效果
            if (content.typewriterEnabled) {
                bubble.enableTypewriter(content.typewriterSpeed);
            }
            
            // 如果是中文内容，启用中文模式
            if (/[\u4e00-\u9fa5]/.test(content.content)) {
                bubble.setChineseMode();
            }
            
            // 如果启用了按键提示且不是自动播放模式，添加按键提示
            if (this.keyPromptEnabled && this.keyPressListener) {
                bubble.enableKeyPrompt(
                    this.nextKey === " " ? "Space" : this.nextKey,
                    this.keyPromptColor,
                    this.keyPromptSize
                );
            }
            
            // 保存气泡实例
            content.bubbleInstance = bubble;
            
            // 调试日志
            if (this.debugMode) {
                console.log(`Playing dialogue content ${index + 1}/${dialogue.contents.length}: "${content.content.substring(0, 20)}${content.content.length > 20 ? '...' : ''}" for NPC ${content.npc.name}`);
            }
        } catch (error: any) {
            console.error(`Failed to create bubble for dialogue content at index ${index}: ${error.message}`);
        }
    }
    
    /**
     * 检查对话是否可以继续
     * @param dialogue 对话对象
     * @param nextIndex 下一个索引
     * @returns 是否可以继续
     */
    private static canContinueDialogue(dialogue: IContinuousDialogue, nextIndex: number): boolean {
        if (!dialogue) {
            return false;
        }
        
        // 检查对话是否仍在播放
        if (!dialogue.isPlaying) {
            if (this.debugMode) {
                console.log("Dialogue is no longer playing");
            }
            return false;
        }
        
        // 检查索引是否有效
        if (nextIndex < 0 || nextIndex >= dialogue.contents.length) {
            if (this.debugMode) {
                console.log(`Invalid next index: ${nextIndex}, max: ${dialogue.contents.length - 1}`);
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * 设置自动播放
     * @param dialogue 对话对象
     * @param isFirstContent 是否是第一条内容
     */
    private static setupAutoPlay(dialogue: IContinuousDialogue, isFirstContent: boolean = false): void {
        // 清除之前的计时器和监听器
        this.clearAutoPlayTimer();
        this.clearKeyPressListener();
        
        // 获取当前内容
        const currentIndex = dialogue.currentIndex;
        if (currentIndex < 0 || currentIndex >= dialogue.contents.length) {
            console.error(`Invalid dialogue index: ${currentIndex}, max: ${dialogue.contents.length - 1}`);
            return;
        }
        
        const content = dialogue.contents[currentIndex];
        if (!content) {
            console.error(`No content found at index ${currentIndex}`);
            return;
        }
        
        // 计算等待时间
        let waitTime = this.defaultWaitTime;
        
        // 如果启用了打字机效果，等待时间需要加上打字机效果的时间
        if (content.typewriterEnabled) {
            waitTime += (content.content.length * content.typewriterSpeed / 1000) + 0.5;
        }
        
        // 如果是第一条内容，增加额外的等待时间，确保用户能够阅读
        if (isFirstContent) {
            waitTime += 2; // 增加2秒额外等待时间
        }
        
        // 创建计时器
        try {
            // 生成唯一的计时器标签
            const timerTag = `auto_play_${dialogue.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            this.autoPlayTimerTag = timerTag;
            
            // 创建计时器实例
            this.autoPlayTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            
            if (!this.autoPlayTimer) {
                console.error("Failed to create timer instance");
                return;
            }
            
            // 添加计时器事件监听
            const timerHandler = (e: any) => {
                if (e.tag === timerTag) {
                    // 移除事件监听，避免重复触发
                    if (this.autoPlayTimer) {
                        try {
                            this.autoPlayTimer.behaviors.Timer.removeEventListener("timer", timerHandler);
                        } catch (error: any) {
                            console.warn(`Error removing timer listener: ${error.message}`);
                        }
                    }
                    
                    // 检查对话是否仍在播放
                    if (!dialogue.isPlaying) {
                        console.log("Dialogue is no longer playing, skipping auto play");
                        return;
                    }
                    
                    // 检查是否是最后一条内容
                    const isLastContent = currentIndex >= dialogue.contents.length - 1;
                    
                    if (isLastContent) {
                        // 如果是最后一条内容，调用onDialogueComplete处理结束逻辑
                        if (this.debugMode) {
                            console.log(`Auto play reached last content (${currentIndex}/${dialogue.contents.length - 1}), completing dialogue`);
                        }
                        this.onDialogueComplete(dialogue);
                    } else {
                        // 否则播放下一条内容
                        const nextIndex = currentIndex + 1;
                        
                        // 检查是否可以继续对话
                        if (this.canContinueDialogue(dialogue, nextIndex)) {
                            if (this.debugMode) {
                                console.log(`Auto play advancing from ${currentIndex} to ${nextIndex}`);
                            }
                            
                            // 更新当前索引
                            dialogue.currentIndex = nextIndex;
                            
                            // 播放下一条内容
                            this.playDialogueContent(dialogue, nextIndex);
                            
                            // 继续设置自动播放
                            setTimeout(() => {
                                this.setupAutoPlay(dialogue);
                            }, 50); // 短暂延迟，确保UI更新
                        } else {
                            if (this.debugMode) {
                                console.log(`Cannot continue dialogue from index ${currentIndex} to ${nextIndex}`);
                            }
                        }
                    }
                }
            };
            
            // 添加事件监听
            this.autoPlayTimer.behaviors.Timer.addEventListener("timer", timerHandler);
            
            // 启动计时器
            this.autoPlayTimer.behaviors.Timer.startTimer(waitTime, timerTag, "once");
            
            // 调试日志
            if (this.debugMode) {
                console.log(`Auto play timer set for ${waitTime}s, current index: ${currentIndex}/${dialogue.contents.length - 1}, tag: ${timerTag}`);
            }
        } catch (error: any) {
            console.error(`Failed to create auto play timer: ${error.message}`);
        }
    }
    
    /**
     * 设置自动播放等待时间
     * @param dialogue 对话对象
     * @param waitTime 等待时间(秒)
     */
    private static setAutoPlayWaitTime(dialogue: IContinuousDialogue, waitTime: number): void {
        this.defaultWaitTime = waitTime > 0 ? waitTime : 0.2;
    }
    
    /**
     * 设置按键监听
     * @param dialogue 对话对象
     */
    private static setupKeyPress(dialogue: IContinuousDialogue): void {
        // 清除之前的计时器和监听器
        this.clearAutoPlayTimer();
        this.clearKeyPressListener();
        
        // 创建按键监听
        try {
            // 获取当前内容
            const content = dialogue.contents[dialogue.currentIndex];
            
            // 如果启用了按键提示，为当前气泡添加按键提示图标
            if (this.keyPromptEnabled && content.bubbleInstance) {
                content.bubbleInstance.enableKeyPrompt(
                    this.nextKey === " " ? "Space" : this.nextKey,
                    this.keyPromptColor,
                    this.keyPromptSize
                );
            }
            
            // 如果启用了打字机效果，需要等待打字机效果完成
            if (content.typewriterEnabled) {
                const waitTime = (content.content.length * content.typewriterSpeed / 1000) + 0.5;
                
                // 创建等待计时器
                const waitTimerTag = `wait_typewriter_${dialogue.id}_${Date.now()}`;
                const waitTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
                
                waitTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                    if (e.tag === waitTimerTag) {
                        // 打字机效果完成后，添加按键监听
                        this.addKeyPressListener(dialogue);
                        waitTimer.destroy();
                    }
                });
                
                waitTimer.behaviors.Timer.startTimer(waitTime, waitTimerTag, "once");
                
                if (this.debugMode) {
                    console.log(`Setting up key press after typewriter effect (${waitTime}s)`);
                }
            } else {
                // 直接添加按键监听
                this.addKeyPressListener(dialogue);
            }
        } catch (error: any) {
            console.error(`Failed to setup key press: ${error.message}`);
        }
    }
    
    /**
     * 添加按键监听
     * @param dialogue 对话对象
     */
    private static addKeyPressListener(dialogue: IContinuousDialogue): void {
        try {
            // 使用全局事件监听，而不是依赖Keyboard对象
            const keyPressHandler = (e: KeyboardEvent) => {
                // 检查是否是指定的按键
                if (e.key === this.nextKey || (this.nextKey === " " && e.code === "Space")) {
                    // 调试日志
                    if (this.debugMode) {
                        console.log(`Key pressed: ${e.key}, expected: ${this.nextKey}`);
                        console.log(`Advancing dialogue from ${dialogue.currentIndex} to ${dialogue.currentIndex + 1}`);
                    }
                    
                    // 检查是否是最后一条对话
                    const isLastContent = dialogue.currentIndex >= dialogue.contents.length - 1;
                    
                    if (isLastContent) {
                        // 如果是最后一条内容，调用onDialogueComplete处理结束逻辑
                        this.onDialogueComplete(dialogue);
                    } else {
                        // 否则播放下一条内容
                        this.playDialogueContent(dialogue, dialogue.currentIndex + 1);
                        
                        // 如果还有下一条，继续设置按键监听
                        if (dialogue.currentIndex < dialogue.contents.length - 1) {
                            this.setupKeyPress(dialogue);
                        }
                    }
                    
                    // 移除当前监听器
                    document.removeEventListener("keydown", keyPressHandler);
                }
            };
            
            // 保存监听器引用
            this.keyPressListener = keyPressHandler;
            
            // 添加监听器到document
            document.addEventListener("keydown", keyPressHandler);
            
            if (this.debugMode) {
                console.log(`Added key press listener for key: "${this.nextKey}"`);
                console.log(`Current dialogue index: ${dialogue.currentIndex}/${dialogue.contents.length - 1}`);
            }
        } catch (error: any) {
            console.error(`Failed to add key press listener: ${error.message}`);
        }
    }
    
    /**
     * 设置下一步按键
     * @param key 按键名称
     */
    private static setNextKey(key: string): void {
        this.nextKey = key;
        if (this.debugMode) {
            console.log(`Next key set to: "${key}"`);
        }
    }
    
    /**
     * 清除自动播放计时器
     */
    private static clearAutoPlayTimer(): void {
        if (this.autoPlayTimer) {
            try {
                // 尝试停止计时器
                if (this.autoPlayTimerTag && this.autoPlayTimerTag.trim() !== "") {
                    this.autoPlayTimer.behaviors.Timer.stopTimer(this.autoPlayTimerTag);
                }
                
                // 销毁计时器实例
                this.autoPlayTimer.destroy();
                
                if (this.debugMode) {
                    console.log(`Auto play timer cleared (tag: ${this.autoPlayTimerTag})`);
                }
            } catch (error: any) {
                console.warn(`Error clearing auto play timer: ${error.message}`);
            } finally {
                // 无论是否发生错误，都重置计时器变量
                this.autoPlayTimer = null;
                this.autoPlayTimerTag = "";
            }
        } else {
            // 即使没有计时器实例，也重置计时器标签
            this.autoPlayTimerTag = "";
        }
    }
    
    /**
     * 清除按键监听
     */
    private static clearKeyPressListener(): void {
        if (this.keyPressListener) {
            try {
                // 从document移除事件监听
                document.removeEventListener("keydown", this.keyPressListener);
                if (this.debugMode) {
                    console.log("Key press listener removed");
                }
            } catch (error: any) {
                console.warn(`Error removing key press listener: ${error.message}`);
            }
            this.keyPressListener = null;
        }
    }
    
    /**
     * 设置随机重复对话
     * @param dialogue 对话对象
     * @param repeatCount 重复次数，-1表示无限重复
     */
    private static setupRandomRepeat(dialogue: IContinuousDialogue, repeatCount: number): void {
        // 存储重复设置
        this.repeatSettings.set(dialogue.id, {
            count: repeatCount,
            current: 0
        });
        
        if (this.debugMode) {
            console.log(`Random repeat set for dialogue ${dialogue.id}: ${repeatCount === -1 ? 'infinite' : repeatCount} times`);
        }
    }
    
    /**
     * 对话完成回调
     * @param dialogue 对话对象
     */
    private static onDialogueComplete(dialogue: IContinuousDialogue): void {
        // 检查是否设置了随机重复
        const repeatSetting = this.repeatSettings.get(dialogue.id);
        
        if (repeatSetting) {
            // 检查是否需要继续重复
            if (repeatSetting.count === -1 || repeatSetting.current < repeatSetting.count) {
                // 增加当前重复次数计数
                if (repeatSetting.count !== -1) {
                    repeatSetting.current++;
                }
                
                // 确保清除所有气泡
                dialogue.contents.forEach(content => {
                    if (content.bubbleInstance) {
                        try {
                            content.bubbleInstance.destroy();
                        } catch (error: any) {
                            console.warn(`Error destroying bubble: ${error.message}`);
                        }
                        content.bubbleInstance = undefined;
                    }
                });
                
                // 清除所有计时器和监听器
                this.clearAutoPlayTimer();
                this.clearKeyPressListener();
                
                // 随机选择一个索引作为起点（不包括第一条）
                const minIndex = 1;
                const maxIndex = dialogue.contents.length - 1;
                const randomStartIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
                
                if (this.debugMode) {
                    console.log(`Random repeat: starting from index ${randomStartIndex}/${dialogue.contents.length - 1}`);
                    if (repeatSetting.count !== -1) {
                        console.log(`Repeat count: ${repeatSetting.current}/${repeatSetting.count}`);
                    }
                }
                
                // 重置对话状态
                dialogue.isPlaying = true;
                dialogue.currentIndex = randomStartIndex;
                
                // 延迟执行，确保之前的清理操作已完成
                setTimeout(() => {
                    // 播放随机选择的内容
                    this.playDialogueContent(dialogue, randomStartIndex);
                    
                    // 再次延迟设置自动播放，确保内容已经完全加载
                    setTimeout(() => {
                        // 使用自动播放模式继续对话
                        this.setupAutoPlay(dialogue);
                        if (this.debugMode) {
                            console.log(`Restarted auto play from random index ${randomStartIndex}`);
                        }
                    }, 300);
                }, 200);
                
                return;
            } else {
                // 重复次数已达到上限，清除重复设置
                this.repeatSettings.delete(dialogue.id);
                
                if (this.debugMode) {
                    console.log(`Random repeat completed for dialogue ${dialogue.id}`);
                }
            }
        }
        
        // 确保清除最后一个气泡
        const lastIndex = dialogue.currentIndex;
        if (lastIndex >= 0 && lastIndex < dialogue.contents.length) {
            const lastContent = dialogue.contents[lastIndex];
            if (lastContent.bubbleInstance) {
                try {
                    // 创建一个计时器，在淡出动画完成后销毁气泡
                    const exitTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
                    const exitTag = `exit_dialogue_${dialogue.id}_${Date.now()}`;
                    
                    exitTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                        if (e.tag === exitTag) {
                            // 确保气泡被完全销毁
                            if (lastContent.bubbleInstance) {
                                lastContent.bubbleInstance.destroy();
                                lastContent.bubbleInstance = undefined;
                            }
                            exitTimer.destroy();
                        }
                    });
                    
                    // 先禁用按键提示，确保按键提示也会随气泡一起淡出
                    // 但不要完全禁用按键提示，而是让它随气泡一起淡出
                    if (this.keyPromptEnabled && lastContent.bubbleInstance) {
                        // 不完全禁用，而是让它随气泡一起淡出
                        // lastContent.bubbleInstance.disableKeyPrompt();
                    }
                    
                    // 先触发淡出效果
                    lastContent.bubbleInstance.fadeOut();
                    
                    // 设置计时器，等待淡出动画完成后销毁气泡
                    // UIBubble.FADE_OUT_DURATION是毫秒，需要转换为秒
                    const fadeOutDurationSeconds = 0.6; // 稍微比淡出动画长一点，确保动画完成
                    exitTimer.behaviors.Timer.startTimer(fadeOutDurationSeconds, exitTag, "once");
                } catch (error: any) {
                    console.error(`Failed to create exit timer: ${error.message}`);
                    // 如果创建计时器失败，直接销毁气泡
                    if (lastContent.bubbleInstance) {
                        lastContent.bubbleInstance.destroy();
                        lastContent.bubbleInstance = undefined;
                    }
                }
            }
        }
        
        // 清除所有可能剩余的气泡
        dialogue.contents.forEach((content, index) => {
            if (index !== lastIndex && content.bubbleInstance) {
                // 确保禁用按键提示
                if (this.keyPromptEnabled && content.bubbleInstance) {
                    content.bubbleInstance.disableKeyPrompt();
                }
                content.bubbleInstance.destroy();
                content.bubbleInstance = undefined;
            }
        });
        
        // 清除所有计时器和监听器
        this.clearAutoPlayTimer();
        this.clearKeyPressListener();
        
        // 重置状态
        dialogue.isPlaying = false;
        dialogue.currentIndex = 0;
        
        // 清除当前播放ID
        if (this.currentPlayingDialogueId === dialogue.id) {
            this.currentPlayingDialogueId = null;
        }
        
        console.log(`Dialogue ${dialogue.id} completed`);
    }
    
    /**
     * 获取所有NPC
     * @returns NPC对象数组
     */
    public static GetAllNPCs(): INPC[] {
        return Array.from(this.npcs.values());
    }
    
    /**
     * 获取NPC
     * @param name NPC名称
     * @returns NPC对象
     */
    public static GetNPC(name: string): INPC | undefined {
        return this.npcs.get(name);
    }
    
    /**
     * 更新NPC位置
     * @param name NPC名称
     * @param x X坐标
     * @param y Y坐标
     * @returns 是否更新成功
     */
    public static UpdateNPCPosition(name: string, x: number, y: number): boolean {
        const npc = this.npcs.get(name);
        if (!npc) return false;
        
        npc.x = x;
        npc.y = y;
        return true;
    }
    
    /**
     * 获取当前正在播放的对话
     * @returns 当前正在播放的对话
     */
    public static GetCurrentPlayingDialogue(): IContinuousDialogue | null {
        if (!this.currentPlayingDialogueId) return null;
        return this.dialogues.get(this.currentPlayingDialogueId) || null;
    }
    
    /**
     * 获取所有对话
     * @returns 所有对话
     */
    public static GetAllDialogues(): IContinuousDialogue[] {
        return Array.from(this.dialogues.values());
    }

    /**
     * 设置按键提示
     * @param dialogue 对话对象
     * @param enabled 是否启用按键提示
     * @param color 按键提示颜色
     * @param size 按键提示大小
     */
    private static setKeyPrompt(dialogue: IContinuousDialogue, enabled: boolean = true, color: string = "#ffffff", size: number = 24): void {
        this.keyPromptEnabled = enabled;
        this.keyPromptColor = color;
        this.keyPromptSize = size;
        
        // 如果当前有显示的气泡，立即更新
        const currentContent = dialogue.contents[dialogue.currentIndex];
        if (currentContent && currentContent.bubbleInstance) {
            if (enabled) {
                currentContent.bubbleInstance.enableKeyPrompt(
                    this.nextKey === " " ? "Space" : this.nextKey,
                    color,
                    size
                );
            } else {
                currentContent.bubbleInstance.disableKeyPrompt();
            }
        }
        
        if (this.debugMode) {
            console.log(`Key prompt ${enabled ? 'enabled' : 'disabled'} for dialogue ${dialogue.id}`);
        }
    }
}