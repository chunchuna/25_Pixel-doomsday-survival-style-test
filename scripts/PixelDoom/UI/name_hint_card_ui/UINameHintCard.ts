import { hf_engine } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";

var isBindButtonIntoDebugPanel = false;

hf_engine.gl$_ubu_init(() => {
    if (isBindButtonIntoDebugPanel) return;
    isBindButtonIntoDebugPanel = true;
    
    // Test category for hint card system
    var hint_card_system = IMGUIDebugButton.AddCategory("hint_card_system");

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show simple hint card", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Mysterious Item")
            .SetPosition(PlayerInstance.x, PlayerInstance.y - 100)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show long name card", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Ancient Sword of the Forgotten Realm")
            .SetPosition(PlayerInstance.x + 50, PlayerInstance.y - 150)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Show custom size card", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Custom Size Item")
            .SetPosition(PlayerInstance.x - 100, PlayerInstance.y - 80)
            .SetSize(200, 40)
            .SetLayer("html_c3");
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test HTML element return", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
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
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
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

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test flash effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Flashing Item")
            .SetPosition(PlayerInstance.x - 100, PlayerInstance.y - 150)
            .SetFlash(true);
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test conspicuous effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Conspicuous Item")
            .SetPosition(PlayerInstance.x + 100, PlayerInstance.y - 150)
            .SetConspicuous(true);
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test GOOD quality effect", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        UINameHintCard.CreateHintCardInstance("Legendary Artifact")
            .SetPosition(PlayerInstance.x, PlayerInstance.y - 250)
            .SetGOOD(true)
            .SetScale(1.2);
    });

    IMGUIDebugButton.AddButtonToCategory(hint_card_system, "Test combined effects", () => {
        var PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
        if (!PlayerInstance) return;

        // Flash + Good quality
        UINameHintCard.CreateHintCardInstance("Epic Flash Item")
            .SetPosition(PlayerInstance.x - 150, PlayerInstance.y - 300)
            .SetFlash(true)
            .SetGOOD(true)
            .SetScale(1.1);

        // Conspicuous + Good quality
        UINameHintCard.CreateHintCardInstance("Ultimate Item")
            .SetPosition(PlayerInstance.x + 150, PlayerInstance.y - 300)
            .SetConspicuous(true)
            .SetGOOD(true)
            .SetScale(1.3);
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

    // Special effects properties
    private isFlashing: boolean = false;
    private isConspicuous: boolean = false;
    private isGoodQuality: boolean = false;
    private effectTimer: any | null = null; // C3 Timer for effects
    private effectTimerTag: string = "";

    private constructor(content: string, layer: string = "html_c3") {
        this.id = `hint_card_${++UINameHintCard.idCounter}_${Date.now()}`;
        this.content = content;
        this.layer = layer;

        // Initialize effect timer tag
        this.effectTimerTag = `effect_${this.id}_${Date.now()}`;

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
                const PlayerInstance = hf_engine.runtime.objects.RedHairGirlSprite.getFirstInstance();
                if (PlayerInstance) {
                    this._x = PlayerInstance.x;
                    this._y = PlayerInstance.y - 60; // Above player by default
                }
            }

            // Create HTML element using HTML_c3 object
            this.htmlElement = hf_engine.runtime.objects.HTML_c3.createInstance(
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
        
        // Build animation classes based on active effects
        let animationClasses = `cardEnter ${UINameHintCard.FADE_IN_DURATION}ms ease-out forwards`;
        
        if (this.isFlashing) {
            animationClasses += `, cardFlash 1s ease-in-out infinite`;
        }
        
        if (this.isGoodQuality) {
            animationClasses += `, cardGlow 2s ease-in-out infinite, cardFloat 3s ease-in-out infinite`;
        }

        // Additional styles for good quality effect
        let additionalStyles = "";
        if (this.isGoodQuality) {
            additionalStyles = `
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4);
                border: 2px solid #ffd700;
            `;
        }

        return `
        <div id="hint-card-${this.id}" style="
            position: relative;
            width: 100%;
            height: 100%;
            opacity: 0;
            transform: scale(${entranceScale}) translateY(5px);
            font-family: 'Segoe UI', Arial, sans-serif;
            pointer-events: none;
            animation: ${animationClasses};
        ">
            <!-- Particle effects for good quality -->
            ${this.isGoodQuality ? this.generateParticleEffects() : ''}
            
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
                ${additionalStyles}
            ">
                <!-- Text content -->
                <div style="
                    color: ${this.textColor};
                    font-size: ${this.fontSize};
                    font-weight: ${this.isGoodQuality ? '600' : '500'};
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                    text-shadow: ${this.isGoodQuality ? '0 0 8px rgba(255, 215, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.8)' : '0 1px 2px rgba(0, 0, 0, 0.8)'};
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
            
            @keyframes cardFlash {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            @keyframes cardGlow {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4);
                }
                50% { 
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4);
                }
            }
            
            @keyframes cardFloat {
                0%, 100% { transform: scale(${this._scale}) translateY(0px); }
                50% { transform: scale(${this._scale}) translateY(-3px); }
            }
            
            @keyframes particleFloat {
                0% { 
                    transform: translateY(0px) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { 
                    transform: translateY(-30px) rotate(360deg);
                    opacity: 0;
                }
            }
        </style>`;
    }

    /**
     * Generates particle effects for good quality cards
     */
    private generateParticleEffects(): string {
        let particles = '';
        for (let i = 0; i < 6; i++) {
            const delay = i * 0.5;
            const left = 10 + (i * 15);
            particles += `
                <div style="
                    position: absolute;
                    left: ${left}%;
                    top: 50%;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, #ffd700, #ffed4e);
                    border-radius: 50%;
                    animation: particleFloat 3s ease-in-out infinite;
                    animation-delay: ${delay}s;
                    z-index: -1;
                "></div>
            `;
        }
        return particles;
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
            const exitTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);
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
        // Clear effect timer
        this.stopEffectTimer();

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

    /**
     * Enables flashing animation for the hint card
     * @param enabled Whether to enable flashing (default: true)
     */
    public SetFlash(enabled: boolean = true): UINameHintCard {
        this.isFlashing = enabled;
        
        if (this.htmlElement) {
            this.renderHTML(); // Re-render with flash effect
        }

        return this;
    }

    /**
     * Enables conspicuous effect with random color switching
     * @param enabled Whether to enable conspicuous effect (default: true)
     */
    public SetConspicuous(enabled: boolean = true): UINameHintCard {
        this.isConspicuous = enabled;
        
        if (enabled) {
            this.startConspicuousEffect();
        } else {
            this.stopEffectTimer();
        }

        if (this.htmlElement) {
            this.renderHTML(); // Re-render with conspicuous effect
        }

        return this;
    }

    /**
     * Enables high-quality effect with premium animations and particle effects
     * @param enabled Whether to enable good quality effect (default: true)
     */
    public SetGOOD(enabled: boolean = true): UINameHintCard {
        this.isGoodQuality = enabled;
        
        if (this.htmlElement) {
            this.renderHTML(); // Re-render with good quality effect
        }

        return this;
    }

    /**
     * Starts the conspicuous color switching effect
     */
    private startConspicuousEffect(): void {
        if (!this.isConspicuous) return;

        try {
            // Stop existing timer if any
            this.stopEffectTimer();

            // Create C3 Timer for conspicuous effect
            this.effectTimer = hf_engine.runtime.objects.C3Ctimer.createInstance("Other", -100, -100);

            this.effectTimer.behaviors.Timer.addEventListener("timer", (e: any) => {
                if (e.tag === this.effectTimerTag && this.isConspicuous) {
                    // Generate random colors
                    const colors = [
                        { bg: "#ff0000", border: "#ff6666", text: "#ffffff" }, // Red
                        { bg: "#00ff00", border: "#66ff66", text: "#000000" }, // Green
                        { bg: "#0000ff", border: "#6666ff", text: "#ffffff" }, // Blue
                        { bg: "#ffff00", border: "#ffff66", text: "#000000" }, // Yellow
                        { bg: "#ff00ff", border: "#ff66ff", text: "#ffffff" }, // Magenta
                        { bg: "#00ffff", border: "#66ffff", text: "#000000" }, // Cyan
                        { bg: "#ff8800", border: "#ffaa66", text: "#ffffff" }, // Orange
                        { bg: "#8800ff", border: "#aa66ff", text: "#ffffff" }  // Purple
                    ];

                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    this.backgroundColor = randomColor.bg;
                    this.borderColor = randomColor.border;
                    this.textColor = randomColor.text;

                    if (this.htmlElement) {
                        this.renderHTML();
                    }

                    // Continue the effect
                    this.effectTimer.behaviors.Timer.startTimer(0.3, this.effectTimerTag, "once"); // 300ms interval
                }
            });

            // Start the effect
            this.effectTimer.behaviors.Timer.startTimer(0.3, this.effectTimerTag, "once");

        } catch (error: any) {
            console.error(`Failed to create conspicuous effect timer: ${error.message}`);
        }
    }

    /**
     * Stops the effect timer
     */
    private stopEffectTimer(): void {
        if (this.effectTimer) {
            try {
                this.effectTimer.behaviors.Timer.stopTimer(this.effectTimerTag);
                this.effectTimer.destroy();
            } catch (error: any) {
                console.warn(`Error stopping effect timer: ${error.message}`);
            }
            this.effectTimer = null;
        }
    }
}
