//@ts-nocheck
import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("开始初始化翻译工具");
    // 直接调用创建按钮的函数
    createTranslateUI();
    ShowArrowPointLanague();
    
})

// real-time-translator.ts

/**
 * 实时翻译工具 - 本地翻译版
 * 持续监控DOM变化，自动处理新添加的文本
 */

// 可用的语言列表
const AVAILABLE_LANGUAGES = [
    { code: 'zh-CN', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
];

// 沉浸式翻译SDK支持的语言映射
const SDK_LANGUAGE_MAP: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'es': 'es',
    'fr': 'fr',
    'de': 'de'
};

// 存储原始文本，以便可以切换回来
const originalTextContent = new WeakMap<Node, string>();
const originalAttributeContent = new WeakMap<Element, Record<string, string>>();

// 当前语言
let currentLanguage = 'zh-CN';

// 当前工作模式
type WorkMode = 'mark' | 'translate' | 'off';
let currentMode: WorkMode = 'off';

// 本地翻译字典
const localTranslations: Record<string, Record<string, string>> = {};

// 预设翻译数据 - 开发者可以在此处添加默认翻译
const defaultTranslations: string = `开始游戏/Start Game/ゲームスタート/게임 시작/Iniciar juego
设置/Settings/設定/설정/Configuración
退出/Exit/終了/종료/Salir
继续/Continue/続ける/계속하기/Continuar
返回/Back/戻る/돌아가기/Volver
保存/Save/保存/저장/Guardar
加载/Load/ロード/로드/Cargar
菜单/Menu/メニュー/메뉴/Menú
音量/Volume/音量/볼륨/Volumen
音乐/Music/音楽/음악/Música
音效/Sound/効果音/효과음/Efectos
全屏/Fullscreen/全画面/전체 화면/Pantalla completa
窗口/Window/ウィンドウ/창 모드/Ventana
确认/Confirm/確認/확인/Confirmar
取消/Cancel/キャンセル/취소/Cancelar
是/Yes/はい/예/Sí
否/No/いいえ/아니오/No
关闭/Close/閉じる/닫기/Cerrar
下一步/Next/次へ/다음/Siguiente
上一步/Previous/前へ/이전/Anterior
开始/Start/スタート/시작/Iniciar
结束/End/終了/종료/Finalizar
超过了这个物品的交互范围!/Exceeded the interaction range of this item!/このアイテムの操作範囲を超えました!/이 아이템의 상호작용 범위를 초과했습니다!/¡Se excedió el rango de interacción de este objeto!
存档读取/Load Save/セーブデータ読み込み/저장 파일 불러오기/Cargar partida
关于/About/について/정보/Acerca de
语言/Language/言語/언어/Idioma
寻找/Search/探す/찾기/Buscar
闻/Smell/嗅ぐ/냄새 맡기/Oler
标记/Mark/マーク/표시/Marcar
在服务器上标记/Mark on Server/サーバー上でマーク/서버에 표시하기/Marcar en el servidor
新游戏/New Game/新規ゲーム/새 게임/Nuevo juego
设置/Settings/設定/설정/Configuración
存档读取/Load Save/セーブデータ読み込み/저장 파일 불러오기/Cargar partida
关于/About/について/정보/Acerca de
语言/Language/言語/언어/Idioma
从本地读取/Load from Local/ローカルから読み込む/로컬에서 불러오기/Cargar desde local
暂无存档/No Save Data/セーブデータなし/저장 파일 없음/Sin datos guardados
静音/Mute/ミュート/음소거/Silencio
你正在使用/You are using/使用中です/사용 중입니다/Estás usando
露营椅子/Camping Chair/キャンプチェア/캠핑 의자/Silla de camping
此物品无法被破坏/This item cannot be destroyed/このアイテムは破壊できません/이 아이템은 파괴할 수 없습니다/*Este objeto no puede ser destruido
一把普通的露营椅，被雨水打湿了/A regular camping chair, damp from the rain/雨に濡れた普通のキャンプチェア/비에 젖은 평범한 캠핑 의자/Una silla de camping común, mojada por la lluvia
调查/Investigate/調査/조사/Investigar
拔开灰烬检查/Sift Through Ashes/灰をかき分けて調べる/재를 헤집어 살펴보다/Examinar removiendo las cenizas
`;

/**
 * 翻译表使用说明：
 * 
 * 1. 开发者可以直接在上面的defaultTranslations变量中添加游戏内的文本翻译
 *    格式：中文/英文/日文/韩文/西班牙文
 *    例如：开始游戏/Start Game/ゲームスタート/게임 시작/Iniciar juego
 * 
 * 2. 玩家也可以通过翻译工具UI中的"编辑翻译表"按钮自行添加和修改翻译
 * 
 * 3. 系统会优先使用玩家自定义的翻译，如果没有找到，则使用默认翻译
 * 
 * 4. 支持的语言代码：
 *    - zh-CN：中文
 *    - en：英文
 *    - ja：日文
 *    - ko：韩文
 *    - es：西班牙文
 *    - fr：法文（可选）
 *    - de：德文（可选）
 * 
 * 5. 测试翻译效果：
 *    - 点击UI右上角的国旗按钮
 *    - 选择目标语言
 *    - 点击"Translate Game"按钮
 */

