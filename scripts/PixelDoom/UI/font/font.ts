import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { UISubtitleMain } from "../subtitle_ui/UISubtitle.js";


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {

  const font_style = document.createElement('style')
  font_style.innerHTML =
    `
 @font-face {
    font-family: 'c3-font';  /* 自定义字体名称 */
    src: url('/Font/ProggyClean.ttf') format('truetype'); /* 字体文件路径 */
  }

  * {
    font-family: 'c3-font', sans-serif !important;
  }
  
  /* 针对Construct 3的UI元素添加更具体的选择器 */
  body, 
  body * ,
  .ui-widget,
  .ui-widget *,
  canvas {
    font-family: 'c3-font', sans-serif !important;
  }
  `
  document.head.appendChild(font_style);
  document.fonts.ready.then(() => {
    console.log("字体加载完成，检查字体状态...");
    
    // 检查特定字体是否可用
    if (document.fonts.check("12px 'c3-font'")) {
      console.log("c3-font");
    } else {
      console.error("c3-font");
    } // 列出所有已加载的字体
    document.fonts.forEach((font) => {
      console.log(`已加载字体: ${font.family}, 状态: ${font.status}`);
    });
  });

  console.log("成功加载自定义字体")
})
