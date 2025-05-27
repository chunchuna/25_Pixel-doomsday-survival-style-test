# PIXEffect_fog - C3 Engine Fog Effect System

A comprehensive fog effect system for Construct 3 engine that creates realistic, animated fog using HTML components.

## Features

- **Multiple Fog Types**: Persistent and temporary fog effects
- **Visual Styles**: Light, Medium, Heavy, Mystical, and Toxic fog presets
- **Chainable Configuration**: Fluent API for easy parameter setting
- **Real-time Animation**: Smooth particle movement with flow patterns
- **Layer Support**: Multiple fog layers for depth effects
- **Auto-destruction**: Temporary fog with configurable duration

## Basic Usage

### Import the System
```typescript
import { PIXEffect_fog, FogType, FogStyle } from "./PIXEffect_fog.js";
```

### Generate Basic Fog
```typescript
// Create temporary light fog for 10 seconds
PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.LIGHT, 10);

// Create persistent heavy fog
PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.HEAVY);
```

### Chainable Configuration
```typescript
PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MEDIUM, 15)
    .setPosition(100, 200)           // Set fog position
    .setSize(800, 600)              // Set HTML component size
    .setScale(2.0)                  // Set fog particle scale
    .setSpeed(1.5)                  // Set movement speed
    .setOpacity(0.7)                // Set fog opacity
    .setColor("#9c27b0")            // Set fog color
    .setDensity(1.2)                // Set particle density
    .setLayers(4)                   // Set number of layers
    .setLayer("html_c3");           // Set HTML layer
```

## API Reference

### Static Methods

#### `GenerateFog(type, style?, duration?, id?)`
Creates a new fog effect instance.

**Parameters:**
- `type`: `FogType.PERSISTENT` or `FogType.TEMPORARY`
- `style`: Visual style (default: `FogStyle.MEDIUM`)
- `duration`: Duration in seconds for temporary fog (default: 0)
- `id`: Optional unique identifier

**Returns:** `PIXEffect_fog` instance

#### `GetFog(id)`
Retrieves a fog instance by ID.

#### `DestroyAllFog()`
Destroys all active fog effects.

#### `GetFogInfo()`
Returns information about active fog effects.

### Instance Methods (Chainable)

#### `setPosition(x, y)`
Sets the fog effect position.

#### `setSize(width, height)`
Sets the HTML component size (not fog scale).

#### `setScale(scale)`
Sets the fog particle scale multiplier.

#### `setSpeed(speed)`
Sets the fog movement speed multiplier.

#### `setOpacity(opacity)`
Sets the fog opacity (0-1).

#### `setColor(color)`
Sets the fog color (hex string).

#### `setDensity(density)`
Sets the particle density multiplier.

#### `setLayers(layers)`
Sets the number of fog layers (1-5).

#### `setLayer(layer)`
Sets the HTML layer name.

#### `destroy()`
Manually destroys the fog effect.

## Fog Types

### `FogType.PERSISTENT`
- Fog that stays until manually destroyed
- Use for environmental effects
- No auto-destruction timer

### `FogType.TEMPORARY`
- Fog that auto-destroys after specified duration
- Use for spell effects, explosions, etc.
- Configurable duration in seconds

## Fog Styles

### `FogStyle.LIGHT`
- Density: 0.3, Speed: 0.5, Scale: 1.0
- Opacity: 0.3, Layers: 2
- Best for: Subtle atmospheric effects

### `FogStyle.MEDIUM`
- Density: 0.8, Speed: 1.0, Scale: 1.5
- Opacity: 0.6, Layers: 3
- Best for: General fog effects

### `FogStyle.HEAVY`
- Density: 1.5, Speed: 0.8, Scale: 2.0
- Opacity: 0.8, Layers: 4
- Best for: Dense fog, obscuring vision

### `FogStyle.MYSTICAL`
- Density: 1.0, Speed: 0.6, Scale: 1.8
- Opacity: 0.7, Layers: 4, Color: Purple
- Best for: Magical effects

### `FogStyle.TOXIC`
- Density: 1.2, Speed: 0.4, Scale: 1.6
- Opacity: 0.8, Layers: 3, Color: Green
- Best for: Poison clouds, dangerous areas

## Examples

### Environmental Fog
```typescript
// Create persistent background fog
PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.LIGHT)
    .setPosition(0, 0)
    .setSize(1920, 1080)
    .setOpacity(0.3)
    .setSpeed(0.5);
```

### Spell Effect
```typescript
// Create magical fog around player
const player = getPlayerInstance();
PIXEffect_fog.GenerateFog(FogType.TEMPORARY, FogStyle.MYSTICAL, 8)
    .setPosition(player.x - 200, player.y - 200)
    .setSize(400, 400)
    .setScale(1.5)
    .setColor("#9c27b0");
```

### Danger Zone
```typescript
// Create toxic fog in danger area
PIXEffect_fog.GenerateFog(FogType.PERSISTENT, FogStyle.TOXIC, 0, "danger_zone")
    .setPosition(dangerX, dangerY)
    .setSize(500, 500)
    .setOpacity(0.8)
    .setDensity(1.5);
```

## Performance Notes

- Fog effects use HTML components with CSS animations
- Particle count scales with density and component size
- Multiple fog instances can impact performance
- Use `DestroyAllFog()` to clean up when needed
- Consider using lower density for background fog

## Testing

Use the test file `PIXEffect_fog_test.ts` to experiment with different fog configurations through debug buttons. 