// 实时监控的MutationObserver
let domObserver: MutationObserver | null = null;

// 应该跳过翻译的元素选择器
const SKIP_ELEMENTS = [
    'script', 'style', 'iframe', 'code', 'pre',
    '[data-no-translate]', // 自定义属性，用于标记不需要翻译的元素
    '#translation-ui-container', // 跳过我们自己的UI元素
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
 * 查找本地翻译字典
 */
function findLocalTranslation(text: string, targetLang: string): string | null {
    if (!text || text.trim() === '') return null;
    
    // 如果目标语言是中文，直接返回原文
    if (targetLang === 'zh-CN') return text;

    // 检查是否有精确匹配
    if (localTranslations[text] && localTranslations[text][targetLang]) {
        return localTranslations[text][targetLang];
    }

    // 如果没有精确匹配，检查是否是部分文本匹配
    for (const key in localTranslations) {
        if (text.includes(key)) {
            const translation = localTranslations[key][targetLang];
            if (translation) {
                // 替换匹配的部分
                return text.replace(key, translation);
            }
        }
    }

    // 没有找到翻译，返回null
    return null;
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

    // 如果目标语言是中文，则恢复原始文本
    if (targetLang === 'zh-CN') {
        node.textContent = originalText;
        return;
    }

    // 查找本地翻译
    const localTranslation = findLocalTranslation(originalText, targetLang);
    
    // 如果找到了翻译，使用本地翻译
    if (localTranslation) {
        node.textContent = localTranslation;
    } else {
        // 没有找到翻译，保持原文
        node.textContent = originalText;
    }
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
            // 如果目标语言是中文，则恢复原始值
            if (targetLang === 'zh-CN') {
                element.setAttribute(attr, originalAttrs[attr]);
                continue;
            }

            // 查找本地翻译
            const localTranslation = findLocalTranslation(originalAttrs[attr], targetLang);
            
            // 如果找到了翻译，使用本地翻译
            if (localTranslation) {
                element.setAttribute(attr, localTranslation);
            } else {
                // 没有找到翻译，保持原文
                element.setAttribute(attr, originalAttrs[attr]);
            }
        }
    }
}

/**
 * 递归处理DOM树的元素（标记或翻译）
 */
