import * as THREE from "three";
import { useRef, useEffect} from "react";
import {Interaction} from "../../node_modules/three.interaction/src/index";
import {TrackballControls} from "three/examples/jsm/controls/experimental/CameraControls";

const OrbitControls = require('three-orbit-controls')(THREE);

const RubikCube = ({cubeArray, getCubesFromMovement, scramble}) => {
    const mount = useRef(null)
    const controls = useRef(null)

    const movementWithScramble = (movements, index) => {
        let double = movements[index].indexOf("2") > -1 ? 1 : 0
        let movement = double ? movements[index].replace("2", "") : movements[index]
        movements[index] = movement
        if(double) {
            movements.splice(index, 0, movement)
        }

        let cubeMovement = getCubesFromMovement(movement)
        for (let i = 0; i < cubeMovement.length; i++) {
            cubeMovement[i][0].update(movement, cubeMovement[i][1])
        }
        setTimeout(() => {
            if(index < movements.length-1) {
                index += 1
                movementWithScramble(movements, index)
            }
        }, 500)
    }

    const maxValue = (obj) => {
        let max = ["x", obj.x]
        if(Math.abs(obj.y) > Math.abs(max[1])) {
            max = ["y", obj.y]
        }
        if(Math.abs(obj.z) > Math.abs(max[1])) {
            max = ["z", obj.z]
        }
        max[1] = Math.floor(max[1])
        max[1] = Math.abs(max[1]) === 2 ? max[1] / 2 : max[1]
        return max
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        // const axesHelper = new THREE.AxesHelper( 5 );
        // scene.add( axesHelper );
        const interaction = new Interaction(renderer, scene, camera);

        camera.position.z = 10
        const controls = new TrackballControls(camera, renderer.domElement)
        controls.enablePan = false
        let group = new THREE.Object3D()

        for (let i = 0; i < cubeArray.length; i++) {
            group.add(cubeArray[i].show())
        }
        scene.add(group)
        group.name = "rubik"

        let movements = scramble.split(" ");

        movementWithScramble(movements, 0)
        // cubeArray[0].cube.position.x = -2
        // TODO Click for move
        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        let normal = []
        let p1, p2, pSave

        const mousePosition = (e) => {
            mouse.x = (e.clientX / width) * 2 - 1
            mouse.y = - (e.clientY / height) * 2 + 1
            raycaster.setFromCamera( mouse, camera )
        }

        const pointerOutEvent = (e) => {
            if(p2 === undefined) {
                p2 = pSave

                console.log(p1, p2, normal)
            }

            setTimeout(() => {
                controls.enableRotate = true
            }, 500)
        }

        const pointerMoveEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {
                if(p1 !== undefined) {
                    pSave = intersects[0].object.position
                }
            }
        }

        const mouseEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {
                // console.log(intersects[0])
                if(e.type === "mousedown") {
                    normal = maxValue(intersects[0].point)
                    p1 = intersects[0].object.position
                }
                if(e.type === "mouseup") {
                    p2 = intersects[0].object.position
                    // TODO remove normal from {p1} and {p2}
                    // TODO know what is != between {p1} and {p2}
                    // TODO same = axis, different = direction
                    // TODO axis = layer,
                    // TODO find movement with face and axis
                    // let cubeMovement = getCubesFromMovement([1, "z"])
                    // for (let i = 0; i < cubeMovement.length; i++) {
                    //     cubeMovement[i][0].update("F", cubeMovement[i][1])
                    // }
                    console.log(p1, p2, normal)
                }
                if(e.type !== "pointermove") controls.enableRotate = !controls.enableRotate

            }
        }

        const getFace = (e) => {
            console.log(e.data.target)
        }

        window.addEventListener('mousedown', mouseEvent)
        // group.on('mousedown', getFace)
        window.addEventListener('mouseup', mouseEvent)
        window.addEventListener('pointermove', pointerMoveEvent)
        group.on("pointerout", pointerOutEvent)

        renderer.setClearColor('#9f9f9f')
        renderer.setSize(width, height)

        const renderScene = () => {
            raycaster.setFromCamera( mouse, camera )
            const intersects = raycaster.intersectObjects( scene.children );
            for (let i = 0; i < intersects.length; i++) {
                // console.log(intersects[i])
            }
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
            // group.rotation.x += 0.01
            // group.rotation.y += 0.01

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

        // controls.current = { start, stop }

        return () => {
            stop()
            window.removeEventListener('resize', handleResize)
            // mount.current.removeChild(renderer.domElement)

            // scene.remove(cube)
            // geometry.dispose()
            // material.dispose()
        }
    }, [])

    return <div className="rubik" ref={mount} />
}

export default RubikCube;