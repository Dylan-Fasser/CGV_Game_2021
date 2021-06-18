import * as THREE from './libs/threejs/three.module.js';
import {Hotel} from "./js/Hotel.js";
import {Door} from "./js/Door.js";
import {WoodenDoor} from "./js/WoodenDoor.js";
import {BlueDoor} from "./js/BlueDoor.js";

import {PointerLockControls} from "./libs/threejs/PointerLockControls.js";

import * as POINT_CONTROL from "./libs/threejs/PointerLockControls.js";

let scene, camera, renderer, controls, doorOne, doorTwo, doorThree ; // Setting these variables as global variables.

let sidewaysMovement = 0, forwardsMovement = 0; // for PointerLock Controls
let initialTime, finalTime;
let correctDoor; // for the random door selector

/**
 * createWorld allows us to build our scene.
 * @returns the scene we want to display
 */
const createWorld = () => {

    scene = new THREE.Scene(); // Creating the scene using Three.js
    camera = new THREE.PerspectiveCamera(45, window.innerWidth /window.innerHeight, 0.1, 200); // use of Perspective Camera to view our world
    // positioning the camera inside the hotel model
    camera.position.set(-18, -5.9, 0.4);

    /**
     * General light to scene because model will be dark
     * @type {AmbientLight}
     * The second number represents how much light we want on it, the intensity.
     * Ambient light will illuminate everything equally
     */
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    /**
     * Adding a Directional Light
     * @type {DirectionalLight}
     */
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(10, 10, 100); //set position of light
    scene.add(light);

    /**
     * Rendering the scene using Three.js.
     * Antialiasing allows us to draw curves but disabled by default
     * @type {WebGLRenderer}
     */
    renderer = new THREE.WebGLRenderer({antialias: true});

    /**
     * It will keep calling the animate function in the brackets
     * appendChild will attaches renderer to page
     */
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    /**
     * Resizing the web browser window
     * camera.aspect will change aspect ratio for camera
     * updateProjectionMatrix will ensure calculations done using aspect ratio gets updates to new ratio
     */
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth /window.innerHeight;
        camera.updateProjectionMatrix();
    });


    /**
     * Creates an instance of the Hotel, calling getHotelObject from Hotel.js file
     * This is for the variable for the outer object (the hotel)
     * The camera looks at the hotel
     * @type {Hotel}
     */
    const hotel = new Hotel();
    hotel.getHotelObject().then((object) => {
        scene.add(object);
        camera.lookAt(object.position);
    });

    /**
     * Allows u to position all the three doors, starting with the middle one (Blue Door)
     * Resizing the door to fit into the hotel
     * Position the door upright
     * Position the door on the ground/floor
     *@returns object that gets added to scene
     * @type {BlueDoor}
     */
    const doorOne = new BlueDoor();
    doorOne.getBlueDoorObject().then((object) => {
        object.scale.set(0.168, 0.168, 0.168); //
        object.position.set(-17.9, -5.7, -4.9);
        object.rotation.x = Math.PI / 240;
        object.rotation.y = Math.PI / 2;
        scene.add(object);
    });


    /**
     * The door on the right hand Side
     * @returns object that gets added to scene
     * Positions the door upright
     * @type {WoodenDoor}
     */
    const doorTwo = new WoodenDoor();
    doorTwo.getWoodenDoorObject().then((object) => {
        object.scale.set(0.011, 0.011, 0.011);
        object.position.set(-16.2, -6.8, -1.5);
        object.rotation.x = Math.PI / 270;
        object.rotation.y = Math.PI / -4.3;
        scene.add(object);

    });

    /**
     * The door on the left hand side
     * @returns object that gets added to scene
     * @type {Door}
     */
    const doorThree = new Door();
    doorThree.getDoorObject().then((object) => {
        object.scale.set(0.0095, 0.0095, 0.0095); //resizing the door
        object.position.set(-19.5, -6.7, -0.9);
        object.rotation.x = Math.PI / 270;
        object.rotation.y = Math.PI / 3.9;
        scene.add(object);
    });


    /**
     * This following line is a random selector, meaning the correct door would not remain fixed
     *rather it will alternate between the three doors
     *Generate random number between 0 and 2
     * @type {number}
     */
    correctDoor = Math.floor(Math.random() * 3);
    init();
};


/**
 * Checking the position of the camera relative to the door
 * Allowing the results to be displayed (i.e "block")
 */
const doorOutcome = () => {

    // door 1
    if ((camera.position.x >= -18.3 && camera.position.x <= 17) && (camera.position.z >= -1.9 && camera.position.z <= -1.3 )) {
        if (correctDoor === 0){
            showCorrectDoorOutCome();
        }
        else{
            showIncorrectDoorOutCome();
        }
    }

    else if (camera.position.x < -18 && camera.position.z < -1.9 ) {
        document.getElementById('outcomeFail').style.display = 'none';
    }

    //door 2
    if (camera.position.x >= -16.6 && camera.position.z >= -1.7) {
        if (correctDoor === 1){
            showCorrectDoorOutCome();
        }
        else{
            showIncorrectDoorOutCome();
        }
    }

    else if (camera.position.x < -16.6 && camera.position.z < -1.7) {
        document.getElementById('outcomeFail').style.display = 'none';
    }

    //door 3
    if (((camera.position.x >= -19.5 && camera.position.x <= 18) && (camera.position.z >= -0.9 && camera.position.z <= -0.7 ))) {
        if (correctDoor === 2){
            showCorrectDoorOutCome();
        }
        else{
            showIncorrectDoorOutCome();
        }
    }

    else if (camera.position.x < -19.5 && camera.position.z < -0.7 ) {
        document.getElementById('outcomeFail').style.display = 'none';
    }
}

const showCorrectDoorOutCome = () => {
    document.getElementById('outcomePass').style.display = 'block';
}

const showIncorrectDoorOutCome = () => {
    document.getElementById('outcomeFail').style.display = 'block';
}

/**
 * To enable keyboard movement of the PointerLock Control (WASD)
 *@return forwardsMovement
 * @param e
 */
function keyDowns(e) {
    switch (e.code) {
        case 'KeyW': // move forward
            forwardsMovement = 1;
            break;
        case 'KeyS':  // moves backwards
            forwardsMovement = -1;
            break;
        case 'KeyA': // moves to the left
            sidewaysMovement = -1;
            break;
        case 'KeyD': //moves to the right
            sidewaysMovement = 1;
            break;
        case 'KeyG': //when the console is open it logs in the position of the player (camera)
            console.log(camera.position); //to know the position of where the camera is
            break;
    }
}

/**
 * Implementing PointerLock Controls
 * Initialises variables and on event listeners, and loads models
 */
function init() {

    controls = new POINT_CONTROL.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        controls.lock();
        var music = document.getElementById('bg_music')
        music.volume = 0.3;
        music.play();
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
}

initialTime = Date.now();

/**
 * Enables the scene to animate and allow movement of camera as well.
 * @param time
 */
const animate = (time) => {
    //to keep track of where to place the objects
    if (controls.isLocked === true) {
        finalTime = Date.now();
        controls.moveRight(sidewaysMovement * (finalTime - initialTime) / 1000);
        controls.moveForward(forwardsMovement * (finalTime - initialTime) / 1000);
        initialTime = finalTime;
    }
    renderer.render(scene, camera);

    doorOutcome();
};

createWorld();