import { hf_engine } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";



var isBindButtonIntoDebugPanel =false

hf_engine.gl$_ubu_init(() => {


    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    // Test category for bubble system
    var bubble_system = IMGUIDebugButton.AddCategory("bubble_system");

   
    // 添加新的测试按钮，用于验证气泡大小调整效果
    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Extreme Long Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const extremeLongText = "这是一个超长的中文文本测试，用于验证气泡大小调整效果。我们需要确保即使是非常长的文本也能够完整显示，不会有任何字符被截断或隐藏。这段文本故意设计得非常长，以测试气泡框是否能够正确地扩展以容纳所有内容。在游戏中，有时候会需要显示大量的文本信息，比如角色对话、任务描述或者故事背景介绍等。如果气泡无法正确地调整大小，就会导致文本显示不完整，影响玩家体验。通过这个测试，我们希望确认气泡框能够根据文本内容的长度自动调整大小，确保所有文本都能够完整地显示出来。";

        UIBubble.ShowBubble(extremeLongText, 12, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x - 50, PlayerInstance.y - 300)
            .setChineseMode();
    });

    // 添加测试短文本气泡的按钮
    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Very Short Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一条非常短的文本", 5, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 50)
            .setChineseMode();
    });

    // 添加配置气泡大小的按钮
    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Adjust Bubble Config", () => {
        // 修改气泡大小配置
        UIBubble.SetBubbleSizeConfig({
            scrollThreshold: 80,  // 降低滚动阈值，更短的文本就会显示滚动条
            shortTextLines: 3,    // 增加短文本的行数
            minHeight: 70         // 增加最小高度
        });
        
        // 显示一条消息确认配置已更改
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;
        
        UIBubble.ShowBubble("气泡大小配置已更新！", 3, BubbleType.INFO)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .setColors("#0f3460", "#16537e", "#e7f3ff");
    });

    // 添加恢复默认配置的按钮
    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Reset Bubble Config", () => {
        // 恢复默认配置
        UIBubble.SetBubbleSizeConfig({
            scrollThreshold: 100,
            shortTextLines: 2,
            minHeight: 60
        });
        
        // 显示一条消息确认配置已重置
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;
        
        UIBubble.ShowBubble("气泡大小配置已重置为默认值！", 3, BubbleType.INFO)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .setColors("#0f3460", "#16537e", "#e7f3ff");
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Multiline English", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const longEnglishText = "This is a test for multiline English text display in the bubble UI. We need to ensure that long English text is properly wrapped and displayed completely within the bubble. The bubble should automatically adjust its size to accommodate all the text content without any truncation or overflow issues. This is important for game dialogues, instructions, and other text-heavy content that needs to be displayed to the player.";

        UIBubble.ShowBubble(longEnglishText, 10, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x - 50, PlayerInstance.y - 200);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Mixed Content", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const mixedText = "This is a test for mixed content (English and Chinese) 这是中英文混合内容的测试 to ensure that bubbles can properly display text with different character sets. 确保气泡可以正确显示不同字符集的文本。 The bubble should adjust its size accordingly. 气泡应该相应地调整其大小。";

        UIBubble.ShowBubble(mixedText, 10, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x - 50, PlayerInstance.y - 100)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Short Chinese Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一条简短的中文测试信息。", 5, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Medium Chinese Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一条中等长度的中文测试信息。我们需要确保所有文本都能正确显示，不会被截断。中文字符应该完整可见。", 5, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 100)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Long Chinese Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一条非常长的中文测试信息。我们需要确保所有文本都能正确显示，不会被截断。中文字符应该完整可见。这条信息特别长，用于测试气泡在处理大量中文文本时的表现。我们希望即使是这么长的文本，也能够完整地显示出来，不会有任何字符被截断或隐藏。这对于游戏中的对话和提示信息非常重要。", 8, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 200)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Chinese Typewriter Effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一条带有打字机效果的中文测试信息。我们需要确保文本在逐字显示的过程中不会出现布局问题。所有字符应该在适当的位置显示，不会有任何跳跃或错位。", 8, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 300)
            .setChineseMode()
            .enableTypewriter(80);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show simple bubble", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这里是一条中文测试信息。现在在测试信息的长度。这个信息足够的长。好的非常的长。现在正在测试气泡大小的自动适配。好的就是这样", 3, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset).setChineseMode()
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show typewriter bubble", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这里是一条中文测试信息。现在在测试信息的长度。这个信息足够的长。好的非常的长。现在正在测试气泡大小的自动适配。好的就是这样", 5, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset)
            .enableTypewriter(50).setChineseMode(); // 50ms per character
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show thought bubble", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("I'm thinking about something...", 4, BubbleType.SYSTEM)
            .setPosition(PlayerInstance.x + 50, PlayerInstance.y - 80)
            .setSize(200, 80);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show long typewriter text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const longText = "This is a very long message that will appear with typewriter effect and the bubble will grow as the text appears!";

        UIBubble.ShowBubble(longText, 8, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x - 150, PlayerInstance.y - 200)
            .enableTypewriter(80); // 80ms per character
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show warning bubble", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("Warning: Danger ahead!", 2, BubbleType.WARNING)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 150)
            .setColors("#ff6b6b", "#2c2c2c", "#ffffff");
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Destroy all bubbles", () => {
        UIBubble.DestroyAllBubbles();
    });

    
    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Narrow Bubble - Chinese", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一个测试窄气泡的中文文本，用于验证在不同分辨率下气泡大小是否保持固定。", 6, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 50)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Narrow Bubble - English", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("This is a test for narrow bubble with English text to verify if the bubble size remains fixed across different resolutions.", 6, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 150);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test Long Text", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这是一个非常长的中文文本，用于测试在窄气泡下文本是否能够正确换行并完整显示。我们希望无论窗口大小如何变化，气泡的大小和文本的显示效果都保持一致。这样可以确保在不同分辨率下用户体验的一致性。", 10, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset - 250)
            .setChineseMode();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test fixed typewriter", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("This should start small and grow as text appears!", 6, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 120)
            .enableTypewriter(80); // Slower for better visibility
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test visibility fix", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("Visibility test - can you see me?", 4, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 50);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show bubble info", () => {
        const info = UIBubble.GetBubbleInfo();
        console.log(`Active bubbles: ${info.count}`);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test smooth typewriter", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("This text should appear smoothly without flickering or transparency issues!", 7, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 140)
            .enableTypewriter(60); // Medium speed for testing
    });
});

// Enum for different bubble types
export enum BubbleType {
    SPEECH = "speech",       // Regular speech bubble
    THOUGHT = "thought",     // Thought bubble with cloud-like appearance
    INFO = "info",          // Information bubble
    WARNING = "warning",    // Warning/alert bubble
    SYSTEM = "system"       // System message bubble
}

export class UIBubble {
    private static instances: Map<string, UIBubble> = new Map();
    private static idCounter: number = 0;

    private id: string;
    private htmlElement: any; // HTML element instance
    private content: string;
    private duration: number;
    private type: BubbleType;
    private layer: string;

    // Position and size properties
    private _x: number = 0;
    private _y: number = 0;
    private _width: number = 0; // 0 means auto-size
    private _height: number = 0; // 0 means auto-size

