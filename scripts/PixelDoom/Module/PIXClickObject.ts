import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
	console.log("[ClickObject] init")
})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
	// 鼠标悬浮在交互物体上
	pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject",(e:any)=>{
		console.log("[ClickObject] Mouse Over Object")
	})
	
	
	// 鼠标离开交互物体

	pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_call_eventhandle_("ClickObject:MouseOverObject-none",(e:any)=>{
		console.log("[ClickObject] Mouse Over Object -NONE")
	})
})