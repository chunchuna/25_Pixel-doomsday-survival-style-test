import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { IMGUIDebugButton } from "../debug_ui/UIDbugButton.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";

// Position enumeration for shortcut groups
export enum ShortPosition {
    TopLeft = "top-left",
    TopRight = "top-right",
    BottomLeft = "bottom-left",
    BottomRight = "bottom-right",
    TopCenter = "top-center",
    BottomCenter = "bottom-center",
    LeftCenter = "left-center",
    RightCenter = "right-center"
}

// Interface for shortcut key data
interface ShortcutKey {
    key: string;
    description?: string;
}

// Interface for shortcut group data
interface ShortcutGroup {
    id: string;
    element: HTMLElement;
    position: ShortPosition;
    keys: ShortcutKey[];
    littleGroups: ShortcutLittleGroup[];
}

// Interface for little group data
interface ShortcutLittleGroup {
    id: string;
    element: HTMLElement;
    keys: ShortcutKey[];
    description: string;
    parentGroup: ShortcutGroup;
}

/**
 * Shortcut UI System - Static class for managing keyboard shortcut hints
 */
export class UIShortcut {
    private static groups: Map<string, ShortcutGroup> = new Map();
    private static littleGroups: Map<string, ShortcutLittleGroup> = new Map();
    private static idCounter: number = 0;
    private static isInitialized: boolean = false;

    /**
     * Initialize the shortcut system
     */
    public static Initialize(): void {
        if (this.isInitialized) return;

        this.ensureGlobalStyles();
        this.isInitialized = true;
        console.log("UIShortcut system initialized");
    }

    /**
     * Create a shortcut group at specified position
     * @param position Position where to place the group
     * @returns ShortcutGroup object
     */
    public static CreateShortGroup(position: ShortPosition = ShortPosition.BottomRight): ShortcutGroup {
        this.Initialize();

        const groupId = `shortcut-group-${++this.idCounter}`;

        // Create group container
        const groupElement = document.createElement('div');
        groupElement.id = groupId;
        groupElement.className = 'shortcut-group';

        // Apply position-based styling
        this.applyPositionStyles(groupElement, position);

        // Add to document
        document.body.appendChild(groupElement);

        // Create group object
        const group: ShortcutGroup = {
            id: groupId,
            element: groupElement,
            position: position,
            keys: [],
            littleGroups: []
        };

        this.groups.set(groupId, group);
        return group;
    }

    /**
     * Create a little group within a parent group
     * @param parentGroup Parent shortcut group
     * @returns ShortcutLittleGroupBuilder for chaining
     */
    public static CreateShortLittleGroup(parentGroup: ShortcutGroup): ShortcutLittleGroupBuilder {
        const littleGroupId = `shortcut-little-group-${++this.idCounter}`;

        // Create little group container
        const littleGroupElement = document.createElement('div');
        littleGroupElement.className = 'shortcut-little-group';
        littleGroupElement.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        // Add to parent group
        parentGroup.element.appendChild(littleGroupElement);

        // Create little group object
        const littleGroup: ShortcutLittleGroup = {
            id: littleGroupId,
            element: littleGroupElement,
            keys: [],
            description: "",
            parentGroup: parentGroup
        };

        this.littleGroups.set(littleGroupId, littleGroup);
        parentGroup.littleGroups.push(littleGroup);

        return new ShortcutLittleGroupBuilder(littleGroup);
    }

    /**
     * Create a single shortcut key in a group
     * @param parentGroup Parent shortcut group
     * @param key Key name
     * @param description Key description
     */
    public static CreateShort(parentGroup: ShortcutGroup, key: string, description: string): void {
        const shortcutKey: ShortcutKey = { key, description };
        parentGroup.keys.push(shortcutKey);

        // Create shortcut element
        const shortcutElement = document.createElement('div');
        shortcutElement.className = 'shortcut-single';
        shortcutElement.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            padding: 4px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        // Create key icon
        const keyIcon = this.createKeyIcon(key);
        shortcutElement.appendChild(keyIcon);

        // Create description
        const descElement = document.createElement('span');
        descElement.textContent = description;
        descElement.style.cssText = `
            color: #ffffff;
            font-size: 12px;
            margin-left: 8px;
            font-family: Arial, sans-serif;
        `;
        shortcutElement.appendChild(descElement);

        parentGroup.element.appendChild(shortcutElement);
    }

    /**
     * Remove a shortcut group
     * @param group Group to remove
     */
    public static RemoveShortGroup(group: ShortcutGroup): void {
        if (group.element.parentNode) {
            group.element.parentNode.removeChild(group.element);
        }
        this.groups.delete(group.id);
    }

    /**
     * Hide a shortcut group
     * @param group Group to hide
     */
    public static HideShortGroup(group: ShortcutGroup): void {
        group.element.style.display = 'none';
    }

