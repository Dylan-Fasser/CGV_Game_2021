import {GLTFLoader} from "../libs/threejs/GLTFLoader.js";

export class BlueDoor{

    constructor() {
        this._Initialize();
    }

    /*
    The gltf in the line above gives us a lot about the 3D model.
    Below, using the gltf w scene shows that we can have access to the position of the model etc
     */
    _Initialize(){
        const loader = new GLTFLoader();
        loader.load('models/blue_door/scene.gltf', (gltf) => { //we can inject gltf here into the scene
            console.log('model loaded');

            var camDoor = gltf.scene.children[0] //In an array. first child = scene
            camDoor.position.set(-18.69385079241348, -5.7, -0.753553311384706);

            this._bluedoor = gltf.scene; //actual object
        });
    }

    getBlueDoorObject(){
        return new Promise((resolve) => {
            const checkUpIntervalId = setInterval(() => {
                if (this._bluedoor){
                    clearInterval(checkUpIntervalId);
                    resolve(this._bluedoor);
                }
            }, 300);
        });
    }
}
