import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";
var CameraZoomValue: number = 0.5;
var CameraZoomTarget = 0.5;

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // 初始化时设置初始值
    CameraZoomValue = 0.5;
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;
})

// 取消注释update函数，在每帧更新中执行Lerp
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {
    // 使用较小的插值系数(0.05)来实现平滑过渡
    CameraZoomValue = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.Justlerp(CameraZoomValue, CameraZoomTarget, 0.0005)
    console.log(CameraZoomValue)
    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.scale = CameraZoomValue;
})