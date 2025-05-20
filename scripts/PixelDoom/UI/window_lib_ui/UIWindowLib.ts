import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

/**
 * 窗口库 - 提供创建自定义窗口的静态方法
 */
export class UIWindowLib {
    private static idCounter: number = 0;
    
    /**
     * 创建一个新窗口
     * @param title 窗口标题
     * @param width 窗口默认宽度(px)
     * @param height 窗口默认高度(px)
     * @param opacity 窗口默认透明度(0-1)
     * @param x 窗口默认X坐标，默认为居中
     * @param y 窗口默认Y坐标，默认为居中
     * @param parent 父元素，默认为document.body
     * @returns 窗口容器元素和内容容器元素
     */
    public static createWindow(
        title: string,
        width: number = 400,
        height: number = 300,
        opacity: number = 1,
        x?: number,
        y?: number,
        parent: HTMLElement = document.body
    ): { 
        windowElement: HTMLElement,
        contentElement: HTMLElement,
        close: () => void
    } {
        const windowId = `pd-window-${++this.idCounter}`;
        
        // 创建样式
        this.createStyles(windowId);
        
        // 创建窗口元素
        const windowElement = document.createElement('div');
        windowElement.id = windowId;
        windowElement.className = 'pd-window';
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
        windowElement.style.opacity = opacity.toString();
        
        // 设置窗口位置
        if (x !== undefined && y !== undefined) {
            windowElement.style.left = `${x}px`;
            windowElement.style.top = `${y}px`;
        } else {
            // 默认居中
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            windowElement.style.left = `${(viewportWidth - width) / 2}px`;
            windowElement.style.top = `${(viewportHeight - height) / 2}px`;
        }
        
        // 窗口内容
        windowElement.innerHTML = `
            <div class="pd-window-header">
                <div class="pd-window-title">${title}</div>
                <div class="pd-window-controls">
                    <div class="pd-window-minimize"></div>
                    <div class="pd-window-close"></div>
                </div>
            </div>
            <div class="pd-window-body">
                <div class="pd-window-content"></div>
            </div>
            <div class="pd-window-resizer"></div>
        `;
        
        // 添加到父元素
        parent.appendChild(windowElement);
        
        // 获取元素引用
        const headerElement = windowElement.querySelector('.pd-window-header') as HTMLElement;
        const contentElement = windowElement.querySelector('.pd-window-content') as HTMLElement;
        const minimizeButton = windowElement.querySelector('.pd-window-minimize') as HTMLElement;
        const closeButton = windowElement.querySelector('.pd-window-close') as HTMLElement;
        const resizerElement = windowElement.querySelector('.pd-window-resizer') as HTMLElement;
        
        // 添加拖拽功能
        this.enableDrag(windowElement, headerElement);
        
        // 添加调整大小功能
        this.enableResize(windowElement, resizerElement, contentElement);
        
        // 绑定收起按钮点击事件
        let isMinimized = false;
        const originalHeight = height;
        
        minimizeButton.addEventListener('click', () => {
            if (isMinimized) {
                // 展开窗口
                windowElement.style.height = `${originalHeight}px`;
                windowElement.classList.remove('pd-window-minimized');
            } else {
                // 收起窗口
                const headerHeight = headerElement.offsetHeight;
                windowElement.style.height = `${headerHeight}px`;
                windowElement.classList.add('pd-window-minimized');
            }
            isMinimized = !isMinimized;
        });
        
        // 绑定关闭按钮点击事件
        const close = () => {
            windowElement.remove();
            // 移除对应的样式
            const styleElement = document.getElementById(`${windowId}-style`);
            if (styleElement) {
                styleElement.remove();
            }
        };
        
        closeButton.addEventListener('click', close);
        
        return { 
            windowElement, 
            contentElement,
            close
        };
    }
    
