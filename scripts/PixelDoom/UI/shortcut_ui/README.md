# Shortcut UI System

A comprehensive keyboard shortcut hint system for displaying key bindings and controls to players.

## Features

- **Position-based Groups**: Place shortcut hints at 8 different screen positions
- **Little Groups**: Group related keys together with descriptions
- **Single Shortcuts**: Individual key-description pairs
- **Customizable Styling**: Modern, semi-transparent design with 3D key effects
- **Dynamic Management**: Show, hide, and remove groups at runtime

## Basic Usage

### 1. Create a Shortcut Group

```typescript
import { UIShortcut, ShortPosition } from "./UIShortcut.js";

// Create a group in the bottom right corner
const playerMovementGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
```

### 2. Add Little Groups (Multiple Keys with One Description)

```typescript
// Create a little group for movement keys
UIShortcut.CreateShortLittleGroup(playerMovementGroup)
    .setShort("W")
    .setShort("S") 
    .setShort("D")
    .setShort("A")
    .AddDescribe("Player Move");
```

### 3. Add Single Shortcuts

```typescript
// Create individual shortcuts
const inventoryGroup = UIShortcut.CreateShortGroup(ShortPosition.TopRight);
UIShortcut.CreateShort(inventoryGroup, "TAB", "Open Inventory");
UIShortcut.CreateShort(inventoryGroup, "I", "Item Details");
```

## Available Positions

- `ShortPosition.TopLeft`
- `ShortPosition.TopRight`
- `ShortPosition.BottomLeft`
- `ShortPosition.BottomRight`
- `ShortPosition.TopCenter`
- `ShortPosition.BottomCenter`
- `ShortPosition.LeftCenter`
- `ShortPosition.RightCenter`

## Group Management

### Hide/Show Groups
```typescript
UIShortcut.HideShortGroup(group);
UIShortcut.ShowShortGroup(group);
```

### Remove Groups
```typescript
UIShortcut.RemoveShortGroup(group);
```

### Clear All Groups
```typescript
UIShortcut.ClearAllGroups();
```

## Complete Example

```typescript
// Player movement hints
const playerMovementGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomRight);
UIShortcut.CreateShortLittleGroup(playerMovementGroup)
    .setShort("W")
    .setShort("S")
    .setShort("D")
    .setShort("A")
    .AddDescribe("Player Move");

// Inventory shortcuts
const inventoryGroup = UIShortcut.CreateShortGroup(ShortPosition.TopRight);
UIShortcut.CreateShort(inventoryGroup, "TAB", "Open Inventory");
UIShortcut.CreateShort(inventoryGroup, "I", "Item Details");

// Combat shortcuts
const combatGroup = UIShortcut.CreateShortGroup(ShortPosition.BottomLeft);
UIShortcut.CreateShortLittleGroup(combatGroup)
    .setShort("LMB")
    .setShort("RMB")
    .AddDescribe("Attack");
UIShortcut.CreateShort(combatGroup, "SPACE", "Dodge");
```

## Testing and Debugging

Use the debug tools to test the system:

```typescript
import { UIShortcutDebug } from "./UIShortcutDebug.js";

// Show debug window
UIShortcutDebug.ShowDebugWindow();

// Show system information
UIShortcutDebug.ShowShortcutInfo();

// Create custom shortcut dialog
UIShortcutDebug.ShowCustomShortcutDialog();
```

## Styling

The system automatically applies modern styling with:
- Semi-transparent black backgrounds
- 3D key button effects
- Hover animations
- Responsive positioning
- Backdrop blur effects

Keys are displayed as realistic keyboard buttons with:
- Gradient backgrounds
- Border shadows
- Inset highlights
- Monospace font
- Uppercase text

## Notes

- All groups are automatically positioned and sized
- The system is responsive to window resizing
- Groups have a maximum width to prevent overflow
- Key icons support any text (including special keys like "LMB", "SPACE", etc.)
- The system uses fixed positioning to stay on screen during gameplay 