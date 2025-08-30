import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { BubbleType, UIBubble } from "./UIBubble.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
 
    if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.globalVars.GameType!="Level") return
    
    // 初始化高级气泡系统
    //alert("UIAdvanceBubble init")

    var ChangJingLuInstance =pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit
    .RUN_TIME_.objects.ChangJingLu.getFirstInstance();

    var HouziInstance =pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit
    .RUN_TIME_.objects.HouZi.getFirstInstance();

    var HeMaInstance =pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit
    .RUN_TIME_.objects.HeMa.getFirstInstance();
    
    if(!ChangJingLuInstance || !HouziInstance || !HeMaInstance) return

    var NPCChangJingLu = 
    AdvanceBubble.SetNPC("ChangJingLu", ChangJingLuInstance.x-50, ChangJingLuInstance.y+100);
    var NPCHouzi = AdvanceBubble.SetNPC("Houzi", HouziInstance.x-50, HouziInstance.y+100);
    var NPCHeMa = AdvanceBubble.SetNPC("HeMa", HeMaInstance.x-50, HeMaInstance.y+100);

    var TestDialogue = AdvanceBubble.CreateContinuousDialogue()
    TestDialogue
    .AddContent(NPCChangJingLu,"你好，我是长颈鹿。",BubbleType.SPEECH,true,100)
    .AddContent(NPCChangJingLu,"你们都自我介绍一下自己吧。",BubbleType.SPEECH,true,100)
    .AddContent(NPCChangJingLu,"那个长得像猴子的你先来。",BubbleType.SPEECH,true,100)
    .AddContent(NPCHouzi,"你好，我是猴子。",BubbleType.SPEECH,true,100)
    .AddContent(NPCHouzi,"你好，我看起来真的很像猴子吗？。",BubbleType.SPEECH,true,100)
    .AddContent(NPCHouzi,"好吧其实我就是猴子哈哈哈哈。",BubbleType.SPEECH,true,100)
    .AddContent(NPCHeMa,"你好，我是河马。",BubbleType.SPEECH,true,100)
    .AddContent(NPCHeMa,"你好，有人看看我吗？我是河马。",BubbleType.SPEECH,true,100)

    AdvanceBubble.PlayContinuousDialogue(TestDialogue).SetAutoNext().SetWaitTime(2);
    
    
})

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
    
    // 用于按键监听
    private static keyPressListener: any = null;
    private static nextKey: string = " "; // 默认使用空格键（空格的键值是空字符串）
    
    // 默认等待时间(秒)
    private static defaultWaitTime: number = 0.2;

    // 调试模式
    private static debugMode: boolean = true;

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
        SetAutoNext: () => { SetWaitTime: (waitTime: number) => void },
        SetPressNext: () => { SetNextKey: (key: string) => void }
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
                this.setupAutoPlay(dialogue);
                return {
                    SetWaitTime: (waitTime: number) => {
                        this.setAutoPlayWaitTime(dialogue, waitTime);
                    }
                };
            },
            SetPressNext: () => {
                this.setupKeyPress(dialogue);
                return {
                    SetNextKey: (key: string) => {
                        this.setNextKey(key);
                    }
                };
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
        if (index >= dialogue.contents.length) {
            // 对话结束
            this.onDialogueComplete(dialogue);
            return;
        }
        
        // 获取当前内容
        const content = dialogue.contents[index];
        
        // 更新当前索引
        dialogue.currentIndex = index;
        
        // 清除上一个气泡
        if (index > 0 && dialogue.contents[index - 1].bubbleInstance) {
            dialogue.contents[index - 1].bubbleInstance?.destroy();
            dialogue.contents[index - 1].bubbleInstance = undefined;
        }
        
        // 创建新气泡
        const bubble = UIBubble.ShowBubble(
            content.content,
            0, // 持续时间设为0，由对话系统控制销毁
            content.type
        );
        
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
        
        // 保存气泡实例
        content.bubbleInstance = bubble;

        // 调试日志
        if (this.debugMode) {
            console.log(`Playing dialogue content ${index + 1}/${dialogue.contents.length}: "${content.content}" for NPC ${content.npc.name}`);
        }
    }
    
    /**
     * 设置自动播放
     * @param dialogue 对话对象
     */
    private static setupAutoPlay(dialogue: IContinuousDialogue): void {
        // 清除之前的计时器和监听器
        this.clearAutoPlayTimer();
        this.clearKeyPressListener();
        
        // 获取当前内容
        const content = dialogue.contents[dialogue.currentIndex];
        
        // 计算等待时间
        let waitTime = this.defaultWaitTime;
        
        // 如果启用了打字机效果，等待时间需要加上打字机效果的时间
        if (content.typewriterEnabled) {
            waitTime += (content.content.length * content.typewriterSpeed / 1000) + 0.5;
        }
        
        // 创建计时器
        try {
            this.autoPlayTimerTag = `auto_play_${dialogue.id}_${Date.now()}`;
            this.autoPlayTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            
            this.autoPlayTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.autoPlayTimerTag) {
                    // 检查是否是最后一条内容
                    const isLastContent = dialogue.currentIndex >= dialogue.contents.length - 1;
                    
                    if (isLastContent) {
                        // 如果是最后一条内容，调用onDialogueComplete处理结束逻辑
                        this.onDialogueComplete(dialogue);
                    } else {
                        // 否则播放下一条内容
                        this.playDialogueContent(dialogue, dialogue.currentIndex + 1);
                        
                        // 继续设置自动播放
                        this.setupAutoPlay(dialogue);
                    }
                }
            });
            
            this.autoPlayTimer.behaviors.Timer.startTimer(waitTime, this.autoPlayTimerTag, "once");
            
            // 调试日志
            if (this.debugMode) {
                console.log(`Auto play timer set for ${waitTime}s, current index: ${dialogue.currentIndex}/${dialogue.contents.length - 1}`);
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
                    
                    // 播放下一条内容
                    this.playDialogueContent(dialogue, dialogue.currentIndex + 1);
                    
                    // 如果还有下一条，继续设置按键监听
                    if (dialogue.currentIndex < dialogue.contents.length - 1) {
                        this.setupKeyPress(dialogue);
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
                this.autoPlayTimer.behaviors.Timer.stopTimer(this.autoPlayTimerTag);
                this.autoPlayTimer.destroy();
            } catch (error: any) {
                console.warn(`Error stopping auto play timer: ${error.message}`);
            }
            this.autoPlayTimer = null;
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
     * 对话完成回调
     * @param dialogue 对话对象
     */
    private static onDialogueComplete(dialogue: IContinuousDialogue): void {
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
}