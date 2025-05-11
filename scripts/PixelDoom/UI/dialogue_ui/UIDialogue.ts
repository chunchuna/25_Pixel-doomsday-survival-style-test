import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    console.log("[UIDialogue] init")

    // dialogueSystem.dialogueContainer = document.getElementById('dialogueContent') as HTMLElement;
    // dialogueSystem.dialogueContainer = document.getElementById('dialogueContainer') as HTMLElement;
    // dialogueSystem.scrollBar = document.getElementById('scrollBar') as HTMLElement;

    // document.addEventListener('keydown', (e) => {
    //     if (e.code === 'Space' && dialogueSystem.isTyping && dialogueSystem.currentTypingElement) {
    //         dialogueSystem.completeTyping();
    //     }
    // });
    // 初始化对话系统（如果还没初始化）
    const dialogueSystem = new UIDialogue();

    // 调用方法
    dialogueSystem.ShowDialogue(`左->你到达了一个公园，这里看起来荒废很久。
    右->史丹利:看起来是一个不错的公园呢。
    左->choose:查看下周围
        左->你选择了下车
    左->choose:观察下公车的车牌号
        左->车牌号非常的好记，你记了下来
    左->choose:继续呆在车上
         左->车上有点无聊
        左->choose:下车
        左->choose:看看手机的电量`);
})

interface DialogueNode {
    side: 'left' | 'right';
    content: string;
    choices?: DialogueChoice[];
    isChoice?: boolean;
}

interface DialogueChoice {
    text: string;
    nextNodes: DialogueNode[];
}

class UIDialogue {
    public dialogueContent: HTMLElement;
    public dialogueContainer: HTMLElement;

    // @ts-ignore
    public scrollBar: HTMLElement;
    public currentTypingInterval: number | null = null;
    public currentTypingElement: HTMLElement | null = null;
    public isTyping = false;
    public dialogueStack: DialogueNode[] = [];
    private dialogueQueue: DialogueNode[] = []; // 存储待显示的对话
    private currentChoices: DialogueChoice[] | null = null; // 存储当前选项

