import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";


var DialogueMainController:DialogueSystem;
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(()=>{
    // 任何初始化的时候 都注册一下
    // if(pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.layout.name!="Level") return
    (window as any).DialogueMainController = new DialogueSystem();
    DialogueMainController = (window as any).DialogueMainController;
    
    // Add global wrapper functions for event callbacks
    (window as any).OnDialogueOpen = (callback: () => void) => {
        DialogueMainController.OnDialogueOpen(callback);
    };
    
    (window as any).OnDialogueClose = (callback: () => void) => {
        DialogueMainController.OnDialogueClose(callback);
    };
})



interface DialogueLine {
    text: string;
    position: 'left' | 'right';
    character?: string;
    choices?: DialogueChoice[];
    code?: string; 
}

interface DialogueChoice {
    text: string;
    nextLines: DialogueLine[];
}


export class DialogueSystem {
    private dialoguePanel!: HTMLElement;
    private dialogueContent!: HTMLElement;
    private choicesContainer!: HTMLElement;
    private closeButton!: HTMLElement;
    private isTyping: boolean = false;
    private typewriterSpeed: number = 30; // Typewriter effect speed (ms)
    private mainDialogueLines: DialogueLine[] = []; // Store main dialogue flow
    private currentMainIndex: number = 0; // Current main dialogue index
    private isInitialized: boolean = false; // Track if DOM elements are created
    
    // Event callback arrays
    private onDialogueOpenCallbacks: (() => void)[] = [];
    private onDialogueCloseCallbacks: (() => void)[] = [];

