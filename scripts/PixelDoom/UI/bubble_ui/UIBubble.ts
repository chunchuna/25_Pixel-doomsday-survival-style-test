import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";



var isBindButtonIntoDebugPanel =false

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {


    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true
    // Test category for bubble system
    var bubble_system = IMGUIDebugButton.AddCategory("bubble_system");

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show simple bubble", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这里是一条中文测试信息。现在在测试信息的长度。这个信息足够的长。好的非常的长。现在正在测试气泡大小的自动适配。好的就是这样", 3, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset).setChineseMode()
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show typewriter bubble", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("这里是一条中文测试信息。现在在测试信息的长度。这个信息足够的长。好的非常的长。现在正在测试气泡大小的自动适配。好的就是这样", 5, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x + UIBubble.PostionXOffset, PlayerInstance.y + UIBubble.PositionYOffset)
            .enableTypewriter(50).setChineseMode(); // 50ms per character
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show thought bubble", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("I'm thinking about something...", 4, BubbleType.SYSTEM)
            .setPosition(PlayerInstance.x + 50, PlayerInstance.y - 80)
            .setSize(200, 80);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show long typewriter text", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        const longText = "This is a very long message that will appear with typewriter effect and the bubble will grow as the text appears!";

        UIBubble.ShowBubble(longText, 8, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x - 150, PlayerInstance.y - 200)
            .enableTypewriter(80); // 80ms per character
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show warning bubble", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("Warning: Danger ahead!", 2, BubbleType.WARNING)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 150)
            .setColors("#ff6b6b", "#2c2c2c", "#ffffff");
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Destroy all bubbles", () => {
        UIBubble.DestroyAllBubbles();
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test fixed typewriter", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("This should start small and grow as text appears!", 6, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 120)
            .enableTypewriter(80); // Slower for better visibility
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test visibility fix", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UIBubble.ShowBubble("Visibility test - can you see me?", 4, BubbleType.SPEECH)
            .setPosition(PlayerInstance.x, PlayerInstance.y - 50);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Show bubble info", () => {
        const info = UIBubble.GetBubbleInfo();
        console.log(`Active bubbles: ${info.count}`);
    });

    IMGUIDebugButton.AddButtonToCategory(bubble_system, "Test smooth typewriter", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
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
    private static responsiveBound: boolean = false;

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
    private static FADE_IN_DURATION: number = 300; // milliseconds
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

    //  Postion OffSet 

    public static PositionYOffset: number = -250;
    public static PostionXOffset: number = -20;


    private constructor(content: string, duration: number, type: BubbleType, layer: string = "html_c3") {
        this.id = `bubble_${++UIBubble.idCounter}_${Date.now()}`;
        this.content = content;
        this.duration = duration;
        this.type = type;
        this.layer = layer;

        // Ensure responsive handling is bound once
        UIBubble.ensureResponsiveBinding();

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
     * Binds a single window resize listener to reflow all bubbles
     */
    private static ensureResponsiveBinding(): void {
        if (UIBubble.responsiveBound) return;
        try {
            window.addEventListener("resize", () => {
                // Reflow all existing bubbles on viewport change
                UIBubble.instances.forEach((bubble) => bubble.reflowForViewport());
            });
            UIBubble.responsiveBound = true;
        } catch (_) {
            // Ignore if environment does not support window resize events
        }
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
            const delayTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
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

        // Viewport-aware constraints
        let viewportWidth = 1280;
        let viewportHeight = 720;
        try {
            viewportWidth = Math.max(320, Math.min(window.innerWidth || viewportWidth, 4096));
            viewportHeight = Math.max(240, Math.min(window.innerHeight || viewportHeight, 2160));
        } catch (_) { /* non-browser runtime */ }

        // Base size calculation (use viewport fractions with caps)
        let baseWidth = Math.min(Math.floor(viewportWidth * 0.45), 420);
        let baseHeight = 60;

        // Estimate characters per line based on width (CJK wider, so fewer per line)
        const charsPerLine = this.chineseModeEnabled ? Math.max(8, Math.floor(baseWidth / 12)) : Math.max(12, Math.floor(baseWidth / 8));
        const estimatedLines = Math.max(1, Math.ceil(contentLength / Math.max(1, charsPerLine)));

        // Height based on estimated lines and line-height
        const lineHeightPx = (this.chineseModeEnabled ? this.chineseModeLineHeight : 1.4) * 12; // font-size = 12px
        baseHeight = Math.min(Math.floor(viewportHeight * 0.35), Math.max(50, Math.ceil(estimatedLines * lineHeightPx + 18)));

        // Adjust based on bubble type
        switch (this.type) {
            case BubbleType.THOUGHT:
                baseWidth = Math.min(Math.floor(viewportWidth * 0.5), baseWidth + 20);
                baseHeight += 10;
                break;
            case BubbleType.INFO:
                baseWidth = Math.min(Math.floor(viewportWidth * 0.5), baseWidth + 30);
                break;
            case BubbleType.WARNING:
                baseWidth = Math.min(Math.floor(viewportWidth * 0.5), baseWidth + 10);
                baseHeight += 5;
                break;
        }

        // Apply Chinese mode adjustments
        if (this.chineseModeEnabled) {
            // Prefer wider layout on wide screens for CJK readability
            baseWidth = Math.min(Math.floor(viewportWidth * 0.65), Math.max(baseWidth, Math.floor(viewportWidth * 0.38)));

            // Recompute chars per line after width change
            const cpl = Math.max(8, Math.floor(baseWidth / 12));
            const lines = Math.max(1, Math.ceil(contentLength / cpl));
            const lh = this.chineseModeLineHeight * 12;
            baseHeight = Math.min(Math.floor(viewportHeight * 0.45), Math.max(90, Math.ceil(lines * lh + 20)));
        }

        this._width = Math.max(100, Math.round(baseWidth));
        this._height = Math.max(50, Math.round(baseHeight));
    }

    /**
     * Creates the HTML element for the bubble
     */
    private createHtmlElement(): void {
        try {
            // Use player position as default if no position set
            if (this._x === 0 && this._y === 0) {
                const PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
                if (PlayerInstance) {
                    this._x = PlayerInstance.x;
                    this._y = PlayerInstance.y - 100; // Above player by default
                }
            }

            // Create HTML element using HTML_c3 object
            this.htmlElement = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.HTML_c3.createInstance(
                this.layer,
                this._x,
                this._y
            );

            // Set element size
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
     * Generates text container styles for Chinese mode
     */
    private getTextContainerStyles(): string {
        let styles = [
            `color: ${this.textColor}`,
            `font-size: 12px`,
            `line-height: ${this.chineseModeEnabled ? this.chineseModeLineHeight : 1.4}`,
            `word-wrap: break-word`,
            `overflow-wrap: break-word`,
            `max-width: 100%`,
            `width: 100%`,
            `box-sizing: border-box`
        ];

        if (this.chineseModeEnabled) {
            styles.push(
                `text-align: left`,
                `word-break: break-all`,
                `overflow: hidden`,
                `padding-top: 2px`,
                `padding-bottom: 6px`,
                `padding-left: 0px`,
                `white-space: normal`,
                `display: block`
            );
        } else {
            styles.push(
                `text-align: center`,
                `overflow: hidden`
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
            `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)`,
            `display: flex`,
            `justify-content: center`,
            `box-sizing: border-box`,
            `transition: all 0.3s ease-out`,
            `overflow: hidden`
        ];

        if (this.chineseModeEnabled) {
            styles.push(
                `align-items: flex-start`,
                `padding: 8px 10px 8px 4px`
            );
        } else {
            styles.push(
                `align-items: center`,
                `padding: 8px 12px`
            );
        }

        return styles.join('; ') + ';';
    }

    /**
     * Generates the HTML structure for the bubble
     */
    private generateBubbleHTML(): string {
        const tailHtml = this.generateTailHTML();
        const currentContent = this.typewriterEnabled ? this.displayedContent : this.content;

        // Only apply entrance animation if it hasn't been played yet
        const animationStyle = !this.hasPlayedEntranceAnimation ?
            `animation: bubbleEnter ${UIBubble.FADE_IN_DURATION}ms ease-out;` : '';

        return `
        <div id="bubble-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 1;
            transform: scale(1) translateY(0);
            font-family: Arial, sans-serif;
            pointer-events: none;
            ${animationStyle}
        ">
            <!-- Main bubble container -->
            <div style="${this.getMainContainerStyles()}">
                <!-- Text content -->
                <div id="bubble-text-${this.id}" style="${this.getTextContainerStyles()}">
                    ${this.escapeHtml(currentContent)}${this.typewriterEnabled && this.typewriterCurrentIndex < this.content.length ? '<span style="animation: blink 1s infinite;">|</span>' : ''}
                </div>
            </div>
            
            <!-- Bubble tail -->
            ${tailHtml}
        </div>
        
        <style>
            @keyframes bubbleEnter {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(10px); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }
            
            @keyframes bubbleExit {
                0% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(-10px); 
                }
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        </style>`;
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
        // Recompute size using currently displayed content to avoid jumps in typewriter
        const backupDisplayed = this.displayedContent;
        const backupTypewriter = this.typewriterEnabled;

        // If typewriter enabled, size to final content to ensure no cutoff after resize
        if (backupTypewriter) {
            this.displayedContent = this.content;
        }
        this.calculateAutoSize();
        // Restore displayed content index
        this.displayedContent = backupDisplayed;

        if (this.htmlElement) {
            this.htmlElement.width = this._width;
            this.htmlElement.height = this._height;
            // Re-render to apply CSS responsive layout
            this.renderHTML();
        }
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
            this.typewriterTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);

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
                            // Typewriter effect complete, remove cursor and cleanup
                            this.updateTypewriterContent(false);
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
            this.updateTypewriterContent(false);
        }
    }

    /**
     * Updates bubble size for typewriter effect
     */
    private updateSizeForTypewriter(): void {
        if (!this.htmlElement) return;

        // Recalculate size based on current displayed content
        const oldWidth = this._width;
        const oldHeight = this._height;

        this.calculateAutoSize();

        // Always update size to allow smooth growth
        this.htmlElement.width = this._width;
        this.htmlElement.height = this._height;

        // Log size changes for debugging
        if (Math.abs(this._width - oldWidth) > 5 || Math.abs(this._height - oldHeight) > 3) {
            console.log(`Bubble ${this.id} resized: ${oldWidth}x${oldHeight} -> ${this._width}x${this._height} (chars: ${this.displayedContent.length})`);
        }
    }

    /**
     * Updates typewriter content
     */
    private updateTypewriterContent(showCursor: boolean = true): void {
        // Re-render the entire HTML instead of trying to manipulate DOM
        if (this.htmlElement && this.htmlElement.setContent) {
            this.renderHTML();
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
            const exitTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);
            const exitTag = `exit_${this.id}_${Date.now()}`;

            exitTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === exitTag) {
                    this.destroy();
                    exitTimer.destroy();
                }
            });

            const exitSeconds = UIBubble.FADE_OUT_DURATION / 1000;
            exitTimer.behaviors.Timer.startTimer(exitSeconds, exitTag, "once");
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

        return `
        <div id="bubble-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 1;
            transform: scale(1) translateY(0);
            font-family: Arial, sans-serif;
            pointer-events: none;
            animation: bubbleExit ${UIBubble.FADE_OUT_DURATION}ms ease-in forwards;
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
        </div>
        
        <style>
            @keyframes bubbleExit {
                0% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(-10px); 
                }
            }
        </style>`;
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
            this.destroyTimer = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.C3Ctimer.createInstance("Other", -100, -100);

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
}