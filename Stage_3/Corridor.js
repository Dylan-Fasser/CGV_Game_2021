import * as THREE from './libs/three.module.js';
import {Door} from "./Door.js";
import {Light} from "./Light.js";

class Corridor {//class to hold the ceiling, walls, floor of the corridor and the doors and lights in it

    constructor() {
        this._corridor = new THREE.Group();//group to hold the ceiling, walls, floor, doors and lights

        //Creating floor, ceiling and walls:
        const floor = this._generateFloor('textures/carpet.jpg', 100);//creates a plane for the floor using the appropriate texture
        //positions the floor and adds it to the corridor group
        floor.rotation.x = Math.PI / 2;
        floor.position.y -= 0.3;
        this._corridor.add(floor);

        const ceiling = this._generateFloor('textures/wall.jpg', 100);//creates a plane for the ceiling using the appropriate texture
        //positions the ceiling and adds it to the corridor group
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y += 0.7;
        this._corridor.add(ceiling);

        const wall2 = this._generateFloor('textures/tile.jpg', 200);//creates a plane for the wall using the appropriate texture
        //positions the wall and adds it to the corridor group
        wall2.position.y -= 0.3;
        this._corridor.add(wall2);

        const wall3 = this._generateFloor('textures/tile.jpg', 200);//creates a plane for the wall using the appropriate texture
        //positions the wall and adds it to the corridor group
        wall3.position.y -= 0.3;
        wall3.position.z -= 1;
        this._corridor.add(wall3);

        //Creating doors:
        this._doors = new THREE.Group();//group to hold all the doors
        for (let i = 0; i < 16; i++) {
            let d = new Door().getDoor.then(door => {//doors on the right side of the corridor
                door.position.x += i * 5;//setting the door further down the corridor
                this._doors.add(door);
            });
            d = new Door().getDoor.then(door => {//doors on the left side of the corridor
                door.position.x += (i + 0.1) * 5;//setting the door further down the corridor
                door.position.z -= 0.975;
                this._doors.add(door);
            });
        }
        this._corridor.add(this._doors);

        //Creating Lights:
        this._lights1 = [];//array to hold all the lights to use the flickering animations per index successfully
        this._lights = new THREE.Group();//group to hold all the lights
        for (let i = 0; i < 10; i++) {
            let l = new Light();
            this._lights1.push(l);
            l.getLight.then(light => {
                light.position.x += i * 10;//setting the light further down the corridor
                this._lights.add(light);
            });

        }
        this._corridor.add(this._lights);

        //initialises the progress counts for the door animations
        this._closeProgress = 0;
        this._openProgress = 0;
    }

    flick(time, index, off) {//function to either flicker the light (alternating pattern), or switch it off based on the 'off' parameter
        if (this._lights1[index] !== null) {//checks the light has been initialised
            this._lights1[index].flicker(time, off);
        }
    }

    findClosestDoor(pos) {//finds the index of the door closest to the player (given by the camera's position)
        let minDist = Infinity;
        let minIndex = 0;
        let minPos = 0;
        for (let index = 0; index < this._doors.children.length; index++) {//loops through all doors
            if (this._doors.children[index] !== undefined && this._doors.children[index].position.z > -0.4) {//checks if door is initialised and on right side
                const dist = this._doors.children[0].position.x - pos.z + 1;
                const x = Math.abs(this._doors.children[index].position.x - dist);//checks distance to door from player
                if (x < minDist) {//if distance is minimum, updates min
                    minDist = x;
                    minIndex = index;
                    minPos = this._doors.children[index].position;
                }
            }
        }
        // console.log(pos, minPos, minDist, minIndex);
        return minIndex;
    }

    closeDoor(index, reset) {//animation to close a specific door, if reset is true then the animation is starting from the beginning, else it is continuing
        if (this._doors.children[index] !== undefined) {//checks if door is initialised
            if (reset) {//resets progress (to begin animation from beginning)
                this._closeProgress = 0;
            }
            let speed = 0.05;//speed of animation

            //updates progress and checks if animation is complete (if progress is too much)
            this._closeProgress += speed * Math.PI / 2;
            if (this._closeProgress > Math.PI / 2) {
                return 1;//if animation is complete, ends funtion without performing animation step
            }

            //animation step (updating position of door)
            this._doors.children[index].rotation.z -= speed * Math.PI / 2;
            this._doors.children[index].position.x += speed * 0.12;
            this._doors.children[index].position.z += speed * 0.275;
        }
    }

    openDoor(index, reset) {//animation to open a specific door, if reset is true then the animation is starting from the beginning, else it is continuing
        if (this._doors.children[index] !== undefined) {//checks if door is initialised
            if (reset) {//resets progress (to begin animation from beginning)
                this._openProgress = 0;
            }
            let speed = 0.05;//speed of animation

            //updates progress and checks if animation is complete (if progress is too much)
            this._openProgress += speed * Math.PI / 2;
            if (this._openProgress > Math.PI / 2) {
                return;//if animation is complete, ends funtion without performing animation step
            }

            //animation step (updating position of door)
            this._doors.children[index].rotation.z += speed * Math.PI / 2;
            this._doors.children[index].position.x -= speed * 0.12;
            this._doors.children[index].position.z -= speed * 0.275;
        }
    }

    get getCorridor() {//returns the group containing the floor, ceiling, walls, doors and lights
        return this._corridor;
    }


    _generateFloor(texture, repeat, rep2 = repeat) {//creates a plane to act as a wall, floor or ceiling
        //takes in texture to use and repeat options for the texture

        //creates texture
        const groundTexture = new THREE.TextureLoader().load(texture);
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(repeat, rep2);

        //creates plane
        const geometry = new THREE.PlaneGeometry(80, 80, 32);
        const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, map: groundTexture});
        return new THREE.Mesh(geometry, material);
    }

}

export {Corridor};