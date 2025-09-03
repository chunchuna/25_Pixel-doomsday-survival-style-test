import { Unreal__ } from "../../../engine.js";
import { LocalSave, SaveSetting } from "../../Group/Save/PIXSave.js";
import { TransitionEffectType, UIScreenEffect } from "../screeneffect_ui/UIScreenEffect.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
import { data } from "../../Group/Save/PIXSave.js"
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";
import { UIMainSettingWindow } from "./UIMainSettingWindow.js";
import { UIMainSaveWindow } from "./UIMainSaveWindow.js";
import { UIMainAboutWindow } from "./UIMainAboutWindow.js";
import { LayoutTransition, TransitionType } from "../layout_transition_ui/UILayoutTransition.js";



var IsInitGameMainMenu = false
Unreal__.GameBegin(() => {

    if (Unreal__.runtime.layout.name != "MainMenu") return
    // 强行修改图层是否透明
    //@ts-ignore
    //Unreal__.runtime.layout.getLayer("background").isTransparent = true

    initGameMainScene();

});

async function initGameMainScene(): Promise<void> {
    console.log('Starting initGameMainScene');
    const gameMainScene = UIMainMenu.getInstance();
    gameMainScene.initialize();
    gameMainScene.ShowMainMenu()
    

    setTimeout(() => {
        UIMainMenu.getInstance().AddButtonShakeEffect('new-game-btn', 15, 800)
        //UIMainMenu.getInstance().ShowGameTitle("The Park <一>", "glitch", "flicker", "35%", "15%");
        
    }, 1000); // 延迟1秒，确保按钮已经完全显示



    // UIMainMenu.getInstance().HideALLMainMenuUI(() => {
    //     // 在初始化完成后执行一些操作
    //     UIMainMenu.getInstance().ShowMainMenu();
    // });

    (window as any).HideALLMainMenuUI = (callback?: () => void) => {
        UIMainMenu.getInstance().HideALLMainMenuUI(callback);
    };

    // 删除这行代码，避免访问私有方法
    // gameMainScene.simpleUpdateSaveUI();
    console.log('initGameMainScene completed');
}

class UIMainMenu {
    private static instance: UIMainMenu;
    private htmlTemplate: string;
    private cssStyles: string;
    private mainContainer: HTMLElement | null = null;
    private isMuted: boolean = false;
    private isFullscreen: boolean = false;
    private menuButtons: Map<string, () => void> = new Map(); // 存储按钮和对应的回调函数
    private buttonShakeEffects: Map<string, number> = new Map(); // 存储按钮晃动效果的间隔ID
    private titleElement: HTMLElement | null = null; // 存储游戏标题元素

    // 存储窗口引用和实例
    private settingsWindowInstance: UIMainSettingWindow = new UIMainSettingWindow();
    private loadGameWindowInstance: UIMainSaveWindow = UIMainSaveWindow.getInstance();
    private aboutWindowInstance: UIMainAboutWindow = new UIMainAboutWindow();

    // 标题效果预设
    private readonly TITLE_EFFECTS = {
        PIXEL: 'pixel', // 像素风格
        GLITCH: 'glitch', // 故障风格
        NEON: 'neon'  // 霓虹风格
    };

    // 标题动画预设
    private readonly TITLE_ANIMATIONS = {
        PULSE: 'pulse', // 脉冲效果
        FLOAT: 'float', // 浮动效果
        FLICKER: 'flicker' // 闪烁效果
    };

    private constructor() {
        this.htmlTemplate = this.getHTMLTemplate();
        this.cssStyles = this.getCSSStyles();
    }

    public static getInstance(): UIMainMenu {
        if (!UIMainMenu.instance) {
            UIMainMenu.instance = new UIMainMenu();
        }
        return UIMainMenu.instance;
    }