async function processElement(element: Element, mode: WorkMode, targetLang: string = 'zh-CN'): Promise<void> {
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
async function processPage(mode: WorkMode, targetLang: string = 'zh-CN'): Promise<void> {
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
function showLoader(show: boolean, message: string = 'Processing...'): void {
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
                mutation.target.id === 'translation-ui-container') {
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
    console.log("Creating translation UI...");
    
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
        flagButton.title = 'Translation Tool';
        
        // 设置初始国旗样式
        updateFlagButton(flagButton, 'zh-CN');
        
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
        panel.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.4)';
        panel.style.padding = '12px';
        panel.style.display = 'none'; // 默认隐藏
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-10px)';
        panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // 添加面板标题
        const title = document.createElement('div');
        title.textContent = 'Immersive Translate';
        title.style.color = '#ddd';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        title.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        title.style.paddingBottom = '8px';
        panel.appendChild(title);
        
        // 添加语言选择
        const langLabel = document.createElement('div');
        langLabel.textContent = 'Select target language:';
        langLabel.style.color = '#bbb';
        langLabel.style.fontSize = '12px';
        langLabel.style.marginBottom = '5px';
        panel.appendChild(langLabel);
        
        const langSelect = document.createElement('select');
        langSelect.id = 'lang-select';
        langSelect.style.width = '100%';
        langSelect.style.padding = '6px';
        langSelect.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        langSelect.style.color = '#fff';
        langSelect.style.border = '1px solid rgba(80, 80, 80, 0.5)';
        langSelect.style.borderRadius = '4px';
        langSelect.style.marginBottom = '12px';
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
        
        // SDK翻译按钮容器
        const sdkButtonContainer = document.createElement('div');
        sdkButtonContainer.style.marginBottom = '12px';
        
        // SDK翻译按钮
        const sdkTranslateButton = document.createElement('button');
        sdkTranslateButton.textContent = 'Start Translation';
        sdkTranslateButton.style.width = '100%';
        sdkTranslateButton.style.padding = '10px 0';
        sdkTranslateButton.style.backgroundColor = '#333';
        sdkTranslateButton.style.color = '#ddd';
        sdkTranslateButton.style.border = '1px solid #444';
        sdkTranslateButton.style.borderRadius = '4px';
        sdkTranslateButton.style.cursor = 'pointer';
        sdkTranslateButton.style.fontSize = '13px';
        sdkTranslateButton.style.fontWeight = 'bold';
        sdkTranslateButton.style.transition = 'all 0.2s ease';
        
        // 添加悬停效果
        sdkTranslateButton.addEventListener('mouseover', () => {
            sdkTranslateButton.style.backgroundColor = '#444';
        });
        
        sdkTranslateButton.addEventListener('mouseout', () => {
            sdkTranslateButton.style.backgroundColor = '#333';
        });
        
        sdkTranslateButton.addEventListener('click', () => {
            const selectedLang = langSelect.value;
            
            // 如果选择的是中文，提示用户选择其他语言
            if (selectedLang === 'zh-CN') {
                //alert('Please select a non-Chinese target language');
                return;
            }
            
            currentLanguage = selectedLang;
            
            // 更新国旗显示
            updateFlagButton(flagButton, selectedLang);
            
            // 使用沉浸式翻译SDK
            initImmersiveTranslateSDK(selectedLang);
            
            // 收起面板
            togglePanel(false);
        });
        sdkButtonContainer.appendChild(sdkTranslateButton);
        panel.appendChild(sdkButtonContainer);
        
        // 添加停止翻译按钮
        const stopSdkButton = document.createElement('button');
        stopSdkButton.textContent = 'Stop Translation';
        stopSdkButton.style.width = '100%';
        stopSdkButton.style.padding = '8px 0';
        stopSdkButton.style.backgroundColor = '#333';
        stopSdkButton.style.color = '#ddd';
        stopSdkButton.style.border = '1px solid #444';
        stopSdkButton.style.borderRadius = '4px';
        stopSdkButton.style.cursor = 'pointer';
        stopSdkButton.style.fontSize = '12px';
        stopSdkButton.style.marginBottom = '12px';
        stopSdkButton.style.transition = 'all 0.2s ease';
        
        // 添加悬停效果
        stopSdkButton.addEventListener('mouseover', () => {
            stopSdkButton.style.backgroundColor = '#444';
        });
        
        stopSdkButton.addEventListener('mouseout', () => {
            stopSdkButton.style.backgroundColor = '#333';
        });
        
        stopSdkButton.addEventListener('click', () => {
            // 停止沉浸式翻译SDK
            stopImmersiveTranslateSDK();
            
            // 显示提示信息
            showLoader(true, 'Translation stopped');
            
            // 收起面板
            togglePanel(false);
        });
        panel.appendChild(stopSdkButton);
        
        // 添加翻译使用教程按钮
        const tutorialButton = document.createElement('button');
        tutorialButton.textContent = 'Translation Guide';
        tutorialButton.style.width = '100%';
        tutorialButton.style.padding = '8px 0';
        tutorialButton.style.backgroundColor = '#222';
        tutorialButton.style.color = '#bbb';
        tutorialButton.style.border = '1px solid #444';
        tutorialButton.style.borderRadius = '4px';
        tutorialButton.style.cursor = 'pointer';
        tutorialButton.style.fontSize = '12px';
        tutorialButton.style.marginBottom = '10px';
        tutorialButton.style.transition = 'all 0.2s ease';
        
        // 添加悬停效果
        tutorialButton.addEventListener('mouseover', () => {
            tutorialButton.style.backgroundColor = '#333';
            tutorialButton.style.color = '#ddd';
        });
        
        tutorialButton.addEventListener('mouseout', () => {
            tutorialButton.style.backgroundColor = '#222';
            tutorialButton.style.color = '#bbb';
        });
        
        tutorialButton.addEventListener('click', () => {
            // 打开沉浸式翻译使用教程页面
            window.open('https://immersivetranslate.com/en/docs/usage/', '_blank');
            
            // 收起面板
            togglePanel(false);
        });
        panel.appendChild(tutorialButton);
        
        // 添加版本信息
        const versionInfo = document.createElement('div');
        versionInfo.textContent = 'Immersive Translate v3.0';
        versionInfo.style.color = 'rgba(150, 150, 150, 0.6)';
        versionInfo.style.fontSize = '10px';
        versionInfo.style.textAlign = 'center';
        versionInfo.style.marginTop = '5px';
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
            console.log("Translation UI added to page");
        } else {
            window.addEventListener('load', function() {
                document.body.appendChild(container);
                console.log("Delayed loading: Translation UI added to page");
            });
        }
        
        // 点击外部区域关闭面板
        document.addEventListener('click', (event) => {
            const target = event.target as Element;
            if (isPanelVisible && 
                target !== flagButton && 
                target !== panel &&
                !panel.contains(target)) {
                isPanelVisible = false;
                togglePanel(false);
            }
        });
        
        // 加载本地翻译数据
        loadLocalTranslations();
        
    } catch (error) {
        console.error("Failed to create translation UI:", error);
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
    
    // 检查是否有本地翻译
    const translationCount = Object.keys(localTranslations).length;
    if (translationCount === 0) {
        showLoader(true, "没有翻译数据，请先添加翻译");
        setTimeout(() => {
            showLoader(false);
            showLocalTranslationEditor();
        }, 2000);
        return;
    }
    
    // 显示加载指示器
    showLoader(true, `正在翻译为 ${getLangName(lang)}...(${translationCount}项)`);
    
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
 * 获取语言名称
 */
function getLangName(langCode: string): string {
    const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
    return lang ? lang.name : langCode;
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

    // 自动聚焦到第一个输入框
    libreInput.focus();
}

/**
 * 更新翻译统计信息
 */
function updateTranslationStats(statsDiv: HTMLElement | null): void {
    if (!statsDiv) return;
    
    const count = Object.keys(localTranslations).length;
    statsDiv.textContent = `已加载 ${count} 条本地翻译`;
}

/**
 * 显示本地翻译编辑器
 */
function showLocalTranslationEditor(): void {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.id = 'local-translation-editor-modal';
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
    
    // 确保点击内容区域不会触发模态框关闭
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
        // 如果点击的是模态框内容区域，阻止事件冒泡
        if (event.target !== modal) {
            event.stopPropagation();
        }
    });

    // 创建模态框内容 - 缩小整体尺寸
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'rgba(25,25,25,0.95)';
    modalContent.style.padding = '15px';
    modalContent.style.borderRadius = '6px';
    modalContent.style.width = '85%';
    modalContent.style.maxWidth = '600px'; // 减小最大宽度
    modalContent.style.maxHeight = '85%';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 3px 15px rgba(0,0,0,0.5)';
    modalContent.style.color = '#ccc';
    
    // 添加滚动条样式
    modalContent.style.scrollbarWidth = 'thin';
    modalContent.style.scrollbarColor = '#444 #222';
    
    // 确保点击内容区域不会触发模态框关闭
    modalContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // 添加标题 - 减小字体
    const title = document.createElement('h3');
    title.textContent = '翻译表编辑器';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#ddd';
    title.style.fontSize = '16px';
    modalContent.appendChild(title);

    // 添加说明 - 减小字体
    const description = document.createElement('p');
    description.innerHTML = '每行一个翻译，格式：<strong>中文/英文/日文/韩文/西班牙文</strong>，使用斜杠分隔。<br>例如：<code>开始游戏/Start Game/ゲームスタート/게임 시작/Iniciar juego</code>';
    description.style.marginBottom = '12px';
    description.style.fontSize = '12px';
    description.style.color = '#999';
    modalContent.appendChild(description);

    // 创建表单
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '12px';
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 阻止冒泡
        
        try {
            // 获取文本区域的内容
            const content = (document.getElementById('local-translation-textarea') as HTMLTextAreaElement).value;
            
            // 解析并保存翻译
            parseLocalTranslations(content);
            
            // 提示保存成功
            alert(`成功保存了 ${Object.keys(localTranslations).length} 条翻译`);
            
            // 关闭模态框
            document.body.removeChild(modal);
            
            // 更新翻译统计
            updateTranslationStats(document.getElementById('translation-stats'));
        } catch (error) {
            console.error('保存翻译失败:', error);
            alert(`保存失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    // 添加文本区域 - 减小高度和调整样式
    const textarea = document.createElement('textarea');
    textarea.id = 'local-translation-textarea';
    textarea.style.width = '100%';
    textarea.style.height = '300px'; // 减小高度
    textarea.style.backgroundColor = 'rgba(35, 35, 35, 0.9)';
    textarea.style.color = '#ccc';
    textarea.style.border = '1px solid #444';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '8px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '12px'; // 减小字体
    textarea.style.resize = 'vertical';
    textarea.style.scrollbarWidth = 'thin';
    textarea.style.scrollbarColor = '#444 #222';
    textarea.placeholder = '开始游戏/Start Game/ゲームスタート/게임 시작/Iniciar juego\n设置/Settings/設定/설정/Configuración\n退出/Exit/終了/종료/Salir';
    textarea.readOnly = false; // 确保textarea可编辑
    textarea.disabled = false; // 确保textarea未被禁用
    
    // 确保textarea能够接收输入
    textarea.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    
    // 处理Tab键，允许在文本区域内使用Tab
    textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            
            // 获取当前光标位置
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            // 在光标位置插入制表符
            textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
            
            // 将光标移动到制表符后
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
        
        // 阻止其他键盘事件冒泡
        event.stopPropagation();
    });
    
    // 填充现有翻译数据
    textarea.value = formatLocalTranslationsForEdit();
    
    // 确保默认翻译已经被添加
    addDefaultTranslationsToEditor(textarea);
    
    form.appendChild(textarea);
    
    // 添加示例按钮 - 改为黑灰风格
    const addExampleButton = document.createElement('button');
    addExampleButton.type = 'button';
    addExampleButton.textContent = '添加示例翻译';
    addExampleButton.style.alignSelf = 'flex-start';
    addExampleButton.style.padding = '6px 12px'; // 减小内边距
    addExampleButton.style.backgroundColor = '#333';
    addExampleButton.style.color = '#ccc';
    addExampleButton.style.border = '1px solid #444';
    addExampleButton.style.borderRadius = '3px';
    addExampleButton.style.cursor = 'pointer';
    addExampleButton.style.fontSize = '11px'; // 减小字体
    
    // 悬停效果
    addExampleButton.addEventListener('mouseover', () => {
        addExampleButton.style.backgroundColor = '#3a3a3a';
    });
    addExampleButton.addEventListener('mouseout', () => {
        addExampleButton.style.backgroundColor = '#333';
    });
    
    addExampleButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        const examples = `开始游戏/Start Game/ゲームスタート/게임 시작/Iniciar juego
设置/Settings/設定/설정/Configuración
退出/Exit/終了/종료/Salir
继续/Continue/続ける/계속하기/Continuar
返回/Back/戻る/돌아가기/Volver
保存/Save/保存/저장/Guardar
加载/Load/ロード/로드/Cargar
菜单/Menu/メニュー/메뉴/Menú
音量/Volume/音量/볼륨/Volumen
音乐/Music/音楽/음악/Música
音效/Sound/効果音/효과음/Efectos
全屏/Fullscreen/全画面/전체 화면/Pantalla completa
窗口/Window/ウィンドウ/창 모드/Ventana
确认/Confirm/確認/확인/Confirmar
取消/Cancel/キャンセル/취소/Cancelar
是/Yes/はい/예/Sí
否/No/いいえ/아니오/No
关闭/Close/閉じる/닫기/Cerrar
下一步/Next/次へ/다음/Siguiente
上一步/Previous/前へ/이전/Anterior
开始/Start/スタート/시작/Iniciar
结束/End/終了/종료/Finalizar`;
        
        let currentText = textarea.value;
        if (currentText && !currentText.endsWith('\n')) {
            currentText += '\n';
        }
        textarea.value = currentText + examples;
    });
    form.appendChild(addExampleButton);

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '8px'; // 减小间距
    buttonContainer.style.marginTop = '12px';
    
    // 恢复默认翻译按钮 - 改为黑灰风格
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '恢复默认翻译';
    resetButton.style.padding = '7px 14px'; // 减小内边距
    resetButton.style.backgroundColor = '#333';
    resetButton.style.color = '#ccc';
    resetButton.style.border = '1px solid #444';
    resetButton.style.borderRadius = '3px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '11px'; // 减小字体
    
    // 悬停效果
    resetButton.addEventListener('mouseover', () => {
        resetButton.style.backgroundColor = '#3a3a3a';
    });
    resetButton.addEventListener('mouseout', () => {
        resetButton.style.backgroundColor = '#333';
    });
    
    resetButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        
        // 使用确认对话框，提供两个选项
        const choice = confirm('选择操作方式:\n\n点击"确定"添加缺失的默认翻译\n点击"取消"完全替换为默认翻译');
        
        if (choice) {
            // 添加缺失的默认翻译
            addDefaultTranslationsToEditor(textarea);
        } else {
            // 完全替换为默认翻译
            if (confirm('确定要完全替换为默认翻译吗？这将覆盖您所有的自定义翻译')) {
                textarea.value = defaultTranslations;
            }
        }
    });
    buttonContainer.appendChild(resetButton);
    
    // 保存按钮 - 改为黑灰风格
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = '保存翻译';
    saveButton.style.padding = '7px 14px'; // 减小内边距
    saveButton.style.backgroundColor = '#444';
    saveButton.style.color = '#ddd';
    saveButton.style.border = '1px solid #555';
    saveButton.style.borderRadius = '3px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.fontSize = '11px'; // 减小字体
    
    // 悬停效果
    saveButton.addEventListener('mouseover', () => {
        saveButton.style.backgroundColor = '#4c4c4c';
    });
    saveButton.addEventListener('mouseout', () => {
        saveButton.style.backgroundColor = '#444';
    });
    
    saveButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
    });
    buttonContainer.appendChild(saveButton);
    
    // 取消按钮 - 改为黑灰风格
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '7px 14px'; // 减小内边距
    cancelButton.style.backgroundColor = '#333';
    cancelButton.style.color = '#ccc';
    cancelButton.style.border = '1px solid #444';
    cancelButton.style.borderRadius = '3px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.fontSize = '11px'; // 减小字体
    
    // 悬停效果
    cancelButton.addEventListener('mouseover', () => {
        cancelButton.style.backgroundColor = '#3a3a3a';
    });
    cancelButton.addEventListener('mouseout', () => {
        cancelButton.style.backgroundColor = '#333';
    });
    
    cancelButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        document.body.removeChild(modal);
    });
    buttonContainer.appendChild(cancelButton);
    
    form.appendChild(buttonContainer);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 自动聚焦到文本区域
    textarea.focus();
    
    // 添加全局样式以修改webkit滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        #local-translation-editor-modal ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        #local-translation-editor-modal ::-webkit-scrollbar-track {
            background: #222;
            border-radius: 4px;
        }
        #local-translation-editor-modal ::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 4px;
        }
        #local-translation-editor-modal ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 解析本地翻译内容
 */
function parseLocalTranslations(content: string): void {
    // 清空现有翻译
    Object.keys(localTranslations).forEach(key => {
        delete localTranslations[key];
    });
    
    // 按行分割
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // 跳过空行
        
        // 按斜杠分割
        const parts = trimmedLine.split('/');
        if (parts.length < 2) continue; // 至少需要中文和一种其他语言
        
        const chineseText = parts[0].trim();
        if (!chineseText) continue; // 中文文本不能为空
        
        // 创建翻译映射
        localTranslations[chineseText] = {};
        
        // 添加各语言翻译
        if (parts[1] && parts[1].trim()) localTranslations[chineseText]['en'] = parts[1].trim();
        if (parts[2] && parts[2].trim()) localTranslations[chineseText]['ja'] = parts[2].trim();
        if (parts[3] && parts[3].trim()) localTranslations[chineseText]['ko'] = parts[3].trim();
        if (parts[4] && parts[4].trim()) localTranslations[chineseText]['es'] = parts[4].trim();
        if (parts.length > 5 && parts[5] && parts[5].trim()) localTranslations[chineseText]['fr'] = parts[5].trim();
        if (parts.length > 6 && parts[6] && parts[6].trim()) localTranslations[chineseText]['de'] = parts[6].trim();
    }
    
    // 保存到本地存储
    saveLocalTranslations();
}

/**
 * 将本地翻译格式化为编辑文本
 */
function formatLocalTranslationsForEdit(): string {
    return Object.entries(localTranslations).map(([chineseText, translations]) => {
        return `${chineseText}/${translations.en || ''}/${translations.ja || ''}/${translations.ko || ''}/${translations.es || ''}${translations.fr ? '/' + translations.fr : ''}${translations.de ? '/' + translations.de : ''}`;
    }).join('\n');
}

/**
 * 保存本地翻译到localStorage
 */
function saveLocalTranslations(): void {
    try {
        localStorage.setItem('pixelDoom_localTranslations', JSON.stringify(localTranslations));
        console.log(`已保存 ${Object.keys(localTranslations).length} 条本地翻译到存储`);
    } catch (error) {
        console.error('保存本地翻译失败:', error);
        throw new Error('无法保存翻译，可能是由于浏览器存储限制');
    }
}

/**
 * 从localStorage加载本地翻译
 */
function loadLocalTranslations(): void {
    try {
        // 首先加载默认翻译数据
        parseLocalTranslations(defaultTranslations);
        console.log(`已加载 ${Object.keys(localTranslations).length} 条默认翻译`);
        
        // 尝试从localStorage加载保存的翻译数据，合并到默认翻译中
        const savedData = localStorage.getItem('pixelDoom_localTranslations');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            
            // 合并保存的翻译到现有翻译
            Object.entries(parsed).forEach(([key, value]) => {
                localTranslations[key] = value as Record<string, string>;
            });
            
            console.log(`已从存储合并 ${Object.keys(parsed).length} 条本地翻译`);
        } else {
            console.log("未找到已保存的翻译，仅使用默认翻译");
        }
    } catch (error) {
        console.error('加载本地翻译失败:', error);
        // 加载失败时，至少确保默认翻译可用
        parseLocalTranslations(defaultTranslations);
    }
}

/**
 * 将默认翻译添加到编辑器中
 */
function addDefaultTranslationsToEditor(textarea: HTMLTextAreaElement): void {
    // 获取当前文本
    let currentText = textarea.value.trim();
    // 获取默认翻译
    const defaults = defaultTranslations.trim();
    
    // 如果当前已经有文本，并且末尾没有换行符，添加一个换行符
    if (currentText && !currentText.endsWith('\n')) {
        currentText += '\n';
    }
    
    // 将默认翻译逐行合并到当前文本中
    const defaultLines = defaults.split('\n');
    
    // 将当前文本拆分为行
    const currentLines = currentText ? currentText.split('\n') : [];
    const currentKeys = new Set(currentLines.map(line => {
        const parts = line.split('/');
        return parts[0]?.trim() || '';
    }).filter(key => key));
    
    // 添加默认翻译中不存在的行
    for (const line of defaultLines) {
        const key = line.split('/')[0]?.trim();
        if (key && !currentKeys.has(key)) {
            currentText += line + '\n';
        }
    }
    
    // 更新文本区域
    textarea.value = currentText;
}

/**
 * 初始化沉浸式翻译SDK
 */
function initImmersiveTranslateSDK(targetLang: string): void {
    // 移除之前可能存在的SDK脚本
    const oldScript = document.getElementById('immersive-translate-sdk');
    if (oldScript) {
        oldScript.remove();
    }
    
    // 设置SDK配置
    const sdkConfig = {
        isAutoTranslate: true,
        targetLanguage: SDK_LANGUAGE_MAP[targetLang] || 'en',
        sourceLanguage: 'zh-CN', // 指定源语言为中文
        detectLanguage: false, // 禁用语言检测，强制使用指定的源语言
        translationService: 'baidu', // 使用百度翻译作为后端服务，也可以根据需要更改
        noTargetLanguageUI: false, // 允许显示语言选择UI
        translationTheme: 'dual', // 设置双语对照模式
        translationAreaInvisible: false, // 确保翻译区域可见
        translationStartMode: 'instantTranslate', // 立即翻译模式
        pageRule: {
            selectors: ["body"], // 翻译整个页面
            excludeSelectors: [
                "#translation-ui-container", 
                "#translation-loader",
                "script", 
                "style"
            ], // 排除翻译工具UI
            atomicBlockSelectors: [".atomic-translation-block"], // 整体翻译的区域
            containerMinTextCount: 1, // 降低最小字符数，确保短文本也能被翻译
            paragraphMinTextCount: 1, // 降低段落最小字符数
            urlChangeDelay: 100 // 降低延迟时间
        },
        // 自定义样式，让双语显示更美观
        translationThemeCustomStyles: {
            dual: {
                "paddingBlock": "0.2em",
                "paddingInline": "0.2em",
                "marginBlock": "0.1em",
                "fontWeight": "normal",
                "fontSize": "1em",
                "lineHeight": "1.4",
                "color": "#e0e0e0",
                "backgroundColor": "rgba(40, 40, 40, 0.45)"
            }
        }
    };
    
    // 定义全局配置对象
    (window as any).immersiveTranslateConfig = sdkConfig;
    
    // 创建脚本元素
    const script = document.createElement('script');
    script.id = 'immersive-translate-sdk';
    script.async = true;
    script.src = 'https://download.immersivetranslate.com/immersive-translate-sdk-latest.js';
    
    // 添加到文档头部
    document.head.appendChild(script);
    
    // 显示加载提示
    showLoader(true, `Translating Chinese to ${getLangName(targetLang)} (dual-language mode)...`);
    
    console.log(`Initialized Immersive Translate SDK, source: Chinese, target: ${targetLang}, dual-language mode`);
    
    // 不再调用hideSDKUIElements，允许SDK UI显示
    // setTimeout(() => {
    //     hideSDKUIElements();
    // }, 5000);
}

/**
 * 隐藏SDK自带的UI元素
 * 注意：此函数已不再使用，保留作为参考
 */
function hideSDKUIElements(): void {
    // 寻找并隐藏SDK的语言选择等UI元素
    const sdkUI = document.querySelectorAll('[id^="immersive-translate-"]');
    sdkUI.forEach(el => {
        if (el.id !== 'immersive-translate-sdk' && el.tagName !== 'STYLE') {
            (el as HTMLElement).style.display = 'none';
        }
    });
    
    // 也可以通过CSS添加全局样式来隐藏
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .immersive-translate-popup,
        .immersive-translate-target-popup,
        .immersive-translate-ui {
            display: none !important;
        }
    `;
    document.head.appendChild(styleEl);
}

/**
 * 停止沉浸式翻译SDK
 */
function stopImmersiveTranslateSDK(): void {
    // 移除SDK脚本
    const sdkScript = document.getElementById('immersive-translate-sdk');
    if (sdkScript) {
        sdkScript.remove();
    }
    
    // 移除翻译相关元素
    const translatedElements = document.querySelectorAll('.immersive-translate-target');
    translatedElements.forEach(el => {
        el.remove();
    });
    
    // 移除翻译样式
    const styleElements = document.querySelectorAll('style[id^="immersive-translate-"]');
    styleElements.forEach(el => {
        el.remove();
    });
    
    // 移除可能添加的隐藏UI样式
    const hideUIStyle = document.querySelectorAll('style');
    hideUIStyle.forEach(el => {
        if (el.textContent && el.textContent.includes('immersive-translate-ui')) {
            el.remove();
        }
    });
    
    console.log('Stopped Immersive Translate SDK');
}

/**
 * 显示指向语言切换按钮的动画箭头
 */
function ShowArrowPointLanague(): void {
    console.log("Showing language selection arrow pointer");
    
    // 先检查箭头是否已存在
    if (document.getElementById('language-arrow-pointer')) {
        return; // 如果箭头已存在，不再创建
    }
    
    // 查找国旗按钮
    const flagButton = document.getElementById('translation-flag-button');
    if (!flagButton) {
        console.error("Flag button not found, cannot show arrow pointer");
        return;
    }
    
    // 创建箭头容器
    const arrowContainer = document.createElement('div');
    arrowContainer.id = 'language-arrow-pointer';
    arrowContainer.style.position = 'fixed';
    arrowContainer.style.zIndex = '999998'; // 低于国旗按钮
    arrowContainer.style.pointerEvents = 'none'; // 避免阻挡点击事件
    
    // 获取国旗按钮的位置
    const flagRect = flagButton.getBoundingClientRect();
    
    // 设置箭头位置
    arrowContainer.style.top = (flagRect.top + flagRect.height + 10) + 'px';
    arrowContainer.style.right = (window.innerWidth - flagRect.left - 10) + 'px';
    
    // 创建箭头元素
    const arrow = document.createElement('div');
    arrow.style.width = '20px';
    arrow.style.height = '20px';
    arrow.style.borderTop = '4px solid #ffcc00';
    arrow.style.borderRight = '4px solid #ffcc00';
    arrow.style.transform = 'rotate(-45deg)'; // 旋转使箭头指向右上
    arrow.style.display = 'inline-block';
    arrow.style.opacity = '0.9';
    arrow.style.filter = 'drop-shadow(0 0 3px rgba(0,0,0,0.5))';
    
    // 添加文字提示
    const textHint = document.createElement('div');
    textHint.textContent = 'Select your language';
    textHint.style.color = '#ffcc00';
    textHint.style.fontWeight = 'bold';
    textHint.style.fontSize = '14px';
    textHint.style.marginTop = '8px';
    textHint.style.textAlign = 'center';
    textHint.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
    textHint.style.whiteSpace = 'nowrap';
    
    // 添加元素到容器
    arrowContainer.appendChild(arrow);
    arrowContainer.appendChild(textHint);
    
    // 添加到文档
    document.body.appendChild(arrowContainer);
    
    // 添加上下浮动的动画
    let direction = 1;
    let position = 0;
    const bounceAnimation = setInterval(() => {
        position += 0.5 * direction;
        if (position >= 10 || position <= 0) {
            direction *= -1;
        }
        arrow.style.transform = `rotate(-45deg) translateY(${position}px)`;
    }, 30);
    
    // 添加闪烁效果
    let fadeDirection = -1;
    let opacity = 0.9;
    const fadeAnimation = setInterval(() => {
        opacity += 0.05 * fadeDirection;
        if (opacity <= 0.5) {
            fadeDirection = 1;
        } else if (opacity >= 0.9) {
            fadeDirection = -1;
        }
        arrowContainer.style.opacity = opacity.toString();
    }, 50);
    
    // 存储动画计时器ID
    (window as any).arrowAnimationTimers = {
        bounce: bounceAnimation,
        fade: fadeAnimation
    };
    
    // 在国旗按钮点击事件中移除箭头
    flagButton.addEventListener('click', hideLanguageArrow);
    
    // 5分钟后自动移除箭头
    setTimeout(hideLanguageArrow, 300000);
    
    // 窗口大小改变时更新箭头位置
    window.addEventListener('resize', updateArrowPosition);
}

/**
 * 隐藏语言切换箭头
 */
function hideLanguageArrow(): void {
    const arrowElement = document.getElementById('language-arrow-pointer');
    if (arrowElement) {
        arrowElement.style.opacity = '0';
        arrowElement.style.transition = 'opacity 0.5s ease';
        
        // 延迟移除元素
        setTimeout(() => {
            if (arrowElement.parentNode) {
                arrowElement.parentNode.removeChild(arrowElement);
            }
        }, 500);
        
        // 清除所有动画
        if ((window as any).arrowAnimationTimers) {
            clearInterval((window as any).arrowAnimationTimers.bounce);
            clearInterval((window as any).arrowAnimationTimers.fade);
            delete (window as any).arrowAnimationTimers;
        }
        
        // 移除事件监听器
        window.removeEventListener('resize', updateArrowPosition);
        
        // 移除点击事件监听
        const flagButton = document.getElementById('translation-flag-button');
        if (flagButton) {
            flagButton.removeEventListener('click', hideLanguageArrow);
        }
        
        console.log("Language arrow pointer hidden");
    }
}

/**
 * 更新箭头位置
 */
function updateArrowPosition(): void {
    const arrowElement = document.getElementById('language-arrow-pointer');
    const flagButton = document.getElementById('translation-flag-button');
    
    if (arrowElement && flagButton) {
        const flagRect = flagButton.getBoundingClientRect();
        arrowElement.style.top = (flagRect.top + flagRect.height + 10) + 'px';
        arrowElement.style.right = (window.innerWidth - flagRect.left - 10) + 'px';
    }
}

// 导出函数供外部使用
export { startTranslation as StartTranslate, ShowArrowPointLanague };