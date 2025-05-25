import { pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit } from "../../../engine.js";
import { data, LocalSave, SaveSetting } from "../../Group/Save/PIXSave.js";
import { TransitionEffectType, UIScreenEffect } from "../screeneffect_ui/UIScreenEffect.js";
import { UIWindowLib } from "../window_lib_ui/UIWindowLib.js";
import { GameMainScene } from "./UIMainMenu.js";

/**
 * Main save window class
 */
export class UIMainSaveWindow {
    private static instance: UIMainSaveWindow | null = null;
    private windowElement: HTMLElement | null = null;
    private contentElement: HTMLElement | null = null;
    private closeFunction: (() => void) | null = null;
    private saveSlots: { id: number, name: string, date: string }[] = [];

    public Data: any;

    /**
     * Get singleton instance
     */
    public static getInstance(): UIMainSaveWindow {
        if (!this.instance) {
            this.instance = new UIMainSaveWindow();
        }
        return this.instance;
    }

    /**
     * Private constructor to prevent direct instantiation
     */
    private constructor() { }

    /**
     * Show save window
     */
    public show(): void {
        // If window already exists, return directly
        if (this.windowElement && document.body.contains(this.windowElement)) {
            return;
        }

        // Create window
        const result = UIWindowLib.createWindow(
            "Save Management",
            600,
            500,
            1.0
        );

        this.windowElement = result.windowElement;
        this.contentElement = result.contentElement;
        this.closeFunction = result.close;

        // Initialize window content
        this.initContent();
    }

    /**
     * Close window
     */
    public close(): void {
        if (this.closeFunction) {
            this.closeFunction();
            this.windowElement = null;
            this.contentElement = null;
            this.closeFunction = null;

            UIMainSaveWindow.instance = null;
        }
    }

    /**
     * Show window (compatibility method)
     */
    public showWindow(): void {
        this.show();
    }

    /**
     * Close window (compatibility method)
     */
    public closeWindow(): void {
        this.close();
    }

    /**
     * Initialize window content
     */
    private initContent(): void {
        if (!this.contentElement) return;

        // Add styles and HTML content
        this.contentElement.innerHTML = `
            <style>
                .save-window-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    color: #d0d0d0;
                }
                
                .save-window-title {
                    font-size: 14px;
                    margin-bottom: 15px;
                    text-align: center;
                    color: #e0e0e0;
                }
                
                .save-slots-container {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                    overflow-y: auto;
                    padding: 5px;
                    margin-bottom: 15px;
                    border: 1px solid #222222;
                    background-color: #000000;
                    border-radius: 2px;
                }
                
                .save-slot {
                    padding: 12px;
                    background-color: #0a0a0a;
                    border: 1px solid #111111;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    position: relative;
                }
                
                .save-slot:hover {
                    background-color: #0f0f0f;
                    border-color: #1a1a1a;
                }
                
                .save-slot.selected {
                    background-color: #101010;
                    border-color: #1a1a1a;
                }
                
                .save-slot.empty {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #555555;
                    font-style: italic;
                }
                
                .save-slot-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .save-slot-name {
                    font-weight: bold;
                    color: #e0e0e0;
                }
                
                .save-slot-date {
                    font-size: 12px;
                    color: #777777;
                }
                
                .save-slot-preview {
                    width: 100%;
                    height: 80px;
                    background-color: #050505;
                    border-radius: 2px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #aaaaaa;
                    font-size: 12px;
                    border: 1px solid #111111;
                    transition: background-color 0.3s ease;
                }
                
                .save-slot-preview:hover {
                    background-color: #0a0a0a;
                }
                
                .save-actions {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                }
                
                .save-button {
                    background-color: #0a0a0a;
                    border: 1px solid #1a1a1a;
                    color: #cccccc;
                    padding: 10px 20px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-weight: normal;
                    flex: 1;
                    margin: 0 5px;
                }
                
                .save-button:hover {
                    background-color: #101010;
                }
                
                .save-button.download {
                    background-color: #0a0a0a;
                }
                
                .save-button.download:hover {
                    background-color: #101010;
                }
                
                .save-button.load {
                    background-color: #0a0a0a;
                }
                
                .save-button.load:hover {
                    background-color: #101010;
                }
                
                .save-button:disabled {
                    background-color: #000000;
                    color: #333333;
                    border-color: #111111;
                    cursor: not-allowed;
                }
                
                .no-save-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    color: #555555;
                    font-style: italic;
                    font-size: 14px;
                }
                
                /* Scrollbar styles */
                .save-slots-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                .save-slots-container::-webkit-scrollbar-track {
                    background-color: #000000;
                    border-radius: 2px;
                }
                
                .save-slots-container::-webkit-scrollbar-thumb {
                    background-color: #111111;
                    border-radius: 2px;
                }
                
                .save-slots-container::-webkit-scrollbar-thumb:hover {
                    background-color: #1a1a1a;
                }
            </style>
            
            <div class="save-window-container">
                
                <div class="save-slots-container" id="save-slots-container">
                    <!-- Save slots will be dynamically generated in JS -->
                </div>
                
                <div class="save-actions">
                    <button class="save-button download" id="download-save-btn">Download Save</button>
                    <button class="save-button load" id="load-save-btn">Load Save</button>
                </div>
            </div>
        `;

        // Add empty save slots
        this.renderSaveSlots();

        // Add button event listeners
        setTimeout(() => {
            const downloadBtn = this.contentElement?.querySelector('#download-save-btn') as HTMLButtonElement;
            const loadBtn = this.contentElement?.querySelector('#load-save-btn') as HTMLButtonElement;

            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleDownloadSave();
                }, true);
            }

