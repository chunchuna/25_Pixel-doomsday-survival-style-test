/**
 * UIScreenEffect - 屏幕特效库
 * 提供各种屏幕过渡、受击和恐怖效果
 */

import { Unreal__ } from "../../../engine.js";
import { LayoutTransition, TransitionType } from "../layout_transition_ui/UILayoutTransition.js";



// 过渡效果枚举
enum TransitionEffectType {
    FADE = 'fade',               // 简单淡入淡出
    WIPE_LEFT = 'wipeLeft',      // 从左到右擦除
    WIPE_RADIAL = 'wipeRadial',  // 圆形扩散
    PIXELATE = 'pixelate',       // 像素化效果
    GLITCH = 'glitch'            // 故障效果
}

// 受击效果枚举
enum HitEffectType {
    FLASH_RED = 'flashRed',      // 红色闪烁
    BLOOD_SPLATTER = 'bloodSplatter', // 血液飞溅
    SHAKE = 'shake',             // 屏幕震动
    GRAYSCALE = 'grayscale',     // 短暂变成灰度
    BLUR = 'blur'                // 视野模糊
}

// 恐怖效果枚举
enum HorrorEffectType {
    VIGNETTE = 'vignette',       // 暗角效果
    DISTORTION = 'distortion',   // 画面扭曲
    NOISE = 'noise',             // 噪点效果
    INVERTED = 'inverted',       // 颜色反转
    WHISPER = 'whisper'          // 低语效果
}

// 文本动画效果枚举
enum TextAnimationType {
    FADE_IN = 'fadeIn',          // 淡入
    TYPE_WRITER = 'typeWriter',  // 打字机效果
    GLITCH_TEXT = 'glitchText',  // 故障文字
    PULSE = 'pulse',             // 脉冲效果
    SHAKE_TEXT = 'shakeText'     // 震动文字
}

// 特殊效果参数接口
interface SpecialEffectOptions {
    text?: string;               // 要显示的文本
    textPosition?: {             // 文本位置
        x: number;                 // 横坐标 (0-1，相对于屏幕宽度的比例)
        y: number;                 // 纵坐标 (0-1，相对于屏幕高度的比例)
    };
    textColor?: string;          // 文本颜色
    textSize?: string;           // 文本大小
    textAnimation?: {
        type: TextAnimationType;   // 文本动画类型
        duration: number;          // 动画持续时间（毫秒）
        delay?: number;            // 动画延迟（毫秒）
    };
    customCss?: string;          // 自定义CSS
}

/**
 * 屏幕特效管理器静态类
 */
export class UIScreenEffect {
    private static container: HTMLDivElement | null = null;
    private static overlay: HTMLDivElement | null = null;
    private static textElement: HTMLDivElement | null = null;
    private static activeEffects: Set<string> = new Set();
    private static styleElement: HTMLStyleElement | null = null;

