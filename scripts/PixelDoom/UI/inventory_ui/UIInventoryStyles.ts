// CSS样式管理类
export class UIInventoryStyles {
    private static stylesInitialized = false;

    // 初始化CSS样式
    public static initStyles(): void {
        if (this.stylesInitialized) {
            return;
        }

        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* 库存容器样式 */
            .inventory-container {
                position: fixed;
                background-color: #000000;
                border: 1px solid #333333;
                border-radius: 2px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                padding: 10px;
                display: flex;
                flex-direction: column;
                width: 225px;
                height: 380px;
                opacity: 0;
                z-index: 5000;
                font-family: Arial, sans-serif;
                color: #d0d0d0;
                resize: none;
                overflow: hidden;
                transition: opacity 0.2s ease-out, transform 0.2s ease-out;
            }
            
            /* 新创建的库存容器初始状态 */
            .inventory-container:not(.inventory-open):not(.inventory-close) {
                opacity: 0;
                transform: scale(0.95);
            }
            
            /* 库存拖拽句柄 */
            .inventory-drag-handle {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 26px;
                cursor: move;
                z-index: 5002;
                user-select: none;
            }
            
            /* 调整大小按钮样式 */
            .inventory-resize-button {
                position: absolute;
                bottom: 3px;
                right: 3px;
                width: 10px;
                height: 10px;
                cursor: nwse-resize;
                z-index: 5010;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
                pointer-events: auto;
                opacity: 0.7;
            }
            
            /* 调整大小指示器的图标 */
            .resize-icon {
                position: relative;
                width: 100%;
                height: 100%;
                border-right: 2px solid #3a3a3a;
                border-bottom: 2px solid #3a3a3a;
            }
            
            /* 按钮悬停效果 */
            .inventory-resize-button:hover {
                opacity: 1;
            }
            
            /* 按钮激活效果 */
            .inventory-resize-button:active,
            .inventory-container.resizing .inventory-resize-button {
                opacity: 1;
            }
            
            /* 库存头部样式 */
            .inventory-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333333;
                color: #e0e0e0;
                z-index: 5001;
                pointer-events: auto;
                background-color: rgba(0, 0, 0, 0.29);
                padding: 5px 10px;
                border-radius: 2px;
                height: 15px;
            }
            
