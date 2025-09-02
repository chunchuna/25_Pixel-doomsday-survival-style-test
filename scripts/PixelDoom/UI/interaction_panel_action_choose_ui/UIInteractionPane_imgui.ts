/**
 * Interaction window implementation
 * 
 * Update notes:
 * 1. Now uses ImGui instead of DOM elements
 * 2. Window is positioned in the bottom-right corner
 * 3. Window title can be customized
 * 4. Fixed issues with reopening the window after closing
 */
declare global {
    interface Window {
        pixelDoomClickHandlerSet?: boolean;
    }
}

import { Unreal__ } from "../../../engine.js";
import { ClickObject, LastestChooseObject } from "../../Module/PIXClickObject.js";
import { Imgui_chunchun } from "../imgui_lib/imgui.js";

// Store window state
class InteractionUIState {
    static windowId: string = "interaction_panel";
    static isInitialized: boolean = false;
    static isWindowOpen: boolean = false;
    static buttons: Array<string> = [];
    static currentWindowTitle: string = "Interaction Options";
}

/** Initialize */
Unreal__.GameBegin(() => {
    initInteractionUI();
    //UIInteractionPanelActionChooseMain.ShowChoosePanle()
    // AddChooseButtonIntoPanel("a", 1)
    // AddChooseButtonIntoPanel("a", 1)

    //UIInteractionPanelActionChooseMain.ExplainConetntToButton("use,destroy,check,fix,collect,hide,寻找,闻,标记,在服务器上标记,特殊事件,强行使用,上锁,权限控制")
})

function initInteractionUI() {
    // We're using ImGui, so we just need to mark as initialized
    InteractionUIState.isInitialized = true;
}

export class UIInteractionPanelActionChooseMain_imgui {
    // Store callbacks for open and close events
    private static openCallbacks: Function[] = [];
    private static closeCallbacks: Function[] = [];

    // Button size configuration
    private static buttonWidth: number = 120;  // Default width in pixels
    private static buttonHeight: number = 15;  // Default height in pixels
    // Button padding and spacing
    private static buttonSpacing: number = 8;  // Space between buttons
    private static windowPadding: number = 16; // Padding inside window
    // Font size configuration
    private static fontSize: number = 0.5;     // Font scale factor

    // Listen for interaction panel open event
    static OnInteractionOpen(callback: Function) {
        if (typeof callback === 'function') {
            this.openCallbacks.push(callback);
        }
    }

    // Listen for interaction panel close event
    static OnInteractionClose(callback: Function) {
        if (typeof callback === 'function') {
            this.closeCallbacks.push(callback);
        }
    }

    // Display the UI panel
    static ShowChoosePanle(windowName: string = "Interaction Options") {
        // Save current window title
        InteractionUIState.currentWindowTitle = windowName;

        // Ensure ImGui is initialized
        if (!Imgui_chunchun.IsWindowOpen(InteractionUIState.windowId)) {
            try {
                // Create the window using our helper method
                this.createInteractionWindow(windowName);

                InteractionUIState.isWindowOpen = true;

                // Trigger all open event callbacks
                this.openCallbacks.forEach(callback => {
                    try {
                        callback();
                    } catch (error) {
                        console.error('Error executing interaction panel open callback:', error);
                    }
                });
            } catch (error) {
                console.error('Error creating interaction panel:', error);
            }
        }
    }

