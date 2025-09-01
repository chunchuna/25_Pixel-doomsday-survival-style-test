import { hf_engine } from "../../../engine.js";
import { AmbientLight } from "../../Module/PIXAmbientLight.js";

// DOM element for the watch
let watchElement: HTMLDivElement | null = null;
// Canvas for drawing the watch face
let watchCanvas: HTMLCanvasElement | null = null;
// Canvas context for drawing
let ctx: CanvasRenderingContext2D | null = null;

// Watch visibility state
let isWatchVisible: boolean = false;

// Game time settings
const GAME_DAY_START = 7; // 7 AM
const GAME_NIGHT_START = 19; // 7 PM
const HOURS_PER_DAY = 24;

hf_engine.gl$_ubu_init(() => {


    if (hf_engine.runtime.layout.name !== "Level") return
    // Initialize the watch when the game starts
    Watch.initialize();

    // Register for day/night events from AmbientLight
    AmbientLight.onDayStart(() => {
        console.log("Watch detected day start");
        // Update watch to show day time
        Watch.updateWatchFace();
    });

    AmbientLight.onNightStart(() => {
        console.log("Watch detected night start");
        // Update watch to show night time
        Watch.updateWatchFace();
    });



    Watch.show();
})


hf_engine.gl$_layout_end(() => {
    if (hf_engine.runtime.layout.name !== "Level") return
    Watch.hide();
    AmbientLight.removeDayStartListener(Watch.updateWatchFace)
    AmbientLight.removeNightStartListener(Watch.updateWatchFace)
    

})

hf_engine.gl$_ubu_update(() => {
    // Update the watch every frame if visible
    if (isWatchVisible) {
        Watch.updateWatchFace();
    }
})

class Watch {
    // Watch dimensions
    private static readonly WATCH_SIZE = 100;
    private static readonly WATCH_RADIUS = Watch.WATCH_SIZE / 2;

    // Watch colors - now configurable
    private static watchFaceColor: string = "rgba(179,181,250,0.96)";
    private static watchBorderColor: string = "#333333";
    private static hourHandColor: string = "#333333";
    private static minuteHandColor: string = "#555555";
    private static secondHandColor: string = "#ff0000";
    private static hourMarksColor: string = "#333333";
    private static textColor: string = "#333333";

    // Watch hand lengths
    private static readonly HOUR_HAND_LENGTH = Watch.WATCH_RADIUS * 0.5;
    private static readonly MINUTE_HAND_LENGTH = Watch.WATCH_RADIUS * 0.7;
    private static readonly SECOND_HAND_LENGTH = Watch.WATCH_RADIUS * 0.8;

    /**
     * Initialize the watch display
     */
    public static initialize(): void {
        // Create watch container element
        watchElement = document.createElement("div");
        watchElement.id = "game-watch";
        watchElement.style.position = "fixed";
        watchElement.style.left = "10px";
        watchElement.style.top = "10px";
        watchElement.style.zIndex = "1000";

        // Create canvas for the watch face
        watchCanvas = document.createElement("canvas");
        watchCanvas.width = Watch.WATCH_SIZE;
        watchCanvas.height = Watch.WATCH_SIZE;
        watchCanvas.style.display = "block";

        // Add canvas to the container
        watchElement.appendChild(watchCanvas);

        // Add container to the document
        document.body.appendChild(watchElement);

        // Get canvas context for drawing
        ctx = watchCanvas.getContext("2d");

        console.log("Watch initialized");

        // Hide watch by default
        watchElement.style.display = "none";
        isWatchVisible = false;
    }

    /**
     * Show the watch
     */
    public static show(): void {
        if (!watchElement) {
            this.initialize();
        }

        if (watchElement) {
            watchElement.style.display = "block";
            isWatchVisible = true;
            console.log("Watch shown");

            // Initial draw
            this.updateWatchFace();
        }
    }