    // Color properties
    private backgroundColor: string = "#000000";
    private borderColor: string = "#333333";
    private textColor: string = "#d0d0d0";

    // Animation properties
    private static FADE_IN_DURATION: number = 500; // milliseconds
    private static FADE_OUT_DURATION: number = 500; // milliseconds

    // Typewriter effect properties
    private typewriterEnabled: boolean = false;
    private typewriterSpeed: number = 50; // milliseconds per character
    private typewriterCurrentIndex: number = 0;
    private typewriterTimer: any | null = null; // C3 Timer instance for typewriter
    private typewriterTimerTag: string = "";
    private displayedContent: string = "";

    // Auto-destroy timer
    private destroyTimer: any | null = null; // C3 Timer instance for auto-destroy
    private destroyTimerTag: string = "";

    // Animation state
    private isAnimatingIn: boolean = false;
    private isAnimatingOut: boolean = false;
    private hasPlayedEntranceAnimation: boolean = false;

    // Chinese mode properties
    private chineseModeEnabled: boolean = false;
    private chineseModeHeightMultiplier: number = 1.5;
    private chineseModeLineHeight: number = 1.8;

    // Postion OffSet 
    public static PositionYOffset: number = -250;
    public static PostionXOffset: number = -20;

    // 按键提示图标属性
    private keyPromptEnabled: boolean = false;
    private keyPromptKey: string = "Space";
    private keyPromptColor: string = "#ffffff";
    private keyPromptSize: number = 24;
    private keyPromptOpacity: number = 0.8;
    private keyPromptPulseSpeed: number = 1.5; // 动画速度，单位为秒
    private static keyPromptUseHardwareAcceleration: boolean = true; // 使用硬件加速

    // 气泡大小配置
    public static BubbleSizeConfig = {
        // 文本长度阈值，超过此长度才显示滚动条
        scrollThreshold: 10,
        // 最小宽度
        minWidth: 180,
        // 最小高度
        minHeight: 80,
        // 短文本宽度（中文）
        shortTextWidthChinese: 240,
        // 中等文本宽度（中文）
        mediumTextWidthChinese: 300,
        // 长文本宽度（中文）
        longTextWidthChinese: 360,
        // 短文本宽度（英文）
        shortTextWidthEnglish: 220,
        // 中等文本宽度（英文）
        mediumTextWidthEnglish: 280,
        // 长文本宽度（英文）
        longTextWidthEnglish: 340,
        // 短文本长度阈值
        shortTextThreshold: 20,
        // 中等文本长度阈值
        mediumTextThreshold: 50,
        // 可见行数（用于长文本）
        visibleLines: 5,
        // 短文本行数（用于自适应高度）
        shortTextLines: 2
    };


    private constructor(content: string, duration: number, type: BubbleType, layer: string = "html_c3") {
        this.id = `bubble_${++UIBubble.idCounter}_${Date.now()}`;
        this.content = content;
        this.duration = duration;
        this.type = type;
        this.layer = layer;

        // Initialize timer tags
        this.typewriterTimerTag = `typewriter_${this.id}_${Date.now()}`;
        this.destroyTimerTag = `destroy_${this.id}_${Date.now()}`;

        // Initialize displayed content (will be empty for typewriter effect)
        this.displayedContent = "";

        // Set default colors based on type
        this.setDefaultColors();

        // Calculate auto-size based on content
        this.calculateAutoSize();

        // Create HTML element
        this.createHtmlElement();

        console.log(`Created ${this.type} bubble with ID: ${this.id}, duration: ${this.duration}s`);
    }

    /**
     * Shows a new bubble or returns existing one
     * @param content Text content to display
     * @param duration Duration in seconds (0 = permanent until manually destroyed)
     * @param type Visual style of the bubble
     * @param id Optional unique identifier (auto-generated if not provided)
     */
    public static ShowBubble(
        content: string,
        duration: number = 3,
        type: BubbleType = BubbleType.SPEECH,
        id?: string
    ): UIBubble {
        // Generate ID if not provided
        if (!id) {
            id = `auto_${type}_${Date.now()}`;
        }

        // If instance with this ID already exists, destroy it first
        if (UIBubble.instances.has(id)) {
            UIBubble.instances.get(id)?.destroy();
        }

        // Create new instance
        const instance = new UIBubble(content, duration, type);
        instance.id = id; // Override the auto-generated ID
        UIBubble.instances.set(id, instance);

        return instance;
    }

