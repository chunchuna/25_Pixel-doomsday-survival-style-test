import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
import { UIWindowLib } from "../UI/window_lib_ui/UIWindowLib.js";

export enum GAME_TYPE {
    LEVEL = "Level",
    MAIN_MENU = "MainMenu"
}

/**
 * 在屏幕中心创建一个显示图片的窗口
 * @param imageUrl 图片的URL或路径
 * @param title 窗口标题，默认为"图片查看器"
 * @param width 窗口宽度，默认为600
 * @param height 窗口高度，默认为500
 * @returns 窗口控制对象，包含窗口元素、内容元素和关闭函数
 */
export function showImageWindow(
    imageUrl: string,
    title: string = "图片查看器",
    width: number = 600,
    height: number = 500
) {
    // 创建窗口
    const { windowElement, contentElement, close } = UIWindowLib.createWindow(
        title,
        width,
        height,
        1.0 // 不透明度
    );

    // 设置图片容器样式
    contentElement.innerHTML = `
        <style>
            .image-container {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
            }
            
            .image-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        </style>
        
        <div class="image-container">
            <img src="${imageUrl}" alt="${title}" />
        </div>
    `;

    return { windowElement, contentElement, close };
}

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    showImageWindow("Resource/Tree.png")

})