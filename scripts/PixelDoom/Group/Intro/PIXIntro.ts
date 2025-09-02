import { hf_engine } from "../../../engine.js";
import { PIXLevel } from "../../Module/PIXLevel.js";
import { LayoutTransition, TransitionType } from "../../UI/layout_transition_ui/UILayoutTransition.js";

hf_engine.gl$_ubu_init(() => {
    if (hf_engine.runtime.layout.name == "Intro") {
        Intro.PlayIntroAnimation();
    }
})

class Intro {
    static async PlayIntroAnimation() {
        await IntroAnimation.PlayAnimation();
        // 等待动画播放完毕之后 
        await hf_engine.WAIT_TIME_FORM_PROMISE(5)
        Intro.JumpMinMenuLayout();
    }

    static JumpMinMenuLayout() {
        LayoutTransition.LeaveLayout(TransitionType.HOLE, 2, () => {
            //Hole 动画结束的时候再销毁这个 IntroAnimation
            IntroAnimation.destroyAnimation();
            // 在跳转
            hf_engine.runtime.goToLayout("MainMenu")
        })
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

    // Three.js and GSAP libraries
    private static THREE: any;
    private static FontLoader: any;
    private static TextGeometry: any;
    private static gsap: any;

    // Three.js objects
    private static scene: any | null;
    private static camera: any | null;
    private static renderer: any | null;
    private static textGroup: any;
    private static textWidth: number = 0;
    private static textHeight: number = 0;
    private static animationFrameId: number;

    private static async loadDependencies() {
        if (this.THREE) return; // already loaded

        if (!document.querySelector('script[type="importmap"]')) {
            const importMap = document.createElement('script');
            importMap.type = 'importmap';
            importMap.textContent = JSON.stringify({
                imports: {
                    "three": "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js",
                    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/",
                    "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.2/+esm"
                }
            });
            document.head.appendChild(importMap);
        }

        // @ts-ignore
        this.THREE = await import("three");
        // @ts-ignore
        const { FontLoader } = await import("three/addons/loaders/FontLoader.js");
        this.FontLoader = FontLoader;
        // @ts-ignore
        const { TextGeometry } = await import("three/addons/geometries/TextGeometry.js");
        this.TextGeometry = TextGeometry;
        // @ts-ignore
        const { gsap } = await import("gsap");
        this.gsap = gsap;
    }

    public static async PlayAnimation(): Promise<void> {
        await this.loadDependencies();

        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.zIndex = '999';
        document.body.appendChild(this.container);

        this.scene = new this.THREE.Scene();
        this.scene.background = new this.THREE.Color(0xffffff);

        this.camera = new this.THREE.PerspectiveCamera(
            45,
            this.CONFIG.useFixedDimensions ? this.CONFIG.gameWidth / this.CONFIG.gameHeight : this.CONFIG.gameAspectRatio,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new this.THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        this.updateRendererSize();

        this.setupLighting();
        this.createInterior();

        this.animate();
        window.addEventListener('resize', this.onWindowResize, false);

        const font = await new Promise<any>((resolve) => {
            const fontLoader = new this.FontLoader();
            fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font: any) => resolve(font));
        });

        const letters = this.createLetters(font);
        this.calculateFinalPositions(letters);
        this.setupCameraAnimation();
        await this.animateLetters(letters);
    }

    public static destroyAnimation(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
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

    private static updateRendererSize() {
        if (!this.container || !this.renderer || !this.camera) return;

        if (this.CONFIG.useFixedDimensions) {
            this.renderer.setSize(this.CONFIG.gameWidth, this.CONFIG.gameHeight);
            this.container.style.width = this.CONFIG.gameWidth + 'px';
            this.container.style.height = this.CONFIG.gameHeight + 'px';
            this.container.style.position = 'absolute';
            this.container.style.left = '50%';
            this.container.style.top = '50%';
            this.container.style.transform = 'translate(-50%, -50%)';
        } else if (this.CONFIG.maintainAspectRatio) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            let width, height;
            const windowRatio = windowWidth / windowHeight;
            const gameRatio = this.CONFIG.gameAspectRatio;
            if (windowRatio > gameRatio) {
                height = windowHeight;
                width = height * gameRatio;
            } else {
                width = windowWidth;
                height = width / gameRatio;
            }
            this.renderer.setSize(width, height);
            this.container.style.width = width + 'px';
            this.container.style.height = height + 'px';
            this.container.style.position = 'absolute';
            this.container.style.left = '50%';
            this.container.style.top = '50%';
            this.container.style.transform = 'translate(-50%, -50%)';
            this.camera.aspect = gameRatio;
            this.camera.updateProjectionMatrix();
        } else {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    private static setupLighting() {
        const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        const pointLight = new this.THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 5, 10);
        this.scene.add(pointLight);
    }

    private static createInterior() {
        const floorGeometry = new this.THREE.PlaneGeometry(200, 200);
        const floorMaterial = new this.THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.1,
            metalness: 0.1
        });
        const floor = new this.THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -10;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.scene.fog = new this.THREE.Fog(0xffffff, 70, 200);
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
        const aspect = this.CONFIG.useFixedDimensions
            ? this.CONFIG.gameWidth / this.CONFIG.gameHeight
            : this.CONFIG.gameAspectRatio;
        const fovRadians = this.camera.fov * (Math.PI / 180);
        const distanceForWidth = (this.textWidth / 2) / Math.tan(fovRadians / 2) / aspect;
        const distanceForHeight = (this.textHeight / 2) / Math.tan(fovRadians / 2);
        const padding = 1.3;
        return Math.max(distanceForWidth, distanceForHeight) * padding;
    }

    private static animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    private static onWindowResize = () => {
        if (!this.CONFIG.useFixedDimensions) {
            this.updateRendererSize();
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