    /**
     * Show a shortcut group
     * @param group Group to show
     */
    public static ShowShortGroup(group: ShortcutGroup): void {
        group.element.style.display = 'block';
    }

    /**
     * Create a key icon element
     * @param key Key name
     * @returns HTMLElement representing the key
     */
    private static createKeyIcon(key: string): HTMLElement {
        const keyElement = document.createElement('div');
        keyElement.className = 'shortcut-key';
        keyElement.textContent = key.toUpperCase();

        keyElement.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            padding: 2px 6px;
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            border: 1px solid #444;
            border-radius: 4px;
            box-shadow: 
                0 2px 4px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
            user-select: none;
            cursor: default;
        `;

        return keyElement;
    }

    /**
     * Apply position-based styles to group element
     * @param element Element to style
     * @param position Position enum
     */
    private static applyPositionStyles(element: HTMLElement, position: ShortPosition): void {
        element.style.cssText = `
            position: fixed;
            z-index: 9000;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 12px;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            min-width: 120px;
            max-width: 300px;
        `;

        switch (position) {
            case ShortPosition.TopLeft:
                element.style.top = '20px';
                element.style.left = '20px';
                break;
            case ShortPosition.TopRight:
                element.style.top = '20px';
                element.style.right = '20px';
                break;
            case ShortPosition.BottomLeft:
                element.style.bottom = '20px';
                element.style.left = '20px';
                break;
            case ShortPosition.BottomRight:
                element.style.bottom = '20px';
                element.style.right = '20px';
                break;
            case ShortPosition.TopCenter:
                element.style.top = '20px';
                element.style.left = '50%';
                element.style.transform = 'translateX(-50%)';
                break;
            case ShortPosition.BottomCenter:
                element.style.bottom = '20px';
                element.style.left = '50%';
                element.style.transform = 'translateX(-50%)';
                break;
            case ShortPosition.LeftCenter:
                element.style.left = '20px';
                element.style.top = '50%';
                element.style.transform = 'translateY(-50%)';
                break;
            case ShortPosition.RightCenter:
                element.style.right = '20px';
                element.style.top = '50%';
                element.style.transform = 'translateY(-50%)';
                break;
        }
    }

    /**
     * Ensure global styles are added
     */
    private static ensureGlobalStyles(): void {
        if (document.getElementById('shortcut-ui-styles')) return;

        const style = document.createElement('style');
        style.id = 'shortcut-ui-styles';
        style.textContent = `
            .shortcut-group {
                font-family: Arial, sans-serif;
                user-select: none;
            }
            
            .shortcut-little-group:hover,
            .shortcut-single:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            .shortcut-key:hover {
                background: linear-gradient(145deg, #3a3a3a, #2a2a2a) !important;
                border-color: #555 !important;
            }
            
            .shortcut-key:active {
                background: linear-gradient(145deg, #1a1a1a, #2a2a2a) !important;
                box-shadow: 
                    0 1px 2px rgba(0, 0, 0, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Get all active groups
     * @returns Array of all shortcut groups
     */
    public static GetAllGroups(): ShortcutGroup[] {
        return Array.from(this.groups.values());
    }

    /**
     * Clear all shortcut groups
     */
    public static ClearAllGroups(): void {
        this.groups.forEach(group => {
            if (group.element.parentNode) {
                group.element.parentNode.removeChild(group.element);
            }
        });
        this.groups.clear();
        this.littleGroups.clear();
    }
}

/**
 * Builder class for creating little groups with method chaining
 */
export class ShortcutLittleGroupBuilder {
    private littleGroup: ShortcutLittleGroup;

    constructor(littleGroup: ShortcutLittleGroup) {
        this.littleGroup = littleGroup;
    }

    /**
     * Add a shortcut key to the little group
     * @param key Key name
     * @returns This builder for chaining
     */
    public setShort(key: string): ShortcutLittleGroupBuilder {
        const shortcutKey: ShortcutKey = { key };
        this.littleGroup.keys.push(shortcutKey);

        // Create key icon
        const keyIcon = UIShortcut['createKeyIcon'](key);
        keyIcon.style.marginRight = '4px';
        this.littleGroup.element.appendChild(keyIcon);

        return this;
    }

    /**
     * Add description to the little group
     * @param description Description text
     * @returns This builder for chaining
     */
    public AddDescribe(description: string): ShortcutLittleGroupBuilder {
        this.littleGroup.description = description;

        // Create description element
        const descElement = document.createElement('span');
        descElement.textContent = description;
        descElement.style.cssText = `
            color: #ffffff;
            font-size: 12px;
            margin-left: 8px;
            font-family: Arial, sans-serif;
        `;

        this.littleGroup.element.appendChild(descElement);

        return this;
    }

    /**
     * Get the created little group
     * @returns The little group object
     */
    public getGroup(): ShortcutLittleGroup {
        return this.littleGroup;
    }
}






/**
 * Example usage of UIShortcut system
 * This class demonstrates how to use the shortcut hint system
 */
export class UIShortcutExample {

    /**
     * Create example shortcut groups to demonstrate the system
     */
    public static CreateExampleShortcuts(): void {
        // Example 1: Player movement hints in bottom right
        const playerMovementGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
        UIShortcut.CreateShortLittleGroup(playerMovementGroup)
            .setShort("W")
            .setShort("S")
            .setShort("D")
            .setShort("A")
            .AddDescribe("Player Move");

        // Example 2: Inventory hint in top right
        const inventoryGroup = UIShortcut.CreateShortGroup(ShortPosition.TopRight);
        UIShortcut.CreateShort(inventoryGroup, "TAB", "Open Inventory");
        UIShortcut.CreateShort(inventoryGroup, "I", "Item Details");

        // Example 3: Combat shortcuts in bottom left
        const combatGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomLeft);
        UIShortcut.CreateShortLittleGroup(combatGroup)
            .setShort("LMB")
            .setShort("RMB")
            .AddDescribe("Attack");

        UIShortcut.CreateShort(combatGroup, "SPACE", "Dodge");
        UIShortcut.CreateShort(combatGroup, "SHIFT", "Run");

        // Example 4: System shortcuts in top left
        const systemGroup = UIShortcut.CreateShortGroup(ShortPosition.TopLeft);
        UIShortcut.CreateShort(systemGroup, "ESC", "Menu");
        UIShortcut.CreateShort(systemGroup, "F1", "Help");
        UIShortcut.CreateShort(systemGroup, "F11", "Fullscreen");

        // Example 5: Tool shortcuts in top center
        const toolGroup = UIShortcut.CreateShortGroup(ShortPosition.TopCenter);
        UIShortcut.CreateShortLittleGroup(toolGroup)
            .setShort("1")
            .setShort("2")
            .setShort("3")
            .setShort("4")
            .AddDescribe("Quick Tools");

        console.log("Example shortcut groups created successfully");
    }

    /**
     * Clear all example shortcuts
     */
    public static ClearExampleShortcuts(): void {
        UIShortcut.ClearAllGroups();
        console.log("All shortcut groups cleared");
    }

    /**
     * Create a simple player movement hint group
     * @returns The created shortcut group
     */
    public static CreatePlayerMovementHints() {
        const playerMovementGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
        UIShortcut.CreateShortLittleGroup(playerMovementGroup)
            .setShort("W")
            .setShort("S")
            .setShort("D")
            .setShort("A")
            .AddDescribe("Player Move");

        return playerMovementGroup;
    }

    /**
     * Create inventory shortcuts
     * @returns The created shortcut group
     */
    public static CreateInventoryHints() {
        const inventoryGroup = UIShortcut.CreateShortGroup(ShortPosition.TopRight);
        UIShortcut.CreateShort(inventoryGroup, "TAB", "Open Inventory");
        UIShortcut.CreateShort(inventoryGroup, "I", "Item Details");
        UIShortcut.CreateShort(inventoryGroup, "Q", "Drop Item");

        return inventoryGroup;
    }
}



/**
 * Debug window for testing UIShortcut system
 */
export class UIShortcutDebug {
    private static isWindowOpen: boolean = false;
    private static selectedPosition: number = 0;
    private static keyInput: string = "";
    private static descriptionInput: string = "";
    private static testGroups: any[] = [];

    /**
     * Show the shortcut debug window
     */
    public static ShowDebugWindow(): void {
        if (!this.isWindowOpen) {
            this.isWindowOpen = true;
            this.createDebugWindow();
        }
    }

    /**
     * Hide the shortcut debug window
     */
    public static HideDebugWindow(): void {
        if (this.isWindowOpen) {
            Imgui_chunchun.CloseWindow("shortcut-debug");
            this.isWindowOpen = false;
        }
    }

    /**
     * Toggle the debug window visibility
     */
    public static ToggleDebugWindow(): void {
        if (this.isWindowOpen) {
            this.HideDebugWindow();
        } else {
            this.ShowDebugWindow();
        }
    }

    /**
     * Create the ImGui debug window
     */
    private static createDebugWindow(): void {
        // Use CreateToolWindow with custom tools for the debug interface
        const debugTools = [
            {
                name: "Create All Examples",
                callback: () => {
                    UIShortcutExample.CreateExampleShortcuts();
                }
            },
            {
                name: "Clear All Shortcuts",
                callback: () => {
                    UIShortcut.ClearAllGroups();
                    this.testGroups = [];
                }
            },
            {
                name: "Player Movement",
                callback: () => {
                    const group = UIShortcutExample.CreatePlayerMovementHints();
                    this.testGroups.push(group);
                }
            },
            {
                name: "Inventory Hints",
                callback: () => {
                    const group = UIShortcutExample.CreateInventoryHints();
                    this.testGroups.push(group);
                }
            },
            {
                name: "WASD Movement Test",
                callback: () => {
                    const group = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
                    UIShortcut.CreateShortLittleGroup(group)
                        .setShort("W")
                        .setShort("A")
                        .setShort("S")
                        .setShort("D")
                        .AddDescribe("Movement");
                    this.testGroups.push(group);
                }
            },
            {
                name: "Combat Keys Test",
                callback: () => {
                    const group = UIShortcut.CreateShortGroup(ShortPosition.BottomLeft);
                    UIShortcut.CreateShortLittleGroup(group)
                        .setShort("LMB")
                        .setShort("RMB")
                        .AddDescribe("Attack");
                    UIShortcut.CreateShort(group, "SPACE", "Dodge");
                    this.testGroups.push(group);
                }
            },
            {
                name: "Number Keys Test",
                callback: () => {
                    const group = UIShortcut.CreateShortGroup(ShortPosition.TopCenter);
                    UIShortcut.CreateShortLittleGroup(group)
                        .setShort("1")
                        .setShort("2")
                        .setShort("3")
                        .setShort("4")
                        .setShort("5")
                        .AddDescribe("Quick Slots");
                    this.testGroups.push(group);
                }
            },
            {
                name: "Test All Positions",
                callback: () => {
                    this.createAllPositionTests();
                }
            }
        ];

        Imgui_chunchun.CreateToolWindow("shortcut-debug", "Shortcut UI Debug", debugTools);
    }

    /**
     * Create test shortcuts in all positions
     */
    private static createAllPositionTests(): void {
        const positions = [
            { pos: ShortPosition.TopLeft, name: "Top Left" },
            { pos: ShortPosition.TopRight, name: "Top Right" },
            { pos: ShortPosition.BottomLeft, name: "Bottom Left" },
            { pos: ShortPosition.BottomRight, name: "Bottom Right" },
            { pos: ShortPosition.TopCenter, name: "Top Center" },
            { pos: ShortPosition.BottomCenter, name: "Bottom Center" },
            { pos: ShortPosition.LeftCenter, name: "Left Center" },
            { pos: ShortPosition.RightCenter, name: "Right Center" }
        ];

        positions.forEach((position, index) => {
            const group = UIShortcut.CreateShortGroup(position.pos);
            UIShortcut.CreateShort(group, `F${index + 1}`, position.name);
            this.testGroups.push(group);
        });
    }

    /**
     * Create a simple input dialog for custom shortcuts
     */
    public static ShowCustomShortcutDialog(): void {
        Imgui_chunchun.CreateInputWindow(
            "custom-shortcut-input",
            "Create Custom Shortcut",
            (input: string) => {
                const parts = input.split(",");
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const description = parts[1].trim();
                    const group = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
                    UIShortcut.CreateShort(group, key, description);
                    this.testGroups.push(group);
                }
            }
        );
    }

    /**
     * Show information about the shortcut system
     */
    public static ShowShortcutInfo(): void {
        const infoText = `
Shortcut UI System Usage:

1. CreateShortGroup(position) - Creates a shortcut group at specified position
2. CreateShortLittleGroup(group) - Creates a little group with chaining methods
3. CreateShort(group, key, description) - Creates a single shortcut

Example:
var playerGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
UIShortcut.CreateShortLittleGroup(playerGroup)
    .setShort("W").setShort("S").setShort("D").setShort("A")
    .AddDescribe("Player Move");

var inventoryGroup = UIShortcut.CreateShortGroup(ShortPosition.TopRight);
UIShortcut.CreateShort(inventoryGroup, "TAB", "Open Inventory");

Available Positions:
- TopLeft, TopRight, BottomLeft, BottomRight
- TopCenter, BottomCenter, LeftCenter, RightCenter
        `;

        Imgui_chunchun.CreateTextWindow("shortcut-info", "Shortcut System Info", infoText);
    }
}


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    var Short = IMGUIDebugButton.AddCategory("Short")
    IMGUIDebugButton.AddButtonToCategory(Short, "Open Short DEbug Window", () => {
        UIShortcutDebug.ToggleDebugWindow();
    })


})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.LayoutName !== "Level") return
    var PlayerMovementHintGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomLeft)
    UIShortcut.CreateShortLittleGroup(PlayerMovementHintGroup).setShort("W")
        .setShort("S")
        .setShort("D")
        .setShort("A")
        .AddDescribe("Move");


    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_
    .addEventListener("beforeanylayoutend",()=>{
        UIShortcut.ClearAllGroups();
    })
})