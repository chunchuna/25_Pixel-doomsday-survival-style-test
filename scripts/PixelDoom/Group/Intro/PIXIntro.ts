import { Unreal__ } from "../../../engine.js";
import { PIXLevel } from "../../Module/PIXLevel.js";
import { LayoutTransition, TransitionType } from "../../UI/layout_transition_ui/UILayoutTransition.js";
import { ThreeJs3D } from "../../UI/three_js_ui/UIThreejst.js";

Unreal__.GameBegin(() => {
    if (Unreal__.runtime.layout.name == "Intro") {
        // 检查是否有网络 
        // 否则不加载intro 
        // 谁叫 three.js 不下到本地用呢
        Intro.CheakNetWork(() => {
            Intro.PlayIntroAnimation();
        }, () => {
            // 直接跳 菜单场景
            Intro.GoMinMenuLayout()
         });

    }
})

class Intro {
    static async PlayIntroAnimation() {

        // 提前检查 three.js 是否能成功加载
        var ThreeJsLoaded = await ThreeJs3D.loadWithTimeout(5000)
        if (!ThreeJsLoaded) {
            console.warn("Three.js加载失败");
            Intro.GoMinMenuLayout()
        } else {
            console.log("Three.js加载成功");
        }


        await IntroAnimation.PlayAnimation();
        // 等待动画播放完毕之后 
        await Unreal__.WAIT_TIME_FORM_PROMISE(5)
        Intro.GoMinMenuLayout();
    }

    static GoMinMenuLayout() {
        LayoutTransition.LeaveLayout(TransitionType.HOLE, 2, () => {
            //Hole 动画结束的时候再销毁这个 IntroAnimation
            IntroAnimation.destroyAnimation();
            // 在跳转
            Unreal__.runtime.goToLayout("MainMenu")
        })
    }

    public static async CheakNetWork(hsnet: () => void, nothasnet: () => void) {
        var NetWork = await Unreal__.CheckNetWork()
        if (NetWork) {
            hsnet();
        } else {
            nothasnet();
        }

    }
}

class IntroAnimation {
    // CONFIGURATION - Game window settings
    private static CONFIG = {
        gameAspectRatio: 16 / 9,
        gameWidth: 640,
        gameHeight: 480,
        useFixedDimensions: false,
        textScaleFactor: 1.0,
        maintainAspectRatio: true
    };

    // DOM Elements
    private static container: HTMLDivElement | null;

    // Three.js objects
    private static THREE: any;
    private static FontLoader: any;
    private static TextGeometry: any;
    private static gsap: any;
    private static scene: any | null;
    private static camera: any | null;
    private static renderer: any | null;
    private static textGroup: any;
    private static textWidth: number = 0;
    private static textHeight: number = 0;
    private static animationFrameId: number;

    public static async PlayAnimation(): Promise<void> {
        // Get Three.js and related libraries from ThreeJs3D
        this.THREE = await ThreeJs3D.getThree();
        this.FontLoader = await ThreeJs3D.getFontLoader();
        this.TextGeometry = await ThreeJs3D.getTextGeometry();
        this.gsap = await ThreeJs3D.getGSAP();

        // Create container
        this.container = ThreeJs3D.createContainer();

        // Create scene
        this.scene = new this.THREE.Scene();
        this.scene.background = new this.THREE.Color(0xffffff);

        // Create camera
        this.camera = new this.THREE.PerspectiveCamera(
            45,
            this.CONFIG.useFixedDimensions ? this.CONFIG.gameWidth / this.CONFIG.gameHeight : this.CONFIG.gameAspectRatio,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new this.THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Update renderer size
        if (this.container && this.renderer && this.camera) {
            ThreeJs3D.updateRendererSize(this.renderer, this.camera, this.container, this.CONFIG);
        }

        // Setup lighting
        ThreeJs3D.setupStandardLighting(this.scene);

        // Create floor and fog
        ThreeJs3D.createBasicFloor(this.scene);
        ThreeJs3D.addFog(this.scene);

        // Start animation loop
        this.animate();

        // Add resize event listener
        window.addEventListener('resize', this.onWindowResize, false);

        // Load font
        const font = await ThreeJs3D.loadFont();

        // Create and animate text
        const letters = this.createLetters(font);
        this.calculateFinalPositions(letters);
        this.setupCameraAnimation();
        await this.animateLetters(letters);
    }

    public static destroyAnimation(): void {
        if (this.container) {
            ThreeJs3D.removeContainer(this.container);
        }
        window.removeEventListener('resize', this.onWindowResize, false);
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.renderer?.dispose();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
    }

    private static createLetters(font: any) {
        const letters = [];
        const text = "Chunchun Studio";
        this.textGroup = new this.THREE.Group();
        this.scene.add(this.textGroup);
        const baseSize = 3 * this.CONFIG.textScaleFactor;
        const largeSize = 4 * this.CONFIG.textScaleFactor;
        const material = new this.THREE.MeshPhysicalMaterial({
            color: 0x2b5797,
            metalness: 0.7,
            roughness: 0.2,
            reflectivity: 0.8,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3
        });

        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') continue;
            const letterGeometry = new this.TextGeometry(text[i], {
                font: font,
                size: text[i] === 'S' ? largeSize : baseSize,
                height: 1 * this.CONFIG.textScaleFactor,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.2 * this.CONFIG.textScaleFactor,
                bevelSize: 0.1 * this.CONFIG.textScaleFactor,
                bevelOffset: 0,
                bevelSegments: 5
            });
            letterGeometry.computeBoundingBox();
            const letter = new this.THREE.Mesh(letterGeometry, material);
            letter.castShadow = true;
            letter.receiveShadow = true;
            const distance = 100 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            letter.position.x = distance * Math.sin(phi) * Math.cos(theta);
            letter.position.y = distance * Math.sin(phi) * Math.sin(theta);
            letter.position.z = distance * Math.cos(phi);
            letter.rotation.x = Math.random() * Math.PI;
            letter.rotation.y = Math.random() * Math.PI;
            letter.rotation.z = Math.random() * Math.PI;
            letter.userData = { char: text[i], index: i, isSpace: false };
            this.textGroup.add(letter);
            letters.push(letter);
        }
        return letters;
    }

