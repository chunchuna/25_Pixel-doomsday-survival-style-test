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

import { Unreal__ } from "../../../engine.js";
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
  
  // Position storage for remembering user-dragged position
  static savedPosition: { x: number; y: number } | null = null;
  static hasUserDragged: boolean = false;
  static dragStartPosition: { x: number; y: number } | null = null;
  static positionCheckInterval: number | null = null;
  static dragCleanup: (() => void) | null = null;
}

// Interface for button data
interface ButtonData {
  name: string;
  id: string;
  source?: string;
}

/** Initialization */
Unreal__.GameBegin(() => {
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
        transition: background-color 0.3s ease-in-out !important;
      }
      .interaction-list {
        width: 100%;
        border-collapse: collapse;
        color: #d0d0d0;
        font-family: monospace;
      }
      .interaction-list th {
        background-color: rgba(0, 0, 0, 0.4);
        color: #a0a0a0;
        padding: 6px 8px;
        text-align: left;
        font-weight: normal;
        font-size: 10px;
        border-bottom: 1px solid #333333;
        text-transform: lowercase;
        opacity: 0.8;
      }
      .interaction-list td {
        padding: 8px;
        border-bottom: 1px solid #333333;
        background-color: transparent;
        transition: background-color 0.3s ease-in-out;
        font-size: 15px;
      }
      .interaction-list tr:nth-child(odd) td {
        background-color: rgba(0, 0, 0, 0.2);
      }
      .interaction-list tr:hover td {
        background-color: rgba(128, 128, 128, 0.4) !important;
        border-bottom: 1px solid rgba(200, 200, 200, 0.3) !important;
      }
      
      /* First cell in hovered row gets left border */
      .interaction-list tr:hover td:first-child {
        border-left: 2px solid rgba(200, 200, 200, 0.3) !important;
        padding-left: 6px !important;
      }
      
      /* Last cell in hovered row gets right border */
      .interaction-list tr:hover td:last-child {
        border-right: 2px solid rgba(200, 200, 200, 0.3) !important;
      }
      /* Ensure the row itself has proper hover behavior */
      .interaction-list tbody tr {
        transition: background-color 0.3s ease;
        cursor: pointer;
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
        Unreal__.SendEvent("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonId });
        UIInteractionPanelActionChooseMain.CloseChoosePanle();
        
      }
    }, true); // Use capture phase
  }
}

// Helper function: Position window with saved position or default to center
function positionWindowToBottomRight(windowElement: HTMLElement) {
  // Load saved position from localStorage if not already loaded
  if (!InteractionUIState.savedPosition && !InteractionUIState.hasUserDragged) {
    loadSavedPosition();
  }
  
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = parseInt(windowElement.style.width);
  const windowHeight = parseInt(windowElement.style.height);
  
  let targetX: number;
  let targetY: number;
  
  console.log('Positioning window - saved position:', InteractionUIState.savedPosition, 'hasUserDragged:', InteractionUIState.hasUserDragged);
  console.log('Viewport size:', { width: viewportWidth, height: viewportHeight });
  console.log('Window size:', { width: windowWidth, height: windowHeight });
  
  // Use saved position if user has dragged the window before
  if (InteractionUIState.savedPosition && InteractionUIState.hasUserDragged) {
    targetX = InteractionUIState.savedPosition.x;
    targetY = InteractionUIState.savedPosition.y;
    
    // Ensure the window stays within viewport bounds
    targetX = Math.max(0, Math.min(targetX, viewportWidth - windowWidth));
    targetY = Math.max(0, Math.min(targetY, viewportHeight - windowHeight));
    
    console.log('Using saved position - original:', InteractionUIState.savedPosition, 'adjusted:', { x: targetX, y: targetY });
  } else {
    // Default to center position
    targetX = (viewportWidth - windowWidth) / 2;
    targetY = (viewportHeight - windowHeight) / 2;
    
    console.log('Using default center position:', { x: targetX, y: targetY });
  }
  
  console.log('About to call UIWindowLib.setPosition with:', { x: targetX, y: targetY });
  UIWindowLib.setPosition(windowElement, targetX, targetY);
  
  // Verify the position was actually set
  setTimeout(() => {
    const rect = windowElement.getBoundingClientRect();
    console.log('Window actual position after setPosition:', { x: rect.left, y: rect.top });
  }, 100);
}

