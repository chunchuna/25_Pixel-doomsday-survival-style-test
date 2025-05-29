import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
import { VariableMonitoring } from "./UIvariableMonitoring.js";

/**
 * IMGUI version of Debug Button Menu with Advanced UI Features
 * Provides in-game debug button functionality with professional UI/UX optimizations
 * 
 * Features:
 * - Real-time search filtering: Quickly find buttons by typing keywords
 * - Favorite system: Mark frequently used buttons for quick access (F/f button)
 * - Recent usage tracking: Shows last 5 used buttons for convenience
 * - Tab-based interface: Each category becomes a separate tab
 * - Quick access area: Favorites and recent buttons shown at the top
 * - Responsive layout: Adapts to different content amounts
 * - Maintains backward compatibility with existing button addition APIs
 * 
 * UI Layout:
 * 1. Search box with clear button (X)
 * 2. Quick access area (favorites + recent buttons)
 * 3. Tab navigation for categories
 * 4. Button lists with F/f icons for favoriting
 * 
 * Usage examples:
 * 
 * // Basic usage - add normal button (appears in "General" tab)
 * IMGUIDebugButton.AddButton("Test Button", () => {
 *     console.log("Test button clicked");
 * });
 * 
 * // Add category button (creates new tab)
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
    private static windowSize: { width: number, height: number } = { width: 350, height: 450 };

    // 在类定义中添加一个静态变量来标记按钮是否已添加
    private static _buttonsAdded: boolean = false;

    // Search filter
    private static searchFilter: string = "";

    // Search input buffer (for ImGui input)
    private static searchBuffer: string = "";

    // Recently used buttons (track button usage)
    private static recentButtons: string[] = [];
    private static readonly MAX_RECENT_BUTTONS = 5;

    // Favorite buttons
    private static favoriteButtons: Set<string> = new Set();

    // Tab scrolling state
    private static tabScrollOffset: number = 0;
    private static isMouseOverTabs: boolean = false;

    // Custom pagination system
    private static currentPageIndex: number = 0;
    private static pageNames: string[] = [];
    private static pageButtons: Map<string, DebugButton[]> = new Map();

    // Input text state (simple string for ImGui)
    private static inputTextValue: string = "";

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

        // === Search Section ===
        ImGui.Text("Search:");
        ImGui.SameLine();
        ImGui.SetNextItemWidth(contentAvail.x - 60);
        
        // Use the correct InputText callback pattern like other examples
        if (ImGui.InputText("##search_input", (value = this.inputTextValue) => {
            this.inputTextValue = value;
            return this.inputTextValue;
        })) {
            this.searchBuffer = this.inputTextValue;
            this.searchFilter = this.searchBuffer.toLowerCase();
            console.log("Search updated:", this.searchFilter);
        }

        // Clear button
        ImGui.SameLine();
        if (ImGui.Button("X##clear")) {
            this.inputTextValue = "";
            this.searchBuffer = "";
            this.searchFilter = "";
        }

        ImGui.Separator();

        // === Page Navigation Section ===
        this.updatePageData();
        
        if (this.pageNames.length > 0) {
            // Handle keyboard shortcuts for page navigation
            const io = ImGui.GetIO();
            if (io.KeysDown && ImGui.IsWindowFocused()) {
                // Left arrow or A key for previous page
                if (io.KeysDown[ImGui.Key.LeftArrow] || io.KeysDown[ImGui.Key.A]) {
                    this.currentPageIndex = Math.max(0, this.currentPageIndex - 1);
                }
                // Right arrow or D key for next page
                if (io.KeysDown[ImGui.Key.RightArrow] || io.KeysDown[ImGui.Key.D]) {
                    this.currentPageIndex = Math.min(this.pageNames.length - 1, this.currentPageIndex + 1);
                }
            }
            
            // Previous button
            if (ImGui.Button("<<##prev") || ImGui.IsKeyPressed(ImGui.Key.LeftArrow)) {
                this.currentPageIndex = Math.max(0, this.currentPageIndex - 1);
            }
            
            // Add tooltip
            if (ImGui.IsItemHovered()) {
                ImGui.BeginTooltip();
                ImGui.Text("Previous page (Left Arrow / A)");
                ImGui.EndTooltip();
            }
            
            ImGui.SameLine();
            
            // Current page info with more details
            const currentPageName = this.pageNames[this.currentPageIndex] || "Unknown";
            const currentPageButtons = this.pageButtons.get(currentPageName) || [];
            const pageInfo = `${this.currentPageIndex + 1}/${this.pageNames.length}: ${currentPageName} (${currentPageButtons.length} buttons)`;
            ImGui.Text(pageInfo);
            
            ImGui.SameLine();
            
            // Next button
            if (ImGui.Button(">>##next") || ImGui.IsKeyPressed(ImGui.Key.RightArrow)) {
                this.currentPageIndex = Math.min(this.pageNames.length - 1, this.currentPageIndex + 1);
            }
            
            // Add tooltip
            if (ImGui.IsItemHovered()) {
                ImGui.BeginTooltip();
                ImGui.Text("Next page (Right Arrow / D)");
                ImGui.EndTooltip();
            }
            
            // Add page selector dropdown for quick access
            ImGui.SameLine();
            ImGui.Text("Quick:");
            ImGui.SameLine();
            if (ImGui.BeginCombo("##page_selector", currentPageName)) {
                for (let i = 0; i < this.pageNames.length; i++) {
                    const pageName = this.pageNames[i];
                    const isSelected = i === this.currentPageIndex;
                    if (ImGui.Selectable(pageName, isSelected)) {
                        this.currentPageIndex = i;
                    }
                    if (isSelected) {
                        ImGui.SetItemDefaultFocus();
                    }
                }
                ImGui.EndCombo();
            }
            
            ImGui.Separator();
        }

        // === Content Section ===
        if (this.searchFilter) {
            // Show search results
            const { filteredButtons, filteredCategories } = this.getFilteredContent();
            this.renderSearchResults(filteredButtons, filteredCategories);
        } else {
            // Show current page content
            this.renderCurrentPage();
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
     * Render button
     * @param button Button config
     * @private
     */
    private static renderButton(button: DebugButton): void {
        const ImGui = globalThis.ImGui;

        // Button row - favorite star + button + tooltip
        const buttonWidth = ImGui.GetContentRegionAvail().x - 30; // Leave space for star

        // Favorite star button
        const isFavorite = this.favoriteButtons.has(button.id);
        const starText = isFavorite ? "F" : "f";
        const starColor = isFavorite ? [1.0, 1.0, 0.0, 1.0] : [0.5, 0.5, 0.5, 1.0];
        
        ImGui.PushStyleColor(ImGui.Col.Text, new ImGui.ImVec4(...starColor));
        if (ImGui.SmallButton(starText + "##star_" + button.id)) {
            if (isFavorite) {
                this.favoriteButtons.delete(button.id);
            } else {
                this.favoriteButtons.add(button.id);
            }
        }
        ImGui.PopStyleColor(1);
        
        if (ImGui.IsItemHovered()) {
            ImGui.BeginTooltip();
            ImGui.Text(isFavorite ? "Remove from favorites" : "Add to favorites");
            ImGui.EndTooltip();
        }

        ImGui.SameLine();

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

        // Render button
        if (ImGui.Button(button.name, new ImGui.ImVec2(buttonWidth, 0))) {
            if (button.callback) {
                try {
                    button.callback();
                    // Track button usage
                    this.trackButtonUsage(button.id);
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

    /**
     * Get filtered content
     * @private
     */
    private static getFilteredContent(): { filteredButtons: DebugButton[], filteredCategories: Map<string, Category> } {
        const ImGui = globalThis.ImGui;

        // Get uncategorized buttons
        const uncategorizedButtons = this.buttons.filter(btn => !btn.categoryId);

        // Get categorized buttons
        const categorizedButtons = this.buttons.filter(btn => btn.categoryId);

        // Filter uncategorized buttons
        const filteredUncategorizedButtons = uncategorizedButtons.filter(btn =>
            btn.name.toLowerCase().includes(this.searchFilter)
        );

        // Filter categorized buttons
        const filteredCategorizedButtons = categorizedButtons.filter(btn =>
            btn.name.toLowerCase().includes(this.searchFilter)
        );

        // Filter categories
        const filteredCategories = new Map<string, Category>();
        filteredCategorizedButtons.forEach(btn => {
            if (btn.categoryId && !filteredCategories.has(btn.categoryId)) {
                filteredCategories.set(btn.categoryId, this.categories.get(btn.categoryId) as Category);
            }
        });

        return {
            filteredButtons: [...filteredUncategorizedButtons, ...filteredCategorizedButtons],
            filteredCategories: filteredCategories
        };
    }

    /**
     * Render search results
     * @param buttons Buttons to render
     * @param categories Categories to render
     * @private
     */
    private static renderSearchResults(buttons: DebugButton[], categories: Map<string, Category>): void {
        const ImGui = globalThis.ImGui;

        // Render each button
        buttons.forEach(button => {
            this.renderButton(button);
        });
    }

    /**
     * Render tab view
     * @param buttons Buttons to render
     * @param categories Categories to render
     * @private
     */
    private static renderTabView(buttons: DebugButton[], categories: Map<string, Category>): void {
        const ImGui = globalThis.ImGui;

        // Show quick access area (favorites and recent)
        this.renderQuickAccess();

        // Get current cursor position for tab area detection
        const tabAreaStartY = ImGui.GetCursorPosY();
        
        // Start tab bar with scrolling support
        if (ImGui.BeginTabBar("DebugButtonTabs", ImGui.TabBarFlags.FittingPolicyScroll | ImGui.TabBarFlags.TabListPopupButton)) {
            
            // Get tab bar rect for mouse detection
            const tabBarMin = ImGui.GetItemRectMin();
            const tabBarMax = ImGui.GetItemRectMax();
            const mousePos = ImGui.GetMousePos();
            
            // Check if mouse is over tab bar area
            this.isMouseOverTabs = (mousePos.x >= tabBarMin.x && mousePos.x <= tabBarMax.x && 
                                   mousePos.y >= tabBarMin.y && mousePos.y <= tabBarMax.y);
            
            // Handle mouse wheel scrolling when over tabs
            if (this.isMouseOverTabs && ImGui.IsWindowHovered()) {
                const wheel = ImGui.GetIO().MouseWheel;
                if (wheel !== 0) {
                    // Use a simple approach: just consume the wheel event to prevent conflicts
                    // The TabBar already has built-in scrolling support
                    // We just need to ensure it's active when mouse is over tabs
                    console.log("Tab area wheel scroll detected:", wheel);
                }
            }
            
            // First tab: Uncategorized buttons (only show if there are uncategorized buttons)
            const uncategorizedButtons = buttons.filter(btn => !btn.categoryId);
            if (uncategorizedButtons.length > 0) {
                if (ImGui.BeginTabItem("General")) {
                    this.renderUncategorizedButtons();
                    ImGui.EndTabItem();
                }
            }

            // Render each category as a separate tab
            categories.forEach((category, categoryId) => {
                // Get buttons under this category
                const categoryButtons = buttons.filter(btn => btn.categoryId === categoryId);
                
                // Only show tab if there are buttons in this category
                if (categoryButtons.length > 0) {
                    if (ImGui.BeginTabItem(category.name)) {
                        // Render buttons under this category
                        categoryButtons.forEach(button => {
                            this.renderButton(button);
                        });
                        ImGui.EndTabItem();
                    }
                }
            });

            ImGui.EndTabBar();
        }
    }

    /**
     * Get total number of tabs
     * @param buttons Buttons array
     * @param categories Categories map
     * @returns Total tab count
     * @private
     */
    private static getTotalTabCount(buttons: DebugButton[], categories: Map<string, Category>): number {
        let count = 0;
        
        // Count uncategorized buttons tab
        const uncategorizedButtons = buttons.filter(btn => !btn.categoryId);
        if (uncategorizedButtons.length > 0) {
            count++;
        }
        
        // Count category tabs that have buttons
        categories.forEach((category, categoryId) => {
            const categoryButtons = buttons.filter(btn => btn.categoryId === categoryId);
            if (categoryButtons.length > 0) {
                count++;
            }
        });
        
        return count;
    }

    /**
     * Track button usage
     * @param buttonId Button ID
     * @private
     */
    private static trackButtonUsage(buttonId: string): void {
        // Remove if already exists
        const existingIndex = this.recentButtons.indexOf(buttonId);
        if (existingIndex !== -1) {
            this.recentButtons.splice(existingIndex, 1);
        }

        // Add to front
        this.recentButtons.unshift(buttonId);

        // Keep only MAX_RECENT_BUTTONS
        if (this.recentButtons.length > this.MAX_RECENT_BUTTONS) {
            this.recentButtons = this.recentButtons.slice(0, this.MAX_RECENT_BUTTONS);
        }
    }

    /**
     * Render quick access section
     * @private
     */
    private static renderQuickAccess(): void {
        const ImGui = globalThis.ImGui;

        // Favorite buttons section
        const favoriteButtonsList = Array.from(this.favoriteButtons)
            .map(id => this.buttons.find(btn => btn.id === id))
            .filter(btn => btn !== undefined) as DebugButton[];

        // Recent buttons section
        const recentButtonsList = this.recentButtons
            .map(id => this.buttons.find(btn => btn.id === id))
            .filter(btn => btn !== undefined) as DebugButton[];

        let hasQuickAccess = false;

        // Render favorites
        if (favoriteButtonsList.length > 0) {
            hasQuickAccess = true;
            ImGui.TextColored(new ImGui.ImVec4(1.0, 1.0, 0.0, 1.0), "Favorites:");
            favoriteButtonsList.forEach(button => {
                this.renderButton(button);
            });
        }

        // Render recent
        if (recentButtonsList.length > 0) {
            if (hasQuickAccess) ImGui.Spacing();
            hasQuickAccess = true;
            ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 1.0, 1.0), "Recent:");
            recentButtonsList.forEach(button => {
                this.renderButton(button);
            });
        }

        if (hasQuickAccess) {
            ImGui.Separator();
        }
    }

    /**
     * Update page data
     * @private
     */
    private static updatePageData(): void {
        this.pageNames = [];
        this.pageButtons.clear();

        // Add "General" page for uncategorized buttons
        const uncategorizedButtons = this.buttons.filter(btn => !btn.categoryId);
        if (uncategorizedButtons.length > 0) {
            this.pageNames.push("General");
            this.pageButtons.set("General", uncategorizedButtons);
        }

        // Add category pages
        this.categories.forEach((category, categoryId) => {
            const categoryButtons = this.buttons.filter(btn => btn.categoryId === categoryId);
            if (categoryButtons.length > 0) {
                this.pageNames.push(category.name);
                this.pageButtons.set(category.name, categoryButtons);
            }
        });

        // Ensure currentPageIndex is valid
        if (this.currentPageIndex >= this.pageNames.length) {
            this.currentPageIndex = Math.max(0, this.pageNames.length - 1);
        }
    }

    /**
     * Render current page
     * @private
     */
    private static renderCurrentPage(): void {
        const ImGui = globalThis.ImGui;

        if (this.pageNames.length === 0) {
            ImGui.TextColored(
                new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                "Use IMGUIDebugButton.AddButton() to add debug buttons"
            );
            return;
        }

        // Show quick access section
        this.renderQuickAccess();

        // Get current page name and buttons
        const currentPageName = this.pageNames[this.currentPageIndex];
        const currentPageButtons = this.pageButtons.get(currentPageName) || [];

        // Render current page buttons
        if (currentPageButtons.length > 0) {
            ImGui.TextColored(new ImGui.ImVec4(0.8, 0.8, 1.0, 1.0), `${currentPageName}:`);
            currentPageButtons.forEach(button => {
                this.renderButton(button);
            });
        } else {
            ImGui.TextColored(
                new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                `No buttons in ${currentPageName} category`
            );
        }
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

