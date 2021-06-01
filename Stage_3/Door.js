import {GLTFLoader} from './libs/GLTFLoader.js';

class Door {//class for the door models on the side of the corridor

    constructor() {
        this._obj = null;

        //load model
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load('./models/door_2/scene.gltf', (model) => {
            const d = model.scene.children[0];

            // d.rotation.z += Math.PI;
            // d.position.x -= 30;
            // d.position.y += 0.4;
            // d.position.z += 0.005;
            // d.scale.set(0.003,0.0035, 0.0035);

            //positions the model
            d.position.x -= 30;
            d.position.y -= 0.3;
            d.position.z += 0.05;
            d.scale.set(0.008,0.008, 0.008);

            this._obj = d;
        });

    }

    get getDoor(){//returns the model as a 3D Object
        //loads model first, then returns
        return new Promise((resolve, reject) => { //asynchronous
            const checkUpIntervalId = setInterval(() => {
                if (this._obj != null){
                    clearInterval(checkUpIntervalId);
                    resolve(this._obj);
                }
            }, 300);
        });
    }

}

export {Door}