    /**
     * 初始化屏幕特效系统
     */
    private static initialize(): void {
        if (this.container) return; // 已初始化

        // 添加CSS样式
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = `
      .ui-screen-effect-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999999;
        overflow: hidden;
      }
      .ui-screen-effect-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .ui-screen-effect-text {
        position: absolute;
        color: white;
        font-family: 'Courier New', monospace;
        text-align: center;
        opacity: 0;
        transform: translate(-50%, -50%);
        z-index: 10000;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      }
      
      /* 淡入淡出 */
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      /* 从左到右擦除 */
      @keyframes wipeLeftIn {
        0% { clip-path: inset(0 100% 0 0); }
        100% { clip-path: inset(0 0 0 0); }
      }
      @keyframes wipeLeftOut {
        0% { clip-path: inset(0 0 0 0); }
        100% { clip-path: inset(0 0 0 100%); }
      }
      
      /* 圆形扩散 */
      @keyframes wipeRadialIn {
        0% { 
          clip-path: circle(0% at center);
        }
        100% { 
          clip-path: circle(150% at center);
        }
      }
      @keyframes wipeRadialOut {
        0% { clip-path: circle(150% at center); }
        100% { clip-path: circle(0% at center); }
      }
      
      /* 像素化效果 */
      @keyframes pixelateIn {
        0% { filter: blur(0px); }
        50% { filter: blur(10px); }
        100% { filter: blur(0px); }
      }
      
      /* 故障效果 */
      @keyframes glitchEffect {
        0% {
          transform: translate(0);
          filter: hue-rotate(0deg);
        }
        10% {
          transform: translate(-5px, 0);
          filter: hue-rotate(90deg);
        }
        20% {
          transform: translate(5px, 0);
          filter: hue-rotate(180deg);
        }
        30% {
          transform: translate(0, 5px);
          filter: hue-rotate(270deg);
        }
        40% {
          transform: translate(0, -5px);
          filter: hue-rotate(0deg);
        }
        50% {
          transform: translate(-2px, 2px);
          filter: hue-rotate(90deg);
        }
        60% {
          transform: translate(2px, -2px);
          filter: hue-rotate(180deg);
        }
        70% {
          transform: translate(7px, 0);
          filter: hue-rotate(270deg);
        }
        80% {
          transform: translate(-7px, 0);
          filter: hue-rotate(0deg);
        }
        90% {
          transform: translate(0, 0);
          filter: hue-rotate(180deg);
        }
        100% {
          transform: translate(0);
          filter: hue-rotate(0deg);
        }
      }
      
      /* 红色闪烁效果 */
      @keyframes flashRed {
        0% { background-color: rgba(255, 0, 0, 0); }
        50% { background-color: rgba(255, 0, 0, 0.5); }
        100% { background-color: rgba(255, 0, 0, 0); }
      }
      
      /* 血液飞溅效果 */
      @keyframes bloodSplatter {
        0% { 
          background-image: none;
          opacity: 0;
        }
        10% { 
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="10" fill="darkred"/><circle cx="70" cy="40" r="15" fill="darkred"/><circle cx="40" cy="60" r="12" fill="darkred"/><circle cx="80" cy="70" r="8" fill="darkred"/></svg>');
          opacity: 0.7;
        }
        100% { opacity: 0; }
      }
      
      /* 屏幕震动效果 */
      @keyframes screenShake {
        0% { transform: translate(0, 0); }
        10% { transform: translate(-10px, -10px); }
        20% { transform: translate(10px, 10px); }
        30% { transform: translate(-10px, 10px); }
        40% { transform: translate(10px, -10px); }
        50% { transform: translate(-5px, -5px); }
        60% { transform: translate(5px, 5px); }
        70% { transform: translate(-3px, 3px); }
        80% { transform: translate(3px, -3px); }
        90% { transform: translate(-1px, -1px); }
        100% { transform: translate(0, 0); }
      }
      
      /* 灰度效果 */
      @keyframes grayscaleEffect {
        0% { filter: grayscale(0); }
        50% { filter: grayscale(1); }
        100% { filter: grayscale(0); }
      }
      
      /* 模糊效果 */
      @keyframes blurEffect {
        0% { filter: blur(0); }
        50% { filter: blur(5px); }
        100% { filter: blur(0); }
      }
      
      /* 暗角效果 */
      @keyframes vignetteEffect {
        0% { box-shadow: inset 0 0 0px rgba(0, 0, 0, 0); }
        100% { box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.8); }
      }
      
      /* 画面扭曲效果 */
      @keyframes distortionEffect {
        0% { transform: scale(1) skew(0deg); filter: blur(0); }
        25% { transform: scale(1.05) skew(5deg); filter: blur(2px); }
        50% { transform: scale(0.95) skew(-5deg); filter: blur(1px); }
        75% { transform: scale(1.05) skew(3deg); filter: blur(2px); }
        100% { transform: scale(1) skew(0deg); filter: blur(0); }
      }
      
      /* 噪点效果 */
      @keyframes noiseEffect {
        0%, 100% { background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23a)" opacity="0.2"/></svg>'); }
        25% { background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23a)" opacity="0.2"/></svg>'); }
        50% { background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23a)" opacity="0.2"/></svg>'); }
        75% { background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23a)" opacity="0.2"/></svg>'); }
      }
      
      /* 颜色反转效果 */
      @keyframes invertedEffect {
        0% { filter: invert(0); }
        50% { filter: invert(1); }
        100% { filter: invert(0); }
      }
      
      /* 文本淡入效果 */
      @keyframes textFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      /* 打字机效果 (在JS中实现) */
      
      /* 文本故障效果 */
      @keyframes textGlitch {
        0%, 100% { 
          transform: translateX(0);
          text-shadow: -2px 0 #0ff, 2px 0 #f0f;
        }
        5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95% {
          transform: translateX(-2px);
          text-shadow: 1px 0 #0ff, -1px 0 #f0f;
        }
        10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% {
          transform: translateX(2px);
          text-shadow: -1px 0 #0ff, 1px 0 #f0f;
        }
      }
      
      /* 文本脉冲效果 */
      @keyframes textPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      /* 文本震动效果 */
      @keyframes textShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
        document.head.appendChild(this.styleElement);

        // 创建容器
        this.container = document.createElement('div');
        this.container.className = 'ui-screen-effect-container';
        document.body.appendChild(this.container);

        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'ui-screen-effect-overlay';
        this.container.appendChild(this.overlay);

        // 创建文本元素
        this.textElement = document.createElement('div');
        this.textElement.className = 'ui-screen-effect-text';
        this.container.appendChild(this.textElement);
    }

    /**
     * 显示过渡效果
     * @param fadeInTime 淡入时间（毫秒）
     * @param holdTime 持续时间（毫秒）
     * @param fadeOutTime 淡出时间（毫秒）
     * @param effect 过渡效果类型
     * @param special 特殊效果选项
     * @param onComplete 效果完成时的回调函数
     * @returns Promise 在效果完成时解析
     */
    public static async ShowTransition(
        fadeInTime: number,
        holdTime: number,
        fadeOutTime: number,
        effect: TransitionEffectType = TransitionEffectType.FADE,
        special?: SpecialEffectOptions,
        onComplete?: () => void
    ): Promise<void> {
        this.initialize();

        if (!this.overlay || !this.container || !this.textElement) return;

        const effectId = `transition-${Date.now()}`;
        this.activeEffects.add(effectId);

        // 重置样式
        this.overlay.style.cssText = '';
        this.textElement.style.cssText = '';
        this.textElement.innerHTML = '';

        // 设置基础样式
        this.overlay.style.opacity = '0';
        this.overlay.style.backgroundColor = '#000';

        // 应用效果
        switch (effect) {
            case TransitionEffectType.FADE:
                this.overlay.style.transition = `opacity ${fadeInTime}ms ease-in`;
                this.overlay.style.opacity = '1';
                break;

            case TransitionEffectType.WIPE_LEFT:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'inset(0 100% 0 0)';
                this.overlay.style.animation = `wipeLeftIn ${fadeInTime}ms forwards`;
                break;

            case TransitionEffectType.WIPE_RADIAL:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'circle(0% at center)';
                this.overlay.style.animation = `wipeRadialIn ${fadeInTime}ms forwards`;
                break;

            case TransitionEffectType.PIXELATE:
                this.container.style.filter = 'blur(0px)';
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                this.container.style.animation = `pixelateIn ${fadeInTime}ms forwards`;
                break;

            case TransitionEffectType.GLITCH:
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                this.container.style.animation = `glitchEffect ${fadeInTime}ms forwards`;
                break;
        }

        // 处理特殊效果（文本）
        if (special?.text) {
            const { text, textPosition, textColor, textSize, textAnimation, customCss } = special;

            this.textElement.textContent = text;
            this.textElement.style.opacity = '0';

            // 设置位置
            const x = textPosition?.x ?? 0.5; // 默认在屏幕中央
            const y = textPosition?.y ?? 0.5; // 默认在屏幕中央
            this.textElement.style.left = `${x * 100}%`;
            this.textElement.style.top = `${y * 100}%`;

            // 设置样式
            this.textElement.style.color = textColor || 'white';
            this.textElement.style.fontSize = textSize || '32px';

            // 应用自定义CSS
            if (customCss) {
                this.textElement.style.cssText += customCss;
            }

            // 文本动画
            if (textAnimation) {
                const delay = textAnimation.delay || 0;

                setTimeout(() => {
                    if (!this.textElement) return;

                    switch (textAnimation.type) {
                        case TextAnimationType.FADE_IN:
                            this.textElement.style.animation = `textFadeIn ${textAnimation.duration}ms forwards`;
                            break;

                        case TextAnimationType.TYPE_WRITER:
                            // 打字机效果需要特殊处理
                            this.textElement.textContent = '';
                            this.textElement.style.opacity = '1';

                            const characters = text.split('');
                            const typeDelay = textAnimation.duration / characters.length;

                            characters.forEach((char, index) => {
                                setTimeout(() => {
                                    if (this.textElement) {
                                        this.textElement.textContent += char;
                                    }
                                }, index * typeDelay);
                            });
                            break;

                        case TextAnimationType.GLITCH_TEXT:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textGlitch ${textAnimation.duration}ms infinite`;
                            break;

                        case TextAnimationType.PULSE:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textPulse ${textAnimation.duration}ms infinite`;
                            break;

                        case TextAnimationType.SHAKE_TEXT:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textShake ${textAnimation.duration}ms infinite`;
                            break;
                    }
                }, delay);
            }
        }

        // 等待淡入完成
        await new Promise(resolve => setTimeout(resolve, fadeInTime));

        // 如果效果已被取消，提前返回
        if (!this.activeEffects.has(effectId)) return;

        // 等待持续时间
        await new Promise(resolve => setTimeout(resolve, holdTime));

        // 如果效果已被取消，提前返回
        if (!this.activeEffects.has(effectId)) return;

        // 开始淡出
        switch (effect) {
            case TransitionEffectType.FADE:
                this.overlay.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                this.overlay.style.opacity = '0';
                break;

            case TransitionEffectType.WIPE_LEFT:
                this.overlay.style.animation = `wipeLeftOut ${fadeOutTime}ms forwards`;
                break;

            case TransitionEffectType.WIPE_RADIAL:
                this.overlay.style.animation = `wipeRadialOut ${fadeOutTime}ms forwards`;
                break;

            case TransitionEffectType.PIXELATE:
            case TransitionEffectType.GLITCH:
                this.overlay.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                this.overlay.style.opacity = '0';
                this.container.style.animation = 'none';
                break;
        }

        // 淡出文本
        if (special?.text && this.textElement) {
            this.textElement.style.transition = `opacity ${fadeOutTime}ms ease-out`;
            this.textElement.style.opacity = '0';
        }

        // 等待淡出完成
        await new Promise(resolve => setTimeout(resolve, fadeOutTime));

        // 清除效果
        this.activeEffects.delete(effectId);

        // 调用完成回调
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * 显示受击效果
     * @param duration 持续时间（毫秒）
     * @param effect 效果类型
     * @param onComplete 效果完成时的回调函数
     * @returns Promise 在效果完成时解析
     */
    public static async ShowHitEffect(
        duration: number,
        effect: HitEffectType = HitEffectType.FLASH_RED,
        onComplete?: () => void
    ): Promise<void> {
        this.initialize();

        if (!this.overlay || !this.container) return;

        const effectId = `hit-${Date.now()}`;
        this.activeEffects.add(effectId);

        // 重置样式
        this.overlay.style.cssText = '';

        // 应用效果
        switch (effect) {
            case HitEffectType.FLASH_RED:
                this.overlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
                this.overlay.style.animation = `flashRed ${duration}ms`;
                break;

            case HitEffectType.BLOOD_SPLATTER:
                this.overlay.style.animation = `bloodSplatter ${duration}ms`;
                this.overlay.style.backgroundSize = 'cover';
                this.overlay.style.backgroundRepeat = 'no-repeat';
                break;

            case HitEffectType.SHAKE:
                this.container.style.animation = `screenShake ${duration}ms`;
                break;

            case HitEffectType.GRAYSCALE:
                this.container.style.animation = `grayscaleEffect ${duration}ms`;
                break;

            case HitEffectType.BLUR:
                this.container.style.animation = `blurEffect ${duration}ms`;
                break;
        }

        // 等待效果完成
        await new Promise(resolve => setTimeout(resolve, duration));

        // 清除效果
        this.activeEffects.delete(effectId);

        // 重置样式
        if (!this.activeEffects.size) {
            this.overlay.style.cssText = '';
            this.container.style.cssText = '';
        }

        // 调用完成回调
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * 显示恐怖效果
     * @param duration 持续时间（毫秒）
     * @param effect 效果类型
     * @param onComplete 效果完成时的回调函数
     * @returns Promise 在效果完成时解析
     */
    public static async ShowHorrorEffect(
        duration: number,
        effect: HorrorEffectType = HorrorEffectType.VIGNETTE,
        onComplete?: () => void
    ): Promise<void> {
        this.initialize();

        if (!this.overlay || !this.container) return;

        const effectId = `horror-${Date.now()}`;
        this.activeEffects.add(effectId);

        // 重置样式
        this.overlay.style.cssText = '';

        // 应用效果
        switch (effect) {
            case HorrorEffectType.VIGNETTE:
                this.overlay.style.animation = `vignetteEffect ${duration / 2}ms forwards`;
                break;

            case HorrorEffectType.DISTORTION:
                this.container.style.animation = `distortionEffect ${duration}ms infinite`;
                break;

            case HorrorEffectType.NOISE:
                this.overlay.style.animation = `noiseEffect ${duration}ms infinite`;
                this.overlay.style.backgroundSize = 'cover';
                break;

            case HorrorEffectType.INVERTED:
                this.container.style.animation = `invertedEffect ${duration}ms`;
                break;

            case HorrorEffectType.WHISPER:
                // 随机的低语音效（通过随机位置文本实现视觉效果）
                for (let i = 0; i < 5; i++) {
                    const whisper = document.createElement('div');
                    whisper.className = 'ui-screen-effect-text';
                    whisper.textContent = ['别看', '快跑', '死亡', '恐惧', '黑暗', '它来了'][Math.floor(Math.random() * 6)];
                    whisper.style.opacity = '0.3';
                    whisper.style.color = 'rgba(255, 255, 255, 0.7)';
                    whisper.style.fontSize = '24px';
                    whisper.style.left = `${Math.random() * 90 + 5}%`;
                    whisper.style.top = `${Math.random() * 90 + 5}%`;
                    whisper.style.animation = `textFadeIn ${duration / 3}ms forwards, textFadeIn ${duration / 3}ms reverse forwards ${duration * 2 / 3}ms`;

                    if (this.container) {
                        this.container.appendChild(whisper);

                        // 删除元素
                        setTimeout(() => {
                            if (whisper.parentNode) {
                                whisper.parentNode.removeChild(whisper);
                            }
                        }, duration);
                    }
                }
                break;
        }

        // 等待效果完成
        await new Promise(resolve => setTimeout(resolve, duration));

        // 清除效果
        this.activeEffects.delete(effectId);

        // 重置样式
        if (!this.activeEffects.size) {
            this.overlay.style.cssText = '';
            this.container.style.cssText = '';
        }

        // 调用完成回调
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * 清除所有活动效果
     */
    public static ClearAllEffects(): void {
        if (!this.container || !this.overlay || !this.textElement) return;

        this.activeEffects.clear();
        this.overlay.style.cssText = '';
        this.container.style.cssText = '';
        this.textElement.style.cssText = '';
        this.textElement.innerHTML = '';

        // 删除所有额外添加的文本元素
        Array.from(this.container.children).forEach(child => {
            if (child !== this.overlay && child !== this.textElement) {
                this.container?.removeChild(child);
            }
        });
    }

    /**
     * 仅淡入效果（从黑屏慢慢过渡到显示整个场景）
     * @param fadeInTime 淡入时间（毫秒）
     * @param effect 过渡效果类型
     * @param special 特殊效果选项
     * @param onComplete 效果完成时的回调函数
     * @returns Promise 在效果完成时解析
     */
    public static async FadeIn(
        fadeInTime: number,
        effect: TransitionEffectType = TransitionEffectType.FADE,
        special?: SpecialEffectOptions,
        onComplete?: () => void
    ): Promise<void> {
        this.initialize();

        if (!this.overlay || !this.container || !this.textElement) return;

        const effectId = `fadein-${Date.now()}`;
        this.activeEffects.add(effectId);

        // 重置样式
        this.overlay.style.cssText = '';
        this.textElement.style.cssText = '';
        this.textElement.innerHTML = '';

        // 设置基础样式 - 初始状态为黑色不透明
        this.overlay.style.opacity = '1';
        this.overlay.style.backgroundColor = '#000';
        
        // 强制重绘，确保样式生效
        this.overlay.offsetHeight;

        // 应用效果
        switch (effect) {
            case TransitionEffectType.FADE:
                this.overlay.style.transition = `opacity ${fadeInTime}ms ease-out`;
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.opacity = '0';
                break;

            case TransitionEffectType.WIPE_LEFT:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'inset(0 0 0 0)';
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.animation = `wipeLeftOut ${fadeInTime}ms forwards`;
                break;

            case TransitionEffectType.WIPE_RADIAL:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'circle(150% at center)';
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.animation = `wipeRadialOut ${fadeInTime}ms forwards`;
                break;

            case TransitionEffectType.PIXELATE:
                this.container.style.filter = 'blur(10px)';
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                // 强制重绘
                this.overlay.offsetHeight;
                this.container.style.animation = `pixelateIn ${fadeInTime}ms reverse forwards`;
                break;

            case TransitionEffectType.GLITCH:
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                // 强制重绘
                this.overlay.offsetHeight;
                this.container.style.animation = `glitchEffect ${fadeInTime}ms forwards`;
                break;
        }

        // 处理特殊效果（文本）
        if (special?.text) {
            const { text, textPosition, textColor, textSize, textAnimation, customCss } = special;

            this.textElement.textContent = text;
            this.textElement.style.opacity = '0';

            // 设置位置
            const x = textPosition?.x ?? 0.5; // 默认在屏幕中央
            const y = textPosition?.y ?? 0.5; // 默认在屏幕中央
            this.textElement.style.left = `${x * 100}%`;
            this.textElement.style.top = `${y * 100}%`;

            // 设置样式
            this.textElement.style.color = textColor || 'white';
            this.textElement.style.fontSize = textSize || '32px';

            // 应用自定义CSS
            if (customCss) {
                this.textElement.style.cssText += customCss;
            }

            // 文本动画
            if (textAnimation) {
                const delay = textAnimation.delay || 0;

                setTimeout(() => {
                    if (!this.textElement) return;

                    switch (textAnimation.type) {
                        case TextAnimationType.FADE_IN:
                            this.textElement.style.animation = `textFadeIn ${textAnimation.duration}ms forwards`;
                            break;

                        case TextAnimationType.TYPE_WRITER:
                            // 打字机效果需要特殊处理
                            this.textElement.textContent = '';
                            this.textElement.style.opacity = '1';

                            const characters = text.split('');
                            const typeDelay = textAnimation.duration / characters.length;

                            characters.forEach((char, index) => {
                                setTimeout(() => {
                                    if (this.textElement) {
                                        this.textElement.textContent += char;
                                    }
                                }, index * typeDelay);
                            });
                            break;

                        case TextAnimationType.GLITCH_TEXT:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textGlitch ${textAnimation.duration}ms infinite`;
                            break;

                        case TextAnimationType.PULSE:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textPulse ${textAnimation.duration}ms infinite`;
                            break;

                        case TextAnimationType.SHAKE_TEXT:
                            this.textElement.style.opacity = '1';
                            this.textElement.style.animation = `textShake ${textAnimation.duration}ms infinite`;
                            break;
                    }
                }, delay);
            }
        }

        // 等待淡入完成
        await new Promise(resolve => setTimeout(resolve, fadeInTime));

        // 如果效果已被取消，提前返回
        if (!this.activeEffects.has(effectId)) return;

        // 完成淡入后，保持当前效果状态
        this.activeEffects.delete(effectId);

        // 调用完成回调
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * 仅淡出效果
     * @param fadeOutTime 淡出时间（毫秒）
     * @param effect 过渡效果类型
     * @param onComplete 效果完成时的回调函数
     * @returns Promise 在效果完成时解析
     */
    public static async FadeOut(
        fadeOutTime: number,
        effect: TransitionEffectType = TransitionEffectType.FADE,
        onComplete?: () => void
    ): Promise<void> {
        this.initialize();

        if (!this.overlay || !this.container || !this.textElement) return;

        const effectId = `fadeout-${Date.now()}`;
        this.activeEffects.add(effectId);

        // 重置样式并确保遮罩层可见
        this.overlay.style.cssText = '';
        this.overlay.style.opacity = '1';
        this.overlay.style.backgroundColor = '#000';

        // 开始淡出
        switch (effect) {
            case TransitionEffectType.FADE:
                this.overlay.style.transition = `opacity ${fadeOutTime}ms ease-in`;
                this.overlay.style.opacity = '1';
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.opacity = '0';
                break;

            case TransitionEffectType.WIPE_LEFT:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'inset(0 0 0 0)';
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.animation = `wipeLeftIn ${fadeOutTime}ms forwards`;
                break;

            case TransitionEffectType.WIPE_RADIAL:
                this.overlay.style.opacity = '1';
                this.overlay.style.clipPath = 'circle(0% at center)';
                // 强制重绘
                this.overlay.offsetHeight;
                this.overlay.style.animation = `wipeRadialIn ${fadeOutTime}ms forwards`;
                break;

            case TransitionEffectType.PIXELATE:
                this.container.style.filter = 'blur(0px)';
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                // 强制重绘
                this.overlay.offsetHeight;
                this.container.style.animation = `pixelateIn ${fadeOutTime}ms forwards`;
                break;

            case TransitionEffectType.GLITCH:
                this.overlay.style.opacity = '1';
                this.overlay.style.backgroundColor = '#000';
                // 强制重绘
                this.overlay.offsetHeight;
                this.container.style.animation = `glitchEffect ${fadeOutTime}ms forwards`;
                break;
        }

        // 淡出文本
        if (this.textElement) {
            this.textElement.style.transition = `opacity ${fadeOutTime}ms ease-in`;
            this.textElement.style.opacity = '0';
        }

        // 等待淡出完成
        await new Promise(resolve => setTimeout(resolve, fadeOutTime));

        // 清除效果
        this.activeEffects.delete(effectId);

        // 重置文本元素
        this.textElement.style.cssText = '';
        this.textElement.innerHTML = '';

        // 调用完成回调
        if (onComplete) {
            onComplete();
        }
    }
}

// 初始化代码
Unreal__.GameBegin(() => {
    // 初始化屏幕效果系统
    // 系统会在第一次调用效果时自动初始化，所以这里不需要额外操作
    //UIScreenEffect.ShowTransition(500, 500, 1000, TransitionEffectType.WIPE_LEFT);
    //   UIScreenEffect.FadeOut(2000,TransitionEffectType.WIPE_RADIAL,()=>{
    //     alert("完成")
    //   })
});

// 导出枚举类型以便外部使用
export {
    TransitionEffectType,
    HitEffectType,
    HorrorEffectType,
    TextAnimationType
};

export type {
    SpecialEffectOptions
};

