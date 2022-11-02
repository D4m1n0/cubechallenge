import * as THREE from "three"
import {Vector3} from "three";

const colors = [
    "#DC422F", // x = 1
    "#FF6C00", // x = -1
    "#FFFFFF", // y = 1
    "#FDCC09", // y = -1
    "#009D54", // z = 1
    "#3D81F6"  // z = -1
]
const MOVEMENTS = {
    "R": -(Math.PI/2), "r": -(Math.PI/2), "3r": -(Math.PI/2), "Rw": -(Math.PI/2),
    "L": Math.PI/2, "l": Math.PI/2, "3l": Math.PI/2, "Lw": Math.PI/2,
    "U": -(Math.PI/2), "u": -(Math.PI/2), "3u": -(Math.PI/2), "Uw": -(Math.PI/2),
    "D": Math.PI/2, "d": Math.PI/2, "3d": Math.PI/2, "Dw": Math.PI/2,
    "F": -(Math.PI/2), "f": -(Math.PI/2), "3f": -(Math.PI/2), "Fw": -(Math.PI/2),
    "B": Math.PI/2, "b": Math.PI/2, "3b": Math.PI/2, "Bw": Math.PI/2,
    "M": Math.PI/2,
    "E": Math.PI/2,
    "S": -(Math.PI/2),
}

class Cube {
    constructor(x, y, z, rotation, n) {
        this.position = {x: x, y: y, z: z}
        this.n = n
        this.size = 1
        this.type = ""
        this.originalColor = 0
        this.rotation = rotation
    }
    faceColor(color) {
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

        ctx.beginPath();
        ctx.font = "60px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.n, canvas.width / 2, (canvas.height / 2) + 20);
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
            materials.push(new THREE.MeshBasicMaterial({map: this.faceColor(colors[i])}))
        }
        return materials
    }
    determinateAxisViaMovement(a) {
        let axis = {x: 0, y: 0, z: 0};
        axis[a] = 1;

        return axis
    }
    rotateOnAxis(axisString, angle) {
        let axis = this.determinateAxisViaMovement(axisString)
        // this.cube.rotateOnWorldAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
        this.cube.rotateOnAxis(new THREE.Vector3(axis.x, axis.y, axis.z), angle)
        this.rotation.x = this.cube.rotation.x
        this.rotation.y = this.cube.rotation.y
        this.rotation.z = this.cube.rotation.z
        if(this.n === 26) {
            console.log(this.rotation, Math.sin(this.rotation.y), Math.cos(this.rotation.y))
        }
    }
    translateCube(angle, axis) {
        let x, y, z = 0;
        if(axis === "y") {
            x = this.position.x * Math.round(Math.cos(angle)) - this.position.z * Math.sin(angle)
            z = this.position.x * Math.sin(angle) + this.position.z * Math.round(Math.cos(angle))
            this.position.x = -x
            this.position.z = -z
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

        this.cube.position.x = this.position.x === -0 ? 0 : this.position.x
        this.cube.position.y = this.position.y === -0 ? 0 : this.position.y
        this.cube.position.z = this.position.z === -0 ? 0 : this.position.z
    }
    checkOriginalPosition() {

    }
    update(movement, axis) {
        let reverse = 0
        if(movement.indexOf("'") > -1) {
            reverse = 1
            movement = movement.replace("'", "")
        }
        let angle = reverse ? -MOVEMENTS[movement] : MOVEMENTS[movement]

        this.rotateOnAxis(axis, angle)
        // this.translateCube(angle, axis)
    }
    setPosition(position, name, maxPosition) {
        this.position = position
        this.originalPosition = {x: position.x, y: position.y, z: position.z}
        const calculatedTypeArray = [position.x, position.y, position.z]
        const occurrence = calculatedTypeArray.filter(x => Math.abs(x)===maxPosition).length
        if(occurrence === 3) {
            this.type = "corner"
        } else if(occurrence === 2) {
            this.type = "edge"
        } else {
            let indexArray = calculatedTypeArray.findIndex((el) => Math.abs(el) === maxPosition)
            let colorCenterIndex = indexArray*2
            if(Math.sign(calculatedTypeArray[indexArray]) === -1) colorCenterIndex = (indexArray*2)+1
            this.originalColor = colors[colorCenterIndex]
            if(calculatedTypeArray.filter(x => x===0).length === 2) {
                this.type = "center-stoic"
            } else if(calculatedTypeArray.filter(x => x===0).length === 1) {
                this.type = "center-edge"
            } else {
                this.type = "center-corner"
            }
        }
        this.n = name
    }
    setSize(size) {
        this.size = size
    }
    setVisible(visible=true) {
        this.visible = visible
    }
    setLookAt(obj) {
        this.cube.lookAt(obj.position.x, obj.position.y, obj.position.z)
    }
    show() {
        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size)
        const axesHelper = new THREE.AxesHelper( 5 );
        this.cube = new THREE.Mesh(geometry, this.face())
        this.cube.add(axesHelper)
        this.cube.name = this.n

        this.cube.position.x = this.position.x
        this.cube.position.y = this.position.y
        this.cube.position.z = this.position.z

        this.cube.rotation.x = 0
        this.cube.rotation.y = 0
        this.cube.rotation.z = 0
        this.cube.visible = this.visible

        return this.cube
    }
}

export default Cube;
