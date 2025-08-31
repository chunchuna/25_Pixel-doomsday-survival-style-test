import { hf_engine } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";
import { IMGUIDebugButton } from "./UIDbugButton.js";

/**
 * Performance settings for variable monitoring
 */
interface PerformanceSettings {
    updateInterval: number;        // Update interval in milliseconds
    maxDisplayItems: number;       // Maximum number of items to display
    enableCaching: boolean;        // Enable value caching
    enableLazyFormatting: boolean; // Enable lazy formatting for complex objects
    maxStringLength: number;       // Maximum string length for display
}

/**
 * Cached value entry
 */
interface CachedValue {
    formattedValue: string;
    lastUpdate: number;
    isValid: boolean;
}

/**
 * Variable monitoring class - used to monitor variable values in real time
 */
export class VariableMonitoring {
    private static instance: VariableMonitoring;
    private static windowId: string = "variable_monitoring_window";
    private static isInitialized: boolean = false;
    private static monitoredValues: Map<string, { value: any, source: string }> = new Map();

    // Performance optimization properties
    private static lastUpdateTime: number = 0;
    private static cachedFormattedValues: Map<string, CachedValue> = new Map();
    private static performanceSettings: PerformanceSettings = {
        updateInterval: 100,        // Update every 100ms by default
        maxDisplayItems: 50,        // Display max 50 items
        enableCaching: true,        // Enable caching
        enableLazyFormatting: true, // Enable lazy formatting
        maxStringLength: 200        // Max 200 characters for strings
    };
    private static isPaused: boolean = false;
    private static frameSkipCounter: number = 0;
    private static frameSkipInterval: number = 3; // Update every 3 frames

    // Storage map for expanded status
    private static expandedItems: Map<string, boolean> = new Map();

    // Current variable name displayed in detail window
    private static currentDetailItem: string | null = null;
    private static detailWindowId: string = "variable_detail_window";

    /**
     * Set performance settings
     */
    public static SetPerformanceSettings(settings: Partial<PerformanceSettings>): void {
        this.performanceSettings = { ...this.performanceSettings, ...settings };
        // Clear cache when settings change
        this.cachedFormattedValues.clear();
    }

    /**
     * Get current performance settings
     */
    public static GetPerformanceSettings(): PerformanceSettings {
        return { ...this.performanceSettings };
    }

    /**
     * Pause/resume monitoring updates
     */
    public static SetPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    /**
     * Check if monitoring is paused
     */
    public static IsPaused(): boolean {
        return this.isPaused;
    }

    /**
     * Set frame skip interval for updates
     */
    public static SetFrameSkipInterval(interval: number): void {
        this.frameSkipInterval = Math.max(1, interval);
    }

    /**
     * Clear all caches
     */
    public static ClearCache(): void {
        this.cachedFormattedValues.clear();
    }

    /**
     * Get cache statistics
     */
    public static GetCacheStats(): { size: number, hitRate: number } {
        const size = this.cachedFormattedValues.size;
        // Simple hit rate calculation (this is a simplified version)
        return { size, hitRate: 0.8 }; // Placeholder hit rate
    }

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
     * Check if we should update this frame
     */
    private static shouldUpdateThisFrame(): boolean {
        if (this.isPaused) return false;

        // Frame skip check
        this.frameSkipCounter++;
        if (this.frameSkipCounter < this.frameSkipInterval) {
            return false;
        }
        this.frameSkipCounter = 0;

        // Time-based throttling
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.performanceSettings.updateInterval) {
            return false;
        }
        this.lastUpdateTime = currentTime;

