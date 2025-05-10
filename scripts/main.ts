
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

import "./engine.js"

import "./PixelDoom/Module/PIXCommandAddon.js"


import "./PixelDoom/Module/PIXLevel.js"
import "./PixelDoom/Module/PIXCharacterController.js"
import "./PixelDoom/Module/PIXCharacterAnimation.js"

import "./PixelDoom/Module/PIXWeather.js"
import "./PixelDoom/Module/PIXAudio.js"
import "./PixelDoom/Module/PIXCharacterAudio.js"

import "./PixelDoom/Group/PIXGroupAmbientSoundEffect.js"
import "./PixelDoom/Module/PIXSortObject.js"

import "./PixelDoom/Module/PIXClickObject.js"
// ClickObject
import "./PixelDoom/Group/ClickObject/PIXClickObjectItem_LuYingYi.js"

runOnStartup(async runtime => {
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.

	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime: IRuntime) {
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.

	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime: IRuntime) {
	// Code to run every tick
}