            /* 为库存类型添加不同的颜色 */
            #main-inventory .inventory-header {
                border-bottom-color: #333333;
            }
            
            #other-inventory .inventory-header {
                border-bottom-color: #333333;
            }
            
            .inventory-title {
                font-size: 11px;
                font-weight: normal;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 50%;
                text-align: left;
            }
            
            /* 提示文本样式 */
            .inventory-header span:last-child {
                font-size: 11px;
                font-style: italic;
                color: #aaaaaa;
                white-space: nowrap;
                text-align: right;
            }
            
            .sort-button, .close-button {
                background-color: #222222;
                color: #d0d0d0;
                border: 1px solid #333333;
                border-radius: 2px;
                padding: 5% 10% !important; 
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 5001;
                width: 20% !important; 
                height: 15% !important; 
                box-sizing: border-box; 
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px; 
                white-space: nowrap; 
            }
            
            .sort-button:hover, .close-button:hover {
                background-color: #333333;
                color: #ffffff;
            }
            
            .close-button {
                background-color: #332222;
            }
            
            .close-button:hover {
                background-color: #553333;
            }
            
            /* 库存打开动画 */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* 库存关闭动画 */
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }
            
            .inventory-open {
                animation: fadeIn 0.2s ease-out forwards;
            }
            
            .inventory-close {
                animation: fadeOut 0.2s ease-out forwards;
            }
            
            /* 整理完成通知 */
            .inventory-notification {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #000000;
                color: #e0e0e0;
                padding: 10px 20px;
                border-radius: 2px;
                border: 1px solid #333333;
                font-size: 14px;
                z-index: 5001;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                animation: notification-appear 0.2s ease-out;
            }
            
            @keyframes notification-appear {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            .inventory-notification.fade-out {
                animation: notification-disappear 0.2s ease-out forwards;
            }
            
            @keyframes notification-disappear {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
            
            /* 物品回弹动画 */
            @keyframes slotBounce {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .slot-bounce {
                animation: slotBounce 0.3s ease;
            }
            
            /* 滚动条容器 */
            .inventory-scroll-container {
                overflow-y: auto;
                flex-grow: 1;
                padding-right: 10px;
                margin-right: -10px;
                scrollbar-width: thin;
                scrollbar-color: #333333 #000000;
                width: 100%;
            }
            
            /* 自定义滚动条 */
            .inventory-scroll-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-track {
                background: #000000;
                border-radius: 2px;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb {
                background-color: #333333;
                border-radius: 2px;
                border: 1px solid #000000;
            }
            
            .inventory-scroll-container::-webkit-scrollbar-thumb:hover {
                background-color: #444444;
            }
            
            /* 库存网格 */
            .inventory-grid {
                display: grid;
                gap: 5px;
                width: 100%;
                grid-auto-rows: auto;
                justify-content: start;
            }
            
            /* 为主库存和其他库存设置不同的默认位置和视觉样式 */
            #main-inventory {
                left: 25px;
                top: 50%;
                border-color: #333333;
            }
            
            #other-inventory {
                right: 50px;
                top: 50%;
                border-color: #333333;
            }
            
            /* 物品格子 */
            .inventory-slot {
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                aspect-ratio: 1 / 1;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                transition: all 0.2s ease;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                margin: 0;
                padding: 0;
            }
            
            .inventory-slot.empty {
                background-color: #0a0a0a;
            }
            
            /* 格子高亮效果 */
            .slot-highlight {
                border-color: #444444;
                background-color: #222222;
                box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
                z-index: 5001;
            }
            
            .slot-highlight.empty {
                background-color: #161616;
            }
            
            /* 源格子样式（拖拽来源） */
            .source-slot {
                background-color: #1a1a1a;
                border: 1px dashed #444444;
                opacity: 0.8;
            }
            
            /* 目标格子样式（可放置区域） */
            .target-slot {
                background-color: #222222;
                border: 1px solid #444444;
                box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
            }
            
            /* 物品样式 */
            .inventory-item {
                width: 90%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e0e0e0;
                font-size: 10px;
                text-align: center;
                word-break: break-word;
                transition: all 0.2s ease;
                cursor: grab;
                position: relative;
                user-select: none;
            }
            
            /* 拖拽中的物品样式 */
            .inventory-item.dragging {
                opacity: 0.5;
                cursor: grabbing;
            }
            
            /* 被拖拽的物品幽灵元素 */
            .dragged-item {
                position: fixed;
                pointer-events: none;
                z-index: 5001;
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                transform: scale(0.8);
                cursor: grabbing;
            }
            
            /* 物品选中效果 */
            .inventory-item.selected {
                transform: scale(1.05);
                background-color: #222222;
            }
            
            /* 物品数量标签 */
            .item-count {
                position: absolute;
                bottom: 2px;
                left: 2px;
                background-color: #000000;
                color: #e0e0e0;
                font-size: 8px;
                padding: 1px 4px;
                border-radius: 2px;
                pointer-events: none;
            }
            
            /* 物品描述面板 */
            .item-description-panel {
                position: fixed;
                background-color: #000000;
                border: 1px solid #333333;
                border-radius: 2px;
                padding: 10px;
                min-width: 200px;
                max-width: 300px;
                z-index: 5002;
                color: #e0e0e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .item-description-panel[style*="display: block"] {
                opacity: 1;
            }
            
            .item-name {
                font-size: 14px;
                font-weight: normal;
                margin-bottom: 5px;
                padding-bottom: 5px;
                border-bottom: 1px solid #333333;
            }
            
            .item-level {
                margin-bottom: 5px;
                font-size: 12px;
            }
            
            .item-description {
                font-size: 12px;
                line-height: 1.4;
            }
            
            /* 不同等级的颜色 */
            .level-top, .item-name[data-level="TOP"] {
                color: #e6c000;
            }
            
            .level-s, .item-name[data-level="S"] {
                color: #e65000;
            }
            
            .level-a\\+, .item-name[data-level="A+"] {
                color: #e60000;
            }
            
            .level-a, .item-name[data-level="A"] {
                color: #e63060;
            }
            
            .level-b, .item-name[data-level="B"] {
                color: #8030e0;
            }
            
            .level-c, .item-name[data-level="C"] {
                color: #3090e0;
            }
            
            .level-d, .item-name[data-level="D"] {
                color: #30c030;
            }
            
            .level-e, .item-name[data-level="E"] {
                color: #c0c0c0;
            }
            
            .level-low, .item-name[data-level="LOW"] {
                color: #909090;
            }
            
            .level-break, .item-name[data-level="BREAK"] {
                color: #606060;
            }
            
            /* 单列模式下的格子样式 */
            .inventory-slot.oneline-slot {
                border-radius: 2px;
                height: 30px !important;
                width: 100% !important;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                padding: 0 10px;
                box-sizing: border-box;
                margin-bottom: 2px;
            }
            
            /* 单列模式下的物品样式 */
            .inventory-item.oneline-item {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                font-size: 11px;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            /* 单列模式下的数量标签样式 */
            .item-count.oneline-count {
                position: static;
                margin-left: auto;
                margin-right: 5px;
                padding: 1px 5px;
                font-size: 10px;
                background-color: #000000;
                border-radius: 2px;
            }
            
            /* 单列模式下的高亮效果 */
            .oneline-slot.slot-highlight {
                background-color: #222222;
                border-color: #444444;
            }
            
            /* 单列模式下的源格子样式 */
            .oneline-slot.source-slot {
                background-color: #1a1a1a;
                border: 1px dashed #444444;
            }
            
            /* 单列模式下的目标格子样式 */
            .oneline-slot.target-slot {
                background-color: #222222;
                border: 1px solid #444444;
            }
            
            /* 飞行物品样式 */
            .flying-item {
                position: fixed;
                pointer-events: none;
                z-index: 6000;
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #e0e0e0;
                font-size: 11px;
                text-align: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            /* 飞行物品数量标签 */
            .flying-item .item-count {
                position: absolute;
                bottom: 2px;
                right: 2px;
                background-color: #000000;
                color: #e0e0e0;
                font-size: 9px;
                padding: 2px 4px;
                border-radius: 2px;
            }
            
            /* 飞行物品高亮效果 */
            .flying-item {
                opacity: 0.9;
            }
            
            /* 提示文本样式 */
            .inventory-prompt {
                font-size: 11px;
                font-style: italic;
                color: #aaaaaa;
                white-space: nowrap;
                text-align: right;
                margin-left: auto;
            }
        `;

        document.head.appendChild(styleElement);
        this.stylesInitialized = true;
    }

    // 清理样式（用于测试）
    public static cleanupStyles(): void {
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(element => {
            if (element.textContent && element.textContent.includes('.inventory-container')) {
                element.parentNode?.removeChild(element);
            }
        });
        this.stylesInitialized = false;
    }
} 