    /**
     * Enables typewriter effect
     * @param speed Speed in milliseconds per character (default: 50ms)
     */
    public enableTypewriter(speed: number = 50): UIBubble {
        this.typewriterEnabled = true;
        this.typewriterSpeed = speed;
        this.typewriterCurrentIndex = 0;
        this.displayedContent = ""; // Start with empty content

        // Recalculate size for empty content
        this.calculateAutoSize();

        // Pre-size for full content to avoid overflow during typing (especially for Chinese)
        const prevDisplayed = this.displayedContent;
        this.displayedContent = this.content;
        this.calculateAutoSize();
        const targetWidth = this._width;
        const targetHeight = this._height;
        this.displayedContent = prevDisplayed;

        // Ensure initial size is at least the final size so text never overflows
        this.calculateAutoSize();
        this._width = Math.max(this._width, targetWidth);
        this._height = Math.max(this._height, targetHeight);

        if (this.htmlElement) {
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            this.renderHTML(); // Re-render with empty content
        }

        // Start typewriter effect after entrance animation using C3Timer
        try {
            const delayTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);
            const delayTag = `typewriter_delay_${this.id}_${Date.now()}`;

            delayTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === delayTag) {
                    this.startTypewriterEffect();
                    delayTimer.destroy();
                }
            });

            const delaySeconds = (UIBubble.FADE_IN_DURATION + 100) / 1000;
            delayTimer.behaviors.Timer.startTimer(delaySeconds, delayTag, "once");
        } catch (error: any) {
            console.error(`Failed to create typewriter delay timer: ${error.message}`);
            // Fallback to immediate start
            this.startTypewriterEffect();
        }

        return this;
    }

    /**
     * Sets default colors based on bubble type
     */
    private setDefaultColors(): void {
        switch (this.type) {
            case BubbleType.SPEECH:
                this.backgroundColor = "#000000";
                this.borderColor = "#333333";
                this.textColor = "#d0d0d0";
                break;
            case BubbleType.THOUGHT:
                this.backgroundColor = "#1a1a2e";
                this.borderColor = "#16213e";
                this.textColor = "#e0e0e0";
                break;
            case BubbleType.INFO:
                this.backgroundColor = "#0f3460";
                this.borderColor = "#16537e";
                this.textColor = "#e7f3ff";
                break;
            case BubbleType.WARNING:
                this.backgroundColor = "#3d1a00";
                this.borderColor = "#cc5500";
                this.textColor = "#ffcc99";
                break;
            case BubbleType.SYSTEM:
                this.backgroundColor = "rgb(0, 0, 0)";
                this.borderColor = "#555555";
                this.textColor = "#cccccc";
                break;
        }
    }

    /**
     * Calculates auto-size based on content length
     */
    private calculateAutoSize(): void {
        const content = this.typewriterEnabled ? this.displayedContent : this.content;
        const contentLength = content.length;

        // 根据内容长度动态调整宽度
        let baseWidth = 0;
        let baseHeight = 0;
        
        // 设置基础宽度 - 根据内容长度适当调整
        if (this.chineseModeEnabled) {
            // 中文模式下宽度
            if (contentLength <= UIBubble.BubbleSizeConfig.shortTextThreshold) {
                baseWidth = UIBubble.BubbleSizeConfig.shortTextWidthChinese; // 短文本使用较窄宽度
            } else if (contentLength <= UIBubble.BubbleSizeConfig.mediumTextThreshold) {
                baseWidth = UIBubble.BubbleSizeConfig.mediumTextWidthChinese; // 中等长度文本
            } else {
                baseWidth = UIBubble.BubbleSizeConfig.longTextWidthChinese; // 长文本使用较宽宽度
            }
        } else {
            // 英文模式下宽度
            if (contentLength <= UIBubble.BubbleSizeConfig.shortTextThreshold * 1.5) {
                baseWidth = UIBubble.BubbleSizeConfig.shortTextWidthEnglish; // 短文本使用较窄宽度
            } else if (contentLength <= UIBubble.BubbleSizeConfig.mediumTextThreshold * 1.6) {
                baseWidth = UIBubble.BubbleSizeConfig.mediumTextWidthEnglish; // 中等长度文本
            } else {
                baseWidth = UIBubble.BubbleSizeConfig.longTextWidthEnglish; // 长文本使用较宽宽度
            }
        }
        
        // 计算每行能容纳的字符数
        const charWidth = this.chineseModeEnabled ? 22 : 14; // 中文字符宽度更大
        const paddingHorizontal = 20; // 水平内边距
        const charsPerLine = Math.max(4, Math.floor((baseWidth - paddingHorizontal) / charWidth));
        
        // 估计总行数
        const totalLines = Math.ceil(contentLength / charsPerLine);
        
        // 根据估计的行数和行高计算高度
        const fontSize = this.chineseModeEnabled ? 18 : 16;
        const lineHeight = this.chineseModeEnabled ? 1.6 : 1.4;
        const lineHeightPx = fontSize * lineHeight;
        
        // 内边距
        const paddingVertical = this.chineseModeEnabled ? 20 : 16;
        
        // 短文本使用自适应高度，长文本使用固定高度
        if (contentLength <= UIBubble.BubbleSizeConfig.scrollThreshold) {
            // 短文本：根据实际行数计算高度（自适应）
            baseHeight = Math.ceil(Math.min(totalLines, Math.max(UIBubble.BubbleSizeConfig.shortTextLines, totalLines)) * lineHeightPx + paddingVertical);
        } else {
            // 长文本：固定为可见行数的高度（使用滚动条）
            baseHeight = Math.ceil(UIBubble.BubbleSizeConfig.visibleLines * lineHeightPx + paddingVertical);
        }
        
        // 根据气泡类型调整
        switch (this.type) {
            case BubbleType.THOUGHT:
                baseWidth += 20;
                baseHeight += 10;
                break;
            case BubbleType.INFO:
                baseWidth += 20;
                baseHeight += 10;
                break;
            case BubbleType.WARNING:
                baseWidth += 20;
                baseHeight += 10;
                break;
        }
        
        // 只为长文本增加滚动条空间
        if (contentLength > UIBubble.BubbleSizeConfig.scrollThreshold) {
            baseWidth += 10; // 为滚动条留出空间
        }
        
        // 确保最小尺寸
        this._width = Math.max(UIBubble.BubbleSizeConfig.minWidth, Math.round(baseWidth));
        this._height = Math.max(UIBubble.BubbleSizeConfig.minHeight, Math.round(baseHeight));
        
        // 调试信息
        console.log(`Bubble size: ${this._width}x${this._height}, estimated ${totalLines} lines of text, content length: ${contentLength}`);
    }

    /**
     * Creates the HTML element for the bubble
     */
    private createHtmlElement(): void {
        try {
            // Use player position as default if no position set
            if (this._x === 0 && this._y === 0) {
                const PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
                if (PlayerInstance) {
                    this._x = PlayerInstance.x;
                    this._y = PlayerInstance.y - 100; // Above player by default
                }
            }

            // Create HTML element using HTML_c3 object
            this.htmlElement = hf_engine.runtime.objects.HTML_c3.createInstance(
                this.layer,
                this._x,
                this._y
            );
            
            // 设置固定大小
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            
            // Render initial HTML and start entrance animation
            this.renderHTML();
            this.playEntranceAnimation();

        } catch (error: any) {
            console.error(`Failed to create bubble HTML element: ${error.message}`);
            // Create console-only bubble as fallback
            this.htmlElement = null;
            console.log(`Bubble ${this.id}: "${this.content}" (console-only mode)`);
        }
    }

    /**
     * Renders the HTML content for the bubble
     */
    private renderHTML(): void {
        if (!this.htmlElement || !this.htmlElement.setContent) return;

        const bubbleHtml = this.generateBubbleHTML();
        this.htmlElement.setContent(bubbleHtml, "html");
    }

    /**
     * 专门用于打字机效果的HTML渲染，不会重复应用淡入动画
     * 解决打字机效果导致重复淡入动画的问题
     */
    private renderTypewriterHTML(): void {
        if (!this.htmlElement || !this.htmlElement.setContent) return;

        const bubbleHtml = this.generateBubbleHTMLForTypewriter();
        this.htmlElement.setContent(bubbleHtml, "html");
    }

    /**
     * Generates text container styles for Chinese mode
     */
    private getTextContainerStyles(): string {
        const content = this.typewriterEnabled ? this.displayedContent : this.content;
        const contentLength = content.length;
        
        // 确定是否需要滚动条
        const needsScrollbar = contentLength > UIBubble.BubbleSizeConfig.scrollThreshold;
        
        let styles = [
            `color: ${this.textColor}`,
            `font-size: ${this.chineseModeEnabled ? '14px' : '16px'}`,
            `line-height: ${this.chineseModeEnabled ? '1.5' : '1.4'}`,
            `word-wrap: break-word`,
            `overflow-wrap: break-word`,
            `max-width: 100%`,
            `width: 100%`,
            `height: 100%`,
            `box-sizing: border-box`,
            `white-space: normal`,
            `display: block`,
            `margin: 0`,
            `cursor: default` // 默认鼠标样式
        ];

        // 只有长文本才启用滚动条
        if (needsScrollbar) {
            styles.push(
                `overflow-y: auto`, // 启用垂直滚动
                `overflow-x: hidden`, // 禁用水平滚动
                `scrollbar-width: thin`, // Firefox滚动条样式
                `scrollbar-color: ${this.borderColor} rgba(0,0,0,0.1)`, // Firefox滚动条颜色
                `pointer-events: auto` // 确保可以接收鼠标事件
            );
        } else {
            styles.push(
                `overflow: hidden`, // 短文本不需要滚动
                `pointer-events: none` // 短文本不需要鼠标交互
            );
        }

        if (this.chineseModeEnabled) {
            styles.push(
                `text-align: left`,
                `word-break: break-all`,
                `padding: 8px ${needsScrollbar ? '12px' : '8px'} 8px ${needsScrollbar ? '10px' : '8px'}` // 有滚动条时右侧增加内边距
            );
        } else {
            styles.push(
                `text-align: ${contentLength > 60 ? 'left' : 'center'}`,
                `padding: 6px ${needsScrollbar ? '12px' : '8px'} 6px ${needsScrollbar ? '10px' : '8px'}` // 有滚动条时右侧增加内边距
            );
        }

        return styles.join('; ') + ';';
    }

    /**
     * Generates main container styles for Chinese mode
     */
    private getMainContainerStyles(): string {
        let styles = [
            `position: relative`,
            `width: 100%`,
            `height: 100%`,
            `background-color: ${this.backgroundColor}`,
            `border: 1px solid ${this.borderColor}`,
            `border-radius: ${this.getBorderRadius()}`,
            `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3)`,
            `display: flex`,
            `justify-content: center`,
            `box-sizing: border-box`,
            `transition: all 0.3s ease-out`,
            `overflow: hidden`, // 仅容器隐藏溢出，内部文本容器可滚动
            `cursor: default`, // 默认光标
            `transform: translateZ(0)`, // 硬件加速
            `backface-visibility: hidden`,
            `perspective: 1000px`,
            `will-change: transform`
        ];

        // 中英文模式使用相同的内边距和对齐方式
        styles.push(
            `align-items: center`,
            `padding: 2px 4px` // 最小内边距，为滚动条留出空间
        );

        return styles.join('; ') + ';';
    }

    /**
     * Generates the HTML structure for the bubble
     */
    private generateBubbleHTML(): string {
        const tailHtml = this.generateTailHTML();
        const currentContent = this.typewriterEnabled ? this.displayedContent : this.content;
        const contentLength = currentContent.length;
        const needsScrollbar = contentLength > UIBubble.BubbleSizeConfig.scrollThreshold;

        // 处理文本，确保不包含多余空格
        const trimmedContent = currentContent.trim();
        
        // 生成唯一ID用于滚动操作
        const textContainerId = `bubble-text-${this.id}`;
        const bubbleId = `bubble-${this.id}`;
        
        // 添加滚动事件处理脚本，只有需要滚动条时才添加
        const scrollScript = needsScrollbar ? `
            (function() {
                // 等待DOM加载完成
                setTimeout(function() {
                    var container = document.getElementById('${textContainerId}');
                    var bubble = document.getElementById('${bubbleId}');
                    
                    if (!container || !bubble) return;
                    
                    // 使容器可交互
                    container.style.pointerEvents = 'auto';
                    bubble.style.pointerEvents = 'auto';
                    
                    // 添加鼠标滚轮事件 - 捕获阶段注册，确保事件能被处理
                    container.addEventListener('wheel', function(e) {
                        e.preventDefault();
                        container.scrollTop += e.deltaY;
                    }, { passive: false, capture: true });
                    
                    // 添加触摸滑动支持
                    var touchStartY = 0;
                    container.addEventListener('touchstart', function(e) {
                        touchStartY = e.touches[0].clientY;
                    }, { passive: false });
                    
                    container.addEventListener('touchmove', function(e) {
                        e.preventDefault();
                        var touchY = e.touches[0].clientY;
                        var diff = touchStartY - touchY;
                        container.scrollTop += diff;
                        touchStartY = touchY;
                    }, { passive: false });
                    
                    // 如果内容超出可见区域，显示滚动提示并设置更明显的光标
                    if (container.scrollHeight > container.clientHeight) {
                        container.style.cursor = 'pointer';
                        
                        // 添加滚动提示
                        var hasScrollIndicator = false;
                        
                        container.addEventListener('mouseover', function() {
                            if (hasScrollIndicator || container.scrollHeight <= container.clientHeight) return;
                            
                            // 添加滚动提示元素
                            var indicator = document.createElement('div');
                            indicator.style.position = 'absolute';
                            indicator.style.right = '4px';
                            indicator.style.bottom = '4px';
                            indicator.style.width = '8px';
                            indicator.style.height = '8px';
                            indicator.style.borderRadius = '50%';
                            indicator.style.backgroundColor = '${this.borderColor}';
                            indicator.style.opacity = '0.7';
                            indicator.style.animation = 'pulse 1.5s infinite';
                            indicator.style.pointerEvents = 'none';
                            indicator.id = '${textContainerId}-indicator';
                            
                            // 添加脉冲动画
                            var style = document.createElement('style');
                            style.textContent = '@keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 0.3; } 100% { opacity: 0.7; } }';
                            document.head.appendChild(style);
                            
                            bubble.appendChild(indicator);
                            hasScrollIndicator = true;
                            
                            // 3秒后隐藏提示
                            setTimeout(function() {
                                if (indicator && indicator.parentNode) {
                                    indicator.parentNode.removeChild(indicator);
                                }
                            }, 3000);
                        });
                    }
                    
                    // 确保滚动条可点击
                    var isScrolling = false;
                    var startY = 0;
                    var startScrollTop = 0;
                    
                    container.addEventListener('mousedown', function(e) {
                        // 检查点击是否在滚动条区域
                        if (e.offsetX > container.clientWidth - 12) {
                            isScrolling = true;
                            startY = e.clientY;
                            startScrollTop = container.scrollTop;
                            e.preventDefault();
                        }
                    });
                    
                    document.addEventListener('mousemove', function(e) {
                        if (isScrolling) {
                            var deltaY = e.clientY - startY;
                            var scrollRatio = deltaY / container.clientHeight;
                            container.scrollTop = startScrollTop + scrollRatio * container.scrollHeight;
                            e.preventDefault();
                        }
                    });
                    
                    document.addEventListener('mouseup', function() {
                        isScrolling = false;
                    });
                    
                }, 100);
            })();
        ` : '';

        // 自定义滚动条样式，只有需要滚动条时才添加
        const scrollbarStyles = needsScrollbar ? `
            /* 自定义滚动条样式 - Webkit浏览器 */
            .bubble-text-container::-webkit-scrollbar {
                width: 8px; /* 增加滚动条宽度，更容易点击 */
            }
            
            .bubble-text-container::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
            }
            
            .bubble-text-container::-webkit-scrollbar-thumb {
                background-color: ${this.borderColor};
                border-radius: 4px;
                border: 1px solid ${this.backgroundColor};
            }
            
            .bubble-text-container::-webkit-scrollbar-thumb:hover {
                background-color: #555555;
            }
            
            /* 确保滚动条始终可见 */
            .bubble-text-container:hover::-webkit-scrollbar-thumb {
                background-color: #666666;
            }
        ` : '';

        // 生成按键提示HTML
        const keyPromptHtml = this.keyPromptEnabled ? this.generateKeyPromptHTML() : '';

        return `
        <div id="${bubbleId}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 0;
            transform: scale(0.8) translateY(10px) translateZ(0);
            font-family: Arial, sans-serif;
            pointer-events: ${needsScrollbar ? 'auto' : 'none'}; /* 只有需要滚动时才启用指针事件 */
            box-sizing: border-box;
            overflow: hidden;
            transform-origin: center center;
            cursor: default;
            will-change: transform, opacity;
            backface-visibility: hidden;
            perspective: 1000px;
        ">
            <!-- Main bubble container -->
            <div style="${this.getMainContainerStyles()}">
                <!-- Text content with scrollbar -->
                <div id="${textContainerId}" class="bubble-text-container" style="${this.getTextContainerStyles()}">
                    ${this.escapeHtml(trimmedContent)}
                </div>
            </div>
            
            <!-- Bubble tail -->
            ${tailHtml}

            <!-- Key prompt icon -->
            ${keyPromptHtml}
        </div>
        
        <style>
            @keyframes bubbleEnter {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(10px) translateZ(0); 
                }
                50% {
                    opacity: 0.7;
                    transform: scale(0.9) translateY(5px) translateZ(0);
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0) translateZ(0); 
                }
            }
            
            @keyframes bubbleExit {
                0% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0) translateZ(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(-10px) translateZ(0); 
                }
            }
            
            ${scrollbarStyles}
        </style>
        
        <script>
            ${scrollScript}
            
            // 使用requestAnimationFrame实现淡入动画
            (function() {
                const bubble = document.getElementById('${bubbleId}');
                if (!bubble) return;
                
                let startTime = null;
                const duration = ${UIBubble.FADE_IN_DURATION};
                
                function animateEnter(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // 使用缓动函数创建更平滑的动画
                    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                    
                    // 计算当前的透明度和缩放值
                    const opacity = easeOutProgress;
                    const scale = 0.8 + (0.2 * easeOutProgress);
                    const translateY = 10 * (1 - easeOutProgress);
                    
                    // 应用变换
                    bubble.style.opacity = opacity;
                    bubble.style.transform = \`scale(\${scale}) translateY(\${translateY}px) translateZ(0)\`;
                    
                    // 如果动画未完成，继续请求下一帧
                    if (progress < 1) {
                        requestAnimationFrame(animateEnter);
                    }
                }
                
                // 启动淡入动画
                requestAnimationFrame(animateEnter);
            })();
        </script>`;
    }

    /**
     * 为打字机效果生成不包含淡入动画的HTML
     */
    private generateBubbleHTMLForTypewriter(): string {
        const tailHtml = this.generateTailHTML();
        const currentContent = this.displayedContent; // 使用当前打字机显示的内容
        const contentLength = currentContent.length;
        const needsScrollbar = contentLength > UIBubble.BubbleSizeConfig.scrollThreshold;

        // 处理文本，确保不包含多余空格
        const trimmedContent = currentContent.trim();
        
        // 生成唯一ID用于滚动操作
        const textContainerId = `bubble-text-${this.id}`;
        const bubbleId = `bubble-${this.id}`;
        
        // 添加滚动事件处理脚本，只有需要滚动条时才添加
        const scrollScript = needsScrollbar ? `
            (function() {
                // 等待DOM加载完成
                setTimeout(function() {
                    var container = document.getElementById('${textContainerId}');
                    var bubble = document.getElementById('${bubbleId}');
                    
                    if (!container || !bubble) return;
                    
                    // 使容器可交互
                    container.style.pointerEvents = 'auto';
                    bubble.style.pointerEvents = 'auto';
                    
                    // 添加鼠标滚轮事件 - 捕获阶段注册，确保事件能被处理
                    container.addEventListener('wheel', function(e) {
                        e.preventDefault();
                        container.scrollTop += e.deltaY;
                    }, { passive: false, capture: true });
                    
                    // 添加触摸滑动支持
                    var touchStartY = 0;
                    container.addEventListener('touchstart', function(e) {
                        touchStartY = e.touches[0].clientY;
                    }, { passive: false });
                    
                    container.addEventListener('touchmove', function(e) {
                        e.preventDefault();
                        var touchY = e.touches[0].clientY;
                        var diff = touchStartY - touchY;
                        container.scrollTop += diff;
                        touchStartY = touchY;
                    }, { passive: false });
                    
                    // 如果内容超出可见区域，显示滚动提示并设置更明显的光标
                    if (container.scrollHeight > container.clientHeight) {
                        container.style.cursor = 'pointer';
                    }
                }, 100);
            })();
        ` : '';

        // 自定义滚动条样式，只有需要滚动条时才添加
        const scrollbarStyles = needsScrollbar ? `
            /* 自定义滚动条样式 - Webkit浏览器 */
            .bubble-text-container::-webkit-scrollbar {
                width: 8px; /* 增加滚动条宽度，更容易点击 */
            }
            
            .bubble-text-container::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
            }
            
            .bubble-text-container::-webkit-scrollbar-thumb {
                background-color: ${this.borderColor};
                border-radius: 4px;
                border: 1px solid ${this.backgroundColor};
            }
            
            .bubble-text-container::-webkit-scrollbar-thumb:hover {
                background-color: #555555;
            }
            
            /* 确保滚动条始终可见 */
            .bubble-text-container:hover::-webkit-scrollbar-thumb {
                background-color: #666666;
            }
        ` : '';

        // 生成按键提示HTML
        const keyPromptHtml = this.keyPromptEnabled ? this.generateKeyPromptHTML() : '';

        return `
        <div id="${bubbleId}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 1;
            transform: scale(1) translateY(0) translateZ(0);
            font-family: Arial, sans-serif;
            pointer-events: ${needsScrollbar ? 'auto' : 'none'}; /* 只有需要滚动时才启用指针事件 */
            box-sizing: border-box;
            overflow: hidden;
            transform-origin: center center;
            cursor: default;
            will-change: transform;
            backface-visibility: hidden;
            perspective: 1000px;
        ">
            <!-- Main bubble container -->
            <div style="${this.getMainContainerStyles()}">
                <!-- Text content with scrollbar -->
                <div id="${textContainerId}" class="bubble-text-container" style="${this.getTextContainerStyles()}">
                    ${this.escapeHtml(trimmedContent)}
                </div>
            </div>
            
            <!-- Bubble tail -->
            ${tailHtml}

            <!-- Key prompt icon -->
            ${keyPromptHtml}
        </div>
        
        <style>
            ${scrollbarStyles}
            
            ${scrollbarStyles}
        </style>
        
        <script>
            ${scrollScript}
        </script>`;
    }

    /**
     * Generates the tail HTML based on bubble type
     */
    private generateTailHTML(): string {
        const tailSize = 8;

        switch (this.type) {
            case BubbleType.SPEECH:
                return `
                <div style="
                    position: absolute;
                    bottom: -${tailSize}px;
                    left: 20px;
                    width: 0;
                    height: 0;
                    border-left: ${tailSize}px solid transparent;
                    border-right: ${tailSize}px solid transparent;
                    border-top: ${tailSize}px solid ${this.backgroundColor};
                "></div>
                <div style="
                    position: absolute;
                    bottom: -${tailSize + 1}px;
                    left: 20px;
                    width: 0;
                    height: 0;
                    border-left: ${tailSize}px solid transparent;
                    border-right: ${tailSize}px solid transparent;
                    border-top: ${tailSize}px solid ${this.borderColor};
                    z-index: -1;
                "></div>`;

            case BubbleType.THOUGHT:
                return `
                <div style="
                    position: absolute;
                    bottom: -12px;
                    left: 25px;
                    width: 6px;
                    height: 6px;
                    background-color: ${this.backgroundColor};
                    border: 1px solid ${this.borderColor};
                    border-radius: 50%;
                "></div>
                <div style="
                    position: absolute;
                    bottom: -20px;
                    left: 30px;
                    width: 4px;
                    height: 4px;
                    background-color: ${this.backgroundColor};
                    border: 1px solid ${this.borderColor};
                    border-radius: 50%;
                "></div>`;

            default:
                // No tail for INFO, WARNING, SYSTEM types
                return '';
        }
    }

    /**
     * Reflow current bubble for new viewport size
     */
    private reflowForViewport(): void {
        if (!this.htmlElement || !this.htmlElement.setContent) return;
        
        // 简单地重新渲染HTML，文字超出部分会自动显示省略号
        this.renderHTML();
    }

    /**
     * Gets border radius based on bubble type
     */
    private getBorderRadius(): string {
        switch (this.type) {
            case BubbleType.THOUGHT:
                return "20px";
            case BubbleType.INFO:
                return "8px";
            case BubbleType.WARNING:
                return "4px";
            case BubbleType.SYSTEM:
                return "2px";
            default:
                return "12px";
        }
    }

    /**
     * Escapes HTML characters in text content
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Plays entrance animation
     */
    private playEntranceAnimation(): void {
        if (!this.htmlElement) return;

        this.isAnimatingIn = true;
        this.hasPlayedEntranceAnimation = true; // Mark that entrance animation has been played

        // Animation complete after CSS animation duration
        setTimeout(() => {
            this.isAnimatingIn = false;
            this.startAutoDestroy();
        }, UIBubble.FADE_IN_DURATION);
    }

    /**
     * Starts typewriter effect
     */
    private startTypewriterEffect(): void {
        if (!this.typewriterEnabled || this.typewriterCurrentIndex >= this.content.length) return;

        try {
            // Create C3 Timer for typewriter effect
            this.typewriterTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);

            this.typewriterTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.typewriterTimerTag) {
                    if (this.typewriterCurrentIndex < this.content.length) {
                        this.displayedContent = this.content.substring(0, this.typewriterCurrentIndex + 1);
                        this.typewriterCurrentIndex++;

                        // Update bubble size if needed
                        this.updateSizeForTypewriter();

                        // Update content
                        this.updateTypewriterContent();

                        // Continue to next character if not finished
                        if (this.typewriterCurrentIndex < this.content.length) {
                            const speedSeconds = this.typewriterSpeed / 1000;
                            this.typewriterTimer.behaviors.Timer.startTimer(speedSeconds, this.typewriterTimerTag, "once");
                        } else {
                            // Typewriter effect complete, cleanup
                            this.updateTypewriterContent();
                            this.typewriterTimer.destroy();
                            this.typewriterTimer = null;
                        }
                    }
                }
            });

            // Start the first character
            const speedSeconds = this.typewriterSpeed / 1000;
            this.typewriterTimer.behaviors.Timer.startTimer(speedSeconds, this.typewriterTimerTag, "once");

        } catch (error: any) {
            console.error(`Failed to create typewriter timer: ${error.message}`);
            // Fallback: show all content immediately
            this.displayedContent = this.content;
            this.typewriterCurrentIndex = this.content.length;
            this.updateSizeForTypewriter();
            this.updateTypewriterContent();
        }
    }

    /**
     * Updates bubble size for typewriter effect
     */
    private updateSizeForTypewriter(): void {
        if (!this.htmlElement) return;

        // 在固定尺寸模式下，不需要根据当前显示内容调整气泡尺寸
        // 只需更新内容即可，气泡大小在初始化时已经设置为足够容纳完整内容
        this.renderTypewriterHTML();
    }

    /**
     * Updates typewriter content
     */
    private updateTypewriterContent(): void {
        // Re-render the entire HTML instead of trying to manipulate DOM
        if (this.htmlElement && this.htmlElement.setContent) {
            this.renderTypewriterHTML();
            
            // 如果是最后一个字符，滚动到底部
            if (this.typewriterCurrentIndex >= this.content.length) {
                this.scrollToBottom();
            }
        }
    }
    
    /**
     * 滚动文本容器到底部
     */
    private scrollToBottom(): void {
        try {
            // 使用setTimeout确保在DOM更新后执行滚动
            setTimeout(() => {
                const textContainerId = `bubble-text-${this.id}`;
                const script = `
                    (function() {
                        var container = document.getElementById('${textContainerId}');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    })();
                `;
                
                // 执行脚本滚动到底部
                if (this.htmlElement && this.htmlElement.executeJavaScript) {
                    this.htmlElement.executeJavaScript(script);
                }
            }, 50); // 短暂延迟确保DOM已更新
        } catch (error: any) {
            console.warn(`Failed to scroll to bottom: ${error.message}`);
        }
    }

    /**
     * Plays exit animation and destroys the bubble
     */
    private playExitAnimation(): void {
        if (!this.htmlElement || this.isAnimatingOut) {
            this.destroy();
            return;
        }

        this.isAnimatingOut = true;

        // Stop typewriter effect if running
        if (this.typewriterTimer) {
            try {
                this.typewriterTimer.behaviors.Timer.stopTimer(this.typewriterTimerTag);
                this.typewriterTimer.destroy();
            } catch (error: any) {
                console.warn(`Error stopping typewriter timer: ${error.message}`);
            }
            this.typewriterTimer = null;
        }

        // Update HTML to use exit animation
        if (this.htmlElement && this.htmlElement.setContent) {
            const exitHtml = this.generateExitBubbleHTML();
            this.htmlElement.setContent(exitHtml, "html");
        }

        // Destroy after animation completes using C3Timer
        try {
            const exitTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);
            const exitTag = `exit_${this.id}_${Date.now()}`;

            exitTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === exitTag) {
                    this.destroy();
                    exitTimer.destroy();
                }
            });

            const exitSeconds = UIBubble.FADE_OUT_DURATION / 1000;
            exitTimer.behaviors.Timer.startTimer(exitSeconds, exitTag, "once");
            
            // 调试日志
            console.log(`Bubble ${this.id} exit animation started, will destroy in ${exitSeconds}s`);
        } catch (error: any) {
            console.error(`Failed to create exit timer: ${error.message}`);
            // Fallback to immediate destruction
            this.destroy();
        }
    }

    /**
     * Generates HTML for exit animation
     */
    private generateExitBubbleHTML(): string {
        const tailHtml = this.generateTailHTML();
        const currentContent = this.typewriterEnabled ? this.displayedContent : this.content;

        // 不再单独为按键提示创建淡出动画，而是让它随气泡一起淡出
        const keyPromptHtml = this.keyPromptEnabled ? this.generateKeyPromptHTML() : '';
        
        // 生成唯一ID用于脚本操作
        const bubbleId = `bubble-exit-${this.id}`;

        return `
        <div id="${bubbleId}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 1;
            transform: scale(1) translateY(0) translateZ(0);
            font-family: Arial, sans-serif;
            pointer-events: none;
            box-sizing: border-box;
            overflow: visible;
            transform-origin: center center;
            will-change: transform, opacity;
            backface-visibility: hidden;
            perspective: 1000px;
        ">
            <!-- Main bubble container -->
            <div style="${this.getMainContainerStyles()}">
                <!-- Text content -->
                <div id="bubble-text-${this.id}" style="${this.getTextContainerStyles()}">
                    ${this.escapeHtml(currentContent)}
                </div>
            </div>
            
            <!-- Bubble tail -->
            ${tailHtml}

            <!-- Key prompt icon -->
            ${keyPromptHtml}
        </div>
        
        <script>
            // 使用requestAnimationFrame实现淡出动画
            (function() {
                const bubble = document.getElementById('${bubbleId}');
                if (!bubble) return;
                
                let startTime = null;
                const duration = ${UIBubble.FADE_OUT_DURATION};
                
                function animateExit(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // 使用缓动函数创建更平滑的动画
                    const easeInProgress = Math.pow(progress, 3);
                    
                    // 计算当前的透明度和缩放值
                    const opacity = 1 - easeInProgress;
                    const scale = 1 - (0.2 * easeInProgress);
                    const translateY = -10 * easeInProgress;
                    
                    // 应用变换
                    bubble.style.opacity = opacity;
                    bubble.style.transform = \`scale(\${scale}) translateY(\${translateY}px) translateZ(0)\`;
                    
                    // 如果动画未完成，继续请求下一帧
                    if (progress < 1) {
                        requestAnimationFrame(animateExit);
                    }
                }
                
                // 启动淡出动画
                requestAnimationFrame(animateExit);
            })();
        </script>`;
    }

    /**
     * Starts auto-destroy timer
     */
    private startAutoDestroy(): void {
        if (this.duration <= 0) return;

        // Calculate total duration including typewriter effect
        let totalDuration = this.duration * 1000;
        if (this.typewriterEnabled) {
            totalDuration += this.content.length * this.typewriterSpeed;
        }

        try {
            // Create C3 Timer for auto-destroy
            this.destroyTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);

            this.destroyTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.destroyTimerTag) {
                    this.playExitAnimation();
                    // Timer will be cleaned up in destroy method
                }
            });

            const totalSeconds = totalDuration / 1000;
            this.destroyTimer.behaviors.Timer.startTimer(totalSeconds, this.destroyTimerTag, "once");

        } catch (error: any) {
            console.error(`Failed to create auto-destroy timer: ${error.message}`);
            // No fallback needed - bubble will persist until manually destroyed
        }
    }

    /**
     * Sets the position of the bubble
     * @param x X position
     * @param y Y position
     */
    public setPosition(x: number, y: number): UIBubble {
        this._x = x;
        this._y = y;

        if (this.htmlElement) {
            this.htmlElement.x = x;
            this.htmlElement.y = y;
        }

        return this;
    }

    /**
     * Sets the size of the bubble (overrides auto-sizing)
     * @param width Width in pixels
     * @param height Height in pixels
     */
    public setSize(width: number, height: number): UIBubble {
        this._width = width;
        this._height = height;

        if (this.htmlElement) {
            this.htmlElement.width = width;
            this.htmlElement.height = height;
            this.renderHTML(); // Re-render with new size
        }

        return this;
    }

    /**
     * Sets the colors of the bubble
     * @param backgroundColor Background color
     * @param borderColor Border color
     * @param textColor Text color
     */
    public setColors(backgroundColor: string, borderColor: string, textColor: string): UIBubble {
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.textColor = textColor;

        if (this.htmlElement) {
            this.renderHTML(); // Re-render with new colors
        }

        return this;
    }

    /**
     * Updates the content of the bubble
     * @param newContent New text content
     */
    public setContent(newContent: string): UIBubble {
        this.content = newContent;

        // Reset typewriter if enabled
        if (this.typewriterEnabled) {
            this.typewriterCurrentIndex = 0;
            this.displayedContent = "";
        }

        // Recalculate auto-size
        this.calculateAutoSize();
        if (this.htmlElement) {
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            this.renderHTML(); // Re-render with new content
        }

        return this;
    }

    /**
     * Extends the duration of the bubble
     * @param additionalTime Additional time in seconds
     */
    public extendDuration(additionalTime: number): UIBubble {
        if (this.destroyTimer) {
            try {
                // Stop current timer
                this.destroyTimer.behaviors.Timer.stopTimer(this.destroyTimerTag);
                this.destroyTimer.destroy();
                this.destroyTimer = null;

                // Update duration and restart timer
                this.duration += additionalTime;
                this.startAutoDestroy();
            } catch (error: any) {
                console.error(`Failed to extend duration: ${error.message}`);
            }
        }

        return this;
    }

    /**
     * Enables Chinese mode for better Chinese character display
     * @param heightMultiplier Optional height multiplier (default: 1.5)
     * @param lineHeight Optional line height (default: 1.8)
     */
    public setChineseMode(heightMultiplier: number = 1.5, lineHeight: number = 1.8): UIBubble {
        this.chineseModeEnabled = true;
        this.chineseModeHeightMultiplier = heightMultiplier;
        this.chineseModeLineHeight = lineHeight;

        // Recalculate size with Chinese mode
        this.calculateAutoSize();
        
        if (this.htmlElement) {
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            this.renderHTML(); // Re-render with Chinese mode styling
        }

        return this;
    }

    /**
     * 触发气泡的淡出效果
     * @param fadeOutDuration 淡出时间(毫秒)，默认使用类设置的淡出时间
     */
    public fadeOut(fadeOutDurationMs: number = UIBubble.FADE_OUT_DURATION): UIBubble {
        // 如果已经在淡出动画中，不重复触发
        if (this.isAnimatingOut) return this;
        
        // 停止自动销毁计时器（如果有的话）
        if (this.destroyTimer) {
            try {
                this.destroyTimer.behaviors.Timer.stopTimer(this.destroyTimerTag);
                this.destroyTimer.destroy();
                this.destroyTimer = null;
            } catch (error: any) {
                console.warn(`Error stopping destroy timer: ${error.message}`);
            }
        }
        
        // 自定义淡出时间（如果提供）
        if (fadeOutDurationMs && fadeOutDurationMs !== UIBubble.FADE_OUT_DURATION) {
            UIBubble.FADE_OUT_DURATION = fadeOutDurationMs;
        }
        
        // 触发淡出动画
        this.playExitAnimation();
        
        // 调试日志
        console.log(`Bubble ${this.id} fadeOut called with duration ${UIBubble.FADE_OUT_DURATION}ms`);
        
        return this;
    }

    /**
     * Destroys the bubble immediately
     */
    public destroy(): void {
        // Clear C3 timers
        if (this.destroyTimer) {
            try {
                this.destroyTimer.behaviors.Timer.stopTimer(this.destroyTimerTag);
                this.destroyTimer.destroy();
            } catch (error: any) {
                console.warn(`Error destroying auto-destroy timer: ${error.message}`);
            }
            this.destroyTimer = null;
        }

        if (this.typewriterTimer) {
            try {
                this.typewriterTimer.behaviors.Timer.stopTimer(this.typewriterTimerTag);
                this.typewriterTimer.destroy();
            } catch (error: any) {
                console.warn(`Error destroying typewriter timer: ${error.message}`);
            }
            this.typewriterTimer = null;
        }

        // Destroy HTML element
        if (this.htmlElement) {
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying bubble HTML element: ${error.message}`);
            }
            this.htmlElement = null;
        }

        // Remove from instances map
        UIBubble.instances.delete(this.id);

        console.log(`Bubble ${this.id} destroyed`);
    }

    /**
     * Gets a bubble instance by ID
     * @param id Bubble ID
     */
    public static GetBubble(id: string): UIBubble | undefined {
        return UIBubble.instances.get(id);
    }

    /**
     * Destroys all active bubbles
     */
    public static DestroyAllBubbles(): void {
        const bubbles = Array.from(UIBubble.instances.values());
        bubbles.forEach(bubble => bubble.destroy());
        console.log(`Destroyed ${bubbles.length} bubbles`);
    }

    /**
     * Gets information about all active bubbles
     */
    public static GetBubbleInfo(): { count: number, bubbles: string[] } {
        const bubbleIds = Array.from(UIBubble.instances.keys());
        return {
            count: bubbleIds.length,
            bubbles: bubbleIds
        };
    }

    /**
     * Sets the fade animation durations for all bubbles
     * @param fadeInDuration Fade-in duration in milliseconds
     * @param fadeOutDuration Fade-out duration in milliseconds
     */
    public static SetAnimationDurations(fadeInDuration: number, fadeOutDuration: number): void {
        if (fadeInDuration > 0) {
            UIBubble.FADE_IN_DURATION = fadeInDuration;
        }
        if (fadeOutDuration > 0) {
            UIBubble.FADE_OUT_DURATION = fadeOutDuration;
        }
        console.log(`Set animation durations: fade-in=${UIBubble.FADE_IN_DURATION}ms, fade-out=${UIBubble.FADE_OUT_DURATION}ms`);
    }

    /**
     * 设置气泡大小配置
     * @param config 配置对象
     */
    public static SetBubbleSizeConfig(config: {
        scrollThreshold?: number,
        minWidth?: number,
        minHeight?: number,
        shortTextWidthChinese?: number,
        mediumTextWidthChinese?: number,
        longTextWidthChinese?: number,
        shortTextWidthEnglish?: number,
        mediumTextWidthEnglish?: number,
        longTextWidthEnglish?: number,
        shortTextThreshold?: number,
        mediumTextThreshold?: number,
        visibleLines?: number,
        shortTextLines?: number
    }): void {
        // 更新配置，只更新提供的值
        UIBubble.BubbleSizeConfig = {
            ...UIBubble.BubbleSizeConfig,
            ...config
        };
        
        console.log("Bubble size configuration updated:", UIBubble.BubbleSizeConfig);
    }

    /**
     * 启用按键提示图标
     * @param key 按键名称，如'Space'或'Enter'
     * @param color 图标颜色
     * @param size 图标大小
     * @returns UIBubble实例（链式调用）
     */
    public enableKeyPrompt(key: string = "Space", color: string = "#ffffff", size: number = 24): UIBubble {
        this.keyPromptEnabled = true;
        this.keyPromptKey = key;
        this.keyPromptColor = color;
        this.keyPromptSize = size;
        
        // 如果气泡已经创建，更新HTML
        if (this.htmlElement) {
            if (this.typewriterEnabled) {
                this.renderTypewriterHTML();
            } else {
                this.renderHTML();
            }
        }
        
        return this;
    }

    /**
     * 禁用按键提示图标
     * @returns UIBubble实例（链式调用）
     */
    public disableKeyPrompt(): UIBubble {
        this.keyPromptEnabled = false;
        
        // 如果气泡已经创建，更新HTML
        if (this.htmlElement) {
            if (this.typewriterEnabled) {
                this.renderTypewriterHTML();
            } else {
                this.renderHTML();
            }
        }
        
        return this;
    }

    /**
     * 设置按键提示的动画速度
     * @param speed 动画速度，单位为秒
     * @returns UIBubble实例（链式调用）
     */
    public setKeyPromptAnimationSpeed(speed: number): UIBubble {
        this.keyPromptPulseSpeed = speed;
        
        // 如果气泡已经创建，更新HTML
        if (this.htmlElement) {
            if (this.typewriterEnabled) {
                this.renderTypewriterHTML();
            } else {
                this.renderHTML();
            }
        }
        
        return this;
    }

    /**
     * Generates the HTML for the key prompt icon
     */
    private generateKeyPromptHTML(): string {
        // 根据按键类型选择合适的图标
        let keyIcon = '';
        
        switch (this.keyPromptKey.toLowerCase()) {
            case 'space':
                keyIcon = '⎵'; // 空格符号
                break;
            case 'enter':
                keyIcon = '↵'; // 回车符号
                break;
            default:
                keyIcon = this.keyPromptKey; // 使用按键本身
        }
        
        // 生成唯一ID用于脚本操作
        const keyPromptId = `key-prompt-${this.id}`;
        
        // 使用静态元素，通过JavaScript实现动画效果
        return `
        <div id="${keyPromptId}" class="key-prompt-icon" style="
            position: absolute;
            bottom: 5px;
            right: 5px;
            width: ${this.keyPromptSize}px;
            height: ${this.keyPromptSize}px;
            background-color: rgba(0, 0, 0, 0.6);
            border: 1px solid ${this.keyPromptColor};
            border-radius: 4px;
            color: ${this.keyPromptColor};
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: ${this.keyPromptSize * 0.6}px;
            font-weight: bold;
            z-index: 10;
            opacity: ${this.keyPromptOpacity};
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
        ">${keyIcon}</div>
        <script>
            (function() {
                // 使用requestAnimationFrame实现更高效的动画
                const keyPrompt = document.getElementById('${keyPromptId}');
                if (!keyPrompt) return;
                
                let startTime = null;
                const duration = ${this.keyPromptPulseSpeed * 1000}; // 转换为毫秒
                const minOpacity = ${this.keyPromptOpacity * 0.5};
                const maxOpacity = ${this.keyPromptOpacity};
                
                function animateOpacity(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    
                    // 计算当前动画进度
                    const progress = (elapsed % duration) / duration;
                    
                    // 使用正弦函数创建平滑的淡入淡出效果
                    const opacity = minOpacity + (maxOpacity - minOpacity) * Math.abs(Math.sin(progress * Math.PI));
                    
                    // 应用透明度
                    if (keyPrompt) {
                        keyPrompt.style.opacity = opacity;
                    }
                    
                    // 继续动画循环
                    requestAnimationFrame(animateOpacity);
                }
                
                // 启动动画
                requestAnimationFrame(animateOpacity);
            })();
        </script>`;
    }
}