import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

  if (pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name != "MainMenu") return
  initGameMainScene();

});



function initGameMainScene(): void {
  const gameMainScene = UIMainMenu.getInstance();
  gameMainScene.initialize();
  UIMainMenu.getInstance().MenuAddButton("语言", () => {

  })


  setTimeout(() => {

    UIMainMenu.getInstance().AddButtonShakeEffect('new-game-btn', 15, 800);
    const aboutModal = document.getElementById('about-modal');
    //@ts-ignore
    aboutModal.classList.remove('closing');
    //@ts-ignore
    aboutModal.classList.add('active');

    UIMainMenu.getInstance().ShowGameTitle("The Park <一>", "glitch", "flicker", "35%", "15%");
  }, 1000); // 延迟1秒，确保按钮已经完全显示


  (window as any).HideALLMainMenuUI = (callback?: () => void) => {
    UIMainMenu.getInstance().HideALLMainMenuUI(callback);
  };
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
  }

  private bindEvents(): void {
    // 新游戏按钮
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        //console.log('新游戏按钮点击 - 等待实现');
        //@ts-ignore
        //pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.GET_CONSTRUCT3_EVENTHANDL_INSTANCE.destroy();
        this.HideALLMainMenuUI(() => {
          pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level")
        })

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
            <div class="about-wrapper">
              <div class="version-tag">
                <span class="version-number">完全的Demo版本</span>
                <div class="tech-demo-badge">
                  <span class="badge-text">🚧 Tech Demo / Prototype 🚧</span>
                </div>
                <div class="version-glow"></div>
              </div>

              <div class="credits-section">
                <h2 class="section-title glitch-text" data-text="👨‍💻Credits">👨‍💻Credits</h2>
                <div class="credits-content">
                  <div class="credit-item">
                    <span class="role">Lead Developer:</span>
                    <span class="name">[chunchun]</span>
                  </div>
                  <div class="credit-item">
                    <span class="role">Design & Art:</span>
                    <span class="name">[chunchun]</span>
                  </div>
                  <div class="credit-item">
                    <span class="role">Programming:</span>
                    <span class="name">[chunchun]</span>
                  </div>
                  <div class="credit-item">
                    <span class="role">Sound/Music:</span>
                    <span class="name">[chunchun]</span>
                  </div>
                  <div class="credit-item">
                    <span class="role">Special Thanks:</span>
                    <span class="name blink-text">[? wait ]</span>
                  </div>
                </div>
              </div>

              <div class="about-section">
                <h2 class="section-title rainbow-text">🏷️About</h2>
                
                <p class="about-text typewriter-text">
                  🔧 "这是一个用于测试核心游戏系统的早期版本，欢迎试玩并反馈！"
                </p>
                <p class="about-text-en fade-in-text">
                  (This is an early prototype for testing core game systems. Your feedback is welcome!)
                </p>
              </div>

              <div class="contact-section">
                <h2 class="section-title pulse-text">📡 Contact & Follow Us 📺️</h2>
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
                  <div class="discord-info">
                    <span class="icon">📷</span>
                    <span class="info-text">Discord: _chunchun57</span>
                    <span class="discord-id">(ID: 371678255096397835)</span>
                  </div>
                </div>
              </div>

              <div class="thanks-message">
                <p class="message-text floating-text">"Thank you for playing! We poured our hearts into this game—hope you enjoy it!"</p>
                <div class="heart-container">
                  <div class="heart"></div>
                </div>
              </div>
            </div>
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
          left: 10px;
          top: 0;
        }
        
        @keyframes heartbeat {
          0% { transform: rotate(-45deg) scale(0.8); }
          5% { transform: rotate(-45deg) scale(0.9); }
          10% { transform: rotate(-45deg) scale(0.8); }
          15% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(0.8); }
          100% { transform: rotate(-45deg) scale(0.8); }
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

    // 隐藏所有弹窗
    const modals = document.querySelectorAll('.modal.active');
    if (modals.length > 0) {
      modals.forEach(modal => {
        elementsToAnimate++;
        modal.classList.add('closing');

        // 监听动画结束事件
        const handleModalAnimationEnd = () => {
          modal.removeEventListener('animationend', handleModalAnimationEnd);
          modal.classList.remove('active', 'closing');
          animatedElements++;
          checkAllAnimationsComplete();
        };

        modal.addEventListener('animationend', handleModalAnimationEnd);
      });
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

        document.querySelectorAll('.modal.active, .modal.closing').forEach(modal => {
          modal.classList.remove('active', 'closing');
        });

        // 执行回调
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    }, 1000); // 1秒超时
  }
}




export { UIMainMenu as GameMainScene };