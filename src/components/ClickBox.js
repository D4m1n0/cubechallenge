import * as THREE from "three";
import {Interaction} from "../../node_modules/three.interaction/src/index";

class ClickBox {
    constructor(x, y, z, n, axis) {
        this.x = x
        this.y = y
        this.z = z
        this.n = n
        this.axis = axis
    }
    click() {
        let n = this.n
        this.obj.on("click", function(e) {
            console.log("salut", n)
        })
    }
    show() {
        const geometry = new THREE.PlaneGeometry( 0.5, 0.8 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        material.transparent = true;
        material.opacity = 0.5
        this.obj = new THREE.Mesh(geometry, material)

        this.obj.position.x = this.x
        this.obj.position.y = this.y
        this.obj.position.z = this.z
        this.obj.name = this.n
        this.obj.rotation[this.axis] = Math.PI/2
        // this.obj.rotation.y = Math.PI/2
        // this.obj.rotation.z = Math.PI/2

        this.click()

        return this.obj
    }
}

export default ClickBox