import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";
import { IMGUIDebugButton } from "./UIDbugButton.js";




/**
 * Variable monitoring class - used to monitor variable values in real time
 */
export class VariableMonitoring {
    private static instance: VariableMonitoring;
    private static windowId: string = "variable_monitoring_window";
    private static isInitialized: boolean = false;
    private static monitoredValues: Map<string, { value: any, source: string }> = new Map();

    // Storage map for expanded status
    private static expandedItems: Map<string, boolean> = new Map();

    // Current variable name displayed in detail window
    private static currentDetailItem: string | null = null;
    private static detailWindowId: string = "variable_detail_window";

    /**
     * Get variable monitoring instance
     */
    private static getInstance(): VariableMonitoring {
        if (!this.instance) {
            this.instance = new VariableMonitoring();
            this.initialize();
        }
        return this.instance;
    }

    /**
     * Initialize variable monitoring
     */
    private static initialize(): void {
        if (this.isInitialized) return;

        // Create custom monitoring window
        this.createMonitoringWindow();
        this.createDetailWindow();
        this.Hide()

        this.isInitialized = true;
    }

    /**
     * Create monitoring window
     */
    private static createMonitoringWindow(): void {
        const customWindowId = this.windowId;

        // Use CreateTextWindow method to create an initial window, then customize its callback
        Imgui_chunchun.CreateTextWindow(
            customWindowId,
            "variabl_eMonitoring_window",
            "",
            { x: 50, y: 50 }
        );

        // Force type conversion to access window configuration
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(customWindowId);
            if (windowConfig) {
                // Customize window configuration
                windowConfig.size = { width: 500, height: 400 };
                windowConfig.renderCallback = () => {
                    this.renderMonitoringWindow();
                };
            }
        }
    }

    /**
     * Create detail window
     */
    private static createDetailWindow(): void {
        const detailWindowId = this.detailWindowId;

        // Create detail window
        Imgui_chunchun.CreateTextWindow(
            detailWindowId,
            "Variable Detail",
            "",
            { x: 150, y: 150 }
        );

        // Configure detail window
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(detailWindowId);
            if (windowConfig) {
                windowConfig.size = { width: 600, height: 500 };
                windowConfig.isOpen = false; // Default closed
                windowConfig.renderCallback = () => {
                    this.renderDetailWindow();
                };
            }
        }
    }

    /**
     * Render detail window
     */
    private static renderDetailWindow(): void {
        const ImGui = globalThis.ImGui;

        if (!this.currentDetailItem) {
            ImGui.Text("No variable selected");
            return;
        }

        const item = this.monitoredValues.get(this.currentDetailItem);
        if (!item) {
            ImGui.Text("Variable not found");
            return;
        }

        // Test if the item is still valid before rendering
        try {
            this.formatValue(item.value, false);
        } catch (e: any) {
            ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0),
                "Variable has been destroyed or is no longer accessible");
            return;
        }

        // Display variable information
        ImGui.Text(`Name: ${this.currentDetailItem}`);
        ImGui.Text(`Source: ${item.source}`);
        ImGui.Separator();

        // To ensure safe handling, display content in batches to avoid memory overflow
        try {
            const fullContent = this.formatValue(item.value, true);

            // First display content type
            ImGui.Text(`Type: ${typeof item.value}`);
            ImGui.Separator();

            // Display content
            ImGui.BeginChild("ValueContent", new ImGui.ImVec2(0, 0), true);

            // Batch display content, up to 100 characters per line
            const maxCharsPerLine = 100;
            let remainingContent = fullContent;

            while (remainingContent.length > 0) {
                const lineContent = remainingContent.substring(0, maxCharsPerLine);
                ImGui.Text(lineContent);
                remainingContent = remainingContent.substring(maxCharsPerLine);
            }

            ImGui.EndChild();
        } catch (e: any) {
            ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0),
                "Render Error: " + e.message);
        }
    }

    /**
     * Clean up destroyed or invalid objects from monitoring
     */
    private static cleanupDestroyedObjects(): void {
        const keysToRemove: string[] = [];
        
        this.monitoredValues.forEach((item, name) => {
            try {
                // Test if the value is still valid by attempting to format it
                this.formatValue(item.value, false);
            } catch (e: any) {
                // If formatting fails, mark for removal
                keysToRemove.push(name);
            }
        });
        
        // Remove invalid entries
        keysToRemove.forEach(key => {
            this.monitoredValues.delete(key);
        });
    }

    /**
     * Render monitoring window
     */
    private static renderMonitoringWindow(): void {
        const ImGui = globalThis.ImGui;

        // Clean up destroyed objects before rendering
        this.cleanupDestroyedObjects();

        // Set title bar
        ImGui.Text("UIvariable");
        ImGui.Separator();

        // Table title
        const tableFlags =
            ImGui.TableFlags.Borders |
            ImGui.TableFlags.RowBg |
            ImGui.TableFlags.Resizable |
            ImGui.TableFlags.ScrollY;

        if (ImGui.BeginTable("VariablesTable", 3, tableFlags)) {
            // Set table header
            ImGui.TableSetupColumn("name");
            ImGui.TableSetupColumn("value");
            ImGui.TableSetupColumn("from");
            ImGui.TableHeadersRow();

            // Fill table data
            let rowIndex = 0;
            this.monitoredValues.forEach((item, name) => {
                ImGui.TableNextRow();
                const textId = `value_${rowIndex}`;
                ImGui.PushID(textId);

                // Check if it's long content
                const isLongContent =
                    (typeof item.value === "string" && item.value.length > 100) ||
                    (typeof item.value === "object" && JSON.stringify(item.value).length > 100);

                // Variable name column
                ImGui.TableSetColumnIndex(0);
                ImGui.Text(name);

                // Value column
                ImGui.TableSetColumnIndex(1);

                // For long content, display button and summary
                if (isLongContent) {
                    // Display view details button
                    if (ImGui.SmallButton("View")) {
                        // Display detail window
                        this.showDetailWindow(name);
                    }

                    // Display summary after button
                    ImGui.SameLine();
                    const summaryText = this.formatValue(item.value, false); // Summary
                    ImGui.Text(summaryText);
                } else {
                    // Normal text display
                    ImGui.Text(this.formatValue(item.value, false));
                }

                // Source column
                ImGui.TableSetColumnIndex(2);
                ImGui.Text(item.source);

                ImGui.PopID();
                rowIndex++;
            });

            ImGui.EndTable();
        }

        // Display prompt information
        if (this.monitoredValues.size === 0) {
            ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                "Use VariableMonitoring.AddValue() to add variables to monitor");
        }
    }

    /**
     * Display detail window
     */
    private static showDetailWindow(name: string): void {
        this.currentDetailItem = name;

        // Open detail window
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.detailWindowId);
            if (windowConfig) {
                windowConfig.isOpen = true;
            }
        }
    }

    /**
     * Format variable value for display
     */
    private static formatValue(value: any, isExpanded: boolean = false): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        if (typeof value === "object") {
            try {
                // Check if the object is a C3 instance that might be destroyed
                if (value && typeof value === "object" && value.constructor && value.constructor.name) {
                    // Check for common C3 object patterns that might be destroyed
                    const constructorName = value.constructor.name;
                    if (constructorName.includes("Instance") || 
                        constructorName.includes("Behavior") || 
                        constructorName.includes("Plugin")) {
                        // Try to access a basic property to test if object is still valid
                        try {
                            // Attempt to access a property that should exist on valid C3 objects
                            if (value.runtime === null || value.runtime === undefined) {
                                return "[Destroyed C3 Object]";
                            }
                        } catch (e: any) {
                            return "[Destroyed C3 Object]";
                        }
                    }
                }

                // Convert object or array to JSON string
                const jsonStr = JSON.stringify(value, (key, val) => {
                    // Custom replacer to handle problematic values
                    if (val === null || val === undefined) {
                        return val;
                    }
                    
                    // Handle circular references and problematic objects
                    if (typeof val === "object") {
                        try {
                            // Test if the object can be safely stringified
                            JSON.stringify(val);
                            return val;
                        } catch (e: any) {
                            return "[Unserializable Object]";
                        }
                    }
                    
                    return val;
                });
                
                // If not expanded and string length exceeds 100, truncate display
                if (!isExpanded && jsonStr.length > 100) {
                    return jsonStr.substring(0, 97) + "...";
                }
                return jsonStr;
            } catch (e: any) {
                // If JSON.stringify fails, return a safe fallback
                return `[Object Error: ${e.message}]`;
            }
        }

        // Handle strings
        if (typeof value === "string") {
            // If not expanded and string length exceeds 100, truncate display
            if (!isExpanded && value.length > 100) {
                return value.substring(0, 97) + "...";
            }
            return value;
        }

        // Numbers, booleans convert directly to string
        try {
            return String(value);
        } catch (e: any) {
            return "[Value Error]";
        }
    }

    /**
     * Add variable to monitor
     * @param name Variable name
     * @param value Variable value
     * @param source Variable source (usually script name)
     */
    public static AddValue(name: string, value: any, source: string = "Unknown"): void {
        // Ensure initialization
        this.getInstance();

        // Add or update variable
        this.monitoredValues.set(name, { value, source });
    }

    /**
     * Remove monitored variable
     * @param name Variable name
     */
    public static RemoveValue(name: string): void {
        this.monitoredValues.delete(name);
    }

    /**
     * Clear all monitored variables
     */
    public static ClearAll(): void {
        this.monitoredValues.clear();
    }

    /**
     * Clean up destroyed or invalid objects (public method)
     * Call this method during scene transitions to prevent crashes
     */
    public static CleanupDestroyed(): void {
        this.cleanupDestroyedObjects();
    }

    /**
     * Show monitoring window
     */
    public static Show(): void {
        // Ensure initialization
        this.getInstance();

        // Toggle window display state through public API
        if (!this.IsVisible()) {
            Imgui_chunchun.ToggleWindow(this.windowId);
        }

        // Backup method: direct access to window configuration
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                windowConfig.isOpen = true;
            }
        }
    }

    /**
     * Hide monitoring window
     */
    public static Hide(): void {
        // Toggle window display state through public API
        if (this.IsVisible()) {
            Imgui_chunchun.ToggleWindow(this.windowId);
        }

        // Backup method: direct access to window configuration
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                windowConfig.isOpen = false;
            }
        }
    }

    /**
     * Toggle monitoring window display state
     */
    public static Toggle(): void {
        // Ensure initialization
        this.getInstance();

        // Use public method to toggle window display state
        Imgui_chunchun.ToggleWindow(this.windowId);
    }

    /**
     * Get window display state
     */
    public static IsVisible(): boolean {
        return Imgui_chunchun.IsWindowOpen(this.windowId);
    }
}


