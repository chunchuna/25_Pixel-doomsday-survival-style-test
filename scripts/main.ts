
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";

import "./engine.js"

import "./PixelDoom/UI/font/font.js"

import "./PixelDoom/Global/PIXGlobal.js"

import "./PixelDoom/Module/PIXCommandAddon.js"
import "./PixelDoom/Group/Save/PIXSave.js"

import "./PixelDoom/Module/PIXLevel.js"
import "./PixelDoom/Module/PIXCharacterController.js"
import "./PixelDoom/Module/PIXCharacterAnimation.js"

import "./PixelDoom/Module/PIXWeather.js"
import "./PixelDoom/Module/PIXAudio.js"
import "./PixelDoom/Module/PIXCharacterAudio.js"
import "./PixelDoom/Module/PIXSortObject.js"
import "./PixelDoom/Module/PIXClickObject.js"
import "./PixelDoom/Module/PIXAmbientLight.js"
// ClickObject
import "./PixelDoom/Group/ClickObject/PIXClickObjectItem_LuYingYi.js"
import "./PixelDoom/Group/ClickObject/PIXClickObjectCommonObject.js"
import "./PixelDoom/Group/ClickObject/PIXClickObjectItem_ZhangPeng.js"
import "./PixelDoom/Group/Player/PIXPlayerInventory.js"
import "./PixelDoom/Group/PIXGroupAmbientSoundEffect.js"
import "./PixelDoom/Group/Debug/PIXDebugMode.js"






//UI
import "./PixelDoom/UI/imgui_lib/imgui.js"
import "./PixelDoom/UI/debug_ui/UIvariableMonitoring.js"
import "./PixelDoom/UI/debug_ui/UIDbugButton.js"
import "./PixelDoom/UI/debug_ui/UIConsole.js"
import "./PixelDoom/UI/window_lib_ui/UIWindowLib.js"
import "./PixelDoom/UI/interaction_panel_action_choose_ui/UIInteractionPanelActionChoose.js"
import "./PixelDoom/UI/interaction_panel_action_choose_ui/UIInteractionPane_imgui.js"
import "./PixelDoom/UI/subtitle_ui/UISubtitle.js"
import "./PixelDoom/UI/dialogue_ui/UIDialogue.js"


import "./PixelDoom/UI/Translate_ui/UIToolTranslate.js"
import "./PixelDoom/UI/MainMenu_ui/UIMainMenu.js"

import "./PixelDoom/UI/inventory_ui/UIInventory.js"
import "./PixelDoom/UI/screeneffect_ui/UIScreenEffect.js"
import "./PixelDoom/UI/debug_ui/UIDebug.js"


import "./PixelDoom/Group/Debug/PIXDebugMode.js"
import "./PixelDoom/UI/tweak_ui/tweak_window_test.js"

import "./PixelDoom/UI/time_cd_ui/UICd.js"

import "./PixelDoom/Group/GouHuo/PIXGouHuo.js"
import "./PixelDoom/UI/bubble_ui/UIBubble.js"

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
