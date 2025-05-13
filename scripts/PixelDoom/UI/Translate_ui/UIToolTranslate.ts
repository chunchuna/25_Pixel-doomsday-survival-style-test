//@ts-nocheck
import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("开始初始化翻译工具");
    // 直接调用创建按钮的函数
    createTranslateUI();
})

// real-time-translator.ts

/**
 * 实时翻译与标记工具
 * 持续监控DOM变化，自动处理新添加的文本
 */

// 可用的语言列表
const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
];

// 存储原始文本，以便可以切换回来
const originalTextContent = new WeakMap<Node, string>();
const originalAttributeContent = new WeakMap<Element, Record<string, string>>();

// 当前语言
let currentLanguage = 'en';

// 当前工作模式
type WorkMode = 'mark' | 'translate' | 'off';
let currentMode: WorkMode = 'mark';

// 实时监控的MutationObserver
let domObserver: MutationObserver | null = null;

// 翻译API配置
const LIBRE_TRANSLATE_API = 'https://libretranslate.com/translate';
const LINGVA_TRANSLATE_API = 'https://lingva.ml/api/v1';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// 可修改的API URL
let libreTranslateApiUrl = LIBRE_TRANSLATE_API;
let lingvaApiUrl = LINGVA_TRANSLATE_API;
let myMemoryApiUrl = MYMEMORY_API;

// 缓存已翻译的文本，避免重复翻译
const translationCache: Record<string, Record<string, string>> = {};

// 应该跳过翻译的元素选择器
const SKIP_ELEMENTS = [
    'script', 'style', 'iframe', 'code', 'pre',
    '[data-no-translate]', // 自定义属性，用于标记不需要翻译的元素
    '#translation-controls', // 跳过我们自己的UI元素
    '#translation-loader'
];

/**
 * 检查元素是否应该被跳过翻译
 */
function shouldSkipElement(element: Element): boolean {
    return SKIP_ELEMENTS.some(selector => {
        if (selector.startsWith('[') && selector.endsWith(']')) {
            // 检查属性选择器
            const attrName = selector.slice(1, -1);
            return element.hasAttribute(attrName);
        } else if (selector.startsWith('#')) {
            // 检查ID选择器
            const id = selector.slice(1);
            return element.id === id;
        }
        // 检查标签名
        return element.tagName.toLowerCase() === selector;
    });
}

/**
 * 使用LibreTranslate API翻译文本
 */
async function translateTextWithLibre(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        const response = await fetch(libreTranslateApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: 'zh-CN',
                target: targetLang
            })
        });

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.translatedText || text;
    } catch (error) {
        console.error('LibreTranslate API error:', error);
        return text; // 出错时返回原文
    }
}

/**
 * 使用Lingva API翻译文本 (备选方案1)
 */
async function translateTextWithLingva(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        const response = await fetch(`${lingvaApiUrl}/auto/${targetLang}/${encodeURIComponent(text)}`);

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.translation || text;
    } catch (error) {
        console.error('Lingva API error:', error);
        return text;
    }
}

/**
 * 使用MyMemory API翻译文本 (备选方案2)
 */