var isBindButtonIntoDebugPanel = false;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (isBindButtonIntoDebugPanel) return
    isBindButtonIntoDebugPanel = true

    var debug_category = IMGUIDebugButton.AddCategory("debug")
    if (debug_category) {
        IMGUIDebugButton.AddButtonToCategory(debug_category, "varibale_monitoring", () => {
            VariableMonitoring.Toggle();
        })
    }

})


// Export a more concise alias for easier use
export const monitoring = VariableMonitoring;

// Example: How to use the variable monitoring class
/*
// 1. Import monitoring class
import { monitoring } from "./UI/debug_ui/UIvariableMonitoring";

// 2. Show monitoring window
monitoring.Show();

// 3. Add variables for monitoring
let playerHealth = 100;
monitoring.AddValue("Player Health", playerHealth, "PlayerController");

let enemyCount = 5;
monitoring.AddValue("Enemy Count", enemyCount, "EnemyManager");

// 4. Update monitoring when variable values change
playerHealth -= 10;
monitoring.AddValue("Player Health", playerHealth, "PlayerController");

// 5. Add more complex data structures
const playerStats = {
    strength: 15,
    agility: 12,
    intelligence: 10
};
monitoring.AddValue("Player Stats", playerStats, "PlayerStats");

// 6. Hide/show window
// monitoring.Hide();
// monitoring.Show();
// monitoring.Toggle();

// 7. Check if window is visible
// const isVisible = monitoring.IsVisible();

// 8. Remove specific variable
// monitoring.RemoveValue("Enemy Count");

// 9. Clear all monitored variables
// monitoring.ClearAll();

// 10. IMPORTANT: Clean up destroyed objects during scene transitions
// Call this in your scene transition code to prevent crashes:
// monitoring.CleanupDestroyed();

// 11. Example scene transition handling:
// function onSceneChange() {
//     monitoring.CleanupDestroyed(); // Clean up before scene change
//     // ... your scene transition code ...
// }
*/
