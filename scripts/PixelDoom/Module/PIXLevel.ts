import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
var CameraZoomValue: number = 0.5;
var CameraZoomTarget = 0.5;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    
    if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name!="Level") return
    
    // 初始化时设置初始值
    CameraZoomValue = 1;
    CameraZoomTarget = 0.5; // 确保两个值初始一致
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;

    // 添加键盘事件监听，用于调整缩放
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') {
            CameraZoomTarget = Math.min(CameraZoomTarget + 0.1, 2.0);
        } else if (e.key === '-' || e.key === '_') {
            CameraZoomTarget = Math.max(CameraZoomTarget - 0.1, 0.2);
        }
    });

    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = 1;


})


pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

    if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name!="Level") return
    // 使用更合适的插值系数(0.05)来实现平滑过渡
    CameraZoomValue = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.Justlerp(CameraZoomValue, CameraZoomTarget, 0.05);
    //console.log("当前缩放: " + CameraZoomValue + ", 目标缩放: " + CameraZoomTarget);
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;

})

