import { Unreal__ } from "../../engine.js";



Unreal__.GameUpdate(() => {

	if(Unreal__.runtime.objects.SpriteAutoYsort.instances==null) return
	if(Unreal__.runtime.layout.name!="Level") return


	for (var SortObjects of Unreal__.OBJECT.SpriteAutoYsort.instances()) {
		SortObjects.instVars.GetYPosition = SortObjects.y
	}

	var SortObjectInstancesClass = Unreal__.OBJECT.SpriteAutoYsort.instances();
	//console.log(SortObjectInstancesClass)
	//@ts-ignore
	Unreal__.runtime.sortZOrder(SortObjectInstancesClass, (a: InstanceType.SpriteAutoYsort, b: InstanceType.SpriteAutoYsort) => a.instVars.GetYPosition - b.instVars.GetYPosition)
})

Unreal__.GameBegin(() => {
})

