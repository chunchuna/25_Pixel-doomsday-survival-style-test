// 在文件顶部添加全局类型声明
/**
 * Interaction Window Implementation
 * 
 * Update Notes:
 * 1. Interaction window displays in bottom right corner by default
 * 2. Window maintains bottom right position when resized
 * 3. Added WindowName parameter for custom window title
 * 4. Fixed issue where window couldn't be reopened after closing
 * 5. Changed display to list mode with columns (Button Name, Button ID, Source)
 * 6. Updated parsing method to handle IDs in format "Name{ID}"
 */
declare global {
  interface Window {
    pixelDoomClickHandlerSet?: boolean;
  }
}

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { ClickObject, LastestChooseObject } from "../../Module/PIXClickObject.js";
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";

// Store window references and state
class InteractionUIState {
  static windowElement: HTMLElement | null = null;
  static contentElement: HTMLElement | null = null;
  static closeFunction: (() => void) | null = null;
  static buttonsContainer: HTMLElement | null = null;
  static isInitialized: boolean = false;
  static isWindowDestroyed: boolean = false;
  static resizeHandler: (() => void) | null = null;
}

// Interface for button data
interface ButtonData {
  name: string;
  id: string;
  source?: string;
}

/** Initialization */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
  initInteractionUI();
  //UIInteractionPanelActionChooseMain.ShowChoosePanle()
  // AddChooseButtonIntoPanel("a", 1)
  // AddChooseButtonIntoPanel("a", 1)

  //UIInteractionPanelActionChooseMain.ExplainConetntToButton("use,destroy,check,fix,collect,hide,寻找,闻,标记,在服务器上标记,特殊事件,强行使用,上锁,权限控制")
})

function initInteractionUI() {
  // Using window library doesn't require extra DOM elements
  InteractionUIState.isInitialized = true;
}

// Add global click handler to ensure events are properly processed
function ensureClickHandling() {
  // If global click event handler hasn't been set up
  if (!window.pixelDoomClickHandlerSet) {
    // Mark as set up to avoid duplication
    window.pixelDoomClickHandlerSet = true;
    
    // Add global style to ensure all list items are clickable
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .interaction-item {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 10000 !important;
      }
      .interaction-list {
        width: 100%;
        border-collapse: collapse;
      }
      .interaction-list th {
        background-color: #444;
        color: #e0e0e0;
        padding: 8px;
        text-align: left;
        font-weight: bold;
        border-bottom: 2px solid #555;
      }
      .interaction-list td {
        padding: 8px;
        border-bottom: 1px solid #555;
      }
      .interaction-list tr:hover {
        background-color: #444;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add global click event delegation
    document.addEventListener('click', function(e) {
      const target = e.target as HTMLElement;
      const row = target.closest('.interaction-item') as HTMLElement;
      
      if (row && row.classList.contains('interaction-item')) {
        // Get button ID from data attribute
        const buttonId = row.getAttribute('data-button-id') || '';
        const buttonName = row.getAttribute('data-button-name') || '';
        
        console.log('Global delegation captured click:', buttonName, 'ID:', buttonId);
        
        // Trigger event with button ID
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonId });
      }
    }, true); // Use capture phase
  }
}

// Helper function: Position window to bottom right
function positionWindowToBottomRight(windowElement: HTMLElement) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = parseInt(windowElement.style.width);
  const windowHeight = parseInt(windowElement.style.height);
  
  // Set window position to bottom right with margin
  const rightPosition = viewportWidth - windowWidth - 20; // 20px right margin
  const bottomPosition = viewportHeight - windowHeight - 20; // 20px bottom margin
  
  UIWindowLib.setPosition(windowElement, rightPosition, bottomPosition);
}

export class UIInteractionPanelActionChooseMain {
  // Store callbacks for open and close events
  private static openCallbacks: Function[] = [];
  private static closeCallbacks: Function[] = [];

  // Static property to store current window title
  private static currentWindowName: string = "Interaction Options";

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

