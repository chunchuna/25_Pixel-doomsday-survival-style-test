import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
import { VariableMonitoring } from "./UIvariableMonitoring.js";

/**
 * IMGUI version of Debug Button Menu
 * Provides in-game debug button functionality
 * 
 * Usage examples:
 * 
 * // Basic usage - add normal button
 * IMGUIDebugButton.AddButton("Test Button", () => {
 *     console.log("Test button clicked");
 * });
 * 
 * // Add category button
 * const categoryId = IMGUIDebugButton.AddCategory("System");
 * IMGUIDebugButton.AddButtonToCategory(categoryId, "Reload", () => {
 *     console.log("Reload system");
 * });
 * 
 * // Add color button
 * IMGUIDebugButton.AddColorButton("Warning Button", [1.0, 0.3, 0.3, 1.0], () => {
 *     console.log("Warning operation");
 * });
 * 
 * // Show/hide button panel
 * IMGUIDebugButton.Show();
 * IMGUIDebugButton.Hide();
 * IMGUIDebugButton.Toggle();
 */
export class IMGUIDebugButton {
    // Window ID
    private static readonly WINDOW_ID: string = "imgui_debug_button_window";

    // Toggle key (default: B key)
    private static toggleKey: string = "M";

    // Is initialized
    private static isInitialized: boolean = false;

    // Button list
    private static buttons: Array<DebugButton> = [];

    // Category list
    private static categories: Map<string, Category> = new Map();

    // Is window visible
    private static isVisible: boolean = false;

    // Window position
    private static windowPosition: { x: number, y: number } = { x: 20, y: 50 };

    // Window size
    private static windowSize: { width: number, height: number } = { width: 300, height: 400 };

    // Folded categories
    private static foldedCategories: Set<string> = new Set();

    // 在类定义中添加一个静态变量来标记按钮是否已添加
    private static _buttonsAdded: boolean = false;

    /**
     * Check if buttons have been added already
     * @returns True if buttons have been added
     */
    public static AreButtonsAdded(): boolean {
        return IMGUIDebugButton._buttonsAdded;
    }

    /**
     * Mark buttons as added
     */
    public static MarkButtonsAdded(): void {
        IMGUIDebugButton._buttonsAdded = true;
    }

