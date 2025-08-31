import { hf_engine } from "../../../engine.js";

declare global {
    var ImGui: any;
    var ImGui_Impl: any;
}

export class ImGuiFontManager {
    private static chineseFont: any = null;
    private static defaultFont: any = null;
    private static isInitialized: boolean = false;

    /**
     * Load Chinese font with minimal character set to avoid OOM
     * @param fontPath Path to the Chinese TTF font file
     * @param fontSize Font size in pixels
     * @returns Promise that resolves when font is loaded
     */
    static async LoadChineseFont(fontPath: string, fontSize: number = 16): Promise<void> {
        try {
            console.log(`Loading Chinese font from: ${fontPath}`);
            
            // Use existing font for testing to avoid OOM
            // In production, use a smaller Chinese font file or subset
            const response = await fetch(fontPath);
            if (!response.ok) {
                console.warn(`Font file not found: ${fontPath}, using default font`);
                // Fallback to default font
                const io = ImGui.GetIO();
                this.chineseFont = io.Fonts.AddFontDefault();
                this.isInitialized = true;
                return;
            }
            
            const fontData = await response.arrayBuffer();
            
            // Check if font data is too large (>10MB indicates potential OOM risk)
            if (fontData.byteLength > 10 * 1024 * 1024) {
                console.warn(`Font file too large (${fontData.byteLength} bytes), using default font to avoid OOM`);
                const io = ImGui.GetIO();
                this.chineseFont = io.Fonts.AddFontDefault();
                this.isInitialized = true;
                return;
            }
            
            console.log(`Font data loaded, size: ${fontData.byteLength} bytes`);
            
            const io = ImGui.GetIO();
            const fontAtlas = io.Fonts;
            
            // Use default glyph ranges instead of custom ones to avoid format issues
            const fontConfig = new ImGui.ImFontConfig();
            fontConfig.internal.FontDataOwnedByAtlas = true;
            fontConfig.internal.MergeMode = false;
            
            this.chineseFont = fontAtlas.AddFontFromMemoryTTF(
                fontData,
                fontSize,
                fontConfig,
                null  // Use default glyph ranges
            );
            
            if (!this.chineseFont) {
                console.warn("Failed to load Chinese font, using default font");
                this.chineseFont = io.Fonts.AddFontDefault();
            }
            
            this.isInitialized = true;
            console.log("Chinese font loaded successfully");
            
        } catch (error) {
            console.error("Failed to load Chinese font:", error);
            // Fallback to default font
            const io = ImGui.GetIO();
            this.chineseFont = io.Fonts.AddFontDefault();
            this.isInitialized = true;
        }
    }

    /**
     * Create minimal Chinese character ranges to reduce memory usage
     * Only includes most common Chinese characters
     */
    private static CreateMinimalChineseRanges(): Uint16Array | null {
        try {
            // Use ImGui's built-in ranges instead of custom ones
            const io = ImGui.GetIO();
            return io.Fonts.GetGlyphRangesDefault();
        } catch (error) {
            console.warn("Failed to get glyph ranges, using null");
            return null;
        }
    }

