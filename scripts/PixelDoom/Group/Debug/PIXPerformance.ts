import { hf_engine } from "../../../engine.js";

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
    private lineColor: string = '#4ecdc4'; // 青色线条

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

hf_engine.gl$_ubu_init(()=>{
    Performance.ShowPerformanceMetrics();
})

export class Performance {
    // 统一的性能显示面板
    private static performanceContainer: HTMLDivElement | null = null;
    private static visualizerContainer: HTMLDivElement | null = null;

    // FPS显示相关变量
    private static fpsDisplay: HTMLDivElement | null = null;
    private static lastFrameTime: number = 0;
    private static frameCount: number = 0;

    // MS (Frame Time) 显示相关变量
    private static msDisplay: HTMLDivElement | null = null;
    private static lastMsFrameTime: number = 0;

    // Memory 显示相关变量
    private static memDisplay: HTMLDivElement | null = null;

    // DOM 节点数量显示相关变量
    private static domDisplay: HTMLDivElement | null = null;

    // 可视化图表实例数组
    private static visualizers: {[key: string]: MetricVisualizer} = {};

    private static customFontPath: string = 'Font/ProggyClean.ttf'; // 自定义字体路径
    private static fontFamilyName: string = 'DebugUIFont'; // 字体族名称

    public static ShowPerformanceMetrics() {
        if (this.performanceContainer) {
            return;
        }
    
        // 创建文本指标的容器
        this.performanceContainer = document.createElement('div');
        this.performanceContainer.id = 'debug-performance-text-container';
        this.performanceContainer.style.position = 'fixed';
        this.performanceContainer.style.top = '10px';
        this.performanceContainer.style.right = '10px';
        this.performanceContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.performanceContainer.style.borderRadius = '3px';
        this.performanceContainer.style.zIndex = '9999999999999';
        this.performanceContainer.style.fontFamily = `'${this.fontFamilyName}', monospace`;
        this.performanceContainer.style.fontSize = '14px';
        this.performanceContainer.style.pointerEvents = 'none';
        this.performanceContainer.style.padding = '5px 10px';
        this.performanceContainer.style.textAlign = 'right';

        // 创建标题
        const titleElement = document.createElement('div');
        titleElement.textContent = 'Performance';
        titleElement.style.borderBottom = '1px solid #555';
        titleElement.style.paddingBottom = '3px';
        titleElement.style.marginBottom = '3px';
        titleElement.style.color = '#fff';
        this.performanceContainer.appendChild(titleElement);
    
        // 创建各个性能指标的显示元素
        this.fpsDisplay = this.createMetricElement('FPS: ...');
        this.msDisplay = this.createMetricElement('MS: ...');
        this.memDisplay = this.createMetricElement('Mem: ...');
        this.domDisplay = this.createMetricElement('DOM: ...');

        this.performanceContainer.appendChild(this.fpsDisplay);
        this.performanceContainer.appendChild(this.msDisplay);
        this.performanceContainer.appendChild(this.memDisplay);
        this.performanceContainer.appendChild(this.domDisplay);
        
        document.body.appendChild(this.performanceContainer);

        // 创建图表容器
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.id = 'debug-visualizer-container';
        this.visualizerContainer.style.position = 'fixed';
        this.visualizerContainer.style.top = '120px'; // 放在文本面板下方
        this.visualizerContainer.style.right = '10px'; // 与文本面板右对齐
        this.visualizerContainer.style.zIndex = '9999999999999';
        this.visualizerContainer.style.display = 'flex';
        this.visualizerContainer.style.flexDirection = 'column';
        this.visualizerContainer.style.gap = '5px';
        document.body.appendChild(this.visualizerContainer);

        // 创建图表 - 全新方法
        // 首先清空容器
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
        
        // 创建内存图表
        const memDiv = document.createElement('div');
        memDiv.style.width = '250px';
        memDiv.style.height = '50px';
        memDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        memDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(memDiv);
        
        // 创建图表实例
        this.visualizers = {};
        
        // 使用setTimeout确保DOM已经渲染
        setTimeout(() => {
            this.visualizers.ms = new MetricVisualizer('MS', 250, 50, msDiv);
            this.visualizers.fps = new MetricVisualizer('FPS', 250, 50, fpsDiv);
            this.visualizers.mem = new MetricVisualizer('Mem', 250, 50, memDiv);
            
            console.log("图表创建完成:", Object.keys(this.visualizers));
        }, 100);
    
        this.lastFrameTime = performance.now();
        this.lastMsFrameTime = performance.now();
        
        // 开始更新循环
        this.UpdatePerformanceMetrics();
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
            
            // 更新MS图表和文本
            if (this.visualizers.ms && this.msDisplay) {
                this.visualizers.ms.addData(deltaTime);
                const msText = `MS: ${deltaTime.toFixed(2)}`;
                this.visualizers.ms.updateValue(msText);
                this.msDisplay.textContent = msText;
                
                // 根据性能设置颜色
                let color = '#00ff00'; // 绿色 (好)
                if (deltaTime > 33.3) { // ~30fps
                    color = '#ff0000'; // 红色 (差)
                } else if (deltaTime > 16.7) { // ~60fps
                    color = '#ffff00'; // 黄色 (一般)
                }
                this.msDisplay.style.color = color;
            }

            // 每秒更新一次其他指标
            if (now >= this.lastFrameTime + 1000) {
                const fps = this.frameCount;
                
                // 更新 FPS 图表和文本
                if (this.visualizers.fps && this.fpsDisplay) {
                    this.visualizers.fps.addData(fps);
                    const fpsText = `FPS: ${fps}`;
                    this.visualizers.fps.updateValue(fpsText);
                    this.fpsDisplay.textContent = fpsText;
                    
                    // 根据性能设置颜色
                    let color = '#00ff00'; // 绿色 (好)
                    if (fps < 30) {
                        color = '#ff0000'; // 红色 (差)
                    } else if (fps < 50) {
                        color = '#ffff00'; // 黄色 (一般)
                    }
                    this.fpsDisplay.style.color = color;
                }
                
                // 更新内存占用 (如果浏览器支持)
                try {
                    // @ts-ignore - Chrome特有的API，TypeScript不认识
                    if (this.visualizers.mem && this.memDisplay && performance.memory) {
                        // @ts-ignore
                        const memory = performance.memory;
                        const usedHeap = (memory.usedJSHeapSize / 1024 / 1024);
                        const totalHeap = (memory.jsHeapSizeLimit / 1024 / 1024);
                        
                        this.visualizers.mem.addData(usedHeap);
                        const memText = `Mem: ${usedHeap.toFixed(2)}MB`;
                        this.visualizers.mem.updateValue(memText);
                        this.memDisplay.textContent = memText;
                        this.memDisplay.style.color = '#00ff00';
                    }
                } catch (e) {
                    if (this.visualizers.mem && this.memDisplay) {
                        this.visualizers.mem.addData(0);
                        this.visualizers.mem.updateValue('Mem: N/A');
                        this.memDisplay.textContent = 'Mem: N/A';
                        this.memDisplay.style.color = '#888888';
                    }
                }

                // 更新 DOM 节点数
                if (this.domDisplay) {
                    const domCount = document.getElementsByTagName('*').length;
                    this.domDisplay.textContent = `DOM: ${domCount}`;
                    this.domDisplay.style.color = '#00ff00';
                }

                this.frameCount = 0;
                this.lastFrameTime = now;
            }
            
            // 在动画帧中重绘所有图表
            for (const key in this.visualizers) {
                this.visualizers[key].draw();
            }
        } catch (e) {
            console.error("性能监控错误:", e);
        }
    
        requestAnimationFrame(() => this.UpdatePerformanceMetrics());
    }
}