    // Close the UI panel
    static CloseChoosePanle() {
        if (Imgui_chunchun.IsWindowOpen(InteractionUIState.windowId)) {
            // Close the ImGui window
            Imgui_chunchun.CloseWindow(InteractionUIState.windowId);

            InteractionUIState.isWindowOpen = false;

            // Trigger all close event callbacks
            this.closeCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error executing interaction panel close callback:', error);
                }
            });
        }
    }

    // Add a button to the panel
    static AddChooseButtonIntoPanel(ButtonContent: string, ButtonIndex: any) {
        // Ensure window exists
        if (!InteractionUIState.isWindowOpen) {
            this.ShowChoosePanle(InteractionUIState.currentWindowTitle);
        }

        // Add button to array at specific index
        if (ButtonIndex !== undefined && ButtonIndex >= 0 && ButtonIndex < InteractionUIState.buttons.length) {
            InteractionUIState.buttons.splice(ButtonIndex, 0, ButtonContent);
        } else {
            InteractionUIState.buttons.push(ButtonContent);
        }

        // We need to recreate the window with updated buttons
        if (InteractionUIState.isWindowOpen) {
            // First close the existing window
            Imgui_chunchun.CloseWindow(InteractionUIState.windowId);

            // Then recreate it with updated buttons
            this.createInteractionWindow(InteractionUIState.currentWindowTitle);
        }
    }

    // Parse content and generate buttons
    static ExplainConetntToButton(Conteng: string, WindowName: string = "Interaction Options") {
        // Parse button list
        const ButtonList = Conteng.split(',');

        // Clear existing buttons
        InteractionUIState.buttons = [];

        // Add new buttons
        ButtonList.forEach((ButtonContent: string) => {
            InteractionUIState.buttons.push(ButtonContent.trim());
        });

        // Update the window if it exists
        if (InteractionUIState.isWindowOpen) {
            // Close existing window
            Imgui_chunchun.CloseWindow(InteractionUIState.windowId);
        }

        // Create a new window with the updated title and buttons
        this.createInteractionWindow(WindowName);
        InteractionUIState.isWindowOpen = true;
    }

    // Helper method to create the interaction window
    private static createInteractionWindow(windowName: string) {
        // Calculate appropriate window size based on button count and size
        const buttonCount = InteractionUIState.buttons.length;
        
        // Calculate window width based on button width
        // If buttonWidth is -1 (full width), use a default width of 300
        const windowWidth = this.buttonWidth > 0 ? 
            Math.max(300, this.buttonWidth + this.windowPadding * 2) : 300;
            
        // Calculate total height needed for all buttons
        const totalButtonsHeight = buttonCount * (this.buttonHeight + this.buttonSpacing);
        
        // Add padding and title bar height
        const windowHeight = Math.min(600, Math.max(150, totalButtonsHeight + this.windowPadding * 2 + 30));

        // Position window in bottom-right
        const pos = this.calculateBottomRightPosition(windowWidth, windowHeight);

        // Create a custom window instead of using CreateToolWindow
        Imgui_chunchun.CreateTextWindow(
            InteractionUIState.windowId,
            windowName,
            "", // No initial text
            pos // Position
        );

        // Get the ImGui global object
        const ImGui = globalThis.ImGui;

        // Override the render callback with our custom one
        // Access internal structure using type assertion
        const imgui = Imgui_chunchun as any;
        if (imgui.windows && imgui.windows.get) {
            const windowConfig = imgui.windows.get(InteractionUIState.windowId);
            if (windowConfig) {
                // Set window size based on our calculations
                windowConfig.size = { width: windowWidth, height: windowHeight };
                windowConfig.renderCallback = () => {
                    // Apply font scaling
                    if (this.fontSize !== 1.0) {
                        ImGui.PushFont(null); // Use default font
                        const io = ImGui.GetIO();
                        const prevScale = io.FontGlobalScale;
                        io.FontGlobalScale = this.fontSize;
                    }
                    
                    // Custom render with our desired button size
                    for (const buttonContent of InteractionUIState.buttons) {
                        // Here's where we set the button size
                        if (ImGui.Button(buttonContent, new ImGui.ImVec2(this.buttonWidth, this.buttonHeight))) {
                            console.log('Button clicked:', buttonContent);
                            Unreal__.SendEvent("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonContent });
                        }

                        ImGui.Spacing();
                    }
                    
                    // Restore font scaling
                    if (this.fontSize !== 1.0) {
                        const io = ImGui.GetIO();
                        io.FontGlobalScale = 1.0;
                        ImGui.PopFont();
                    }
                };
            }
        }

        InteractionUIState.isWindowOpen = true;
    }

    // Helper method to calculate bottom-right position
    private static calculateBottomRightPosition(width: number, height: number): { x: number, y: number } {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        const x = viewportWidth - width - 500; // 20px right margin
        const y = viewportHeight - height - 500; // 20px bottom margin

        return { x, y };
    }

    /**
     * Set button size
     * @param width Button width in pixels (-1 for full width)
     * @param height Button height in pixels
     */
    static SetButtonSize(width: number, height: number) {
        if (height > 0) {
            this.buttonHeight = height;
        }

        this.buttonWidth = width;

        // Update the window if it's already open
        if (InteractionUIState.isWindowOpen) {
            this.CloseChoosePanle();
            this.ShowChoosePanle(InteractionUIState.currentWindowTitle);
        }
    }
    
    /**
     * Set font size
     * @param scale Font scale factor (1.0 is normal size, 2.0 is double size)
     */
    static SetFontSize(scale: number) {
        if (scale > 0) {
            this.fontSize = scale;
            
            // Update the window if it's already open
            if (InteractionUIState.isWindowOpen) {
                this.CloseChoosePanle();
                this.ShowChoosePanle(InteractionUIState.currentWindowTitle);
            }
        }
    }
    
    /**
     * Set button spacing
     * @param spacing Space between buttons in pixels
     */
    static SetButtonSpacing(spacing: number) {
        if (spacing >= 0) {
            this.buttonSpacing = spacing;
            
            // Update the window if it's already open
            if (InteractionUIState.isWindowOpen) {
                this.CloseChoosePanle();
                this.ShowChoosePanle(InteractionUIState.currentWindowTitle);
            }
        }
    }
}

