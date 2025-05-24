import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

  const font_style = document.createElement('style')
  font_style.innerHTML =
    `
 @font-face {
    font-family: 'c3-font'; 
    src: url('/Font/ProggyClean.ttf') format('truetype'); 
  }

  * {
    font-family: 'c3-font', sans-serif !important;
  }
  
  
  body * ,
  .ui-widget,
  .ui-widget *,
  canvas {
    font-family: 'c3-font', sans-serif !important;
  }
  `
  document.head.appendChild(font_style);
  document.fonts.ready.then(() => {
    console.log("font is loaded!");

    // 检查特定字体是否可用
    if (document.fonts.check("12px 'c3-font'")) {
      console.log("c3-font");
    } else {
      console.error("c3-font");
    } // 列出所有已加载的字体
    document.fonts.forEach((font) => {
      console.log(`load font: ${font.family}, state: ${font.status}`);
    });
  });

  console.log("font load@！")
})
