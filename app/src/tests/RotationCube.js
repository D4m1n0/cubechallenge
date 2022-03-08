import {useEffect, useRef} from "react";
import * as THREE from "three";
import {TrackballControls} from "three/examples/jsm/controls/experimental/CameraControls";
import {Interaction} from "three.interaction/src";

const colors = [
    "#DC422F", // x = 1
    "#FF6C00", // x = -1
    "#FFFFFF", // y = 1
    "#FDCC09", // y = -1
    "#009D54", // z = 1
    "#3D81F6"  // z = -1
]

const RotationCube = () => {
    const mount = useRef(null)

    const colorFace = (color) => {
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
    const face = () =>{
        let materials = Array.from({length:6}, () => { return 1 })
        for (let i = 0; i < 6; i++) {
            materials[i] = new THREE.MeshBasicMaterial({map: colorFace(colors[i])})
        }
        return materials
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const interaction = new Interaction(renderer, scene, camera)
        camera.position.z = 10
        const controls = new TrackballControls(camera, renderer.domElement)

        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const mesh = new THREE.Mesh(geometry, face())
        let group = new THREE.Object3D()
        group.add(mesh)

        group.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -(Math.PI/2))

        scene.add(group)

        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        const mousePosition = (e) => {
            mouse.x = (e.clientX / width) * 2 - 1
            mouse.y = - (e.clientY / height) * 2 + 1
            raycaster.setFromCamera( mouse, camera )
        }
        const mouseEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {
                console.log(intersects)
                controls.enableRotate = !controls.enableRotate
            }
        }
        const pointerOutEvent = (e) => {
            setTimeout(() => {
                controls.enableRotate = true
            }, 500)
        }
        const pointerMoveEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {

            }
        }

        window.addEventListener('mousedown', mouseEvent)
        window.addEventListener('mouseup', mouseEvent)
        window.addEventListener('pointermove', pointerMoveEvent)
        group.on("pointerout", pointerOutEvent)

        renderer.setClearColor('#9f9f9f')
        renderer.setSize(width, height)

        const renderScene = () => {
            renderer.render(scene, camera)
        }
        const handleResize = () => {
            width = mount.current.clientWidth
            height = mount.current.clientHeight
            renderer.setSize(width, height)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderScene()
        }
        const animate = () => {
            controls.update()

            renderScene()
            frameId = window.requestAnimationFrame(animate)
        }
        const start = () => {
            if (!frameId) {
                frameId = requestAnimationFrame(animate)
            }
        }
        const stop = () => {
            cancelAnimationFrame(frameId)
            frameId = null
        }
        mount.current.appendChild(renderer.domElement)
        window.addEventListener('resize', handleResize)
        start()
        return () => {
            stop()
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    return <div className="rubik" ref={mount} />
}

export default RotationCube