# Pixel Doomsday Survival Game

A pixel-art survival game built with Construct 3, featuring doomsday/post-apocalyptic themes with a focus on atmospheric storytelling and survival mechanics.

## Tech Stack & Architecture

### Game Engine & Development Environment
- **Construct 3**: The core game engine powering this project
- **TypeScript**: Used for extending Construct 3's functionality with custom scripting

### Custom Framework
This game uses a custom TypeScript-based framework called `pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit` that provides:
- Game state management
- Event handling system
- Utility functions for game development
- Runtime integration with Construct 3

## Debugging Tools

The game includes several advanced debugging tools built with custom ImGui implementation:

### In-Game Console
A powerful in-game console built with ImGui for runtime debugging and command execution.

- **Features**:
  - Console output capture (logs, warnings, errors)
  - Timestamp display
  - Colorful message formatting
  - Scrollable message history
  - Resizable window interface

#### Advanced Console Features

The in-game console implements a sophisticated log interception system that captures all browser console output and redirects it to the in-game UI:

- **Method Overriding**: The system overrides native `console.log`, `console.warn`, `console.error`, and other methods to intercept all messages
- **Source Tracking**: Each message includes a highlighted source indicator showing which script generated the log:
  ```
  [UIDialogue.js] [12:45:23] Dialogue system initialized
  ```
- **Stack Trace Analysis**: The console automatically extracts the source file and line number from JavaScript error stacks, providing accurate attribution for each message
- **Color Coding**: Different message types (log, warning, error) use distinct background colors for rapid visual identification
- **Message Grouping**: Random color grouping option allows multiple related messages to share the same color for easier correlation
- **Performance Optimization**: Advanced DOM rendering techniques ensure that even with thousands of log messages, performance remains stable
- **Custom Font Rendering**: Monospace font with adjustable size ensures optimal readability of debug information
- **Persistence Across Scenes**: Console content persists across scene transitions, allowing tracking of initialization sequences
- **Copy Support**: Right-clicking messages allows copying content to the clipboard for external analysis
- **Translucent Backplate**: Adjustable opacity background ensures console visibility without completely obscuring game elements

**Code Example - Console Usage:**
```typescript
// Capture is automatic for all console methods
console.log("Player position updated", player.position);
console.warn("Low ammunition", player.ammo);
console.error("Failed to load asset", assetId);

// Access console programmatically
UIConsole.Clear();  // Clear console
UIConsole.SetShowTimestamps(true);  // Configure timestamp display
UIConsole.SetUseRandomColors(true); // Enable color grouping
```

### Variable Monitoring
A real-time variable monitoring system for tracking game state.

- **Activation**: Press 'n' to toggle the variable monitoring panel
- **Features**:
  - Real-time display of registered variables
  - Expandable object properties
  - Value type identification
  - Source file tracking
  - Detail view for complex objects
  - Categorized variable organization

**Usage Examples:**
```typescript
// Add a value to monitor
VariableMonitoring.AddValue("playerPosition", player.position, "Player");

// Remove a monitored value
VariableMonitoring.RemoveValue("playerPosition");

// Clear all monitored values
VariableMonitoring.ClearAll();
```

### Debug Button Panel
A customizable panel of debug buttons for triggering in-game actions and tests.

- **Activation**: Press 'm' to toggle the debug button panel
- **Features**:
  - Categorized button organization
  - Color-coded buttons
  - Tooltip support
  - Nested category structure
  - Collapsible categories

**Usage Examples:**
```typescript
// Add a basic button
IMGUIDebugButton.AddButton("Spawn Enemy", () => {
    // Spawn enemy code here
});

// Add a category
const categoryId = IMGUIDebugButton.AddCategory("Weather");

// Add a button to a category
IMGUIDebugButton.AddButtonToCategory(categoryId, "Toggle Rain", () => {
    // Toggle rain code
});

// Add a color-coded button
IMGUIDebugButton.AddColorButton("Emergency Reset", [1.0, 0.0, 0.0, 1.0], () => {
    // Reset code
});
```

### Comprehensive Debug UI
A main debug interface that combines various debugging tools:

- **Features**:
  - Variable monitoring with reference tracking
  - Dynamic value updates
  - Expandable object inspection
  - Console output capture
  - Custom font support
  - Draggable windows
  - Customizable appearance

**Usage Examples:**
```typescript
// Initialize debug UI with toggle key
DEBUG.DebugMainUI = UIDebug.InitDebugPanel('m');

// Add a variable to monitor
DEBUG.DebugMainUI.AddValue(someVariable);

// Track a variable by reference (updates automatically)
DEBUG.DebugMainUI.AddValueByReference(() => player.health, 'Player Health');

// Add a debug button
DEBUG.DebugMainUI.DebuPanelAddButton("Test Function", () => {
    // Test code here
});
```

## Dialogue System

The game features a sophisticated dialogue system that enables rich narrative experiences with branching conversations, choices, and scriptable events.

