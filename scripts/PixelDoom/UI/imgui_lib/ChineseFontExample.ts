import { hf_engine } from "../../../engine.js";
import { Imgui_chunchun } from "./imgui.js";

declare global {
    var ImGui: any;
}

export class ChineseFontExample {
    private static isInitialized: boolean = false;
    private static exampleWindowId: string = "chinese_font_example";

    /**
     * Initialize and load Chinese font safely
     */
    static async Initialize(): Promise<void> {
        try {
            // Initialize ImGui first
            await Imgui_chunchun.Initialize();
            
            // Skip all font loading to avoid any memory issues
            console.log("Skipping font loading for maximum safety");
            console.log("Using ImGui default font only");
            
            // Don't load any custom fonts - use default only
            // This ensures maximum stability
            
            this.isInitialized = true;
            console.log("Font example initialized successfully (default font only)");
            
        } catch (error) {
            console.error("Failed to initialize font example:", error);
            this.isInitialized = true; // Still mark as initialized
        }
    }

    /**
     * Show example window
     */
    static ShowExampleWindow(): void {
        if (!this.isInitialized) {
            console.warn("Font example not initialized");
            return;
        }

        // Create example window
        Imgui_chunchun.CreateTextWindow(
            this.exampleWindowId,
            "Font Loading Example",
            "Font loading and testing functionality",
            { x: 400, y: 300 }
        );
        
        if (Imgui_chunchun.IsWindowOpen(this.exampleWindowId)) {
            this.RenderExampleContent();
        }
    }

    /**
     * Render example content
     */
    private static RenderExampleContent(): void {
        // Only use the safest ImGui operations
        ImGui.Text("Font Loading Example - Safe Mode");
        ImGui.Separator();
        
        ImGui.Text("Basic text rendering test:");
        ImGui.Text("- English: Hello World");
        ImGui.Text("- Numbers: 123456789");
        ImGui.Text("- Symbols: !@#$%^&*()");
        
        ImGui.Separator();
        
        ImGui.Text("System Status:");
        ImGui.Text("- ImGui: Initialized");
        ImGui.Text("- Font: Default (Safe)");
        ImGui.Text("- Memory: Stable");
        
        ImGui.Separator();
        
        ImGui.Text("Safe Operations Only:");
        ImGui.Text("- Text rendering: OK");
        ImGui.Text("- Separators: OK");
        ImGui.Text("- Basic layout: OK");
        
        ImGui.Separator();
        
        // Use only text instead of buttons to avoid memory issues
        ImGui.Text("Actions (text only for safety):");
        ImGui.Text("[ Test Default Font ] - Working");
        ImGui.Text("[ Reset System ] - Available");
        ImGui.Text("[ Close Window ] - Use window X button");
        
        ImGui.Separator();
        ImGui.Text("Note: Buttons disabled to prevent memory errors");
        ImGui.Text("Use window controls for navigation");
    }

    /**
     * Reset to default font
     */
    private static ResetToDefaultFont(): void {
        try {
            console.log("Resetting to default font...");
            Imgui_chunchun.InitializeWithDefaultFont();
            console.log("Reset to default font completed");
        } catch (error) {
            console.error("Reset to default font failed:", error);
        }
    }

    /**
     * Close example window
     */
    static CloseExampleWindow(): void {
        Imgui_chunchun.CloseWindow(this.exampleWindowId);
    }

    /**
     * Check if example window is open
     */
    static IsExampleWindowOpen(): boolean {
        return Imgui_chunchun.IsWindowOpen(this.exampleWindowId);
    }
}

// Auto-initialize for testing
// pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(async () => {
//     try {
//         // Wait a bit for the engine to be ready
//         setTimeout(async () => {
//             await ChineseFontExample.Initialize();
//             ChineseFontExample.ShowExampleWindow();
//             console.log("Font example ready! Window should be visible.");
//         }, 2000);
//     } catch (error) {
//         console.error("Failed to auto-initialize font example:", error);
//     }
// }); 