// Function to save current window position
function saveWindowPosition(windowElement: HTMLElement) {
  const rect = windowElement.getBoundingClientRect();
  const position = {
    x: rect.left,
    y: rect.top
  };
  
  // Save to static variable
  InteractionUIState.savedPosition = position;
  
  // Save to localStorage for persistence
  try {
    localStorage.setItem('pixelDoom_interactionWindow_position', JSON.stringify(position));
    localStorage.setItem('pixelDoom_interactionWindow_hasUserDragged', 'true');
    console.log('Window position saved to localStorage:', position);
  } catch (e) {
    console.warn('Failed to save position to localStorage:', e);
  }
}

// Function to load saved position from localStorage
function loadSavedPosition(): { x: number; y: number } | null {
  try {
    const savedPos = localStorage.getItem('pixelDoom_interactionWindow_position');
    const hasUserDragged = localStorage.getItem('pixelDoom_interactionWindow_hasUserDragged');
    
    console.log('Loading from localStorage - savedPos:', savedPos, 'hasUserDragged:', hasUserDragged);
    
    if (savedPos && hasUserDragged === 'true') {
      const position = JSON.parse(savedPos);
      InteractionUIState.savedPosition = position;
      InteractionUIState.hasUserDragged = true;
      console.log('Position loaded from localStorage:', position);
      return position;
    } else {
      console.log('No valid saved position found in localStorage');
    }
  } catch (e) {
    console.warn('Failed to load position from localStorage:', e);
  }
  
  return null;
}

