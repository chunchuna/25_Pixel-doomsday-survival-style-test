import { hf_engine } from "../../engine.js";
import { DebugObjectRenderer, DebugColors } from "../Renderer/DebugObjectRenderer.js";

hf_engine.gl$_ubu_init(()=>{
    // Initialize the area tools when the game starts
    PIXAreaTools.initialize();
})

class PIXAreaTools {
    static AreaTagMode = false;
    private static markedPoints: Array<[number, number]> = [];
    private static pointMarkers: string[] = [];
    private static textMarkers: string[] = [];
    private static polygonMarker: string | null = null;
    private static readonly MAX_POINTS = 4;
    private static statusText: string | null = null;
    
    /**
     * Initialize the area tools
     */
    public static initialize(): void {
        console.log("[PIXAreaTools] 初始化区域标记工具");
        
        // Register key event listener for all keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Toggle area tag mode with F8 key
            if (e.key === 'F8') {
                PIXAreaTools.toggleAreaTagMode();
                return;
            }
            
            // Only process these keys if area tag mode is enabled
            if (!PIXAreaTools.AreaTagMode) return;
            
            // 'E' key to mark a point
            if (e.key.toLowerCase() === 'e') {
                PIXAreaTools.markPointAtMousePosition();
            }
            
            // 'C' key to copy coordinates to clipboard
            if (e.key.toLowerCase() === 'c') {
                PIXAreaTools.copyCoordinatesToClipboard();
            }
            
            // 'R' key to reset/clear all points
            if (e.key.toLowerCase() === 'r') {
                PIXAreaTools.clearAllPoints();
            }
        });
        
        console.log("[PIXAreaTools] 按 F8 键切换区域标记模式");
    }
    
    /**
     * Toggle the area tagging mode on/off
     */
    public static toggleAreaTagMode(): void {
        PIXAreaTools.AreaTagMode = !PIXAreaTools.AreaTagMode;
        console.log(`[PIXAreaTools] 区域标记模式 ${PIXAreaTools.AreaTagMode ? '已启用' : '已禁用'}`);
        
        if (!PIXAreaTools.AreaTagMode) {
            // Clear all points when disabling the mode
            PIXAreaTools.clearAllPoints();
            
            // Clear status message
            if (PIXAreaTools.statusText) {
                DebugObjectRenderer.removeDebugPolygon(PIXAreaTools.statusText);
                PIXAreaTools.statusText = null;
            }
        } else {
            // Show status message when enabled
            PIXAreaTools.showStatusMessage();
        }
    }
    
    /**
     * Show a status message with instructions
     */
    private static showStatusMessage(): void {
        // Remove previous status text if exists
        if (PIXAreaTools.statusText) {
            DebugObjectRenderer.removeDebugPolygon(PIXAreaTools.statusText);
            PIXAreaTools.statusText = null;
        }
        
        // Get screen dimensions from runtime
        const runtime = hf_engine.runtime;
        if (!runtime) return;
        
        const width = runtime.layout.width;
        const height = runtime.layout.height;
        
        // Create a background for the status text
        PIXAreaTools.statusText = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.BLUE, 0.7)
            .setBoxThickness(1)
            .setClosed(true)
            .RenderPolygonFromPoints([
                [10, 10],
                [300, 10],
                [300, 80],
                [10, 80]
            ]);
            
        // Create text lines to represent instructions
        const line1 = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.WHITE)
            .setBoxThickness(2)
            .RenderLine(20, 25, 290, 25);
            
        const line2 = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.WHITE)
            .setBoxThickness(1)
            .RenderLine(20, 40, 290, 40);
            
        const line3 = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.WHITE)
            .setBoxThickness(1)
            .RenderLine(20, 55, 290, 55);
            
        const line4 = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.WHITE)
            .setBoxThickness(1)
            .RenderLine(20, 70, 290, 70);
            
        PIXAreaTools.textMarkers.push(line1, line2, line3, line4);
        
        console.log("[PIXAreaTools] 区域标记模式已激活");
        console.log("[PIXAreaTools] 按 E 标记一个点（最多4个）");
        console.log("[PIXAreaTools] 按 C 复制坐标到剪贴板");
        console.log("[PIXAreaTools] 按 R 重置所有点");
    }
    
    /**
     * Mark a point at the current mouse position
     */
    private static markPointAtMousePosition(): void {
        const runtime = hf_engine.runtime;
        if (!runtime || !runtime.objects.Mouse) {
            console.error("[PIXAreaTools] 找不到鼠标对象");
            return;
        }
        
        // Get mouse position on the GameContent layer
        const mouseX = runtime.objects.Mouse.getMouseX("GameContent");
        const mouseY = runtime.objects.Mouse.getMouseY("GameContent");
        
        // Round coordinates to integers for cleaner display
        const x = Math.round(mouseX);
        const y = Math.round(mouseY);
        
        // Don't add if we already have max points
        if (PIXAreaTools.markedPoints.length >= PIXAreaTools.MAX_POINTS) {
            console.log(`[PIXAreaTools] 已经有 ${PIXAreaTools.MAX_POINTS} 个点。按 R 重置。`);
            return;
        }
        
        // Add to marked points array
        PIXAreaTools.markedPoints.push([x, y]);
        
        // Draw a point marker at this position
        PIXAreaTools.drawPointMarker(x, y, PIXAreaTools.markedPoints.length);
        
        console.log(`[PIXAreaTools] 已标记点 ${PIXAreaTools.markedPoints.length}: [${x}, ${y}]`);
        
        // If we have reached the maximum number of points, draw the polygon
        if (PIXAreaTools.markedPoints.length === PIXAreaTools.MAX_POINTS) {
            PIXAreaTools.drawPolygon();
        }
    }
    
    /**
     * Draw a marker at the specified point
     */
    private static drawPointMarker(x: number, y: number, pointNumber: number): void {
        // Draw a small circle at the point
        const pointKey = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.YELLOW)
            .setBoxThickness(3)
            .RenderLine(x - 5, y - 5, x + 5, y + 5);
            
        // Add a cross to make the point more visible
        const crossKey = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.YELLOW)
            .setBoxThickness(3)
            .RenderLine(x - 5, y + 5, x + 5, y - 5);
            
        // Store the marker keys so we can remove them later
        PIXAreaTools.pointMarkers.push(pointKey, crossKey);
        
        // Log the coordinates to console
        console.log(`点 ${pointNumber}: [${x}, ${y}]`);
    }
    
    /**
     * Draw a polygon connecting all marked points
     */
    private static drawPolygon(): void {
        // Remove previous polygon if exists
        if (PIXAreaTools.polygonMarker) {
            DebugObjectRenderer.removeDebugPolygon(PIXAreaTools.polygonMarker);
            PIXAreaTools.polygonMarker = null;
        }
        
        // Draw polygon using the marked points
        PIXAreaTools.polygonMarker = DebugObjectRenderer
            .setLayer("GameContent")
            .setColorPreset(DebugColors.GREEN)
            .setBoxThickness(2)
            .setClosed(true)
            .RenderPolygonFromPoints(PIXAreaTools.markedPoints);
            
        console.log(`[PIXAreaTools] 已绘制多边形，点坐标: ${JSON.stringify(PIXAreaTools.markedPoints)}`);
        
        // Automatically copy to clipboard
        PIXAreaTools.copyCoordinatesToClipboard();
    }
    
    /**
     * Copy the coordinates to clipboard in the required format
     */
    private static copyCoordinatesToClipboard(): void {
        if (PIXAreaTools.markedPoints.length === 0) {
            console.log("[PIXAreaTools] 没有点可以复制");
            return;
        }
        
        // Format the points as a string in the required format
        const coordinatesString = JSON.stringify(PIXAreaTools.markedPoints);
        
        // Copy to clipboard
        try {
            navigator.clipboard.writeText(coordinatesString)
                .then(() => {
                    console.log(`[PIXAreaTools] 已复制到剪贴板: ${coordinatesString}`);
                    // Show a confirmation message
                    PIXAreaTools.showCopiedMessage(coordinatesString);
                })
                .catch(err => {
                    console.error(`[PIXAreaTools] 复制失败: ${err}`);
                });
        } catch (error) {
            console.error(`[PIXAreaTools] 剪贴板API不可用: ${error}`);
            
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = coordinatesString;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            console.log(`[PIXAreaTools] 已复制到剪贴板（备用方法）: ${coordinatesString}`);
            
            // Show a confirmation message
            PIXAreaTools.showCopiedMessage(coordinatesString);
        }
    }
    
    /**
     * Show a message that coordinates were copied
     */
    private static showCopiedMessage(text: string): void {
        // Get the runtime
        const runtime = hf_engine.runtime;
        if (!runtime) return;
        
        // Log the copied coordinates
        console.log(`[PIXAreaTools] 已复制: ${text}`);
        
        // Flash the polygon to indicate copy success
        if (PIXAreaTools.polygonMarker) {
            // Temporarily change the polygon color to indicate copy success
            const originalPolygon = PIXAreaTools.polygonMarker;
            
            // Create a highlighted version
            const highlightPolygon = DebugObjectRenderer
                .setLayer("GameContent")
                .setColorPreset(DebugColors.CYAN)
                .setBoxThickness(3)
                .setClosed(true)
                .RenderPolygonFromPoints(PIXAreaTools.markedPoints);
                
            // After a short delay, remove the highlight and restore original
            setTimeout(() => {
                DebugObjectRenderer.removeDebugPolygon(highlightPolygon);
            }, 500);
        }
    }
    
    /**
     * Clear all marked points and remove markers
     */
    private static clearAllPoints(): void {
        // Clear all point markers
        PIXAreaTools.pointMarkers.forEach(key => {
            DebugObjectRenderer.removeDebugLine(key);
        });
        
        // Clear text markers
        PIXAreaTools.textMarkers.forEach(key => {
            if (key.startsWith('polygon_')) {
                DebugObjectRenderer.removeDebugPolygon(key);
            } else {
                DebugObjectRenderer.removeDebugLine(key);
            }
        });
        
        // Clear polygon if exists
        if (PIXAreaTools.polygonMarker) {
            DebugObjectRenderer.removeDebugPolygon(PIXAreaTools.polygonMarker);
            PIXAreaTools.polygonMarker = null;
        }
        
        // Reset points array
        PIXAreaTools.markedPoints = [];
        PIXAreaTools.pointMarkers = [];
        PIXAreaTools.textMarkers = [];
        
        console.log("[PIXAreaTools] 已清除所有点");
    }
    
    /**
     * Get the current marked points
     */
    public static getMarkedPoints(): Array<[number, number]> {
        return [...PIXAreaTools.markedPoints];
    }
    
    /**
     * Public method to enable area tag mode from other modules
     */
    public static enableAreaTagMode(): void {
        if (!PIXAreaTools.AreaTagMode) {
            PIXAreaTools.toggleAreaTagMode();
        }
    }
    
    /**
     * Public method to disable area tag mode from other modules
     */
    public static disableAreaTagMode(): void {
        if (PIXAreaTools.AreaTagMode) {
            PIXAreaTools.toggleAreaTagMode();
        }
    }
    
    /**
     * Get the current status of area tag mode
     */
    public static isAreaTagModeEnabled(): boolean {
        return PIXAreaTools.AreaTagMode;
    }
}

// Export the class for use in other modules
export { PIXAreaTools };