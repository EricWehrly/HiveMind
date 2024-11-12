import * as THREE from 'three';

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 1000;

let camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    -1000,
    1000
);

// Set the camera position to an isometric angle
camera.position.set(20, 20, 20);
camera.lookAt(new THREE.Vector3(0, 0, 0));

function windowCameraReize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', windowCameraReize);
windowCameraReize();

export default camera;
