// 在文件顶部添加全局类型声明
declare global {
  interface Window {
    pixelDoomClickHandlerSet?: boolean;
  }
}

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { ClickObject, LastestChooseObject } from "../../Module/PIXClickObject.js";
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";

// 存储窗口引用和状态
class InteractionUIState {
  static windowElement: HTMLElement | null = null;
  static contentElement: HTMLElement | null = null;
  static closeFunction: (() => void) | null = null;
  static buttonsContainer: HTMLElement | null = null;
  static isInitialized: boolean = false;
  static isWindowDestroyed: boolean = false; // 添加新状态，标记窗口是否被销毁
  static resizeHandler: (() => void) | null = null; // 添加窗口大小改变处理函数
}

/** 初始化 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
  initInteractionUI();
  //UIInteractionPanelActionChooseMain.ShowChoosePanle()
  // AddChooseButtonIntoPanel("a", 1)
  // AddChooseButtonIntoPanel("a", 1)

  //UIInteractionPanelActionChooseMain.ExplainConetntToButton("use,destroy,check,fix,collect,hide,寻找,闻,标记,在服务器上标记,特殊事件,强行使用,上锁,权限控制")
})

function initInteractionUI() {
  // 使用窗口库不需要额外创建DOM元素
  InteractionUIState.isInitialized = true;
}

// 添加全局点击处理器，确保事件能够被正确处理
function ensureClickHandling() {
  // 如果没有设置过全局点击事件处理器
  if (!window.pixelDoomClickHandlerSet) {
    // 标记为已设置，避免重复
    window.pixelDoomClickHandlerSet = true;
    
    // 添加全局样式，确保所有按钮都可点击
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .interaction-btn {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 10000 !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 添加全局点击事件委托处理
    document.addEventListener('click', function(e) {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('interaction-btn')) {
        // 尝试获取按钮内容
        const buttonContent = target.getAttribute('data-button-content') || target.textContent || '';
        
        console.log('全局委托捕获到点击:', buttonContent);
        
        // 弹出提示，测试点击是否被捕获
        //window.alert("点击了按钮: " + buttonContent);
        
        // 触发事件
        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: buttonContent });
      }
    }, true); // 使用捕获阶段
  }
}

// 辅助函数：将窗口定位到右下角
function positionWindowToBottomRight(windowElement: HTMLElement) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = parseInt(windowElement.style.width);
  const windowHeight = parseInt(windowElement.style.height);
  
  // 设置窗口位置在右下角，留出一些边距
  const rightPosition = viewportWidth - windowWidth - 20; // 20px 的右边距
  const bottomPosition = viewportHeight - windowHeight - 20; // 20px 的下边距
  
  UIWindowLib.setPosition(windowElement, rightPosition, bottomPosition);
}

export class UIInteractionPanelActionChooseMain {
  // 用于存储打开和关闭事件的回调函数
  private static openCallbacks: Function[] = [];
  private static closeCallbacks: Function[] = [];

  // 监听交互面板打开事件
  static OnInteractionOpen(callback: Function) {
    if (typeof callback === 'function') {
      this.openCallbacks.push(callback);
    }
  }

  // 监听交互面板关闭事件
  static OnInteractionClose(callback: Function) {
    if (typeof callback === 'function') {
      this.closeCallbacks.push(callback);
    }
  }

  // 显示UI面板
  static ShowChoosePanle() {
    // 确保全局点击处理器已设置
    ensureClickHandling();
    
    // 移除之前的窗口大小改变监听器（如果存在）
    if (InteractionUIState.resizeHandler) {
      window.removeEventListener('resize', InteractionUIState.resizeHandler);
      InteractionUIState.resizeHandler = null;
    }
    
    // 完全重建窗口
    if (InteractionUIState.windowElement) {
      try {
        // 尝试先移除旧窗口
        if (InteractionUIState.windowElement.parentNode) {
          InteractionUIState.windowElement.parentNode.removeChild(InteractionUIState.windowElement);
        }
      } catch (e) {
        console.error("移除旧窗口失败:", e);
      }
      
      // 重置所有状态
      InteractionUIState.windowElement = null;
      InteractionUIState.contentElement = null;
      InteractionUIState.buttonsContainer = null;
    }
    
    // 创建新窗口 - 不指定位置，稍后会设置为右下角
    const { windowElement, contentElement, close } = UIWindowLib.createWindow(
      "交互选项", // 标题
      300,        // 宽度
      200,        // 高度，初始高度设为200
      1.0         // 不透明度
    );
    
    // 保存窗口引用
    InteractionUIState.windowElement = windowElement;
    InteractionUIState.contentElement = contentElement;
    InteractionUIState.closeFunction = close;
    InteractionUIState.isWindowDestroyed = false;
    
    // 设置内容区样式
    contentElement.style.padding = '10px';
    contentElement.style.zIndex = '10000'; // 确保最高层级
    
    // 创建按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'interaction_buttons_container_action_choose_ui';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '6px';
    buttonsContainer.style.pointerEvents = 'auto'; // 确保可以接收点击事件
    buttonsContainer.style.zIndex = '10001'; // 确保最高层级
    
    contentElement.appendChild(buttonsContainer);
    
    // 保存按钮容器引用
    InteractionUIState.buttonsContainer = buttonsContainer;
    
    // 立即将窗口定位到右下角
    positionWindowToBottomRight(windowElement);
    
    // 添加窗口大小改变事件监听器，保持窗口在右下角
    const resizeHandler = () => {
      if (InteractionUIState.windowElement && !InteractionUIState.isWindowDestroyed) {
        positionWindowToBottomRight(InteractionUIState.windowElement);
      }
    };
    
    // 保存处理函数引用以便稍后可以移除
    InteractionUIState.resizeHandler = resizeHandler;
    window.addEventListener('resize', resizeHandler);
    
    // 触发所有打开事件回调
    this.openCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('交互面板打开回调执行错误:', error);
      }
    });
  }

  // 关闭UI面板
  static CloseChoosePanle() {
    // 移除窗口大小改变监听器
    if (InteractionUIState.resizeHandler) {
      window.removeEventListener('resize', InteractionUIState.resizeHandler);
      InteractionUIState.resizeHandler = null;
    }
    
    if (InteractionUIState.windowElement) {
      // 触发所有关闭事件回调
      this.closeCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('交互面板关闭回调执行错误:', error);
        }
      });
      
      try {
        // 完全移除窗口
        if (InteractionUIState.windowElement.parentNode) {
          InteractionUIState.windowElement.parentNode.removeChild(InteractionUIState.windowElement);
        }
        
        // 彻底重置所有状态
        InteractionUIState.windowElement = null;
        InteractionUIState.contentElement = null;
        InteractionUIState.buttonsContainer = null;
        InteractionUIState.closeFunction = null;
        InteractionUIState.isWindowDestroyed = true;
      } catch (error) {
        console.error('关闭窗口时发生错误:', error);
        InteractionUIState.isWindowDestroyed = true;
      }
    }
  }

  // 增加按钮进入面板
  static AddChooseButtonIntoPanel(ButtonContent: string, ButtonIndex: any) {
    // 确保窗口存在
    if (!InteractionUIState.contentElement || InteractionUIState.isWindowDestroyed) {
      this.ShowChoosePanle();
    }
    
    // 使用保存的按钮容器引用
    const container = InteractionUIState.buttonsContainer;
    if (!container) return;
    
    const button = document.createElement('button');
    button.className = 'interaction-btn'; // 添加类，用于全局事件委托
    button.setAttribute('data-button-content', ButtonContent); // 存储按钮内容，便于事件委托获取
    button.textContent = ButtonContent;
    
    // 设置按钮样式，确保可见和可点击
    Object.assign(button.style, {
      backgroundColor: '#333',
      border: '1px solid #555',
      color: '#e0e0e0',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer !important',
      transition: 'background-color 0.2s',
      position: 'relative',
      zIndex: '10002', // 确保最高层级
      pointerEvents: 'auto', // 确保可以接收点击事件
      userSelect: 'none', // 防止文本选择干扰点击
      margin: '2px 0'
    });
    
    // 鼠标悬停效果
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#444';
    }, true);
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#333';
    }, true);

    // 直接内联处理点击事件，确保最简单的方式能工作
    button.onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      
      console.log('直接点击处理程序触发:', ButtonContent);
      //window.alert("按钮直接事件: " + ButtonContent);
      
      pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: ButtonContent });
      
      return false;
    };
    
    // 添加按钮到指定位置或默认添加到第一个
    if (ButtonIndex !== undefined && ButtonIndex >= 0 && ButtonIndex < container.children.length) {
      container.insertBefore(button, container.children[ButtonIndex]);
    } else {
      container.appendChild(button);
    }

    // 动画效果
    button.style.opacity = '0';
    button.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
    }, 100 * (ButtonIndex !== undefined ? ButtonIndex : container.children.length - 1));
    
    // 调整窗口高度以适应内容
    if (InteractionUIState.windowElement) {
      const height = Math.min(400, container.children.length * 45 + 40); // 限制最大高度
      UIWindowLib.setSize(
        InteractionUIState.windowElement, 
        300, // 保持宽度不变
        height
      );
      
      // 调整大小后重新定位到右下角
      positionWindowToBottomRight(InteractionUIState.windowElement);
    }
  }

  // 根据解析生成按钮
  static ExplainConetntToButton(Conteng: string) {
    // 确保窗口存在
    if (!InteractionUIState.contentElement || InteractionUIState.isWindowDestroyed) {
      this.ShowChoosePanle();
    }
    
    const ButtonList = Conteng.split(',');
    
    // 使用保存的按钮容器引用
    const container = InteractionUIState.buttonsContainer;
    if (!container) return;

    // 清空现有按钮
    container.innerHTML = '';

    // 添加新按钮
    ButtonList.forEach((ButtonContent: string, Index: any) => {
      UIInteractionPanelActionChooseMain.AddChooseButtonIntoPanel(ButtonContent.trim(), Index);
    });
  }
}