    constructor() {
        // Don't create UI elements immediately - only create when needed
        // Add keyboard event listener for space key
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && this.isTyping && this.isDialogueVisible()) {
                this.completeCurrentTyping();
            }
        });

        // Test buttons - only if they exist
        document.getElementById('test-dialogue')?.addEventListener('click', () => {
            const testContent = ``;
            console.log("Starting dialogue parsing:\n" + testContent);
            this.ShowDialogue(testContent);
        });

        document.getElementById('clear-dialogue')?.addEventListener('click', () => {
            this.ClearDialogue();
        });

        document.getElementById('close-dialogue')?.addEventListener('click', () => {
            this.CloseDialogue();
        });
    }

    // Check if dialogue is currently visible
    private isDialogueVisible(): boolean {
        return this.isInitialized && this.dialoguePanel && this.dialoguePanel.classList.contains('active');
    }

    // Create dialogue UI elements only when needed
    private createDialogueUI(): void {
        if (this.isInitialized) {
            return; // Already created
        }

        // Create dialogue panel
        this.dialoguePanel = document.createElement('div');
        this.dialoguePanel.id = 'dialogue-panel';
        
        // Initially hide the panel completely
        this.dialoguePanel.style.display = 'none';
        this.dialoguePanel.style.pointerEvents = 'none'; // Prevent blocking other elements
        
        // Create dialogue header
        const dialogueHeader = document.createElement('div');
        dialogueHeader.id = 'dialogue-header';
        
        // Create title
        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = 'Dialogue';
        dialogueHeader.appendChild(title);
        
        // Create control buttons container
        const controlsElement = document.createElement('div');
        controlsElement.className = 'dialogue-controls';
        
        // Create minimize button
        const minimizeButton = document.createElement('div');
        minimizeButton.id = 'minimize-button';
        minimizeButton.textContent = '_';
        controlsElement.appendChild(minimizeButton);
        
        // Create close button
        this.closeButton = document.createElement('div');
        this.closeButton.id = 'close-button';
        this.closeButton.textContent = '×';
        controlsElement.appendChild(this.closeButton);
        
        // Add control buttons container to header
        dialogueHeader.appendChild(controlsElement);
        
        // Create dialogue content area
        this.dialogueContent = document.createElement('div');
        this.dialogueContent.id = 'dialogue-content';
        
        // Create choices container
        this.choicesContainer = document.createElement('div');
        this.choicesContainer.id = 'choices-container';
        
        // Create resize corner
        const resizerElement = document.createElement('div');
        resizerElement.className = 'dialogue-resizer';
        
        // Resize corner icon
        const resizerIcon = document.createElement('div');
        resizerIcon.className = 'resizer-icon';
        resizerElement.appendChild(resizerIcon);
        
        // Assemble dialogue panel
        this.dialoguePanel.appendChild(dialogueHeader);
        this.dialoguePanel.appendChild(this.dialogueContent);
        this.dialoguePanel.appendChild(this.choicesContainer);
        this.dialoguePanel.appendChild(resizerElement);
        
        // Add to document
        document.body.appendChild(this.dialoguePanel);
        
        // Add styles
        this.addDialogueStyles();
        
        // Add drag functionality
        this.enableWindowDrag(this.dialoguePanel, dialogueHeader);
        
        // Add resize functionality
        this.enableWindowResize(this.dialoguePanel, resizerElement);
        
        // Bind minimize button click event
        let isMinimized = false;
        const originalHeight = this.dialoguePanel.offsetHeight;
        
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (isMinimized) {
                // Expand window
                this.dialoguePanel.style.height = `${originalHeight}px`;
                this.dialogueContent.style.display = 'block';
                this.choicesContainer.style.display = 'flex';
                resizerElement.style.display = 'block';
            } else {
                // Collapse window
                this.dialoguePanel.style.height = `${dialogueHeader.offsetHeight}px`;
                this.dialogueContent.style.display = 'none';
                this.choicesContainer.style.display = 'none';
                resizerElement.style.display = 'none';
            }
            isMinimized = !isMinimized;
        });
        
        // Bring window to front when clicked
        this.dialoguePanel.addEventListener('mousedown', () => {
            this.bringToFront();
        });

        // Add close button event
        this.closeButton.addEventListener('click', () => {
            this.CloseDialogue();
        });

        this.isInitialized = true;
    }
    
    // 添加对话系统的样式
    private addDialogueStyles(): void {
        const style = document.createElement('style');
        style.setAttribute('data-dialogue-style', 'true');
        style.textContent = `
#dialogue-panel {
    position: fixed;
    bottom: 50%;
    left: 50%;
    width: 380px;
    max-width: 600px;
    min-width: 280px;
    height: 400px;
    min-height: 300px;
    background-color: rgba(0, 0, 0, 0.92);
    border: 1px solid #333333;
    border-radius: 2px;
    display: none;
    flex-direction: column;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: transform 0.2s ease, opacity 0.2s ease;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    font-family: Arial, sans-serif;
    pointer-events: none;
}

#dialogue-panel.active {
    display: flex;
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
}

#dialogue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background-color: rgba(34, 34, 34, 0.95);
    border-bottom: 1px solid #333;
    height: 24px;
    cursor: move;
    user-select: none;
}

.title {
    font-weight: 400;
    color: #e0e0e0;
    font-size: 11px;
}

.dialogue-controls {
    display: flex;
    gap: 6px;
}

#minimize-button,
#close-button {
    background: none;
    border: none;
    color: #aaa;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
    padding: 0 6px;
    width: 14px;
    height: 14px;
    text-align: center;
    line-height: 14px;
}

#minimize-button {
    line-height: 10px;
}

#minimize-button:hover {
    color: #fff;
    background-color: #555;
}

#close-button:hover {
    color: #fff;
    background-color: #c14545;
}

#dialogue-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    scrollbar-width: thin;
    scrollbar-color: #666 #222;
    font-size: 13px;
    z-index:1001;
}

#dialogue-content::-webkit-scrollbar {
    width: 8px;
}

#dialogue-content::-webkit-scrollbar-track {
    background: #000000;
}

#dialogue-content::-webkit-scrollbar-thumb {
    background-color: #333333;
    border-radius: 2px;
}

.dialogue-line {
    margin-bottom: 10px;
    padding: 6px 10px;
    border-radius: 2px;
    max-width: 85%;
    position: relative;
    animation: fadeIn 0.3s ease;
    font-size: 13px;
    line-height: 1.4;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dialogue-left {
    background-color: #1a1a1a;
    color: #e0e0e0;
    align-self: flex-start;
    margin-right: auto;
    border-left: 2px solid #3a4a65;
}

.dialogue-right {
    background-color: #2a2a2a;
    color: #e0e0e0;
    align-self: flex-end;
    margin-left: auto;
    border-right: 2px solid #569cd6;
    text-align: right;
}

.character-name {
    font-weight: bold;
    color: #569cd6;
    margin-right: 5px;
    font-size: 12px;
    display: inline-block;
    padding-bottom: 3px;
    border-bottom: 1px solid rgba(86, 156, 214, 0.3);
}

.dialogue-right .character-name {
    color: #4ec9b0;
    border-bottom: 1px solid rgba(78, 201, 176, 0.3);
}

#choices-container {
    display: flex;
    flex-direction: column;
    padding: 8px 10px;
    gap: 6px;
    background-color: rgba(0, 0, 0, 0.85);
    border-top: 1px solid #222;
}

.choice-button {
    background-color:rgb(0, 0, 0);
    color: #e0e0e0;
    border: 1px solid rgb(36, 36, 36);
    padding: 8px 10px;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    border-radius: 2px;
    font-size: 13px;
}

.choice-button:hover {
    background-color:rgb(65, 65, 65);
    color: #fff;
    border-color: rgb(36, 36, 36);
}

.continue-prompt {
    text-align: center;
    margin-top: 6px;
    font-size: 14px;
}

.blink {
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.dialogue-resizer {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
    z-index: 9999;
}

.resizer-icon {
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid #3a4a65;
    border-bottom: 2px solid #3a4a65;
}

.dialogue-resizer:hover .resizer-icon {
    border-color: #569cd6;
}
            `;
        document.head.appendChild(style);
    }

    // Parse dialogue text and show dialogue panel
    public ShowDialogue(content: string): void {
        
        // Create DOM elements if not already created
        if (!this.isInitialized) {
            this.createDialogueUI();
        }
        
        // Thoroughly clean current state
        this.cleanupAllState();
        
        // Parse dialogue content
        this.mainDialogueLines = this.parseDialogueContent(content);
        this.currentMainIndex = 0;

        // Show dialogue panel - enable interaction and visibility
        this.dialoguePanel.style.display = 'flex';
        this.dialoguePanel.style.pointerEvents = 'auto'; // Enable interaction
        this.dialoguePanel.classList.add('active');
        
        // Add opening animation effect - use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            // Brief delay to ensure transformation takes effect
            setTimeout(() => {
                this.dialoguePanel.style.opacity = '1';
                this.dialoguePanel.style.transform = 'scale(1)';
            }, 30);
        });

        // Show main dialogue content
        this.displayMainDialogue();

        // Trigger dialogue open callbacks
        this.triggerDialogueOpenCallbacks();
    }

    // Clean up all state and event listeners
    private cleanupAllState(): void {
        if (!this.isInitialized) {
            return; // Nothing to clean up
        }

        // Clear all content
        if (this.dialogueContent) {
            this.dialogueContent.innerHTML = '';
        }
        if (this.choicesContainer) {
            this.choicesContainer.innerHTML = '';
        }
        
        // Cancel all typing effect timers
        const typingIntervals = document.querySelectorAll('[data-typing-interval]');
        typingIntervals.forEach(element => {
            const intervalId = (element as HTMLElement).dataset.typingInterval;
            if (intervalId) {
                clearInterval(parseInt(intervalId, 10));
                delete (element as HTMLElement).dataset.typingInterval;
            }
        });
        
        // Reset state variables
        this.isTyping = false;
        this.currentMainIndex = 0;
        this.mainDialogueLines = [];
        
        // Remove all choice button event listeners
        const buttons = document.querySelectorAll('.choice-button');
        buttons.forEach(button => {
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
        });
        
        // Remove global space event listener
        if (this.handleGlobalKeydown) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        
        // Remove dialogue click event listener
        if (this.handleDialogueClick && this.dialogueContent) {
            this.dialogueContent.removeEventListener('click', this.handleDialogueClick);
        }
        
        // Remove any existing continue prompts
        const continuePrompts = document.querySelectorAll('.continue-prompt');
        continuePrompts.forEach(prompt => prompt.remove());
    }

    // 显示主对话
    private displayMainDialogue(): void {
        if (this.currentMainIndex < this.mainDialogueLines.length) {
            this.displayDialogueLine(this.mainDialogueLines[this.currentMainIndex]);
            
        }
    }

    // 显示单行对话，包括可能的选择项
    private displayDialogueLine(line: DialogueLine): void {
        this.appendDialogueLine(line, () => {
            // 如果有选择项，显示选择项
            if (line.choices && line.choices.length > 0) {
                this.displayChoices(line.choices);
            } else {
                // 否则等待玩家按空格继续
                this.waitForPlayerAction(() => {
                    this.currentMainIndex++;
                    this.displayMainDialogue();
                   
                });
            }
        });
    }

    // 解析对话内容为结构化数据
    public parseDialogueContent(content: string): DialogueLine[] {
        const lines = content.split('\n');
        const parsedLines = this.parseLines(lines, 0)[0] as DialogueLine[];
        console.log("解析后的对话结构:", JSON.stringify(parsedLines, null, 2));
        return parsedLines;
    }

    // 递归解析对话行
    private parseLines(lines: string[], currentIndent: number): [DialogueLine[], number] {
        const result: DialogueLine[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            // 计算当前行的缩进级别
            const indentLevel = this.getIndentLevel(line);
            // 获取去除前后空格的行内容
            const trimmedLine = line.trim();

            // 如果当前行的缩进级别小于期望的缩进级别，结束当前层级的解析
            if (indentLevel < currentIndent) {
                break;
            }

            // 如果缩进级别匹配，解析这一行
            if (indentLevel === currentIndent) {
                // 检查是否是有效的对话行（以左->或右->开头）
                if (trimmedLine.startsWith('左->') || trimmedLine.startsWith('右->')) {
                    const position = trimmedLine.startsWith('左->') ? 'left' : 'right';
                    let text = trimmedLine.substring(3).trim();
                    let character: string | undefined;
                    let code: string | undefined;

                    // 检查是否是选择项
                    if (text.startsWith('choose:')) {
                        const choiceText = text.substring(7).trim();

                        // 创建一个选择项
                        const choice: DialogueChoice = {
                            text: choiceText,
                            nextLines: []
                        };

                        // 解析选择项后的内容
                        const [choiceLines, newIndex] = this.parseLines(lines.slice(i + 1), currentIndent + 1);
                        choice.nextLines = choiceLines;
                        i += newIndex + 1;

                        // 将选择项添加到上一个对话行的选择列表中
                        if (result.length > 0 && !result[result.length - 1].choices) {
                            result[result.length - 1].choices = [];
                        }

                        if (result.length > 0) {
                            result[result.length - 1].choices?.push(choice);
                        }
                        continue;
                    }

                    // 检查是否包含角色名
                    const colonIndex = text.indexOf(':');
                    if (colonIndex > 0) {
                        character = text.substring(0, colonIndex).trim();
                        text = text.substring(colonIndex + 1).trim();
                    }

                    // 检查是否包含代码段 [code:...]
                    const codeRegex = /\[code-(.*?)\]/;
                    const codeMatch = text.match(codeRegex);
                    if (codeMatch) {
                        code = codeMatch[1];
                        // 从文本中移除代码段
                        text = text.replace(codeMatch[0], '');
                    }

                    // 创建对话行
                    result.push({
                        text,
                        position,
                        character,
                        code
                    });
                }

                i++;
            } else {
                // 如果缩进级别更高，跳过（这些行会在递归中处理）
                i++;
            }
        }

        return [result, i];
    }

    // 获取行的缩进级别
    private getIndentLevel(line: string): number {
        let level = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === ' ' || line[i] === '\t') {
                level += (line[i] === '\t') ? 4 : 1;
            } else {
                break;
            }
        }
        return Math.floor(level / 4);  // 每4个空格算一个缩进级别
    }

    // 等待玩家按空格继续
    private waitForPlayerAction(callback: () => void): void {
        // 添加一个小的继续提示
        const continuePrompt = document.createElement('div');
        continuePrompt.className = 'continue-prompt';
        continuePrompt.id = 'dialogue-continue-prompt-' + Date.now(); // 添加唯一ID
        continuePrompt.innerHTML = '<span style="color: white;" class="blink">▼</span>';
        this.dialogueContent.appendChild(continuePrompt);

        // 滚动到底部
        this.scrollToBottom();
        
        // 移除可能存在的之前的事件监听器
        if (this.handleGlobalKeydown) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        if (this.handleDialogueClick) {
            this.dialogueContent.removeEventListener('click', this.handleDialogueClick);
        }

        // 定义事件处理函数
        const handleContinue = (event: KeyboardEvent | MouseEvent) => {
            // 检查是否对话系统已经关闭或重置
            if (!document.body.contains(continuePrompt)) {
                // 如果提示已被移除，也移除事件监听器
                document.removeEventListener('keydown', handleContinue as EventListener);
                this.dialogueContent.removeEventListener('click', handleContinue as EventListener);
                return;
            }
            
            if ((event as KeyboardEvent).code === 'Space' || event.type === 'click') {
                // 移除事件监听器
                document.removeEventListener('keydown', handleContinue as EventListener);
                this.dialogueContent.removeEventListener('click', handleContinue as EventListener);

                // 检查提示是否仍然在DOM中
                if (document.body.contains(continuePrompt)) {
                    // 移除继续提示
                    continuePrompt.remove();
                }

                // 继续显示下一行对话
                try {
                    callback();
                } catch (e) {
                    console.error('执行对话回调时出错:', e);
                }
            }
        };

        // 存储为类的属性，以便后续引用
        this.handleGlobalKeydown = handleContinue as EventListener;
        this.handleDialogueClick = handleContinue as EventListener;

        // 添加事件监听器
        document.addEventListener('keydown', this.handleGlobalKeydown);
        this.dialogueContent.addEventListener('click', this.handleDialogueClick);
    }
    
    // 事件处理函数引用
    private handleGlobalKeydown: EventListener = null as unknown as EventListener;
    private handleDialogueClick: EventListener = null as unknown as EventListener;

    // 添加一行对话内容
    private appendDialogueLine(line: DialogueLine, callback: () => void): void {
        const lineElement = document.createElement('div');
        lineElement.className = `dialogue-line dialogue-${line.position}`;

        let displayText = line.text;

        // 如果有角色名，添加角色名
        if (line.character) {
            const characterSpan = document.createElement('span');
            characterSpan.className = 'character-name';
            characterSpan.textContent = line.character;
            lineElement.appendChild(characterSpan);
            
            // 添加换行，使角色名和文本分行显示
            lineElement.appendChild(document.createElement('br'));
        }

        // 创建文本容器用于打字机效果
        const textContainer = document.createElement('span');
        textContainer.className = 'dialogue-text';
        lineElement.appendChild(textContainer);

        // 将行添加到对话内容中
        this.dialogueContent.appendChild(lineElement);

        // 滚动到底部
        this.scrollToBottom();

        // 应用打字机效果
        this.applyTypewriterEffect(textContainer, displayText, () => {
            // 如果有代码段，执行代码
            if (line.code) {
                try {
                    // 使用Function构造器创建一个函数并执行
                    new Function(line.code)();
                } catch (e) {
                    console.error('Error executing dialogue code:', e);
                }
            }
            // 调用原始回调
            callback();
        });
    }

    // 打字机效果
    private applyTypewriterEffect(element: HTMLElement, text: string, callback: () => void): void {
        let index = 0;
        this.isTyping = true;
        const typingEffect = document.createElement('span');
        typingEffect.className = 'typing-effect';
        element.appendChild(typingEffect);

        const interval = setInterval(() => {
            if (index < text.length) {
                typingEffect.textContent += text.charAt(index);
                index++;

                // 滚动到底部
                this.scrollToBottom();
            } else {
                clearInterval(interval);
                this.isTyping = false;
                callback();
            }
        }, this.typewriterSpeed);

        // 保存interval id以便在需要时清除
        element.dataset.typingInterval = String(interval);
    }

    // 立即完成当前打字效果
    private completeCurrentTyping(): void {
        const typingElements = document.querySelectorAll('.typing-effect');
        const lastTypingElement = typingElements[typingElements.length - 1];

        if (lastTypingElement && lastTypingElement.parentElement) {
            const intervalId = lastTypingElement.parentElement.dataset.typingInterval;
            if (intervalId) {
                clearInterval(parseInt(intervalId, 10));

                // 获取完整文本
                const fullText = lastTypingElement.parentElement.textContent || '';
                const typedText = lastTypingElement.textContent || '';
                const remainingText = fullText.replace(typedText, '');

                // 显示完整文本
                lastTypingElement.textContent += remainingText;

                // 设置打字状态为完成
                this.isTyping = false;

                // 触发回调
                const event = new Event('typing-completed');
                lastTypingElement.dispatchEvent(event);

                // 执行回调
                if (lastTypingElement.parentElement.dataset.callback) {
                    try {
                        const callback = new Function(lastTypingElement.parentElement.dataset.callback);
                        callback();
                    } catch (e) {
                        console.error('Error executing callback:', e);
                    }
                }
            }
        }
    }

    // 显示选择项
    private displayChoices(choices: DialogueChoice[]): void {
        // 清空现有的选择项
        this.choicesContainer.innerHTML = '';

        // 为每个选择项创建按钮
        choices.forEach((choice) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = choice.text;

            // 添加选择事件
            choiceButton.addEventListener('click', () => {
                // 清空选择区域
                this.choicesContainer.innerHTML = '';

                // 处理选择后的分支
                this.handleChoiceBranch(choice.nextLines);
            });

            this.choicesContainer.appendChild(choiceButton);
        });
        
        // 在添加所有选择按钮后滚动到底部，确保选择按钮可见且不遮挡对话内容
        this.scrollToBottom();
        
        // 额外的延迟滚动，确保在按钮渲染后滚动
        setTimeout(() => {
            this.scrollToBottom();
        }, 50);
    }

    // 处理选择分支
    private handleChoiceBranch(branchLines: DialogueLine[]): void {
        if (branchLines.length === 0) {
            // 如果分支为空，直接返回主对话
            this.currentMainIndex++;
            this.displayMainDialogue();
            return;
        }

        // 显示分支中的第一行
        this.displayBranchLine(branchLines, 0);
        
        // 确保滚动到底部
        this.scrollToBottom();
    }

    // 显示分支中的一行
    private displayBranchLine(branchLines: DialogueLine[], index: number): void {
        if (index >= branchLines.length) {
            // 分支结束，返回主对话
            this.currentMainIndex++;
            this.displayMainDialogue();
            return;
        }

        const line = branchLines[index];
        this.appendDialogueLine(line, () => {
            // 如果有选择项，显示选择项
            if (line.choices && line.choices.length > 0) {
                this.displayBranchChoices(line.choices, branchLines, index);
            } else {
                // 否则等待玩家按空格继续
                this.waitForPlayerAction(() => {
                    this.displayBranchLine(branchLines, index + 1);
                });
            }
        });
    }

    // 显示分支中的选择项
    private displayBranchChoices(choices: DialogueChoice[], parentBranchLines: DialogueLine[], parentIndex: number): void {
        // 清空现有的选择项
        this.choicesContainer.innerHTML = '';

        // 为每个选择项创建按钮
        choices.forEach((choice) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = choice.text;

            // 添加选择事件
            choiceButton.addEventListener('click', () => {
                // 清空选择区域
                this.choicesContainer.innerHTML = '';

                // 显示子分支
                if (choice.nextLines.length > 0) {
                    this.handleSubBranch(choice.nextLines, parentBranchLines, parentIndex);
                } else {
                    // 如果子分支为空，继续父分支
                    this.displayBranchLine(parentBranchLines, parentIndex + 1);
                }
            });

            this.choicesContainer.appendChild(choiceButton);
        });
        
        // 在添加所有选择按钮后滚动到底部，确保选择按钮可见且不遮挡对话内容
        this.scrollToBottom();
        
        // 额外的延迟滚动，确保在按钮渲染后滚动
        setTimeout(() => {
            this.scrollToBottom();
        }, 50);
    }

    // 处理子分支
    private handleSubBranch(subBranchLines: DialogueLine[], parentBranchLines: DialogueLine[], parentIndex: number): void {
        if (subBranchLines.length === 0) {
            // 如果子分支为空，继续父分支
            this.displayBranchLine(parentBranchLines, parentIndex + 1);
            return;
        }

        // 显示子分支中的第一行
        this.displaySubBranchLine(subBranchLines, 0, parentBranchLines, parentIndex);
        
        // 确保滚动到底部
        this.scrollToBottom();
    }

    // 显示子分支中的一行
    private displaySubBranchLine(subBranchLines: DialogueLine[], index: number, parentBranchLines: DialogueLine[], parentIndex: number): void {
        console.log("显示子分支行", index, "总行数", subBranchLines.length);
        console.log("子分支内容:", JSON.stringify(subBranchLines, null, 2));
        
        if (index >= subBranchLines.length) {
            // 子分支结束，继续父分支
            console.log("子分支结束，继续父分支");
            this.displayBranchLine(parentBranchLines, parentIndex + 1);
            return;
        }

        const line = subBranchLines[index];
        this.appendDialogueLine(line, () => {
            // 如果有选择项，显示选择项（注意，这里可能会有更深层次的嵌套）
            if (line.choices && line.choices.length > 0) {
                console.log("子分支行有选择项，显示选择项");
                this.displaySubBranchChoices(line.choices, subBranchLines, index, parentBranchLines, parentIndex);
            } else {
                // 否则等待玩家按空格继续
                console.log("子分支行无选择项，等待玩家按空格继续");
                this.waitForPlayerAction(() => {
                    this.displaySubBranchLine(subBranchLines, index + 1, parentBranchLines, parentIndex);
                });
            }
        });
    }

    // 显示子分支中的选择项
    private displaySubBranchChoices(
        choices: DialogueChoice[], 
        currentSubBranchLines: DialogueLine[], 
        currentIndex: number,
        parentBranchLines: DialogueLine[],
        parentIndex: number
    ): void {
        // 清空现有的选择项
        this.choicesContainer.innerHTML = '';

        // 为每个选择项创建按钮
        choices.forEach((choice) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = choice.text;

            // 添加选择事件
            choiceButton.addEventListener('click', () => {
                // 清空选择区域
                this.choicesContainer.innerHTML = '';

                // 处理更深层次的分支 - 这里可以递归地应用类似的逻辑
                // 简化起见，我们假设不会有超过三层的嵌套
                if (choice.nextLines.length > 0) {
                    this.displayDeepNestedBranch(choice.nextLines, () => {
                        // 子子分支结束后，继续子分支
                        this.displaySubBranchLine(currentSubBranchLines, currentIndex + 1, parentBranchLines, parentIndex);
                    });
                } else {
                    // 如果没有更深层次的分支，继续当前子分支
                    this.displaySubBranchLine(currentSubBranchLines, currentIndex + 1, parentBranchLines, parentIndex);
                }
            });

            this.choicesContainer.appendChild(choiceButton);
        });
        
        // 在添加所有选择按钮后滚动到底部，确保选择按钮可见且不遮挡对话内容
        this.scrollToBottom();
        
        // 额外的延迟滚动，确保在按钮渲染后滚动
        setTimeout(() => {
            this.scrollToBottom();
        }, 50);
    }

    // 显示深层嵌套的分支
    private displayDeepNestedBranch(branchLines: DialogueLine[], completionCallback: () => void): void {
        this.displayDeepNestedLines(branchLines, 0, completionCallback);
    }

    // 显示深层嵌套分支中的行
    private displayDeepNestedLines(lines: DialogueLine[], index: number, completionCallback: () => void): void {
        if (index >= lines.length) {
            // 分支结束，调用完成回调
            completionCallback();
            return;
        }

        const line = lines[index];
        this.appendDialogueLine(line, () => {
            // 如果有选择项，显示选择项
            if (line.choices && line.choices.length > 0) {
                this.displayDeepNestedChoices(line.choices, lines, index, completionCallback);
            } else {
                // 否则等待玩家按空格继续
                this.waitForPlayerAction(() => {
                    this.displayDeepNestedLines(lines, index + 1, completionCallback);
                });
            }
        });
    }

    // 显示深层嵌套分支中的选择项
    private displayDeepNestedChoices(choices: DialogueChoice[], parentLines: DialogueLine[], parentIndex: number, completionCallback: () => void): void {
        // 清空现有的选择项
        this.choicesContainer.innerHTML = '';

        // 为每个选择项创建按钮
        choices.forEach((choice) => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice-button';
            choiceButton.textContent = choice.text;

            // 添加选择事件
            choiceButton.addEventListener('click', () => {
                // 清空选择区域
                this.choicesContainer.innerHTML = '';

                // 处理选择分支
                if (choice.nextLines.length > 0) {
                    // 显示选择后的对话内容
                    this.displayDeepNestedLines(choice.nextLines, 0, () => {
                        // 子分支完成后，继续父分支
                        this.displayDeepNestedLines(parentLines, parentIndex + 1, completionCallback);
                    });
                } else {
                    // 如果选择没有后续对话，继续父分支
                    this.displayDeepNestedLines(parentLines, parentIndex + 1, completionCallback);
                }
            });

            this.choicesContainer.appendChild(choiceButton);
        });
        
        // 在添加所有选择按钮后滚动到底部，确保选择按钮可见且不遮挡对话内容
        this.scrollToBottom();
        
        // 额外的延迟滚动，确保在按钮渲染后滚动
        setTimeout(() => {
            this.scrollToBottom();
        }, 50);
    }

    // 滚动到对话内容底部
    private scrollToBottom(): void {
        // 使用setTimeout确保在DOM更新后再滚动
        setTimeout(() => {
            this.dialogueContent.scrollTop = this.dialogueContent.scrollHeight;
            // 如果对话容器在滚动区域内，也确保整个页面滚动到底部
            if (this.dialoguePanel.offsetHeight > window.innerHeight) {
                window.scrollTo(0, document.body.scrollHeight);
            }
        }, 10); // 增加延迟确保DOM完全更新
    }

    // Clear dialogue content
    public ClearDialogue(): void {
        if (!this.isInitialized) {
            return; // Nothing to clear
        }
        
        if (this.dialogueContent) {
            this.dialogueContent.innerHTML = '';
        }
        if (this.choicesContainer) {
            this.choicesContainer.innerHTML = '';
        }
    }

    // Close dialogue panel
    public CloseDialogue(): void {
        if (!this.isInitialized || !this.dialoguePanel) {
            return; // Nothing to close
        }

        // Add closing animation
        this.dialoguePanel.style.opacity = '0';
        this.dialoguePanel.style.transform = 'scale(0.95)';
        
        // Wait for animation to complete then clean up state
        setTimeout(() => {
            // Clean up all state
            this.cleanupAllState();
            
            // Close dialogue panel and disable interaction
            this.dialoguePanel.classList.remove('active');
            this.dialoguePanel.style.display = 'none';
            this.dialoguePanel.style.pointerEvents = 'none'; // Disable interaction to prevent blocking
            
            // Reset panel state
            this.dialoguePanel.style.transform = '';
        }, 200);

        // Trigger dialogue close callbacks
        this.triggerDialogueCloseCallbacks();
    }

    // Completely destroy dialogue panel
    public DestroyDialogue(): void {
        if (!this.isInitialized) {
            return; // Nothing to destroy
        }

        // First close dialogue panel and clean up state
        this.CloseDialogue();
        
        // Remove event listeners
        if (this.closeButton) {
            this.closeButton.removeEventListener('click', this.CloseDialogue.bind(this));
        }
        if (this.handleGlobalKeydown) {
            document.removeEventListener('keydown', this.handleGlobalKeydown);
        }
        if (this.handleDialogueClick) {
            this.dialogueContent.removeEventListener('click', this.handleDialogueClick);
        }
        
        // Remove entire dialogue panel from DOM
        if (this.dialoguePanel && this.dialoguePanel.parentNode) {
            this.dialoguePanel.parentNode.removeChild(this.dialoguePanel);
        }
        
        // Remove added styles
        const dialogueStyle = document.head.querySelector('style[data-dialogue-style]');
        if (dialogueStyle) {
            dialogueStyle.remove();
        }

        // Reset initialization state
        this.isInitialized = false;
    }

    /**
     * 窗口拖拽功能
     */
    private enableWindowDrag(windowElement: HTMLElement, dragHandle: HTMLElement) {
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;

        const startDrag = (e: MouseEvent) => {
            // 确保是从头部拖拽
            if (e.target === dragHandle || dragHandle.contains(e.target as Node)) {
                e.preventDefault();
                e.stopPropagation();

                isDragging = true;

                // 获取鼠标相对于窗口的位置
                const rect = windowElement.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                // 添加拖动中的样式
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'move';

                // 使用捕获阶段添加事件监听
                document.addEventListener('mousemove', drag, true);
                document.addEventListener('mouseup', stopDrag, true);
            }
        };

        const drag = (e: MouseEvent) => {
            if (!isDragging) return;

            e.preventDefault();
            e.stopPropagation();

            // 更新窗口位置
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;

            // 限制拖动不超出可视区域
            const maxLeft = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - dragHandle.offsetHeight;

            windowElement.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
            windowElement.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
        };

        const stopDrag = (e: MouseEvent) => {
            if (!isDragging) return;

            e.preventDefault();
            e.stopPropagation();

            isDragging = false;

            // 恢复样式
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            // 移除事件监听
            document.removeEventListener('mousemove', drag, true);
            document.removeEventListener('mouseup', stopDrag, true);
        };

        // 使用捕获阶段添加事件
        dragHandle.addEventListener('mousedown', startDrag, true);
    }

    /**
     * 窗口大小调整功能
     */
    private enableWindowResize(windowElement: HTMLElement, resizeHandle: HTMLElement) {
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let isResizing = false;

        const startResize = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;

            // 记录初始值
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowElement.offsetWidth;
            startHeight = windowElement.offsetHeight;

            // 设置调整大小时的样式
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';

            // 使用捕获阶段添加事件监听
            document.addEventListener('mousemove', resize, true);
            document.addEventListener('mouseup', stopResize, true);
        };

        const resize = (e: MouseEvent) => {
            if (!isResizing) return;

            e.preventDefault();
            e.stopPropagation();

            // 计算新尺寸
            const width = Math.max(280, startWidth + (e.clientX - startX));
            const height = Math.max(300, startHeight + (e.clientY - startY));

            // 设置新尺寸
            windowElement.style.width = `${width}px`;
            windowElement.style.height = `${height}px`;
        };

        const stopResize = (e: MouseEvent) => {
            if (!isResizing) return;

            e.preventDefault();
            e.stopPropagation();

            isResizing = false;

            // 恢复样式
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            // 移除事件监听
            document.removeEventListener('mousemove', resize, true);
            document.removeEventListener('mouseup', stopResize, true);
        };

        // 直接添加事件监听，使用捕获阶段
        resizeHandle.addEventListener('mousedown', startResize, true);
    }

    /**
     * 将对话窗口置于前台
     */
    private bringToFront(): void {
        // 找到所有可能的弹窗元素
        const dialogues = document.querySelectorAll('#dialogue-panel');
        const windows = document.querySelectorAll('.pd-window');
        
        // 设置最高层级
        let maxZIndex = 1000;
        
        // 检查所有窗口元素的当前z-index
        windows.forEach((win) => {
            const zIndex = parseInt(window.getComputedStyle(win).zIndex, 10) || 0;
            if (!isNaN(zIndex) && zIndex > maxZIndex) {
                maxZIndex = zIndex;
            }
        });
        
        // 检查所有对话框元素的当前z-index
        dialogues.forEach((dlg) => {
            if (dlg !== this.dialoguePanel) { // 不检查当前对话框
                const zIndex = parseInt(window.getComputedStyle(dlg).zIndex, 10) || 0;
                if (!isNaN(zIndex) && zIndex > maxZIndex) {
                    maxZIndex = zIndex;
                }
            }
        });
        
        // 设置当前对话框的z-index为最高+1
        this.dialoguePanel.style.zIndex = (maxZIndex + 1).toString();
    }

    // Add callback for dialogue open event
    public OnDialogueOpen(callback: () => void): void {
        this.onDialogueOpenCallbacks.push(callback);
    }

    // Add callback for dialogue close event
    public OnDialogueClose(callback: () => void): void {
        this.onDialogueCloseCallbacks.push(callback);
    }

    // Trigger all dialogue open callbacks
    private triggerDialogueOpenCallbacks(): void {
        this.onDialogueOpenCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error executing dialogue open callback:', error);
            }
        });
    }

    // Trigger all dialogue close callbacks
    private triggerDialogueCloseCallbacks(): void {
        this.onDialogueCloseCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error executing dialogue close callback:', error);
            }
        });
    }
}

