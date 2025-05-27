# ImGui 中文字体使用指南

## 当前超安全模式

由于WebAssembly版本的ImGui存在严重的内存访问问题，我们采用了超安全模式：

### ✅ 当前实现（超安全）
- **仅使用ImGui默认字体**：不加载任何自定义字体
- **禁用所有按钮**：避免Button相关的内存错误
- **仅使用文本渲染**：Text() 和 Separator() 操作
- **最小化功能**：专注于最基本的稳定显示

### 🔧 安全操作列表
```typescript
// ✅ 安全的操作
ImGui.Text("文本内容");           // 安全
ImGui.Separator();              // 安全
ImGui.Begin() / ImGui.End();    // 安全

// ❌ 已禁用的操作（会导致内存错误）
// ImGui.Button("按钮");         // 禁用 - 内存访问错误
// ImGui.TextColored();          // 禁用 - 参数格式问题
// 自定义字体加载                 // 禁用 - OOM错误
// 字体推入/弹出                 // 禁用 - 内存访问错误
```

### 📋 当前限制
1. **只能显示文本**：无法使用按钮、输入框等交互元素
2. **只有默认字体**：中文可能显示为方块
3. **基本布局**：只能使用文本和分隔符
4. **窗口控制**：只能使用窗口标题栏的关闭按钮

### 🎯 适用场景
- **信息显示**：显示状态、日志、提示信息
- **调试输出**：显示变量值、系统状态
- **简单UI**：不需要交互的信息面板

## ⚠️ 特别警告：大型CJK字体文件

**请勿使用完整的CJK字体文件！**

以下字体文件会导致OOM错误：
- `NotoSansCJK-Regular.otf` (约15-20MB)
- `SourceHanSans-Regular.otf` (约15-20MB)
- 任何完整的中日韩字体文件

### 安全的字体选择
✅ **推荐使用**：
- `Roboto-Medium.ttf` (约160KB) - 用于测试
- 经过子集化的中文字体 (<5MB)
- ImGui默认字体

❌ **避免使用**：
- 完整的CJK字体文件 (>10MB)
- 未经优化的中文字体
- .otf格式的大型字体文件

## 重要提示：WebAssembly 内存限制

⚠️ **ImGui WebAssembly 版本有内存限制！**

ImGui 的 WebAssembly 模块默认内存限制约为 2GB。加载大型中文字体文件（如完整的 CJK 字体）可能会导致 OOM（内存不足）错误：

```
RuntimeError: abort(OOM). Build with -s ASSERTIONS=1 for more info.
```

### 解决方案

1. **使用小型字体文件**（推荐）
   - 使用字体子集化工具减小字体文件大小
   - 选择专门为 Web 优化的字体
   - 避免使用超过 10MB 的字体文件

2. **使用我们提供的安全加载方法**
   ```typescript
   // 最安全的方法：只加载基本字符
   await Imgui_chunchun.LoadBasicFont('Font/YourFont.ttf', 16);
   
   // 加载自定义字符集
   const chars = "Hello World 你好世界 123456789";
   await Imgui_chunchun.LoadFontWithCustomChars('Font/YourFont.ttf', 16, chars);
   
   // 使用默认字体（最可靠）
   Imgui_chunchun.InitializeWithDefaultFont();
   ```

3. **字体文件建议**
   - 使用 Noto Sans CJK 的 Web 子集版本
   - 考虑使用 Google Fonts 的 Web 字体
   - 使用字体压缩工具（如 fonttools）

## 概述

我们提供了一个完整的字体管理系统，支持多种中文字体加载方式：

1. **基本字体加载** - 只加载 ASCII 字符（最安全）
2. **自定义字符集** - 只加载指定的字符
3. **默认字体** - 使用 ImGui 内置字体（最可靠）
4. **中文字体加载** - 加载常用中文字符集（需要小型字体文件）

## 快速开始（安全方法）