    private static calculateFinalPositions(letters: any[]) {
        let totalWidth = 0;
        let maxHeight = 0;
        let letterWidths: number[] = [];
        letters.forEach(letter => {
            const width = letter.geometry.boundingBox.max.x - letter.geometry.boundingBox.min.x;
            const height = letter.geometry.boundingBox.max.y - letter.geometry.boundingBox.min.y;
            letterWidths.push(width);
            totalWidth += width;
            maxHeight = Math.max(maxHeight, height);
        });
        const letterSpacing = 2.2 * this.CONFIG.textScaleFactor;
        totalWidth += (letters.length - 1) * letterSpacing;
        const wordSpacing = 6 * this.CONFIG.textScaleFactor;
        totalWidth += wordSpacing;
        this.textWidth = totalWidth;
        this.textHeight = maxHeight;
        let currentX = -totalWidth / 2;
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const width = letterWidths[i];
            letter.userData.targetPosition = { x: currentX + width / 2, y: 0, z: 0 };
            letter.userData.targetRotation = { x: 0, y: 0, z: 0 };
            currentX += width + letterSpacing;
            if (letter.userData.char === 'n' && letter.userData.index === 7) {
                currentX += wordSpacing;
            }
        }
    }

    private static animateLetters(letters: any[]): Promise<void> {
        return new Promise((resolve) => {
            letters.forEach((letter, index) => {
                const delay = index * 0.15;
                const duration = 2.0 + Math.random() * 0.5;
                this.gsap.to(letter.position, {
                    x: letter.userData.targetPosition.x,
                    y: letter.userData.targetPosition.y,
                    z: letter.userData.targetPosition.z,
                    duration: duration,
                    delay: delay,
                    ease: "power2.out",
                    onComplete: () => {
                        letter.userData.originalPosition = {
                            x: letter.position.x,
                            y: letter.position.y,
                            z: letter.position.z
                        };
                        this.startFloatingAnimation(letter);
                    }
                });
                this.gsap.to(letter.rotation, {
                    x: letter.userData.targetRotation.x,
                    y: letter.userData.targetRotation.y,
                    z: letter.userData.targetRotation.z,
                    duration: duration * 0.8,
                    delay: delay + duration * 0.2,
                    ease: "power1.out"
                });
            });

            const maxDelay = letters.length * 0.15;
            const maxDuration = 2.5;
            const totalTime = maxDelay + maxDuration + 0.5;

            setTimeout(resolve, totalTime * 1000);
        });
    }

    private static startFloatingAnimation(letter: any) {
        // 字母悬浮效果 相关 
        const floatAmplitude = (0.8 + Math.random() * 0.1) * this.CONFIG.textScaleFactor;
        const floatSpeed = 1.0 + Math.random() * 0.5;
        const rotateAmplitude = 0.2 + Math.random() * 0.02;

        this.gsap.to(letter.position, {
            y: letter.userData.originalPosition.y + floatAmplitude,
            duration: floatSpeed,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        this.gsap.to(letter.rotation, {
            x: letter.userData.targetRotation.x + rotateAmplitude,
            y: letter.userData.targetRotation.y + rotateAmplitude,
            duration: floatSpeed * 1.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        if (Math.random() > 0.5) {
            this.gsap.to(letter.position, {
                x: letter.userData.originalPosition.x + floatAmplitude * 0.5,
                duration: floatSpeed * 1.5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        }
    }

    private static setupCameraAnimation() {
        this.camera.position.set(0, 10, 80);
        this.camera.lookAt(0, 0, 0);
        this.gsap.to(this.camera.position, {
            x: 0,
            y: 5,
            z: this.calculateIdealCameraDistance(),
            duration: 4,
            ease: "power2.inOut"
        });
    }

    private static calculateIdealCameraDistance() {
        return ThreeJs3D.calculateIdealCameraDistance(
            this.camera,
            this.textWidth,
            this.textHeight,
            this.CONFIG
        );
    }

    private static animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    private static onWindowResize = () => {
        if (!this.CONFIG.useFixedDimensions && this.container && this.renderer && this.camera) {
            ThreeJs3D.updateRendererSize(this.renderer, this.camera, this.container, this.CONFIG);
            if (this.textGroup) {
                const newDistance = this.calculateIdealCameraDistance();
                this.gsap.to(this.camera.position, {
                    z: newDistance,
                    duration: 0.5,
                    ease: "power1.out"
                });
            }
        }
    }
}