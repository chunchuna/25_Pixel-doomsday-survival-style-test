import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
// GameMainScene.ts

class GameMainScene {
    private static instance: GameMainScene;
    private htmlTemplate: string;
    private cssStyles: string;
    private mainContainer: HTMLElement | null = null;
    private isMuted: boolean = false;
    private isFullscreen: boolean = false;
    private menuButtons: Map<string, () => void> = new Map(); // 存储按钮和对应的回调函数
    private buttonShakeEffects: Map<string, number> = new Map(); // 存储按钮晃动效果的间隔ID
  
    private constructor() {
      this.htmlTemplate = this.getHTMLTemplate();
      this.cssStyles = this.getCSSStyles();
    }
  
    public static getInstance(): GameMainScene {
      if (!GameMainScene.instance) {
        GameMainScene.instance = new GameMainScene();
      }
      return GameMainScene.instance;
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
    }
  
    private bindEvents(): void {
      // 新游戏按钮
      const newGameBtn = document.getElementById('new-game-btn');
      if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
          console.log('新游戏按钮点击 - 等待实现');
        });
      }
  
      // 设置按钮
      const settingsBtn = document.getElementById('settings-btn');
      const settingsModal = document.getElementById('settings-modal');
      
      if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
          settingsModal.classList.remove('closing');
          settingsModal.classList.add('active');
        });
      }
  
      // 存档读取按钮
      const loadGameBtn = document.getElementById('load-game-btn');
      const loadGameModal = document.getElementById('load-game-modal');
      
      if (loadGameBtn && loadGameModal) {
        loadGameBtn.addEventListener('click', () => {
          loadGameModal.classList.remove('closing');
          loadGameModal.classList.add('active');
        });
      }
  
      // 关于按钮
      const aboutBtn = document.getElementById('about-btn');
      const aboutModal = document.getElementById('about-modal');
      
      if (aboutBtn && aboutModal) {
        aboutBtn.addEventListener('click', () => {
          aboutModal.classList.remove('closing');
          aboutModal.classList.add('active');
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
          console.log('从本地读取存档 - 等待实现');
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
  
        <!-- 设置弹窗 -->
        <div id="settings-modal" class="modal">
          <div class="modal-content">
            <div class="modal-body">
              <div class="setting-item">
                <label for="mute-toggle">静音：</label>
                <label class="switch">
                  <input type="checkbox" id="mute-toggle">
                  <span class="slider round"></span>
                </label>
              </div>
              <div class="setting-item">
                <label for="fullscreen-toggle">全屏：</label>
                <label class="switch">
                  <input type="checkbox" id="fullscreen-toggle">
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 存档读取弹窗 -->
        <div id="load-game-modal" class="modal">
          <div class="modal-content">
            <div class="modal-body">
              <button id="load-local-btn" class="action-btn">从本地读取</button><div class="save-slots">
                <p>暂无存档</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 关于弹窗 -->
        <div id="about-modal" class="modal">
          <div class="modal-content">
            <div class="modal-body scrollable">
              <h3>游戏版本</h3>
              <p>v1.0.0</p>
              
              <h3>开发者</h3>
              <p>chunchun</p>
              
              <h3>游戏简介</h3>
              <p>这是一个精彩的RPG冒险游戏，玩家将在这个世界中探索未知的领域，经历各种奇幻冒险，解决各种谜题，与各种角色互动。</p>
              
              <h3>特别鸣谢</h3>
              <p>感谢所有参与游戏测试的玩家，你们的反馈让这款游戏变得更好！</p>
            </div>
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
            background-color: rgba(42, 42, 42, 0.85);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                       0 0 30px rgba(66, 134, 244, 0.2);
          }
          50% { 
            background-color: rgba(42, 42, 42, 0.75);
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5),
                       0 0 40px rgba(66, 134, 244, 0.3);
          }
          100% { 
            background-color: rgba(42, 42, 42, 0.85);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                       0 0 30px rgba(66, 134, 244, 0.2);
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
          0% { transform: translateX(0); }
          25% { transform: translateX(var(--shake-size)); }
          50% { transform: translateX(0); }
          75% { transform: translateX(calc(-1 * var(--shake-size))); }
          100% { transform: translateX(0); }
        }
  
        .game-main-panel {
          position: absolute;
          bottom: 0;
          left: 30%;
          transform: translate(-50%, 100%);
          width: 300px;
          padding: 20px;
          background-color: rgba(42, 42, 42, 0.85);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                      0 0 30px rgba(66, 134, 244, 0.2);
          border: 1px solid rgba(58, 58, 58, 0.5);
          backdrop-filter: blur(10px);
          opacity: 0;
          animation: panelSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     panelGlow 3s ease-in-out infinite;
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
          color: #e0e0e0;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateX(-50px);
          position: relative;
          overflow: hidden;
        }
  
        .menu-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.5s;
        }
  
        .menu-btn:hover {
          color: #ffffff;
          transform: scale(1.05);
          text-shadow: 0 0 10px rgba(66, 134, 244, 0.7);
        }
  
        .menu-btn:hover::before {
          left: 100%;
        }
  
        .menu-btn:active {
          transform: scale(0.98);
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
          background-color: rgba(42, 42, 42, 0.95);
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0,0.4),
                      0 0 30px rgba(66, 134, 244, 0.2);
          border: 1px solid rgba(58, 58, 58, 0.5);
          backdrop-filter: blur(10px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: modalSlideIn 0.3s forwards;
        }
  
        .modal.active .modal-content {
          opacity: 1;
          animation: modalContentGlow 3s ease-in-out infinite, modalSlideIn 0.3s forwards;
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
  
        @keyframes modalContentGlow {
          0% { 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                       0 0 30px rgba(66, 134, 244, 0.2);
          }
          50% { 
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5),
                       0 0 40px rgba(66, 134, 244, 0.3);
          }
          100% { 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                       0 0 30px rgba(66, 134, 244, 0.2);
          }
        }
  
        .modal-body {
          padding: 1.5rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
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
          width: 6px;
        }
  
        .scrollable::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
  
        .scrollable::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 10px;
        }
  
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
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
          background-color: #444;
          transition: .3s;
        }
  
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 4px;
          bottom: 4px;
          background-color: #e0e0e0;
          transition: .3s;
        }
  
        input:checked + .slider {
          background-color: #666;
        }
  
        input:checked + .slider:before {
          transform: translateX(24px);
        }
  
        .slider.round {
          border-radius: 22px;
        }
  
        .slider.round:before {
          border-radius: 50%;
        }
  
        .action-btn {
          padding: 0.6rem 0;
          background-color: transparent;
          color: #e0e0e0;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
          width: 100%;
        }
  
        .action-btn:hover {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(66, 134, 244, 0.7);
        }
  
        .save-slots {
          margin-top: 0.8rem;
          padding: 0.8rem;
          background-color: #333;
          border-radius: 4px;
          text-align: center;
          color: #aaa;
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
     * @param size 晃动幅度（像素）
     * @param interval 晃动间隔（毫秒）
     */
    public AddButtonShakeEffect(buttonId: string, size: number, interval: number): void {
      // 先清除已有的晃动效果
      this.RemoveButtonShakeEffect(buttonId);
      
      const button = document.getElementById(buttonId);
      if (button) {
        // 设置晃动幅度
        button.style.setProperty('--shake-size', `${size}px`);
        
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
  }
  
  // 主入口点
  function initGameMainScene(): void {
    const gameMainScene = GameMainScene.getInstance();
    gameMainScene.initialize();
  }
  
  // 使用SDK提供的初始化入口
  pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 初始化游戏主场景
    initGameMainScene();
  });
  
  export { GameMainScene };