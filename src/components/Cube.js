import * as THREE from "three";

const colors = [
    "#DC422F", // x = 1
    "#FF6C00", // x = -1
    "#FFFFFF", // y = 1
    "#FDCC09", // y = -1
    "#009D54", // z = 1
    "#3D81F6"  // z = -1
]
const MOVEMENTS = {
    "R": -(Math.PI/2),
    "L": Math.PI/2,
    "M": Math.PI/2,
    "U": Math.PI/2,
    "D": -(Math.PI/2),
    "E": -(Math.PI/2),
    "F": -(Math.PI/2),
    "B": Math.PI/2,
    "S": -(Math.PI/2),
}

class Cube {
    constructor(x, y, z, rotation, n) {
        this.position = {x: x, y: y, z: z}
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
        let materials = Array.from({length:6}, () => { return 1 })
        let black = this.colorFace("#000000");
        let temp = []
        temp.push(this.position.x === 1 ? this.colorFace(colors[0]) : black)
        temp.push(this.position.x === -1 ? this.colorFace(colors[1]) : black)
        temp.push(this.position.y === 1 ? this.colorFace(colors[2]) : black)
        temp.push(this.position.y === -1 ? this.colorFace(colors[3]) : black)
        temp.push(this.position.z === 1 ? this.colorFace(colors[4]) : black)
        temp.push(this.position.z === -1 ? this.colorFace(colors[5]) : black)
        for (let i = 0; i < temp.length; i++) {
            let m = new THREE.MeshBasicMaterial({map: temp[i]})
            // if(this.determinateCornerOrEdge() === 6 || this.determinateCornerOrEdge() === 0) {
            //     m.transparent = true;
            //     m.opacity = 0
            // }
            materials[i] = m
        }
        return materials
    }
    determinateAxisViaMovement(a) {
        let axis = {x: 0, y: 0, z: 0};
        axis[a] = 1;

        this.rotation = axis
        return axis
    }
    rotateOnAxis(axisString, angle, movement) {
        let axis = this.determinateAxisViaMovement(axisString)
        if(movement === "U" || movement === "D" || movement === "E") {
            angle = -angle
        }

        // this.cube.rotateOnAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
        this.cube.rotateOnWorldAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
    }
    translateCube(angle, axis) {
        let x, y, z = 0;
        if(axis === "y") {
            x = this.position.x * Math.round(Math.cos(angle)) - this.position.z * Math.sin(angle)
            z = this.position.x * Math.sin(angle) + this.position.z * Math.round(Math.cos(angle))
            this.position.x = x
            this.position.z = z
        } else if (axis === "x") {
            y = this.position.y * Math.round(Math.cos(angle)) - this.position.z * Math.sin(angle)
            z = this.position.y * Math.sin(angle) + this.position.z * Math.round(Math.cos(angle))
            this.position.y = y
            this.position.z = z
        } else if (axis === "z") {
            x = this.position.x * Math.round(Math.cos(angle)) - this.position.y * Math.sin(angle)
            y = this.position.x * Math.sin(angle) + this.position.y * Math.round(Math.cos(angle))
            this.position.x = x
            this.position.y = y
        }

        // console.log([this.position.x, this.position.y, this.position.z, this.n])

        this.cube.position.x = this.position.x === -0 ? 0 : this.position.x
        this.cube.position.y = this.position.y === -0 ? 0 : this.position.y
        this.cube.position.z = this.position.z === -0 ? 0 : this.position.z
    }
    update(movement, axis) {
        let reverse = 0
        if(movement.indexOf("'") > -1) {
            reverse = 1
            movement = movement.replace("'", "")
        }
        // let axis = MOVEMENTS[movement][0];
        let angle = reverse ? -MOVEMENTS[movement] : MOVEMENTS[movement]
        this.angle = angle

        this.rotateOnAxis(axis, angle, movement);
        this.translateCube(angle, axis)
    }
    determinateCornerOrEdge() {
        let type = Math.abs(this.position.x) + Math.abs(this.position.y) + Math.abs(this.position.z)
        if(type === 3) {
            return 6
        } else if(type === 2) {
            return 2
        }
        return 0
    }
    determinateFaceFromPosition() {
        let temp = []
        if(this.position.x === 1) temp.push("R")
        if(this.position.x === -1) temp.push("L")
        if(this.position.y === 1) temp.push("U")
        if(this.position.y === -1) temp.push("D")
        if(this.position.z === 1) temp.push("F")
        if(this.position.z === -1) temp.push("B")

        return temp
    }
    show() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        this.cube = new THREE.Mesh(geometry, this.face())
        this.cube.name = this.n

        this.cube.position.x = this.position.x
        this.cube.position.y = this.position.y
        this.cube.position.z = this.position.z

        this.cube.rotation.x = this.rotation[0]
        this.cube.rotation.y = this.rotation[1]
        this.cube.rotation.z = this.rotation[2]

        // console.log(this.determinateFaceFromPosition())

        return this.cube
    }
}

export default Cube;