  // Parse button string to extract name and ID
  private static parseButtonString(buttonString: string): ButtonData {
    const match = buttonString.match(/(.+?)\{(.+?)\}/);
    if (match) {
      return {
        name: match[1].trim(),
        id: match[2].trim()
      };
    }
    // If no ID format found, use the string as both name and ID
    return {
      name: buttonString.trim(),
      id: buttonString.trim()
    };
  }

  // Show UI panel
  static ShowChoosePanle(windowName: string = "Interaction Options") {
    // Save current window title
    this.currentWindowName = windowName;
    
    // Ensure window state is initialized
    InteractionUIState.isWindowDestroyed = false;
    
    // Ensure global click handler is set up
    ensureClickHandling();
    
    // Remove previous window resize listener if exists
    if (InteractionUIState.resizeHandler) {
      window.removeEventListener('resize', InteractionUIState.resizeHandler);
      InteractionUIState.resizeHandler = null;
    }
    
    // Completely rebuild window
    if (InteractionUIState.windowElement) {
      try {
        // Try to remove old window first
        if (InteractionUIState.windowElement.parentNode) {
          InteractionUIState.windowElement.parentNode.removeChild(InteractionUIState.windowElement);
        }
      } catch (e) {
        console.error("Failed to remove old window:", e);
      }
      
      // Reset all states
      InteractionUIState.windowElement = null;
      InteractionUIState.contentElement = null;
      InteractionUIState.buttonsContainer = null;
    }
    
    // Create new window - position will be set to bottom right later
    const { windowElement, contentElement, close } = UIWindowLib.createWindow(
      windowName, // Use provided window title
      500,        // Width - increased for list view
      200,        // Height, initial height set to 200
      1.0         // Opacity
    );
    
    // Save window references
    InteractionUIState.windowElement = windowElement;
    InteractionUIState.contentElement = contentElement;
    InteractionUIState.isWindowDestroyed = false;
    
    // Modify close function to ensure our close method is called correctly
    const ourCloseFunction = () => {
      close(); // Call original close function first
      UIInteractionPanelActionChooseMain.CloseChoosePanle(); // Then call our close method to reset state
    };
    
    // Save our modified close function
    InteractionUIState.closeFunction = ourCloseFunction;
    
    // Find and override close button click handler
    const closeButton = windowElement.querySelector('.pd-window-close') as HTMLElement;
    if (closeButton) {
      // Remove all existing click listeners (must clone and replace element)
      const newCloseButton = closeButton.cloneNode(true) as HTMLElement;
      closeButton.parentNode?.replaceChild(newCloseButton, closeButton);
      
      // Add our own click handler
      newCloseButton.addEventListener('click', (e) => {
        e.stopPropagation();
        ourCloseFunction(); // Use our close function
      }, true);
      
      // Keep hover effect
      newCloseButton.addEventListener('mouseover', () => {
        newCloseButton.style.backgroundColor = '#c14545';
      }, true);
      newCloseButton.addEventListener('mouseout', () => {
        newCloseButton.style.backgroundColor = '#913a3a';
      }, true);
    }
    
    // Set content area style
    contentElement.style.padding = '10px';
    contentElement.style.zIndex = '10000'; // Ensure highest z-index
    
    // Create list container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'interaction_buttons_container_action_choose_ui';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.width = '100%';
    buttonsContainer.style.pointerEvents = 'auto'; // Ensure it can receive click events
    buttonsContainer.style.zIndex = '10001'; // Ensure highest z-index
    
    // Create table for list view
    const table = document.createElement('table');
    table.className = 'interaction-list';
    table.style.width = '100%';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Button Name', 'Button ID', 'Source'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    buttonsContainer.appendChild(table);
    contentElement.appendChild(buttonsContainer);
    
    // Save buttons container reference
    InteractionUIState.buttonsContainer = buttonsContainer;
    
    // Immediately position window to bottom right
    positionWindowToBottomRight(windowElement);
    
    // Add window resize event listener to keep window at bottom right
    const resizeHandler = () => {
      if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
        positionWindowToBottomRight(InteractionUIState.windowElement);
      }
    };
    
    // Save handler reference for later removal
    InteractionUIState.resizeHandler = resizeHandler;
    window.addEventListener('resize', resizeHandler);
    
