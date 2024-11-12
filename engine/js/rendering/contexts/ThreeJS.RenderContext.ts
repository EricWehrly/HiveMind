import Rectangle from "../../baseTypes/rectangle";
import RenderContext from "../RenderContext";
import Renderer, { RenderMethodConstructorOptions } from "../renderer";
import * as THREE from 'three';
import threecam from '../Threecam';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { testCube } from "../TestCube";
import Debug from "../../ui/Debug";
import '../../util/three-extensions';

type RenderMethod = (context: WebGL2RenderingContext) => void;

function createCameraBorder() {
    const aspect = window.innerWidth / window.innerHeight;
    const distance = 20;

    const borderGeometry = new THREE.BufferGeometry();
    borderGeometry.setFromPoints([
        new THREE.Vector3(-distance * aspect, distance, 0),
        new THREE.Vector3(distance * aspect, distance, 0),
        new THREE.Vector3(distance * aspect, -distance, 0),
        new THREE.Vector3(-distance * aspect, -distance, 0),
        new THREE.Vector3(-distance * aspect, distance, 0)
    ]);

    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color for the border
    const border = new THREE.Line(borderGeometry, borderMaterial);

    return border;
    // scene.add(border);
}

export default class ThreeJSRenderContext extends RenderContext {

    private static _instance: ThreeJSRenderContext = null;
    static get Instance() { 
        if(!ThreeJSRenderContext._instance) new ThreeJSRenderContext();
        return ThreeJSRenderContext._instance;
    }

    private _canvasElement: HTMLCanvasElement;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;
    private _renderer: THREE.WebGLRenderer;
    private _controls: OrbitControls;

    get scene(): Readonly<THREE.Scene> { return this._scene; }
    get camera(): Readonly<THREE.Camera> { return this._camera; }

    constructor() {
        super();
        ThreeJSRenderContext._instance = this;
        this._scene = new THREE.Scene();
        // this._scene.background = new THREE.Color(0x556B2F);
        this._scene.background = new THREE.Color('#606060');
        this._camera = threecam;
        const cube = testCube();
        this._scene.add(cube);
        this._camera.lookAt(cube.position);

        this._canvasElement = document.createElement('canvas');
        this._canvasElement.id = 'ThreeJSRenderContext';
        document.body.appendChild(this._canvasElement);
        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvasElement });

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.onWindowResize();
        
        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.listenToKeyEvents( window ); // optional

        this.showGuides();
        Debug.Track(this.cameraRotation.bind(this), 'rotation: {0}');
        Debug.Track(this.cameraPosition.bind(this), 'position: {0}');
    }

    private cameraRotation() {
        return this._camera.rotation.toString();
    }

    private cameraPosition() {
        return this._camera.position.toString();;
    }

    private showGuides() {
        const gridHelper = new THREE.GridHelper(100, 100);
        this._scene.add(gridHelper);
        const axesHelper = new THREE.AxesHelper(50);
        this._scene.add(axesHelper);
        // this._scene.add(createCameraBorder());
    }

    onWindowResize() {
        this._canvasElement.width = window.innerWidth;
        this._canvasElement.height = window.innerHeight;
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    static RegisterRenderMethod(priority: number, method: RenderMethod, options?: RenderMethodConstructorOptions): void {
        if(!options?.context && !Renderer.HasRenderContext('WebGLRenderer')) {
            new ThreeJSRenderContext();
        }
        options = {
            context: options?.context || 'WebGLRenderer'
        };
        Renderer.RegisterRenderMethod(priority, method, options);
    }

    Render(screenRect: Rectangle, renderMethods: RenderMethod[]): void {
        this._controls.update(); // Update controls
        this._renderer.render(this._scene, this._camera);
    }
}

// we can statically define (probably IN static methods, rather than the file)
// various alternative canvas renderers, especially for things like "offscreen" that are tools for the main