### Core Features

- **Typewriter Text Effect**: Text appears letter by letter for a cinematic feel
- **Dialogue Positioning**: Support for left and right-aligned dialogue to distinguish speakers
- **Character Attribution**: Dialogue can be attributed to specific characters
- **Branching Choices**: Player can select from multiple dialogue options
- **Nested Conversations**: Support for multi-level dialogue trees
- **Code Execution**: Run custom code from dialogue via special tags
- **Draggable Interface**: Dialogue window can be repositioned and resized
- **Keyboard Shortcuts**: Space to skip typewriter effect, click or key to advance

### Dialogue Script Format

The dialogue system uses a simple but powerful scripting format:

```
position->text content
position->choose:choice text
    position->response text for this choice
    position->another response line
position->continue
```

Where:
- `position`: Can be `left` or `right` to determine text alignment
- `text content`: The actual dialogue text to display
- `choose:choice text`: Defines a choice the player can select
- Indented lines after a choice are displayed when that choice is selected
- `continue`: Signals the end of a choice branch, returning to main dialogue flow

### Code Execution in Dialogue

You can trigger custom TypeScript functions from dialogue using the `[code-(function_call())]` syntax:

```
left->Should we proceed? [code-(triggerEvent('door_open'))]
```

### Example Dialogue Script

```
左->篝火余烬中飘起一缕青烟
右->（蹲下捻动炭灰）这堆火最多半小时前还有人...
左->choose:拨开灰烬检查
    右->（金属反光）烧烤架底下压着半块没烧完的薯片包装
    左->包装袋边缘沾着暗红色痕迹
右->（用树枝挑起）番茄酱？还是...血迹？
左->continue
左->北面斜坡传来乌鸦刺耳的叫声
```

### Usage in Code

To display a dialogue in game:

```typescript
// Define dialogue content
const dialogueContent = `
左->你好，旅行者。
右->你是谁？为什么在这里？
左->choose:友好回应
    右->我是向导，来帮助你的。
左->choose:警惕询问
    右->这不重要，你需要离开这里。
`;

// Show the dialogue
DialogueMainController.ShowDialogue(dialogueContent);
```

To handle dialogue flow between different scripts:

```typescript
async function switchToNextDialogue() {
    // Close current dialogue
    DialogueMainController.CloseDialogue();
    
    // Wait for animation to complete
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(0.5);
    
    // Show next dialogue
    DialogueMainController.ShowDialogue(NEXT_DIALOGUE_CONTENT);
}
```

### Integration with Game Events

The dialogue system integrates with the game's event system to trigger gameplay changes:

- Opening/closing inventory
- Starting/ending cutscenes
- Modifying character states
- Updating quest progress
- Triggering environmental changes

This creates a seamless connection between narrative and gameplay mechanics.

## Inventory System

The game features a robust and flexible inventory system with support for multiple inventory types, item management, and intuitive drag-and-drop interactions.

### Core Features

- **Dual Inventory Structure**: Main player inventory and temporary/contextual "other" inventories
- **Item Quality Tiers**: Support for item rarity/quality classification (S, A+, A, B, C, D, E, etc.)
- **Drag and Drop Interface**: Intuitive item movement between inventories
- **Serialization**: Support for saving/loading inventory states
- **Grid and Oneline Modes**: Multiple display modes for different contexts
- **Automatic Item Stacking**: Similar items automatically stack together
- **Item Tooltips**: Detailed item information on hover
- **Quick Pickup Feature**: Optional automatic item acquisition
- **Customizable Layout**: Resizable and draggable inventory windows
- **Visual Feedback**: Animations and effects for item interactions

### Main vs Other Inventories

The inventory system distinguishes between two inventory types:

#### Main Inventory
- **Purpose**: Represents the player's persistent inventory
- **Persistence**: Remains bound across game sessions and scenes
- **Access**: Toggled with a configurable hotkey (default 'i')
- **Features**:
  - Automatic state synchronization with game data
  - Support for serialization/deserialization
  - Main inventory callback system for UI updates
  - Sorted display by item quality

#### Other Inventories
- **Purpose**: Represents temporary or contextual inventories (containers, shops, NPCs)
- **Persistence**: Temporary, exists only during specific interactions
- **Access**: Opened and closed via script calls
- **Features**:
  - Can be linked to source objects for data updates
  - Custom naming support
  - Independent of main inventory state
  - Reference-based updating for dynamic content

### Item Structure

Items are defined using a simple interface:

```typescript
interface Item {
    itemName: string;      // Name of the item
    itemDescribe: string;  // Description text
    itemLevel: ItemLevel;  // Quality tier
}

enum ItemLevel {
    Top = "TOP",    // Highest tier
    S = "S",        // Extremely rare
    APlus = "A+",   // Very rare
    A = "A",        // Rare
    B = "B",        // Uncommon
    C = "C",        // Common
    D = "D",        // Basic
    E = "E",        // Low quality
    Low = "LOW",    // Poor quality
    Break = "BREAK" // Broken/useless
}
```

