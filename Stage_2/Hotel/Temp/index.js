import * as THREE from '../libs/threejs/three.module.js';
import * as POINT_CONTROL from '../libs/threejs/PointerLockControls.js';

let scene, camera, renderer, controls;
let sidewaysMovement = 0, forwardsMovement = 0;
let initialTime, finalTime;

const createWorld = () => {

    init();

}

function keyDowns(e) {
    switch (e.code) {
        case 'KeyW':
            forwardsMovement = 1;
            break;
        case 'KeyS':
            forwardsMovement = -1;
            break;
        case 'KeyA':
            sidewaysMovement = -1;
            break;
        case 'KeyD':
            sidewaysMovement = 1;
            break;
        case 'KeyG':
            console.log(camera.position);
            break;
    }
}

function init(control) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75,
        window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 1;
    camera.position.x -= 0.2;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    controls = new POINT_CONTROL.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    window.addEventListener('keydown', (e) => {
        keyDowns(e);
    });

    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':
                forwardsMovement = 0;
                break;
            case 'KeyS':
                forwardsMovement = 0;
                break;
            case 'KeyA':
                sidewaysMovement = 0;
                break;
            case 'KeyD':
                sidewaysMovement = 0;
                break;
        }
    });

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

initialTime = Date.now();

const animate = (time) => {
    if (controls.isLocked === true) {
        finalTime = Date.now();
        controls.moveRight(sidewaysMovement * (finalTime - initialTime) / 1000);
        controls.moveForward(forwardsMovement * (finalTime - initialTime) / 1000);
        initialTime = finalTime;
    }
    renderer.render(scene, camera);
};

createWorld();