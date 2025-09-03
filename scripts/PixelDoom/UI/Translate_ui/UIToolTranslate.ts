//@ts-nocheck
import { Unreal__ } from "../../../engine.js";

Unreal__.GameBegin(() => {
    console.log("开始初始化翻译工具");
    if(Unreal__.runtime.layout.name!="MainMenu") return
    createTranslateUI();
})

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

// 当前语言
let currentLanguage = 'zh-CN';

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
        title.textContent = 'Translate';
        title.style.color = '#ddd';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        title.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        title.style.paddingBottom = '8px';
        panel.appendChild(title);
        
        // SDK翻译按钮容器
        const sdkButtonContainer = document.createElement('div');
        sdkButtonContainer.style.marginBottom = '12px';
        
        // SDK翻译按钮 - 修改为"Launch translation"
        const sdkTranslateButton = document.createElement('button');
        sdkTranslateButton.textContent = 'Launch translation';
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
            // 默认使用英语作为目标语言
            const targetLang = 'en';
            
            // 使用沉浸式翻译SDK
            initImmersiveTranslateSDK(targetLang);
            
            // 收起面板
            togglePanel(false);
            
            // 显示提示弹窗
            showTranslationTipsModal();
        });
        sdkButtonContainer.appendChild(sdkTranslateButton);
        panel.appendChild(sdkButtonContainer);
        
        // 添加版本信息
        const versionInfo = document.createElement('div');
        versionInfo.textContent = 'by chunchun';
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
        
    } catch (error) {
        console.error("Failed to create translation UI:", error);
    }
}

/**
 * 显示翻译提示弹窗
 */
function showTranslationTipsModal(): void {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.id = 'translation-tips-modal';
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
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.4s ease';
    
    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'rgba(30,30,30,0.95)';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '85%';
    modalContent.style.transform = 'translateY(-20px)';
    modalContent.style.transition = 'transform 0.4s ease';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    modalContent.style.color = '#ddd';
    
    // 添加内容
    const content = document.createElement('div');
    content.style.marginBottom = '15px';
    content.style.lineHeight = '1.5';
    content.style.fontSize = '14px';
    content.innerHTML = `<div class="translation-guide" style="animation: fadeIn 0.5s ease-in;">
  <h3 style="color: #4CAF50; animation: pulse 2s infinite;">❗ addon Setup Guide</h3>
  <ol style="list-style-type: decimal; padding-left: 20px;">
    <li>After activation, locate the <span style="color: #FF5722;">addon icon</span> in the <span style="background: blue;">lower-right corner</span></li>
    <li>Click the icon and select the <span style="color: #2196F3;">⚙ settings gear</span></li>
    <li>Choose your native language in the configuration panel</li>
    <li style="border-left: 3px solid #9C27B0; padding-left: 10px;">
      Enable <span style="font-weight: bold;">Bilingual Mode</span> 
      <span style="color: #888;">(located left of "Show Original" button)</span>
    </li>
  </ol>

  <div style="background: #f8f9fa; padding: 10px; margin-top: 15px;">
    <p>✨ All features are <span style="color: #4CAF50; text-decoration: underline;">FREE</span> to use</p>
    <p>📧 Support: <a href="mailto:578806739@qq.com" style="color: #2196F3;"> chunchun_ 578806739@qq.com</a></p>
  </div>
</div>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.translation-guide {
  font-family: Arial, sans-serif;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}
</style>`;
    modalContent.appendChild(content);
    
    // 添加确认按钮
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.backgroundColor = '#333';
    okButton.style.color = '#fff';
    okButton.style.border = '1px solid #444';
    okButton.style.padding = '8px 20px';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.style.float = 'right';
    okButton.style.marginTop = '5px';
    okButton.style.transition = 'background-color 0.2s ease';
    
    // 添加悬停效果
    okButton.addEventListener('mouseover', () => {
        okButton.style.backgroundColor = '#444';
    });
    
    okButton.addEventListener('mouseout', () => {
        okButton.style.backgroundColor = '#333';
    });
    
    // 关闭模态框
    okButton.addEventListener('click', () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(-20px)';
        
        // 延迟移除元素
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 400);
    });
    
    modalContent.appendChild(okButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 触发过渡效果
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
    
    // 点击模态框背景关闭
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.opacity = '0';
            modalContent.style.transform = 'translateY(-20px)';
            
            // 延迟移除元素
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 400);
        }
    });
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
                "#translation-tips-modal",
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
    
    console.log(`Initialized Immersive Translate SDK, source: Chinese, target: ${targetLang}, dual-language mode`);
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

// 导出函数供外部使用
export { initImmersiveTranslateSDK as StartTranslate };