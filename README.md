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

### Key Modules

#### Character System
- Character controller with WASD movement
- Animation system for breathing and movement
- Character audio for footsteps and interactions

#### Environment
- Weather system with rain effects
- Ambient lighting system for day/night cycles
- Y-sorting for depth management of game objects

#### Interaction System
- Clickable object system for environmental interactions
- Interactive UI panels for player choices
- Dialogue system with subtitles

#### UI Framework
- Custom UI system built with imgui for debugging
- Window management system
- Inventory interface
- Dialogue and subtitle system
- Screen effects for visual feedback

### Game Features
- Pixel art visual style
- Character movement and interaction
- Environmental storytelling
- Dynamic weather effects
- Inventory system
- Dialogue system

## Debugging Tools

The game includes several advanced debugging tools built with custom ImGui implementation:

### In-Game Console
A powerful in-game console built with ImGui for runtime debugging and command execution.

- **Activation**: Press the backtick key (`) to toggle the console window
- **Features**:
  - Console output capture (logs, warnings, errors)
  - Command input support
  - Timestamp display
  - Colorful message formatting
  - Scrollable message history
  - Resizable window interface

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
