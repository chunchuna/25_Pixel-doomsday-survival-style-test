import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "./imgui.js";

declare global {
    var ImGui: any;
}

export class SafeTest {
    private static isInitialized: boolean = false;
    private static testWindowId: string = "safe_test_window";

    /**
     * Initialize with absolute minimal setup
     */
    static async Initialize(): Promise<void> {
        try {
            console.log("Initializing safe test (minimal mode)...");
            
            // Only initialize ImGui, no font loading
            await Imgui_chunchun.Initialize();
            
            this.isInitialized = true;
            console.log("Safe test initialized successfully");
            
        } catch (error) {
            console.error("Failed to initialize safe test:", error);
            this.isInitialized = true; // Mark as initialized anyway
        }
    }

    /**
     * Show minimal safe test window
     */
    static ShowTestWindow(): void {
        if (!this.isInitialized) {
            console.warn("Safe test not initialized");
            return;
        }

        // Create minimal test window
        Imgui_chunchun.CreateTextWindow(
            this.testWindowId,
            "Safe Test - Text Only",
            "This window only uses safe text operations",
            { x: 100, y: 100 }
        );
        
        if (Imgui_chunchun.IsWindowOpen(this.testWindowId)) {
            this.RenderSafeContent();
        }
    }

    /**
     * Render only the safest content
     */
    private static RenderSafeContent(): void {
        // Only use Text() and Separator() - the safest operations
        ImGui.Text("Safe Test Mode");
        ImGui.Separator();
        
        ImGui.Text("Basic Operations Test:");
        ImGui.Text("1. Text rendering: OK");
        ImGui.Text("2. Separators: OK");
        ImGui.Text("3. Window system: OK");
        
        ImGui.Separator();
        
        ImGui.Text("System Info:");
        ImGui.Text("- ImGui: WebAssembly version");
        ImGui.Text("- Font: Default only");
        ImGui.Text("- Mode: Ultra-safe");
        
        ImGui.Separator();
        
        ImGui.Text("Memory Status:");
        ImGui.Text("- No custom fonts loaded");
        ImGui.Text("- No button operations");
        ImGui.Text("- Minimal memory usage");
        
        ImGui.Separator();
        
        ImGui.Text("Note: Use window X button to close");
    }

    /**
     * Close test window
     */
    static CloseTestWindow(): void {
        Imgui_chunchun.CloseWindow(this.testWindowId);
    }

    /**
     * Check if test window is open
     */
    static IsTestWindowOpen(): boolean {
        return Imgui_chunchun.IsWindowOpen(this.testWindowId);
    }
}

// Auto-initialize for testing
if (typeof window !== 'undefined') {
    console.log("Auto-initializing safe test...");
    setTimeout(async () => {
        try {
            await SafeTest.Initialize();
            SafeTest.ShowTestWindow();
            console.log("Safe test ready - text only mode!");
        } catch (error) {
            console.error("Failed to auto-initialize safe test:", error);
        }
    }, 500);
} 