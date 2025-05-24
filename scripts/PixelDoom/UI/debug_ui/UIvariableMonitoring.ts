import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {



})



/**
 * 变量监控器类 - 用于实时监控变量值
 */
export class VariableMonitoring {
    private static instance: VariableMonitoring;
    private static windowId: string = "variable_monitoring_window";
    private static isInitialized: boolean = false;
    private static monitoredValues: Map<string, { value: any, source: string }> = new Map();

    /**
     * 获取变量监控器实例
     */
    private static getInstance(): VariableMonitoring {
        if (!this.instance) {
            this.instance = new VariableMonitoring();
            this.initialize();
        }
        return this.instance;
    }

    /**
     * 初始化变量监控器
     */
    private static initialize(): void {
        if (this.isInitialized) return;

        // 覆盖默认示例窗口创建方法
        // const originalCreateExampleWindow = Imgui_chunchun.CreateExampleWindow;
        // Imgui_chunchun.CreateExampleWindow = () => {
        //     // 不执行任何操作，防止创建默认示例窗口
        // };

        // 创建自定义的监控窗口
        this.createMonitoringWindow();
        this.Hide()

        this.isInitialized = true;
    }

    /**
     * 创建监控窗口
     */
    private static createMonitoringWindow(): void {
        const customWindowId = this.windowId;

        // 使用 CreateTextWindow 方法创建一个初始窗口，然后自定义它的回调
        Imgui_chunchun.CreateTextWindow(
            customWindowId,
            "variabl_eMonitoring_window",
            "",
            { x: 50, y: 50 }
        );

        // 强制类型转换以访问窗口配置
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(customWindowId);
            if (windowConfig) {
                // 自定义窗口配置
                windowConfig.size = { width: 500, height: 400 };
                windowConfig.renderCallback = () => {
                    this.renderMonitoringWindow();
                };
            }
        }
    }

    /**
     * 渲染监控窗口
     */
    private static renderMonitoringWindow(): void {
        const ImGui = globalThis.ImGui;

        // 设置标题栏
        ImGui.Text("UIvariable");
        ImGui.Separator();

        // 表格标题
        const tableFlags =
            ImGui.TableFlags.Borders |
            ImGui.TableFlags.RowBg |
            ImGui.TableFlags.Resizable |
            ImGui.TableFlags.ScrollY;

        if (ImGui.BeginTable("VariablesTable", 3, tableFlags)) {
            // 设置表头
            ImGui.TableSetupColumn("name");
            ImGui.TableSetupColumn("value");
            ImGui.TableSetupColumn("from");
            ImGui.TableHeadersRow();

            // 填充表格数据
            let rowIndex = 0;
            this.monitoredValues.forEach((item, name) => {
                ImGui.TableNextRow();

                // 变量名列
                ImGui.TableSetColumnIndex(0);
                ImGui.Text(name);

                // 值列
                ImGui.TableSetColumnIndex(1);
                const valueStr = this.formatValue(item.value);
                ImGui.Text(valueStr);

                // 来源列
                ImGui.TableSetColumnIndex(2);
                ImGui.Text(item.source);

                rowIndex++;
            });

            ImGui.EndTable();
        }

        // 显示提示信息
        if (this.monitoredValues.size === 0) {
            ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                "使用 VariableMonitoring.AddValue() 添加要监控的变量");
        }
    }

    /**
     * 格式化变量值显示
     */
    private static formatValue(value: any): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        if (typeof value === "object") {
            try {
                // 对象或数组转为JSON字符串
                return JSON.stringify(value);
            } catch (e) {
                return "[Object]";
            }
        }

        // 数字、字符串、布尔值直接转字符串
        return String(value);
    }

    /**
     * 添加要监控的变量
     * @param name 变量名称
     * @param value 变量值
     * @param source 变量来源（通常是脚本名称）
     */
    public static AddValue(name: string, value: any, source: string = "未知"): void {
        // 确保初始化
        this.getInstance();

        // 添加或更新变量
        this.monitoredValues.set(name, { value, source });
    }

    /**
     * 移除监控的变量
     * @param name 变量名称
     */
    public static RemoveValue(name: string): void {
        this.monitoredValues.delete(name);
    }

    /**
     * 清空所有监控的变量
     */
    public static ClearAll(): void {
        this.monitoredValues.clear();
    }

    /**
     * 显示监控窗口
     */
    public static Show(): void {
        // 确保初始化
        this.getInstance();

        // 通过公共 API 切换窗口显示状态
        if (!this.IsVisible()) {
            Imgui_chunchun.ToggleWindow(this.windowId);
        }

        // 备用方法：通过直接访问窗口配置
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                windowConfig.isOpen = true;
            }
        }
    }

    /**
     * 隐藏监控窗口
     */
    public static Hide(): void {
        // 通过公共 API 切换窗口显示状态
        if (this.IsVisible()) {
            Imgui_chunchun.ToggleWindow(this.windowId);
        }

        // 备用方法：通过直接访问窗口配置
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.windowId);
            if (windowConfig) {
                windowConfig.isOpen = false;
            }
        }
    }

    /**
     * 切换监控窗口显示状态
     */
    public static Toggle(): void {
        // 确保初始化
        this.getInstance();

        // 使用公共方法切换窗口显示状态
        Imgui_chunchun.ToggleWindow(this.windowId);
    }

    /**
     * 获取窗口显示状态
     */
    public static IsVisible(): boolean {
        return Imgui_chunchun.IsWindowOpen(this.windowId);
    }
}

// 导出一个更简洁的别名，方便使用
export const monitoring = VariableMonitoring;

// 示例：如何使用变量监控类
/*
// 1. 导入监控类
import { monitoring } from "./UI/debug_ui/UIvariableMonitoring";

// 2. 显示监控窗口
monitoring.Show();

// 3. 添加变量进行监控
let playerHealth = 100;
monitoring.AddValue("玩家生命值", playerHealth, "PlayerController");

let enemyCount = 5;
monitoring.AddValue("敌人数量", enemyCount, "EnemyManager");

// 4. 当变量值改变时，更新监控
playerHealth -= 10;
monitoring.AddValue("玩家生命值", playerHealth, "PlayerController");

// 5. 添加更复杂的数据结构
const playerStats = {
    strength: 15,
    agility: 12,
    intelligence: 10
};
monitoring.AddValue("玩家属性", playerStats, "PlayerStats");

// 6. 隐藏/显示窗口
// monitoring.Hide();
// monitoring.Show();
// monitoring.Toggle();

// 7. 检查窗口是否可见
// const isVisible = monitoring.IsVisible();

// 8. 移除特定变量
// monitoring.RemoveValue("敌人数量");

// 9. 清空所有监控变量
// monitoring.ClearAll();
*/
