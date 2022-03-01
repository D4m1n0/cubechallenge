import * as THREE from "three";

const colors = [
    "#DC422F",
    "#FF6C00",
    "#FFFFFF",
    "#FDCC09",
    "#009D54",
    "#3D81F6"
]
const MOVEMENTS = {
    "R": ["x", -(Math.PI/2)],
    "L": ["x", Math.PI/2],
    "M": ["x", Math.PI/2],
    "U": ["y", Math.PI/2],
    "D": ["y", -(Math.PI/2)],
    "E": ["y", Math.PI/2],
    "F": ["z", -(Math.PI/2)],
    "B": ["z", Math.PI/2],
    "S": ["z", -(Math.PI/2)]
}

class Cube {
    constructor(x, y, z, rotation, n) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.n = n;
        this.rotation = rotation;
        this.angle = 0
    }
    colorFace(color) {
        let canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.rect(0,0,128,128);
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000000";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        let image = new Image();
        image.src = canvas.toDataURL();

        let texture = new THREE.Texture(image);
        texture.anisotropy = 4;
        texture.needsUpdate = true;

        return texture;
    }
    face () {
        let materials = []
        for (let i = 0; i < 6; i++) {
            let texture = this.colorFace(colors[i])
            let m = new THREE.MeshBasicMaterial({map: texture})
            // if(this.n !== 26) {
            //     m.transparent = true;
            //     m.opacity = 0.5
            // }
            materials.push(m)
        }
        return materials
    }
    // determinateAxisViaMovement(movement) {
    //     let axis = {x: 0, y: 0, z: 0};
    //     if(movements[0].indexOf(movement) !== -1) {
    //         axis.z = 1
    //     } else if(movements[1].indexOf(movement) !== -1) {
    //         axis.x = 1
    //     } else {
    //         axis.y = 1
    //     }
    //     this.rotation = axis
    //     return axis
    // }
    determinateAxisViaMovement(a) {
        let axis = {x: 0, y: 0, z: 0};
        axis[a] = 1;

        this.rotation = axis
        return axis
    }
    // determineAngleViaMovement(movement) {
    //     let angle = "";
    //     if(angles.indexOf(movement) === -1) {
    //         angle = Math.PI/2
    //     } else {
    //         angle = -(Math.PI/2)
    //     }
    //     this.angle = angle
    //     return angle
    // }
    rotateOnAxis(axisString, angle) {
        let axis = this.determinateAxisViaMovement(axisString)

        // this.cube.rotateOnAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
        this.cube.rotateOnWorldAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
    }
    translateCube(angle, axis) {
        let x, y, z = 0;
        if(axis === "y") {
            x = this.x * Math.round(Math.cos(angle)) - this.z * Math.sin(angle)
            z = this.x * Math.sin(angle) + this.z * Math.round(Math.cos(angle))
            this.x = x
            this.z = z
        } else if (axis === "x") {
            y = this.y * Math.round(Math.cos(angle)) - this.z * Math.sin(angle)
            z = this.y * Math.sin(angle) + this.z * Math.round(Math.cos(angle))
            this.y = y
            this.z = z
        } else if (axis === "z") {
            x = this.x * Math.round(Math.cos(angle)) - this.y * Math.sin(angle)
            y = this.x * Math.sin(angle) + this.y * Math.round(Math.cos(angle))
            this.x = x
            this.y = y
        }

        // console.log([this.x, this.y, this.z, this.n])

        this.cube.position.x = this.x === -0 ? 0 : this.x
        this.cube.position.y = this.y === -0 ? 0 : this.y
        this.cube.position.z = this.z === -0 ? 0 : this.z
    }
    update(movement) {
        let reverse = 0
        if(movement.indexOf("'") > -1) {
            reverse = 1
            movement = movement.replace("'", "")
        }
        let axis = MOVEMENTS[movement][0];
        let angle = reverse ? -MOVEMENTS[movement][1] : MOVEMENTS[movement][1]
        this.angle = angle

        this.rotateOnAxis(axis, angle);
        this.translateCube(angle, axis)
    }
    show() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        this.cube = new THREE.Mesh(geometry, this.face())

        this.cube.position.x = this.x
        this.cube.position.y = this.y
        this.cube.position.z = this.z

        this.cube.rotation.x = this.rotation[0]
        this.cube.rotation.y = this.rotation[1]
        this.cube.rotation.z = this.rotation[2]

        return this.cube
    }
}

export default Cube;