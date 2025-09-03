import { Unreal__ } from "../../../engine.js";

Unreal__.GameBegin(()=>{
    // Initialize Three.js module
    ThreeJs3D.initialize();
})

/**
 * ThreeJs3D - A utility class for accessing Three.js and related libraries
 * This class handles loading Three.js dependencies and provides basic utilities
 * for creating and managing 3D scenes.
 */
class ThreeJs3D {
    // Core Three.js libraries
    private static THREE: any;
    private static FontLoader: any;
    private static TextGeometry: any;
    private static gsap: any;
    private static librariesLoaded = false;

    /**
     * Initialize the Three.js module
     */
    public static async initialize(): Promise<void> {
        await this.loadDependencies();
    }

    /**
     * Load Three.js and related dependencies
     */
    public static async loadDependencies(): Promise<void> {
        if (this.librariesLoaded) return; // already loaded

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

        this.librariesLoaded = true;
    }

    /**
     * Get the Three.js library
     * @returns The Three.js library
     */
    public static async getThree(): Promise<any> {
        if (!this.librariesLoaded) {
            await this.loadDependencies();
        }
        return this.THREE;
    }

    /**
     * Get the FontLoader from Three.js
     * @returns The FontLoader
     */
    public static async getFontLoader(): Promise<any> {
        if (!this.librariesLoaded) {
            await this.loadDependencies();
        }
        return this.FontLoader;
    }

    /**
     * Get the TextGeometry from Three.js
     * @returns The TextGeometry
     */
    public static async getTextGeometry(): Promise<any> {
        if (!this.librariesLoaded) {
            await this.loadDependencies();
        }
        return this.TextGeometry;
    }

    /**
     * Get the GSAP library
     * @returns The GSAP library
     */
    public static async getGSAP(): Promise<any> {
        if (!this.librariesLoaded) {
            await this.loadDependencies();
        }
        return this.gsap;
    }

    /**
     * Load a font using Three.js FontLoader
     * @param url URL to the font file
     * @returns Promise resolving to the loaded font
     */
    public static async loadFont(url: string = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'): Promise<any> {
        if (!this.librariesLoaded) {
            await this.loadDependencies();
        }
        
        return new Promise<any>((resolve) => {
            const fontLoader = new this.FontLoader();
            fontLoader.load(url, (font: any) => resolve(font));
        });
    }

    /**
     * Create a container element for a Three.js scene
     * @param zIndex Z-index for the container
     * @returns The created container element
     */
    public static createContainer(zIndex: string = '999'): HTMLDivElement {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = zIndex;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Remove a container element from the DOM
     * @param container The container element to remove
     */
    public static removeContainer(container: HTMLDivElement): void {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    /**
     * Update renderer size based on configuration
     * @param renderer The Three.js renderer
     * @param camera The Three.js camera
     * @param container The container element
     * @param config Configuration options
     */
    public static updateRendererSize(renderer: any, camera: any, container: HTMLDivElement, config: any): void {
        if (!container || !renderer || !camera) return;
        
        if (config.useFixedDimensions) {
            renderer.setSize(config.gameWidth, config.gameHeight);
            container.style.width = config.gameWidth + 'px';
            container.style.height = config.gameHeight + 'px';
            container.style.position = 'absolute';
            container.style.left = '50%';
            container.style.top = '50%';
            container.style.transform = 'translate(-50%, -50%)';
        } else if (config.maintainAspectRatio) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            let width, height;
            const windowRatio = windowWidth / windowHeight;
            const gameRatio = config.gameAspectRatio;
            if (windowRatio > gameRatio) {
                height = windowHeight;
                width = height * gameRatio;
            } else {
                width = windowWidth;
                height = width / gameRatio;
            }
            renderer.setSize(width, height);
            container.style.width = width + 'px';
            container.style.height = height + 'px';
            container.style.position = 'absolute';
            container.style.left = '50%';
            container.style.top = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            camera.aspect = gameRatio;
            camera.updateProjectionMatrix();
        } else {
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Set up standard lighting for a scene
     * @param scene The Three.js scene
     * @param options Lighting options
     */
    public static setupStandardLighting(scene: any, options?: any): void {
        if (!scene) return;
        
        const opts = {
            ambientIntensity: 0.5,
            directionalIntensity: 0.8,
            pointIntensity: 0.5,
            ...options
        };
        
        // Ambient light
        const ambientLight = new this.THREE.AmbientLight(0xffffff, opts.ambientIntensity);
        scene.add(ambientLight);
        
        // Directional light with shadows
        const directionalLight = new this.THREE.DirectionalLight(0xffffff, opts.directionalIntensity);
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
        scene.add(directionalLight);
        
        // Point light
        const pointLight = new this.THREE.PointLight(0xffffff, opts.pointIntensity);
        pointLight.position.set(-10, 5, 10);
        scene.add(pointLight);
    }

    /**
     * Create a basic floor for a scene
     * @param scene The Three.js scene
     * @param options Floor options
     */
    public static createBasicFloor(scene: any, options?: any): void {
        if (!scene) return;
        
        const opts = {
            size: 200,
            color: 0xf5f5f5,
            y: -10,
            roughness: 0.1,
            metalness: 0.1,
            ...options
        };
        
        const floorGeometry = new this.THREE.PlaneGeometry(opts.size, opts.size);
        const floorMaterial = new this.THREE.MeshStandardMaterial({
            color: opts.color,
            roughness: opts.roughness,
            metalness: opts.metalness
        });
        const floor = new this.THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = opts.y;
        floor.receiveShadow = true;
        scene.add(floor);
    }

    /**
     * Add fog to a scene
     * @param scene The Three.js scene
     * @param color Fog color
     * @param near Near distance
     * @param far Far distance
     */
    public static addFog(scene: any, color: number = 0xffffff, near: number = 70, far: number = 200): void {
        if (!scene) return;
        scene.fog = new this.THREE.Fog(color, near, far);
    }

    /**
     * Calculate ideal camera distance to fit an object
     * @param camera The Three.js camera
     * @param width Object width
     * @param height Object height
     * @param config Configuration options
     * @param padding Padding factor (1.0 = exact fit)
     * @returns Ideal camera distance
     */
    public static calculateIdealCameraDistance(
        camera: any, 
        width: number, 
        height: number, 
        config: any, 
        padding: number = 1.3
    ): number {
        if (!camera) return 50;
        
        const aspect = config.useFixedDimensions
            ? config.gameWidth / config.gameHeight
            : config.gameAspectRatio;
        const fovRadians = camera.fov * (Math.PI / 180);
        const distanceForWidth = (width / 2) / Math.tan(fovRadians / 2) / aspect;
        const distanceForHeight = (height / 2) / Math.tan(fovRadians / 2);
        
        return Math.max(distanceForWidth, distanceForHeight) * padding;
    }

    /**
     * 尝试加载Three.js库，如果超时则抛出错误
     * @param timeoutMs 超时时间（毫秒）
     * @returns 是否加载成功
     */
    public static async loadWithTimeout(timeoutMs: number = 5000): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            // 设置超时
            const timeout = setTimeout(() => {
                console.error(`Three.js loading timed out after ${timeoutMs}ms`);
                resolve(false);
            }, timeoutMs);
            
            try {
                await this.loadDependencies();
                clearTimeout(timeout);
                resolve(true);
            } catch (error) {
                console.error("Failed to load Three.js:", error);
                clearTimeout(timeout);
                resolve(false);
            }
        });
    }
}

// Export the ThreeJs3D class
export { ThreeJs3D };