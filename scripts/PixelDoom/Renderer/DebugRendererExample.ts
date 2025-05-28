import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { DebugObjectRenderer } from "./DebugObjectRenderer.js";

/**
 * Debug Renderer Example and Test Script
 * 调试渲染器示例和测试脚本
 */
export class DebugRendererExample {
    
    public static initialize(): void {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
            this.setupExamples();
        });
    }

    private static setupExamples(): void {
        console.log("[DebugRendererExample] Setting up examples and tests");
        
        // 延迟执行，确保游戏对象已经创建
        setTimeout(() => {
            this.runBasicTests();
        }, 3000);
    }

    /**
     * 运行基础测试
     */
    private static runBasicTests(): void {
        console.log("=== Running Basic Debug Renderer Tests ===");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        if (!runtime) {
            console.error("Runtime not available for tests");
            return;
        }

        // Test 1: 基本渲染测试
        this.testBasicRendering();
        
        // Test 2: 颜色测试
        setTimeout(() => this.testColorSettings(), 1000);
        
        // Test 3: 粗细测试
        setTimeout(() => this.testThicknessSettings(), 2000);
        
        // Test 4: 系统诊断
        setTimeout(() => this.runSystemDiagnostics(), 3000);
    }

    /**
     * 测试基本渲染功能
     */
    private static testBasicRendering(): void {
        console.log("--- Test 1: Basic Rendering ---");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const allObjectTypes = Object.keys(runtime.objects);
        
        // 找到第一个可用的对象进行测试
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const testInstance = instances[0];
                    
                    // 添加一个非常明显的调试框
                    DebugObjectRenderer
                        .setColor(1, 0, 0, 1)  // 红色
                        .setBoxThickness(5)
                        .RenderBoxtoInstance(testInstance);
                    
                    console.log(`✓ Added red debug box to ${objectTypeName} at (${testInstance.x}, ${testInstance.y})`);
                    console.log(`  Size: ${testInstance.width}x${testInstance.height}`);
                    console.log(`  Layer: ${testInstance.layer.name || 'unnamed'}`);
                    
                    // 尝试移动摄像机到这个对象
                    try {
                        runtime.layout.scrollTo(testInstance.x, testInstance.y);
                        console.log(`✓ Moved camera to test object`);
                    } catch (error: any) {
                        console.warn(`Could not move camera: ${error.message}`);
                    }
                    
                    return;
                }
            }
        }
        
        console.error("✗ No objects found for basic rendering test");
    }

    /**
     * 测试颜色设置
     */
    private static testColorSettings(): void {
        console.log("--- Test 2: Color Settings ---");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const allObjectTypes = Object.keys(runtime.objects);
        
        let testCount = 0;
        const maxTests = 3;
        
        for (const objectTypeName of allObjectTypes) {
            if (testCount >= maxTests) break;
            
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const testInstance = instances[Math.min(testCount, instances.length - 1)];
                    
                    // 测试不同颜色
                    const colors = [
                        { r: 0, g: 1, b: 0, a: 1, name: "Green" },
                        { r: 0, g: 0, b: 1, a: 1, name: "Blue" },
                        { r: 1, g: 1, b: 0, a: 1, name: "Yellow" }
                    ];
                    
                    const color = colors[testCount];
                    DebugObjectRenderer
                        .setColor(color.r, color.g, color.b, color.a)
                        .setBoxThickness(3)
                        .RenderBoxtoInstance(testInstance);
                    
                    console.log(`✓ Added ${color.name} debug box to ${objectTypeName}`);
                    testCount++;
                }
            }
        }
        
        console.log(`✓ Color test completed with ${testCount} different colors`);
    }

    /**
     * 测试粗细设置
     */
    private static testThicknessSettings(): void {
        console.log("--- Test 3: Thickness Settings ---");
        
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const allObjectTypes = Object.keys(runtime.objects);
        
        let testCount = 0;
        const maxTests = 3;
        const thicknesses = [1, 5, 10];
        
        for (const objectTypeName of allObjectTypes) {
            if (testCount >= maxTests) break;
            
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > testCount + 3) { // 跳过前面已经使用的实例
                    const testInstance = instances[testCount + 3];
                    
                    const thickness = thicknesses[testCount];
                    DebugObjectRenderer
                        .setColor(1, 0, 1, 1)  // 紫色
                        .setBoxThickness(thickness)
                        .RenderBoxtoInstance(testInstance);
                    
                    console.log(`✓ Added ${thickness}px thick debug box to ${objectTypeName}`);
                    testCount++;
                }
            }
        }
        
        console.log(`✓ Thickness test completed with ${testCount} different thicknesses`);
    }

    /**
     * 运行系统诊断
     */
    private static runSystemDiagnostics(): void {
        console.log("--- Test 4: System Diagnostics ---");
        
        // 获取调试信息
        const debugInfo = DebugObjectRenderer.getDebugInfo();
        
        console.log("System Status:");
        console.log(`- Initialized: ${debugInfo.isInitialized}`);
        console.log(`- Total debug boxes: ${debugInfo.totalDebugBoxes}`);
        console.log(`- Enabled debug boxes: ${debugInfo.enabledDebugBoxes}`);
        console.log(`- Render count: ${debugInfo.renderCount}`);
        console.log(`- Time since last render: ${debugInfo.timeSinceLastRender}ms`);
        
        // 检查渲染状态
        if (debugInfo.renderCount === 0) {
            console.error("❌ PROBLEM: No render calls detected!");
            console.error("   This means the afterdraw events are not firing.");
            console.error("   Possible causes:");
            console.error("   1. Layers are not properly initialized");
            console.error("   2. Event listeners are not attached");
            console.error("   3. Runtime is not available");
        } else if (debugInfo.timeSinceLastRender > 1000) {
            console.warn("⚠️ WARNING: Rendering may be stalled");
            console.warn(`   Last render was ${debugInfo.timeSinceLastRender}ms ago`);
        } else {
            console.log("✅ Rendering system appears to be working");
        }
        
        // 检查图层信息
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        if (runtime) {
            const layers = runtime.layout.getAllLayers();
            console.log(`Layer count: ${layers.length}`);
            
            layers.forEach((layer, index) => {
                console.log(`Layer ${index}: "${layer.name || 'unnamed'}" - Visible: ${layer.isVisible}, Opacity: ${layer.opacity}`);
            });
        }
        
        // 检查调试框分布
        console.log("Debug boxes by layer:");
        debugInfo.debugBoxesByLayer.forEach((boxes: any[], layerName: string) => {
            console.log(`- "${layerName}": ${boxes.length} boxes`);
        });
        
        console.log("=== Diagnostics Complete ===");
        console.log("If you still can't see debug boxes, try:");
        console.log("1. Check if objects are within the viewport");
        console.log("2. Verify layer visibility and opacity");
        console.log("3. Make sure the camera is positioned correctly");
        console.log("4. Try using the IMGUI test buttons for more specific tests");
    }

    /**
     * 清理测试
     */
    public static cleanup(): void {
        DebugObjectRenderer.clearAll();
        console.log("[DebugRendererExample] Cleaned up all test debug boxes");
    }
}

// 自动初始化
DebugRendererExample.initialize();

// 将清理方法暴露到全局
(globalThis as any).DebugRendererExample = {
    cleanup: DebugRendererExample.cleanup.bind(DebugRendererExample)
};

console.log("[DebugRendererExample] Example script loaded. Use DebugRendererExample.cleanup() to clear test boxes."); 