    // Trigger all open event callbacks
    this.openCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Interaction panel open callback execution error:', error);
      }
    });
  }

  // Close UI panel
  static CloseChoosePanle() {
    // Remove window resize listener
    if (InteractionUIState.resizeHandler) {
      window.removeEventListener('resize', InteractionUIState.resizeHandler);
      InteractionUIState.resizeHandler = null;
    }
    
    // Trigger all close event callbacks
    this.closeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Interaction panel close callback execution error:', error);
      }
    });
    
    // Try to remove window
    try {
      if (InteractionUIState.windowElement && InteractionUIState.windowElement.parentNode) {
        InteractionUIState.windowElement.parentNode.removeChild(InteractionUIState.windowElement);
      }
    } catch (error) {
      console.error('Error closing window:', error);
    }
    
    // Completely reset all states - regardless of success
    InteractionUIState.windowElement = null;
    InteractionUIState.contentElement = null;
    InteractionUIState.buttonsContainer = null;
    InteractionUIState.closeFunction = null;
    InteractionUIState.isWindowDestroyed = true;
  }

  // Add item to the list
  static AddChooseButtonIntoPanel(buttonData: ButtonData, buttonIndex?: number) {
    // Ensure window exists
    if (!InteractionUIState.contentElement || InteractionUIState.isWindowDestroyed) {
      this.ShowChoosePanle(this.currentWindowName);
    }
    
    // Use saved buttons container reference
    const container = InteractionUIState.buttonsContainer;
    if (!container) return;
    
    // Find table body
    const table = container.querySelector('table.interaction-list');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Create table row
    const row = document.createElement('tr');
    row.className = 'interaction-item';
    row.setAttribute('data-button-id', buttonData.id);
    row.setAttribute('data-button-name', buttonData.name);
    
    // Create cells
    const nameCell = document.createElement('td');
    nameCell.textContent = buttonData.name;
    
    const idCell = document.createElement('td');
    idCell.textContent = buttonData.id;
    
    const sourceCell = document.createElement('td');
    sourceCell.textContent = buttonData.source || '';
    
    // Add cells to row
    row.appendChild(nameCell);
    row.appendChild(idCell);
    row.appendChild(sourceCell);
    
    // Add row to table at specified position
    if (buttonIndex !== undefined && buttonIndex >= 0 && buttonIndex < tbody.children.length) {
      tbody.insertBefore(row, tbody.children[buttonIndex]);
    } else {
      tbody.appendChild(row);
    }

    // Animation effect
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
    }, 100 * (buttonIndex !== undefined ? buttonIndex : tbody.children.length - 1));
    
    // Adjust window height to fit content
    if (InteractionUIState.windowElement) {
      const height = Math.min(500, tbody.children.length * 45 + 80); // Limit max height, account for header
      UIWindowLib.setSize(
        InteractionUIState.windowElement, 
        500, // Keep width fixed
        height
      );
      
      // Reposition to bottom right after resizing
      positionWindowToBottomRight(InteractionUIState.windowElement);
    }
  }

  // Parse input string and generate list items
  static ExplainConetntToButton(content: string, windowName: string = "Interaction Options") {
    // Ensure window exists
    if (!InteractionUIState.contentElement || InteractionUIState.isWindowDestroyed) {
      this.ShowChoosePanle(windowName);
    }
    
    const buttonStrings = content.split(',');
    
    // Use saved buttons container reference
    const container = InteractionUIState.buttonsContainer;
    if (!container) return;

    // Find table body
    const table = container.querySelector('table.interaction-list');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) {
      console.error('Table body not found');
      return;
    }
    
    // Clear existing list items
    tbody.innerHTML = '';

    // Add new list items
    buttonStrings.forEach((buttonString: string, index: number) => {
      const buttonData = this.parseButtonString(buttonString);
      UIInteractionPanelActionChooseMain.AddChooseButtonIntoPanel(buttonData, index);
    });
    
    // If window element exists, set window title
    if (InteractionUIState.windowElement) {
      UIWindowLib.setTitle(InteractionUIState.windowElement, windowName);
    }
  }
}