    /**
     * 创建窗口样式
     * @param windowId 窗口ID
     */
    private static createStyles(windowId: string): void {
        const styleElement = document.createElement('style');
        styleElement.id = `${windowId}-style`;
        
        styleElement.textContent = `
            #${windowId} {
                position: absolute;
                background-color: #282828;
                border: 1px solid #3c3c3c;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                transition: height 0.3s ease;
                font-family: Arial, sans-serif;
                z-index: 1000;
                color: #e0e0e0;
            }
            
            #${windowId} .pd-window-header {
                height: 28px;
                background-color: #1c1c1c;
                border-bottom: 1px solid #3c3c3c;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 10px;
                cursor: move;
                user-select: none;
            }
            
            #${windowId} .pd-window-title {
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #${windowId} .pd-window-controls {
                display: flex;
                gap: 6px;
            }
            
            #${windowId} .pd-window-minimize,
            #${windowId} .pd-window-close {
                width: 14px;
                height: 14px;
                border-radius: 2px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            #${windowId} .pd-window-minimize {
                background-color: #555;
                position: relative;
            }
            
            #${windowId} .pd-window-minimize:hover {
                background-color: #666;
            }
            
            #${windowId} .pd-window-minimize::after {
                content: '';
                width: 8px;
                height: 2px;
                background-color: #222;
                position: absolute;
            }
            
            #${windowId} .pd-window-close {
                background-color: #913a3a;
                position: relative;
            }
            
            #${windowId} .pd-window-close:hover {
                background-color: #c14545;
            }
            
            #${windowId} .pd-window-close::before,
            #${windowId} .pd-window-close::after {
                content: '';
                width: 8px;
                height: 2px;
                background-color: #222;
                position: absolute;
            }
            
            #${windowId} .pd-window-close::before {
                transform: rotate(45deg);
            }
            
            #${windowId} .pd-window-close::after {
                transform: rotate(-45deg);
            }
            
            #${windowId} .pd-window-body {
                height: calc(100% - 28px);
                overflow: hidden;
            }
            
            #${windowId} .pd-window-content {
                height: 100%;
                overflow-y: auto;
                padding: 10px;
                box-sizing: border-box;
                scrollbar-width: thin;
                scrollbar-color: #444 #282828;
            }
            
            #${windowId} .pd-window-content::-webkit-scrollbar {
                width: 8px;
            }
            
            #${windowId} .pd-window-content::-webkit-scrollbar-track {
                background: #282828;
            }
            
            #${windowId} .pd-window-content::-webkit-scrollbar-thumb {
                background-color: #444;
                border-radius: 4px;
            }
            
            #${windowId}.pd-window-minimized .pd-window-body {
                display: none;
            }
            
            #${windowId} .pd-window-resizer {
                position: absolute;
                width: 14px;
                height: 14px;
                bottom: 0;
                right: 0;
                cursor: nwse-resize;
            }
            
            #${windowId} .pd-window-resizer::before {
                content: '';
                position: absolute;
                bottom: 3px;
                right: 3px;
                width: 6px;
                height: 6px;
                border-right: 2px solid #555;
                border-bottom: 2px solid #555;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * 启用窗口拖拽功能
     * @param windowElement 窗口元素
     * @param dragHandle 拖拽句柄元素
     */
    private static enableDrag(windowElement: HTMLElement, dragHandle: HTMLElement): void {
        let offsetX: number = 0;
        let offsetY: number = 0;
        
        const startDrag = (e: MouseEvent) => {
            e.preventDefault();
            
            // 获取鼠标相对于窗口的位置
            offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - windowElement.getBoundingClientRect().top;
            
            // 绑定鼠标移动和松开事件
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            // 确保当前窗口在最上层
            windowElement.style.zIndex = '1001';
        };
        
        const drag = (e: MouseEvent) => {
            e.preventDefault();
            
            // 计算新位置
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            
            // 应用新位置
            windowElement.style.left = `${newLeft}px`;
            windowElement.style.top = `${newTop}px`;
        };
        
        const stopDrag = () => {
            // 移除事件监听
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            
            // 恢复原来的z-index
            windowElement.style.zIndex = '1000';
        };
        
        dragHandle.addEventListener('mousedown', startDrag);
    }
    
    /**
     * 启用窗口大小调整功能
     * @param windowElement 窗口元素
     * @param resizeHandle 调整大小的句柄元素
     * @param contentElement 内容元素，需要自适应大小
     */
    private static enableResize(
        windowElement: HTMLElement, 
        resizeHandle: HTMLElement,
        contentElement: HTMLElement
    ): void {
        let startX: number = 0;
        let startY: number = 0;
        let startWidth: number = 0;
        let startHeight: number = 0;
        
        const startResize = (e: MouseEvent) => {
            e.preventDefault();
            
            // 记录开始大小和位置
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowElement.offsetWidth;
            startHeight = windowElement.offsetHeight;
            
            // 绑定鼠标移动和松开事件
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        };
        
        const resize = (e: MouseEvent) => {
            e.preventDefault();
            
            // 计算新尺寸（确保最小尺寸）
            const newWidth = Math.max(200, startWidth + (e.clientX - startX));
            const newHeight = Math.max(100, startHeight + (e.clientY - startY));
            
            // 应用新尺寸
            windowElement.style.width = `${newWidth}px`;
            windowElement.style.height = `${newHeight}px`;
        };
        
        const stopResize = () => {
            // 移除事件监听
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };
        
        resizeHandle.addEventListener('mousedown', startResize);
    }
    
    /**
     * 设置窗口位置
     * @param windowElement 窗口元素
     * @param x X坐标
     * @param y Y坐标
     */
    public static setPosition(windowElement: HTMLElement, x: number, y: number): void {
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
    }
    
    /**
     * 设置窗口大小
     * @param windowElement 窗口元素
     * @param width 宽度
     * @param height 高度
     */
    public static setSize(windowElement: HTMLElement, width: number, height: number): void {
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
    }
    
    /**
     * 设置窗口标题
     * @param windowElement 窗口元素
     * @param title 新标题
     */
    public static setTitle(windowElement: HTMLElement, title: string): void {
        const titleElement = windowElement.querySelector('.pd-window-title') as HTMLElement;
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    /**
     * 设置窗口透明度
     * @param windowElement 窗口元素
     * @param opacity 透明度(0-1)
     */
    public static setOpacity(windowElement: HTMLElement, opacity: number): void {
        windowElement.style.opacity = opacity.toString();
    }
    
    /**
     * 将窗口置于前面
     * @param windowElement 窗口元素
     */
    public static bringToFront(windowElement: HTMLElement): void {
        windowElement.style.zIndex = '1002'; // 比普通窗口更高的z-index
        setTimeout(() => {
            windowElement.style.zIndex = '1000'; // 还原z-index
        }, 10);
    }
    
    /**
     * 切换窗口最小化状态
     * @param windowElement 窗口元素
     */
    public static toggleMinimize(windowElement: HTMLElement): void {
        const minimizeButton = windowElement.querySelector('.pd-window-minimize') as HTMLElement;
        if (minimizeButton) {
            minimizeButton.click();
        }
    }
    
    /**
     * 显示一个示例窗口
     * @returns 创建的示例窗口对象
     */
    public static showExampleWindow(): { 
        windowElement: HTMLElement,
        contentElement: HTMLElement,
        close: () => void
    } {
        // 创建一个示例窗口
        const { windowElement, contentElement, close } = this.createWindow(
            "示例窗口",
            500,
            400,
            1.0
        );
        
        // 添加一些示例内容
        contentElement.innerHTML = `
            <style>
                .example-container {
                    padding: 10px;
                    color: #e0e0e0;
                }
                
                .example-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #f0f0f0;
                }
                
