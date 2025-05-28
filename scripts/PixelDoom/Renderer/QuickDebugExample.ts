import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { DebugObjectRenderer } from "./DebugObjectRenderer.js";

/**
 * Quick Debug Example - 快速调试示例
 * 展示如何在实际游戏中快速使用调试渲染器
 */
export class QuickDebugExample {
    
    public static initialize(): void {
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
            this.setupQuickDebug();
        });
    }

    private static setupQuickDebug(): void {
        console.log("[QuickDebugExample] Setting up quick debug examples");
        
        // 延迟执行，确保游戏对象已经创建
        setTimeout(() => {
            this.debugPlayerCharacter();
            this.debugClickableObjects();
            this.debugUIElements();
        }, 2000);
    }

    // 调试玩家角色
    private static debugPlayerCharacter(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // 尝试找到玩家对象（根据你的项目结构调整对象名称）
        const playerObjectNames = ['Player', 'Character', 'PIXPlayer', 'MainCharacter'];
        
        for (const objectName of playerObjectNames) {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                if (instances.length > 0) {
                    const player = instances[0];
                    
                    // 为玩家绘制绿色边框
                    DebugObjectRenderer
                        .setColor(0, 1, 0, 1)  // 绿色
                        .setBoxThickness(3)
                        .RenderBoxtoInstance(player);
                    
                    console.log(`[QuickDebugExample] Added green debug box to player: ${objectName}`);
                    break;
                }
            }
        }
    }

    // 调试可点击对象
    private static debugClickableObjects(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // 常见的可点击对象名称
        const clickableObjectNames = ['ClickObject', 'Item', 'InteractiveObject', 'Button'];
        
        clickableObjectNames.forEach((objectName, index) => {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance, instanceIndex: number) => {
                    if (instanceIndex < 5) { // 限制只调试前5个实例
                        // 为可点击对象绘制黄色边框
                        DebugObjectRenderer
                            .setColor(1, 1, 0, 0.8)  // 黄色，80%透明度
                            .setBoxThickness(2)
                            .RenderBoxtoInstance(instance);
                        
                        console.log(`[QuickDebugExample] Added yellow debug box to ${objectName} #${instanceIndex}`);
                    }
                });
            }
        });
    }

    // 调试UI元素
    private static debugUIElements(): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        // 常见的UI对象名称
        const uiObjectNames = ['UIButton', 'UIPanel', 'UIText', 'Sprite'];
        
        uiObjectNames.forEach((objectName) => {
            const objectType = (runtime.objects as any)[objectName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance, index: number) => {
                    if (index < 3) { // 限制只调试前3个实例
                        // 为UI元素绘制蓝色边框
                        DebugObjectRenderer
                            .setColor(0, 0.5, 1, 0.6)  // 蓝色，60%透明度
                            .setBoxThickness(1)
                            .RenderBoxtoInstance(instance);
                        
                        console.log(`[QuickDebugExample] Added blue debug box to ${objectName} #${index}`);
                    }
                });
            }
        });
    }

    // 实用工具：为特定对象类型的所有实例添加调试框
    public static debugAllInstancesOfType(objectTypeName: string, color: {r: number, g: number, b: number, a?: number} = {r: 1, g: 0, b: 0, a: 1}, thickness: number = 2): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        const objectType = (runtime.objects as any)[objectTypeName];
        
        if (objectType && objectType.getAllInstances) {
            const instances = objectType.getAllInstances();
            instances.forEach((instance: IWorldInstance, index: number) => {
                DebugObjectRenderer
                    .setColor(color.r, color.g, color.b, color.a || 1)
                    .setBoxThickness(thickness)
                    .RenderBoxtoInstance(instance);
            });
            
            console.log(`[QuickDebugExample] Added debug boxes to all ${instances.length} instances of ${objectTypeName}`);
        } else {
            console.warn(`[QuickDebugExample] Object type '${objectTypeName}' not found`);
        }
    }

    // 实用工具：为指定位置附近的对象添加调试框
    public static debugObjectsNearPosition(x: number, y: number, radius: number = 100, color: {r: number, g: number, b: number, a?: number} = {r: 1, g: 0.5, b: 0, a: 1}): void {
        const runtime = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_;
        
        const allObjectTypes = Object.keys(runtime.objects);
        let debuggedCount = 0;
        
        for (const objectTypeName of allObjectTypes) {
            const objectType = (runtime.objects as any)[objectTypeName];
            if (objectType && objectType.getAllInstances) {
                const instances = objectType.getAllInstances();
                instances.forEach((instance: IWorldInstance) => {
                    const distance = Math.sqrt(Math.pow(instance.x - x, 2) + Math.pow(instance.y - y, 2));
                    if (distance <= radius) {
                        DebugObjectRenderer
                            .setColor(color.r, color.g, color.b, color.a || 1)
                            .setBoxThickness(2)
                            .RenderBoxtoInstance(instance);
                        debuggedCount++;
                    }
                });
            }
        }
        
        console.log(`[QuickDebugExample] Added debug boxes to ${debuggedCount} objects near position (${x}, ${y}) within radius ${radius}`);
    }

    // 清除所有调试框的快捷方法
    public static clearAllDebugBoxes(): void {
        DebugObjectRenderer.clearAll();
        console.log("[QuickDebugExample] Cleared all debug boxes");
    }

    // 获取调试统计信息
    public static getDebugStats(): void {
        const count = DebugObjectRenderer.getDebugBoxCount();
        console.log(`[QuickDebugExample] Current debug boxes count: ${count}`);
    }
}

// 自动初始化
QuickDebugExample.initialize();

// 将一些实用方法暴露到全局，方便在控制台中使用
(globalThis as any).QuickDebug = {
    debugAllInstancesOfType: QuickDebugExample.debugAllInstancesOfType.bind(QuickDebugExample),
    debugObjectsNearPosition: QuickDebugExample.debugObjectsNearPosition.bind(QuickDebugExample),
    clearAll: QuickDebugExample.clearAllDebugBoxes.bind(QuickDebugExample),
    getStats: QuickDebugExample.getDebugStats.bind(QuickDebugExample)
};

console.log("[QuickDebugExample] Global QuickDebug utilities available:");
console.log("- QuickDebug.debugAllInstancesOfType('ObjectName', {r:1,g:0,b:0}, 3)");
console.log("- QuickDebug.debugObjectsNearPosition(x, y, radius)");
console.log("- QuickDebug.clearAll()");
console.log("- QuickDebug.getStats()"); 