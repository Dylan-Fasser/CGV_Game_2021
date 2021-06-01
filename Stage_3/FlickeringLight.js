import * as THREE from './libs/three.module.js';

class FlickeringLight {//class for lights with the 'flickering' animation

    constructor(intensity) {//sets intensity (brightness) of the light
        this._intensity = intensity;
        this._pointLight = new THREE.PointLight( 0xf5abab, intensity, 15 );//lights are from lamps so used point lights
    }

    get getLight() {//returns the light to be accessed from other classes
        return this._pointLight;
    }

    offLight() {//turns the lights intensity to zero (turns it off)
        this._pointLight.intensity = 0;
    }

    flickerLight(time) {//"flickering" animation, uses time from scene
        //checks the time for a set pattern, alternating the light between off an on
        const t = time%4500;
        if (t < 3000) {
            this._pointLight.intensity = this._intensity;
        } else if (t < 3200) {
            this._pointLight.intensity = 0;
        } else if (t < 3400) {
            this._pointLight.intensity = this._intensity;
        } else {
            this._pointLight.intensity = 0;
        }
    }

}

export {FlickeringLight};