    /**
     * Initialize Debug Button Panel
     * @private
     */
    private static initialize(): void {
        if (this.isInitialized) return;

        // Set initialized flag first to prevent recursive calls
        this.isInitialized = true;

        // Create IMGUI window
        Imgui_chunchun.CreateTextWindow(
            this.WINDOW_ID,
            "debug_panel",
            "",
            this.windowPosition
        );

        // Configure window
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.WINDOW_ID);
            if (windowConfig) {
                windowConfig.size = this.windowSize;
                windowConfig.isOpen = this.isVisible;
                windowConfig.renderCallback = () => {
                    this.renderDebugButtonWindow();
                };
            }
        }

        // Add keyboard event listener
        this.setupKeyboardEvents();

        console.log("IMGUIDebugButton initialized");
    }

    /**
     * Setup keyboard events
     * @private
     */
    private static setupKeyboardEvents(): void {
        document.addEventListener('keydown', (event) => {
            // Check if the pressed key matches the toggle key (case insensitive)
            if (event.key.toLowerCase() === this.toggleKey.toLowerCase()) {
                this.Toggle();
                console.log(`Debug button panel toggled by pressing '${this.toggleKey}' key`);
            }
        });
    }

    /**
     * Set toggle key
     * @param key Key to toggle the debug panel
     */
    public static SetToggleKey(key: string): void {
        if (key && key.length > 0) {
            this.toggleKey = key.toLowerCase();
            console.log(`Debug button panel toggle key set to '${this.toggleKey}'`);
        }
    }

    /**
     * Render Debug Button Window
     * @private
     */
    private static renderDebugButtonWindow(): void {
        const ImGui = globalThis.ImGui;

        // Set window content area
        const contentAvail = ImGui.GetContentRegionAvail();

        // Root buttons (not belonging to any category)
        this.renderUncategorizedButtons();

        ImGui.Separator();

        // Render categories and buttons under them
        this.categories.forEach((category, categoryId) => {
            this.renderCategory(category, categoryId);
        });

        // If no buttons, show hint
        if (this.buttons.length === 0 && this.categories.size === 0) {
            ImGui.TextColored(
                new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                "Use IMGUIDebugButton.AddButton() to add debug buttons"
            );
        }
    }

    /**
     * Render uncategorized buttons
     * @private
     */
    private static renderUncategorizedButtons(): void {
        const ImGui = globalThis.ImGui;

        // Get uncategorized buttons
        const uncategorizedButtons = this.buttons.filter(btn => !btn.categoryId);

        // Render uncategorized buttons
        uncategorizedButtons.forEach(button => {
            this.renderButton(button);
        });
    }

    /**
     * Render category
     * @param category Category
     * @param categoryId Category ID
     * @private
     */
    private static renderCategory(category: Category, categoryId: string): void {
        const ImGui = globalThis.ImGui;

        // Get buttons under category
        const categoryButtons = this.buttons.filter(btn => btn.categoryId === categoryId);

        // If no buttons under category, don't show
        if (categoryButtons.length === 0) return;

        // Check if category is folded
        const isFolded = this.foldedCategories.has(categoryId);

        // Category title (can be clicked to fold/unfold)
        if (ImGui.CollapsingHeader(category.name, !isFolded ? ImGui.TreeNodeFlags.DefaultOpen : 0)) {
            // Expanded state, remove fold mark
            this.foldedCategories.delete(categoryId);

            // Add indent
            ImGui.Indent(10);

            // Render buttons under category
            categoryButtons.forEach(button => {
                this.renderButton(button);
            });

            // Restore indent
            ImGui.Unindent(10);
        } else {
            // Folded state, add fold mark
            this.foldedCategories.add(categoryId);
        }
    }

    /**
     * Render button
     * @param button Button config
     * @private
     */
    private static renderButton(button: DebugButton): void {
        const ImGui = globalThis.ImGui;

        // If has custom color
        if (button.color) {
            ImGui.PushStyleColor(
                ImGui.Col.Button,
                new ImGui.ImVec4(...button.color)
            );

            // Set hover color (slightly brighter)
            const hoverColor = button.color.map((v, i) =>
                i === 3 ? v : Math.min(v * 1.2, 1.0)
            ) as [number, number, number, number];

            ImGui.PushStyleColor(
                ImGui.Col.ButtonHovered,
                new ImGui.ImVec4(...hoverColor)
            );

            // Set active color (slightly darker)
            const activeColor = button.color.map((v, i) =>
                i === 3 ? v : v * 0.8
            ) as [number, number, number, number];

            ImGui.PushStyleColor(
                ImGui.Col.ButtonActive,
                new ImGui.ImVec4(...activeColor)
            );
        }

        // Button width set to window width minus margin
        const buttonWidth = ImGui.GetContentRegionAvail().x;

        // Render button
        if (ImGui.Button(button.name, new ImGui.ImVec2(buttonWidth, 0))) {
            if (button.callback) {
                try {
                    button.callback();
                } catch (e) {
                    console.error(`Button ${button.name} callback error:`, e);
                }
            }
        }

        // If has hover tooltip
        if (button.tooltip && ImGui.IsItemHovered()) {
            ImGui.BeginTooltip();
            ImGui.Text(button.tooltip);
            ImGui.EndTooltip();
        }

        // If has custom color, restore style
        if (button.color) {
            ImGui.PopStyleColor(3);
        }
    }

    /**
     * Add debug button
     * @param name Button name
     * @param callback Click callback
     * @param tooltip Hover tooltip (optional)
     * @returns Button ID
     */
    public static AddButton(name: string, callback: () => void, tooltip?: string): string {
        this.ensureInitialized();

        const buttonId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.buttons.push({
            id: buttonId,
            name,
            callback,
            tooltip
        });

        return buttonId;
    }

    /**
     * Add color button
     * @param name Button name
     * @param color Button color [r, g, b, a] (0-1 range)
     * @param callback Click callback
     * @param tooltip Hover tooltip (optional)
     * @returns Button ID
     */
    public static AddColorButton(
        name: string,
        color: [number, number, number, number],
        callback: () => void,
        tooltip?: string
    ): string {
        this.ensureInitialized();

        const buttonId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.buttons.push({
            id: buttonId,
            name,
            color,
            callback,
            tooltip
        });

        return buttonId;
    }

    /**
     * Add category
     * @param name Category name
     * @returns Category ID
     */
    public static AddCategory(name: string): string {
        this.ensureInitialized();

        // Check if category with same name already exists
        const existingId = this.findCategoryIdByName(name);
        if (existingId) return existingId;

        const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.categories.set(categoryId, {
            id: categoryId,
            name
        });

        return categoryId;
    }

    /**
     * Find category ID by name
     * @param name Category name
     * @returns Category ID or undefined
     * @private
     */
    private static findCategoryIdByName(name: string): string | undefined {
        for (const [id, category] of this.categories.entries()) {
            if (category.name === name) {
                return id;
            }
        }
        return undefined;
    }

    /**
     * Add button to category
     * @param categoryId Category ID
     * @param name Button name
     * @param callback Click callback
     * @param tooltip Hover tooltip (optional)
     * @returns Button ID
     */
    public static AddButtonToCategory(
        categoryId: string,
        name: string,
        callback: () => void,
        tooltip?: string
    ): string {
        this.ensureInitialized();

        // Check if category exists
        if (!this.categories.has(categoryId)) {
            console.warn(`Category ${categoryId} does not exist, will create uncategorized button`);
            return this.AddButton(name, callback, tooltip);
        }

        const buttonId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.buttons.push({
            id: buttonId,
            name,
            callback,
            tooltip,
            categoryId
        });

        return buttonId;
    }

    /**
     * Add color button to category
     * @param categoryId Category ID
     * @param name Button name
     * @param color Button color [r, g, b, a] (0-1 range)
     * @param callback Click callback
     * @param tooltip Hover tooltip (optional)
     * @returns Button ID
     */
    public static AddColorButtonToCategory(
        categoryId: string,
        name: string,
        color: [number, number, number, number],
        callback: () => void,
        tooltip?: string
    ): string {
        this.ensureInitialized();

        // Check if category exists
        if (!this.categories.has(categoryId)) {
            console.warn(`Category ${categoryId} does not exist, will create uncategorized button`);
            return this.AddColorButton(name, color, callback, tooltip);
        }

        const buttonId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.buttons.push({
            id: buttonId,
            name,
            color,
            callback,
            tooltip,
            categoryId
        });

        return buttonId;
    }

    /**
     * Remove button
     * @param buttonId Button ID
     */
    public static RemoveButton(buttonId: string): void {
        const index = this.buttons.findIndex(btn => btn.id === buttonId);
        if (index !== -1) {
            this.buttons.splice(index, 1);
        }
    }

    /**
     * Remove category and all buttons under it
     * @param categoryId Category ID
     */
    public static RemoveCategory(categoryId: string): void {
        // Remove category
        this.categories.delete(categoryId);

        // Remove all buttons under category
        this.buttons = this.buttons.filter(btn => btn.categoryId !== categoryId);
    }

    /**
     * Clear all buttons and categories
     */
    public static Clear(): void {
        this.buttons = [];
        this.categories.clear();
    }

    /**
     * Show button panel
     */
    public static Show(): void {
        this.ensureInitialized();
        this.isVisible = true;

        // Update window state
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.WINDOW_ID);
            if (windowConfig) {
                windowConfig.isOpen = true;
            }
        }
    }

    /**
     * Hide button panel
     */
    public static Hide(): void {
        if (!this.isInitialized) return;
        this.isVisible = false;

        // Update window state
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.WINDOW_ID);
            if (windowConfig) {
                windowConfig.isOpen = false;
            }
        }
    }

    /**
     * Toggle button panel visibility
     */
    public static Toggle(): void {
        if (this.isVisible) {
            this.Hide();
        } else {
            this.Show();
        }
    }

    /**
     * Set window position
     * @param x X coordinate
     * @param y Y coordinate
     */
    public static SetPosition(x: number, y: number): void {
        this.windowPosition = { x, y };

        // If initialized, update window position
        if (this.isInitialized) {
            const imgui = Imgui_chunchun as any;
            if (imgui.windows && imgui.windows.get) {
                const windowConfig = imgui.windows.get(this.WINDOW_ID);
                if (windowConfig && windowConfig.position) {
                    windowConfig.position.x = x;
                    windowConfig.position.y = y;
                }
            }
        }
    }

    /**
     * Set window size
     * @param width Width
     * @param height Height
     */
    public static SetSize(width: number, height: number): void {
        this.windowSize = { width, height };

        // If initialized, update window size
        if (this.isInitialized) {
            const imgui = Imgui_chunchun as any;
            if (imgui.windows && imgui.windows.get) {
                const windowConfig = imgui.windows.get(this.WINDOW_ID);
                if (windowConfig && windowConfig.size) {
                    windowConfig.size.width = width;
                    windowConfig.size.height = height;
                }
            }
        }
    }

    /**
     * Check if button panel is visible
     * @returns Is visible
     */
    public static IsVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Ensure initialized
     * @private
     */
    private static ensureInitialized(): void {
        if (!this.isInitialized) {
            this.initialize();
        }
    }

    /**
     * Create a category directly (internal use)
     * @param name Category name
     * @returns Category ID
     * @private
     */
    private static createCategory(name: string): string {
        // Check if category with same name already exists
        for (const [id, category] of this.categories.entries()) {
            if (category.name === name) {
                return id;
            }
        }

        // Create new category
        const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.categories.set(categoryId, {
            id: categoryId,
            name
        });

        return categoryId;
    }

    /**
     * Create a button in a category directly (internal use)
     * @param categoryId Category ID
     * @param name Button name
     * @param callback Callback function
     * @param tooltip Optional tooltip
     * @returns Button ID
     * @private
     */
    private static createButtonInCategory(
        categoryId: string,
        name: string,
        callback: () => void,
        tooltip?: string
    ): string {
        const buttonId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.buttons.push({
            id: buttonId,
            name,
            callback,
            tooltip,
            categoryId
        });

        return buttonId;
    }
}

