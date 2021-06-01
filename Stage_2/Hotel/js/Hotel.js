import {GLTFLoader} from "../libs/threejs/GLTFLoader.js";

export class Hotel{

    constructor() {
        this._Initialize();
    }

    /*
    the gltf in the line above gives us a lot about the 3D model.
    below, using the gltf w scene shows that we can have access to the position of the model etc
     */
    _Initialize(){
        const loader = new GLTFLoader();
        loader.load('models/hotel/scene.gltf', (gltf) => {  //<--we can inject gltf here into the scene
            console.log('model loaded');

            var camHotel = gltf.scene.children[0] //put position of camera inside the hotel. array. first child = scene
            //camHotel.scale.set(2,2,2);
            camHotel.position.set(-18, -2, 0.1);

            this._hotel = gltf.scene; //actual object
        });
    }

    getHotelObject(){
        return new Promise((resolve) => {
          const checkUpIntervalId = setInterval(() => {
              if (this._hotel){
                  clearInterval(checkUpIntervalId);
                  resolve(this._hotel);
              }
          }, 300);
        });
    }
}
