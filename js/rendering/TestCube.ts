import * as THREE from 'three';

export function testCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xffa500, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);

    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube for some basic animation
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    animate();

    return cube;
}

function init() {
    // Create the scene
    const scene = new THREE.Scene();

    // Create a camera, which determines what we'll see when we render the scene
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a renderer and attach it to our document
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a geometry and a material then combine them into a mesh
    const cube = testCube();

    // Add the cube to our scene
    scene.add(cube);

    // Create a render loop that will draw our scene every time the screen is refreshed (typically 60 times per second)
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube for some basic animation
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }

    // Run the animation loop for the first time to kick things off
    animate();
}

// Initialize the scene when the window loads
// window.onload = init;