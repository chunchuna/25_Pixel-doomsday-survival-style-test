import { hf_engine } from "../../engine.js";
import { UIWindowLib } from "../UI/window_lib_ui/UIWindowLib.js";

export enum GAME_TYPE {
    LEVEL = "Level",
    MAIN_MENU = "MainMenu"
}


export function showImageWindow(
    imageUrl: string,
    title: string = "图片查看器",
    width: number = 600,
    height: number = 500
) {
   
    const { windowElement, contentElement, close } = UIWindowLib.createWindow(
        title,
        width,
        height,
        1.0 
    );

  
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

hf_engine.gl$_ubu_init(() => {
    //showImageWindow("Resource/Tree.png")

})