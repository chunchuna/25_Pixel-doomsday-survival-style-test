# DebugObjectRenderer 调试对象渲染器

这个模块提供了一个强大的调试工具，可以在Construct 3游戏中为任何对象实例绘制调试边框。

## 功能特性

- ✅ 为任何游戏对象实例绘制边框
- ✅ 自动识别对象的宽度和高度
- ✅ 支持自定义颜色（RGB/RGBA 或 十六进制）
- ✅ 支持自定义边框粗细
- ✅ 支持方法链式调用
- ✅ 持续渲染（每帧自动更新）
- ✅ 支持启用/禁用特定对象的调试框
- ✅ 多层支持（自动在所有层上渲染）
- ✅ **IMGUI调试界面** - 可视化调试控制面板

## 🎮 IMGUI调试界面

### 快速开始
按 **M** 键打开调试面板，在 **"Debug Renderer"** 分类中找到所有调试渲染器功能。

### 主要功能按钮

#### 🎯 基础操作
- **🎯 Debug Player** - 为玩家角色添加调试框
- **🔍 Debug All Visible Objects** - 为屏幕上所有可见对象添加调试框
- **📍 Debug Objects Near Player** - 为玩家附近的对象添加调试框

#### 🎨 颜色预设
- **🔴 Set Red Color** - 设置红色调试框
- **🟢 Set Green Color** - 设置绿色调试框
- **🔵 Set Blue Color** - 设置蓝色调试框
- **🟡 Set Yellow Color** - 设置黄色调试框
- **🟣 Set Purple Color** - 设置紫色调试框

#### 📏 粗细设置
- **📏 Thickness: 1px/3px/5px/10px** - 设置不同的边框粗细

#### 🎮 对象类型专用
- **🎮 Debug Clickable Objects** - 调试可点击对象（黄色）
- **🖼️ Debug UI Elements** - 调试UI元素（蓝色）
- **🏠 Debug Static Objects** - 调试静态对象（灰色）

#### 🌈 高级功能
- **🌈 Rainbow Debug Mode** - 彩虹模式，为不同对象类型使用不同颜色
- **📊 Show Debug Stats** - 显示调试统计信息
- **🔄 Refresh Object List** - 刷新可用对象类型列表

#### ⚡ 快速测试
- **⚡ Quick Test - Random Objects** - 随机选择5个对象进行调试
- **🎯 Quick Test - Mouse Position** - 调试鼠标位置附近的对象

#### 🛠️ 管理功能
- **⏸️ Toggle All Debug Boxes** - 切换所有调试框的显示状态
- **🗑️ Clear All Debug Boxes** - 清除所有调试框

### 使用示例
```typescript
// IMGUI界面会自动初始化，只需按M键打开调试面板
// 所有功能都可以通过按钮操作，无需编写代码
```

## 基本用法

### 1. 简单使用
```typescript
import { DebugObjectRenderer } from "./DebugObjectRenderer.js";

// 为某个实例绘制红色边框（默认颜色）
DebugObjectRenderer.RenderBoxtoInstance(someInstance);
```

### 2. 设置颜色
```typescript
// 使用 RGB 值设置颜色
DebugObjectRenderer
    .setColor(0, 1, 0, 1)  // 绿色，完全不透明
    .RenderBoxtoInstance(someInstance);

// 使用十六进制颜色
DebugObjectRenderer
    .setColorHex("#FF6B6B", 0.8)  // 浅红色，80% 不透明度
    .RenderBoxtoInstance(someInstance);
```

### 3. 设置边框粗细
```typescript
DebugObjectRenderer
    .setBoxThickness(5)  // 5像素粗细
    .RenderBoxtoInstance(someInstance);
```

### 4. 方法链式调用
```typescript
DebugObjectRenderer
    .setColor(1, 1, 0, 1)      // 黄色
    .setBoxThickness(3)         // 3像素粗细
    .RenderBoxtoInstance(someInstance)
    .update(someInstance, true); // 启用持续渲染
```

