// GameMainScene.ts

import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
// GameMainScene.ts

class GameMainScene {
    private static instance: GameMainScene;
    private htmlTemplate: string;
    private cssStyles: string;
    private mainContainer: HTMLElement | null = null;
    private isMuted: boolean = false;
    private isFullscreen: boolean = false;
  
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
      const closeSettingsBtn = document.getElementById('close-settings-btn');
      
      if (settingsBtn && settingsModal && closeSettingsBtn) {
        settingsBtn.addEventListener('click', () => {
          settingsModal.classList.add('active');
        });
        
        closeSettingsBtn.addEventListener('click', () => {
          settingsModal.classList.remove('active');
        });
      }
  
      // 存档读取按钮
      const loadGameBtn = document.getElementById('load-game-btn');
      const loadGameModal = document.getElementById('load-game-modal');
      const closeLoadGameBtn = document.getElementById('close-load-game-btn');
      
      if (loadGameBtn && loadGameModal && closeLoadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
          loadGameModal.classList.add('active');
        });
        
        closeLoadGameBtn.addEventListener('click', () => {
          loadGameModal.classList.remove('active');
        });
      }
  
      // 关于按钮
      const aboutBtn = document.getElementById('about-btn');
      const aboutModal = document.getElementById('about-modal');
      const closeAboutBtn = document.getElementById('close-about-btn');
      
      if (aboutBtn && aboutModal && closeAboutBtn) {
        aboutBtn.addEventListener('click', () => {
          aboutModal.classList.add('active');
        });
        
        closeAboutBtn.addEventListener('click', () => {
          aboutModal.classList.remove('active');
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
            <div class="modal-header">
              <h2>游戏设置</h2>
              <button id="close-settings-btn" class="close-btn">×</button>
            </div>
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
            <div class="modal-header">
              <h2>读取存档</h2>
              <button id="close-load-game-btn" class="close-btn">×</button>
            </div>
            <div class="modal-body">
              <button id="load-local-btn" class="action-btn">从本地读取</button>
              <div class="save-slots">
                <p>暂无存档</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 关于弹窗 -->
        <div id="about-modal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>关于游戏</h2>
              <button id="close-about-btn" class="close-btn">×</button>
            </div>
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
          gap: 0.1rem;
        }
  
        .menu-btn {
          padding: 0.2rem 0;
          background-color: rgba(58, 58, 58, 0.7);
          color: #e0e0e0;
          border: 1px solid rgba(74, 74, 74, 0.5);
          border-radius: 4px;
          font-size: 0.8rem;
          max-height: 35px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateX(-50px);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(5px);
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
          background-color: rgba(74, 74, 74, 0.9);
          transform: scale(1.02);
          box-shadow: 0 0 15px rgba(66, 134, 244, 0.3);
        }
  
        .menu-btn:hover::before {
          left: 100%;
        }
  
        .menu-btn:active {
          transform: scale(0.98);
          background-color: rgba(85, 85, 85, 0.9);
        }
  
        .menu-btn.show {
          opacity: 1;
          transform: translateX(0);
        }
  
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
  
        .modal.active {
          display: flex;
        }
  
        .modal-content {
          background-color: #2a2a2a;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid #3a3a3a;
        }
  
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1rem;
          background-color: #333;
          border-bottom: 1px solid #444;
        }
  
        .modal-header h2 {
          color: #e0e0e0;
          font-size: 1.2rem;
        }
  
        .close-btn {
          background: none;
          border: none;
          color: #e0e0e0;
          font-size: 1.5rem;
          cursor: pointer;
        }
  
        .modal-body {
          padding: 1rem;
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
          background-color: #3a3a3a;
          color: #e0e0e0;
          border: 1px solid #4a4a4a;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
          width: 100%;
        }
  
        .action-btn:hover {
          background-color: #4a4a4a;
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