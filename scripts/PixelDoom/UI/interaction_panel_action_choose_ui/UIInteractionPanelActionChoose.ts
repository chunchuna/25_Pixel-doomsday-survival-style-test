
import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";



/** 初始化 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
  initInteractionUI()
  //UIInteractionPanelActionChooseMain.ShowChoosePanle()
  // AddChooseButtonIntoPanel("a", 1)
  // AddChooseButtonIntoPanel("a", 1)

  //UIInteractionPanelActionChooseMain.ExplainConetntToButton("use,destroy,check,fix,collect,hide,寻找,闻,标记,在服务器上标记,特殊事件,强行使用,上锁,权限控制")
})

function initInteractionUI() {
  const panel = document.getElementById('interaction_panel_action_choose_ui');
  // @ts-ignore
  if (!panel) {
    const panelHTML = `
      <div id="interaction_panel_action_choose_ui" class="interaction-panel">
        <div id="interaction_buttons_container_action_choose_ui" class="buttons-container"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', panelHTML);
  }
}



/** 玩家在移动的时候 关闭UI面板 */
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

  var PlayerInstance = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.RedHairGirlSprite.getFirstInstance();
  if (PlayerInstance == null) return

  if (PlayerInstance.behaviors.MoveFunction.vectorX > 0 || PlayerInstance.behaviors.MoveFunction.vectorY > 0)
    UIInteractionPanelActionChooseMain.CloseChoosePanle();

})

export class UIInteractionPanelActionChooseMain {
  // 显示UI面板
  static ShowChoosePanle() {
    const panel = document.getElementById('interaction_panel_action_choose_ui');
    // @ts-ignore
    panel.style.display = 'block';
  }

  // 关闭UI面板
  static CloseChoosePanle() {
    const panel = document.getElementById('interaction_panel_action_choose_ui');
    // @ts-ignore
    panel.style.display = 'none';
  }

  // 增加按钮进入面板
  static AddChooseButtonIntoPanel(ButtonContent: string, ButtonIndex: any) {
    const container = document.getElementById('interaction_buttons_container_action_choose_ui');
    const button = document.createElement('button');
    button.className = 'interaction-btn';
    button.textContent = ButtonContent;

    // 设置按钮点击事件
    button.addEventListener('click', function () {
      // 这里可以添加按钮点击后的逻辑
      console.log('点击了按钮:', ButtonContent);
      pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ChoosePanleButtonClick:ClickButton", { ButtonContent_: ButtonContent })
      //CloseChoosePanle();
    });

    // 添加按钮到指定位置或默认添加到第一个
    // @ts-ignore
    if (ButtonIndex !== undefined && ButtonIndex >= 0 && ButtonIndex < container.children.length) {
      // @ts-ignore
      container.insertBefore(button, container.children[ButtonIndex]);
    } else {
      // @ts-ignore
      container.appendChild(button);
    }

    // 触发按钮出现动画
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
      // @ts-ignore
    }, 100 * (ButtonIndex !== undefined ? ButtonIndex : container.children.length - 1));
  }

  // 根据解析生成按钮
  static ExplainConetntToButton(Conteng: string) {
    // @ts-ignore
    const ButtonList = Conteng.split(',');
    const container = document.getElementById('interaction_buttons_container_action_choose_ui');

    // 清空现有按钮
    // @ts-ignore
    container.innerHTML = '';

    // 添加新按钮
    ButtonList.forEach((ButtonContent: string, Index: any) => {
      UIInteractionPanelActionChooseMain.AddChooseButtonIntoPanel(ButtonContent.trim(), Index);
    });

    // 显示面板
    UIInteractionPanelActionChooseMain.ShowChoosePanle();
  }

  // 初始化UI
  // document.addEventListener('DOMContentLoaded', initInteractionUI);
}