### 5. 控制渲染状态
```typescript
// 启用某个实例的调试框
DebugObjectRenderer.update(someInstance, true);

// 禁用某个实例的调试框
DebugObjectRenderer.update(someInstance, false);

// 移除某个实例的调试框
DebugObjectRenderer.removeDebugBox(someInstance);

// 清除所有调试框
DebugObjectRenderer.clearAll();
```

## 工作原理

### Construct 3 渲染系统
Construct 3 的渲染系统基于事件驱动：

1. **afterdraw 事件**: 在每个图层绘制完成后触发
2. **持续渲染**: 默认情况下，添加到 `afterdraw` 事件的绘制代码会每帧执行
3. **图层支持**: 系统自动检测所有图层并在相应图层上绘制调试框

### 渲染流程
```
游戏开始 → 初始化渲染器 → 监听所有图层的 afterdraw 事件
    ↓
每帧渲染 → 图层绘制完成 → 触发 afterdraw → 绘制调试框
```

### 关于持续渲染
**重要**: Construct 3 的 `afterdraw` 事件默认就是持续渲染的！

- ✅ 一旦添加调试框，它会每帧自动绘制
- ✅ `update()` 方法用于启用/禁用特定实例的渲染
- ✅ 不需要手动调用更新函数

## API 参考

### 主要方法

#### `RenderBoxtoInstance(instance: IWorldInstance)`
为指定实例添加调试边框
- **参数**: `instance` - 要绘制边框的游戏对象实例
- **返回**: `DebugObjectRenderer` - 支持链式调用

#### `setColor(r: number, g: number, b: number, a?: number)`
设置边框颜色（RGB/RGBA）
- **参数**: 
  - `r` - 红色分量 (0-1)
  - `g` - 绿色分量 (0-1) 
  - `b` - 蓝色分量 (0-1)
  - `a` - 透明度 (0-1，可选，默认1)
- **返回**: `DebugObjectRenderer` - 支持链式调用

#### `setColorHex(hex: string, a?: number)`
使用十六进制设置边框颜色
- **参数**:
  - `hex` - 十六进制颜色值 (如 "#FF0000")
  - `a` - 透明度 (0-1，可选，默认1)
- **返回**: `DebugObjectRenderer` - 支持链式调用

#### `setBoxThickness(thickness: number)`
设置边框粗细
- **参数**: `thickness` - 边框粗细（像素，最小值1）
- **返回**: `DebugObjectRenderer` - 支持链式调用

#### `update(instance: IWorldInstance, enable?: boolean)`
启用/禁用特定实例的调试框渲染
- **参数**:
  - `instance` - 目标实例
  - `enable` - 是否启用（默认true）
- **返回**: `DebugObjectRenderer` - 支持链式调用

### 工具方法

#### `removeDebugBox(instance: IWorldInstance)`
移除特定实例的调试框

#### `clearAll()`
清除所有调试框

#### `hasDebugBox(instance: IWorldInstance): boolean`
检查实例是否有调试框

#### `getDebugBoxCount(): number`
获取当前调试框数量

## 使用示例

查看 `DebugRendererExample.ts` 文件获取完整的使用示例，包括：
- 基本用法示例
- 颜色设置示例  
- 粗细设置示例
- 方法链式调用示例
- 批量操作示例

## 注意事项

1. **性能**: 调试框会每帧渲染，大量使用可能影响性能
2. **图层**: 调试框会在对象所在的图层上绘制
3. **坐标**: 边框基于对象的中心点和尺寸计算
4. **初始化**: 系统会自动初始化，无需手动调用

## 故障排除

### 调试框不显示
1. 确保对象实例存在且有效
2. 检查对象是否在当前可见的图层上
3. 确认调试框没有被禁用

### 颜色不正确
1. 确保颜色值在 0-1 范围内（RGB）
2. 检查十六进制颜色格式是否正确
3. 验证透明度设置

### 性能问题
1. 减少同时显示的调试框数量
2. 使用 `update(instance, false)` 临时禁用不需要的调试框
3. 定期调用 `clearAll()` 清理不需要的调试框 