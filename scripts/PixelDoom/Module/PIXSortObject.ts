import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../engine.js";



pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_update(() => {

	if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.objects.SpriteAutoYsort.instances==null) return
	if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name!="Level") return


	for (var SortObjects of pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.OBJECT.SpriteAutoYsort.instances()) {
		SortObjects.instVars.GetYPosition = SortObjects.y
	}

	var SortObjectInstancesClass = pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.OBJECT.SpriteAutoYsort.instances();
	//console.log(SortObjectInstancesClass)
	//@ts-ignore
	pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.sortZOrder(SortObjectInstancesClass, (a: InstanceType.SpriteAutoYsort, b: InstanceType.SpriteAutoYsort) => a.instVars.GetYPosition - b.instVars.GetYPosition)
})

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
})

