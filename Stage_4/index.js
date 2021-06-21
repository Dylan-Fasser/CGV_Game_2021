
import * as THREE from './three.js-master/build/three.module.js'
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js'
import { FBXLoader } from './three.js-master/examples/jsm/loaders/FBXLoader.js'
//import { SkeletonUtils } from './three.js-master/examples/jsm/utils/SkeletonUtils'
import {Scenediscriptor} from './Scenediscriptor.js'
import {Tree} from './Tree.js';
//import { Clock } from "./three.js-master/build/three.module.js";


let zombieMixer, zombieAction,zombieMixer2, zombieAction2,zombieMixer3, zombieAction3,zombieMixer4, zombieAction4,zombieMixer5, zombieAction5,zombieMixer6, zombieAction6,zombieMixer7, zombieAction7,zombieMixer8, zombieAction8,zombieMixer9, zombieAction9,zombieMixer1, zombieAction1,zombieMixer0, zombieAction0;
let sceneFaceSet = new Scenediscriptor().Scene1;
let sound = document.getElementById("running");
let scream = document.getElementById("Scream");

let camera, scene, renderer, pControl
let xdir = 0, zdir = 0
let posI, posF, vel, delta
//initialising jump paremetres
let jump = false,yi,vi,t,ti

//resizing the size of the screen with window change
window.addEventListener( 'resize' , function(){
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width /height;
    camera.updateProjectionMatrix();
});
//creating the scene and skybox view
scene = new THREE.Scene();
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    './models/xpos.png',
    './models/xneg.png',
    './models/ypos.png',
    './models/yneg.png',
    './models/zpos.png',
    './models/zneg.png']);
scene.background = texture;
scene.fog = new THREE.Fog(0xffffff, 0, 500)


zombie0();
zombie();
zombie1();
zombie2();
zombie3();
zombie4();
zombie5();
zombie6();
zombie7();
zombie8();
zombie9();

const groundtexture = new THREE.TextureLoader().load('./models/g3.jpg');
groundtexture.wrapS = THREE.RepeatWrapping;
groundtexture.wrapT = THREE.RepeatWrapping;
groundtexture.repeat.set(20,50);
const geometry = new THREE.PlaneGeometry( 2000,5000,5);
const material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide,map: groundtexture});
let ground = new THREE.Mesh( geometry, material );
scene.add( ground );
ground.rotation.x = Math.PI/2;
ground.position.y = -10;
ground.position.z = -20;

scene.add(new THREE.HemisphereLight(0xffffff))

//adjusting camera angle
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 905.241952371404, 8.969974374999998, 97.42546785842129)

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild( renderer.domElement );

const LightSetup = () => {

    let lights = new THREE.PointLight(0xff0000, 1, 100);
    lights.position.set(5, 5, 5);
    scene.add(lights);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 1000, 100);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 100;
    spotLight.shadow.mapSize.height = 1080;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);

    let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(38,10%,84%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240,11%,93%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    let backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    let lightR = new THREE.PointLight(0xff0000, 1, 100);
    lightR.position.set(50, 50, 50);

    let lightL = new THREE.PointLight(0xff0000, 1, 100);
    lightR.position.set(50, 50, -50);

    let moon = new THREE.DirectionalLight(new THREE.Color('hsl(38,10%,84%)'), 1.0);
    keyLight.position.set(-500, 0, 0);

    scene.add(moon);
    scene.add(lightR);
    scene.add(lightL);
    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);
}



LightSetup();

pControl = new PointerLockControls(camera, renderer.domElement)

//response handler for onclicks this handles the keyboard key responses
document.getElementById('play_game').onclick = ()=>{
    let menu = document.getElementById("menu");
    menu.style.display = "none" // Hide the Menu
    pControl.lock()
}
document.addEventListener('keydown', (e)=>{
    switch (e.keyCode) {

        case 37:
            sound.play();
            xdir = -1
            break;
        case 38:
            sound.play()
            zdir = 1
            break;
        case 39:
            sound.play()
            xdir = 1
            break;
        case 40:
            sound.play()
            zdir = -1
            break;
        case 32:
            ti = Date.now()
            jump = true
            break;


    }
})

document.addEventListener('keyup', (e)=>{
    switch (e.keyCode) {
        case 37:
            sound.pause();
            xdir = 0
            break;
        case 38:
            sound.pause();
            zdir = 0
            break;
        case 39:
            sound.pause();
            xdir = 0
            break;
        case 40:
            sound.pause();
            zdir = 0
            break;
        case 82:
            window.location.reload();
            break;
    }
})
let ambint = new THREE.AmbientLight(0xfffff);
scene.add(ambint);