            if (loadBtn) {
                loadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLoadSave();
                }, true);

                // Initial state disable load button
                loadBtn.disabled = false;
            }
        }, 100);
    }

    /**
     * Render save slots
     */
    private renderSaveSlots(): void {
        console.warn(this.Data)
        const slotsContainer = this.contentElement?.querySelector('#save-slots-container');
        if (!slotsContainer) return;

        // Clear container
        slotsContainer.innerHTML = '';

        // Check if Data is empty
        if (data.LevelGameData === "") {
            //console.log(this.Data)
            // Data is empty, don't show any slots
            slotsContainer.innerHTML = '<div class="no-save-message">No save data available</div>';
            return;
        }

        // Data is not empty, generate one available slot
        const slotElement = document.createElement('div');
        slotElement.className = 'save-slot';
        slotElement.setAttribute('data-slot-id', '0');

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        slotElement.innerHTML = `
            <div class="save-slot-preview">Game save data available</div>
        `;

        // Add click event for save slot
        slotElement.addEventListener('click', (e) => {
            e.stopPropagation();
            GameMainScene.getInstance().HideALLMainMenuUI(() => {
                UIScreenEffect.FadeOut(800, TransitionEffectType.WIPE_RADIAL, () => {
                    SaveSetting.isUseDataEnterNewGame = true;

                    pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.RUN_TIME_.goToLayout("Level")

                })

            });

        }, true);

        slotsContainer.appendChild(slotElement);

        // Add selected style
        slotElement.classList.add('selected');

        // Enable load button
        const loadBtn = this.contentElement?.querySelector('#load-save-btn') as HTMLButtonElement;
        if (loadBtn) {
            loadBtn.disabled = false;
        }
    }

    /**
     * Select save slot
     * @param slotId Slot ID
     */
    private selectSlot(slotId: number): void {
        // Click save slot processing logic - kept empty for user to fill in
    }

    /**
     * Handle download save
     */
    private handleDownloadSave(): void {
        // Directly use download method from PIXSave
        LocalSave.DataDownload();
        console.log('[Save Window] Download save function called');
    }

    /**
     * Handle load save
     */
    private handleLoadSave(): void {
        // Directly use read method from PIXSave
        LocalSave.DataRead();
        console.log('[Save Window] Load save function called');

        // Close window after reading is complete
        setTimeout(() => {
            this.close();
        }, 500);
    }
}

// Called when engine initializes
pmlsdk$ProceduralStorytellingSandboxRPGDevelopmentToolkit.gl$_ubu_init(() => {
    // Can add window startup logic here
    // For example: UIMainSaveWindow.getInstance().show();
    //UIMainSaveWindow.getInstance().Data = data;

});