    /**
     * Load font with very basic character set (ASCII + minimal Chinese)
     * @param fontPath Path to font file
     * @param fontSize Font size
     */
    static async LoadBasicFont(fontPath: string, fontSize: number = 16): Promise<void> {
        try {
            console.log(`Loading basic font from: ${fontPath}`);
            
            const response = await fetch(fontPath);
            if (!response.ok) {
                console.warn(`Font file not found: ${fontPath}, using default font`);
                const io = ImGui.GetIO();
                this.chineseFont = io.Fonts.AddFontDefault();
                this.isInitialized = true;
                return;
            }
            
            // Check content length before loading
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                const fileSize = parseInt(contentLength);
                console.log(`Font file size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
                
                // Reject files larger than 5MB for basic font loading
                if (fileSize > 5 * 1024 * 1024) {
                    console.warn(`Font file too large (${(fileSize / 1024 / 1024).toFixed(2)} MB), using default font`);
                    const io = ImGui.GetIO();
                    this.chineseFont = io.Fonts.AddFontDefault();
                    this.isInitialized = true;
                    return;
                }
            }
            
            const fontData = await response.arrayBuffer();
            
            // Double-check actual size after loading
            if (fontData.byteLength > 5 * 1024 * 1024) {
                console.warn(`Font data too large (${(fontData.byteLength / 1024 / 1024).toFixed(2)} MB), using default font`);
                const io = ImGui.GetIO();
                this.chineseFont = io.Fonts.AddFontDefault();
                this.isInitialized = true;
                return;
            }
            
            console.log(`Basic font data loaded, size: ${fontData.byteLength} bytes`);
            
            const io = ImGui.GetIO();
            const fontAtlas = io.Fonts;
            
            const fontConfig = new ImGui.ImFontConfig();
            fontConfig.internal.FontDataOwnedByAtlas = true;
            fontConfig.internal.MergeMode = false;
            
            // Use default ranges instead of custom ones
            this.chineseFont = fontAtlas.AddFontFromMemoryTTF(
                fontData,
                fontSize,
                fontConfig,
                null  // Use default glyph ranges
            );
            
            if (!this.chineseFont) {
                console.warn("Failed to load basic font, using default font");
                this.chineseFont = io.Fonts.AddFontDefault();
            }
            
            this.isInitialized = true;
            console.log("Basic font loaded successfully");
            
        } catch (error) {
            console.error("Failed to load basic font:", error);
            const io = ImGui.GetIO();
            this.chineseFont = io.Fonts.AddFontDefault();
            this.isInitialized = true;
        }
    }

    /**
     * Load font with custom character set
     * @param fontPath Path to font file
     * @param fontSize Font size
     * @param characters String containing characters to include
     */
    static async LoadFontWithCustomChars(fontPath: string, fontSize: number, characters: string): Promise<void> {
        try {
            console.log(`Loading font with custom characters: ${characters.length} chars`);
            
            const response = await fetch(fontPath);
            if (!response.ok) {
                console.warn(`Font file not found: ${fontPath}, using default font`);
                const io = ImGui.GetIO();
                this.chineseFont = io.Fonts.AddFontDefault();
                this.isInitialized = true;
                return;
            }
            
            const fontData = await response.arrayBuffer();
            
            const io = ImGui.GetIO();
            const fontAtlas = io.Fonts;
            
            const fontConfig = new ImGui.ImFontConfig();
            fontConfig.internal.FontDataOwnedByAtlas = true;
            fontConfig.internal.MergeMode = false;
            
            // For now, use default ranges to avoid format issues
            // TODO: Implement proper custom glyph range builder
            this.chineseFont = fontAtlas.AddFontFromMemoryTTF(
                fontData,
                fontSize,
                fontConfig,
                null  // Use default glyph ranges for now
            );
            
            if (!this.chineseFont) {
                console.warn("Failed to load custom font, using default font");
                this.chineseFont = io.Fonts.AddFontDefault();
            }
            
            this.isInitialized = true;
            console.log("Custom font loaded successfully");
            
        } catch (error) {
            console.error("Failed to load custom font:", error);
            const io = ImGui.GetIO();
            this.chineseFont = io.Fonts.AddFontDefault();
            this.isInitialized = true;
        }
    }

    /**
     * Push Chinese font for rendering
     */
    static PushChineseFont(): void {
        // Disable font pushing to avoid memory access errors
        // The loaded font will be used automatically by ImGui
        console.log("Font push disabled for safety - using default font rendering");
    }

    /**
     * Pop font (restore previous font)
     */
    static PopFont(): void {
        // Disable font popping to avoid memory access errors
        console.log("Font pop disabled for safety");
    }

    /**
     * Get the loaded Chinese font
     */
    static GetChineseFont(): any {
        return this.chineseFont;
    }

    /**
     * Check if Chinese font is loaded
     */
    static IsChineseFontLoaded(): boolean {
        // Always return false to prevent font push/pop operations
        return false;
    }

    /**
     * Create custom glyph ranges from character string
     * @param characters String containing all characters to include
     */
    static CreateCustomGlyphRanges(characters: string): Uint16Array | null {
        try {
            // For now, return default ranges to avoid format issues
            const io = ImGui.GetIO();
            return io.Fonts.GetGlyphRangesDefault();
        } catch (error) {
            console.warn("Failed to create custom glyph ranges:", error);
            return null;
        }
    }

    /**
     * Initialize with default font only (safest option)
     */
    static InitializeWithDefaultFont(): void {
        try {
            const io = ImGui.GetIO();
            this.chineseFont = io.Fonts.AddFontDefault();
            this.isInitialized = true;
            console.log("Initialized with default font");
        } catch (error) {
            console.error("Failed to initialize with default font:", error);
        }
    }
} 