// // 初始化对话系统
// let dialogueSystem: DialogueSystem;

// // 导出API函数
// function ShowDialogue(content: string): void {
//     dialogueSystem.ShowDialogue(content);
// }

// function ClearDialogue(): void {
//     dialogueSystem.ClearDialogue();
// }

// function CloseDialogue(): void {
//     dialogueSystem.CloseDialogue();
// }

// // 初始化函数
// function initDialogueSystem() {
//     // 初始化对话系统
//     dialogueSystem = new DialogueSystem();

//     // 将API函数暴露给全局作用域，以便游戏引擎调用
//     // @ts-ignore
//     window.ShowDialogue = ShowDialogue;
//     // @ts-ignore
//     window.ClearDialogue = ClearDialogue;
//     // @ts-ignore
//     window.CloseDialogue = CloseDialogue;

//     console.log('对话系统初始化完成');
// }

// // 页面加载完成后初始化对话系统
// document.addEventListener('DOMContentLoaded', initDialogueSystem);

// pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
//     console.log("对话系统初始化中...");
   
//     var dialogueSystem_ = new DialogueSystem();
//     dialogueSystem_.ShowDialogue(`
// 左->这里看来有人来过
// 左->火堆还没有熄灭
// 左->choose:查看火堆周围的情况
// 	右->并没有发现什么异常
// 	左->现在该干嘛呢
// 	左->choose:使用打火机
//         左->你并没有打火机
// 左->choose:查看帐篷情况`)
    
// });