# UIBubble - Dialog Bubble System

A comprehensive dialog bubble system for displaying text messages with various styles and animations.

## Features

- **Auto-sizing**: Bubbles automatically adjust size based on content length
- **Multiple Types**: Speech, thought, info, warning, and system bubbles
- **Animations**: Smooth fade-in and fade-out animations
- **Method Chaining**: Fluent API for easy configuration
- **Auto-destroy**: Automatic cleanup after specified duration
- **Customizable**: Colors, size, position, and content can be modified

## Basic Usage

```typescript
import { UIBubble, BubbleType } from "./UIBubble.js";

// Simple speech bubble
UIBubble.ShowBubble("Hello World!", 3, BubbleType.SPEECH);

// Thought bubble with custom position
UIBubble.ShowBubble("I'm thinking...", 4, BubbleType.THOUGHT)
    .setPosition(100, 200);

// Info bubble with custom size and colors
UIBubble.ShowBubble("Important information", 5, BubbleType.INFO)
    .setSize(250, 100)
    .setColors("#0066cc", "#004499", "#ffffff");
```

## Bubble Types

- `BubbleType.SPEECH` - Regular speech bubble with tail
- `BubbleType.THOUGHT` - Cloud-like thought bubble with dots
- `BubbleType.INFO` - Information bubble (no tail)
- `BubbleType.WARNING` - Warning/alert bubble (no tail)
- `BubbleType.SYSTEM` - System message bubble (no tail)

## Method Chaining

```typescript
UIBubble.ShowBubble("Long message that will auto-size", 6)
    .setPosition(playerX, playerY - 100)
    .setSize(300, 120)  // Override auto-sizing
    .setColors("#ff6b6b", "#cc0000", "#ffffff")
    .extendDuration(2); // Add 2 more seconds
```

## Static Methods

- `UIBubble.ShowBubble(content, duration, type, id?)` - Create new bubble
- `UIBubble.GetBubble(id)` - Get bubble by ID
- `UIBubble.DestroyAllBubbles()` - Destroy all active bubbles
- `UIBubble.GetBubbleInfo()` - Get info about active bubbles
- `UIBubble.SetAnimationDurations(fadeIn, fadeOut)` - Set animation timings

## Instance Methods

- `.setPosition(x, y)` - Set bubble position
- `.setSize(width, height)` - Set bubble size (overrides auto-sizing)
- `.setColors(bg, border, text)` - Set bubble colors
- `.setContent(newContent)` - Update bubble content
- `.extendDuration(seconds)` - Extend display duration
- `.destroy()` - Destroy bubble immediately

## Auto-sizing Logic

The system automatically calculates bubble size based on:
- Content length (longer text = larger bubble)
- Bubble type (some types are naturally larger)
- Maximum size limits to prevent oversized bubbles

## Animation System

- **Fade-in**: Scale from 0.8 to 1.0 with upward movement
- **Fade-out**: Scale to 0.8 with downward movement
- **Duration**: Configurable via `SetAnimationDurations()`
- **Default**: 300ms fade-in, 500ms fade-out

## Integration with Game Objects

```typescript
// Show bubble above player
const player = runtime.objects.RedHairGirlSprite.getFirstInstance();
if (player) {
    UIBubble.ShowBubble("Player says something", 3)
        .setPosition(player.x, player.y - 100);
}
```

## Error Handling

The system gracefully handles errors:
- Falls back to console-only mode if HTML_c3 object is unavailable
- Provides detailed error logging
- Continues operation even if individual bubbles fail

## Performance Notes

- Bubbles are automatically cleaned up after their duration expires
- Use `DestroyAllBubbles()` for immediate cleanup
- HTML elements are properly destroyed to prevent memory leaks
- Animation uses CSS transitions for smooth performance 