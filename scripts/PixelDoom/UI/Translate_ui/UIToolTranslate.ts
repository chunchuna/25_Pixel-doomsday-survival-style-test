//@ts-nocheck
import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    //StartTranslate("en")
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
const LIBRE_TRANSLATE_API = 'https://libretranslate.de/translate';
const LINGVA_TRANSLATE_API = 'https://lingva.ml/api/v1';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

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
        const response = await fetch(LIBRE_TRANSLATE_API, {
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
        const response = await fetch(`${LINGVA_TRANSLATE_API}/auto/${targetLang}/${encodeURIComponent(text)}`);

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
        const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=zh-CN|${targetLang}`;
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
   */async function processPage(mode: WorkMode, targetLang: string = 'en'): Promise<void> {
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
            showLoader(true, mode === 'mark' ? '实时标记模式已启用' : `实时翻译模式已启用(${targetLang})`);
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
            loader.style.top = '10px';
            loader.style.left = '50%';
            loader.style.transform = 'translateX(-50%)';
            loader.style.padding = '5px 10px';
            loader.style.backgroundColor = 'rgba(0,0,0,0.7)';
            loader.style.color = 'white';
            loader.style.borderRadius = '4px';
            loader.style.zIndex = '9999';
            document.body.appendChild(loader);
        }
        loader.innerHTML = message;
        loader.style.display = 'block';
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
 * 添加控制UI
 */
function addControlUI(): void {
    // 创建控制容器
    const container = document.createElement('div');
    container.id = 'translation-controls';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '1000';
    container.style.backgroundColor = 'rgba(255,255,255,0.9)';
    container.style.padding = '10px';
    container.style.borderRadius = '4px';
    container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '5px';

    // 添加标题
    const title = document.createElement('div');
    title.textContent = '实时翻译工具';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    container.appendChild(title);

    // 添加模式选择
    const modeContainer = document.createElement('div');
    modeContainer.style.display = 'flex';
    modeContainer.style.gap = '5px';

    // 标记模式按钮
    const markButton = document.createElement('button');
    markButton.textContent = '标记模式';
    markButton.style.flex = '1';
    markButton.style.padding = '5px';
    markButton.style.cursor = 'pointer';
    markButton.addEventListener('click', () => {
        processPage('mark');
        startObservingDOM();
    });
    modeContainer.appendChild(markButton);

    // 翻译模式按钮
    const translateButton = document.createElement('button');
    translateButton.textContent = '翻译模式';
    translateButton.style.flex = '1';
    translateButton.style.padding = '5px';
    translateButton.style.cursor = 'pointer';
    translateButton.addEventListener('click', () => {
        const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
        processPage('translate', langSelect.value);
        startObservingDOM();
    });
    modeContainer.appendChild(translateButton);

    // 关闭模式按钮
    const offButton = document.createElement('button');
    offButton.textContent = '关闭';
    offButton.style.flex = '1';
    offButton.style.padding = '5px';
    offButton.style.cursor = 'pointer';
    offButton.addEventListener('click', () => {
        processPage('off');
        stopObservingDOM();
    });
    modeContainer.appendChild(offButton);

    container.appendChild(modeContainer);

    // 添加语言选择
    const langLabel = document.createElement('label');
    langLabel.textContent = '选择语言:';
    langLabel.style.marginTop = '5px';
    container.appendChild(langLabel);

    const langSelect = document.createElement('select');
    langSelect.id = 'lang-select';
    langSelect.style.width = '100%';
    langSelect.style.padding = '5px';

    // 添加语言选项
    AVAILABLE_LANGUAGES.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.text = lang.name;
        langSelect.appendChild(option);
    });
    container.appendChild(langSelect);

    // 添加统计按钮
    const statsButton = document.createElement('button');
    statsButton.textContent = '显示文本统计';
    statsButton.style.padding = '5px';
    statsButton.style.marginTop = '5px';
    statsButton.style.cursor = 'pointer';
    statsButton.addEventListener('click', () => {
        const textNodeCount = originalTextContent.size;
        const attrNodeCount = originalAttributeContent.size;

        alert(`检测到的文本节点: ${textNodeCount}\n检测到的属性节点: ${attrNodeCount}\n总计: ${textNodeCount + attrNodeCount}`);
    });
    container.appendChild(statsButton);

    document.body.appendChild(container);
}

/**
 * 启动翻译工具
 * @param mode 初始模式: 'mark'=标记模式, 'translate'=翻译模式, 'off'=关闭
 * @param targetLang 目标语言代码
 */
function StartTranslate(mode: WorkMode = 'mark', targetLang: string = 'en'): void {
    console.log(`Starting real-time translator in ${mode} mode, language: ${targetLang}`);

    // 添加控制UI
    addControlUI();

    // 初始化页面处理
    processPage(mode, targetLang);

    // 如果不是关闭模式，启动DOM观察
    if (mode !== 'off') {
        startObservingDOM();
    }
}

// 导出函数供外部使用
export { StartTranslate };