        return true;
    }

    /**
     * Get cached or format value with performance optimizations
     */
    private static getCachedFormattedValue(name: string, value: any, isExpanded: boolean = false): string {
        if (!this.performanceSettings.enableCaching) {
            return this.formatValue(value, isExpanded);
        }

        const cacheKey = `${name}_${isExpanded}`;
        const cached = this.cachedFormattedValues.get(cacheKey);
        const currentTime = Date.now();

        // Check if cached value is still valid
        if (cached && cached.isValid && (currentTime - cached.lastUpdate) < this.performanceSettings.updateInterval) {
            return cached.formattedValue;
        }

        // Format new value
        try {
            const formattedValue = this.formatValue(value, isExpanded);
            this.cachedFormattedValues.set(cacheKey, {
                formattedValue,
                lastUpdate: currentTime,
                isValid: true
            });
            return formattedValue;
        } catch (e: any) {
            // Cache error state
            const errorValue = `[Error: ${e.message}]`;
            this.cachedFormattedValues.set(cacheKey, {
                formattedValue: errorValue,
                lastUpdate: currentTime,
                isValid: false
            });
            return errorValue;
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

        // Performance controls in detail window
        if (ImGui.CollapsingHeader("Performance Controls")) {
            const settings = this.performanceSettings;

            // Update interval slider
            const updateInterval = [settings.updateInterval];
            if (ImGui.SliderInt("Update Interval (ms)", updateInterval, 50, 1000)) {
                this.SetPerformanceSettings({ updateInterval: updateInterval[0] });
            }

            // Max display items
            const maxItems = [settings.maxDisplayItems];
            if (ImGui.SliderInt("Max Display Items", maxItems, 10, 200)) {
                this.SetPerformanceSettings({ maxDisplayItems: maxItems[0] });
            }

            // Cache controls
            let enableCaching = [settings.enableCaching];
            if (ImGui.Checkbox("Enable Caching", enableCaching)) {
                this.SetPerformanceSettings({ enableCaching: enableCaching[0] });
            }

            // Pause button
            let isPaused = [this.isPaused];
            if (ImGui.Checkbox("Pause Updates", isPaused)) {
                this.SetPaused(isPaused[0]);
            }

            // Clear cache button
            if (ImGui.Button("Clear Cache")) {
                this.ClearCache();
            }

            ImGui.Separator();
        }

        // To ensure safe handling, display content in batches to avoid memory overflow
        try {
            // For detail window, always show full content (bypass lazy formatting)
            const fullContent = this.formatValue(item.value, true);

            // First display content type
            ImGui.Text(`Type: ${typeof item.value}`);
            
            // Show additional object information
            if (typeof item.value === "object" && item.value !== null) {
                if (Array.isArray(item.value)) {
                    ImGui.Text(`Array Length: ${item.value.length}`);
                } else {
                    const keys = Object.keys(item.value);
                    ImGui.Text(`Object Keys: ${keys.length}`);
                    if (keys.length > 0) {
                        ImGui.Text(`Keys: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);
                    }
                }
            }
            
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
        // Only cleanup if we should update this frame
        if (!this.shouldUpdateThisFrame()) return;

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
            // Also remove from cache
            this.cachedFormattedValues.delete(`${key}_false`);
            this.cachedFormattedValues.delete(`${key}_true`);
        });
    }

    /**
     * Render monitoring window
     */
    private static renderMonitoringWindow(): void {
        const ImGui = globalThis.ImGui;

        // Performance status display
        ImGui.Text(`UIvariable (${this.isPaused ? 'PAUSED' : 'ACTIVE'})`);
        ImGui.SameLine();
        ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
            `Items: ${this.monitoredValues.size}/${this.performanceSettings.maxDisplayItems}`);

        // Performance controls
        if (ImGui.SmallButton(this.isPaused ? "Resume" : "Pause")) {
            this.SetPaused(!this.isPaused);
        }
        ImGui.SameLine();
        if (ImGui.SmallButton("Clear Cache")) {
            this.ClearCache();
        }

        ImGui.Separator();

        // Clean up destroyed objects before rendering (with throttling)
        this.cleanupDestroyedObjects();

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

            // Fill table data with performance limits
            let rowIndex = 0;
            const maxItems = this.performanceSettings.maxDisplayItems;

            for (const [name, item] of this.monitoredValues) {
                if (rowIndex >= maxItems) {
                    // Show truncation message
                    ImGui.TableNextRow();
                    ImGui.TableSetColumnIndex(0);
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0),
                        `... ${this.monitoredValues.size - maxItems} more items (increase max display limit)`);
                    break;
                }

                ImGui.TableNextRow();
                const textId = `value_${rowIndex}`;
                ImGui.PushID(textId);

                // Variable name column
                ImGui.TableSetColumnIndex(0);
                ImGui.Text(name);

                // Value column
                ImGui.TableSetColumnIndex(1);

                // Use cached formatting for better performance
                try {
                    const formattedValue = this.getCachedFormattedValue(name, item.value, false);
                    
                    // Check if it's long content OR complex object that should have a detail view
                    const isLongContent = formattedValue.length > 100;
                    const isComplexObject = typeof item.value === "object" && 
                                          item.value !== null && 
                                          item.value !== undefined;

                    // Always show a small view button for easy access to details
                    if (ImGui.SmallButton(`View##${rowIndex}`)) {
                        // Display detail window
                        this.showDetailWindow(name);
                    }

                    // Display value after button
                    ImGui.SameLine();
                    if (isLongContent || isComplexObject) {
                        // For complex content, show truncated version
                        ImGui.Text(formattedValue);
                    } else {
                        // Normal text display
                        ImGui.Text(formattedValue);
                    }
                } catch (e: any) {
                    ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "[Error]");
                }

                // Source column
                ImGui.TableSetColumnIndex(2);
                ImGui.Text(item.source);

                ImGui.PopID();
                rowIndex++;
            }

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

        // Apply string length limit for performance
        const maxLength = isExpanded ? this.performanceSettings.maxStringLength * 5 : this.performanceSettings.maxStringLength;

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

                // For performance, limit object depth and size
                let jsonStr: string;
                if (this.performanceSettings.enableLazyFormatting && !isExpanded) {
                    // Quick object summary for non-expanded view
                    if (Array.isArray(value)) {
                        jsonStr = `Array(${value.length})`;
                    } else {
                        const keys = Object.keys(value);
                        jsonStr = `Object{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
                    }
                } else {
                    // Full JSON stringify with depth limit
                    jsonStr = JSON.stringify(value, (key, val) => {
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
                    }, isExpanded ? 2 : 0); // Add indentation only when expanded
                }

                // Truncate if too long
                if (jsonStr.length > maxLength) {
                    return jsonStr.substring(0, maxLength - 3) + "...";
                }
                return jsonStr;
            } catch (e: any) {
                // If JSON.stringify fails, return a safe fallback
                return `[Object Error: ${e.message}]`;
            }
        }

        // Handle strings with length limit
        if (typeof value === "string") {
            if (value.length > maxLength) {
                return value.substring(0, maxLength - 3) + "...";
            }
            return value;
        }

        // Numbers, booleans convert directly to string
        try {
            const stringValue = String(value);
            if (stringValue.length > maxLength) {
                return stringValue.substring(0, maxLength - 3) + "...";
            }
            return stringValue;
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

        // Clear cache for this variable to ensure fresh data
        this.cachedFormattedValues.delete(`${name}_false`);
        this.cachedFormattedValues.delete(`${name}_true`);
    }

    /**
     * Remove monitored variable
     * @param name Variable name
     */
    public static RemoveValue(name: string): void {
        this.monitoredValues.delete(name);
        // Also remove from cache
        this.cachedFormattedValues.delete(`${name}_false`);
        this.cachedFormattedValues.delete(`${name}_true`);
    }

    /**
     * Clear all monitored variables
     */
    public static ClearAll(): void {
        this.monitoredValues.clear();
        this.cachedFormattedValues.clear();
    }

    /**
     * Clean up destroyed or invalid objects (public method)
     * Call this method during scene transitions to prevent crashes
     */
    public static CleanupDestroyed(): void {
        this.cleanupDestroyedObjects();
    }

    /**
     * Enable high performance mode (reduces update frequency and limits display)
     */
    public static EnableHighPerformanceMode(): void {
        this.SetPerformanceSettings({
            updateInterval: 500,        // Update every 500ms
            maxDisplayItems: 20,        // Show only 20 items
            enableCaching: true,        // Enable caching
            enableLazyFormatting: true, // Enable lazy formatting
            maxStringLength: 100        // Shorter strings
        });
        this.SetFrameSkipInterval(5);   // Skip more frames
    }

    /**
     * Enable balanced performance mode (default settings)
     */
    public static EnableBalancedMode(): void {
        this.SetPerformanceSettings({
            updateInterval: 100,        // Update every 100ms
            maxDisplayItems: 50,        // Show 50 items
            enableCaching: true,        // Enable caching
            enableLazyFormatting: true, // Enable lazy formatting
            maxStringLength: 200        // Medium strings
        });
        this.SetFrameSkipInterval(3);   // Default frame skip
    }

    /**
     * Enable real-time mode (maximum responsiveness, may impact performance)
     */
    public static EnableRealTimeMode(): void {
        this.SetPerformanceSettings({
            updateInterval: 16,         // Update every frame (~60fps)
            maxDisplayItems: 100,       // Show more items
            enableCaching: false,       // Disable caching for real-time
            enableLazyFormatting: false,// Disable lazy formatting
            maxStringLength: 500        // Longer strings
        });
        this.SetFrameSkipInterval(1);   // No frame skip
    }

    /**
     * Get performance statistics
     */
    public static GetPerformanceStats(): {
        monitoredCount: number,
        cacheSize: number,
        updateInterval: number,
        isPaused: boolean,
        frameSkipInterval: number
    } {
        return {
            monitoredCount: this.monitoredValues.size,
            cacheSize: this.cachedFormattedValues.size,
            updateInterval: this.performanceSettings.updateInterval,
            isPaused: this.isPaused,
            frameSkipInterval: this.frameSkipInterval
        };
    }

    /**
     * Performance test - adds test data to measure performance impact
     * Use this to test different performance settings
     */
    public static RunPerformanceTest(itemCount: number = 50): void {
        console.log("Starting Variable Monitoring Performance Test...");

        // Clear existing data
        this.ClearAll();

        // Add various types of test data
        for (let i = 0; i < itemCount; i++) {
            // Simple values
            this.AddValue(`test_number_${i}`, Math.random() * 1000, "PerformanceTest");
            this.AddValue(`test_string_${i}`, `Test string value ${i} with some additional text to make it longer`, "PerformanceTest");

            // Complex objects
            if (i % 5 === 0) {
                const complexObject = {
                    id: i,
                    name: `Object ${i}`,
                    data: Array.from({ length: 10 }, (_, j) => ({ index: j, value: Math.random() })),
                    nested: {
                        level1: {
                            level2: {
                                value: `Nested value ${i}`
                            }
                        }
                    }
                };
                this.AddValue(`test_object_${i}`, complexObject, "PerformanceTest");
            }

            // Arrays
            if (i % 7 === 0) {
                const testArray = Array.from({ length: 20 }, (_, j) => `Array item ${j}`);
                this.AddValue(`test_array_${i}`, testArray, "PerformanceTest");
            }
        }

        console.log(`Added ${itemCount} test variables. Monitor framerate and adjust settings as needed.`);
        console.log("Use monitoring.ClearTestData() to remove test data when done.");
    }

    /**
     * Clear test data added by RunPerformanceTest
     */
    public static ClearTestData(): void {
        const keysToRemove: string[] = [];
        this.monitoredValues.forEach((item, name) => {
            if (item.source === "PerformanceTest") {
                keysToRemove.push(name);
            }
        });

        keysToRemove.forEach(key => {
            this.RemoveValue(key);
        });

        console.log(`Removed ${keysToRemove.length} test variables.`);
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

hf_engine.gl$_ubu_init(() => {

    VariableMonitoring.EnableHighPerformanceMode();

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

// Example: How to use the variable monitoring class with performance controls
/*
// 1. Import monitoring class
import { monitoring } from "./UI/debug_ui/UIvariableMonitoring";

// 2. PERFORMANCE CONTROL - Choose appropriate mode based on your needs:

// For high performance (low impact on framerate):
monitoring.EnableHighPerformanceMode();

// For balanced performance (default):
monitoring.EnableBalancedMode();

// For real-time monitoring (may impact performance):
monitoring.EnableRealTimeMode();

// 3. Manual performance settings:
monitoring.SetPerformanceSettings({
    updateInterval: 200,        // Update every 200ms
    maxDisplayItems: 30,        // Show max 30 items
    enableCaching: true,        // Enable value caching
    enableLazyFormatting: true, // Use lazy formatting for objects
    maxStringLength: 150        // Limit string display length
});

// 4. Frame control:
monitoring.SetFrameSkipInterval(5); // Update every 5 frames
monitoring.SetPaused(true);         // Pause all updates
monitoring.SetPaused(false);        // Resume updates

// 5. Show monitoring window
monitoring.Show();

// 6. Add variables for monitoring
let playerHealth = 100;
monitoring.AddValue("Player Health", playerHealth, "PlayerController");

let enemyCount = 5;
monitoring.AddValue("Enemy Count", enemyCount, "EnemyManager");

// 7. Update monitoring when variable values change
playerHealth -= 10;
monitoring.AddValue("Player Health", playerHealth, "PlayerController");

// 8. Add more complex data structures
const playerStats = {
    strength: 15,
    agility: 12,
    intelligence: 10
};
monitoring.AddValue("Player Stats", playerStats, "PlayerStats");

// 9. Performance monitoring:
const stats = monitoring.GetPerformanceStats();
console.log(`Monitoring ${stats.monitoredCount} variables, cache size: ${stats.cacheSize}`);

// 10. Cache management:
monitoring.ClearCache();            // Clear all cached values
const cacheStats = monitoring.GetCacheStats();

// 11. Hide/show window
// monitoring.Hide();
// monitoring.Show();
// monitoring.Toggle();

// 12. Check if window is visible
// const isVisible = monitoring.IsVisible();

// 13. Remove specific variable
// monitoring.RemoveValue("Enemy Count");

// 14. Clear all monitored variables
// monitoring.ClearAll();

// 15. IMPORTANT: Clean up destroyed objects during scene transitions
// Call this in your scene transition code to prevent crashes:
// monitoring.CleanupDestroyed();

// 16. Example scene transition handling with performance considerations:
// function onSceneChange() {
//     monitoring.CleanupDestroyed();     // Clean up before scene change
//     monitoring.ClearCache();           // Clear cache to free memory
//     monitoring.EnableHighPerformanceMode(); // Use high performance mode during transitions
//     // ... your scene transition code ...
//     monitoring.EnableBalancedMode();   // Return to balanced mode after transition
// }

// 17. Performance troubleshooting:
// If experiencing low framerate:
// - Use monitoring.EnableHighPerformanceMode()
// - Increase monitoring.SetFrameSkipInterval(10)
// - Reduce monitoring.SetPerformanceSettings({ maxDisplayItems: 10 })
// - Use monitoring.SetPaused(true) when not actively debugging

// 18. Real-time debugging workflow:
// - Start with monitoring.EnableHighPerformanceMode()
// - Add only essential variables to monitor
// - Use monitoring.SetPaused(true) when not actively looking at values
// - Switch to monitoring.EnableRealTimeMode() only when needed for detailed debugging
// - Always call monitoring.CleanupDestroyed() during scene transitions
*/
