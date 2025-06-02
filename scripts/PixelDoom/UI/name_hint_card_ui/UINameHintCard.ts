import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";

var isBindButtonIntoDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (isBindButtonIntoDebugPanel) return;
    isBindButtonIntoDebugPanel = true;
    
    // Test category for hint card system
    var hint_card_system = IMGUIDebugButton.AddCategory("hint_card_system");

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show simple hint card", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Mysterious Item")
            .SetPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show long name card", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Ancient Sword of the Forgotten Realm")
            .SetPosition(PlayerInstance.x + 50, PlayerInstance.y - 150)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show custom size card", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Custom Size Item")
            .SetPosition(PlayerInstance.x - 100, PlayerInstance.y - 80)
            .SetSize(200, 40)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test HTML element return", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Test the new CreateHintCard that returns HTML element
        const htmlElement = UINameHintCard.CreateHintCard("HTML Element Test");
        if (htmlElement) {
            htmlElement.x = PlayerInstance.x + 100;
            htmlElement.y = PlayerInstance.y - 200;
            console.log("HTML element created and positioned:", htmlElement);
        }
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test scale functionality", () => {
        var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Test different scales
        UINameHintCard.CreateHintCardInstance("Small Scale (0.5x)")
            .SetPosition(PlayerInstance.x - 150, PlayerInstance.y - 100)
            .SetScale(0.5);

        UINameHintCard.CreateHintCardInstance("Normal Scale (1.0x)")
            .SetPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .SetScale(1.0);

        UINameHintCard.CreateHintCardInstance("Large Scale (1.5x)")
            .SetPosition(PlayerInstance.x + 150, PlayerInstance.y - 100)
            .SetScale(1.5);

        UINameHintCard.CreateHintCardInstance("Extra Large (2.0x)")
            .SetPosition(PlayerInstance.x, PlayerInstance.y - 200)
            .SetScale(2.0);
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Destroy all hint cards", () => {
        UINameHintCard.DestroyAllCards();
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show card info", () => {
        const info = UINameHintCard.GetCardInfo();
        console.log(`Active hint cards: ${info.count}`);
    });
});

export class UINameHintCard {
    private static instances: Map<string, UINameHintCard> = new Map();
    private static idCounter: number = 0;

    private id: string;
    private htmlElement: any; // HTML element instance
    private content: string;
    private layer: string;

    // Position and size properties
    private _x: number = 0;
    private _y: number = 0;
    private _width: number = 0; // 0 means auto-size
    private _height: number = 0; // 0 means auto-size
    private _scale: number = 1.0; // Scale factor

    // Style properties
    private backgroundColor: string = "#000000";
    private borderColor: string = "#333333";
    private textColor: string = "rgb(255, 243, 175)";
    private borderRadius: string = "4px";
    private padding: string = "8px 12px";
    private fontSize: string = "14px";

    // Animation properties
    private static FADE_IN_DURATION: number = 200; // milliseconds
    private static FADE_OUT_DURATION: number = 300; // milliseconds

    private constructor(content: string, layer: string = "html_c3") {
        this.id = `hint_card_${++UINameHintCard.idCounter}_${Date.now()}`;
        this.content = content;
        this.layer = layer;

        // Calculate auto-size based on content
        this.calculateAutoSize();

        console.log(`Created hint card with ID: ${this.id}, content: "${this.content}"`);
    }

    /**
     * Creates a new hint card and returns the HTML element
     * @param content Text content to display
     * @param id Optional unique identifier (auto-generated if not provided)
     */
    public static CreateHintCard(content: string, id?: string): any {
        // Generate ID if not provided
        if (!id) {
            id = `auto_hint_${Date.now()}`;
        }

        // If instance with this ID already exists, destroy it first
        if (UINameHintCard.instances.has(id)) {
            UINameHintCard.instances.get(id)?.destroy();
        }

        // Create new instance
        const instance = new UINameHintCard(content);
        instance.id = id; // Override the auto-generated ID
        UINameHintCard.instances.set(id, instance);

        // Ensure HTML element is created by calling SetPosition with default values
        if (!instance.htmlElement) {
            instance.SetPosition(0, 0);
        }

        // Return the HTML element instead of the instance
        return instance.getHtmlElement();
    }

    /**
     * Creates a new hint card and returns the UINameHintCard instance
     * @param content Text content to display
     * @param id Optional unique identifier (auto-generated if not provided)
     */
    public static CreateHintCardInstance(content: string, id?: string): UINameHintCard {
        // Generate ID if not provided
        if (!id) {
            id = `auto_hint_${Date.now()}`;
        }

        // If instance with this ID already exists, destroy it first
        if (UINameHintCard.instances.has(id)) {
            UINameHintCard.instances.get(id)?.destroy();
        }

        // Create new instance
        const instance = new UINameHintCard(content);
        instance.id = id; // Override the auto-generated ID
        UINameHintCard.instances.set(id, instance);

        return instance;
    }

