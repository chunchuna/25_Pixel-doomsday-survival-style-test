import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { LocalSave, SaveSetting } from "../../Group/Save/PIXSave.js";
import { TransitionEffectType, UIScreenEffect } from "../screeneffect_ui/UIScreenEffect.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";
import { data } from "../../Group/Save/PIXSave.js"
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";

/**
 * 设置类型枚举
 */
enum SettingType {
    Switch,
    Number,
    Choose
}

/**
 * 设置项类
 */
class SettingItem extends EventTarget {
    private element: HTMLElement;
    private type: SettingType;
    private value: any;
    private label: string;
    private options: any[];

    constructor(label: string, type: SettingType, value: any, options: any[] = []) {
        super();
        this.label = label;
        this.type = type;
        this.value = value;
        this.options = options;
        this.element = document.createElement('div');
        this.element.className = 'setting-item';
        this.render();
    }

    private render() {
        switch (this.type) {
            case SettingType.Switch:
                this.renderSwitch();
                break;
            case SettingType.Number:
                this.renderNumber();
                break;
            case SettingType.Choose:
                this.renderChoose();
                break;
        }
    }

    private renderSwitch() {
        this.element.innerHTML = `
            <label>${this.label}：</label>
            <label class="switch">
                <input type="checkbox" ${this.value ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;

        // 添加开关样式
        const switchLabel = this.element.querySelector('.switch') as HTMLElement;
        if (switchLabel) {
            Object.assign(switchLabel.style, {
                'position': 'relative',
                'display': 'inline-block',
                'width': '46px',
                'height': '22px'
            });
        }

        // 添加输入框样式
        const checkbox = this.element.querySelector('input') as HTMLInputElement;
        if (checkbox) {
            Object.assign(checkbox.style, {
                'opacity': '0',
                'width': '0',
                'height': '0'
            });
        }

        // 添加滑块样式
        const slider = this.element.querySelector('.slider') as HTMLElement;
        if (slider) {
            Object.assign(slider.style, {
                'position': 'absolute',
                'cursor': 'pointer',
                'top': '0',
                'left': '0',
                'right': '0',
                'bottom': '0',
                'backgroundColor': '#333',
                'transition': '.3s',
                'borderRadius': '22px',
                'overflow': 'hidden'
            });

            // 添加滑块圆点
            slider.innerHTML = '<div class="slider-thumb"></div>';
            const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
            if (thumb) {
                Object.assign(thumb.style, {
                    'position': 'absolute',
                    'content': '""',
                    'height': '14px',
                    'width': '14px',
                    'left': checkbox && checkbox.checked ? '28px' : '4px',
                    'bottom': '4px',
                    'backgroundColor': checkbox && checkbox.checked ? '#fff' : '#d0d0d0',
                    'transition': '.3s',
                    'borderRadius': '50%',
                    'boxShadow': checkbox && checkbox.checked ? '0 0 5px rgba(255, 255, 255, 0.5)' : 'none'
                });
            }
        }

        checkbox.addEventListener('change', () => {
            this.value = checkbox.checked;
            
            // 更新滑块状态
            const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
            if (thumb) {
                thumb.style.left = checkbox.checked ? '28px' : '4px';
                thumb.style.backgroundColor = checkbox.checked ? '#fff' : '#d0d0d0';
                thumb.style.boxShadow = checkbox.checked ? '0 0 5px rgba(255, 255, 255, 0.5)' : 'none';
            }
            
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, name: this.label } }));
        });
    }

    private renderNumber() {
        const min = this.options[0] || 0;
        const max = this.options[1] || 100;
        const step = (max - min) / 100;
        
        // 创建一个唯一的ID给滑动条
        const rangeId = `range-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // 自定义样式表，直接插入到设置项中
        const customStyle = `
            <style>
                #${rangeId} {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    background-color: #222;
                    border-radius: 3px;
                    border: 1px solid #444;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
                    outline: none;
                    margin: 10px 0;
                    cursor: pointer;
                }
                
                #${rangeId}::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: #222;
                    border-radius: 3px;
                    border: 1px solid #444;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
                }
                
                #${rangeId}::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: #222;
                    border-radius: 3px;
                    border: 1px solid #444;
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
                }
                
                #${rangeId}::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #888;
                    border-radius: 50%;
                    border: 1px solid #444;
                    margin-top: -4px;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                }
                
                #${rangeId}::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #888;
                    border-radius: 50%;
                    border: 1px solid #444;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                }
                
                #${rangeId}::-webkit-slider-thumb:hover {
                    background-color: #aaa;
                }
                
                #${rangeId}::-webkit-slider-thumb:active {
                    background-color: #ccc;
                }
                
                /* 完全自定义的滑动条外观 */
                #${rangeId} {
                    background: #222 !important; /* 强制背景色 */
                }
                
                /* 数字输入框样式 */
                .number-input-${rangeId} {
                    width: 60px;
                    text-align: center;
                    background-color: #333;
                    color: #fff;
                    border: 1px solid #555;
                    border-radius: 3px;
                    padding: 2px 5px;
                }
            </style>
        `;
        
        this.element.innerHTML = `
            ${customStyle}
            <div style="display: flex; flex-direction: column; width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <label>${this.label}：</label>
                    <input type="number" class="number-input-${rangeId}" min="${min}" max="${max}" step="${step}" value="${this.value}">
                </div>
                <input id="${rangeId}" type="range" min="${min}" max="${max}" step="${step}" value="${this.value}">
            </div>
        `;
        
        const numberInput = this.element.querySelector('input[type="number"]') as HTMLInputElement;
        const rangeInput = this.element.querySelector('input[type="range"]') as HTMLInputElement;
        
        // 使用JavaScript设置样式
        if (rangeInput) {
            // 设置自定义样式以确保覆盖默认样式
            Object.assign(rangeInput.style, {
                '-webkit-appearance': 'none',
                '-moz-appearance': 'none',
                'appearance': 'none',
                'background': '#222',
                'height': '8px',
                'borderRadius': '3px',
                'border': '1px solid #444',
                'boxShadow': 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                'outline': 'none',
                'width': '100%'
            });
        }
        
        numberInput.addEventListener('change', () => {
            const newValue = parseFloat(numberInput.value);
            rangeInput.value = newValue.toString();
            this.value = newValue;
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, name: this.label } }));
        });
        
        rangeInput.addEventListener('input', () => {
            const newValue = parseFloat(rangeInput.value);
            numberInput.value = newValue.toString();
            this.value = newValue;
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, name: this.label } }));
        });
    }

    private renderChoose() {
        const options = this.options.map(opt => 
            `<option value="${opt}" ${this.value === opt ? 'selected' : ''}>${opt}</option>`
        ).join('');

        this.element.innerHTML = `
            <label>${this.label}：</label>
            <select>
                ${options}
            </select>
        `;

        const select = this.element.querySelector('select') as HTMLSelectElement;
        
        // 应用UIWindowLib风格的样式
        if (select) {
            Object.assign(select.style, {
                'backgroundColor': '#333',
                'color': '#fff',
                'border': '1px solid #555',
                'borderRadius': '3px',
                'padding': '5px',
                'outline': 'none'
            });
        }

        select.addEventListener('change', () => {
            this.value = select.value;
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, name: this.value } }));
        });
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}

/**
 * 设置选项卡类
 */
class SettingsTab {
    private element: HTMLElement;
    private contentElement: HTMLElement;
    private name: string;
    private settings: SettingItem[] = [];

    constructor(name: string) {
        this.name = name;
        this.element = document.createElement('div');
        this.element.className = 'settings-tab';
        this.element.id = `tab-${name}`;
        this.element.style.display = 'none';

        this.contentElement = document.createElement('div');
        this.contentElement.className = 'tab-content';
        this.element.appendChild(this.contentElement);
    }

    public AddSetting(label: string, type: SettingType, value: any, ...options: any[]): SettingItem {
        const setting = new SettingItem(label, type, value, options);
        this.settings.push(setting);
        this.contentElement.appendChild(setting.getElement());
        return setting;
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public getName(): string {
        return this.name;
    }

    public show() {
        console.log(`显示选项卡: ${this.name}`);
        this.element.style.display = 'block';
    }

    public hide() {
        console.log(`隐藏选项卡: ${this.name}`);
        this.element.style.display = 'none';
    }
}

var IsInitGameMainMenu = false
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

    if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "MainMenu") return
    UIMainMenu.getInstance().ShowMainMenu()
    if (IsInitGameMainMenu) return;
    IsInitGameMainMenu = true;

    initGameMainScene();

});