// Function to setup drag tracking for the window
function setupDragTracking(windowElement: HTMLElement) {
  const titleBar = windowElement.querySelector('.pd-window-header') as HTMLElement;
  if (!titleBar) {
    console.log('Title bar not found');
    return;
  }
  
  let isDragging = false;
  let initialPosition: { x: number; y: number } | null = null;
  
  // Hook into the window library's drag system
  const originalMouseDown = titleBar.onmousedown;
  
  // Override the mousedown event to track drag start
  titleBar.addEventListener('mousedown', (e) => {
    // Record initial position
    const rect = windowElement.getBoundingClientRect();
    initialPosition = {
      x: rect.left,
      y: rect.top
    };
    isDragging = true;
    console.log('Drag started, initial position:', initialPosition);
  }, true);
  
  // Monitor for drag end by watching for mouseup events on document
  const handleMouseUp = () => {
    if (isDragging && initialPosition) {
      // Small delay to ensure the window library has finished positioning
      setTimeout(() => {
        const currentRect = windowElement.getBoundingClientRect();
        const deltaX = Math.abs(currentRect.left - initialPosition!.x);
        const deltaY = Math.abs(currentRect.top - initialPosition!.y);
        
        console.log('Drag ended, checking position change:', {
          initial: initialPosition,
          current: { x: currentRect.left, y: currentRect.top },
          delta: { x: deltaX, y: deltaY }
        });
        
        // If position changed significantly, save the new position
        if (deltaX > 5 || deltaY > 5) {
          InteractionUIState.hasUserDragged = true;
          saveWindowPosition(windowElement);
          console.log('Position saved after drag');
        }
        
        isDragging = false;
        initialPosition = null;
      }, 50); // Small delay to ensure window library drag is complete
    }
  };
  
  // Add mouseup listener to document to catch drag end
  document.addEventListener('mouseup', handleMouseUp, true);
  
  // Store the cleanup function
  InteractionUIState.dragCleanup = () => {
    document.removeEventListener('mouseup', handleMouseUp, true);
  };
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
      350,        // Width - adjusted for better display
      300,        // Height - adjusted for better display
      1.0         // Opacity
    );
    
    // Save window references
    InteractionUIState.windowElement = windowElement;
    InteractionUIState.contentElement = contentElement;
    InteractionUIState.isWindowDestroyed = false;
    
    // Modify close function to ensure our close method is called correctly
    const ourCloseFunction = () => {
      console.log('ourCloseFunction called - about to save position and close');
      
      // Save position and cleanup BEFORE calling the original close function
      // Pass false to not remove the window element (let the original close() handle that)
      UIInteractionPanelActionChooseMain.CloseChoosePanle(false); 
      
      // Then call original close function
      close(); 
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
    }
    
    // We're using the default window styling now, so no need to override styles
    
    // Set content area style for the list
    contentElement.style.padding = '0';
    contentElement.style.zIndex = '10000'; // Ensure highest z-index
    
    // Force proper size and position
    setTimeout(() => {
      if (windowElement) {
        // Update size in UI library
        UIWindowLib.setSize(windowElement, 350, 300);
        
        // Reposition after forced size change
        positionWindowToBottomRight(windowElement);
        
        // Setup drag tracking to remember user-moved positions
        setupDragTracking(windowElement);
      }
    }, 10);
    
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
    table.style.borderCollapse = 'collapse';
    table.style.borderSpacing = '0';
    
    // Remove padding since we don't need it for the arrow anymore
    table.style.position = 'relative';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Action', 'Action ID', 'Source'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.fontSize = '10px';
      th.style.fontWeight = 'normal';
      th.style.color = '#a0a0a0';
      th.style.textTransform = 'lowercase';
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
    
    // Setup drag tracking to remember user-moved positions (but don't position yet)
    setupDragTracking(windowElement);
    
    // Add window resize event listener to keep window at saved position
    const resizeHandler = () => {
      if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
        // Only reposition if user hasn't dragged the window
        if (!InteractionUIState.hasUserDragged) {
          positionWindowToBottomRight(InteractionUIState.windowElement);
        }
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
  static CloseChoosePanle(removeWindow: boolean = true) {
    //console.log('CloseChoosePanle called');
    
    // Save current position before closing if window exists and user has interacted with it
    if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
      // Check if the window has been moved from its default position
      const rect = InteractionUIState.windowElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = parseInt(InteractionUIState.windowElement.style.width);
      const windowHeight = parseInt(InteractionUIState.windowElement.style.height);
      
      console.log('Window current position:', { x: rect.left, y: rect.top });
      console.log('Window size:', { width: windowWidth, height: windowHeight });
      console.log('Viewport size:', { width: viewportWidth, height: viewportHeight });
      
      // Calculate what the default center position would be
      const defaultCenterX = (viewportWidth - windowWidth) / 2;
      const defaultCenterY = (viewportHeight - windowHeight) / 2;
      
      console.log('Default center position would be:', { x: defaultCenterX, y: defaultCenterY });
      
      // If window is not at default center position, save current position
      const deltaX = Math.abs(rect.left - defaultCenterX);
      const deltaY = Math.abs(rect.top - defaultCenterY);
      
      console.log('Position delta from center:', { x: deltaX, y: deltaY });
      
      if (deltaX > 10 || deltaY > 10) { // Allow some tolerance for positioning differences
        InteractionUIState.hasUserDragged = true;
        saveWindowPosition(InteractionUIState.windowElement);
        console.log('Position saved before closing window');
      } else {
        console.log('Window is at default position, not saving');
      }
    } else {
      //console.log('No window element to save position from');
    }
    
    // Remove window resize listener
    if (InteractionUIState.resizeHandler) {
      window.removeEventListener('resize', InteractionUIState.resizeHandler);
      InteractionUIState.resizeHandler = null;
    }
    
    // Clear position monitoring interval
    if (InteractionUIState.positionCheckInterval) {
      clearInterval(InteractionUIState.positionCheckInterval);
      InteractionUIState.positionCheckInterval = null;
    }
    
    // Clean up drag tracking
    if (InteractionUIState.dragCleanup) {
      InteractionUIState.dragCleanup();
      InteractionUIState.dragCleanup = null;
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
    if (removeWindow && InteractionUIState.windowElement && InteractionUIState.windowElement.parentNode) {
      InteractionUIState.windowElement.parentNode.removeChild(InteractionUIState.windowElement);
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
    
    // Create table row with specific class and event listeners
    const row = document.createElement('tr');
    row.className = 'interaction-item';
    row.setAttribute('data-button-id', buttonData.id);
    row.setAttribute('data-button-name', buttonData.name);
    
    // Add explicit mouse events to handle hover
    row.addEventListener('mouseover', () => {
      row.querySelectorAll('td').forEach((cell, index) => {
        cell.style.backgroundColor = 'rgba(128, 128, 128, 0.4)';
        cell.style.borderBottom = '1px solid rgba(200, 200, 200, 0.3)';
        
        // Add left border to first cell
        if (index === 0) {
          cell.style.borderLeft = '2px solid rgba(200, 200, 200, 0.3)';
          cell.style.paddingLeft = '6px';
        }
        
        // Add right border to last cell
        if (index === row.childElementCount - 1) {
          cell.style.borderRight = '2px solid rgba(200, 200, 200, 0.3)';
        }
      });
    });
    
    row.addEventListener('mouseout', () => {
      const isOdd = Array.from(tbody.children).indexOf(row) % 2 !== 0;
      row.querySelectorAll('td').forEach((cell, index) => {
        cell.style.backgroundColor = isOdd ? 'rgba(0, 0, 0, 0.2)' : 'transparent';
        cell.style.borderBottom = '1px solid #333333';
        
        // Reset borders
        if (index === 0) {
          cell.style.borderLeft = 'none';
          cell.style.paddingLeft = '8px';
        }
        
        if (index === row.childElementCount - 1) {
          cell.style.borderRight = 'none';
        }
      });
    });
    
    // Create cells
    const nameCell = document.createElement('td');
    nameCell.textContent = buttonData.name;
    nameCell.style.fontWeight = 'normal';
    
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
      const height = Math.min(500, tbody.children.length * 40 + 80); // Limit max height, account for header
      const width = 350; // Fixed width
      
      UIWindowLib.setSize(
        InteractionUIState.windowElement, 
        width,
        height
      );
      
      // Apply direct style as well to ensure size changes
      InteractionUIState.windowElement.style.width = width + 'px';
      InteractionUIState.windowElement.style.height = height + 'px';
      
      // Only reposition if user hasn't dragged the window to a custom position
      if (!InteractionUIState.hasUserDragged) {
        positionWindowToBottomRight(InteractionUIState.windowElement);
      }
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

  // Reset saved position to use default positioning again
  static ResetWindowPosition() {
    InteractionUIState.savedPosition = null;
    InteractionUIState.hasUserDragged = false;
    
    // Clear localStorage
    try {
      localStorage.removeItem('pixelDoom_interactionWindow_position');
      localStorage.removeItem('pixelDoom_interactionWindow_hasUserDragged');
      console.log('Window position reset to default and localStorage cleared');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    
    // If window is currently open, reposition it
    if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
      positionWindowToBottomRight(InteractionUIState.windowElement);
    }
  }

  // Get current saved position (for debugging or external use)
  static GetSavedPosition(): { x: number; y: number } | null {
    return InteractionUIState.savedPosition;
  }

  // Manually save current window position (for testing)
  static SaveCurrentPosition() {
    if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
      InteractionUIState.hasUserDragged = true;
      saveWindowPosition(InteractionUIState.windowElement);
      console.log('Position manually saved:', InteractionUIState.savedPosition);
    } else {
      //console.log('No window to save position from');
    }
  }
}

