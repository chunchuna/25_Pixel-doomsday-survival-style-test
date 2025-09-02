import { Unreal__ } from "../../../engine.js";

/**
 * 负责为单个指标创建和绘制实时折线图
 */
class MetricVisualizer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dataPoints: number[] = [];
    private maxDataPoints: number = 150; // 图表上显示的数据点数量
    private label: string;
    private value: string = '...';
    private lineColor: string = 'yellow'; // 黄色线条

    constructor(label: string, width: number, height: number, container: HTMLElement) {
        this.label = label;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d')!;
        
        container.appendChild(this.canvas);
        this.initializeData();
    }

    // 用0填充初始数据，避免开始时图表为空
    private initializeData(): void {
        for (let i = 0; i < this.maxDataPoints; i++) {
            this.dataPoints.push(0);
        }
    }

    // 添加新数据点
    public addData(value: number): void {
        this.dataPoints.push(value);
        if (this.dataPoints.length > this.maxDataPoints) {
            this.dataPoints.shift(); // 保持数组长度固定
        }
    }
    
    // 更新显示的文本值
    public updateValue(text: string): void {
        this.value = text;
    }

    // 绘制图表
    public draw(): void {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // 1. 清理画布
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        ctx.fillRect(0, 0, width, height);

        // 2. 找到当前数据中的最大值和最小值用于缩放
        let maxVal = -Infinity;
        let minVal = Infinity;
        for (const val of this.dataPoints) {
            if (val > maxVal) maxVal = val;
            if (val < minVal) minVal = val;
        }

        // 避免除以零，并增加一些边距
        if (maxVal === minVal) {
            maxVal += 1;
            minVal = Math.max(0, minVal - 1); // 确保最小值不小于0
        }
        const range = maxVal - minVal;

        // 3. 绘制网格线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const x = (width / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 4. 绘制折线
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let i = 0; i < this.dataPoints.length; i++) {
            const val = this.dataPoints[i];
            const x = (i / (this.maxDataPoints - 1)) * width;
            const y = height - ((val - minVal) / range) * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // 5. 绘制标签和当前值
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `12px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(this.label, 5, 15);
        
        ctx.textAlign = 'right';
        ctx.fillText(this.value, width - 5, 15);
    }
}

Unreal__.GameBegin(()=>{
    Performance.ShowPerformanceMetrics();
})

class Performance {
    // 统一的性能显示面板
    private static performanceContainer: HTMLDivElement | null = null;
    private static visualizerContainer: HTMLDivElement | null = null;

    // 图表更新频率控制
    private static chartUpdateInterval: number = 500; // 每500ms更新一次图表
    private static lastChartUpdateTime: number = 0;

    // FPS显示相关变量
    private static fpsDisplay: HTMLDivElement | null = null;
    private static lastFrameTime: number = 0;
    private static frameCount: number = 0;

    // MS (Frame Time) 显示相关变量
    private static msDisplay: HTMLDivElement | null = null;
    private static lastMsFrameTime: number = 0;

    // 可视化图表实例数组
    private static visualizers: {[key: string]: MetricVisualizer} = {};

    private static customFontPath: string = 'Font/ProggyClean.ttf'; // 自定义字体路径
    private static fontFamilyName: string = 'DebugUIFont'; // 字体族名称

    // 是否正在运行性能监控
    private static isRunning: boolean = false;
    
    // 动画帧ID
    private static _animationFrameId: number | null = null;

    public static ShowPerformanceMetrics() {
        if (this.performanceContainer) {
            return;
        }
    
        // 创建文本指标的容器
        this.performanceContainer = document.createElement('div');
        this.performanceContainer.id = 'debug-performance-text-container';
        this.performanceContainer.style.position = 'fixed';
        this.performanceContainer.style.top = '100px';
        this.performanceContainer.style.right = '50px';
        this.performanceContainer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        this.performanceContainer.style.borderRadius = '3px';
        this.performanceContainer.style.zIndex = '9000';
        this.performanceContainer.style.fontFamily = `'${this.fontFamilyName}', monospace`;
        this.performanceContainer.style.fontSize = '14px';
        this.performanceContainer.style.pointerEvents = 'none';
        this.performanceContainer.style.padding = '5px 10px';
        this.performanceContainer.style.textAlign = 'right';
        this.performanceContainer.style.scale='1.5';
    
        // 创建FPS和MS指标的显示元素
        this.fpsDisplay = this.createMetricElement('FPS: ...');
        this.msDisplay = this.createMetricElement('MS: ...');

        this.performanceContainer.appendChild(this.fpsDisplay);
        this.performanceContainer.appendChild(this.msDisplay);
        
        document.body.appendChild(this.performanceContainer);

        // 创建图表容器
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.id = 'debug-visualizer-container';
        this.visualizerContainer.style.position = 'fixed';
        this.visualizerContainer.style.top = '2px'; 
        this.visualizerContainer.style.right = '20px';
        this.visualizerContainer.style.zIndex = '9000';
        this.visualizerContainer.style.display = 'flex';
        this.visualizerContainer.style.flexDirection = 'row';
        this.visualizerContainer.style.gap = '2px';
        this.visualizerContainer.style.scale ="0.99";

        document.body.appendChild(this.visualizerContainer);

        // 创建图表 - 只为FPS和MS创建
        this.visualizerContainer.innerHTML = '';
        
        // 创建MS图表
        const msDiv = document.createElement('div');
        msDiv.style.width = '250px';
        msDiv.style.height = '50px';
        msDiv.style.marginBottom = '10px';
        msDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        msDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(msDiv);
        
        // 创建FPS图表
        const fpsDiv = document.createElement('div');
        fpsDiv.style.width = '250px';
        fpsDiv.style.height = '50px';
        fpsDiv.style.marginBottom = '10px';
        fpsDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        fpsDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(fpsDiv);
        
        // 创建图表实例
        this.visualizers = {};
        
        // 创建MS和FPS的图表实例
        this.visualizers.ms = new MetricVisualizer('MS', 250, 50, msDiv);
        this.visualizers.fps = new MetricVisualizer('FPS', 250, 50, fpsDiv);
    
        this.lastFrameTime = performance.now();
        this.lastMsFrameTime = performance.now();
        
        // 开始更新循环
        this.UpdatePerformanceMetrics();

        // 设置运行状态为true
        this.isRunning = true;
    }

    /**
     * 关闭性能指标显示
     */
    public static HidePerformanceMetrics() {
        // 如果没有在运行，直接返回
        if (!this.isRunning) {
            return;
        }

        // 移除性能指标容器
        if (this.performanceContainer && this.performanceContainer.parentNode) {
            this.performanceContainer.parentNode.removeChild(this.performanceContainer);
            this.performanceContainer = null;
        }

        // 移除图表容器
        if (this.visualizerContainer && this.visualizerContainer.parentNode) {
            this.visualizerContainer.parentNode.removeChild(this.visualizerContainer);
            this.visualizerContainer = null;
        }

        // 清空图表实例
        this.visualizers = {};
        
        // 取消动画帧请求
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        // 重置显示元素引用
        this.fpsDisplay = null;
        this.msDisplay = null;

        // 设置运行状态为false
        this.isRunning = false;
    }

    // 辅助函数，用于创建单个指标的DOM元素
    private static createMetricElement(initialText: string): HTMLDivElement {
        const element = document.createElement('div');
        element.textContent = initialText;
        element.style.color = '#00ff00';
        return element;
    }
    
    private static UpdatePerformanceMetrics(): void {
        const now = performance.now();
        this.frameCount++;

        try {
            // 每一帧都更新 MS (Frame Time)
            const deltaTime = now - this.lastMsFrameTime;
            this.lastMsFrameTime = now;
            
            // 更新MS文本
            if (this.msDisplay) {
                const msText = `MS: ${deltaTime.toFixed(2)}`;
                this.msDisplay.textContent = msText;
                
                // 根据性能设置颜色
                let color = '#00ff00'; // 绿色 (好)
                if (deltaTime > 33.3) { // ~30fps
                    color = '#ff0000'; // 红色 (差)
                } else if (deltaTime > 16.7) { // ~60fps
                    color = '#ffff00'; // 黄色 (一般)
                }
                this.msDisplay.style.color = color;
                
                // 更新MS图表
                if (this.visualizers.ms) {
                    this.visualizers.ms.addData(deltaTime);
                    this.visualizers.ms.updateValue(msText);
                }
            }

            // 每秒更新一次FPS指标
            if (now >= this.lastFrameTime + 1000) {
                const fps = this.frameCount;
                
                // 更新 FPS 文本
                if (this.fpsDisplay) {
                    const fpsText = `FPS: ${fps}`;
                    this.fpsDisplay.textContent = fpsText;
                    
                    // 根据性能设置颜色
                    let color = '#00ff00'; // 绿色 (好)
                    if (fps < 30) {
                        color = '#ff0000'; // 红色 (差)
                    } else if (fps < 50) {
                        color = '#ffff00'; // 黄色 (一般)
                    }
                    this.fpsDisplay.style.color = color;
                    
                    // 更新FPS图表
                    if (this.visualizers.fps) {
                        this.visualizers.fps.addData(fps);
                        this.visualizers.fps.updateValue(fpsText);
                    }
                }

                this.frameCount = 0;
                this.lastFrameTime = now;
            }
            
            // 更新图表绘制
            if (now - this.lastChartUpdateTime >= this.chartUpdateInterval) {
                // 在动画帧中重绘所有图表
                for (const key in this.visualizers) {
                    if (this.visualizers[key]) {
                        this.visualizers[key].draw();
                    }
                }
                this.lastChartUpdateTime = now;
            }
        } catch (e) {
            console.error("Performance monitoring error:", e);
        }
    
        this._animationFrameId = requestAnimationFrame(() => this.UpdatePerformanceMetrics());
    }
}