async function initGameMainScene(): Promise<void> {
    const gameMainScene = UIMainMenu.getInstance();
    gameMainScene.initialize();
    UIMainMenu.getInstance().MenuAddButton("语言", () => {
    })

    setTimeout(() => {

        UIMainMenu.getInstance().AddButtonShakeEffect('new-game-btn', 15, 800);
        // const aboutModal = document.getElementById('about-modal');
        // //@ts-ignore
        // aboutModal.classList.remove('closing');
        // //@ts-ignore
        // aboutModal.classList.add('active');

        //UIMainMenu.getInstance().ShowGameTitle("The Park <一>", "glitch", "flicker", "35%", "15%");
    }, 1000); // 延迟1秒，确保按钮已经完全显示

    UIMainMenu.getInstance().HideALLMainMenuUI();
    await pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.WAIT_TIME_FORM_PROMISE(1);
    UIMainMenu.getInstance().ShowMainMenu();

    (window as any).HideALLMainMenuUI = (callback?: () => void) => {
        UIMainMenu.getInstance().HideALLMainMenuUI(callback);
    };

    // 删除这行代码，避免访问私有方法
    // gameMainScene.simpleUpdateSaveUI();
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
    private currentDataCheckInterval: number | null = null; // 存储当前的数据检查定时器ID
    
    // 存储窗口引用
    private settingsWindow: { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void, AddTab?: (tabName: string) => SettingsTab } | null = null;
    private loadGameWindow: { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void } | null = null;
    private aboutWindow: { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void } | null = null;

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

        // 初始检查数据状态
        this.checkDataAndUpdateUI();
    }

    private bindEvents(): void {
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('新游戏按钮点击 - 等待实现');
                this.HideALLMainMenuUI(() => {
                    UIScreenEffect.FadeOut(3000, TransitionEffectType.WIPE_RADIAL, () => {
                        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level")
                    })
                })
            });
        }

        // 设置按钮
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsWindow();
            });
        }

        // 存档读取按钮
        const loadGameBtn = document.getElementById('load-game-btn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                this.showLoadGameWindow();
            });
        }

        // 关于按钮
        const aboutBtn = document.getElementById('about-btn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                this.showAboutWindow();
            });
        }

        // 静音切换
        const muteToggle = document.getElementById('mute-toggle') as HTMLInputElement;
        if (muteToggle) {
            muteToggle.addEventListener('change', () => {
                this.isMuted = muteToggle.checked;
                console.log('静音状态:', this.isMuted);
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

        // 本地读取按钮
        const loadLocalBtn = document.getElementById('load-local-btn');
        if (loadLocalBtn) {
            loadLocalBtn.addEventListener('click', () => {
                // 首先显示加载中文本
                const noSaveText = document.getElementById('no-save-text');
                if (noSaveText) {
                    noSaveText.textContent = "请选择存档文件...";
                }
                
                // 执行读取 - LocalSave.DataRead() 是异步的，会打开文件选择器
                // 不应该在这里立即更新UI，而是监听数据变化
                LocalSave.DataRead();
                
                // 设置数据检查定时器 - 每秒检查一次是否有数据加载完成
                const maxWaitTime = 60000; // 最长等待1分钟
                const startTime = Date.now();
                let dataCheckInterval = setInterval(() => {
                    // 检查是否加载了数据
                    if (data && data.LevelGameData && data.LevelGameData.length > 0) {
                        // 有数据，清除定时器并更新UI
                        clearInterval(dataCheckInterval);
                        this.updateSaveUI();
                        console.log("数据加载完成，更新UI");
                    } else {
                        // 检查是否超时
                        if (Date.now() - startTime > maxWaitTime) {
                            clearInterval(dataCheckInterval);
                            if (noSaveText) {
                                noSaveText.textContent = "未加载存档或加载超时";
                            }
                            console.log("数据加载超时");
                        }
                    }
                }, 1000);
                
                // 保存定时器ID，以便在关闭窗口时清除
                this.currentDataCheckInterval = dataCheckInterval;
            });
        }

        // 下载存档按钮
        const saveLocalBtn = document.getElementById('save-local-btn');
        if (saveLocalBtn) {
            saveLocalBtn.addEventListener('click', () => {
                LocalSave.DataDownload();
            });
        }

        // 统一处理所有模态框的关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            // 点击背景关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    // 清除可能存在的数据检查定时器
                    if (this.currentDataCheckInterval) {
                        clearInterval(this.currentDataCheckInterval);
                        this.currentDataCheckInterval = null;
                        console.log("通过模态背景点击关闭窗口，清除存档计时器");
                    }
                    
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
            <button id="new-game-btn" class="menu-btn">新游戏</button>
            <button id="settings-btn" class="menu-btn">设置</button>
            <button id="load-game-btn" class="menu-btn">存档读取</button>
            <button id="about-btn" class="menu-btn">关于</button>
          </div>
        </div>
        `;
    }

    // CSS样式
    private getCSSStyles(): string {
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
  
        @keyframes modalSlideIn {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
  
        @keyframes modalSlideOut {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-50px);
            opacity: 0;
          }
        }
  
        @keyframes buttonShake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(var(--shake-size)); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(calc(-1 * var(--shake-size))); }
          100% { transform: rotate(0deg); }
        }

        /* 游戏标题入场动画 */
        @keyframes titleEntrance {
          0% {
            transform: scale(0.5);
            opacity: 0;
            filter: blur(10px);
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }

        /* 脉冲动画 */
        @keyframes titlePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* 浮动动画 */
        @keyframes titleFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }

        /* 闪烁动画 */
        @keyframes titleFlicker {
          0% { opacity: 1; }
          7% { opacity: 0.8; }
          10% { opacity: 1; }
          27% { opacity: 1; }
          30% { opacity: 0.6; }
          35% { opacity: 1; }
          52% { opacity: 1; }
          55% { opacity: 0.9; }
          60% { opacity: 1; }
          67% { opacity: 1; }
          70% { opacity: 0.7; }
          75% { opacity: 1; }
          100% { opacity: 1; }
        }

        /* 像素风格字体阴影 */
        .game-title-pixel {
          font-family: 'Press Start 2P', monospace, Arial, sans-serif;
          color: #ffffff;
          text-shadow: 3px 3px 0 #000000;
          letter-spacing: 1px;
          font-size: 2.5rem;
          font-weight: bold;
          text-transform: uppercase;
          image-rendering: pixelated;
          position: absolute;
          transform-origin: center;
          white-space: nowrap;
          animation: titleEntrance 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1000;
        }

        /* 故障风格 */
        .game-title-glitch {
          font-family: 'Courier New', monospace, Arial, sans-serif;
          color: #ffffff;
          text-shadow: 
            -2px 0 #ff0000,
            2px 2px #0000ff;
          font-size: 2.5rem;
          letter-spacing: 2px;
          font-weight: bold;
          text-transform: uppercase;
          position: absolute;
          transform-origin: center;
          white-space: nowrap;
          animation: titleEntrance 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1000;
        }

        .game-title-glitch::before,
        .game-title-glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .game-title-glitch::before {
          left: 2px;
          text-shadow: -1px 0 red;
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }

        .game-title-glitch::after {
          left: -2px;
          text-shadow: -1px 0 blue;
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim-1 {
          0% { clip-path: inset(30% 0 70% 0); }
          20% { clip-path: inset(80% 0 10% 0); }
          40% { clip-path: inset(50% 0 30% 0); }
          60% { clip-path: inset(10% 0 90% 0); }
          80% { clip-path: inset(40% 0 60% 0); }
          100% { clip-path: inset(5% 0 95% 0); }
        }

        @keyframes glitch-anim-2 {
          0% { clip-path: inset(20% 0 60% 0); }
          20% { clip-path: inset(60% 0 20% 0); }
          40% { clip-path: inset(40% 0 40% 0); }
          60% { clip-path: inset(70% 0 5% 0); }
          80% { clip-path: inset(10% 0 90% 0); }
          100% { clip-path: inset(30% 0 50% 0); }
        }

        /* 霓虹风格 */
        .game-title-neon {
          font-family: 'Arial', sans-serif;
          font-size: 2.5rem;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
          text-shadow:
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 15px #0073e6,
            0 0 20px #0073e6,
            0 0 25px #0073e6,
            0 0 30px #0073e6,
            0 0 35px #0073e6;
          position: absolute;
          transform-origin: center;
          white-space: nowrap;
          animation: titleEntrance 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1000;
        }

        /* 动画应用类 */
        .title-animation-pulse {
          animation: titlePulse 2s ease-in-out infinite;
        }

        .title-animation-float {
          animation: titleFloat 3s ease-in-out infinite;
        }

        .title-animation-flicker {
          animation: titleFlicker 4s linear infinite;
        }
  
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
        }
  
        .game-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #e0e0e0;
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
  
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
  
        .modal.active {
          display: flex;
          animation: modalBackgroundFadeIn 0.3s forwards;
        }
  
        .modal.closing {
          animation: modalBackgroundFadeOut 0.3s forwards;
        }
  
        .modal-content {
          position: relative;
          background-color: rgba(25, 25, 25, 0.85);
          border-radius: 4px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          border: none;
          backdrop-filter: blur(10px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: modalSlideIn 0.3s forwards;
        }
  
        .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
        }
  
        .modal-content::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
        }
  
        .modal.active .modal-content {
          opacity: 1;
          animation: modalSlideIn 0.3s forwards;
        }
  
        .modal-body {
          padding: 1.5rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          position: relative;
          border-top: none;
        }
  
        .modal-body::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
  
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.8rem;
          border-radius: 2px;
          background-color: rgba(40, 40, 40, 0.4);
          position: relative;
          overflow: hidden;
        }
  
        .setting-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
        }
  
        .action-btn {
          padding: 0.6rem 0;
          background-color: rgba(50, 50, 50, 0.4);
          color: #b0b0b0;
          border: none;
          border-radius: 2px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
  
        .action-btn::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 1px;
          background-color: #ffffff;
          transition: width 0.3s ease;
        }
  
        .action-btn:hover {
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
        }
  
        .action-btn:hover::before {
          width: 100%;
        }
  
        .action-btn:active {
          transform: scale(0.98);
        }
  
        .save-slots {
          margin-top: 1rem;
          padding: 0.8rem;
          background-color: rgba(35, 35, 35, 0.6);
          border-radius: 2px;
          text-align: center;
          color: #aaa;
          position: relative;
          overflow: hidden;
          border: none;
        }
  
        .save-slots::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
        }
  
        .save-slots::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
        }
  
        h3 {
          margin-top: 0.8rem;
          margin-bottom: 0.4rem;
          color: #ccc;
          font-size: 1rem;
        }
  
        p {
          margin-bottom: 0.8rem;
          line-height: 1.4;
          color: #aaa;
        }
  
        .ripple {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          pointer-events: none;
          width: 100px;
          height: 100px;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple-effect 1s ease-out;
        }
  
        @keyframes ripple-effect {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
  
        .modal.closing .modal-content {
          animation: modalSlideOut 0.3s forwards;
          opacity: 0;
        }
  
        @keyframes modalBackgroundFadeIn {
          from { background-color: rgba(0, 0, 0, 0); }
          to { background-color: rgba(0, 0, 0, 0.7); }
        }
  
        @keyframes modalBackgroundFadeOut {
          from { background-color: rgba(0, 0, 0, 0.7); }
          to { background-color: rgba(0, 0, 0, 0); }
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
        
        .fade-out-animation {
          animation: fadeOut 0.5s ease-out forwards;
        }
  
        .modal.active .modal-body {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.2s;
        }
  
        .scrollable {
          max-height: 50vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
  
        .scrollable::-webkit-scrollbar {
          width: 4px;
        }
  
        .scrollable::-webkit-scrollbar-track {
          background: rgba(40, 40, 40, 0.3);
          border-radius: 2px;
        }
  
        .scrollable::-webkit-scrollbar-thumb {
          background: rgba(80, 80, 80, 0.5);
          border-radius: 2px;
        }
  
        .switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 22px;
        }
  
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
  
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #333;
          transition: .3s;
          border-radius: 22px;
          overflow: hidden;
        }
  
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 4px;
          bottom: 4px;
          background-color: #d0d0d0;
          transition: .3s;
          border-radius: 50%;
        }
  
        .slider:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
  
        input:checked + .slider {
          background-color: #444;
        }
  
        input:checked + .slider:before {
          transform: translateX(24px);
          background-color: #fff;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        /* 关于页面的炫酷样式 */
        .about-wrapper {
          position: relative;
          padding: 10px 5px;
          overflow: hidden;
        }
        
        /* 版本标签 */
        .version-tag {
          position: relative;
          display: inline-block;
          padding: 5px 15px;
          background: rgba(40, 40, 40, 0.7);
          border-radius: 20px;
          margin-bottom: 15px;
          overflow: hidden;
        }
        
        .version-number {
          position: relative;
          z-index: 2;
          font-weight: bold;
          letter-spacing: 1px;
          color: #fff;
        }
        
        .version-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50px;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent
          );
          animation: version-shine 3s infinite;
        }
        
        @keyframes version-shine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
        
        /* 章节标题样式 */
        .section-title {
          font-size: 1.3rem;
          margin: 20px 0 10px;
          position: relative;
          display: inline-block;
        }
        
        /* 故障文本效果 */
        .glitch-text {
          position: relative;
          color: #fff;
          animation: glitch-skew 1s infinite linear alternate-reverse;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip: rect(16px, 9999px, 35px, 0); transform: skew(0.55deg); }
          5% { clip: rect(63px, 9999px, 78px, 0); transform: skew(0.75deg); }
          10% { clip: rect(95px, 9999px, 35px, 0); transform: skew(0.3deg); }
          15% { clip: rect(90px, 9999px, 100px, 0); transform: skew(0.12deg); }
          20% { clip: rect(96px, 9999px, 98px, 0); transform: skew(0.75deg); }
          25% { clip: rect(51px, 9999px, 53px, 0); transform: skew(0.51deg); }
          30% { clip: rect(44px, 9999px, 63px, 0); transform: skew(0.31deg); }
          35% { clip: rect(41px, 9999px, 28px, 0); transform: skew(0.2deg); }
          40% { clip: rect(89px, 9999px, 100px, 0); transform: skew(0.49deg); }
          45% { clip: rect(70px, 9999px, 100px, 0); transform: skew(0.1deg); }
          50% { clip: rect(18px, 9999px, 5px, 0); transform: skew(0.58deg); }
          55% { clip: rect(65px, 9999px, 52px, 0); transform: skew(0.87deg); }
          60% { clip: rect(13px, 9999px, 62px, 0); transform: skew(0.38deg); }
          65% { clip: rect(60px, 9999px, 56px, 0); transform: skew(0.59deg); }
          70% { clip: rect(8px, 9999px, 75px, 0); transform: skew(0.24deg); }
          75% { clip: rect(66px, 9999px, 55px, 0); transform: skew(0.72deg); }
          80% { clip: rect(98px, 9999px, 23px, 0); transform: skew(0.71deg); }
          85% { clip: rect(69px, 9999px, 14px, 0); transform: skew(0.02deg); }
          90% { clip: rect(9px, 9999px, 74px, 0); transform: skew(0.48deg); }
          95% { clip: rect(52px, 9999px, 93px, 0); transform: skew(0.01deg); }
          100% { clip: rect(53px, 9999px, 84px, 0); transform: skew(0.05deg); }
        }
        
        @keyframes glitch-anim2 {
          0% { clip: rect(25px, 9999px, 40px, 0); transform: skew(0.25deg); }
          5% { clip: rect(90px, 9999px, 83px, 0); transform: skew(0.56deg); }
          10% { clip: rect(24px, 9999px, 82px, 0); transform: skew(0.66deg); }
          15% { clip: rect(78px, 9999px, 74px, 0); transform: skew(0.12deg); }
          20% { clip: rect(60px, 9999px, 3px, 0); transform: skew(0.23deg); }
          25% { clip: rect(55px, 9999px, 49px, 0); transform: skew(0.84deg); }
          30% { clip: rect(12px, 9999px, 18px, 0); transform: skew(0.75deg); }
          35% { clip: rect(66px, 9999px, 73px, 0); transform: skew(0.22deg); }
          40% { clip: rect(41px, 9999px, 58px, 0); transform: skew(0.28deg); }
          45% { clip: rect(24px, 9999px, 92px, 0); transform: skew(0.2deg); }
          50% { clip: rect(20px, 9999px, 14px, 0); transform: skew(0.1deg); }
          55% { clip: rect(65px, 9999px, 25px, 0); transform: skew(0.85deg); }
          60% { clip: rect(12px, 9999px, 66px, 0); transform: skew(0.55deg); }
          65% { clip: rect(49px, 9999px, 95px, 0); transform: skew(0.93deg); }
          70% { clip: rect(86px, 9999px, 73px, 0); transform: skew(0.36deg); }
          75% { clip: rect(50px, 9999px, 66px, 0); transform: skew(0.12deg); }
          80% { clip: rect(2px, 9999px, 60px, 0); transform: skew(0.68deg); }
          85% { clip: rect(97px, 9999px, 74px, 0); transform: skew(0.61deg); }
          90% { clip: rect(74px, 9999px, 85px, 0); transform: skew(0.37deg); }
          95% { clip: rect(22px, 9999px, 39px, 0); transform: skew(0.61deg); }
          100% { clip: rect(91px, 9999px, 91px, 0); transform: skew(0.47deg); }
        }
        
        @keyframes glitch-skew {
          0% { transform: skew(-2deg); }
          10% { transform: skew(1deg); }
          20% { transform: skew(0deg); }
          30% { transform: skew(0deg); }
          40% { transform: skew(-1deg); }
          50% { transform: skew(-1deg); }
          60% { transform: skew(0deg); }
          70% { transform: skew(1deg); }
          80% { transform: skew(-1deg); }
          90% { transform: skew(0deg); }
          100% { transform: skew(0deg); }
        }
        
        /* 彩虹文本效果 */
        .rainbow-text {
          background-image: linear-gradient(
            90deg,
            #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: rainbow-animation 6s linear infinite;
        }
        
        @keyframes rainbow-animation {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        /* 脉冲文本效果 */
        .pulse-text {
          animation: pulse-text 2s infinite;
        }
        
        @keyframes pulse-text {
          0% { text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #00e6e6, 0 0 8px #00e6e6; }
          50% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #00e6e6, 0 0 40px #00e6e6; }
          100% { text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #00e6e6, 0 0 8px #00e6e6; }
        }
        
        /* 闪烁文本效果 */
        .blink-text {
          animation: blink-animation 1s infinite;
        }
        
        @keyframes blink-animation {
          0% { opacity: 1; }
          49% { opacity: 1; }
          50% { opacity: 0; }
          99% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        /* Credits 样式 */
        .credits-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
          background: rgba(30, 30, 30, 0.4);
          padding: 10px;
          border-radius: 5px;
          border-left: 2px solid rgba(100, 100, 255, 0.5);
        }
        
        .credit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 3px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .role {
          color: #aaa;
          font-weight: bold;
        }
        
        .name {
          color: #ddd;
          padding-left: 10px;
        }
        
        /* Tech Demo 徽章 */
        .tech-demo-badge {
          background: linear-gradient(45deg, #ff7e5f, #feb47b);
          display: inline-block;
          padding: 5px 10px;
          border-radius: 5px;
          margin: 10px 0;
          position: relative;
          overflow: hidden;
          animation: badge-pulse 3s infinite;
        }
        
        .badge-text {
          color: #fff;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        }
        
        @keyframes badge-pulse {
          0% { box-shadow: 0 0 5px rgba(255, 126, 95, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 126, 95, 0.8); }
          100% { box-shadow: 0 0 5px rgba(255, 126, 95, 0.5); }
        }
        
        /* 打字机效果 */
        .typewriter-text {
          border-right: 2px solid rgba(255, 255, 255, 0.75);
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 4s steps(40) 1s 1 normal both,
                    blinkCursor 0.5s step-end infinite;
        }
        
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes blinkCursor {
          from, to { border-color: transparent; }
          50% { border-color: rgba(255, 255, 255, 0.75); }
        }
        
        /* 淡入文本效果 */
        .fade-in-text {
          opacity: 0;
          animation: fadeIn 2s ease-in-out 3s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* 社交链接样式 */
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        
        .social-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #ddd;
          padding: 8px 12px;
          border-radius: 5px;
          background: rgba(40, 40, 40, 0.5);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .social-link .icon {
          margin-right: 10px;
          font-size: 1.2em;
        }
        
        .link-hover-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            transparent
          );
          transition: 0.5s;
        }
        
        .social-link:hover {
          background: rgba(60, 60, 60, 0.6);
          transform: translateY(-2px);
        }
        
        .social-link:hover .link-hover-effect {
          left: 100%;
        }
        
        .bilibili-link:hover {
          box-shadow: 0 0 10px rgba(0, 160, 255, 0.5);
        }
        
        .steam-link:hover {
          box-shadow: 0 0 10px rgba(90, 100, 255, 0.5);
        }
        
        .discord-info {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 5px;
          background: rgba(40, 40, 40, 0.5);
          margin-top: 5px;
        }
        
        .discord-info .icon {
          margin-right: 10px;
          font-size: 1.2em;
        }
        
        .discord-id {
          margin-left: auto;
          font-size: 0.8em;
          color: #999;
        }
        
        /* 感谢消息 */
        .thanks-message {
          margin-top: 25px;
          text-align: center;
          position: relative;
          padding: 15px 0;
        }
        
        .message-text {
          font-style: italic;
          color: #ddd;
          line-height: 1.5;
          max-width: 90%;
          margin: 0 auto 15px;
        }
        
        .floating-text {
          animation: float 4s ease-in-out infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        /* 心形动画 */
        .heart-container {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }
        
        .heart {
          background-color: #ff3860;
          display: inline-block;
          height: 20px;
          position: relative;
          transform: rotate(-45deg);
          width: 20px;
          animation: heartbeat 1.5s ease infinite;
        }
        
        .heart:before,
        .heart:after {
          content: "";
          background-color: #ff3860;
          border-radius: 50%;
          height: 20px;
          position: absolute;
          width: 20px;
        }
        
        .heart:before {
          top: -10px;
          left: 0;
        }
        
        .heart:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          width: 80%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        
        @keyframes heartbeat {
          0% { transform: rotate(-45deg) scale(0.8); }
          5% { transform: rotate(-45deg) scale(0.9); }
          10% { transform: rotate(-45deg) scale(0.8); }
          15% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(0.8); }
          100% { transform: rotate(-45deg) scale(0.8); }
        }

        /* 💩相关样式 */
        .poop-container {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background-color: rgba(25, 25, 25, 0.8);
          border-radius: 8px;
          border: 1px solid rgba(60, 60, 60, 0.6);
          margin-bottom: 20px;
        }

        .poop {
          position: absolute;
          font-size: 24px;
          user-select: none;
          z-index: 10;
          transition: transform 0.1s linear;
          will-change: transform;
        }

        @keyframes poopFadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes contactPopIn {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .contact-section {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 80%;
          max-width: 300px;
          background-color: rgba(20, 20, 20, 0.9);
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(80, 80, 80, 0.5);
          backdrop-filter: blur(5px);
          z-index: 20;
        }

        .contact-section.pop-in {
          animation: contactPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .section-title.pulse-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #00e6e6, 0 0 15px #00e6e6;
          margin-bottom: 15px;
          text-align: center;
          font-size: 1.2rem;
          color: #fff;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .social-links {
          background-color: rgba(30, 30, 30, 0.7);
          border-radius: 5px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .social-link, .discord-info {
          margin-bottom: 0;
          backdrop-filter: blur(2px);
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.3s ease;
          border: 1px solid rgba(80, 80, 80, 0.3);
        }

        .social-link:hover {
          background-color: rgba(50, 50, 50, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .social-link .icon, .discord-info .icon {
          font-size: 1.2em;
          margin-right: 8px;
          display: inline-block;
          vertical-align: middle;
        }

        .discord-info {
          background-color: rgba(40, 40, 40, 0.6);
        }

        .discord-id {
          display: block;
          margin-top: 5px;
          font-size: 0.8em;
          color: #aaa;
          padding-left: 20px;
        }

        @keyframes poopRain {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(400px); }
        }

        .special-btn {
          background-color: rgba(80, 80, 150, 0.6);
          color: #ddd;
          margin-top: 15px;
          padding: 10px 0;
          border: 1px solid rgba(100, 100, 200, 0.3);
          transition: all 0.3s ease;
        }
        
        .special-btn:hover {
          background-color: rgba(90, 90, 180, 0.7);
          color: #fff;
          border-color: rgba(120, 120, 255, 0.6);
          box-shadow: 0 0 10px rgba(100, 100, 255, 0.3);
        }
        
        #data-load-section {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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
        if (this.mainContainer) {
            this.mainContainer.style.display = 'block';
            const panel = this.mainContainer.querySelector('.game-main-panel');
            if (panel) {
                (panel as HTMLElement).style.animation = 'panelSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards, panelGlow 3s ease-in-out infinite';
            }
            // 重新触发按钮动画
            setTimeout(() => {
                this.animateMenuButtons();
            }, 500);
        }
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
        if (this.settingsWindow) {
            this.settingsWindow.close();
            this.settingsWindow = null;
        }
        
        if (this.loadGameWindow) {
            // 清除可能存在的数据检查定时器
            if (this.currentDataCheckInterval) {
                clearInterval(this.currentDataCheckInterval);
                this.currentDataCheckInterval = null;
            }
            
            this.loadGameWindow.close();
            this.loadGameWindow = null;
        }
        
        if (this.aboutWindow) {
            this.aboutWindow.close();
            this.aboutWindow = null;
        }

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
                console.log('动画超时保障触发');
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

    /**
     * 初始化💩动画效果
     */
    private initPoopAnimation(): void {
        console.log('初始化💩动画');
        // 获取💩容器和联系方式容器
        const poopContainer = document.getElementById('poop-container');
        const contactInfo = document.getElementById('contact-info');

        if (!poopContainer || !contactInfo) {
            console.error('找不到必要的DOM元素:', { poopContainer, contactInfo });
            return;
        }

        // 清空容器，防止重复生成
        poopContainer.innerHTML = '';
        contactInfo.style.display = 'none';
        contactInfo.classList.remove('pop-in'); // 移除动画类，以便下次可以再次触发

        // 重新添加联系方式到容器中
        poopContainer.appendChild(contactInfo);
        console.log('联系方式已添加到💩容器中');

        // 容器尺寸
        const containerWidth = poopContainer.clientWidth;
        const containerHeight = poopContainer.clientHeight;
        console.log('容器尺寸:', { width: containerWidth, height: containerHeight });

        // 💩元素集合和物理属性
        const poops: {
            element: HTMLElement;
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            rotation: number;
            rotationSpeed: number;
        }[] = [];

        // 创建一个💩元素
        const createPoop = () => {
            // 随机位置（覆盖整个容器区域）
            const x = Math.random() * containerWidth;
            const y = Math.random() * containerHeight * 0.4; // 从上方40%区域开始掉落

            // 随机大小
            const size = 20 + Math.random() * 20; // 20-40px

            // 创建元素
            const poopElement = document.createElement('div');
            poopElement.className = 'poop';
            poopElement.textContent = '💩';
            poopElement.style.fontSize = `${size}px`;
            poopElement.style.left = `${x}px`;
            poopElement.style.top = `${y}px`;
            poopElement.style.opacity = '0';
            poopContainer.appendChild(poopElement);

            // 随机速度 - 增加速度范围使emoji更活跃
            const vx = (Math.random() - 0.5) * 4; // 水平速度±2
            const vy = 1 + Math.random() * 3; // 垂直速度1-4

            // 随机旋转 - 增加旋转速度
            const rotation = Math.random() * 360;
            const rotationSpeed = (Math.random() - 0.5) * 20; // 增加旋转速度

            // 添加到集合
            poops.push({
                element: poopElement,
                x, y, vx, vy, size, rotation, rotationSpeed
            });

            // 淡入动画
            setTimeout(() => {
                poopElement.style.opacity = '1';
                poopElement.style.animation = 'poopFadeIn 0.3s forwards';
            }, 10);
        };

        // 更新💩位置
        const updatePoops = () => {
            const gravity = 0.2;
            const friction = 0.95; // 减小摩擦力，让它们移动更久
            const bounce = 0.8; // 增加弹性，让它们弹跳更多

            poops.forEach(poop => {
                // 应用重力
                poop.vy += gravity;

                // 更新位置
                poop.x += poop.vx;
                poop.y += poop.vy;

                // 更新旋转
                poop.rotation += poop.rotationSpeed;

                // 边界碰撞检测 - 改进碰撞处理，使其更有活力
                // 底部碰撞
                if (poop.y + poop.size > containerHeight) {
                    poop.y = containerHeight - poop.size;
                    // 反弹时给一个随机的水平速度扰动，使其行为更不可预测
                    poop.vy = -poop.vy * bounce;
                    poop.vx = poop.vx * friction + (Math.random() - 0.5) * 2;
                }

                // 左右边界碰撞
                if (poop.x < 0) {
                    poop.x = 0;
                    poop.vx = -poop.vx * bounce + Math.random() * 1; // 增加随机性
                } else if (poop.x + poop.size > containerWidth) {
                    poop.x = containerWidth - poop.size;
                    poop.vx = -poop.vx * bounce - Math.random() * 1; // 增加随机性
                }

                // 顶部碰撞（防止飞得太高）
                if (poop.y < 0) {
                    poop.y = 0;
                    poop.vy = Math.abs(poop.vy) * 0.5; // 向下反弹，但减少能量
                }

                // 偶尔随机更改速度，使运动更混乱
                if (Math.random() < 0.01) { // 1%的几率
                    poop.vx += (Math.random() - 0.5) * 1;
                    poop.rotationSpeed += (Math.random() - 0.5) * 5;
                }

                // 更新DOM元素位置
                poop.element.style.transform = `translate(${poop.x}px, ${poop.y}px) rotate(${poop.rotation}deg)`;
            });
        };

        // 创建💩的定时器
        let poopCreationCount = 0;
        const maxPoops = 500; // 最多生成30个💩

        const poopIntervalId = setInterval(() => {
            createPoop();
            poopCreationCount++;

            if (poopCreationCount >= maxPoops) {
                clearInterval(poopIntervalId);

                // 1秒后显示联系方式
                setTimeout(() => {
                    console.log('准备显示联系方式');
                    // 显示联系方式并添加弹出动画
                    contactInfo.style.display = 'block';
                    setTimeout(() => {
                        console.log('添加弹出动画');
                        contactInfo.classList.add('pop-in');
                    }, 50);

                    // 不清除💩，让它们继续存在并移动
                }, 20);
            }
        }, 2); // 每22ms生成一个💩

        // 动画循环
        const animationId = setInterval(updatePoops, 16); // 约60fps

        // 清理函数
        const cleanup = () => {
            clearInterval(poopIntervalId);
            clearInterval(animationId);
        };

        // 当弹窗关闭时清理资源
        const aboutModal = document.getElementById('about-modal');
        if (aboutModal) {
            const handleModalClose = () => {
                if (!aboutModal.classList.contains('active')) {
                    cleanup();
                    aboutModal.removeEventListener('transitionend', handleModalClose);
                }
            };

            aboutModal.addEventListener('transitionend', handleModalClose);
        }
    }

    /**
     * 检查存档数据并更新UI显示
     */
    private checkDataAndUpdateUI(): void {
        // 立即检查一次
        this.updateSaveUI();
        
        // 设置定时器定期检查数据变化
        const dataUpdateInterval = setInterval(() => {
            // 检查存档窗口是否还存在，如果不存在则清除定时器
            if (!this.loadGameWindow) {
                console.log("存档窗口已关闭，停止数据更新检查");
                clearInterval(dataUpdateInterval);
                
                // 同时确保数据检查定时器也被清除
                if (this.currentDataCheckInterval) {
                    console.log("确保清除存档计时器");
                    clearInterval(this.currentDataCheckInterval);
                    this.currentDataCheckInterval = null;
                }
                return;
            }
            
            // 窗口存在，更新UI
            this.updateSaveUI();
        }, 2000); // 每2秒检查一次
    }

    /**
     * 更新存档界面UI
     */
    private updateSaveUI(): void {
        if (!this.loadGameWindow) {
            console.log("存档窗口未打开，跳过更新");
            return;
        }
        
        // 查找窗口中的元素
        const { contentElement } = this.loadGameWindow;
        const noSaveText = contentElement.querySelector('#no-save-text');
        const dataLoadSection = contentElement.querySelector('#data-load-section');
        const useDataBtn = contentElement.querySelector('#use-data-btn');
        
        if (!noSaveText || !dataLoadSection) {
            console.error("未在contentElement中找到存档UI元素");
            
            // 尝试在整个文档中查找
            this.scanForSaveElements();
            return;
        }
        
        // 判断是否有存档数据
        if (data && data.LevelGameData && data.LevelGameData.length > 0) {
            console.log("找到存档数据，更新UI");
            
            // 隐藏无存档提示
            (noSaveText as HTMLElement).style.display = 'none';
            
            // 显示存档按钮区域
            (dataLoadSection as HTMLElement).style.display = 'block';
            
            // 设置按钮点击事件
            if (useDataBtn) {
                const handleUseDataClick = () => {
                    console.log("点击使用存档按钮");
                    UISubtitleMain.ShowSubtitles("使用关卡存档进行游戏", 5);
                    this.HideALLMainMenuUI(() => {
                        UIScreenEffect.FadeOut(3000, TransitionEffectType.WIPE_RADIAL, () => {
                            SaveSetting.isUseDataEnterNewGame = true;
                            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level");
                        });
                    });
                };
                
                // 移除可能存在的事件监听器
                useDataBtn.removeEventListener('click', handleUseDataClick);
                // 添加事件监听器
                useDataBtn.addEventListener('click', handleUseDataClick, true);
            }
        } else {
            console.log("未找到存档数据");
            
            // 显示无存档提示
            (noSaveText as HTMLElement).style.display = 'block';
            (noSaveText as HTMLElement).textContent = "暂无存档";
            
            // 隐藏存档按钮区域
            (dataLoadSection as HTMLElement).style.display = 'none';
        }
    }

    // 显示设置窗口
    private showSettingsWindow(): void {
        // 关闭已打开的窗口
        if (this.settingsWindow) {
            this.settingsWindow.close();
        }
        
        // 创建新窗口
        const window = UIWindowLib.createWindow("设置", 400, 300);
        
        // 添加选项卡功能
        const tabs: SettingsTab[] = [];
        let activeTab: SettingsTab | null = null;
        
        // 直接向窗口添加自定义样式，使用!important提高优先级
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
            /* 设置窗口的全局样式 */
            .settings-container {
                display: flex !important;
                flex-direction: column !important;
                height: 100% !important;
            }
            
            .tab-navbar {
                display: flex !important;
                background-color: rgba(30, 30, 30, 0.9) !important;
                border-bottom: 1px solid rgba(60, 60, 60, 0.8) !important;
            }
            
            .tab-button {
                padding: 8px 15px !important;
                color: #aaa !important;
                background-color: transparent !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                outline: none !important;
            }
            
            .tab-button:hover {
                color: #fff !important;
            }
            
            .tab-button.active {
                color: #fff !important;
                border-bottom: 2px solid rgba(100, 150, 255, 0.8) !important;
                background-color: rgba(40, 40, 40, 0.7) !important;
            }
            
            .settings-tabs {
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 10px !important;
                /* 注：窗口内容区域的滚动条样式由UIWindowLib提供，应用于.pd-window-content类 */
            }
            
            .tab-content {
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
            }
            
            .setting-item {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 8px 10px !important;
                background-color: rgba(40, 40, 40, 0.8) !important;
                border-radius: 4px !important;
                border: 1px solid rgba(60, 60, 60, 0.4) !important;
                margin-bottom: 6px !important;
            }
            
            /* 确保选项卡容器内容可见 */
            .settings-tab {
                width: 100% !important;
                height: 100% !important;
            }
            
            /* 自定义滑动条样式 - 增强版 */
            input[type="range"] {
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                appearance: none !important;
                height: 8px !important;
                background-color: #333 !important;
                border-radius: 3px !important;
                outline: none !important;
                margin: 10px 0 !important;
                cursor: pointer !important;
                border: 1px solid #444 !important;
                width: 100% !important;
            }
            
            /* 滑动条轨道样式 - Webkit (Chrome, Safari, Edge等) */
            input[type="range"]::-webkit-slider-runnable-track {
                width: 100% !important;
                height: 8px !important;
                cursor: pointer !important;
                background: #222 !important;
                border-radius: 3px !important;
                border: 1px solid #444 !important;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* 滑动条轨道样式 - Firefox */
            input[type="range"]::-moz-range-track {
                width: 100% !important;
                height: 8px !important;
                cursor: pointer !important;
                background: #222 !important;
                border-radius: 3px !important;
                border: 1px solid #444 !important;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* 滑动条轨道样式 - IE */
            input[type="range"]::-ms-track {
                width: 100% !important;
                height: 8px !important;
                cursor: pointer !important;
                background: transparent !important;
                border-color: transparent !important;
                color: transparent !important;
            }
            
            input[type="range"]::-ms-fill-lower {
                background: #222 !important;
                border: 1px solid #444 !important;
                border-radius: 3px !important;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
            }
            
            input[type="range"]::-ms-fill-upper {
                background: #222 !important;
                border: 1px solid #444 !important;
                border-radius: 3px !important;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* 滑块样式 */
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none !important;
                appearance: none !important;
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #444 !important;
                cursor: pointer !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
                margin-top: -4px !important; /* 调整位置使其居中 */
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #444 !important;
                cursor: pointer !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
            }
            
            input[type="range"]::-ms-thumb {
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #444 !important;
                cursor: pointer !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
            }
            
            /* 悬停状态样式 */
            input[type="range"]::-webkit-slider-thumb:hover {
                background-color: #aaa !important;
            }
            
            input[type="range"]::-webkit-slider-thumb:active {
                background-color: #ccc !important;
            }
            
            /* 自定义选择框样式 */
            select {
                background-color: #333 !important;
                color: #fff !important;
                border: 1px solid #555 !important;
                border-radius: 3px !important;
                padding: 5px !important;
                outline: none !important;
                cursor: pointer !important;
            }
            
            /* 自定义数字输入框样式 */
            input[type="number"] {
                background-color: #333 !important;
                color: #fff !important;
                border: 1px solid #555 !important;
                border-radius: 3px !important;
                padding: 2px 5px !important;
                width: 60px !important;
                text-align: center !important;
            }
            
            /* 开关样式 */
            .switch {
                position: relative !important;
                display: inline-block !important;
                width: 46px !important;
                height: 22px !important;
            }
            
            .switch input {
                opacity: 0 !important;
                width: 0 !important;
                height: 0 !important;
            }
            
            .slider {
                position: absolute !important;
                cursor: pointer !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background-color: #333 !important;
                transition: .3s !important;
                border-radius: 22px !important;
                overflow: hidden !important;
                border: 1px solid #444 !important;
            }
            
            .slider:before, .slider-thumb {
                position: absolute !important;
                content: "" !important;
                height: 14px !important;
                width: 14px !important;
                left: 4px !important;
                bottom: 3px !important;
                background-color: #d0d0d0 !important;
                transition: .3s !important;
                border-radius: 50% !important;
            }
            
            input:checked + .slider {
                background-color: #444 !important;
            }
            
            input:checked + .slider:before, 
            input:checked + .slider .slider-thumb {
                transform: translateX(24px) !important;
                background-color: #fff !important;
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.5) !important;
            }
        `;
        
        // 直接添加到窗口元素中而不是document.head
        window.contentElement.appendChild(styleElement);
        
        // 创建设置容器
        const container = document.createElement('div');
        container.className = 'settings-container';
        window.contentElement.appendChild(container);
        
        // 创建选项卡导航栏
        const navBar = document.createElement('div');
        navBar.className = 'tab-navbar';
        container.appendChild(navBar);
        
        // 创建选项卡内容区域
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'settings-tabs pd-window-content';
        container.appendChild(tabsContainer);
        
        // 添加选项卡方法
        const addTab = (tabName: string): SettingsTab => {
            const tab = new SettingsTab(tabName);
            tabs.push(tab);
            
            // 添加选项卡按钮
            const tabButton = document.createElement('button');
            tabButton.className = 'tab-button';
            tabButton.textContent = tabName;
            tabButton.setAttribute('data-tab', `tab-${tabName}`); // 添加关联标识
            
            // 增强点击事件处理
            const handleTabClick = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`点击选项卡: ${tabName}`);
                
                // 切换激活状态
                const allButtons = navBar.querySelectorAll('.tab-button');
                allButtons.forEach(btn => btn.classList.remove('active'));
                tabButton.classList.add('active');
                
                // 确保所有选项卡先隐藏
                tabs.forEach(t => {
                    const tabElement = t.getElement();
                    tabElement.style.display = 'none';
                });
                
                // 显示当前选项卡
                const tabElement = tab.getElement();
                tabElement.style.display = 'block';
                activeTab = tab;
            };
            
            // 使用多种事件类型和捕获阶段确保事件触发
            tabButton.addEventListener('click', handleTabClick, true);
            tabButton.addEventListener('mousedown', (e) => e.stopPropagation(), true);
            
            navBar.appendChild(tabButton);
            
            // 添加选项卡内容
            tabsContainer.appendChild(tab.getElement());
            
            // 如果是第一个选项卡，则激活它
            if (tabs.length === 1) {
                setTimeout(() => {
                    tabButton.click(); // 延迟触发点击事件
                }, 10);
            }
            
            return tab;
        };
        
        // 扩展window对象，添加AddTab方法
        this.settingsWindow = {
            ...window,
            AddTab: addTab
        };
        
        // 预先添加默认选项卡和设置
        // 视频选项卡
        const videoTab = addTab('视频');
        const fullScreenSetting = videoTab.AddSetting('全屏', SettingType.Switch, this.isFullscreen);
        fullScreenSetting.addEventListener('change', (e: any) => {
            this.isFullscreen = e.detail.value;
            this.toggleFullscreen();
        });
        
        // 声音选项卡
        const audioTab = addTab('声音');
        const muteSetting = audioTab.AddSetting('静音', SettingType.Switch, this.isMuted);
        muteSetting.addEventListener('change', (e: any) => {
            this.isMuted = e.detail.value;
            console.log('静音状态:', this.isMuted);
        });
        const volumeSetting = audioTab.AddSetting('音量', SettingType.Number, 50, 0, 100);
        volumeSetting.addEventListener('change', (e: any) => {
            console.log('音量设置为:', e.detail.value);
        });
        
        // 游戏性选项卡
        const gameplayTab = addTab('游戏性');
        const difficultySetting = gameplayTab.AddSetting('难度', SettingType.Choose, '中', ['简单', '中', '困难', '噩梦']);
        difficultySetting.addEventListener('change', (e: any) => {
            console.log('难度设置为:', e.detail.value);
        });
        
        // 确保选项卡导航可见
        console.log(`已创建 ${tabs.length} 个选项卡`);
    }
    
    // 显示存档读取窗口
    private showLoadGameWindow(): void {
        console.log("显示存档读取窗口");
        
        // 关闭已打开的窗口
        if (this.loadGameWindow) {
            this.loadGameWindow.close();
            this.loadGameWindow = null;
        }
        
        // 创建新窗口
        this.loadGameWindow = UIWindowLib.createWindow("存档读取", 400, 300,1);
        const { contentElement, windowElement } = this.loadGameWindow;
        
        // 绑定窗口关闭事件处理
        const originalClose = this.loadGameWindow.close;
        this.loadGameWindow.close = () => {
            console.log("关闭存档窗口，清理资源");
            // 清除可能存在的定时器
            if (this.currentDataCheckInterval) {
                clearInterval(this.currentDataCheckInterval);
                this.currentDataCheckInterval = null;
            }
            originalClose();
        };
        
        // 监听窗口元素被移除事件，确保在任何移除情况下都能清理定时器
        const observeWindowRemoval = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    for (let i = 0; i < mutation.removedNodes.length; i++) {
                        if (mutation.removedNodes[i] === windowElement) {
                            console.log("窗口被移除，确保清理定时器");
                            if (this.currentDataCheckInterval) {
                                clearInterval(this.currentDataCheckInterval);
                                this.currentDataCheckInterval = null;
                            }
                            observeWindowRemoval.disconnect();
                            break;
                        }
                    }
                }
            });
        });
        
        // 开始观察窗口元素的父节点
        if (windowElement.parentNode) {
            observeWindowRemoval.observe(windowElement.parentNode, { childList: true });
        }
        
        // 添加唯一ID标识，避免ID冲突
        const uniqueId = Date.now().toString();
        const loadLocalBtnId = `load-local-btn-${uniqueId}`;
        const saveLocalBtnId = `save-local-btn-${uniqueId}`;
        const useDataBtnId = `use-data-btn-${uniqueId}`;
        const noSaveTextId = `no-save-text-${uniqueId}`;
        const dataLoadSectionId = `data-load-section-${uniqueId}`;
        
        // 添加存档读取内容
        contentElement.innerHTML = `
            <style>
                /* 整体样式 */
                .save-container {
                    background-color: rgba(25, 25, 25, 0.9);
                    border-radius: 4px;
                    padding: 15px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                /* 按钮统一样式 */
                .action-btn {
                    padding: 10px 0;
                    background-color: rgba(40, 40, 40, 0.7);
                    color: #b0b0b0;
                    border: 1px solid rgba(60, 60, 60, 0.5);
                    border-radius: 3px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 12px;
                    text-align: center;
                    font-weight: 500;
                }
                
                .action-btn:hover {
                    color: #ffffff;
                    background-color: rgba(50, 50, 50, 0.8);
                    border-color: rgba(80, 80, 80, 0.7);
                    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
                    transform: translateY(-1px);
                }
                
                .action-btn:active {
                    transform: translateY(1px);
                    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
                }
                
                /* 按钮光晕效果 */
                .action-btn::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                    opacity: 0;
                    transform: scale(0.5);
                    transition: opacity 0.5s, transform 0.5s;
                }
                
                .action-btn:hover::after {
                    opacity: 1;
                    transform: scale(1);
                }
                
                /* 存档插槽区域 */
                .save-slots-container {
                    flex: 1;
                    margin-top: 15px;
                    background-color: rgba(20, 20, 20, 0.6);
                    border-radius: 4px;
                    border: 1px solid rgba(50, 50, 50, 0.5);
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                /* 存档插槽标题 */
                .save-slots-title {
                    color: #aaa;
                    font-size: 14px;
                    margin-bottom: 15px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(80, 80, 80, 0.3);
                    text-align: center;
                }
                
                /* 无存档提示 */
                #${noSaveTextId} {
                    text-align: center;
                    color: #888;
                    font-style: italic;
                    padding: 20px 0;
                    background-color: rgba(30, 30, 30, 0.4);
                    border-radius: 3px;
                    border: 1px dashed rgba(80, 80, 80, 0.3);
                    margin: auto 0;
                    font-size: 0.9rem;
                }
                
                /* 存档条目样式 */
                #${dataLoadSectionId} {
                    display: none;
                    height: 100%;
                    margin-top: 5px;
                }
                
                /* 存档插槽按钮 */
                .save-slot-btn {
                    background-color: rgba(30, 30, 30, 0.7);
                    border: 1px solid rgba(60, 60, 60, 0.6);
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 10px;
                    color: #ddd;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                
                .save-slot-btn:hover {
                    background-color: rgba(40, 40, 40, 0.8);
                    border-color: rgba(100, 100, 255, 0.4);
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
                    transform: translateY(-2px);
                }
                
                .save-slot-btn:active {
                    transform: translateY(1px);
                }
                
                /* 存档槽信息 */
                .slot-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    border-bottom: 1px solid rgba(100, 100, 100, 0.3);
                    padding-bottom: 8px;
                }
                
                .slot-title {
                    font-weight: bold;
                    color: #fff;
                    font-size: 16px;
                }
                
                .slot-date {
                    color: #aaa;
                    font-size: 12px;
                }
                
                .slot-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .slot-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                }
                
                .slot-stats-label {
                    color: #888;
                }
                
                .slot-stats-value {
                    color: #bbb;
                }
                
                /* 选中存档槽的发光效果 */
                .save-slot-selected {
                    border-color: rgba(100, 150, 255, 0.8);
                    box-shadow: 0 0 10px rgba(70, 130, 255, 0.4);
                }
                
                .save-slot-selected::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(to bottom, rgba(100, 150, 255, 0.9), rgba(70, 130, 255, 0.4));
                }
                
                /* 操作按钮区域 */
                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .action-buttons .action-btn {
                    flex: 1;
                    margin-bottom: 0;
                }
                
                /* 加载按钮 */
                #${loadLocalBtnId} {
                    background-color: rgba(40, 60, 80, 0.7);
                    border-color: rgba(60, 80, 100, 0.5);
                }
                
                #${loadLocalBtnId}:hover {
                    background-color: rgba(50, 70, 90, 0.8);
                    border-color: rgba(70, 90, 120, 0.7);
                    box-shadow: 0 0 8px rgba(50, 100, 150, 0.3);
                }
                
                /* 保存按钮 */
                #${saveLocalBtnId} {
                    background-color: rgba(50, 70, 50, 0.7);
                    border-color: rgba(70, 90, 70, 0.5);
                }
                
                #${saveLocalBtnId}:hover {
                    background-color: rgba(60, 80, 60, 0.8);
                    border-color: rgba(80, 110, 80, 0.7);
                    box-shadow: 0 0 8px rgba(70, 130, 70, 0.3);
                }
                
                /* 使用存档按钮 */
                #${useDataBtnId} {
                    background-color: rgba(70, 70, 120, 0.7);
                    color: #e0e0e0;
                    border-color: rgba(90, 90, 150, 0.6);
                    font-weight: bold;
                    padding: 12px;
                    position: relative;
                    overflow: hidden;
                }
                
                #${useDataBtnId}:hover {
                    background-color: rgba(80, 80, 140, 0.8);
                    color: #ffffff;
                    border-color: rgba(110, 110, 200, 0.7);
                    box-shadow: 0 0 15px rgba(80, 80, 180, 0.4);
                }
                
                #${useDataBtnId}::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent, 
                        rgba(255, 255, 255, 0.1), 
                        transparent);
                    transition: 0.6s;
                }
                
                #${useDataBtnId}:hover::after {
                    left: 100%;
                }
                
                /* 动画效果 */
                @keyframes pulse-border {
                    0% { border-color: rgba(90, 90, 150, 0.6); }
                    50% { border-color: rgba(120, 120, 200, 0.8); }
                    100% { border-color: rgba(90, 90, 150, 0.6); }
                }
                
                .pulse-animation {
                    animation: pulse-border 2s infinite;
                }
            </style>
            <div class="save-container">
                <div class="action-buttons">
                    <button id="${loadLocalBtnId}" class="action-btn">从本地读取</button>
                    <button id="${saveLocalBtnId}" class="action-btn">下载存档</button>
                </div>
                
                <div class="save-slots-container">
                    <div class="save-slots-title">存档插槽</div>
                    <div id="${noSaveTextId}">暂无存档</div>
                    
                    <div id="${dataLoadSectionId}">
                        <div class="save-slot-btn save-slot-selected" id="${useDataBtnId}">
                            <div class="slot-header">
                                <div class="slot-title">存档 #1</div>
                                <div class="slot-date">今天 12:34</div>
                            </div>
                            <div class="slot-info">
                                <div class="slot-stats">
                                    <span class="slot-stats-label">游戏进度:</span>
                                    <span class="slot-stats-value">未知</span>
                                </div>
                                <div class="slot-stats">
                                    <span class="slot-stats-label">游戏时间:</span>
                                    <span class="slot-stats-value">未知</span>
                                </div>
                                <div class="slot-stats">
                                    <span class="slot-stats-label">难度:</span>
                                    <span class="slot-stats-value">未知</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 使用更长的延时确保DOM完全加载
        setTimeout(() => {
            console.log("绑定存档窗口事件");
            
            // 直接创建按钮元素引用
            const loadLocalBtn = document.getElementById(loadLocalBtnId);
            const saveLocalBtn = document.getElementById(saveLocalBtnId);
            const noSaveText = document.getElementById(noSaveTextId);
            const dataLoadSection = document.getElementById(dataLoadSectionId);
            
            console.log("按钮元素状态:", { 
                loadLocalBtn: loadLocalBtn ? "找到" : "未找到", 
                saveLocalBtn: saveLocalBtn ? "找到" : "未找到",
                noSaveText: noSaveText ? "找到" : "未找到",
                dataLoadSection: dataLoadSection ? "找到" : "未找到"
            });
            
            // 本地读取按钮
            if (loadLocalBtn) {
                // 使用内联函数以确保this绑定正确
                const handleLoadLocalClick = () => {
                    console.log("点击从本地读取按钮");
                    
                    // 首先显示加载中文本
                    if (noSaveText) {
                        noSaveText.textContent = "请选择存档文件...";
                    }
                    
                    // 执行读取 - LocalSave.DataRead() 是异步的，会打开文件选择器
                    try {
                        LocalSave.DataRead();
                        console.log("调用 LocalSave.DataRead() 成功");
                    } catch (error) {
                        console.error("调用 LocalSave.DataRead() 失败:", error);
                    }
                    
                    // 设置数据检查定时器 - 每秒检查一次是否有数据加载完成
                    const maxWaitTime = 60000; // 最长等待1分钟
                    const startTime = Date.now();
                    
                    // 清除可能已存在的定时器
                    if (this.currentDataCheckInterval) {
                        clearInterval(this.currentDataCheckInterval);
                        this.currentDataCheckInterval = null;
                    }
                    
                    console.log("设置数据检查定时器");
                    this.currentDataCheckInterval = setInterval(() => {
                        // 检查是否加载了数据
                        console.log("检查数据:", data?.LevelGameData?.length);
                        if (data && data.LevelGameData && data.LevelGameData.length > 0) {
                            // 有数据，清除定时器并更新UI
                            console.log("发现存档数据，更新UI");
                            if (this.currentDataCheckInterval) {
                                clearInterval(this.currentDataCheckInterval);
                                this.currentDataCheckInterval = null;
                            }
                            
                            this.updateSaveUIWithIds(noSaveTextId, dataLoadSectionId, useDataBtnId);
                        } else {
                            // 检查是否超时
                            if (Date.now() - startTime > maxWaitTime) {
                                console.log("数据加载超时");
                                if (this.currentDataCheckInterval) {
                                    clearInterval(this.currentDataCheckInterval);
                                    this.currentDataCheckInterval = null;
                                }
                                
                                if (noSaveText) {
                                    noSaveText.textContent = "未加载存档或加载超时";
                                }
                            }
                            
                            // 检查窗口是否仍然存在，如果窗口已关闭则清除定时器
                            if (!this.loadGameWindow || !windowElement.isConnected) {
                                console.log("窗口已关闭，清除存档计时器");
                                if (this.currentDataCheckInterval) {
                                    clearInterval(this.currentDataCheckInterval);
                                    this.currentDataCheckInterval = null;
                                }
                            }
                        }
                    }, 1000);
                };
                
                // 先移除可能存在的监听器
                loadLocalBtn.removeEventListener('click', handleLoadLocalClick);
                // 添加新的监听器，确保使用捕获
                loadLocalBtn.addEventListener('click', handleLoadLocalClick, true);
                console.log("成功绑定本地读取按钮");
            } else {
                console.error(`未找到本地读取按钮: #${loadLocalBtnId}`);
            }
            
            // 下载存档按钮
            if (saveLocalBtn) {
                const handleSaveLocalClick = () => {
                    console.log("点击下载存档按钮");
                    try {
                        LocalSave.DataDownload();
                        console.log("调用 LocalSave.DataDownload() 成功");
                    } catch (error) {
                        console.error("调用 LocalSave.DataDownload() 失败:", error);
                    }
                };
                
                // 先移除可能存在的监听器
                saveLocalBtn.removeEventListener('click', handleSaveLocalClick);
                // 添加新的监听器，确保使用捕获
                saveLocalBtn.addEventListener('click', handleSaveLocalClick, true);
                console.log("成功绑定下载存档按钮");
            } else {
                console.error(`未找到下载存档按钮: #${saveLocalBtnId}`);
            }
            
            // 初始检查存档数据状态
            this.updateSaveUIWithIds(noSaveTextId, dataLoadSectionId, useDataBtnId);
        }, 300); // 使用更长的延时
    }
    
    /**
     * 使用指定ID更新存档界面UI
     */
    private updateSaveUIWithIds(noSaveTextId: string, dataLoadSectionId: string, useDataBtnId: string): void {
        console.log("使用ID更新存档UI:", { noSaveTextId, dataLoadSectionId, useDataBtnId });
        
        // 获取元素
        const noSaveText = document.getElementById(noSaveTextId);
        const dataLoadSection = document.getElementById(dataLoadSectionId);
        const useDataBtn = document.getElementById(useDataBtnId);
        
        console.log("获取到的元素:", { 
            noSaveText: noSaveText ? "找到" : "未找到", 
            dataLoadSection: dataLoadSection ? "找到" : "未找到",
            useDataBtn: useDataBtn ? "找到" : "未找到"
        });
        
        if (!noSaveText || !dataLoadSection) {
            console.error("未找到存档UI元素");
            return;
        }
        
        // 判断是否有存档数据
        if (data && data.LevelGameData && data.LevelGameData.length > 0) {
            console.log("找到存档数据，显示使用按钮");
            
            // 隐藏无存档提示
            noSaveText.style.display = 'none';
            
            // 显示存档按钮区域
            dataLoadSection.style.display = 'block';
            
            // 重新设置使用存档按钮事件
            if (useDataBtn) {
                // 使用内联函数以确保this绑定正确
                const handleUseDataClick = () => {
                    console.log("点击使用存档按钮");
                    
                    // 显示字幕
                    UISubtitleMain.ShowSubtitles("使用关卡存档进行游戏", 5);
                    
                    // 隐藏主菜单UI并跳转到Level
                    this.HideALLMainMenuUI(() => {
                        UIScreenEffect.FadeOut(3000, TransitionEffectType.WIPE_RADIAL, () => {
                            SaveSetting.isUseDataEnterNewGame = true;
                            pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level");
                        });
                    });
                };
                
                // 先移除可能存在的监听器
                useDataBtn.removeEventListener('click', handleUseDataClick);
                // 添加新的监听器，确保使用捕获
                useDataBtn.addEventListener('click', handleUseDataClick, true);
                
                // 为按钮添加特殊样式以便调试
                useDataBtn.style.border = "1px solid #e74c3c";
                console.log("成功绑定使用存档按钮");
            } else {
                console.error(`未找到使用数据按钮: #${useDataBtnId}`);
            }
        } else {
            console.log("未找到存档数据，显示暂无存档文本");
            
            // 显示无存档提示
            noSaveText.style.display = 'block';
            noSaveText.textContent = "暂无存档";
            
            // 隐藏存档按钮区域
            dataLoadSection.style.display = 'none';
        }
    }

    /**
     * 在整个文档中扫描存档相关元素
     */
    private scanForSaveElements(): void {
        console.log("扫描文档中的存档元素");
        
        // 查找所有可能的相关元素
        const loadLocalBtns = document.querySelectorAll('button[id^="load-local-btn"]');
        const saveLocalBtns = document.querySelectorAll('button[id^="save-local-btn"]');
        const useDataBtns = document.querySelectorAll('button[id^="use-data-btn"]');
        
        console.log("扫描结果:", {
            loadLocalBtns: loadLocalBtns.length,
            saveLocalBtns: saveLocalBtns.length,
            useDataBtns: useDataBtns.length
        });
        
        // 尝试重新绑定找到的按钮
        loadLocalBtns.forEach(btn => {
            console.log(`找到本地读取按钮: #${btn.id}`);
            btn.addEventListener('click', () => {
                console.log("点击从本地读取按钮");
                LocalSave.DataRead();
            }, true);
        });
        
        saveLocalBtns.forEach(btn => {
            console.log(`找到下载存档按钮: #${btn.id}`);
            btn.addEventListener('click', () => {
                console.log("点击下载存档按钮");
                LocalSave.DataDownload();
            }, true);
        });
        
        useDataBtns.forEach(btn => {
            console.log(`找到使用数据按钮: #${btn.id}`);
            btn.addEventListener('click', () => {
                console.log("点击使用存档按钮");
                UISubtitleMain.ShowSubtitles("使用关卡存档进行游戏", 5);
                this.HideALLMainMenuUI(() => {
                    UIScreenEffect.FadeOut(3000, TransitionEffectType.WIPE_RADIAL, () => {
                        SaveSetting.isUseDataEnterNewGame = true;
                        pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level");
                    });
                });
            }, true);
        });
    }

    // 显示关于窗口
    private showAboutWindow(): void {
        // 关闭已打开的窗口
        if (this.aboutWindow) {
            this.aboutWindow.close();
        }
        
        // 创建新窗口
        this.aboutWindow = UIWindowLib.createWindow("关于", 400, 450);
        const { contentElement } = this.aboutWindow;
        
        // 添加关于内容
        contentElement.innerHTML = `
            <style>
                .about-wrapper {
                    position: relative;
                    padding: 10px 5px;
                    overflow: hidden;
                }
                
                .poop-container {
                    position: relative;
                    width: 100%;
                    height: 300px;
                    overflow: hidden;
                    background-color: rgba(25, 25, 25, 0.8);
                    border-radius: 8px;
                    border: 1px solid rgba(60, 60, 60, 0.6);
                    margin-bottom: 20px;
                }
                
                .poop {
                    position: absolute;
                    font-size: 24px;
                    user-select: none;
                    z-index: 10;
                    transition: transform 0.1s linear;
                    will-change: transform;
                }
                
                @keyframes poopFadeIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                @keyframes contactPopIn {
                    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
                    60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                
                .contact-section {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    width: 80%;
                    max-width: 300px;
                    background-color: rgba(20, 20, 20, 0.9);
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(80, 80, 80, 0.5);
                    backdrop-filter: blur(5px);
                    z-index: 20;
                }
                
                .contact-section.pop-in {
                    animation: contactPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                
                .section-title.pulse-text {
                    text-shadow: 0 0 5px #fff, 0 0 10px #00e6e6, 0 0 15px #00e6e6;
                    margin-bottom: 15px;
                    text-align: center;
                    font-size: 1.2rem;
                    color: #fff;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                
                .social-links {
                    background-color: rgba(30, 30, 30, 0.7);
                    border-radius: 5px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .social-link, .discord-info {
                    margin-bottom: 0;
                    backdrop-filter: blur(2px);
                    padding: 8px 12px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(80, 80, 80, 0.3);
                }
                
                .social-link {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: #ddd;
                    position: relative;
                    overflow: hidden;
                }
                
                .social-link:hover {
                    background-color: rgba(50, 50, 50, 0.8);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .social-link .icon, .discord-info .icon {
                    font-size: 1.2em;
                    margin-right: 8px;
                    display: inline-block;
                    vertical-align: middle;
                }
                
                .link-hover-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg, 
                        transparent, 
                        rgba(255, 255, 255, 0.1), 
                        transparent
                    );
                    transition: 0.5s;
                }
                
                .social-link:hover .link-hover-effect {
                    left: 100%;
                }
                
                .bilibili-link:hover {
                    box-shadow: 0 0 10px rgba(0, 160, 255, 0.5);
                }
                
                .steam-link:hover {
                    box-shadow: 0 0 10px rgba(90, 100, 255, 0.5);
                }
                
                @keyframes poopRain {
                    0% { transform: translateY(-20px); }
                    100% { transform: translateY(400px); }
                }
            </style>
            <div class="about-wrapper">
                <!-- 💩生成容器 -->
                <div id="poop-container" class="poop-container"></div>
                <!-- 联系方式容器，初始隐藏 -->
                <div id="contact-info" class="contact-section" style="display: none;">
                    <div class="social-links">
                        <a href="https://space.bilibili.com/10794241" target="_blank" class="social-link bilibili-link">
                            <span class="icon">🐦</span>
                            <span class="link-text">Bilibili空间</span>
                            <div class="link-hover-effect"></div>
                        </a>
                        <a href="https://steamcommunity.com/profiles/76561198964375678/" target="_blank" class="social-link steam-link">
                            <span class="icon">🎮</span>
                            <span class="link-text">Steam个人资料</span>
                            <div class="link-hover-effect"></div>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // 初始化💩生成
        setTimeout(() => {
            this.initPoopAnimation();
        }, 100);
    }
}

export { UIMainMenu as GameMainScene };