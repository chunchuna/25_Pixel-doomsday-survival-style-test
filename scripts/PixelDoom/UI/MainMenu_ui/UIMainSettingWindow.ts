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
                'backgroundColor': '#101010',
                'transition': '.3s',
                'borderRadius': '22px',
                'overflow': 'hidden',
                'border': '1px solid #222'
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
                    'backgroundColor': checkbox && checkbox.checked ? '#ccc' : '#777',
                    'transition': '.3s',
                    'borderRadius': '50%'
                });
            }
        }

        checkbox.addEventListener('change', () => {
            this.value = checkbox.checked;
            
            // 更新滑块状态
            const thumb = slider.querySelector('.slider-thumb') as HTMLElement;
            if (thumb) {
                thumb.style.left = checkbox.checked ? '28px' : '4px';
                thumb.style.backgroundColor = checkbox.checked ? '#ccc' : '#777';
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
                    background-color: #101010;
                    border-radius: 3px;
                    border: 1px solid #222;
                    outline: none;
                    margin: 10px 0;
                    cursor: pointer;
                }
                
                #${rangeId}::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: #101010;
                    border-radius: 3px;
                    border: 1px solid #222;
                }
                
                #${rangeId}::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: #101010;
                    border-radius: 3px;
                    border: 1px solid #222;
                }
                
                #${rangeId}::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #888;
                    border-radius: 50%;
                    border: 1px solid #222;
                    margin-top: -4px;
                    cursor: pointer;
                }
                
                #${rangeId}::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #888;
                    border-radius: 50%;
                    border: 1px solid #222;
                    cursor: pointer;
                }
                
                #${rangeId}::-webkit-slider-thumb:hover {
                    background-color: #aaa;
                }
                
                #${rangeId}::-webkit-slider-thumb:active {
                    background-color: #ccc;
                }
                
                #${rangeId} {
                    background: #101010 !important;
                }
                
                .number-input-${rangeId} {
                    width: 60px;
                    text-align: center;
                    background-color: #101010;
                    color: #ccc;
                    border: 1px solid #222;
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
                'background': '#101010',
                'height': '8px',
                'borderRadius': '3px',
                'border': '1px solid #222',
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
        // 确保选项是数组并且有内容
        if (!Array.isArray(this.options) || this.options.length === 0) {
            console.error("No options provided for Choose setting:", this.label);
            return;
        }
        
        // 如果第一项是数组，使用它而不是外层数组
        const optionsArray = Array.isArray(this.options[0]) ? this.options[0] : this.options;
        
        const options = optionsArray.map(opt => 
            `<option value="${opt}" ${this.value === opt ? 'selected' : ''}>${opt}</option>`
        ).join('');

        this.element.innerHTML = `
            <label>${this.label}：</label>
            <select>
                ${options}
            </select>
        `;

        const select = this.element.querySelector('select') as HTMLSelectElement;
        
        // 应用更符合UI库风格的样式
        if (select) {
            Object.assign(select.style, {
                'backgroundColor': '#101010',
                'color': '#ccc',
                'border': '1px solid #222',
                'borderRadius': '3px',
                'padding': '5px',
                'outline': 'none',
                'cursor': 'pointer'
            });
        }

        select.addEventListener('change', () => {
            this.value = select.value;
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, name: this.label } }));
        });
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}

/**
 * 设置选项卡类
 */
export class SettingsTab {
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
        const setting = new SettingItem(label, type, value, options[0] instanceof Array ? options[0] : options);
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
        console.log(`Showing tab: ${this.name}`);
        this.element.style.display = 'block';
    }

    public hide() {
        console.log(`Hiding tab: ${this.name}`);
        this.element.style.display = 'none';
    }
}

/**
 * 主菜单设置窗口类
 */
export class UIMainSettingWindow {
    private settingsWindow: { 
        windowElement: HTMLElement, 
        contentElement: HTMLElement, 
        close: () => void, 
        AddTab?: (tabName: string) => SettingsTab 
    } | null = null;
    
    private isFullscreen: boolean = false;
    private isMuted: boolean = false;

    /**
     * 显示设置窗口
     */
    public showWindow(): void {
        // 关闭已打开的窗口
        if (this.settingsWindow) {
            this.settingsWindow.close();
        }
        
        // 创建新窗口
        const window = UIWindowLib.createWindow("Settings", 400, 300);
        
        // 添加选项卡功能
        const tabs: SettingsTab[] = [];
        let activeTab: SettingsTab | null = null;
        
        // 直接向窗口添加自定义样式
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
                background-color: rgba(0, 0, 0, 0.9) !important;
                border-bottom: 1px solid #222 !important;
            }
            
            .tab-button {
                padding: 8px 15px !important;
                color: #888 !important;
                background-color: transparent !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                outline: none !important;
            }
            
            .tab-button:hover {
                color: #ccc !important;
            }
            
            .tab-button.active {
                color: #ddd !important;
                border-bottom: 2px solid #444 !important;
                background-color: rgba(20, 20, 20, 0.7) !important;
            }
            