### 1. 初始化ImGui
```typescript
import { Imgui_chunchun } from "./imgui_lib/imgui.js";

// 初始化ImGui（使用默认字体）
await Imgui_chunchun.Initialize();
```

### 2. 使用默认字体渲染
```typescript
// 所有文本都使用默认字体 - 安全且稳定
function renderUI() {
    ImGui.Text("Hello World");
    ImGui.Text("这是文本");  // 中文可能显示为方块，但系统稳定
    ImGui.Button("按钮");
    
    // 不需要字体推入/弹出操作
    // 所有内容都使用默认字体
}
```

### 3. 运行示例
```typescript
import { ChineseFontExample } from "./imgui_lib/ChineseFontExample.js";

// 显示安全的示例窗口
await ChineseFontExample.Initialize();
ChineseFontExample.ShowExampleWindow();
```

## 原始文档（参考用）

以下是原始的字体加载文档，仅供参考。**当前版本为了稳定性已禁用这些功能**。

### 1. 准备字体文件

**重要：确保字体文件小于 10MB！**

推荐的字体选择：
- **Noto Sans CJK Web** - Google 的 Web 优化版本
- **Source Han Sans Subset** - Adobe 的子集版本
- **任何经过子集化的中文字体**

将字体文件放在 `files/Font/` 目录下：
```
files/Font/NotoSansCJK-Regular-Subset.ttf  (< 10MB)
```

### 2. 安全的使用方法

```typescript
import { Imgui_chunchun } from "./imgui_lib/imgui.js";

// 初始化 ImGui
await Imgui_chunchun.Initialize();

// 方法 1：使用基本字体（推荐用于测试）
await Imgui_chunchun.LoadBasicFont('Font/Roboto-Medium.ttf', 16);

// 方法 2：使用自定义字符集（推荐用于生产）
const myChars = "Hello World 你好世界 常用汉字";
await Imgui_chunchun.LoadFontWithCustomChars('Font/MyFont.ttf', 16, myChars);

// 方法 3：使用默认字体（最安全）
Imgui_chunchun.InitializeWithDefaultFont();

// 在渲染中文文本时使用
function renderChineseText() {
    // 推入字体
    Imgui_chunchun.PushChineseFont();
    
    ImGui.Text("Hello World");
    ImGui.Text("你好世界");  // 需要字体支持中文
    
    // 弹出字体
    Imgui_chunchun.PopFont();
}
```

### 3. 字体子集化（推荐）

如果你需要中文支持，建议使用字体子集化工具：

```bash
# 使用 fonttools 创建字体子集
pip install fonttools
pyftsubset NotoSansCJK-Regular.ttf \
    --text="你好世界常用汉字ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" \
    --output-file=NotoSansCJK-Subset.ttf
```

## API 参考

### 基本方法

```typescript
// 初始化（必须先调用）
await Imgui_chunchun.Initialize();

// 加载基本字体（ASCII 字符）
await Imgui_chunchun.LoadBasicFont(fontPath: string, fontSize: number);

// 加载自定义字符集
await Imgui_chunchun.LoadFontWithCustomChars(fontPath: string, fontSize: number, characters: string);

// 使用默认字体
Imgui_chunchun.InitializeWithDefaultFont();

// 字体状态检查
const isLoaded = Imgui_chunchun.IsChineseFontLoaded();
```

### 渲染方法

```typescript
// 推入字体
Imgui_chunchun.PushChineseFont();

// 渲染文本
ImGui.Text("Your text here");

// 弹出字体
Imgui_chunchun.PopFont();
```

## 使用示例

### 示例 1：基本使用

```typescript
import { ChineseFontExample } from "./imgui_lib/ChineseFontExample.js";

// 初始化并显示示例
await ChineseFontExample.Initialize();
ChineseFontExample.ShowExampleWindow();
```

### 示例 2：自定义字符集