    public initialize(): void {
        console.log('Starting UIMainMenu.initialize');
        // 如果已经初始化过，先清理旧的DOM元素
        if (this.mainContainer && this.mainContainer.parentNode) {
            console.log('Cleaning up old DOM elements');
            this.mainContainer.parentNode.removeChild(this.mainContainer);
            this.mainContainer = null;
        }

        // 清理可能存在的重复样式元素
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent && style.textContent.includes('.game-main-panel')) {
                style.remove();
            }
        });

        // 创建样式元素
        const styleElement = document.createElement('style');
        styleElement.textContent = this.cssStyles;
        document.head.appendChild(styleElement);

        // 创建主容器
        this.mainContainer = document.createElement('div');
        this.mainContainer.id = 'game-main-scene';
        this.mainContainer.innerHTML = this.htmlTemplate;
        document.body.appendChild(this.mainContainer);

        // 绑定事件
        this.bindEvents();

        // 添加按钮动画
        setTimeout(() => {
            this.animateMenuButtons();
        }, 500); // 等待500ms后开始按钮动画
        console.log('UIMainMenu.initialize completed');
    }

    private bindEvents(): void {
        console.log('Starting bindEvents');
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            // 移除可能存在的旧事件监听器
            newGameBtn.replaceWith(newGameBtn.cloneNode(true));
            const freshNewGameBtn = document.getElementById('new-game-btn');
            console.log('Refreshed new game button element:', freshNewGameBtn);
            if (freshNewGameBtn) {
                freshNewGameBtn.addEventListener('click', () => {
                    this.HideALLMainMenuUI(() => {
                        // UIScreenEffect.FadeOut(3000, TransitionEffectType.WIPE_RADIAL, () => {
                        //     pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level")
                        // })
                        LayoutTransition.LeaveLayout(TransitionType.HOLE, 2).onFinish(() => {
                            Unreal__.runtime.goToLayout("Level")
                        })
                    })
                });

            }
        }

        // 设置按钮
        const settingsBtn = document.getElementById('settings-btn');
        console.log('Settings button element:', settingsBtn);
        if (settingsBtn) {
            settingsBtn.replaceWith(settingsBtn.cloneNode(true));
            const freshSettingsBtn = document.getElementById('settings-btn');
            if (freshSettingsBtn) {
                freshSettingsBtn.addEventListener('click', () => {
                    console.log('Settings button clicked');
                    this.showSettingsWindow();
                });
                console.log('Settings button event binding completed');
            }
        }

        // 存档读取按钮
        const loadGameBtn = document.getElementById('load-game-btn');
        console.log('Load game button element:', loadGameBtn);
        if (loadGameBtn) {
            loadGameBtn.replaceWith(loadGameBtn.cloneNode(true));
            const freshLoadGameBtn = document.getElementById('load-game-btn');
            if (freshLoadGameBtn) {
                freshLoadGameBtn.addEventListener('click', () => {
                    console.log('Load game button clicked');
                    this.showLoadGameWindow();
                });
                console.log('Load game button event binding completed');
            }
        }

        // 关于按钮
        const aboutBtn = document.getElementById('about-btn');
        console.log('About button element:', aboutBtn);
        if (aboutBtn) {
            aboutBtn.replaceWith(aboutBtn.cloneNode(true));
            const freshAboutBtn = document.getElementById('about-btn');
            if (freshAboutBtn) {
                freshAboutBtn.addEventListener('click', () => {
                    console.log('About button clicked');
                    this.showAboutWindow();
                });
                console.log('About button event binding completed');
            }
        }

        // 静音切换
        const muteToggle = document.getElementById('mute-toggle') as HTMLInputElement;
        if (muteToggle) {
            muteToggle.addEventListener('change', () => {
                this.isMuted = muteToggle.checked;
                console.log('Mute status:', this.isMuted);
            });
        }

        // 全屏切换
        const fullscreenToggle = document.getElementById('fullscreen-toggle') as HTMLInputElement;
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('change', () => {
                this.isFullscreen = fullscreenToggle.checked;
                this.toggleFullscreen();
            });
        }

        // 统一处理所有模态框的关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            // 点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('closing');
                    setTimeout(() => {
                        modal.classList.remove('active', 'closing');
                    }, 300);
                }
            });

            // 防止点击内容区域关闭
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
        console.log('bindEvents completed');
    }

    private toggleFullscreen(): void {
        if (this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // HTML模板
    private getHTMLTemplate(): string {
        return `
        <div class="game-main-panel">
          <div class="main-menu">
            <button id="new-game-btn" class="menu-btn">Play</button>
            <button id="settings-btn" class="menu-btn">Setting</button>
            <button id="load-game-btn" class="menu-btn">Load</button>
            <button id="about-btn" class="menu-btn">About</button>
          </div>
        </div>
        `;
    }

    // CSS样式
    private getCSSStyles(): string {
        // 这里省略了完整的CSS代码，有需要的话可以保留
        return `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Arial', sans-serif;
        }
  
        body {
          background-color:hsl(0, 0.00%, 100.00%);
          color: #ffffff;
        }
  
        @keyframes panelSlideIn {
          0% {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
  
        @keyframes panelGlow {
          0% { 
            box-shadow: 0 0 30px rgba(66, 134, 244, 0.2);
          }
          50% { 
            box-shadow: 0 0 40px rgba(66, 134, 244, 0.3);
          }
          100% { 
            box-shadow: 0 0 30px rgba(66, 134, 244, 0.2);
          }
        }
  
        @keyframes panelSlideOut {
          0% {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
        }
  
        /* ... 其他CSS样式 ... */
  
        .game-main-panel {
          position: absolute;
          bottom: 0;
          left: 30%;
          transform: translate(-50%, 100%);
          width: 300px;
          padding: 20px;
          background-color: transparent;
          border-radius: 8px;
          box-shadow: none;
          border: none;
          backdrop-filter: none;
          opacity: 0;
          animation: panelSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 1002;
        }
  
        .main-menu {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
  
        .menu-btn {
          padding: 0.2rem 0;
          background-color: transparent;
          color: #b0b0b0;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
          transform: translateX(-50px);
          position: relative;
          overflow: hidden;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
  
        .menu-btn::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2px;
          background-color: #ffffff;
          transition: width 0.3s ease;
        }
  
        .menu-btn:hover {
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
        }
  
        .menu-btn:hover::before {
          width: 100%;
        }
  
        .menu-btn:active {
          transform: scale(0.95);
        }
  
        .menu-btn.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .menu-btn.shake {
          --shake-size: 5px;
          animation: buttonShake 0.5s infinite ease-in-out;
        }

        @keyframes buttonShake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(var(--shake-size)); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(calc(-1 * var(--shake-size))); }
          100% { transform: rotate(0deg); }
        }

        .fade-out-animation {
          animation: fadeOut 0.5s ease-out forwards;
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        `;
    }

    private animateMenuButtons(): void {
        const buttons = document.querySelectorAll('.menu-btn');

        buttons.forEach((button, index) => {
            setTimeout(() => {
                button.classList.add('show');

                // 添加按钮点击特效
                button.addEventListener('click', (e) => {
                    const ripple = document.createElement('div');
                    ripple.classList.add('ripple');

                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    // @ts-ignore
                    const x = e.clientX - rect.left;
                    // @ts-ignore
                    const y = e.clientY - rect.top;

                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';

                    button.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 1000);
                });

            }, 200 * (index + 1)); // 每个按钮延迟200ms出现
        });
    }

    // 新增显示/隐藏菜单方法
    public ShowMainMenu(): void {
        console.log('Starting UIMainMenu.ShowMainMenu');
        if (this.mainContainer) {
            this.mainContainer.style.display = 'block';
            const panel = this.mainContainer.querySelector('.game-main-panel');
            if (panel) {
                (panel as HTMLElement).style.animation = 'panelSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards, panelGlow 3s ease-in-out infinite';
            }

            // 重新绑定事件，确保按钮可点击
            console.log('Rebinding events');
            this.bindEvents();

            // 重新触发按钮动画
            setTimeout(() => {
                this.animateMenuButtons();
            }, 500);
        }
        console.log('UIMainMenu.ShowMainMenu completed');
    }

    public HideMainMenu(): void {
        if (this.mainContainer) {
            const panel = this.mainContainer.querySelector('.game-main-panel');
            if (panel) {
                (panel as HTMLElement).style.animation = 'panelSlideOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                setTimeout(() => {
                    this.mainContainer!.style.display = 'none';
                }, 800);
            }
        }
    }

    // 新增添加按钮方法
    public MenuAddButton(buttonText: string, callback: () => void): void {
        // 创建新按钮
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.className = 'menu-btn';

        // 存储回调函数
        this.menuButtons.set(buttonText, callback);

        // 添加点击事件
        button.addEventListener('click', callback);

        // 添加到菜单
        const mainMenu = document.querySelector('.main-menu');
        if (mainMenu) {
            mainMenu.appendChild(button);
            // 立即触发按钮动画
            setTimeout(() => {
                button.classList.add('show');
            }, 100);
        }
    }

    /**
     * 添加按钮晃动效果
     * @param buttonId 按钮的ID
     * @param size 晃动幅度（角度）
     * @param interval 晃动间隔（毫秒）
     */
    public AddButtonShakeEffect(buttonId: string, size: number, interval: number): void {
        // 先清除已有的晃动效果
        this.RemoveButtonShakeEffect(buttonId);

        const button = document.getElementById(buttonId);
        if (button) {
            // 设置晃动幅度（现在是角度而不是像素）
            button.style.setProperty('--shake-size', `${size}deg`);

            // 添加晃动样式类
            button.classList.add('shake');

            // 如果提供了自定义的晃动间隔，则应用
            if (interval && interval !== 500) { // 默认动画是500ms
                button.style.animationDuration = `${interval}ms`;
            }

            // 存储晃动效果的ID，以便后续可以移除
            this.buttonShakeEffects.set(buttonId, 1);
        }
    }

    /**
     * 移除按钮晃动效果
     * @param buttonId 按钮的ID
     */
    public RemoveButtonShakeEffect(buttonId: string): void {
        if (this.buttonShakeEffects.has(buttonId)) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('shake');
                button.style.removeProperty('--shake-size');
                button.style.removeProperty('animation-duration');
            }
            this.buttonShakeEffects.delete(buttonId);
        }
    }

    /**
     * 显示游戏标题
     * @param titleString 游戏标题文本
     * @param effect 标题效果（'pixel', 'glitch', 'neon'）
     * @param animation 动画效果（'pulse', 'float', 'flicker'）
     * @param x 水平位置（像素或百分比，例如 '50%'）
     * @param y 垂直位置（像素或百分比，例如 '20%'）
     */
    public ShowGameTitle(titleString: string, effect: string, animation: string, x: string, y: string): void {
        // 移除已有的标题
        if (this.titleElement && this.titleElement.parentNode) {
            this.titleElement.parentNode.removeChild(this.titleElement);
        }

        // 创建标题元素
        const title = document.createElement('div');
        title.textContent = titleString;
        title.setAttribute('data-text', titleString); // 用于故障效果

        // 设置标题样式
        let effectClass = '';
        switch (effect) {
            case this.TITLE_EFFECTS.PIXEL:
                effectClass = 'game-title-pixel';
                break;
            case this.TITLE_EFFECTS.GLITCH:
                effectClass = 'game-title-glitch';
                break;
            case this.TITLE_EFFECTS.NEON:
                effectClass = 'game-title-neon';
                break;
            default:
                effectClass = 'game-title-pixel'; // 默认为像素风格
        }

        // 添加基础类和效果类
        title.className = effectClass;

        // 设置位置
        title.style.left = x;
        title.style.top = y;
        title.style.scale = "2.0";

        // 等待入场动画完成后添加持续动画
        setTimeout(() => {
            let animationClass = '';
            switch (animation) {
                case this.TITLE_ANIMATIONS.PULSE:
                    animationClass = 'title-animation-pulse';
                    break;
                case this.TITLE_ANIMATIONS.FLOAT:
                    animationClass = 'title-animation-float';
                    break;
                case this.TITLE_ANIMATIONS.FLICKER:
                    animationClass = 'title-animation-flicker';
                    break;
                default:
                    animationClass = 'title-animation-pulse'; // 默认为脉冲动画
            }

            // 添加动画类
            title.classList.add(animationClass);
        }, 1000); // 等待1秒，入场动画结束后

        // 将标题添加到DOM
        document.body.appendChild(title);

        // 保存标题元素引用
        this.titleElement = title;
    }

    /**
     * 移除游戏标题
     */
    public HideGameTitle(): void {
        if (this.titleElement && this.titleElement.parentNode) {
            // 添加淡出动画
            this.titleElement.style.animation = 'fadeOut 0.5s forwards';

            // 动画结束后移除元素
            setTimeout(() => {
                if (this.titleElement && this.titleElement.parentNode) {
                    this.titleElement.parentNode.removeChild(this.titleElement);
                    this.titleElement = null;
                }
            }, 500);
        }
    }

    /**
     * 隐藏所有主菜单UI，并提供动画效果和回调
     * @param callback 动画结束后的回调函数
     */
    public HideALLMainMenuUI(callback?: () => void): void {
        // 创建一个标记，确保回调只被执行一次
        let callbackExecuted = false;
        let elementsToAnimate = 0;
        let animatedElements = 0;

        // 关闭所有窗口
        this.settingsWindowInstance.closeWindow();
        this.loadGameWindowInstance.closeWindow();
        this.aboutWindowInstance.closeWindow();

        // 隐藏主菜单面板
        if (this.mainContainer) {
            const panel = this.mainContainer.querySelector('.game-main-panel');
            if (panel) {
                elementsToAnimate++;
                (panel as HTMLElement).style.animation = 'panelSlideOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';

                // 监听动画结束事件
                const handlePanelAnimationEnd = () => {
                    panel.removeEventListener('animationend', handlePanelAnimationEnd);
                    animatedElements++;
                    this.mainContainer!.style.display = 'none';
                    checkAllAnimationsComplete();
                };

                panel.addEventListener('animationend', handlePanelAnimationEnd);
            }
        }

        // 隐藏游戏标题
        if (this.titleElement && this.titleElement.parentNode) {
            elementsToAnimate++;
            this.titleElement.classList.add('fade-out-animation');

            // 监听动画结束事件
            const handleTitleAnimationEnd = () => {
                this.titleElement!.removeEventListener('animationend', handleTitleAnimationEnd);
                if (this.titleElement && this.titleElement.parentNode) {
                    this.titleElement.parentNode.removeChild(this.titleElement);
                    this.titleElement = null;
                }
                animatedElements++;
                checkAllAnimationsComplete();
            };

            this.titleElement.addEventListener('animationend', handleTitleAnimationEnd);
        }

        // 检查是否所有动画都完成了
        const checkAllAnimationsComplete = () => {
            if (callbackExecuted) return;

            if (animatedElements >= elementsToAnimate) {
                callbackExecuted = true;
                // 如果提供了回调，则执行回调
                if (callback && typeof callback === 'function') {
                    // 通过setTimeout确保DOM操作完成后再执行回调
                    setTimeout(callback, 0);
                }
            }
        };

        // 如果没有任何需要动画的元素，直接执行回调
        if (elementsToAnimate === 0 && !callbackExecuted) {
            callbackExecuted = true;
            if (callback && typeof callback === 'function') {
                setTimeout(callback, 0);
            }
        }

        // 设置超时保障，确保即使动画事件没有触发，回调也会执行
        setTimeout(() => {
            if (!callbackExecuted) {
                console.log('Animation timeout safeguard triggered');
                callbackExecuted = true;

                // 清理可能未完成的动画元素
                if (this.mainContainer) {
                    this.mainContainer.style.display = 'none';
                }

                if (this.titleElement && this.titleElement.parentNode) {
                    this.titleElement.parentNode.removeChild(this.titleElement);
                    this.titleElement = null;
                }

                // 执行回调
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }, 1000); // 1秒超时
    }

    // 显示设置窗口
    private showSettingsWindow(): void {
        this.settingsWindowInstance.showWindow();
    }

    // 显示存档读取窗口
    private showLoadGameWindow(): void {
        console.log('UIMainMenu.showLoadGameWindow called');
        this.loadGameWindowInstance.showWindow();
    }

    // 显示关于窗口
    private showAboutWindow(): void {
        this.aboutWindowInstance.showWindow();
    }
}

export { UIMainMenu as GameMainScene };