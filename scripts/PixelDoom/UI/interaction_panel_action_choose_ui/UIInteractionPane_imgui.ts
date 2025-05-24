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
  
  import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
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
  pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
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
      // Calculate appropriate height based on button count
      const buttonCount = InteractionUIState.buttons.length;
      const height = Math.min(400, Math.max(200, buttonCount * 40 + 40));
      
      // Create a custom render function for our window
      const renderFunction = () => {
        for (const buttonContent of InteractionUIState.buttons) {
          // Create a full-width button for each option
          if (ImGui.Button(buttonContent, new ImGui.ImVec2(-1, 30))) {
            console.log('Button clicked:', buttonContent);
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonContent });
          }
          
          // Add some spacing between buttons
          ImGui.Spacing();
        }
      };
      
      // Create the ImGui window
      const pos = this.calculateBottomRightPosition(600, height);
      
      // Create a window with our custom renderer using the ToolWindow method
      Imgui_chunchun.CreateToolWindow(
        InteractionUIState.windowId,
        windowName,
        InteractionUIState.buttons.map(buttonContent => ({
          name: buttonContent,
          callback: () => {
            console.log('Button clicked:', buttonContent);
            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonContent });
          }
        }))
      );
    }
    
    // Helper method to calculate bottom-right position
    private static calculateBottomRightPosition(width: number, height: number): { x: number, y: number } {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      const x = viewportWidth - width - 500; // 20px right margin
      const y = viewportHeight - height - 500; // 20px bottom margin
      
      return { x, y };
    }
  }
  
  