import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";
import { IMGUIDebugButton } from "./UIDbugButton.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    var debug_category = IMGUIDebugButton.AddCategory("debug")
    if (debug_category) {
        IMGUIDebugButton.AddButtonToCategory(debug_category,"varibale_monitoring",()=>{
            VariableMonitoring.Toggle();
        })
    }

})



/**
 * 变量监控器类 - 用于实时监控变量值
 */
export class VariableMonitoring {
    private static instance: VariableMonitoring;
    private static windowId: string = "variable_monitoring_window";
    private static isInitialized: boolean = false;
    private static monitoredValues: Map<string, { value: any, source: string }> = new Map();

    // 存储展开状态的Map
    private static expandedItems: Map<string, boolean> = new Map();

    // 当前详情窗口显示的变量名
    private static currentDetailItem: string | null = null;
    private static detailWindowId: string = "variable_detail_window";

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

        // 创建自定义的监控窗口
        this.createMonitoringWindow();
        this.createDetailWindow();
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
     * 创建详情窗口
     */
    private static createDetailWindow(): void {
        const detailWindowId = this.detailWindowId;

        // 创建详情窗口
        Imgui_chunchun.CreateTextWindow(
            detailWindowId,
            "Variable Detail",
            "",
            { x: 150, y: 150 }
        );

        // 配置详情窗口
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(detailWindowId);
            if (windowConfig) {
                windowConfig.size = { width: 600, height: 500 };
                windowConfig.isOpen = false; // 默认关闭
                windowConfig.renderCallback = () => {
                    this.renderDetailWindow();
                };
            }
        }
    }

    /**
     * 渲染详情窗口
     */
    private static renderDetailWindow(): void {
        const ImGui = globalThis.ImGui;

        if (!this.currentDetailItem) {
            ImGui.Text("No variable selected");
            return;
        }

        const item = this.monitoredValues.get(this.currentDetailItem);
        if (!item) {
            ImGui.Text("Variable not found");
            return;
        }

        // 显示变量信息
        ImGui.Text(`Name: ${this.currentDetailItem}`);
        ImGui.Text(`Source: ${item.source}`);
        ImGui.Separator();

        // 为了安全处理，分批显示内容，避免一次性渲染太多导致内存溢出
        try {
            const fullContent = this.formatValue(item.value, true);

            // 先显示内容类型
            ImGui.Text(`Type: ${typeof item.value}`);
            ImGui.Separator();

            // 显示内容
            ImGui.BeginChild("ValueContent", new ImGui.ImVec2(0, 0), true);

            // 批量显示内容，每行最多显示100个字符
            const maxCharsPerLine = 100;
            let remainingContent = fullContent;

            while (remainingContent.length > 0) {
                const lineContent = remainingContent.substring(0, maxCharsPerLine);
                ImGui.Text(lineContent);
                remainingContent = remainingContent.substring(maxCharsPerLine);
            }

            ImGui.EndChild();
        } catch (e: any) {
            ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0),
                "Render Error: " + e.message);
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
                const textId = `value_${rowIndex}`;
                ImGui.PushID(textId);

                // 检查是否为长内容
                const isLongContent =
                    (typeof item.value === "string" && item.value.length > 100) ||
                    (typeof item.value === "object" && JSON.stringify(item.value).length > 100);

                // 变量名列
                ImGui.TableSetColumnIndex(0);
                ImGui.Text(name);

                // 值列
                ImGui.TableSetColumnIndex(1);

                // 对于长内容，显示按钮和摘要
                if (isLongContent) {
                    // 显示查看详情按钮
                    if (ImGui.SmallButton("View")) {
                        // 显示详情窗口
                        this.showDetailWindow(name);
                    }

                    // 在按钮后显示摘要
                    ImGui.SameLine();
                    const summaryText = this.formatValue(item.value, false); // 摘要
                    ImGui.Text(summaryText);
                } else {
                    // 普通文本显示
                    ImGui.Text(this.formatValue(item.value, false));
                }

                // 来源列
                ImGui.TableSetColumnIndex(2);
                ImGui.Text(item.source);

                ImGui.PopID();
                rowIndex++;
            });

            ImGui.EndTable();
        }

        // 显示提示信息
        if (this.monitoredValues.size === 0) {
            ImGui.TextColored(new ImGui.ImVec4(0.7, 0.7, 0.7, 1.0),
                "Use VariableMonitoring.AddValue() to add variables to monitor");
        }
    }

    /**
     * 显示详情窗口
     */
    private static showDetailWindow(name: string): void {
        this.currentDetailItem = name;

        // 打开详情窗口
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(this.detailWindowId);
            if (windowConfig) {
                windowConfig.isOpen = true;
            }
        }
    }

    /**
     * 格式化变量值显示
     */
    private static formatValue(value: any, isExpanded: boolean = false): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        if (typeof value === "object") {
            try {
                // 对象或数组转为JSON字符串
                const jsonStr = JSON.stringify(value);
                // 如果不是展开状态且字符串长度超过100，则截断显示
                if (!isExpanded && jsonStr.length > 100) {
                    return jsonStr.substring(0, 97) + "...";
                }
                return jsonStr;
            } catch (e) {
                return "[Object]";
            }
        }

        // 处理字符串
        if (typeof value === "string") {
            // 如果不是展开状态且字符串长度超过100，则截断显示
            if (!isExpanded && value.length > 100) {
                return value.substring(0, 97) + "...";
            }
            return value;
        }

        // 数字、布尔值直接转字符串
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
