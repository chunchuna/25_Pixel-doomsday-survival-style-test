//@ts-nocheck
import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    StartTranslate("en")
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

// 当前选择的API
type ApiType = 'libre' | 'lingva' | 'mymemory' | 'all';
let currentApiType: ApiType = 'all';  // 默认使用所有API（自动切换）

// 翻译进度计数
let translatedItemsCount = 0;
let totalItemsToTranslate = 0;

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
    if (!text || text.trim() === '') return text;

    // 根据当前选择的API进行翻译
    switch (currentApiType) {
        case 'libre':
            return await translateTextWithLibre(text, targetLang);
        case 'lingva':
            return await translateTextWithLingva(text, targetLang);
        case 'mymemory':
            return await translateTextWithMyMemory(text, targetLang);
        case 'all':
        default:
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
    
    // 更新翻译计数
    translatedItemsCount++;
    updateProgressLoader();

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
 * 更新进度加载指示器
 */
function updateProgressLoader(): void {
    if (totalItemsToTranslate > 0) {
        const percentage = Math.min(Math.round((translatedItemsCount / totalItemsToTranslate) * 100), 100);
        const apiName = getApiDisplayName(currentApiType);
        showLoader(true, `正在翻译为${getLanguageDisplayName(currentLanguage)}(${percentage}%) - 使用${apiName}`);
    }
}

/**
 * 获取API显示名称
 */
function getApiDisplayName(apiType: ApiType): string {
    switch (apiType) {
        case 'libre': return 'LibreTranslate';
        case 'lingva': return 'Lingva';
        case 'mymemory': return 'MyMemory';
        case 'all': return '自动切换';
        default: return '未知API';
    }
}

/**
 * 获取语言显示名称
 */
function getLanguageDisplayName(langCode: string): string {
    const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
    return lang ? lang.name : langCode;
}

/**
 * 处理整个页面
 */
async function processPage(mode: WorkMode, targetLang: string = 'en'): Promise<void> {
    currentMode = mode;
    currentLanguage = targetLang;
    
    // 重置翻译计数
    translatedItemsCount = 0;
    totalItemsToTranslate = 0;

    // 显示处理中的加载指示器
    let message = '';
    switch (mode) {
        case 'mark':
            message = '正在标记文本...';
            break;
        case 'translate':
            message = `正在翻译为${getLanguageDisplayName(targetLang)}...`;
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
            // 先计算总共需要翻译的项目数量
            if (mode === 'translate') {
                // 计算文本节点数
                totalItemsToTranslate = originalTextContent.size;
                // 加上属性节点数
                totalItemsToTranslate += originalAttributeContent.size;
                // 如果是全新开始，计算页面上的文本节点
                if (totalItemsToTranslate === 0) {
                    // 粗略估计，后续会在翻译过程中更新
                    totalItemsToTranslate = document.body.textContent?.length || 0;
                    totalItemsToTranslate = Math.max(100, Math.floor(totalItemsToTranslate / 50));
                }
            }
            
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
            const apiName = getApiDisplayName(currentApiType);
            showLoader(true, mode === 'mark' 
                ? '实时标记模式已启用' 
                : `实时翻译模式已启用(${getLanguageDisplayName(targetLang)}) - 使用${apiName}`);
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
            loader.style.padding = '10px 15px';
            loader.style.backgroundColor = 'rgba(0,0,0,0.8)';
            loader.style.color = 'white';
            loader.style.borderRadius = '4px';
            loader.style.zIndex = '9999';
            loader.style.fontSize = '14px';
            loader.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            loader.style.minWidth = '250px';
            loader.style.textAlign = 'center';
            
            // 创建消息容器
            const messageElement = document.createElement('div');
            messageElement.id = 'translation-message';
            messageElement.style.marginBottom = '8px';
            loader.appendChild(messageElement);
            
            // 创建进度条容器
            const progressContainer = document.createElement('div');
            progressContainer.style.width = '100%';
            progressContainer.style.backgroundColor = 'rgba(255,255,255,0.2)';
            progressContainer.style.height = '5px';
            progressContainer.style.borderRadius = '3px';
            progressContainer.style.overflow = 'hidden';
            
            // 创建进度条
            const progressBar = document.createElement('div');
            progressBar.id = 'translation-progress-bar';
            progressBar.style.width = '0%';
            progressBar.style.height = '100%';
            progressBar.style.backgroundColor = '#4CAF50';
            progressBar.style.transition = 'width 0.3s ease-in-out';
            
            progressContainer.appendChild(progressBar);
            loader.appendChild(progressContainer);
            
            document.body.appendChild(loader);
        }
        
        // 更新消息
        const messageElement = document.getElementById('translation-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // 如果是翻译模式且有进度，更新进度条
        if (message.includes('%')) {
            const progressBar = document.getElementById('translation-progress-bar');
            if (progressBar) {
                const percentMatch = message.match(/\((\d+)%\)/);
                if (percentMatch && percentMatch[1]) {
                    const percent = parseInt(percentMatch[1], 10);
                    progressBar.style.width = `${percent}%`;
                }
            }
        } else {
            // 如果不是显示进度，重置进度条
            const progressBar = document.getElementById('translation-progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
        
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
        const apiSelect = document.getElementById('api-select') as HTMLSelectElement;
        
        // 保存用户选择
        currentLanguage = langSelect.value;
        currentApiType = apiSelect.value as ApiType;
        
        // 保存设置到本地存储
        saveSettings();
        
        // 应用翻译
        processPage('translate', currentLanguage);
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

    // 添加API选择
    const apiLabel = document.createElement('label');
    apiLabel.textContent = '选择翻译API:';
    apiLabel.style.marginTop = '5px';
    container.appendChild(apiLabel);

    const apiSelect = document.createElement('select');
    apiSelect.id = 'api-select';
    apiSelect.style.width = '100%';
    apiSelect.style.padding = '5px';
    apiSelect.style.marginBottom = '5px';

    // 添加API选项
    const apiOptions = [
        { value: 'all', text: '自动切换 (推荐)' },
        { value: 'libre', text: 'LibreTranslate' },
        { value: 'lingva', text: 'Lingva' },
        { value: 'mymemory', text: 'MyMemory' }
    ];

    apiOptions.forEach(api => {
        const option = document.createElement('option');
        option.value = api.value;
        option.text = api.text;
        apiSelect.appendChild(option);
    });

    container.appendChild(apiSelect);

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

    // 添加测试API按钮
    const testAPIButton = document.createElement('button');
    testAPIButton.textContent = '测试翻译API';
    testAPIButton.style.padding = '5px';
    testAPIButton.style.marginTop = '5px';
    testAPIButton.style.backgroundColor = '#4CAF50';
    testAPIButton.style.color = 'white';
    testAPIButton.style.border = 'none';
    testAPIButton.style.borderRadius = '4px';
    testAPIButton.style.cursor = 'pointer';
    testAPIButton.addEventListener('click', () => {
        testTranslationAPIs();
    });
    container.appendChild(testAPIButton);

    // 添加API设置按钮
    const apiSettingsButton = document.createElement('button');
    apiSettingsButton.textContent = 'API设置';
    apiSettingsButton.style.padding = '5px';
    apiSettingsButton.style.marginTop = '5px';
    apiSettingsButton.style.backgroundColor = '#2196F3';
    apiSettingsButton.style.color = 'white';
    apiSettingsButton.style.border = 'none';
    apiSettingsButton.style.borderRadius = '4px';
    apiSettingsButton.style.cursor = 'pointer';
    apiSettingsButton.addEventListener('click', () => {
        showApiSettingsModal();
    });
    container.appendChild(apiSettingsButton);

    document.body.appendChild(container);
}

/**
 * 从本地存储加载API设置
 */
function loadApiSettings(): void {
    try {
        // 加载API URL设置
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

        // 加载上次使用的语言设置
        const savedLanguage = localStorage.getItem('translationLanguage');
        if (savedLanguage) {
            currentLanguage = savedLanguage;
        }

        // 加载上次使用的API类型设置
        const savedApiType = localStorage.getItem('translationApiType');
        if (savedApiType && ['libre', 'lingva', 'mymemory', 'all'].includes(savedApiType)) {
            currentApiType = savedApiType as ApiType;
        }

        console.log('已从本地存储加载设置:', { 
            language: currentLanguage, 
            apiType: currentApiType 
        });
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

/**
 * 保存设置到本地存储
 */
function saveSettings(): void {
    try {
        // 保存当前语言
        localStorage.setItem('translationLanguage', currentLanguage);
        
        // 保存当前API类型
        localStorage.setItem('translationApiType', currentApiType);
        
        console.log('已保存设置:', { 
            language: currentLanguage, 
            apiType: currentApiType 
        });
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

/**
 * 启动翻译工具
 * @param mode 初始模式: 'mark'=标记模式, 'translate'=翻译模式, 'off'=关闭
 * @param targetLang 目标语言代码
 */
function StartTranslate(mode: WorkMode = 'mark', targetLang: string = 'en'): void {
    console.log(`Starting real-time translator in ${mode} mode, language: ${targetLang}`);

    // 从本地存储加载API设置
    loadApiSettings();

    // 添加控制UI
    addControlUI();

    // 更新UI显示已保存的设置
    setTimeout(() => {
        // 更新语言选择框
        const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
        if (langSelect) {
            langSelect.value = currentLanguage;
        }
        
        // 更新API选择框
        const apiSelect = document.getElementById('api-select') as HTMLSelectElement;
        if (apiSelect) {
            apiSelect.value = currentApiType;
        }
    }, 100);

    // 初始化页面处理
    processPage(mode, currentLanguage); // 使用保存的语言，而不是默认值

    // 如果不是关闭模式，启动DOM观察
    if (mode !== 'off') {
        startObservingDOM();
    }
}

/**
 * 测试翻译API的连通性和速度
 */
async function testTranslationAPIs(): Promise<void> {
    // 显示测试中的提示
    showLoader(true, '正在测试翻译API...');

    // 测试文本（简体中文）
    const testText = '这是一段测试文本，用于检测翻译API的连通性和速度。';
    
    // 选择目标语言
    const langSelect = document.getElementById('lang-select') as HTMLSelectElement;
    const targetLang = langSelect.value || 'en';

    // 测试结果
    const results: { api: string; success: boolean; time: number; text?: string; error?: string }[] = [];

    // 测试第一个API - LibreTranslate
    try {
        const startTime1 = performance.now();
        const result1 = await translateTextWithLibre(testText, targetLang);
        const endTime1 = performance.now();
        results.push({
            api: 'LibreTranslate',
            success: true,
            time: Math.round(endTime1 - startTime1),
            text: result1
        });
    } catch (error) {
        results.push({
            api: 'LibreTranslate',
            success: false,
            time: 0,
            error: error instanceof Error ? error.message : String(error)
        });
    }

    // 测试第二个API - Lingva
    try {
        const startTime2 = performance.now();
        const result2 = await translateTextWithLingva(testText, targetLang);
        const endTime2 = performance.now();
        results.push({
            api: 'Lingva',
            success: true,
            time: Math.round(endTime2 - startTime2),
            text: result2
        });
    } catch (error) {
        results.push({
            api: 'Lingva',
            success: false,
            time: 0,
            error: error instanceof Error ? error.message : String(error)
        });
    }

    // 测试第三个API - MyMemory
    try {
        const startTime3 = performance.now();
        const result3 = await translateTextWithMyMemory(testText, targetLang);
        const endTime3 = performance.now();
        results.push({
            api: 'MyMemory',
            success: true,
            time: Math.round(endTime3 - startTime3),
            text: result3
        });
    } catch (error) {
        results.push({
            api: 'MyMemory',
            success: false,
            time: 0,
            error: error instanceof Error ? error.message : String(error)
        });
    }

    // 构建结果弹窗内容
    let resultContent = `<div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h3 style="margin-top: 0; color: #333;">翻译API测试结果（${AVAILABLE_LANGUAGES.find(lang => lang.code === targetLang)?.name || targetLang}）</h3>
        <p><strong>测试文本：</strong>${testText}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">`;

    // 添加各API的结果
    for (const result of results) {
        const statusColor = result.success ? '#4CAF50' : '#F44336';
        const statusText = result.success ? '成功' : '失败';
        const timeText = result.success ? `${result.time}毫秒` : '—';
        const translateResult = result.success ? result.text : result.error;

        resultContent += `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${result.api}</strong>
                <span style="color: ${statusColor};">${statusText}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;">
                <span>响应时间：</span>
                <span>${timeText}</span>
            </div>
            <div style="background-color: #f9f9f9; padding: 8px; border-radius: 4px; word-break: break-all;">
                ${result.success ? translateResult : `<span style="color: #F44336;">${translateResult}</span>`}
            </div>
        </div>`;
    }

    resultContent += `</div>`;

    // 隐藏加载提示
    showLoader(false);

    // 创建自定义弹窗
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    modalContent.innerHTML = resultContent;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.display = 'block';
    closeBtn.style.margin = '20px auto 0';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.backgroundColor = '#555';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击背景关闭弹窗
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
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
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';

    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '翻译API设置';
    title.style.margin = '0 0 20px 0';
    title.style.color = '#333';
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
    libreLabel.innerHTML = `<strong>LibreTranslate API URL</strong><div style="font-size: 12px; color: #666; margin-bottom: 5px;">主翻译API</div>`;
    form.appendChild(libreLabel);
    
    const libreInput = document.createElement('input');
    libreInput.type = 'text';
    libreInput.id = 'libre-api-url';
    libreInput.value = libreTranslateApiUrl;
    libreInput.style.width = '100%';
    libreInput.style.padding = '8px';
    libreInput.style.marginBottom = '15px';
    libreInput.style.boxSizing = 'border-box';
    libreInput.style.border = '1px solid #ddd';
    libreInput.style.borderRadius = '4px';
    form.appendChild(libreInput);

    // 添加Lingva API输入框
    const lingvaLabel = document.createElement('div');
    lingvaLabel.innerHTML = `<strong>Lingva API URL</strong><div style="font-size: 12px; color: #666; margin-bottom: 5px;">备选API 1</div>`;
    form.appendChild(lingvaLabel);
    
    const lingvaInput = document.createElement('input');
    lingvaInput.type = 'text';
    lingvaInput.id = 'lingva-api-url';
    lingvaInput.value = lingvaApiUrl;
    lingvaInput.style.width = '100%';
    lingvaInput.style.padding = '8px';
    lingvaInput.style.marginBottom = '15px';
    lingvaInput.style.boxSizing = 'border-box';
    lingvaInput.style.border = '1px solid #ddd';
    lingvaInput.style.borderRadius = '4px';
    form.appendChild(lingvaInput);

    // 添加MyMemory API输入框
    const mymemoryLabel = document.createElement('div');
    mymemoryLabel.innerHTML = `<strong>MyMemory API URL</strong><div style="font-size: 12px; color: #666; margin-bottom: 5px;">备选API 2</div>`;
    form.appendChild(mymemoryLabel);
    
    const mymemoryInput = document.createElement('input');
    mymemoryInput.type = 'text';
    mymemoryInput.id = 'mymemory-api-url';
    mymemoryInput.value = myMemoryApiUrl;
    mymemoryInput.style.width = '100%';
    mymemoryInput.style.padding = '8px';
    mymemoryInput.style.marginBottom = '20px';
    mymemoryInput.style.boxSizing = 'border-box';
    mymemoryInput.style.border = '1px solid #ddd';
    mymemoryInput.style.borderRadius = '4px';
    form.appendChild(mymemoryInput);

    // 添加重置按钮
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '恢复默认';
    resetButton.style.backgroundColor = '#f44336';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.padding = '8px 16px';
    resetButton.style.marginRight = '10px';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.onclick = () => {
        (document.getElementById('libre-api-url') as HTMLInputElement).value = LIBRE_TRANSLATE_API;
        (document.getElementById('lingva-api-url') as HTMLInputElement).value = LINGVA_TRANSLATE_API;
        (document.getElementById('mymemory-api-url') as HTMLInputElement).value = MYMEMORY_API;
    };
    form.appendChild(resetButton);

    // 添加保存按钮
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = '保存设置';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.padding = '8px 16px';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    form.appendChild(saveButton);

    // 添加取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '取消';
    cancelButton.style.backgroundColor = '#ccc';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.marginLeft = '10px';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => document.body.removeChild(modal);
    form.appendChild(cancelButton);

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
export { StartTranslate };