let collidableObjs = [];


function zombie() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 110;
        object.position.x = 870;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer = new THREE.AnimationMixer(object);
            zombieAction = zombieMixer.clipAction(anim.animations[0]);
            zombieAction.play();
        });
        scene.add(object);
        collidableObjs.push(object);



    });


}
function zombie2() {
    let loader2 = new FBXLoader();
    loader2.load('./models/zombie.fbx', (object2) => {

        object2.position.z = 60;
        object2.position.x = 800;
        object2.scale.set(0.07, 0.07, 0.07);
        object2.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer2 = new THREE.AnimationMixer(object2);
            zombieAction2 = zombieMixer2.clipAction(anim.animations[0]);
            zombieAction2.play();
        });
        scene.add(object2);
        collidableObjs.push(object2);



    });


}
function zombie3() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 83;
        object.position.x = 400;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer3 = new THREE.AnimationMixer(object);
            zombieAction3 = zombieMixer3.clipAction(anim.animations[0]);
            zombieAction3.play();
        });
        scene.add(object);
        collidableObjs.push(object);



    });


}
function zombie4() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 97;
        object.position.x = 300;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer4 = new THREE.AnimationMixer(object);
            zombieAction4 = zombieMixer4.clipAction(anim.animations[0]);
            zombieAction4.play();
        });
        scene.add(object);
        collidableObjs.push(object);



    });


}
function zombie5() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 70;
        object.position.x = 200;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer5 = new THREE.AnimationMixer(object);
            zombieAction5 = zombieMixer5.clipAction(anim.animations[0]);
            zombieAction5.play();
        });
        scene.add(object);
        collidableObjs.push(object);



    });


}
function zombie6() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 60;
        object.position.x = 650;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer6 = new THREE.AnimationMixer(object);
            zombieAction6 = zombieMixer6.clipAction(anim.animations[0]);
            zombieAction6.play();
        });
        scene.add(object);
        collidableObjs.push(object);



    });


}
function zombie7() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 90;
        object.position.x = 100;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer7 = new THREE.AnimationMixer(object);
            zombieAction7 = zombieMixer7.clipAction(anim.animations[0]);
            zombieAction7.play();
        });
        scene.add(object);
        collidableObjs.push(object);


    });


}
function zombie8() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 90;
        object.position.x = 100;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer8 = new THREE.AnimationMixer(object);
            zombieAction8 = zombieMixer8.clipAction(anim.animations[0]);
            zombieAction8.play();
        });
        scene.add(object);
        collidableObjs.push(object);


    });


}
function zombie9() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 90;
        object.position.x = -50;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer9 = new THREE.AnimationMixer(object);
            zombieAction9 = zombieMixer9.clipAction(anim.animations[0]);
            zombieAction9.play();
        });
        scene.add(object);
        collidableObjs.push(object);


    });


}
function zombie1() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 90;
        object.position.x = -120;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer1 = new THREE.AnimationMixer(object);
            zombieAction1 = zombieMixer1.clipAction(anim.animations[0]);
            zombieAction1.play();
        });
        scene.add(object);
        collidableObjs.push(object);


    });


}
function zombie0() {
    let loader = new FBXLoader();
    loader.load('./models/zombie.fbx', (object) => {

        object.position.z = 60;
        object.position.x = -200;
        object.scale.set(0.07, 0.07, 0.07);
        object.traverse(d => {
            d.castShadow = true;
        });

        const anim = new FBXLoader();
        anim.load('./models/Walking.fbx',( anim ) => {
            zombieMixer0 = new THREE.AnimationMixer(object);
            zombieAction0 = zombieMixer0.clipAction(anim.animations[0]);
            zombieAction0.play();
        });
        scene.add(object);
        collidableObjs.push(object);


    });


}
const meshInMaterial = new THREE.MeshBasicMaterial();
meshInMaterial.visible = false;
const meshIn = new THREE.Mesh(new THREE.BoxGeometry(5,25,10), meshInMaterial);
meshIn.position.set(camera.position.x, camera.position.y, camera.position.z);
/*const box = new THREE.BoxHelper(meshIn,0xffff00);
box.visible = false;
box.position.set( 905.241952371404, 8.969974374999998, 97.42546785842129);*/
scene.add(meshIn);