    /**
     * Sets the position of the hint card
     * @param x X position
     * @param y Y position
     */
    public SetPosition(x: number, y: number): UINameHintCard {
        this._x = x;
        this._y = y;

        // Create HTML element if not exists
        if (!this.htmlElement) {
            this.createHtmlElement();
        } else {
            this.htmlElement.x = x;
            this.htmlElement.y = y;
        }

        return this;
    }

    /**
     * Sets the layer of the hint card
     * @param layer Layer name
     */
    public SetLayer(layer: string): UINameHintCard {
        this.layer = layer;

        // If HTML element already exists, we need to recreate it on the new layer
        if (this.htmlElement) {
            this.htmlElement.destroy();
            this.createHtmlElement();
        }

        return this;
    }

    /**
     * Sets the scale of the hint card
     * @param scale Scale factor (1.0 = normal size, 0.5 = half size, 2.0 = double size)
     */
    public SetScale(scale: number): UINameHintCard {
        this._scale = Math.max(0.1, scale); // Minimum scale of 0.1 to prevent invisible cards

        if (this.htmlElement) {
            // Apply scale using CSS transform
            this.renderHTML(); // Re-render with new scale
        }

        return this;
    }

    /**
     * Gets the current scale of the hint card
     */
    public GetScale(): number {
        return this._scale;
    }

