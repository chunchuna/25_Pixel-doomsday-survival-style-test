
export class PIXArea {
    private static areas: Map<string, {
        triggerArea: number[][],
        wasInTriggerArea: boolean,
        enterCallback: (() => void) | null,
        exitCallback: (() => void) | null
    }> = new Map();
    
    /**
     * Creates a new area trigger
     * @param id Unique identifier for this area
     * @param triggerArea Array of points defining the polygon trigger area [[x1,y1], [x2,y2], ...]
     * @param targetObject Optional target object to initialize position
     */
    public static Create(id: string, triggerArea: number[][], targetObject?: any): void {
        PIXArea.areas.set(id, {
            triggerArea,
            wasInTriggerArea: false,
            enterCallback: null,
            exitCallback: null
        });
        
        // If target object is provided, initialize with its position
        if (targetObject) {
            PIXArea.Update(id, targetObject.x, targetObject.y);
        }
    }
    
    /**
     * Updates the area trigger with new position
     * @param id Area identifier
     * @param x X coordinate to check
     * @param y Y coordinate to check
     */
    public static Update(id: string, x: number, y: number): void {
        const area = PIXArea.areas.get(id);
        if (!area) return;
        
        const isInArea = PIXArea.IsPointInPolygon(id, x, y);
        
        // Check if entering trigger area
        if (!area.wasInTriggerArea && isInArea) {
            if (area.enterCallback) {
                area.enterCallback();
            }
        }
        
        // Check if exiting trigger area
        if (area.wasInTriggerArea && !isInArea) {
            if (area.exitCallback) {
                area.exitCallback();
            }
        }
        
        // Update state for next frame
        area.wasInTriggerArea = isInArea;
    }
    
    /**
     * Sets the callback function for when an object enters the area
     * @param id Area identifier
     * @param callback Function to call when entering area
     */
    public static SetEnterCallback(id: string, callback: () => void): void {
        const area = PIXArea.areas.get(id);
        if (area) {
            area.enterCallback = callback;
        }
    }
    
    /**
     * Sets the callback function for when an object exits the area
     * @param id Area identifier
     * @param callback Function to call when exiting area
     */
    public static SetExitCallback(id: string, callback: () => void): void {
        const area = PIXArea.areas.get(id);
        if (area) {
            area.exitCallback = callback;
        }
    }
    
    /**
     * Checks if a point is inside the polygon area
     * @param id Area identifier
     * @param x X coordinate
     * @param y Y coordinate
     * @returns True if point is inside polygon
     */
    public static IsPointInPolygon(id: string, x: number, y: number): boolean {
        const area = PIXArea.areas.get(id);
        if (!area) return false;
        
        // Ray-casting algorithm to determine if point is inside polygon
        let inside = false;
        
        for (let i = 0, j = area.triggerArea.length - 1; i < area.triggerArea.length; j = i++) {
            const xi = area.triggerArea[i][0];
            const yi = area.triggerArea[i][1];
            const xj = area.triggerArea[j][0];
            const yj = area.triggerArea[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Checks if currently inside the area
     * @param id Area identifier
     * @returns True if inside area
     */
    public static IsInArea(id: string): boolean {
        const area = PIXArea.areas.get(id);
        return area ? area.wasInTriggerArea : false;
    }
    
    /**
     * Sets a new area
     * @param id Area identifier
     * @param triggerArea New polygon points
     */
    public static SetArea(id: string, triggerArea: number[][]): void {
        const area = PIXArea.areas.get(id);
        if (area) {
            area.triggerArea = triggerArea;
        }
    }
    
    /**
     * Removes an area
     * @param id Area identifier to remove
     */
    public static Remove(id: string): void {
        PIXArea.areas.delete(id);
    }
}