//this is where i put the obticles (i should create a separate function to handle all this code afterwards cos now hai)
let buildStage = (sceneFaceSet) =>
{
    let Xpos = 820;
    for (let i = 0; i < sceneFaceSet.length; i++) {
        const rowDesc = sceneFaceSet[i];
        let Zpos = 50;
        for(let j = 0; j< rowDesc.length; j++){
            const desc = rowDesc[j];

            switch (desc){
                case 1:

                    var cubeMaterials = [
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                        new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./models/fire.jpg'), side: THREE.DoubleSide}),
                    ]
                    let mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(5,10,25),
                        new THREE.MeshFaceMaterial(cubeMaterials)
                    )
                    mesh.position.z = Zpos;
                    mesh.position.x = Xpos;
                    scene.add(mesh)
                    collidableObjs.push(mesh);

                    break;
            }
            Zpos += 10;
        }
        Xpos -= 10;
    }
}
buildStage(sceneFaceSet);



const genTree = (dir = 1) => {

    //const loader2 = new GLTFLoader();
    let tree = new Tree("light");

    for (let i = 0; i < 1400; i++) {

        let j = -500;
        /* loader2.load('./models/untitled3.glb', function (gltf) {

        let source = gltf.scene;
        let copy = THREE.SkeletonUtils.clone(source);
        for (let i = 0; i < 500; i++) {
            let j = -500;

            copy.position.x += i + j - 10;
            copy.position.y += 100;
            if (i % 2 === 0) {
                copy.position.z += dir * 150;
            } else {
                copy.position.z += dir * 15;
            }
            scene.add(copy);

        }
        scene.add(gltf.scene)
    })
}*/
        let clone_tree = tree._group.clone();
        clone_tree.scale.set(40, 40, 40);
        clone_tree.position.x += i + j - 10;
        clone_tree.position.y += 90;
        if (i % 2 === 0) {
            clone_tree.position.z += dir * 150;
        } else {
            clone_tree.position.z += dir * 15;
        }
        scene.add(clone_tree);
    }
}
/*function detectCollision(camera){
    const CameraBox = new THREE.Box3().setFromObject(camera);
    for(){
        const collidableObj = collidableObjs[obj];
        const object = collidableObj[0];
        const type = collidableObj[1];

        if(CameraBox.intersectsBox(object)){
            console.log("you fu***d up")
        }
    }
}
detectCollision(camera);*/

genTree();


posI = Date.now()
vel = 50
yi = 10
vi = 20


const clock = new THREE.Clock();

const checkForCollisions = () => {
    let BoundingBox = new THREE.Box3().setFromObject(meshIn);
    for(let i = 0; i < collidableObjs.length; i++){
        const obj = collidableObjs[i];
        let object = new THREE.Box3().setFromObject(obj);
        let intersect = BoundingBox.intersectsBox(object);
        if(intersect){
            location.href = "game_over.html";
            scream.play();

        }
    }
}
if(camera.position.x === -473){location.href = "Done.html"
}

animate()
//this function is responsible for the doing of things lol
function animate() {

    const c = clock.getDelta();
    // if (barrierMixer) barrierMixer.update(c);
    if (zombieMixer) zombieMixer.update(c);
    if (zombieMixer2) zombieMixer2.update(c);
    if (zombieMixer3) zombieMixer3.update(c);
    if (zombieMixer4) zombieMixer4.update(c);
    if (zombieMixer5) zombieMixer5.update(c);
    if (zombieMixer6) zombieMixer6.update(c);
    if (zombieMixer7) zombieMixer7.update(c);
    if (zombieMixer8) zombieMixer8.update(c);
    if (zombieMixer9) zombieMixer9.update(c);
    if (zombieMixer1) zombieMixer1.update(c);
    if (zombieMixer0) zombieMixer0.update(c);

    requestAnimationFrame(animate);
console.log(camera.position);

    if (pControl.isLocked === true) {
        posF = Date.now()

        delta = (posF - posI) / 1000

        let xDis = xdir * vel * delta
        let zDis = zdir * vel * delta

        //animating the jump
        if (jump) {
            //we need to make the jump look like a human that is effected by gravity
            t = ((Date.now() - ti) / 350) * 1.5
            let yDist = yi + (vi * t) - (0.5 * 9.8 * Math.pow(t, 2))
            if (yDist <= yi) jump = false
            camera.position.y = yDist
            //meshIn.position.y = yDist
        }

        pControl.moveRight(xDis)
        pControl.moveForward(zDis)
        //meshIn.position.x = camera.position.x;
        //meshIn.position.z = camera.position.z;
        //console.log(box.position);
        posI = posF
    }


    meshIn.position.set(camera.position.x, camera.position.y, camera.position.z);
    checkForCollisions();

    renderer.render(scene, camera);
}