            .settings-tabs {
                flex: 1 !important;
                overflow-y: auto !important;
                padding: 10px !important;
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
                background-color: rgba(10, 10, 10, 0.8) !important;
                border-radius: 2px !important;
                border: 1px solid #222 !important;
                margin-bottom: 6px !important;
            }
            
            /* 确保选项卡容器内容可见 */
            .settings-tab {
                width: 100% !important;
                height: 100% !important;
            }
            
            /* 自定义滑动条样式 */
            input[type="range"] {
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                appearance: none !important;
                height: 8px !important;
                background-color: #101010 !important;
                border-radius: 3px !important;
                outline: none !important;
                margin: 10px 0 !important;
                cursor: pointer !important;
                border: 1px solid #222 !important;
                width: 100% !important;
            }
            
            /* 滑动条轨道样式 - Webkit (Chrome, Safari, Edge等) */
            input[type="range"]::-webkit-slider-runnable-track {
                width: 100% !important;
                height: 8px !important;
                cursor: pointer !important;
                background: #101010 !important;
                border-radius: 3px !important;
                border: 1px solid #222 !important;
            }
            
            /* 滑动条轨道样式 - Firefox */
            input[type="range"]::-moz-range-track {
                width: 100% !important;
                height: 8px !important;
                cursor: pointer !important;
                background: #101010 !important;
                border-radius: 3px !important;
                border: 1px solid #222 !important;
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
                background: #101010 !important;
                border: 1px solid #222 !important;
                border-radius: 3px !important;
            }
            
            input[type="range"]::-ms-fill-upper {
                background: #101010 !important;
                border: 1px solid #222 !important;
                border-radius: 3px !important;
            }
            
            /* 滑块样式 */
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none !important;
                appearance: none !important;
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #222 !important;
                cursor: pointer !important;
                margin-top: -4px !important;
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #222 !important;
                cursor: pointer !important;
            }
            
            input[type="range"]::-ms-thumb {
                width: 16px !important;
                height: 16px !important;
                background-color: #888 !important;
                border-radius: 50% !important;
                border: 1px solid #222 !important;
                cursor: pointer !important;
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
                background-color: #101010 !important;
                color: #ccc !important;
                border: 1px solid #222 !important;
                border-radius: 3px !important;
                padding: 5px !important;
                outline: none !important;
                cursor: pointer !important;
            }
            
            /* 自定义数字输入框样式 */
            input[type="number"] {
                background-color: #101010 !important;
                color: #ccc !important;
                border: 1px solid #222 !important;
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
                background-color: #101010 !important;
                transition: .3s !important;
                border-radius: 22px !important;
                overflow: hidden !important;
                border: 1px solid #222 !important;
            }
            
            .slider:before, .slider-thumb {
                position: absolute !important;
                content: "" !important;
                height: 14px !important;
                width: 14px !important;
                left: 4px !important;
                bottom: 3px !important;
                background-color: #777 !important;
                transition: .3s !important;
                border-radius: 50% !important;
            }
            
            input:checked + .slider {
                background-color: #222 !important;
            }
            
            input:checked + .slider:before, 
            input:checked + .slider .slider-thumb {
                transform: translateX(24px) !important;
                background-color: #ccc !important;
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
                
                console.log(`Clicked tab: ${tabName}`);
                
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
        const videoTab = addTab('Video');
        const fullScreenSetting = videoTab.AddSetting('Fullscreen', SettingType.Switch, this.isFullscreen);
        fullScreenSetting.addEventListener('change', (e: any) => {
            this.isFullscreen = e.detail.value;
            this.toggleFullscreen();
        });
        
        // 声音选项卡
        const audioTab = addTab('Audio');
        const muteSetting = audioTab.AddSetting('Mute', SettingType.Switch, this.isMuted);
        muteSetting.addEventListener('change', (e: any) => {
            this.isMuted = e.detail.value;
            console.log('Mute status:', this.isMuted);
        });
        const volumeSetting = audioTab.AddSetting('Volume', SettingType.Number, 50, 0, 100);
        volumeSetting.addEventListener('change', (e: any) => {
            console.log('Volume set to:', e.detail.value);
        });
        
        // 游戏性选项卡
        const gameplayTab = addTab('Gameplay');
        console.log("Adding difficulty setting with options:", ['Easy', 'Medium', 'Hard', 'Nightmare']);
        const difficultySetting = gameplayTab.AddSetting('Difficulty', SettingType.Choose, 'Medium', ['Easy', 'Medium', 'Hard', 'Nightmare']);
        difficultySetting.addEventListener('change', (e: any) => {
            console.log('Difficulty set to:', e.detail.value);
        });
        
        // 确保选项卡导航可见
        console.log(`Created ${tabs.length} tabs`);
    }
    
    /**
     * 获取设置窗口引用
     */
    public getWindow(): { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void } | null {
        return this.settingsWindow;
    }
    
    /**
     * 关闭设置窗口
     */
    public closeWindow(): void {
        if (this.settingsWindow) {
            this.settingsWindow.close();
            this.settingsWindow = null;
        }
    }
    
    /**
     * 切换全屏状态
     */
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
}

export { SettingType };
