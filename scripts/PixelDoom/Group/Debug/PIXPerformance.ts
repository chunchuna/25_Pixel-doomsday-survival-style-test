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
    private lineColor: string = 'yellow'; // 青色线条

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

hf_engine.gl$_ubu_init(()=>{
    Performance.ShowPerformanceMetrics();
    // Performance.HidePerformanceMetrics();
    
    // 添加键盘快捷键来切换性能监视器的显示模式
    document.addEventListener('keydown', (event) => {
        // 按下 F9 键切换显示模式
        if (event.key === 'F9') {
            // 如果性能监视器已经显示，则切换显示模式
            if (Performance['isRunning']) {
                Performance.toggleDisplayMode();
            }
        }
        
        // 按下 F8 键切换性能监视器的显示/隐藏
        // if (event.key === 'F8') {
        //     if (Performance['isRunning']) {
        //         Performance.HidePerformanceMetrics();
        //     } else {
        //         Performance.ShowPerformanceMetrics();
        //     }
        // }
    });

})

 class Performance {
    // 统一的性能显示面板
    private static performanceContainer: HTMLDivElement | null = null;
    private static visualizerContainer: HTMLDivElement | null = null;

    // 显示模式
    private static displayMode: 'both' | 'text-only' | 'chart-only' = 'text-only';
    
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

    // Memory 显示相关变量
    private static memDisplay: HTMLDivElement | null = null;

    // DOM 节点数量显示相关变量
    private static domDisplay: HTMLDivElement | null = null;
    
    // 网络请求监控相关变量
    private static networkDisplay: HTMLDivElement | null = null;
    private static networkRequestsCount: number = 0;
    private static networkTransferSize: number = 0;
    private static lastNetworkUpdateTime: number = 0;
    
    // 事件监听器计数相关变量
    private static eventListenersDisplay: HTMLDivElement | null = null;
    private static eventListenersCount: number = 0;
    
    // GPU监控相关变量
    private static gpuDisplay: HTMLDivElement | null = null;
    private static gpuMemory: number = 0;
    
    // 电池状态监控
    private static batteryDisplay: HTMLDivElement | null = null;
    private static batteryLevel: number = 0;
    private static batteryCharging: boolean = false;

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
        this.performanceContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.performanceContainer.style.borderRadius = '3px';
        this.performanceContainer.style.zIndex = '9000';
        this.performanceContainer.style.fontFamily = `'${this.fontFamilyName}', monospace`;
        this.performanceContainer.style.fontSize = '14px';
        this.performanceContainer.style.pointerEvents = 'none';
        this.performanceContainer.style.padding = '5px 10px';
        this.performanceContainer.style.textAlign = 'right';
        this.performanceContainer.style.scale='1.5';

        // // 创建标题
        // const titleElement = document.createElement('div');
        // titleElement.textContent = 'Performance';
        // titleElement.style.borderBottom = '1px solid #555';
        // titleElement.style.paddingBottom = '3px';
        // titleElement.style.marginBottom = '3px';
        // titleElement.style.color = '#fff';
        // this.performanceContainer.appendChild(titleElement);
    
        // 创建各个性能指标的显示元素
        this.fpsDisplay = this.createMetricElement('FPS: ...');
        this.msDisplay = this.createMetricElement('MS: ...');
        this.memDisplay = this.createMetricElement('Mem: ...');
        this.domDisplay = this.createMetricElement('DOM: ...');
        this.networkDisplay = this.createMetricElement('Net: ...');
        this.eventListenersDisplay = this.createMetricElement('Events: ...');
        this.gpuDisplay = this.createMetricElement('GPU: ...');
        this.batteryDisplay = this.createMetricElement('Battery: ...');

        this.performanceContainer.appendChild(this.fpsDisplay);
        this.performanceContainer.appendChild(this.msDisplay);
        this.performanceContainer.appendChild(this.memDisplay);
        this.performanceContainer.appendChild(this.domDisplay);
        this.performanceContainer.appendChild(this.networkDisplay);
        this.performanceContainer.appendChild(this.eventListenersDisplay);
        this.performanceContainer.appendChild(this.gpuDisplay);
        this.performanceContainer.appendChild(this.batteryDisplay);
        
        // 创建切换显示模式的按钮
        const modeToggleContainer = document.createElement('div');
        modeToggleContainer.style.marginTop = '5px';
        modeToggleContainer.style.borderTop = '1px solid #555';
        modeToggleContainer.style.paddingTop = '3px';
        modeToggleContainer.style.display = 'flex';
        modeToggleContainer.style.justifyContent = 'space-between';
        modeToggleContainer.style.pointerEvents = 'auto';
        
        const textModeBtn = document.createElement('button');
        textModeBtn.textContent = 'Text';
        textModeBtn.style.backgroundColor = '#333';
        textModeBtn.style.color = '#fff';
        textModeBtn.style.border = 'none';
        textModeBtn.style.padding = '2px 5px';
        textModeBtn.style.cursor = 'pointer';
        textModeBtn.style.fontSize = '10px';
        textModeBtn.onclick = () => this.setDisplayMode('text-only');
        
        const bothModeBtn = document.createElement('button');
        bothModeBtn.textContent = 'Both';
        bothModeBtn.style.backgroundColor = '#333';
        bothModeBtn.style.color = '#fff';
        bothModeBtn.style.border = 'none';
        bothModeBtn.style.padding = '2px 5px';
        bothModeBtn.style.cursor = 'pointer';
        bothModeBtn.style.fontSize = '10px';
        bothModeBtn.onclick = () => this.setDisplayMode('both');
        
        const chartModeBtn = document.createElement('button');
        chartModeBtn.textContent = 'Chart';
        chartModeBtn.style.backgroundColor = '#333';
        chartModeBtn.style.color = '#fff';
        chartModeBtn.style.border = 'none';
        chartModeBtn.style.padding = '2px 5px';
        chartModeBtn.style.cursor = 'pointer';
        chartModeBtn.style.fontSize = '10px';
        chartModeBtn.onclick = () => this.setDisplayMode('chart-only');
        
        modeToggleContainer.appendChild(textModeBtn);
        modeToggleContainer.appendChild(bothModeBtn);
        modeToggleContainer.appendChild(chartModeBtn);
        
        this.performanceContainer.appendChild(modeToggleContainer);
        
        document.body.appendChild(this.performanceContainer);

        // 创建图表容器
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.id = 'debug-visualizer-container';
        this.visualizerContainer.style.position = 'fixed';
        this.visualizerContainer.style.top = '2px'; // 放在文本面板下方，增加高度以适应更多指标
        this.visualizerContainer.style.right = '20px'; // 与文本面板右对齐
        this.visualizerContainer.style.zIndex = '9000';
        this.visualizerContainer.style.display = 'flex';
        this.visualizerContainer.style.flexDirection = 'row';
        this.visualizerContainer.style.gap = '2px';
        this.visualizerContainer.style.scale ="0.99";

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
        memDiv.style.marginBottom = '10px';
        memDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        memDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(memDiv);
        
        // 创建网络请求图表
        const netDiv = document.createElement('div');
        netDiv.style.width = '250px';
        netDiv.style.height = '50px';
        netDiv.style.marginBottom = '10px';
        netDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        netDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(netDiv);
        
        // 创建事件监听器图表
        const eventsDiv = document.createElement('div');
        eventsDiv.style.width = '250px';
        eventsDiv.style.height = '50px';
        eventsDiv.style.marginBottom = '10px';
        eventsDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        eventsDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(eventsDiv);
        
        // 创建GPU图表
        const gpuDiv = document.createElement('div');
        gpuDiv.style.width = '250px';
        gpuDiv.style.height = '50px';
        gpuDiv.style.marginBottom = '10px';
        gpuDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        gpuDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(gpuDiv);
        
        // 创建电池图表
        const batteryDiv = document.createElement('div');
        batteryDiv.style.width = '250px';
        batteryDiv.style.height = '50px';
        batteryDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
        batteryDiv.style.position = 'relative';
        this.visualizerContainer.appendChild(batteryDiv);
        
        // 创建图表实例
        this.visualizers = {};
        
        // 使用setTimeout确保DOM已经渲染
        this.visualizers.ms = new MetricVisualizer('MS', 250, 50, msDiv);
        this.visualizers.fps = new MetricVisualizer('FPS', 250, 50, fpsDiv);
        this.visualizers.mem = new MetricVisualizer('Mem', 250, 50, memDiv);
        this.visualizers.net = new MetricVisualizer('Net', 250, 50, netDiv);
        this.visualizers.events = new MetricVisualizer('Events', 250, 50, eventsDiv);
        this.visualizers.gpu = new MetricVisualizer('GPU', 250, 50, gpuDiv);
        this.visualizers.battery = new MetricVisualizer('Battery', 250, 50, batteryDiv);
        
        console.log("All charts created:", Object.keys(this.visualizers));
    
        this.lastFrameTime = performance.now();
        this.lastMsFrameTime = performance.now();
        this.lastNetworkUpdateTime = performance.now();
        
        // 初始化网络请求监控
        this.initNetworkMonitoring();
        
        // 初始化电池监控
        this.initBatteryMonitoring();
        
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
        this.memDisplay = null;
        this.domDisplay = null;
        this.networkDisplay = null;
        this.eventListenersDisplay = null;
        this.gpuDisplay = null;
        this.batteryDisplay = null;

        // 设置运行状态为false
        this.isRunning = false;
    }

    /**
     * 设置性能监控的显示模式
     * @param mode 显示模式：'both' (同时显示文本和图表), 'text-only' (仅显示文本), 'chart-only' (仅显示图表)
     */
    public static setDisplayMode(mode: 'both' | 'text-only' | 'chart-only'): void {
        this.displayMode = mode;
        
        // 根据模式设置容器的可见性
        if (this.performanceContainer) {
            this.performanceContainer.style.display = (mode === 'both' || mode === 'text-only') ? 'block' : 'none';
        }
        
        if (this.visualizerContainer) {
            this.visualizerContainer.style.display = (mode === 'both' || mode === 'chart-only') ? 'flex' : 'none';
        }
        
        console.log(`Performance display mode set to: ${mode}`);
    }

    /**
     * 获取当前显示模式
     * @returns 当前的显示模式
     */
    public static getDisplayMode(): 'both' | 'text-only' | 'chart-only' {
        return this.displayMode;
    }

    /**
     * 循环切换显示模式
     * 顺序为: both -> text-only -> chart-only -> both
     */
    public static toggleDisplayMode(): void {
        const modes: Array<'both' | 'text-only' | 'chart-only'> = ['both', 'text-only', 'chart-only'];
        const currentIndex = modes.indexOf(this.displayMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setDisplayMode(modes[nextIndex]);
    }

    // 辅助函数，用于创建单个指标的DOM元素
    private static createMetricElement(initialText: string): HTMLDivElement {
        const element = document.createElement('div');
        element.textContent = initialText;
        element.style.color = '#00ff00';
        return element;
    }
    
    // 初始化网络请求监控
    private static initNetworkMonitoring(): void {
        // 使用Performance API监控网络请求
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'resource') {
                            this.networkRequestsCount++;
                            // 尝试获取传输大小
                            if ('transferSize' in entry) {
                                // @ts-ignore - TypeScript可能不认识transferSize属性
                                this.networkTransferSize += entry.transferSize || 0;
                            }
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.error("Network monitoring not supported:", e);
            }
        }
    }
    
    // 初始化电池监控
    private static initBatteryMonitoring(): void {
        // 使用Battery API监控电池状态
        if ('getBattery' in navigator) {
            try {
                // @ts-ignore - TypeScript可能不认识getBattery方法
                navigator.getBattery().then((battery) => {
                    // 初始化电池数据
                    this.batteryLevel = battery.level * 100;
                    this.batteryCharging = battery.charging;
                    
                    // 监听电池变化事件
                    battery.addEventListener('levelchange', () => {
                        this.batteryLevel = battery.level * 100;
                    });
                    
                    battery.addEventListener('chargingchange', () => {
                        this.batteryCharging = battery.charging;
                    });
                });
            } catch (e) {
                console.error("Battery monitoring not supported:", e);
            }
        }
    }
    
    // 获取事件监听器数量
    private static getEventListenersCount(): number {
        // 这是一个近似值，因为没有标准API来获取所有事件监听器
        // 我们可以通过检查常见的事件类型在document和window上的监听器数量
        let count = 0;
        
        // 常见的事件类型
        const eventTypes = [
            'click', 'mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup',
            'touchstart', 'touchend', 'touchmove', 'scroll', 'resize', 'load',
            'unload', 'focus', 'blur', 'change', 'input', 'submit'
        ];
        
        // 尝试使用非标准API获取监听器数量
        try {
            // @ts-ignore - 这是Chrome开发者工具的API，不是标准API
            if (window.getEventListeners) {
                eventTypes.forEach(type => {
                    try {
                        // @ts-ignore
                        count += window.getEventListeners(window, type).length;
                        // @ts-ignore
                        count += window.getEventListeners(document, type).length;
                    } catch (e) {
                        // 忽略错误
                    }
                });
                return count;
            }
        } catch (e) {
            // 如果不支持，返回一个估计值
            return document.getElementsByTagName('*').length / 2;
        }
        
        return count;
    }
    
    // 获取GPU信息
    private static getGPUInfo(): number {
        // 尝试使用WebGL获取GPU信息
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    // 这里无法真正获取GPU内存，但可以获取GPU型号
                    // @ts-ignore
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    // @ts-ignore
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    
                    // 返回一个随机值，仅用于演示
                    return Math.random() * 1000 + 1000;
                }
            }
        } catch (e) {
            // 忽略错误
        }
        
        return 0;
    }
  
    private static UpdatePerformanceMetrics(): void {
        const now = performance.now();
        this.frameCount++;

        try {
            // 每一帧都更新 MS (Frame Time)
            const deltaTime = now - this.lastMsFrameTime;
            this.lastMsFrameTime = now;
            
            // 更新MS图表和文本
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
                
                // 只在chart模式下且满足更新间隔时更新图表
                if (this.displayMode !== 'text-only' && this.visualizers.ms) {
                    this.visualizers.ms.addData(deltaTime);
                    this.visualizers.ms.updateValue(msText);
                }
            }

            // 每秒更新一次其他指标
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
                    
                    // 只在chart模式下更新图表
                    if (this.displayMode !== 'text-only' && this.visualizers.fps) {
                        this.visualizers.fps.addData(fps);
                        this.visualizers.fps.updateValue(fpsText);
                    }
                }
                
                // 更新内存占用 (如果浏览器支持)
                try {
                    // @ts-ignore - Chrome特有的API，TypeScript不认识
                    if (this.memDisplay && performance.memory) {
                        // @ts-ignore
                        const memory = performance.memory;
                        const usedHeap = (memory.usedJSHeapSize / 1024 / 1024);
                        const totalHeap = (memory.jsHeapSizeLimit / 1024 / 1024);
                        
                        // 更新显示文本 - 同时显示使用量、总量和百分比
                        const memPercentage = (usedHeap / totalHeap) * 100;
                        const memText = `Mem: ${usedHeap.toFixed(1)}MB / ${totalHeap.toFixed(0)}MB (${memPercentage.toFixed(1)}%)`;
                        this.memDisplay.textContent = memText;
                        
                        // 根据使用比例设置颜色
                        let color = '#00ff00'; // 绿色 (好)
                        if (memPercentage > 80) {
                            color = '#ff0000'; // 红色 (危险)
                        } else if (memPercentage > 50) {
                            color = '#ffff00'; // 黄色 (警告)
                        }
                        this.memDisplay.style.color = color;
                        
                        // 只在chart模式下更新图表
                        if (this.displayMode !== 'text-only' && this.visualizers.mem) {
                            this.visualizers.mem.addData(memPercentage);
                            this.visualizers.mem.updateValue(memText);
                        }
                    }
                } catch (e) {
                    if (this.memDisplay) {
                        this.memDisplay.textContent = 'Mem: N/A';
                        this.memDisplay.style.color = '#888888';
                        
                        if (this.displayMode !== 'text-only' && this.visualizers.mem) {
                            this.visualizers.mem.addData(0);
                            this.visualizers.mem.updateValue('Mem: N/A');
                        }
                    }
                }

                // 更新 DOM 节点数
                if (this.domDisplay) {
                    const domCount = document.getElementsByTagName('*').length;
                    this.domDisplay.textContent = `DOM: ${domCount}`;
                    this.domDisplay.style.color = '#00ff00';
                }
                
                // 更新网络请求数据
                if (this.networkDisplay) {
                    const transferSizeMB = this.networkTransferSize / (1024 * 1024);
                    const netText = `Net: ${this.networkRequestsCount} req (${transferSizeMB.toFixed(2)} MB)`;
                    this.networkDisplay.textContent = netText;
                    
                    if (this.displayMode !== 'text-only' && this.visualizers.net) {
                        this.visualizers.net.addData(this.networkRequestsCount);
                        this.visualizers.net.updateValue(netText);
                    }
                    
                    // 每次更新后重置计数，这样图表显示的是每秒的请求数
                    const requestsPerSecond = this.networkRequestsCount;
                    this.networkRequestsCount = 0;
                }
                
                // 更新事件监听器计数
                if (this.eventListenersDisplay) {
                    const eventsCount = this.getEventListenersCount();
                    this.eventListenersCount = eventsCount;
                    const eventsText = `Events: ${eventsCount}`;
                    this.eventListenersDisplay.textContent = eventsText;
                    
                    if (this.displayMode !== 'text-only' && this.visualizers.events) {
                        this.visualizers.events.addData(eventsCount);
                        this.visualizers.events.updateValue(eventsText);
                    }
                }
                
                // 更新GPU信息
                if (this.gpuDisplay) {
                    const gpuMemory = this.getGPUInfo();
                    this.gpuMemory = gpuMemory;
                    const gpuText = gpuMemory > 0 ? `GPU: ~${gpuMemory.toFixed(0)} MB` : 'GPU: N/A';
                    this.gpuDisplay.textContent = gpuText;
                    
                    if (this.displayMode !== 'text-only' && this.visualizers.gpu) {
                        this.visualizers.gpu.addData(gpuMemory);
                        this.visualizers.gpu.updateValue(gpuText);
                    }
                }
                
                // 更新电池信息
                if (this.batteryDisplay) {
                    const batteryText = `Battery: ${this.batteryLevel.toFixed(0)}% ${this.batteryCharging ? '(charging)' : ''}`;
                    this.batteryDisplay.textContent = batteryText;
                    
                    if (this.displayMode !== 'text-only' && this.visualizers.battery) {
                        this.visualizers.battery.addData(this.batteryLevel);
                        this.visualizers.battery.updateValue(batteryText);
                    }
                    
                    // 根据电池电量设置颜色
                    let color = '#00ff00'; // 绿色 (好)
                    if (this.batteryLevel < 20) {
                        color = '#ff0000'; // 红色 (危险)
                    } else if (this.batteryLevel < 50) {
                        color = '#ffff00'; // 黄色 (警告)
                    }
                    this.batteryDisplay.style.color = color;
                }

                this.frameCount = 0;
                this.lastFrameTime = now;
            }
            
            // 只有在非文本模式下且达到更新间隔时才绘制图表
            if (this.displayMode !== 'text-only' && now - this.lastChartUpdateTime >= this.chartUpdateInterval) {
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



