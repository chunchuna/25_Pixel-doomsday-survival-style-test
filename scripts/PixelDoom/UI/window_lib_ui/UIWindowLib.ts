import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

/**
 * 窗口库 - 提供创建自定义窗口的静态方法
 */
export class UIWindowLib {
    private static idCounter: number = 0;
    private static activeWindows: Set<string> = new Set();
    
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
        // 生成唯一ID
        const windowId = `pd-window-${++this.idCounter}`;
        this.activeWindows.add(windowId);
        
        // 确保全局样式只添加一次
        this.ensureGlobalStyles();
        
        // 创建窗口元素 - 使用完全分离的元素结构
        const windowElement = document.createElement('div');
        windowElement.id = windowId;
        windowElement.className = 'pd-window';
        windowElement.setAttribute('tabindex', '-1'); // 使窗口可聚焦
        
        // 设置窗口样式 - 使用fixed定位代替absolute
        Object.assign(windowElement.style, {
            width: `${width}px`,
            height: `${height}px`,
            opacity: '0', // 初始设置为透明，用于打开动画
            transform: 'scale(0.95)', // 初始缩放比例
            position: 'fixed', // 改为fixed定位，解决点击问题
            backgroundColor: '#282828',
            border: '1px solid #3c3c3c',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            color: '#e0e0e0',
            zIndex: '9999', // 提高z-index值
            transition: 'opacity 0.2s ease-out, transform 0.2s ease-out' // 添加过渡效果
        });
        
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
        
        // 创建窗口组件 - 每个部分都是独立的DOM元素
        // 1. 创建窗口头部
        const headerElement = document.createElement('div');
        headerElement.className = 'pd-window-header';
        Object.assign(headerElement.style, {
            height: '28px',
            backgroundColor: '#1c1c1c',
            borderBottom: '1px solid #3c3c3c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 10px',
            cursor: 'move',
            userSelect: 'none',
            position: 'relative'
        });
        
        // 2. 创建标题
        const titleElement = document.createElement('div');
        titleElement.className = 'pd-window-title';
        titleElement.textContent = title;
        Object.assign(titleElement.style, {
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });
        
        // 3. 创建控制按钮容器
        const controlsElement = document.createElement('div');
        controlsElement.className = 'pd-window-controls';
        Object.assign(controlsElement.style, {
            display: 'flex',
            gap: '6px'
        });
        
        // 4. 创建最小化按钮
        const minimizeButton = document.createElement('div');
        minimizeButton.className = 'pd-window-minimize';
        Object.assign(minimizeButton.style, {
            width: '14px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: '#555',
            cursor: 'pointer',
            position: 'relative'
        });
        // 添加减号图标
        const minIconElement = document.createElement('div');
        Object.assign(minIconElement.style, {
            width: '8px',
            height: '2px',
            backgroundColor: '#222',
            position: 'absolute',
            left: '3px',
            top: '6px'
        });
        minimizeButton.appendChild(minIconElement);
        
        // 5. 创建关闭按钮
        const closeButton = document.createElement('div');
        closeButton.className = 'pd-window-close';
        Object.assign(closeButton.style, {
            width: '14px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: '#913a3a',
            cursor: 'pointer',
            position: 'relative'
        });
        // 添加叉号图标
        const closeIcon1 = document.createElement('div');
        Object.assign(closeIcon1.style, {
            width: '8px',
            height: '2px',
            backgroundColor: '#222',
            position: 'absolute',
            left: '3px',
            top: '6px',
            transform: 'rotate(45deg)'
        });
        const closeIcon2 = document.createElement('div');
        Object.assign(closeIcon2.style, {
            width: '8px',
            height: '2px',
            backgroundColor: '#222',
            position: 'absolute',
            left: '3px',
            top: '6px',
            transform: 'rotate(-45deg)'
        });
        closeButton.appendChild(closeIcon1);
        closeButton.appendChild(closeIcon2);
        
        // 6. 创建窗口主体
        const bodyElement = document.createElement('div');
        bodyElement.className = 'pd-window-body';
        Object.assign(bodyElement.style, {
            height: 'calc(100% - 28px)',
            overflow: 'hidden'
        });
        
        // 7. 创建内容区域
        const contentElement = document.createElement('div');
        contentElement.className = 'pd-window-content';
        Object.assign(contentElement.style, {
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            padding: '10px',
            boxSizing: 'border-box'
        });
        
        // 8. 创建调整大小角标
        const resizerElement = document.createElement('div');
        resizerElement.className = 'pd-window-resizer';
        Object.assign(resizerElement.style, {
            position: 'absolute',
            width: '24px', // 增大点击区域
            height: '24px', // 增大点击区域
            bottom: '0',
            right: '0',
            cursor: 'nwse-resize',
            zIndex: '9999' // 确保总是在最上层
        });
        
        // 调整大小角标图标
        const resizerIcon = document.createElement('div');
        Object.assign(resizerIcon.style, {
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            width: '10px',
            height: '10px',
            borderRight: '2px solid #555',
            borderBottom: '2px solid #555'
        });
        resizerElement.appendChild(resizerIcon);
        
