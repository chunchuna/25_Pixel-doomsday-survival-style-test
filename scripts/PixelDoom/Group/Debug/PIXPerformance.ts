import { hf_engine } from "../../../engine.js";

hf_engine.gl$_ubu_init(()=>{
    Performance.Showfps()


})

export class Performance {


     // FPS显示相关变量
     private static fpsDisplay: HTMLDivElement | null = null;
     private static lastFrameTime: number = 0;
     private static frameCount: number = 0;

     private static customFontPath: string = 'Font/ProggyClean.ttf'; // 自定义字体路径
     private static fontFamilyName: string = 'DebugUIFont'; // 字体族名称

    public static Showfps(){
        if (this.fpsDisplay) {
            return;
        }
    
        // 创建FPS显示元素
        this.fpsDisplay = document.createElement('div');
        this.fpsDisplay.id = 'debug-fps-display';
        this.fpsDisplay.style.position = 'fixed';
        this.fpsDisplay.style.top = '10px';
        this.fpsDisplay.style.right = '10px';
        this.fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.fpsDisplay.style.color = '#00ff00';
        this.fpsDisplay.style.padding = '5px 10px';
        this.fpsDisplay.style.borderRadius = '3px';
        this.fpsDisplay.style.zIndex = '9999999999999';
        this.fpsDisplay.style.fontFamily = `'${this.fontFamilyName}', monospace`;
        this.fpsDisplay.style.fontSize = '14px';
        this.fpsDisplay.style.pointerEvents = 'none';
    
        document.body.appendChild(this.fpsDisplay);
    
        this.lastFrameTime = performance.now();
        this.UpdateFPS();

    }

  
  private static UpdateFPS(): void {
      const now = performance.now();
      this.frameCount++;
  
      if (now >= this.lastFrameTime + 1000) {
          if (this.fpsDisplay) {
              const fps = this.frameCount;
              this.fpsDisplay.textContent = `FPS: ${fps}`;
              if (fps < 30) {
                  this.fpsDisplay.style.color = '#ff0000';
              } else if (fps < 50) {
                  this.fpsDisplay.style.color = '#ffff00';
              } else {
                  this.fpsDisplay.style.color = '#00ff00';
              }
          }
          this.frameCount = 0;
          this.lastFrameTime = now;
      }
  
      requestAnimationFrame(() => this.UpdateFPS());
  }
}