```typescript
// 定义你需要的字符
const gameText = "开始游戏 设置 退出 生命值 魔法值 经验值";
const uiText = "确定 取消 保存 加载";
const allChars = gameText + uiText + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// 加载字体
await Imgui_chunchun.LoadFontWithCustomChars('Font/GameFont.ttf', 16, allChars);
```

### 示例 3：错误处理

```typescript
try {
    await Imgui_chunchun.LoadChineseFont('Font/LargeFont.ttf', 16);
} catch (error) {
    console.warn("Large font failed, falling back to basic font");
    await Imgui_chunchun.LoadBasicFont('Font/BasicFont.ttf', 16);
}
```

## 常见问题

### Q: 出现 "Cannot convert to long" 或 "memory access out of bounds" 错误？
A: 这些是字体范围格式和内存访问错误。我们已经修复了这些问题：
- 使用 ImGui 内置的字体范围而不是自定义格式
- 添加了安全的字体推入/弹出机制
- 改进了错误处理和后备方案

### Q: 出现 "RuntimeError: abort(OOM)" 错误？
A: 这是 WebAssembly 内存不足错误。解决方案：
- 使用更小的字体文件（<10MB）
- 使用 `LoadBasicFont()` 而不是 `LoadChineseFont()`
- 使用字体子集化工具
- 使用 `InitializeWithDefaultFont()` 作为后备方案

### Q: 中文字符显示为方块？
A: 确保已正确加载中文字体，并在渲染中文文本前调用 `PushChineseFont()`。

### Q: 字体文件加载失败？
A: 检查字体文件路径是否正确，确保文件存在于 `files/Font/` 目录下。

### Q: 如何减小字体文件大小？
A: 使用字体子集化工具，只包含你需要的字符：
```bash
pyftsubset font.ttf --text="你需要的字符" --output-file=subset.ttf
```

### Q: 出现 "Cannot set property FontDataOwnedByAtlas" 错误？
A: 这个问题已经在我们的 FontManager 中修复。如果你手动创建字体配置，请使用：
```typescript
const fontConfig = new ImGui.ImFontConfig();
fontConfig.internal.FontDataOwnedByAtlas = true;  // 正确方式
```

### Q: 如何测试字体加载是否正常？
A: 使用我们提供的测试工具：
```typescript
import { ChineseFontExample } from "./imgui_lib/ChineseFontExample.js";
await ChineseFontExample.Initialize();
ChineseFontExample.ShowExampleWindow();
```

## 性能建议

1. **字体文件大小**：保持在 10MB 以下
2. **字符集选择**：只加载需要的字符
3. **内存监控**：监控 WebAssembly 内存使用
4. **错误处理**：始终提供后备方案

## 技术细节

### WebAssembly 内存限制
- 默认限制：约 2GB
- 大型字体文件会导致 OOM
- 解决方案：使用字体子集化

### 字体加载策略
1. **LoadBasicFont**: 只加载 ASCII 字符
2. **LoadFontWithCustomChars**: 加载指定字符
3. **LoadChineseFont**: 加载常用中文字符（需要小字体文件）
4. **InitializeWithDefaultFont**: 使用内置字体（最安全）

### 内存优化
- 自动检测字体文件大小
- 超过 10MB 自动回退到默认字体
- 提供多种加载策略
- 错误时自动使用后备方案

## 推荐字体资源

1. **Noto Sans CJK**
   - 下载: [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+SC)
   - 特点: 开源免费，支持简体中文、繁体中文、日文、韩文

2. **Source Han Sans**
   - 下载: [Adobe Fonts](https://github.com/adobe-fonts/source-han-sans)
   - 特点: Adobe 开源字体，高质量渲染

3. **思源黑体**
   - 下载: [GitHub](https://github.com/adobe-fonts/source-han-sans)
   - 特点: Source Han Sans 的中文版本

记住：使用任何字体前请确认你有相应的使用授权。 