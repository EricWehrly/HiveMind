import * as THREE from 'three';

let camera: THREE.Camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(20, 20, 20);
// camera.lookAt(_scene.position);
camera.lookAt(new THREE.Vector3(0, 0, 0));

function windowCameraReize() {
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    perspectiveCam.aspect = window.innerWidth / window.innerHeight;
    perspectiveCam.updateProjectionMatrix();
}

window.addEventListener('resize', windowCameraReize);
windowCameraReize();

export default camera;