async function translateTextWithMyMemory(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        const url = `${myMemoryApiUrl}?q=${encodeURIComponent(text)}&langpair=zh-CN|${targetLang}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.responseData.translatedText || text;
    } catch (error) {
        console.error('MyMemory API error:', error);
        return text;
    }
}

/**
 * 尝试使用多个翻译API，直到一个成功
 */
async function translateText(text: string, targetLang: string): Promise<string> {
    // 尝试第一个API
    try {
        return await translateTextWithLibre(text, targetLang);
    } catch (error) {
        console.warn('Primary translation API failed, trying backup 1:', error);

        // 尝试第二个API
        try {
            return await translateTextWithLingva(text, targetLang);
        } catch (error) {
            console.warn('Backup translation API 1 failed, trying backup 2:', error);

            // 尝试第三个API
            try {
                return await translateTextWithMyMemory(text, targetLang);
            } catch (error) {
                console.error('All translation APIs failed:', error);
                return text; // 所有API都失败时返回原文
            }
        }
    }
}

/**
 * 从缓存获取翻译，如果没有则调用API
 */
async function getCachedTranslation(text: string, targetLang: string): Promise<string> {
    // 如果文本为空或目标语言是英语，直接返回原文
    if (!text || text.trim() === '' || targetLang === 'en') {
        return text;
    }

    // 创建语言缓存对象（如果不存在）
    if (!translationCache[targetLang]) {
        translationCache[targetLang] = {};
    }

    // 检查内存缓存中是否已有此翻译
    if (translationCache[targetLang][text]) {
        return translationCache[targetLang][text];
    }

    // 检查localStorage缓存
    const cachedTranslation = getTranslationFromCache(text, targetLang);
    if (cachedTranslation) {
        // 更新内存缓存
        translationCache[targetLang][text] = cachedTranslation;
        return cachedTranslation;
    }

    // 翻译并缓存结果
    const translated = await translateText(text, targetLang);

    // 更新内存缓存
    translationCache[targetLang][text] = translated;

    // 更新localStorage缓存
    saveTranslationToCache(text, targetLang, translated);

    return translated;
}

/**
 * 将翻译结果保存到localStorage缓存
 */
function saveTranslationToCache(text: string, lang: string, translation: string): void {
    try {
        // 创建唯一的缓存键
        const cacheKey = `translation_${lang}_${hashCode(text.substring(0, 100))}`;
        localStorage.setItem(cacheKey, translation);
    } catch (e) {
        console.warn('Failed to cache translation:', e);
    }
}

/**
 * 从localStorage缓存获取翻译
 */
function getTranslationFromCache(text: string, lang: string): string | null {
    try {
        const cacheKey = `translation_${lang}_${hashCode(text.substring(0, 100))}`;
        return localStorage.getItem(cacheKey);
    } catch (e) {
        console.warn('Failed to retrieve cached translation:', e);
        return null;
    }
}

/**
 * 简单的字符串哈希函数
 */
function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

/**
 * 标记文本节点为已识别(调试模式)
 */
function markTextNode(node: Node): void {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return;

    const text = node.textContent.trim();
    if (!text) return; // 跳过空文本

    // 保存原始文本（如果尚未保存）
    if (!originalTextContent.has(node)) {
        originalTextContent.set(node, node.textContent);
    }

    // 将文本替换为❤符号
    node.textContent = '❤' + node.textContent.length;
}

/**
 * 翻译文本节点
 */
async function translateTextNode(node: Node, targetLang: string): Promise<void> {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return;

    const text = node.textContent.trim();
    if (!text) return; // 跳过空文本

    // 保存原始文本（如果尚未保存）
    if (!originalTextContent.has(node)) {
        originalTextContent.set(node, node.textContent);
    }

    // 获取原始文本
    const originalText = originalTextContent.get(node) || node.textContent;

    // 如果目标语言是英语，则恢复原始文本
    if (targetLang === 'en') {
        node.textContent = originalText;
        return;
    }

    // 翻译文本
    const translatedText = await getCachedTranslation(originalText, targetLang);
    node.textContent = translatedText;
}

/**
 * 标记元素属性为已识别(调试模式)
 */
function markElementAttributes(element: Element): void {
    const attributesToTranslate = ['placeholder', 'title', 'alt'];

    // 保存原始属性值（如果尚未保存）
    if (!originalAttributeContent.has(element)) {
        const originalAttrs: Record<string, string> = {};

        for (const attr of attributesToTranslate) {
            if (element.hasAttribute(attr)) {
                originalAttrs[attr] = element.getAttribute(attr) || '';
            }
        }

        if (Object.keys(originalAttrs).length > 0) {
            originalAttributeContent.set(element, originalAttrs);
        }
    }

    // 获取原始属性值
    const originalAttrs = originalAttributeContent.get(element) || {};

    for (const attr of attributesToTranslate) {
        if (originalAttrs[attr]) {
            element.setAttribute(attr, '❤' + originalAttrs[attr].length);
        }
    }
}

/**
 * 翻译元素的属性
 */
async function translateElementAttributes(element: Element, targetLang: string): Promise<void> {
    const attributesToTranslate = ['placeholder', 'title', 'alt'];

    // 保存原始属性值（如果尚未保存）
    if (!originalAttributeContent.has(element)) {
        const originalAttrs: Record<string, string> = {};

        for (const attr of attributesToTranslate) {
            if (element.hasAttribute(attr)) {
                originalAttrs[attr] = element.getAttribute(attr) || '';
            }
        }

        if (Object.keys(originalAttrs).length > 0) {
            originalAttributeContent.set(element, originalAttrs);
        }
    }

    // 获取原始属性值
    const originalAttrs = originalAttributeContent.get(element) || {};

    for (const attr of attributesToTranslate) {
        if (originalAttrs[attr]) {
            // 如果目标语言是英语，则恢复原始值
            if (targetLang === 'en') {
                element.setAttribute(attr, originalAttrs[attr]);
                continue;
            }

            // 翻译属性值
            const translatedValue = await getCachedTranslation(originalAttrs[attr], targetLang);
            element.setAttribute(attr, translatedValue);
        }
    }
}

/**
 * 递归处理DOM树的元素（标记或翻译）
 */
async function processElement(element: Element, mode: WorkMode, targetLang: string = 'en'): Promise<void> {
    // 检查是否应该跳过此元素
    if (shouldSkipElement(element)) {
        return;
    }

    // 根据当前模式处理元素
    switch (mode) {
        case 'mark':
            markElementAttributes(element);
            break;
        case 'translate':
            await translateElementAttributes(element, targetLang);
            break;
        case 'off':
            // 不处理
            return;
    }

    // 处理子节点
    for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
            switch (mode) {
                case 'mark':
                    markTextNode(node);
                    break;
                case 'translate':
                    await translateTextNode(node, targetLang);
                    break;
                case 'off':
                    // 不处理
                    break;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            await processElement(node as Element, mode, targetLang);
        }
    }
}

/**
 * 恢复原始文本内容
 */
function restoreOriginalContent(): void {
    // 恢复文本节点
    originalTextContent.forEach((originalText, node) => {
        if (node.textContent) {
            node.textContent = originalText;
        }
    });

    // 恢复属性
    originalAttributeContent.forEach((originalAttrs, element) => {
        for (const [attr, value] of Object.entries(originalAttrs)) {
            element.setAttribute(attr, value);
        }
    });
}

/**
 * 处理整个页面
 */
async function processPage(mode: WorkMode, targetLang: string = 'en'): Promise<void> {
    currentMode = mode;
    currentLanguage = targetLang;

    // 显示处理中的加载指示器
    let message = '';
    switch (mode) {
        case 'mark':
            message = '正在标记文本...';
            break;
        case 'translate':
            message = `正在翻译为${targetLang}...`;
            break;
        case 'off':
            message = '正在恢复原始文本...';
            break;
    }

    showLoader(true, message);

    try {
        if (mode === 'off') {
            restoreOriginalContent();
        } else {
            await processElement(document.body, mode, targetLang);
        }

        console.log(`Page processed in mode: ${mode}`);
    } catch (error) {
        console.error('Error processing page:', error);
    } finally {
        if (mode !== 'mark' && mode !== 'translate') {
            // 只有在非活动模式时隐藏加载指示器
            showLoader(false);
        } else {
            // 更新加载指示器为"实时模式"
            showLoader(true, mode === 'mark' ? 'you chose' : `you chose (${targetLang})`);
        }
    }
}

/**
 * 显示/隐藏加载指示器
 */
function showLoader(show: boolean, message: string = '处理中...'): void {
    let loader = document.getElementById('translation-loader');

    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'translation-loader';
            loader.style.position = 'fixed';
            loader.style.top = "3%";
            loader.style.right = "2%";
            loader.style.transform = 'translateX(-50%)';
            loader.style.padding = '6px 12px';
            loader.style.backgroundColor = 'rgba(30,30,30,0.85)';
            loader.style.color = '#fff';
            loader.style.borderRadius = '4px';
            loader.style.zIndex = '9999';
            loader.style.fontSize = '10px';
            loader.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            document.body.appendChild(loader);
        }
        loader.innerHTML = message;
        loader.style.display = 'block';
        
        // 添加自动隐藏功能 - 5秒后自动隐藏
        setTimeout(() => {
            if (loader) {
                loader.style.display = 'none';
            }
        }, 5000);
    } else if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * 监听DOM变化，自动处理新添加的内容
 */
function startObservingDOM(): void {
    // 如果已经有观察器，先停止它
    stopObservingDOM();

    // 只有在标记或翻译模式下才观察DOM
    if (currentMode === 'off') return;

    domObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            // 忽略我们自己添加的元素导致的变化
            if (mutation.target.id === 'translation-loader' ||
                mutation.target.id === 'translation-controls') {
                continue;
            }

            if (mutation.type === 'childList') {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 异步处理，避免阻塞主线程
                        setTimeout(() => {
                            processElement(node as Element, currentMode, currentLanguage);
                        }, 0);
                    }
                }
            } else if (mutation.type === 'characterData') {
                // 文本内容变化
                const node = mutation.target;
                if (node.nodeType === Node.TEXT_NODE) {
                    // 异步处理，避免阻塞主线程
                    setTimeout(() => {
                        if (currentMode === 'mark') {
                            markTextNode(node);
                        } else if (currentMode === 'translate') {
                            translateTextNode(node, currentLanguage);
                        }
                    }, 0);
                }
            }
        }
    });

    domObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    console.log(`Started observing DOM changes in mode: ${currentMode}`);
}

/**
 * 停止观察DOM变化
 */
function stopObservingDOM(): void {
    if (domObserver) {
        domObserver.disconnect();
        domObserver = null;
        console.log('Stopped observing DOM changes');
    }
}

/**
 * 创建翻译UI界面
 */
function createTranslateUI() {
    console.log("创建翻译UI界面...");
    
    try {
        // 创建主容器
        const container = document.createElement('div');
        container.id = 'translation-ui-container';
        container.style.position = 'fixed';
        container.style.top = '15px';
        container.style.right = '15px';
        container.style.zIndex = '999999';
        container.style.transition = 'all 0.3s ease';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // 创建国旗按钮
        const flagButton = document.createElement('div');
        flagButton.id = 'translation-flag-button';
        flagButton.style.width = '36px';
        flagButton.style.height = '36px';
        flagButton.style.borderRadius = '6px';
        flagButton.style.cursor = 'pointer';
        flagButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        flagButton.style.transition = 'transform 0.2s ease';
        flagButton.style.overflow = 'hidden';
        flagButton.title = '翻译工具';
        
        // 设置初始国旗样式
        updateFlagButton(flagButton, 'en');
        
        // 添加鼠标悬停效果
        flagButton.addEventListener('mouseover', () => {
            flagButton.style.transform = 'scale(1.05)';
        });
        
        flagButton.addEventListener('mouseout', () => {
            flagButton.style.transform = 'scale(1)';
        });
        
        // 创建面板容器
        const panel = document.createElement('div');
        panel.id = 'translation-panel';
        panel.style.position = 'absolute';
        panel.style.top = '42px'; // 按钮下方
        panel.style.right = '0';
        panel.style.width = '180px';
        panel.style.backgroundColor = 'rgba(40, 40, 40, 0.85)';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.35)';
        panel.style.padding = '12px';
        panel.style.display = 'none'; // 默认隐藏
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-10px)';
        panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // 添加面板标题
        const title = document.createElement('div');
        title.textContent = 'Language Selection (beta)';
        title.style.color = '#ccc';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        title.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        title.style.paddingBottom = '8px';
        panel.appendChild(title);
        
        // 添加语言选择
        const langLabel = document.createElement('div');
        langLabel.textContent = 'Language:';
        langLabel.style.color = '#bbb';
        langLabel.style.fontSize = '12px';
        langLabel.style.marginBottom = '5px';
        panel.appendChild(langLabel);
        
        const langSelect = document.createElement('select');
        langSelect.id = 'lang-select';
        langSelect.style.width = '100%';
        langSelect.style.padding = '6px';
        langSelect.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
        langSelect.style.color = '#fff';
        langSelect.style.border = '1px solid rgba(100, 100, 100, 0.5)';
        langSelect.style.borderRadius = '4px';
        langSelect.style.marginBottom = '10px';
        langSelect.style.fontSize = '12px';
        
        // 添加语言选项
        AVAILABLE_LANGUAGES.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.text = lang.name;
            if (lang.code === currentLanguage) {
                option.selected = true;
            }
            langSelect.appendChild(option);
        });
        
        // 当语言改变时更新国旗
        langSelect.addEventListener('change', () => {
            updateFlagButton(flagButton, langSelect.value);
        });
        
        panel.appendChild(langSelect);
        
        // 创建按钮组
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '8px';
        buttonsContainer.style.marginBottom = '8px';
        
        // 开始翻译按钮
        const translateButton = document.createElement('button');
        translateButton.textContent = 'Translate For Game (beta)';
        translateButton.style.flex = '1';
        translateButton.style.padding = '7px 0';
        translateButton.style.backgroundColor = 'rgba(80, 80, 80, 0.8)';
        translateButton.style.color = '#fff';
        translateButton.style.border = 'none';
        translateButton.style.borderRadius = '4px';
        translateButton.style.cursor = 'pointer';
        translateButton.style.fontSize = '12px';
        translateButton.style.fontWeight = 'bold';
        translateButton.addEventListener('click', () => {
            const selectedLang = langSelect.value;
            currentLanguage = selectedLang;
            
            // 更新国旗显示
            updateFlagButton(flagButton, selectedLang);
            
            // 开始翻译
            startTranslation(selectedLang);
            
            // 收起面板
            togglePanel(false);
        });
        buttonsContainer.appendChild(translateButton);
        
        // 关闭翻译按钮
        const turnOffButton = document.createElement('button');
        turnOffButton.textContent = 'Stop';
        turnOffButton.style.flex = '1';
        turnOffButton.style.padding = '7px 0';
        turnOffButton.style.backgroundColor = 'rgba(130, 40, 40, 0.8)';
        turnOffButton.style.color = '#fff';
        turnOffButton.style.border = 'none';
        turnOffButton.style.borderRadius = '4px';
        turnOffButton.style.cursor = 'pointer';
        turnOffButton.style.fontSize = '12px';
        turnOffButton.addEventListener('click', () => {
            // 停止翻译
            stopTranslation();
            
            // 重置国旗为英文
            updateFlagButton(flagButton, 'en');
            
            // 收起面板
            togglePanel(false);
        });
        buttonsContainer.appendChild(turnOffButton);
        
        panel.appendChild(buttonsContainer);
        
        // 添加API设置按钮
        const apiSettingsButton = document.createElement('button');
        apiSettingsButton.textContent = 'API设置';
        apiSettingsButton.style.width = '100%';
        apiSettingsButton.style.padding = '5px 0';
        apiSettingsButton.style.backgroundColor = 'rgba(60, 80, 100, 0.6)';
        apiSettingsButton.style.color = '#bbb';
        apiSettingsButton.style.border = 'none';
        apiSettingsButton.style.borderRadius = '4px';
        apiSettingsButton.style.cursor = 'pointer';
        apiSettingsButton.style.fontSize = '11px';
        apiSettingsButton.style.display="none";
        apiSettingsButton.addEventListener('click', () => {
            showApiSettingsModal();
        });
        panel.appendChild(apiSettingsButton);
        
        // 添加版本信息
        const versionInfo = document.createElement('div');
        versionInfo.textContent = 'v1.0';
        versionInfo.style.color = 'rgba(150, 150, 150, 0.6)';
        versionInfo.style.fontSize = '10px';
        versionInfo.style.textAlign = 'right';
        versionInfo.style.marginTop = '8px';
        panel.appendChild(versionInfo);
        
        // 添加面板到容器
        container.appendChild(panel);
        
        // 添加国旗按钮到容器
        container.appendChild(flagButton);
        
        // 切换面板显示状态
        let isPanelVisible = false;
        
        flagButton.addEventListener('click', () => {
            isPanelVisible = !isPanelVisible;
            togglePanel(isPanelVisible);
        });
        
        function togglePanel(show) {
            if (show) {
                panel.style.display = 'block';
                setTimeout(() => {
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                }, 10);
            } else {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    panel.style.display = 'none';
                }, 300);
            }
        }
        
        // 添加到文档
        if (document.body) {
            document.body.appendChild(container);
            console.log("翻译UI已添加到页面");
        } else {
            window.addEventListener('load', function() {
                document.body.appendChild(container);
                console.log("延迟加载：翻译UI已添加到页面");
            });
        }
        
        // 点击外部区域关闭面板
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (isPanelVisible && 
                target !== flagButton && 
                target !== panel &&
                !panel.contains(target)) {
                isPanelVisible = false;
                togglePanel(false);
            }
        });
    } catch (error) {
        console.error("创建翻译UI失败:", error);
    }
}

/**
 * 更新国旗按钮的样式
 */
function updateFlagButton(button, langCode) {
    // 清空按钮内容
    button.innerHTML = '';
    
    // 设置适合的背景和样式
    switch(langCode) {
        case 'en': // 英国国旗
            button.style.background = `
                linear-gradient(rgba(0, 36, 125, 0.8), rgba(0, 36, 125, 0.8)),
                linear-gradient(to bottom right, transparent calc(50% - 1px), rgba(207, 20, 43, 0.8) 50%, transparent calc(50% + 1px))
            `;
            addFlagOverlay(button, `
                <div style="position:absolute; width:100%; height:20%; top:40%; background:rgba(255,255,255,0.8);"></div>
                <div style="position:absolute; width:20%; height:100%; left:40%; background:rgba(255,255,255,0.8);"></div>
            `);
            break;
        case 'zh-CN': // 中国国旗
            button.style.background = 'rgba(222, 41, 16, 0.8)';
            addFlagOverlay(button, `
                <div style="position:absolute; top:6px; left:6px; color:rgba(255,222,0,0.9); font-size:6px;">★</div>
                <div style="position:absolute; top:7px; left:12px; color:rgba(255,222,0,0.9); font-size:4px;">★</div>
                <div style="position:absolute; top:11px; left:14px; color:rgba(255,222,0,0.9); font-size:4px;">★</div>
                <div style="position:absolute; top:15px; left:12px; color:rgba(255,222,0,0.9); font-size:4px;">★</div>
                <div style="position:absolute; top:17px; left:6px; color:rgba(255,222,0,0.9); font-size:4px;">★</div>
            `);
            break;
        case 'es': // 西班牙国旗
            button.style.background = 'linear-gradient(to bottom, rgba(170, 21, 27, 0.8) 25%, rgba(241, 191, 0, 0.8) 25%, rgba(241, 191, 0, 0.8) 75%, rgba(170, 21, 27, 0.8) 75%)';
            break;
        case 'fr': // 法国国旗
            button.style.background = 'linear-gradient(to right, rgba(0, 35, 149, 0.8) 33.3%, rgba(255, 255, 255, 0.8) 33.3%, rgba(255, 255, 255, 0.8) 66.6%, rgba(237, 41, 57, 0.8) 66.6%)';
            break;
        case 'de': // 德国国旗
            button.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 33.3%, rgba(221, 0, 0, 0.8) 33.3%, rgba(221, 0, 0, 0.8) 66.6%, rgba(255, 206, 0, 0.8) 66.6%)';
            break;
        case 'ja': // 日本国旗
            button.style.background = 'rgba(255, 255, 255, 0.8)';
            addFlagOverlay(button, `<div style="position:absolute; width:40%; height:40%; top:30%; left:30%; background:rgba(188, 0, 45, 0.8); border-radius:50%;"></div>`);
            break;
        case 'ko': // 韩国国旗
            button.style.background = 'rgba(255, 255, 255, 0.8)';
            addFlagOverlay(button, `
                <div style="position:absolute; width:38%; height:38%; top:31%; left:31%; background:linear-gradient(to right, rgba(205, 46, 58, 0.8) 50%, rgba(0, 71, 160, 0.8) 50%); border-radius:50%;"></div>
            `);
            break;
        default:
            button.style.background = 'rgba(0, 36, 125, 0.8)';
            button.innerText = langCode.toUpperCase().substring(0, 2);
            button.style.color = 'white';
            button.style.fontWeight = 'bold';
            button.style.display = 'flex';
            button.style.justifyContent = 'center';
            button.style.alignItems = 'center';
            button.style.fontSize = '14px';
    }
}

/**
 * 添加国旗的HTML覆盖层
 */
function addFlagOverlay(button, html) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.innerHTML = html;
    button.appendChild(overlay);
}

/**
 * 开始翻译
 */
function startTranslation(lang) {
    console.log(`开始翻译为: ${lang}`);
    currentLanguage = lang;
    currentMode = 'translate';
    
    // 先加载缓存的API设置
    loadApiSettings();
    
    // 显示加载指示器
    showLoader(true, `translate${lang}...`);
    
    try {
        // 处理页面内容
        processPage('translate', lang);
        
        // 启动DOM监控
        startObservingDOM();
        
        console.log("翻译已启动");
    } catch (error) {
        console.error("翻译启动失败:", error);
        showLoader(true, `翻译失败: ${error.message}`);
        setTimeout(() => {
            showLoader(false);
        }, 3000);
    }
}

/**
 * 停止翻译
 */
function stopTranslation() {
    console.log("停止翻译");
    currentMode = 'off';
    
    // 显示加载指示器
    showLoader(true, "正在恢复原始文本...");
    
    try {
        // 恢复原始内容
        processPage('off');
        
        // 停止DOM监控
        stopObservingDOM();
        
        // 隐藏加载指示器
        setTimeout(() => {
            showLoader(false);
        }, 300);
        
        console.log("翻译已停止");
    } catch (error) {
        console.error("停止翻译失败:", error);
        showLoader(true, `停止失败: ${error.message}`);
        setTimeout(() => {
            showLoader(false);
        }, 3000);
    }
}

/**
 * 从本地存储加载API设置
 */
function loadApiSettings(): void {
    try {
        const savedLibreUrl = localStorage.getItem('libreTranslateApiUrl');
        const savedLingvaUrl = localStorage.getItem('lingvaApiUrl');
        const savedMyMemoryUrl = localStorage.getItem('myMemoryApiUrl');

        if (savedLibreUrl) {
            libreTranslateApiUrl = savedLibreUrl;
        }

        if (savedLingvaUrl) {
            lingvaApiUrl = savedLingvaUrl;
        }

        if (savedMyMemoryUrl) {
            myMemoryApiUrl = savedMyMemoryUrl;
        }

        console.log('已从本地存储加载API设置');
    } catch (error) {
        console.error('加载API设置失败:', error);
    }
}

/**
 * 显示API设置模态框
 */
function showApiSettingsModal(): void {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'rgba(30,30,30,0.95)';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    modalContent.style.color = '#ddd';

    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '翻译API设置';
    title.style.margin = '0 0 20px 0';
    title.style.color = '#fff';
    title.style.fontSize = '16px';
    modalContent.appendChild(title);

    // 创建表单
    const form = document.createElement('form');
    form.onsubmit = (e) => {
        e.preventDefault();
        // 保存设置
        libreTranslateApiUrl = (document.getElementById('libre-api-url') as HTMLInputElement).value;
        lingvaApiUrl = (document.getElementById('lingva-api-url') as HTMLInputElement).value;
        myMemoryApiUrl = (document.getElementById('mymemory-api-url') as HTMLInputElement).value;
        
        // 保存到本地存储
        try {
            localStorage.setItem('libreTranslateApiUrl', libreTranslateApiUrl);
            localStorage.setItem('lingvaApiUrl', lingvaApiUrl);
            localStorage.setItem('myMemoryApiUrl', myMemoryApiUrl);
            alert('API设置已保存');
        } catch (error) {
            console.error('保存API设置失败:', error);
            alert('保存失败: ' + (error instanceof Error ? error.message : String(error)));
        }
        
        // 关闭模态框
        document.body.removeChild(modal);
    };

    // 添加LibreTranslate API输入框
    const libreLabel = document.createElement('div');
    libreLabel.innerHTML = `<strong>LibreTranslate API URL</strong><div style="font-size: 12px; color: #999; margin-bottom: 5px;">主翻译API</div>`;
    form.appendChild(libreLabel);
    
    const libreInput = document.createElement('input');
    libreInput.type = 'text';
    libreInput.id = 'libre-api-url';
    libreInput.value = libreTranslateApiUrl;
    libreInput.style.width = '100%';
    libreInput.style.padding = '8px';
    libreInput.style.marginBottom = '15px';
    libreInput.style.boxSizing = 'border-box';
    libreInput.style.border = '1px solid #444';
    libreInput.style.borderRadius = '4px';
    libreInput.style.backgroundColor = 'rgba(50,50,50,0.8)';
    libreInput.style.color = '#fff';
    form.appendChild(libreInput);

    // 添加Lingva API输入框
    const lingvaLabel = document.createElement('div');
    lingvaLabel.innerHTML = `<strong>Lingva API URL</strong><div style="font-size: 12px; color: #999; margin-bottom: 5px;">备选API 1</div>`;
    form.appendChild(lingvaLabel);
    
    const lingvaInput = document.createElement('input');
    lingvaInput.type = 'text';
    lingvaInput.id = 'lingva-api-url';
    lingvaInput.value = lingvaApiUrl;
    lingvaInput.style.width = '100%';
    lingvaInput.style.padding = '8px';
    lingvaInput.style.marginBottom = '15px';
    lingvaInput.style.boxSizing = 'border-box';
    lingvaInput.style.border = '1px solid #444';
    lingvaInput.style.borderRadius = '4px';
    lingvaInput.style.backgroundColor = 'rgba(50,50,50,0.8)';
    lingvaInput.style.color = '#fff';
    form.appendChild(lingvaInput);

    // 添加MyMemory API输入框
    const mymemoryLabel = document.createElement('div');
    mymemoryLabel.innerHTML = `<strong>MyMemory API URL</strong><div style="font-size: 12px; color: #999; margin-bottom: 5px;">备选API 2</div>`;
    form.appendChild(mymemoryLabel);
    
    const mymemoryInput = document.createElement('input');
    mymemoryInput.type = 'text';
    mymemoryInput.id = 'mymemory-api-url';
    mymemoryInput.value = myMemoryApiUrl;
    mymemoryInput.style.width = '100%';
    mymemoryInput.style.padding = '8px';
    mymemoryInput.style.marginBottom = '20px';
    mymemoryInput.style.boxSizing = 'border-box';
    mymemoryInput.style.border = '1px solid #444';
    mymemoryInput.style.borderRadius = '4px';
    mymemoryInput.style.backgroundColor = 'rgba(50,50,50,0.8)';
    mymemoryInput.style.color = '#fff';
    form.appendChild(mymemoryInput);

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '10px';

    // 添加重置按钮
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '恢复默认';
    resetButton.style.backgroundColor = '#6b3838';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.padding = '8px 16px';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '13px';
    resetButton.onclick = () => {
        (document.getElementById('libre-api-url') as HTMLInputElement).value = LIBRE_TRANSLATE_API;
        (document.getElementById('lingva-api-url') as HTMLInputElement).value = LINGVA_TRANSLATE_API;
        (document.getElementById('mymemory-api-url') as HTMLInputElement).value = MYMEMORY_API;
    };
    buttonContainer.appendChild(resetButton);

    // 添加保存按钮
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = '保存设置';
    saveButton.style.backgroundColor = '#3a5e3a';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.padding = '8px 16px';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.fontSize = '13px';
    buttonContainer.appendChild(saveButton);

    // 添加取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '取消';
    cancelButton.style.backgroundColor = '#444';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.fontSize = '13px';
    cancelButton.onclick = () => document.body.removeChild(modal);
    buttonContainer.appendChild(cancelButton);

    form.appendChild(buttonContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击背景关闭弹窗
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 导出函数供外部使用
export { startTranslation as StartTranslate };