    /**
     * Sets the size of the hint card (overrides auto-sizing)
     * @param width Width in pixels
     * @param height Height in pixels
     */
    public SetSize(width: number, height: number): UINameHintCard {
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
     * Calculates auto-size based on content length
     */
    private calculateAutoSize(): void {
        const contentLength = this.content.length;

        // Base size calculation - similar to BG3 style
        let baseWidth = Math.max(120, contentLength * 8 + 24); // 8px per character + padding
        let baseHeight = 32; // Fixed height for single line

        // Adjust for very long names
        if (contentLength > 20) {
            baseWidth = Math.min(300, baseWidth); // Max width limit
            baseHeight = 40; // Slightly taller for long names
        }

        this._width = Math.round(baseWidth);
        this._height = Math.round(baseHeight);
    }

    /**
     * Creates the HTML element for the hint card
     */
    private createHtmlElement(): void {
        try {
            // Use player position as default if no position set
            if (this._x === 0 && this._y === 0) {
                const PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
                if (PlayerInstance) {
                    this._x = PlayerInstance.x;
                    this._y = PlayerInstance.y - 60; // Above player by default
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
            console.error(`Failed to create hint card HTML element: ${error.message}`);
            // Create console-only card as fallback
            this.htmlElement = null;
            console.log(`Hint Card ${this.id}: "${this.content}" (console-only mode)`);
        }
    }

    /**
     * Renders the HTML content for the hint card
     */
    private renderHTML(): void {
        if (!this.htmlElement || !this.htmlElement.setContent) return;

        const cardHtml = this.generateCardHTML();
        this.htmlElement.setContent(cardHtml, "html");
    }

    /**
     * Generates the HTML structure for the hint card
     */
    private generateCardHTML(): string {
        const entranceScale = this._scale * 0.9; // Slightly smaller for entrance animation
        
        return `
        <div id="hint-card-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 0;
            transform: scale(${entranceScale}) translateY(5px);
            font-family: 'Segoe UI', Arial, sans-serif;
            pointer-events: none;
            animation: cardEnter ${UINameHintCard.FADE_IN_DURATION}ms ease-out forwards;
        ">
            <!-- Main card container -->
            <div style="
                position: relative;
                width: 100%;
                height: 100%;
                background-color: ${this.backgroundColor};
                border: 1px solid ${this.borderColor};
                border-radius: ${this.borderRadius};
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: ${this.padding};
                box-sizing: border-box;
                backdrop-filter: blur(2px);
            ">
                <!-- Text content -->
                <div style="
                    color: ${this.textColor};
                    font-size: ${this.fontSize};
                    font-weight: 500;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                    letter-spacing: 0.5px;
                ">
                    ${this.escapeHtml(this.content)}
                </div>
            </div>
        </div>
        
        <style>
            @keyframes cardEnter {
                0% { 
                    opacity: 0; 
                    transform: scale(${entranceScale}) translateY(5px); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(${this._scale}) translateY(0); 
                }
            }
            
            @keyframes cardExit {
                0% { 
                    opacity: 1; 
                    transform: scale(${this._scale}) translateY(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(${entranceScale}) translateY(-5px); 
                }
            }
        </style>`;
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

        // Animation complete after CSS animation duration
        setTimeout(() => {
            // Animation completed
        }, UINameHintCard.FADE_IN_DURATION);
    }

    /**
     * Plays exit animation and destroys the card
     */
    private playExitAnimation(): void {
        if (!this.htmlElement) {
            this.destroy();
            return;
        }

        // Update HTML to use exit animation
        if (this.htmlElement && this.htmlElement.setContent) {
            const exitHtml = this.generateExitCardHTML();
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

            const exitSeconds = UINameHintCard.FADE_OUT_DURATION / 1000;
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
    private generateExitCardHTML(): string {
        const exitScale = this._scale * 0.9; // Slightly smaller for exit animation
        
        return `
        <div id="hint-card-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 1;
            transform: scale(${this._scale}) translateY(0);
            font-family: 'Segoe UI', Arial, sans-serif;
            pointer-events: none;
            animation: cardExit ${UINameHintCard.FADE_OUT_DURATION}ms ease-in forwards;
        ">
            <!-- Main card container -->
            <div style="
                position: relative;
                width: 100%;
                height: 100%;
                background-color: ${this.backgroundColor};
                border: 1px solid ${this.borderColor};
                border-radius: ${this.borderRadius};
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: ${this.padding};
                box-sizing: border-box;
                backdrop-filter: blur(2px);
            ">
                <!-- Text content -->
                <div style="
                    color: ${this.textColor};
                    font-size: ${this.fontSize};
                    font-weight: 500;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                    letter-spacing: 0.5px;
                ">
                    ${this.escapeHtml(this.content)}
                </div>
            </div>
        </div>
        
        <style>
            @keyframes cardExit {
                0% { 
                    opacity: 1; 
                    transform: scale(${this._scale}) translateY(0); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(${exitScale}) translateY(-5px); 
                }
            }
        </style>`;
    }

    /**
     * Updates the content of the hint card
     * @param newContent New text content
     */
    public SetContent(newContent: string): UINameHintCard {
        this.content = newContent;

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
     * Sets custom colors for the hint card
     * @param backgroundColor Background color
     * @param borderColor Border color
     * @param textColor Text color
     */
    public SetColors(backgroundColor: string, borderColor: string, textColor: string): UINameHintCard {
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.textColor = textColor;

        if (this.htmlElement) {
            this.renderHTML(); // Re-render with new colors
        }

        return this;
    }

    /**
     * Destroys the hint card with animation
     */
    public Hide(): void {
        this.playExitAnimation();
    }

    /**
     * Destroys the hint card immediately
     */
    public destroy(): void {
        // Destroy HTML element
        if (this.htmlElement) {
            try {
                this.htmlElement.destroy();
            } catch (error: any) {
                console.warn(`Error destroying hint card HTML element: ${error.message}`);
            }
            this.htmlElement = null;
        }

        // Remove from instances map
        UINameHintCard.instances.delete(this.id);

        console.log(`Hint card ${this.id} destroyed`);
    }

    /**
     * Gets a hint card instance by ID
     * @param id Card ID
     */
    public static GetCard(id: string): UINameHintCard | undefined {
        return UINameHintCard.instances.get(id);
    }

    /**
     * Destroys all active hint cards
     */
    public static DestroyAllCards(): void {
        const cards = Array.from(UINameHintCard.instances.values());
        cards.forEach(card => card.destroy());
        console.log(`Destroyed ${cards.length} hint cards`);
    }

    /**
     * Gets information about all active hint cards
     */
    public static GetCardInfo(): { count: number, cards: string[] } {
        const cardIds = Array.from(UINameHintCard.instances.keys());
        return {
            count: cardIds.length,
            cards: cardIds
        };
    }

    /**
     * Sets the fade animation durations for all hint cards
     * @param fadeInDuration Fade-in duration in milliseconds
     * @param fadeOutDuration Fade-out duration in milliseconds
     */
    public static SetAnimationDurations(fadeInDuration: number, fadeOutDuration: number): void {
        if (fadeInDuration > 0) {
            UINameHintCard.FADE_IN_DURATION = fadeInDuration;
        }
        if (fadeOutDuration > 0) {
            UINameHintCard.FADE_OUT_DURATION = fadeOutDuration;
        }
        console.log(`Set hint card animation durations: fade-in=${UINameHintCard.FADE_IN_DURATION}ms, fade-out=${UINameHintCard.FADE_OUT_DURATION}ms`);
    }

    /**
     * Gets the HTML element of this hint card
     */
    public getHtmlElement(): any {
        return this.htmlElement;
    }
}