// Button interface
interface DebugButton {
    id: string;
    name: string;
    callback: () => void;
    tooltip?: string;
    color?: [number, number, number, number]; // [r, g, b, a] color values (0-1)
    categoryId?: string; // Category ID it belongs to
}

// Category interface
interface Category {
    id: string;
    name: string;
}

// Initialize IMGUI Debug Button Panel
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {


    // 使用延时添加按钮，确保初始化完成后再添加
    setTimeout(() => {
        // 如果按钮已经添加过，则不再重复添加
        if (IMGUIDebugButton.AreButtonsAdded()) {
            console.log("Debug buttons already added, skipping...");
            return;
        }

        // 标记按钮已添加
        IMGUIDebugButton.MarkButtonsAdded();

        // Add system buttons
        // const systemCategoryId = IMGUIDebugButton.AddCategory("System");
        // if (systemCategoryId) {
        //     IMGUIDebugButton.AddButtonToCategory(systemCategoryId, "Clear Console", () => {
        //         console.clear();
        //     });

        //     // Add warning button example
        //     IMGUIDebugButton.AddColorButtonToCategory(
        //         systemCategoryId,
        //         "Warning Test", 
        //         [1.0, 0.3, 0.3, 1.0], // Red
        //         () => {
        //             console.warn("This is a warning test");
        //         },
        //         "Click to show warning message"
        //     );
        // }

    }, 100); // 短暂延迟确保初始化完成
});