        // 组装窗口
        controlsElement.appendChild(minimizeButton);
        controlsElement.appendChild(closeButton);
        headerElement.appendChild(titleElement);
        headerElement.appendChild(controlsElement);
        bodyElement.appendChild(contentElement);
        windowElement.appendChild(headerElement);
        windowElement.appendChild(bodyElement);
        windowElement.appendChild(resizerElement);
        
        // 添加到父元素
        parent.appendChild(windowElement);
        
        // 为内容区域添加额外的事件处理，确保可以点击
        this.applyExtraClickHandling(contentElement);
        
        // 绑定窗口事件 - 确保更可靠的拖拽
        this.enableWindowDrag(windowElement, headerElement);
        
        // 绑定窗口大小调整 - 使用更可靠的实现
        this.enableWindowResize(windowElement, resizerElement);
        
        // 绑定收起按钮点击事件
        let isMinimized = false;
        const originalHeight = height;
        
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (isMinimized) {
                // 展开窗口
                windowElement.style.height = `${originalHeight}px`;
                bodyElement.style.display = 'block';
                resizerElement.style.display = 'block'; // 恢复调整大小角标
            } else {
                // 收起窗口
                windowElement.style.height = `${headerElement.offsetHeight}px`;
                bodyElement.style.display = 'none';
                resizerElement.style.display = 'none'; // 隐藏调整大小角标
            }
            isMinimized = !isMinimized;
        }, true); // 使用捕获阶段
        
        // 确保按钮悬停效果
        minimizeButton.addEventListener('mouseover', () => {
            minimizeButton.style.backgroundColor = '#666';
        }, true);
        minimizeButton.addEventListener('mouseout', () => {
            minimizeButton.style.backgroundColor = '#555';
        }, true);
        
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#c14545';
        }, true);
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = '#913a3a';
        }, true);
        
        // 绑定关闭按钮点击事件
        const close = () => {
            // 添加关闭动画
            windowElement.style.opacity = '0';
            windowElement.style.transform = 'scale(0.95)';
            
            // 等待动画完成后移除元素
            setTimeout(() => {
                // 从活动窗口集合中移除
                this.activeWindows.delete(windowId);
                
                // 移除元素
                windowElement.remove();
            }, 200); // 与CSS过渡时间匹配
        };
        
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            close();
        }, true); // 使用捕获阶段
        
        // 点击窗口时将其置于前台
        windowElement.addEventListener('mousedown', () => {
            this.bringToFront(windowElement);
        }, true);
        
        // 添加打开动画效果 - 使用requestAnimationFrame确保DOM已更新
        requestAnimationFrame(() => {
            // 短暂延迟以确保变换生效
            setTimeout(() => {
                windowElement.style.opacity = opacity.toString();
                windowElement.style.transform = 'scale(1)';
            }, 30);
        });
        
        return { 
            windowElement, 
            contentElement,
            close
        };
    }
    
    /**
     * 确保全局样式只被添加一次
     */
    private static ensureGlobalStyles() {
        if (!document.getElementById('pd-window-global-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'pd-window-global-styles';
            
            styleElement.textContent = `
                /* 窗口滚动条样式 */
                .pd-window-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .pd-window-content::-webkit-scrollbar-track {
                    background: #282828;
                }
                
                .pd-window-content::-webkit-scrollbar-thumb {
                    background-color: #444;
                    border-radius: 4px;
                }
                
                /* 确保输入元素在窗口内部正常工作 */
                .pd-window-content input,
                .pd-window-content textarea,
                .pd-window-content select,
                .pd-window-content button {
                    background-color: #333;
                    border: 1px solid #555;
                    color: #e0e0e0;
                    padding: 5px;
                    z-index: 9999;
                }
                
                /* 防止窗口被意外遮挡 */
                .pd-window {
                    pointer-events: auto !important;
                }
                
                .pd-window * {
                    pointer-events: auto !important;
                }
                
                /* 窗口动画效果 */
                .pd-window {
                    transform-origin: center;
                }
            `;
            
            document.head.appendChild(styleElement);
        }
    }
    
    /**
     * 窗口拖拽功能 - 使用更高优先级的事件处理
     */
    private static enableWindowDrag(windowElement: HTMLElement, dragHandle: HTMLElement) {
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;
        
        // 使用捕获阶段以确保事件不被阻断
        const startDrag = (e: MouseEvent) => {
            // 确保是从头部拖拽
            if (e.target === dragHandle || dragHandle.contains(e.target as Node)) {
                e.preventDefault();
                e.stopPropagation();
                
                isDragging = true;
                
                // 获取鼠标相对于窗口的位置
                const rect = windowElement.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                this.bringToFront(windowElement);
                
                // 添加拖动中的样式
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'move';
                
                // 使用捕获阶段添加事件监听
                document.addEventListener('mousemove', drag, true);
                document.addEventListener('mouseup', stopDrag, true);
            }
        };
        
        const drag = (e: MouseEvent) => {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // 更新窗口位置
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            
            // 限制拖动不超出可视区域
            const maxLeft = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - dragHandle.offsetHeight;
            
            windowElement.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
            windowElement.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
        };
        
        const stopDrag = (e: MouseEvent) => {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = false;
            
            // 恢复样式
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // 移除事件监听
            document.removeEventListener('mousemove', drag, true);
            document.removeEventListener('mouseup', stopDrag, true);
        };
        
        // 使用捕获阶段添加事件
        dragHandle.addEventListener('mousedown', startDrag, true);
    }
    
    /**
     * 窗口大小调整功能 - 使用更可靠的实现
     */
    private static enableWindowResize(windowElement: HTMLElement, resizeHandle: HTMLElement) {
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let isResizing = false;
        
        // 使用捕获阶段以确保事件不被阻断
        const startResize = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            
            // 记录初始值
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowElement.offsetWidth;
            startHeight = windowElement.offsetHeight;
            
            this.bringToFront(windowElement);
            
            // 设置调整大小时的样式
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
            
            // 使用捕获阶段添加事件监听
            document.addEventListener('mousemove', resize, true);
            document.addEventListener('mouseup', stopResize, true);
        };
        
        const resize = (e: MouseEvent) => {
            if (!isResizing) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // 计算新尺寸
            const width = Math.max(200, startWidth + (e.clientX - startX));
            const height = Math.max(100, startHeight + (e.clientY - startY));
            
            // 设置新尺寸
            windowElement.style.width = `${width}px`;
            windowElement.style.height = `${height}px`;
        };
        
        const stopResize = (e: MouseEvent) => {
            if (!isResizing) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = false;
            
            // 恢复样式
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // 移除事件监听
            document.removeEventListener('mousemove', resize, true);
            document.removeEventListener('mouseup', stopResize, true);
        };
        
        // 直接添加事件监听，使用捕获阶段
        resizeHandle.addEventListener('mousedown', startResize, true);
        
        // 增加调整大小角标的可见性
        resizeHandle.addEventListener('mouseover', () => {
            const icon = resizeHandle.firstChild as HTMLElement;
            if (icon) {
                icon.style.borderColor = '#888';
            }
        }, true);
        
        resizeHandle.addEventListener('mouseout', () => {
            const icon = resizeHandle.firstChild as HTMLElement;
            if (icon) {
                icon.style.borderColor = '#555';
            }
        }, true);
    }
    
    /**
     * 应用额外的点击处理，确保窗口内容可点击
     */
    private static applyExtraClickHandling(element: HTMLElement): void {
        // 监听所有鼠标事件
        const events = ['click', 'mousedown', 'mouseup'];
        
        // 确保所有子元素可以接收点击事件
        function processElement(el: HTMLElement) {
            // 为按钮和输入框特别添加高优先级事件处理
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || 
                el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' ||
                el.classList.contains('example-button')) {
                
                events.forEach(eventType => {
                    el.addEventListener(eventType, (e) => {
                        e.stopPropagation();
                    }, true);
                });
            }
            
            // 递归处理所有子元素
            Array.from(el.children).forEach(child => {
                processElement(child as HTMLElement);
            });
        }
        
        // 开始处理
        setTimeout(() => {
            processElement(element);
        }, 100);
        
        // 监控DOM变化，为新添加的元素添加事件监听
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // 元素节点
                            processElement(node as HTMLElement);
                        }
                    });
                }
            });
        });
        
        // 配置并启动观察器
        observer.observe(element, { 
            childList: true, 
            subtree: true 
        });
    }
    
    /**
     * 将窗口置于前台
     */
    private static bringToFront(windowElement: HTMLElement) {
        // 获取当前最高的z-index
        let maxZIndex = 9999;
        this.activeWindows.forEach(id => {
            const win = document.getElementById(id);
            if (win && win !== windowElement) {
                const zIndex = parseInt(getComputedStyle(win).zIndex || '9999');
                maxZIndex = Math.max(maxZIndex, zIndex);
            }
        });
        
        // 设置更高的z-index
        windowElement.style.zIndex = (maxZIndex + 1).toString();
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
        windowElement.style.width = `${Math.max(200, width)}px`;
        windowElement.style.height = `${Math.max(100, height)}px`;
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
                
                <button class="example-button" id="example-button">测试按钮</button>
            </div>
        `;
        
        // 为DOM变化添加一个小延迟，确保内容已加载
        setTimeout(() => {
            // 添加按钮交互逻辑
            const testButton = contentElement.querySelector('#example-button') as HTMLElement;
            if (testButton) {
                // 使用捕获阶段添加事件
                testButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    alert('您点击了示例窗口中的按钮！');
                }, true);
            }
            
            // 为输入框添加事件
            const inputField = contentElement.querySelector('.example-input') as HTMLInputElement;
            if (inputField) {
                inputField.addEventListener('click', (e) => {
                    e.stopPropagation();
                }, true);
                
                inputField.addEventListener('input', (e) => {
                    e.stopPropagation();
                }, true);
            }
        }, 100);
        
        return { windowElement, contentElement, close };
    }
}

// 引擎初始化时调用
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    // 启动主窗口
    //UIWindowLib.showExampleWindow();
})