    constructor() {
        this.dialogueContent = document.getElementById('dialogueContent') as HTMLElement;
        this.dialogueContainer = document.getElementById('dialogueContainer') as HTMLElement;

        // 监听空格键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // 防止空格键滚动页面
                this.handleSpaceKey();
                alert("你按下了空格")
                if (this.isTyping) {
                    this.completeTyping(); // 如果正在打字，立即完成
                } else if (this.dialogueQueue.length > 0) {
                    this.displayNextNode(); // 否则继续下一句
                } else if (this.currentChoices) {
                    // 已经显示选项，不做处理
                } else {
                    // 对话结束
                }
            }
        });
    }

    private handleSpaceKey(): void {
        if (this.isTyping) {
            // 情况1：如果正在打字，立即完成当前行
            this.completeTyping();
        } else {
            // 情况2：如果打字已完成，进入下一行
            this.displayNextNode();
        }
    }


    public ShowDialogue(content: string): void {
        this.dialogueContainer.classList.add('visible');
        const parsedDialogue = this.parseDialogue(content);
        this.dialogueQueue = parsedDialogue;
        this.displayNextNode(); // 开始显示第一条
    }

    private displayNextNode(): void {
        if (this.dialogueQueue.length === 0) {
            if (this.currentChoices) {
                this.displayChoices(this.currentChoices); // 显示选项
                this.currentChoices = null;
            }
            return;
        }

        const node = this.dialogueQueue.shift()!; // 取出下一条

        if (node.isChoice) {
            // 如果是选项，先存储，等普通对话结束后再显示
            if (!this.currentChoices) {
                this.currentChoices = [];
            }
            this.currentChoices.push({
                text: node.content,
                nextNodes: node.choices?.[0]?.nextNodes || []
            });
            this.displayNextNode(); // 继续下一条
        } else {
            // 普通对话，显示
            this.displayNode(node);
        }
    }


    public ClearDialogue(): void {
        this.dialogueContent.innerHTML = '';
        this.dialogueStack = [];
        if (this.currentTypingInterval) {
            clearInterval(this.currentTypingInterval);
            this.currentTypingInterval = null;
        }
        this.isTyping = false;
        this.currentTypingElement = null;
    }

    public CloseDialogue(): void {
        this.ClearDialogue();
        this.dialogueContainer.classList.remove('visible');
    }

    private parseDialogue(content: string): DialogueNode[] {
        const lines = content.split('\n');
        const rootNodes: DialogueNode[] = [];
        const stack: { node: DialogueNode; indent: number }[] = [];
        let currentIndent = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const indent = line.search(/\S/);
            const trimmedLine = line.trim();
            const [sidePart, contentPart] = trimmedLine.split('->');

            if (!sidePart || !contentPart) continue;

            const side = sidePart.trim() as 'left' | 'right';
            const content = contentPart.trim();

            if (content.startsWith('choose:')) {
                const choiceText = content.substring(7).trim();
                const choiceNode: DialogueNode = {
                    side,
                    content: choiceText,
                    isChoice: true
                };

                if (indent > currentIndent && stack.length > 0) {
                    const parent = stack[stack.length - 1].node;
                    if (!parent.choices) {
                        parent.choices = [];
                    }
                    parent.choices.push({
                        text: choiceText,
                        nextNodes: []
                    });
                    stack.push({ node: choiceNode, indent });
                } else {
                    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
                        stack.pop();
                    }
                    if (stack.length > 0) {
                        const parent = stack[stack.length - 1].node;
                        if (!parent.choices) {
                            parent.choices = [];
                        }
                        parent.choices.push({
                            text: choiceText,
                            nextNodes: []
                        });
                    }
                    stack.push({ node: choiceNode, indent });
                }
                currentIndent = indent;
            } else {
                const newNode: DialogueNode = {
                    side,
                    content
                };

                if (indent > currentIndent && stack.length > 0) {
                    const parent = stack[stack.length - 1].node;
                    if (parent.choices && parent.choices.length > 0) {
                        parent.choices[parent.choices.length - 1].nextNodes.push(newNode);
                    }
                } else {
                    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
                        stack.pop();
                    }
                    if (stack.length > 0) {
                        const parent = stack[stack.length - 1].node;
                        if (parent.choices && parent.choices.length > 0) {
                            parent.choices[parent.choices.length - 1].nextNodes.push(newNode);
                        }
                    } else {
                        rootNodes.push(newNode);
                    }
                }
                stack.push({ node: newNode, indent });
                currentIndent = indent;
            }
        }

        return rootNodes;
    }

    private displayNodes(node: DialogueNode): void {
        const messageElement = document.createElement('div');
        messageElement.className = `${node.side}-message`;
        this.dialogueContent.appendChild(messageElement);
        this.typeText(messageElement, node.content);
        this.scrollToBottom();
    }

    public displayNode(node: DialogueNode): void {
        const messageElement = document.createElement('div');
        messageElement.className = `${node.side}-message`;

        if (node.isChoice) return;

        this.dialogueContent.appendChild(messageElement);
        this.typeText(messageElement, node.content);
        this.scrollToBottom();
    }

    public displayChoices(choices: DialogueChoice[]): void {
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'choices-container';

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.addEventListener('click', () => {
                this.dialogueContent.removeChild(choicesContainer);
                this.dialogueQueue = choice.nextNodes;
                this.displayNextNode(); // 选择后继续显示后续对话
            });
            choicesContainer.appendChild(button);
        });

        this.dialogueContent.appendChild(choicesContainer);
        this.scrollToBottom();
    }

    public typeText(element: HTMLElement, text: string): void {
        let i = 0;
        element.setAttribute('data-fulltext', text); // 存储完整文本
        element.classList.add('typing');
        this.isTyping = true;
        this.currentTypingElement = element;

        this.currentTypingInterval = window.setInterval(() => {
            if (i < text.length) {
                element.textContent = text.substring(0, i + 1);
                i++;
                this.scrollToBottom();
            } else {
                this.completeTyping();
            }
        }, 30);
    }

    public completeTyping(): void {
        if (this.currentTypingInterval) {
            clearInterval(this.currentTypingInterval);
            this.currentTypingInterval = null;
        }
        if (this.currentTypingElement) {
            // 确保文本完整显示
            const fullText = this.currentTypingElement.getAttribute('data-fulltext') || '';
            this.currentTypingElement.textContent = fullText;
            this.currentTypingElement.classList.remove('typing');
            this.currentTypingElement = null;
        }
        this.isTyping = false;
    }

    private scrollToBottom(): void {
        this.dialogueContent.scrollTop = this.dialogueContent.scrollHeight;
    }
}

// Initialize the dialogue system
//const dialogueSystem = new UIDialogue();

pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // Example initialization
    // You can add any initialization code here if needed dialogueSystem.ShowDialogue(`


});

// Export functions for global access
// (window as any).ShowDialogue = (content: string) => dialogueSystem.ShowDialogue(content);
// (window as any).ClearDialogue = () => dialogueSystem.ClearDialogue();
// (window as any).CloseDialogue = () => dialogueSystem.CloseDialogue();