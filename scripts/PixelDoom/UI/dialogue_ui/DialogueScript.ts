import { Unreal__ } from "../../../engine.js"
import { DialogueSystem } from "./UIDialogue.js"

export var DIA_CONTENT_test001 = `左->篝火余烬中飘起一缕青烟
右->（蹲下捻动炭灰）这堆火最多半小时前还有人...
左->潮湿的松针地上散落着登山绳和空罐头
左->choose:拨开灰烬检查
	右->（金属反光）烧烤架底下压着半块没烧完的薯片包装
	左->包装袋边缘沾着暗红色痕迹
右->（用树枝挑起）番茄酱？还是...血迹？
左->choose:查看登山绳断口
	右->断茬参差不齐，像是被岩石磨断的
	左->十米外灌木丛挂着断裂的绳头
左->continue
左->北面斜坡传来乌鸦刺耳的叫声
右->（握紧手电筒）这种季节不该有乌鸦聚集...
左->choose:走向斜坡查看
	右->（踢到碎石）等等！泥土里有指甲抓挠的痕迹！
	左->陡坡下方三米处卡着撕裂的冲锋衣碎片
左->choose:冒险攀下去
	右->（摸到岩石裂缝）这是...塞在石缝里的瑞士军刀？
	左->刀柄刻着"J&M 2023"的字样
右->（转动刀身）两个字母缩写，是情侣纪念品？
左->continue
左->东南方突然响起树枝断裂声
右->（躲到树后）脚步声！是熊？还是...
左->choose:屏息观察
	右->（瞳孔收缩）那件荧光绿外套！和游客中心失踪告示上的一样
	左->人影踉跄着消失在迷雾中
左->choose:追踪荧光绿身影
	右->（踩到软物）等等！树根下埋着数码相机
	左->储存卡最后视频是摇晃镜头里的狼嚎声
右->（擦掉镜头水渍）凌晨三点拍的，他们到底遭遇了什么？
左->浓雾中传来似人非人的呜咽
左->choose:打开相机闪光灯示警
	右->（强光刺破雾气）二十米外躺着昏迷的登山者！
	左->他手腕缠着用衬衣做的简陋止血带
	左->choose:检查止血带
		右->等等...这个蝴蝶结打法，和我在军校学的战场包扎术一模一样
	`

export var DIA_CONTENT_test002 = `
右->这里已经进入到通过代码强行转到了第二个事件脚本
左->choose:切回到第一个脚本
	左->现在切换到第一个事件脚本[code-(code_goto_testscript_001())]
左->choose:测试按钮
	左->这里显示别的测试按钮
	左->choose:测试按钮2
	左->choose:测试按钮3
		左->这里显示别的测试按钮剩余的
		左->choose:你好4
左->结束测试`


export var DIA_CONTENT_LUYINGYI_01=`左->一张湿漉漉的露营椅子...
右->choose:蹲下来查看
	左->昨晚下了雨，露营椅子沾满了雨水
右->choose:挪动
	左->被固定在了泥土里，无法挪动
右->choose:离开
`

async function code_goto_testscript_002() {
	try {
		// 第一步：关闭当前对话
		// @ts-ignore
		DialogueMainController.CloseDialogue()
		
		// 等待DOM更新和动画完成
		await Unreal__.WAIT_TIME_FORM_PROMISE(0.5)
		
		// 强制DOM刷新 - 在不同的浏览器中可能有效率差异
		void document.body.offsetHeight;
		
		// 第二步：加载新对话
		// @ts-ignore
		DialogueMainController.ShowDialogue(DIA_CONTENT_test002)
	} catch (error) {
		console.error("对话跳转错误:", error);
	}
}

async function code_goto_testscript_001() {
	try {
		// 第一步：关闭当前对话
		// @ts-ignore
		DialogueMainController.CloseDialogue()
		
		// 等待DOM更新和动画完成
		await Unreal__.WAIT_TIME_FORM_PROMISE(0.5)
		
		// 强制DOM刷新 - 在不同的浏览器中可能有效率差异
		void document.body.offsetHeight;
		
		// 第二步：加载新对话
		// @ts-ignore
		DialogueMainController.ShowDialogue(DIA_CONTENT_test001)
	} catch (error) {
		console.error("对话跳转错误:", error);
	}
}

Unreal__.GameBegin(() => {
	(window as any).code_goto_testscript_002 = code_goto_testscript_002;
	(window as any).code_goto_testscript_001 = code_goto_testscript_001;
})
