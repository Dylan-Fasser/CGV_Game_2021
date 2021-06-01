import * as THREE from './libs/three.module.js';
import * as POINT_CONTROL from './libs/PointerLockControls.js';
import * as ORBIT_CONTROL from './libs/OrbitControls.js';
import {Corridor} from './Corridor.js';
import {FBXLoader} from './libs/FBXLoader.js';

//initialise global variables:
let scene, camera, renderer, controls;
let corr;//corridor (including doors and lights)
let ambient;//ambient sound
let monsterState = -1;//current monster attacking (-1 represents no monster)
let doorIndex;//holds the index of the closest door to the player
let timer = -1;//timer for attack events (-1 represents timer has not started)
let deathScreen, finishScreen;//screens for death and completion events
let flickerLights = true;//signifies whether lights should run their flicker animations or not

//used for controls
let sidewaysMovement = 0, forwardsMovement = 0;
let initialTime, finalTime;

//used to control the door animations
let dstart = false;
let open = false;
let reset = false;

//used to control monster model animations and timing
let MutantJumpMixer, MutantJumpAction, MutantJumpModel;
let MutantIdleMixer, MutantIdleAction, MutantIdleModel, MutantDone = false;
let ZombieJumpMixer, ZombieJumpAction, ZombieJumpModel;
let ZombieIdleMixer, ZombieIdleAction, ZombieIdleModel, ZombieDone = false;
let DemonJumpMixer, DemonJumpAction, DemonJumpModel;
let DemonIdleMixer, DemonIdleAction, DemonIdleModel, DemonDone = false;
let EndWalkMixer, EndWalkAction, EndWalkModel;

const createWorld = () => {

    //initialises variables and on event listeners, and loads models
    init(true);//if true, uses PointerLock controls, Orbit otherwise

    //adds the corridor to the scene (including doors and lights)
    corr = new Corridor();
    const c = corr.getCorridor;
    //positions the corridor:
    c.rotation.y += Math.PI / 2;
    c.position.x += 0.3;
    c.position.y -= 0.15;
    c.position.z -= 30;
    scene.add(c);
}