### Usage in Code

#### Main Inventory Management

```typescript
// Creating a player inventory
const playerItems: Item[] = [
    { itemName: "Medkit", itemDescribe: "Restores health points", itemLevel: ItemLevel.A },
    { itemName: "Pistol", itemDescribe: "Standard handgun", itemLevel: ItemLevel.C },
    { itemName: "Ammo", itemDescribe: "Ammunition for weapons", itemLevel: ItemLevel.B }
];

// Bind the main player inventory (4 rows x 6 columns, toggled with 'i' key)
const { unbind, oneline } = BindPlayerMainInventory(playerItems, 4, 6, "i");

// Switch to oneline mode (compact display)
oneline();

// Register update callback for when inventory changes
inventoryManager.SetMainInventoryUpdateCallback({
    updateMethod: (items: Item[]) => {
        // Update game state with new items
        console.log("Inventory updated:", items.length, "items");
    }
});

// Later, unbind inventory when needed
unbind();
```

#### Other Inventory Management

```typescript
// Create a container inventory
const containerItems: Item[] = [
    { itemName: "Rusty Key", itemDescribe: "Opens an old door", itemLevel: ItemLevel.B },
    { itemName: "Notes", itemDescribe: "Torn paper with writing", itemLevel: ItemLevel.D }
];

// Reference to container object for updates
const containerInstance = someContainerObject;

// Show the container inventory
const { close, oneline } = ShowOtherInventory(
    containerItems,
    2, // rows
    3, // columns
    {
        // Update callback configuration
        instance: containerInstance,
        updateMethod: (instance, items) => {
            // Update container contents when inventory changes
            instance.contents = items;
        }
    },
    "Abandoned Locker" // Custom inventory name
);

// Later, close the inventory
close();
```

#### Saving and Loading Inventories

```typescript
// Serialize inventory to string (for saving to storage)
const serializedData = SerializeInventory(playerItems, 4, 6);
localStorage.setItem('playerInventory', serializedData);

// Later, deserialize from storage
const savedData = localStorage.getItem('playerInventory');
if (savedData) {
    const { inventory, rows, columns } = DeserializeInventory(savedData);
    // Restore player inventory
    BindPlayerMainInventory(inventory, rows, columns, "i");
}
```

#### Event Handling

```typescript
// Register callbacks for inventory events
OnMainInventoryOpen(() => {
    // Pause game or trigger other actions when inventory opens
    GameState.setPaused(true);
});

OnMainInventoryClose(() => {
    // Resume game when inventory closes
    GameState.setPaused(false);
});

// Toggle quick pickup feature
EnableQuickPickup(true); // Enable automatic item acquisition
```

### Custom Inventory Implementation

To implement a custom inventory with special behavior:

```typescript
class SpecializedInventory {
    private items: Item[] = [];
    private inventoryOpen: boolean = false;
    private closeFunction: (() => void) | null = null;
    
    constructor(initialItems: Item[]) {
        this.items = initialItems;
    }
    
    public open() {
        // Show specialized inventory with custom layout
        const { close } = ShowOtherInventory(
            this.items,
            3, // rows
            4, // columns
            {
                instance: this,
                updateMethod: (instance, items) => {
                    instance.items = items;
                    // Custom logic for special items
                    this.processSpecialItems(items);
                }
            },
            "Special Equipment"
        );
        
        this.closeFunction = close;
        this.inventoryOpen = true;
    }
    
    public close() {
        if (this.closeFunction) {
            this.closeFunction();
            this.inventoryOpen = false;
        }
    }
    
    private processSpecialItems(items: Item[]) {
        // Custom logic for handling special items
        const rarityCount = items.filter(item => 
            item.itemLevel === ItemLevel.S || 
            item.itemLevel === ItemLevel.APlus
        ).length;
        
        // Trigger special effects based on inventory content
        if (rarityCount >= 3) {
            GameEvents.trigger('rare_collection_complete');
        }
    }
}
```

This inventory system provides a flexible foundation for item management while maintaining a clean separation between persistent player inventory and contextual object inventories.

## Project Structure
- `/scripts`: Contains TypeScript code
  - `/PixelDoom`: Main game codebase
    - `/Global`: Global definitions and constants
    - `/Module`: Core game systems
    - `/Group`: Grouped functionality
    - `/UI`: User interface components
- `/layouts`: Construct 3 layouts for different game screens
- `/objectTypes`: Object definitions
- `/eventSheets`: Construct 3 event sheets
- `/images`: Game graphics
- `/sounds`: Audio assets

## Development
This project is being developed as a pixel-art survival game with procedural storytelling elements. The combination of Construct 3's visual development environment with TypeScript extensions allows for a flexible and powerful game development workflow.

## Credits
Built with Construct 3 and various addons including:
- In-Game Console by Mixon Games
- Better Outline effect by skymen
