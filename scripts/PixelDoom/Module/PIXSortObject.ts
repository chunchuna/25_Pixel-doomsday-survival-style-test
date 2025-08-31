import { hf_engine } from "../../engine.js";



hf_engine.gl$_ubu_update(() => {

	if(hf_engine.runtime.objects.SpriteAutoYsort.instances==null) return
	if(hf_engine.runtime.layout.name!="Level") return


	for (var SortObjects of hf_engine.OBJECT.SpriteAutoYsort.instances()) {
		SortObjects.instVars.GetYPosition = SortObjects.y
	}

	var SortObjectInstancesClass = hf_engine.OBJECT.SpriteAutoYsort.instances();
	//console.log(SortObjectInstancesClass)
	//@ts-ignore
	hf_engine.runtime.sortZOrder(SortObjectInstancesClass, (a: InstanceType.SpriteAutoYsort, b: InstanceType.SpriteAutoYsort) => a.instVars.GetYPosition - b.instVars.GetYPosition)
})

hf_engine.gl$_ubu_init(() => {
})

