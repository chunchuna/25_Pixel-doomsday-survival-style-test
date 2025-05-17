import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
interface SubtitleItem {
    element: HTMLElement;
    timer?: number;
}

var MAX_SUBTITLES = 5;
var subtitleItems: SubtitleItem[] = [];
var container: HTMLElement;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[UISubtitle] init")
    
    // 创建字幕容器
    container = document.createElement('div');
    container.id = 'subtitle-container';
    container.style.position = 'fixed';
    container.style.bottom = '10%';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '1000';
    container.style.width = '80%';
    container.style.textAlign = 'center';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    // 添加字幕样式
    const style = document.createElement('style');
    style.textContent = `
        .subtitle-item {
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            margin: 5px 0;
            border-radius: 20px;
            opacity: 50%;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            font-size: 18px;
            width: 200px;
            max-width: 260px;
            z-index: 1000;
            pointer-events: none;
            font-size:15px;
        }
        .subtitle-item.show {
            opacity: 1;
            transform: translateY(0);
        }
        .subtitle-item.hide {
            opacity: 0;
            transform: translateY(-20px);
        }
    `;
    document.head.appendChild(style);

    // UISubtitleMain.ShowSubtitles("测试字幕")
    // UISubtitleMain.ShowSubtitles("测试字幕2", 3)

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.addEventListener("load",(e)=>{
        console.log(container)
    })
    
})

export class UISubtitleMain {

    /**
     * 显示字幕
     * @param content 字幕内容
     * @param time 持续时间(秒)，如果不传则不会自动消失
     */
    static ShowSubtitles(content: string, time?: number): void {
        // 如果已经有5个字幕，移除最上面的一个
        if (subtitleItems.length >= MAX_SUBTITLES) {
            var topItem = subtitleItems.shift();
            if (topItem) {
                UISubtitleMain.hideAndRemoveSubtitle(topItem);
            }
        }

        // 移动现有字幕
        //UISubtitleMain.moveUpExistingSubtitles();

        // 创建新字幕
        var subtitleElement = document.createElement('div');
        subtitleElement.className = 'subtitle-item';
        subtitleElement.innerHTML = content;
        container.appendChild(subtitleElement);

        // 强制重绘，确保动画能播放
        void subtitleElement.offsetWidth;

        // 显示动画
        subtitleElement.classList.add('show');

        var newItem: SubtitleItem = { element: subtitleElement };

        // 如果有设置时间，设置定时器
        if (time && time > 0) {
            newItem.timer = window.setTimeout(() => {
                UISubtitleMain.hideAndRemoveSubtitle(newItem);
            }, time * 1000);
        }

        subtitleItems.push(newItem);
    }

    /**
     * 清除所有字幕
     */
    static ClearAllSubtitle(): void {
        while (subtitleItems.length > 0) {
            var item = subtitleItems.pop();
            if (item) {
                UISubtitleMain.hideAndRemoveSubtitle(item);
            }
        }
    }

    /**
     * 隐藏并移除字幕
     * @param item 字幕项
     */
    static hideAndRemoveSubtitle(item: SubtitleItem): void {
        if (item.timer) {
            clearTimeout(item.timer);
        }

        var index = subtitleItems.indexOf(item);
        if (index !== -1) {
            subtitleItems.splice(index, 1);
        }

        item.element.classList.remove('show');
        item.element.classList.add('hide');

        // 动画结束后移除元素
        item.element.addEventListener('transitionend', () => {
            item.element.remove();
        }, { once: true });
    }

    /**
     * 移动现有字幕向上
     */
    static moveUpExistingSubtitles(): void {
        subtitleItems.forEach(item => {
            // 如果有定时器，清除它（非持久字幕会被移除）
            if (item.timer) {
                clearTimeout(item.timer);
                UISubtitleMain.hideAndRemoveSubtitle(item);
            }
        });

        // 现在重新添加持久字幕（没有timer的）
        var persistentItems = subtitleItems.filter(item => !item.timer);
        subtitleItems.length = 0; // 清空数组

        persistentItems.forEach(item => {
            subtitleItems.push(item);
        });
    }

}