//initialises variables and on event listeners, and loads models
function init(control) {
    //initialises scene, camera and renderer:
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

    //initialises event screen popups
    deathScreen = document.getElementById('death');
    deathScreen.style.display = 'none';
    finishScreen = document.getElementById('finish');
    finishScreen.style.display = 'none';

    //loads constant audio for the background of the scene
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    ambient = new THREE.Audio(audioListener);
    scene.add(ambient);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("./audio/singing.mp3",
        function (audioBuffer) {
            ambient.setBuffer(audioBuffer);
            ambient.setVolume(0.2);//lowers volume of audio
        });

    if (control) {//pointerlock controls
        //initialises controls and instruction screens
        controls = new POINT_CONTROL.PointerLockControls(camera, document.body);
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', function () {//on clicking on instructions, begin game
            controls.lock();//begin controls
            ambient.play();//play background music
        });

        controls.addEventListener('lock', function () {//when controls begin, disable instruction screens
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        controls.addEventListener('unlock', function () {//when controls end, re-enable instruction screens
            blocker.style.display = 'block';
            instructions.style.display = '';
        });
    } else {//orbit controls
        controls = new ORBIT_CONTROL.OrbitControls(camera, renderer.domElement);
    }

    window.addEventListener('keydown', (e) => {//listener for key presses
        switch (e.code) {
            //handle player movement trackers:
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

            //testing
            // case 'KeyG':
            //     console.log(camera.position);
            //     break;
            // case 'KeyM':
            //     ambient.stop();
            //     break;
            // case 'KeyF':
            //     doorIndex = corr.findClosestDoor(camera.position);
            //     dstart = true;
            //     break;
            // case 'KeyH':
            //     dstart = false;
            //     break;
            // case 'KeyJ':
            //     DemonIdleAction.play();
            //     break;
            // case 'Digit7':
            //     window.location.reload();
            //     break;

            //handle player action buttons
            case 'Digit1':
                userAction(2);
                break;
            case 'Digit2':
                userAction(1);
                break;
            case 'Digit3':
                userAction(0);
                break;
            case 'Digit4':
                userAction(3);
                break;
        }
    });

    window.addEventListener('keyup', (e) => {//listener for key releases, handles player movement trackers
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

    window.addEventListener('resize', () => {//listener to resize screen to correct dimensions if window is resized
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    //loads monster models
    loadZombieJump();
    loadZombieIdle();
    loadMutantJump();
    loadMutantIdle();
    loadDemonJump();
    loadDemonIdle();
    loadEndWalk();
}

//plays specific audio based on parameter (used for user actions and monster event noises)
function actionAudio(m) {
    switch (m) {
        case 0://monster 1, mutant
            playAudio("LionGrowl.ogg");
            break;
        case 1://monster 2, zombie
            playAudio("BabyLaugh.mp3");
            break;
        case 2://monster 3, demon
            playAudio("BabyScream.mp3");
            break;
        case 3://monster 4, end
            playAudio("AlienScream.mp3");
            break;
    }
}

//displays death screen and reloads window after a few seconds
function death() {
    deathScreen.style.display = 'block';//displays death screen
    actionAudio(monsterState);//plays audio for the specific monster's death event
    setTimeout(function () {
        window.location.reload();//reloads page after timeout
    }, 3000);
}

//displays stage finish screen and reloads window after a few seconds
function finish() {
    finishScreen.style.display = 'block';
    setTimeout(function () {
        window.location.reload();//reloads page after timeout
    }, 3000);
}

//dictates what happens when user presses their action buttons
function userAction(m) {
    actionAudio(m);//plays appropriate sound
    //if a monster is attacking and the correct button is pressed (within a time limit), ends the monster attack successfully
    if (monsterState === m && Date.now() - timer < 2500) monsterStop(m);
}

//loads the jump animation for the first monster
function loadMutantJump() {
    let loader = new FBXLoader();
    loader.load('./models/MutantRight.fbx', (object) => {
        //positions the model
        object.position.z -= 5.2;
        object.position.y -= 0.4;
        object.position.x += 0.415;
        object.scale.set(0.004, 0.004, 0.004);

        //initialises the animation action
        MutantJumpMixer = new THREE.AnimationMixer(object);
        MutantJumpAction = MutantJumpMixer.clipAction(object.animations[0]);
        MutantJumpAction.setLoop(THREE.LoopOnce);

        MutantJumpMixer.addEventListener('finished', function (e) {//adds listener for the end of the animation
            MutantJumpModel.visible = false;//makes the model invisible
            if (!MutantDone) MutantIdleModel.visible = true;//makes the idle model visible
            MutantIdleAction.play();//plays the idle animation
        });

        //adds the model to the scene
        MutantJumpModel = object;
        scene.add(MutantJumpModel);
        MutantJumpModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the jump animation for the second monster
function loadZombieJump() {
    let loader = new FBXLoader();
    loader.load('./models/ZombieRight.fbx', (object) => {
        //positions the model
        object.position.z -= 20.2;
        object.position.y -= 0.4;
        object.position.x += 0.35;
        object.scale.set(0.003, 0.003, 0.003);

        //initialises the animation action
        ZombieJumpMixer = new THREE.AnimationMixer(object);
        ZombieJumpAction = ZombieJumpMixer.clipAction(object.animations[0]);
        ZombieJumpAction.setLoop(THREE.LoopOnce);

        ZombieJumpMixer.addEventListener('finished', function (e) {//adds listener for the end of the animation
            ZombieJumpModel.visible = false;//makes the model invisible
            if (!ZombieDone) ZombieIdleModel.visible = true;//makes the idle model visible
            ZombieIdleAction.play();//plays the idle animation
        });

        //adds the model to the scene
        ZombieJumpModel = object;
        scene.add(ZombieJumpModel);
        ZombieJumpModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the jump animation for the third monster
function loadDemonJump() {
    let loader = new FBXLoader();
    loader.load('./models/DemonRight.fbx', (object) => {
        //positions the model
        object.position.z -= 25.2;
        object.position.y -= 0.4;
        object.position.x += 0.35;
        object.scale.set(0.003, 0.003, 0.003);

        //initialises the animation action
        DemonJumpMixer = new THREE.AnimationMixer(object);
        DemonJumpAction = DemonJumpMixer.clipAction(object.animations[0]);
        DemonJumpAction.setLoop(THREE.LoopOnce);

        DemonJumpMixer.addEventListener('finished', function (e) {//adds listener for the end of the animation
            DemonJumpModel.visible = false;//makes the model invisible
            if (!DemonDone) DemonIdleModel.visible = true;//makes the idle model visible
            DemonIdleAction.play();//plays the idle animation
        });

        //adds the model to the scene
        DemonJumpModel = object;
        scene.add(DemonJumpModel);
        DemonJumpModel.visible = false;//sets the model to invisible
    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the walk animation for the final monster
function loadEndWalk() {
    let loader = new FBXLoader();
    loader.load('./models/EndForward.fbx', (object) => {
        //positions the model
        object.position.z -= 43.2;
        object.position.y -= 0.4;
        object.position.x -= 0.2;
        object.scale.set(0.003, 0.003, 0.003);

        //initialises the animation action
        EndWalkMixer = new THREE.AnimationMixer(object);
        EndWalkAction = EndWalkMixer.clipAction(object.animations[0]);
        EndWalkAction.setLoop(THREE.LoopOnce);

        //adds the model to the scene
        EndWalkModel = object;
        scene.add(EndWalkModel);
        EndWalkModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the idle animation for the first monster
function loadMutantIdle() {
    let loader = new FBXLoader();
    loader.load('./models/MutantIdle.fbx', (object) => {
        //positions the model
        object.position.z -= 5.2;
        object.position.y -= 0.4;
        object.position.x -= 0.3;
        object.scale.set(0.004, 0.004, 0.004);

        //initialises the animation action
        MutantIdleMixer = new THREE.AnimationMixer(object);
        MutantIdleAction = MutantIdleMixer.clipAction(object.animations[1]);

        //adds the model to the scene
        MutantIdleModel = object;
        scene.add(MutantIdleModel);
        MutantIdleModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the idle animation for the second monster
function loadZombieIdle() {
    let loader = new FBXLoader();
    loader.load('./models/ZombieIdle.fbx', (object) => {
        //positions the model
        object.position.z -= 20.2;
        object.position.y -= 0.4;
        object.position.x -= 0.35;
        object.scale.set(0.003, 0.003, 0.003);

        //initialises the animation action
        ZombieIdleMixer = new THREE.AnimationMixer(object);
        ZombieIdleAction = ZombieIdleMixer.clipAction(object.animations[0]);

        //adds the model to the scene
        ZombieIdleModel = object;
        scene.add(ZombieIdleModel);
        ZombieIdleModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//loads the idle animation for the third monster
function loadDemonIdle() {
    let loader = new FBXLoader();
    loader.load('./models/DemonIdle.fbx', (object) => {
        //positions the model
        object.position.z -= 25.2;
        object.position.y -= 0.4;
        object.position.x -= 0.35;
        object.scale.set(0.003, 0.003, 0.003);

        //initialises the animation action
        DemonIdleMixer = new THREE.AnimationMixer(object);
        DemonIdleAction = DemonIdleMixer.clipAction(object.animations[1]);

        //adds the model to the scene
        DemonIdleModel = object;
        scene.add(DemonIdleModel);
        DemonIdleModel.visible = false;//sets the model to invisible

    }, null, (e) => {
        console.log('error', e);
    });
}

//begins a monster attack event
function monsterJump(m) {
    playAudio("door_open.mp3");//plays door opening sound
    doorIndex = corr.findClosestDoor(camera.position);//determines closest door to open
    timer = Date.now();//begins timer
    dstart = true;//begins door animations

    //based on which monster it is, play the correct monster sound, make its jump model visible, begin its jump animation and update the monsterState to track the monster
    switch (m) {
        case 0:
            playAudio("MutantGrowl.ogg");
            MutantJumpModel.visible = true;
            MutantJumpAction.play();
            monsterState = 0;
            break;
        //after the first monster, also reset the door animations by updating open and reset variables
        case 1:
            playAudio("ZombieGroan.mp3");
            open = false;
            reset = true;
            ZombieJumpModel.visible = true;
            ZombieJumpAction.play();
            monsterState = 1;
            break;
        case 2:
            playAudio("laugh.ogg");
            open = false;
            reset = true;
            DemonJumpModel.visible = true;
            DemonJumpAction.play();
            monsterState = 2;
            break;
    }
}

//ends a monster attack event successfully
function monsterStop() {
    timer = -1;//ends the timer
    open = !open;//reverses the state of open for the door animations
    //based on which monster it was, set its idle model to invisible and play the door close sound
    switch (monsterState) {
        case 0:
            MutantDone = true;
            MutantIdleModel.visible = false;
            playAudio("door_close.mp3");
            break;
        case 1:
            ZombieDone = true;
            ZombieIdleModel.visible = false;
            playAudio("door_close.mp3");
            break;
        case 2:
            DemonDone = true;
            DemonIdleModel.visible = false;
            playAudio("door_close.mp3");
            break;
        case 3://for the final omster, dont play the door close sound and instead restart the light flicker animations
            EndWalkModel.visible = false;
            flickerLights = true;
            finish();
            break;
    }
    monsterState = -1;
    reset = true;
}

//handles the final monster attack event
function endEvent() {
    playAudio("door_open.mp3");//plays appropriate sounds
    playAudio("EndLaugh.mp3");

    //stops the lights from running their flickering animation, instead setting them to be completely off
    flickerLights = false;
    corr.flick(0, 4, true);
    corr.flick(0, 5, true);
    corr.flick(0, 7, true);

    setTimeout(function () {
        //after a timeout, make the final monster model visible and play its animation
        EndWalkModel.visible = true;
        EndWalkAction.play();
        monsterState = 3;//update monsterState for ending the event
        timer = Date.now();//start the timer
    }, 1000);
}

//plays the parameterised audio file
function playAudio(url) {
    let audio = new Audio("./audio/" + url);
    audio.play();
}

//handles the door animations based on status variables updated through monster attack events
function Doors(index) {
    if (open) {//if the door is currently open, run the close door animation
        if (corr.closeDoor(index, reset) === 1) {//if the close door animation has finished, end the animations
            dstart = false;
        }
    } else {//if the door is currently closed, run the open door animation
        corr.openDoor(index, reset);
    }
    reset = false;//make reset false as we are in the middle of an animation
}

//initialises variables used for animations
initialTime = Date.now();
const clock = new THREE.Clock();
let rdyMutant = true;
let rdyDeath = true;
let rdyShuffle = true;
let rdyCreak = true;
let rdyZombie = true;
let rdyDemon = true;
let rdyThunder = true;
let rdyEnd = true;

//animation function
const animate = (time) => {
    //updates mixers for the monster animations
    const c = clock.getDelta();
    if (MutantJumpMixer) MutantJumpMixer.update(c);
    if (MutantIdleMixer) MutantIdleMixer.update(c);
    if (ZombieJumpMixer) ZombieJumpMixer.update(c);
    if (ZombieIdleMixer) ZombieIdleMixer.update(c);
    if (DemonJumpMixer) DemonJumpMixer.update(c);
    if (DemonIdleMixer) DemonIdleMixer.update(c);
    if (EndWalkMixer) EndWalkMixer.update(c);

    if (controls.isLocked === true) {//if the controls are active
        finalTime = Date.now();

        //perform the user's input
        controls.moveRight(sidewaysMovement * (finalTime - initialTime) / 1000);
        controls.moveForward(forwardsMovement * (finalTime - initialTime) / 1000);

        //if the input puts the player out of bounds, undo the input
        if (camera.position.x < -0.58 || camera.position.x > 0.18 || camera.position.z >= 9) {
            controls.moveRight(-sidewaysMovement * (finalTime - initialTime) / 1000);
            controls.moveForward(-forwardsMovement * (finalTime - initialTime) / 1000);

        } else if (rdyShuffle && camera.position.z <= 0) {//if the player has passed the trigger point
            rdyShuffle = false;//disable the point from triggering again
            playAudio("shuffle.ogg");//play the appropriate audio file
        } else if (rdyMutant && camera.position.z <= -3.8) {//if the player has passed the trigger point
            rdyMutant = false;//disable the point from triggering again
            monsterJump(0);//initiate the appropriate monster attack
        } else if (rdyCreak && camera.position.z <= -10.15) {//if the player has passed the trigger point
            rdyCreak = false;//disable the point from triggering again
            playAudio("giggle.mp3");//play the appropriate audio file
        } else if (rdyZombie && camera.position.z <= -19) {//if the player has passed the trigger point
            rdyZombie = false;//disable the point from triggering again
            monsterJump(1);//initiate the appropriate monster attack
        } else if (rdyDemon && camera.position.z <= -24) {//if the player has passed the trigger point
            rdyDemon = false;//disable the point from triggering again
            monsterJump(2);//initiate the appropriate monster attack
        } else if (rdyThunder && camera.position.z <= -33) {//if the player has passed the trigger point
            rdyThunder = false;//disable the point from triggering again
            playAudio("thunder.mp3");//play the appropriate audio file
        } else if (rdyEnd && camera.position.z <= -41.1) {//if the player has passed the trigger point
            rdyEnd = false;//disable the point from triggering again
            endEvent();//initiate the final monster attack
        }
        initialTime = finalTime;//update the time for the controls
    }

    //if the door animations should be running
    if (dstart) {
        Doors(doorIndex);//run the door animation for the closest door
    }

    //if a monster attack event has started and the user has not pressed the correct action button in time
    if (rdyDeath && monsterState !== -1 && timer !== -1) {
        if (Date.now() - timer > 3000) {
            rdyDeath = false;
            death();//kill the player (show the death screen)
        }
    }

    corr.flick(time, 1, false);//flicker the first light
    if (flickerLights) {//if the other lights flicker animations should be running, run them
        corr.flick(time * 2, 4, false);
        corr.flick(time * 3, 5, false);
        corr.flick(time * 3, 7, false);
        corr.flick(time * 3, 9, false);
    }

    renderer.render(scene, camera);//render the scene
};

createWorld();