                .example-text {
                    margin-bottom: 15px;
                    line-height: 1.5;
                }
                
                .example-button {
                    background-color: #444;
                    border: none;
                    color: #e0e0e0;
                    padding: 6px 12px;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .example-button:hover {
                    background-color: #555;
                }
                
                .example-input {
                    background-color: #333;
                    border: 1px solid #555;
                    color: #e0e0e0;
                    padding: 5px 10px;
                    border-radius: 3px;
                    margin-bottom: 10px;
                    width: 100%;
                }
            </style>
            
            <div class="example-container">
                <div class="example-title">窗口库使用示例</div>
                
                <div class="example-text">
                    这是一个使用 UIWindowLib 创建的示例窗口。窗口可以拖动、调整大小、收起和关闭。
                </div>
                
                <div class="example-text">
                    您可以轻松地向窗口内容区域添加自定义 HTML、CSS 和交互逻辑。
                </div>
                
                <input type="text" class="example-input" placeholder="输入一些文本...">
                
                <button class="example-button" id="${windowElement.id}-test-button">测试按钮</button>
            </div>
        `;
        
        // 添加按钮交互逻辑
        const testButton = contentElement.querySelector(`#${windowElement.id}-test-button`) as HTMLElement;
        if (testButton) {
            testButton.addEventListener('click', () => {
                alert('您点击了示例窗口中的按钮！');
            });
        }
        
        return { windowElement, contentElement, close };
    }
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    UIWindowLib.showExampleWindow();

})