    /**
     * Hide the watch
     */
    public static hide(): void {
        if (watchElement) {
            watchElement.style.display = "none";
            isWatchVisible = false;
            console.log("Watch hidden");
        }
    }

    /**
     * Toggle watch visibility
     */
    public static toggle(): void {
        if (isWatchVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Check if watch is currently visible
     */
    public static isVisible(): boolean {
        return isWatchVisible;
    }

    /**
     * Set watch colors
     */
    public static setColors(options: {
        faceColor?: string,
        borderColor?: string,
        hourHandColor?: string,
        minuteHandColor?: string,
        secondHandColor?: string,
        hourMarksColor?: string,
        textColor?: string
    }): void {
        if (options.faceColor) this.watchFaceColor = options.faceColor;
        if (options.borderColor) this.watchBorderColor = options.borderColor;
        if (options.hourHandColor) this.hourHandColor = options.hourHandColor;
        if (options.minuteHandColor) this.minuteHandColor = options.minuteHandColor;
        if (options.secondHandColor) this.secondHandColor = options.secondHandColor;
        if (options.hourMarksColor) this.hourMarksColor = options.hourMarksColor;
        if (options.textColor) this.textColor = options.textColor;

        console.log("Watch colors updated");

        // Update the watch face if visible
        if (isWatchVisible) {
            this.updateWatchFace();
        }
    }

    /**
     * Reset colors to default
     */
    public static resetColors(): void {
        this.watchFaceColor = "#f5f5f5";
        this.watchBorderColor = "#333333";
        this.hourHandColor = "#333333";
        this.minuteHandColor = "#555555";
        this.secondHandColor = "#ff0000";
        this.hourMarksColor = "#333333";
        this.textColor = "#333333";

        console.log("Watch colors reset to default");

        // Update the watch face if visible
        if (isWatchVisible) {
            this.updateWatchFace();
        }
    }

    /**
     * Update the watch face based on the current game time
     */
    public static updateWatchFace(): void {
        if (!ctx || !watchCanvas) return;

        // Clear the canvas
        ctx.clearRect(0, 0, watchCanvas.width, watchCanvas.height);

        // Calculate current game time based on AmbientLight cycle
        const gameTime = this.calculateGameTime();

        // Draw watch components
        this.drawWatchFace(ctx);
        this.drawWatchHands(ctx, gameTime);
    }

    /**
     * Calculate the current game time based on AmbientLight state
     * @returns Object with hours and minutes
     */
    private static calculateGameTime(): { hours: number, minutes: number } {
        // Default time (in case AmbientLight is not available)
        let hours = 12;
        let minutes = 0;

        if (!AmbientLight.dayNightCycle.isRunning) {
            // If cycle is not running, use the current phase to determine approximate time
            if (AmbientLight.dayNightCycle.currentPhase === "day") {
                hours = 12; // Noon
            } else {
                hours = 0; // Midnight
            }
        } else {
            // If cycle is running, calculate time based on transition progress
            const currentTime = performance.now() / 1000;

            if (AmbientLight.transition.isActive) {
                const elapsed = currentTime - AmbientLight.transition.startTime;
                const progress = Math.min(elapsed / AmbientLight.transition.duration, 1);

                if (AmbientLight.dayNightCycle.currentPhase === "day") {
                    // Transitioning from day to night
                    // Map from GAME_DAY_START (7) to GAME_NIGHT_START (19)
                    const dayHours = GAME_NIGHT_START - GAME_DAY_START;
                    hours = GAME_DAY_START + (progress * dayHours);
                } else {
                    // Transitioning from night to day
                    // Map from GAME_NIGHT_START (19) to GAME_DAY_START + 24 (31, which wraps to 7)
                    const nightHours = (GAME_DAY_START + HOURS_PER_DAY) - GAME_NIGHT_START;
                    hours = GAME_NIGHT_START + (progress * nightHours);
                    if (hours >= HOURS_PER_DAY) {
                        hours -= HOURS_PER_DAY;
                    }
                }

                // Calculate minutes (fractional part of hours * 60)
                const fractionalHours = hours - Math.floor(hours);
                minutes = Math.floor(fractionalHours * 60);
                hours = Math.floor(hours);
            } else {
                // If not in transition, use the current phase
                if (AmbientLight.dayNightCycle.currentPhase === "day") {
                    hours = 12; // Middle of day
                } else {
                    hours = 0; // Middle of night
                }
            }
        }

        return { hours, minutes };
    }

    /**
     * Draw the watch face (circle, hour marks)
     */
    private static drawWatchFace(ctx: CanvasRenderingContext2D): void {
        const centerX = Watch.WATCH_SIZE / 2;
        const centerY = Watch.WATCH_SIZE / 2;
        const radius = Watch.WATCH_RADIUS - 2; // Slightly smaller to fit border

        // Draw watch face (circle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.watchFaceColor;
        ctx.fill();

        // Draw watch border
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.watchBorderColor;
        ctx.stroke();

        // Draw hour marks
        for (let hour = 0; hour < 12; hour++) {
            const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;

            // Calculate start and end points for hour marks
            const isMainHour = hour % 3 === 0;
            const innerRadius = isMainHour ? radius - 10 : radius - 5;

            const startX = centerX + innerRadius * Math.cos(angle);
            const startY = centerY + innerRadius * Math.sin(angle);
            const endX = centerX + radius * Math.cos(angle);
            const endY = centerY + radius * Math.sin(angle);

            // Draw hour mark
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = isMainHour ? 2 : 1;
            ctx.strokeStyle = this.hourMarksColor;
            ctx.stroke();
        }
    }

    /**
     * Draw the watch hands (hour, minute)
     */
    private static drawWatchHands(ctx: CanvasRenderingContext2D, time: { hours: number, minutes: number }): void {
        const centerX = Watch.WATCH_SIZE / 2;
        const centerY = Watch.WATCH_SIZE / 2;

        // Convert 24-hour format to 12-hour format for the watch
        const hours12 = time.hours % 12;
        const minutes = time.minutes;

        // Calculate hour hand angle (30 degrees per hour + partial hour adjustment)
        const hourAngle = ((hours12 + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;

        // Calculate minute hand angle (6 degrees per minute)
        const minuteAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;

        // Draw hour hand
        this.drawHand(ctx, centerX, centerY, hourAngle, Watch.HOUR_HAND_LENGTH, 4, this.hourHandColor);

        // Draw minute hand
        this.drawHand(ctx, centerX, centerY, minuteAngle, Watch.MINUTE_HAND_LENGTH, 2, this.minuteHandColor);

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.hourHandColor;
        ctx.fill();

        // Add day/night indicator
        this.drawDayNightIndicator(ctx, time.hours);

        // Add digital time display
        this.drawDigitalTime(ctx, time.hours, time.minutes);
    }

    /**
     * Draw a watch hand
     */
    private static drawHand(
        ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        angle: number,
        length: number,
        width: number,
        color: string
    ): void {
        const endX = centerX + length * Math.cos(angle);
        const endY = centerY + length * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    /**
     * Draw day/night indicator
     */
    private static drawDayNightIndicator(ctx: CanvasRenderingContext2D, hours: number): void {
        const isDaytime = hours >= GAME_DAY_START && hours < GAME_NIGHT_START;
        const indicatorY = Watch.WATCH_SIZE - 20;

        ctx.font = "10px Arial";
        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.fillText(isDaytime ? "DAY" : "NIGHT", Watch.WATCH_SIZE / 2, indicatorY);
    }

    /**
     * Draw digital time display
     */
    private static drawDigitalTime(ctx: CanvasRenderingContext2D, hours: number, minutes: number): void {
        // Format time as HH:MM
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        ctx.font = "10px Arial";
        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.fillText(timeString, Watch.WATCH_SIZE / 2, Watch.WATCH_SIZE / 2 + 20);
    }
}

export { Watch };