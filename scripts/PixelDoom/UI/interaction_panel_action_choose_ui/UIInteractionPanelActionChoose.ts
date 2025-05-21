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
    // 如果窗口已经存在，直接显示
    if (InteractionUIState.windowElement && InteractionUIState.windowElement.parentNode) {
      InteractionUIState.windowElement.style.display = 'block';
    } else {
      // 创建新窗口
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
      
      // 设置内容区样式
      contentElement.style.padding = '10px';
      
      // 创建按钮容器
      const buttonsContainer = document.createElement('div');
      buttonsContainer.id = 'interaction_buttons_container_action_choose_ui';
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.flexDirection = 'column';
      buttonsContainer.style.gap = '6px';
      
      contentElement.appendChild(buttonsContainer);
      
      // 保存按钮容器引用
      InteractionUIState.buttonsContainer = buttonsContainer;
    }
    
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
    if (InteractionUIState.closeFunction) {
      // 触发所有关闭事件回调
      this.closeCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('交互面板关闭回调执行错误:', error);
        }
      });
      
      try {
        // 隐藏窗口而不是销毁它，这样窗口引用可以保持
        if (InteractionUIState.windowElement) {
          InteractionUIState.windowElement.style.display = 'none';
        }
        
        // 注释掉以下代码，以便保留窗口引用
        // InteractionUIState.closeFunction();
        // InteractionUIState.windowElement = null;
        // InteractionUIState.contentElement = null;
        // InteractionUIState.buttonsContainer = null;
        // InteractionUIState.closeFunction = null;
      } catch (error) {
        console.error('关闭窗口时发生错误:', error);
        // 发生错误时才重置引用
        InteractionUIState.windowElement = null;
        InteractionUIState.contentElement = null;
        InteractionUIState.buttonsContainer = null;
        InteractionUIState.closeFunction = null;
      }
    }
  }

  // 增加按钮进入面板
  static AddChooseButtonIntoPanel(ButtonContent: string, ButtonIndex: any) {
    // 确保窗口存在
    if (!InteractionUIState.contentElement) {
      this.ShowChoosePanle();
    }
    
    // 使用保存的按钮容器引用
    const container = InteractionUIState.buttonsContainer;
    if (!container) return;
    
    const button = document.createElement('button');
    button.className = 'interaction-btn';
    button.textContent = ButtonContent;
    button.style.backgroundColor = '#333';
    button.style.border = '1px solid #555';
    button.style.color = '#e0e0e0';
    button.style.padding = '8px 16px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.2s';
    
    // 鼠标悬停效果
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#444';
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#333';
    });

    // 设置按钮点击事件
    button.addEventListener('click', function () {
      // 这里可以添加按钮点击后的逻辑
      console.log('点击了按钮:', ButtonContent);
      pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_run_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: ButtonContent });
      
      // 点击后关闭面板
      UIInteractionPanelActionChooseMain.CloseChoosePanle();
    });

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
    }
  }

  // 根据解析生成按钮
  static ExplainConetntToButton(Conteng: string) {
    // 确保窗口存在
    if (!InteractionUIState.contentElement) {
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

