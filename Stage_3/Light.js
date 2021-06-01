import {GLTFLoader} from './libs/GLTFLoader.js';
import * as THREE from "./libs/three.module.js";
import {FlickeringLight} from './FlickeringLight.js';

class Light {//class for the ceiling lamp model and associated Flickering Light (point light)

    constructor() {
        this._light = new THREE.Group();//group to hold model and flickering light
        this._obj = null;
        this._fLight = null;

        //load model
        const gltfLoader = new GLTFLoader();//loader to implement GLTF model of the lamp
        gltfLoader.load('./models/ceiling_light/scene.gltf', (model) => {
            const d = model.scene.children[0];//access the correct model

            //position the model:
            d.position.y += 0.7;
            d.position.x -= 30.5;
            d.position.z -= 0.5;
            d.scale.set(0.02,0.02, 0.02);
            this._obj = d;
            this._light.add(d);//add model to light group

            this._fLight = new FlickeringLight(1.5);//create new Flickering light to add to the model
            const light = this._fLight.getLight;//get the point light object
            //position the light:
            light.position.x -= 30.5;
            light.position.z -= 0.5;
            light.position.y += 0.6;
            this._light.add(light);// add flickering light to light group
        });

    }

    flicker(time, off) {//function to either flicker the light (alternating pattern), or switch it off based on the 'off' parameter
        if (this._fLight !== null) {//checks if light has been initialised
            if (off) {
                this._fLight.offLight();//turns off the flickering light point light (sets intensity to 0)
            } else {
                this._fLight.flickerLight(time);//turns on the flickering animation for the point light (alternates intensity)
            }
        }
    }

    get getLight(){//returns the light group containing the model and flickering light
        //loads model first, then exports group
        return new Promise((resolve, reject) => { //asynchronous
            const checkUpIntervalId = setInterval(() => {
                if (this._obj != null){
                    clearInterval(checkUpIntervalId);
                    resolve(this._light);
                }
            }, 300);
        });
    }

}

export {Light}