import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";

/**
 * 主菜单关于窗口类
 */
export class UIMainAboutWindow {
    private aboutWindow: { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void } | null = null;
    
    /**
     * 显示关于窗口
     */
    public showWindow(): void {
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
    
    /**
     * 获取关于窗口引用
     */
    public getWindow(): { windowElement: HTMLElement, contentElement: HTMLElement, close: () => void } | null {
        return this.aboutWindow;
    }
    
    /**
     * 关闭关于窗口
     */
    public closeWindow(): void {
        if (this.aboutWindow) {
            this.aboutWindow.close();
            this.aboutWindow = null;
        }
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
        const maxPoops = 500; // 最多生成500个💩

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
        }, 2); // 每2ms生成一个💩

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
}
