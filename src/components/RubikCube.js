import * as THREE from "three";
import { useRef, useEffect} from "react";
import {Interaction} from "../../node_modules/three.interaction/src/index";
import {TrackballControls} from "three/examples/jsm/controls/experimental/CameraControls";
import {TweenMax} from  "gsap/TweenMax"

const OrbitControls = require('three-orbit-controls')(THREE);

const move = {
    "x": [
        ["L", "L'"],
        ["M", "M'"],
        ["R'", "R"]
    ],
    "y": [
        ["D'", "D"],
        ["E'", "E"],
        ["U", "U'"]
    ],
    "z": [
        ["B", "B'"],
        ["S", "S'"],
        ["F'", "F"]
    ]
}

const RubikCube = ({cubeArray, getCubesFromMovement, scramble}) => {
    const mount = useRef(null)
    const controls = useRef(null)

    const movementWithScramble = (movements, index, group) => {
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


        // setTimeout(() => {
        //     if(index < movements.length-1) {
        //         index += 1
        //         movementWithScramble(movements, index)
        //     }
        // }, 500)
        if(index < movements.length-1) {
            index += 1
            movementWithScramble(movements, index, group)
        }
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

    const removeNormal = (obj, normal) => {
        let returnObj = {x: obj.x, y: obj.y , z: obj.z}
        delete returnObj[normal]

        return returnObj
    }

    const moveLayer = (p1, p2, normal) => {
        let pos1 = removeNormal(p1, normal[0])
        let pos2 = removeNormal(p2, normal[0])
        let rotation, axis, direction, layer;
        let axes = ["x", "y", "z"]
        for (let i = 0; i < axes.length; i++) {
            if(pos1[axes[i]] !== undefined) {
                if(pos1[axes[i]] !== pos2[axes[i]]) {
                    rotation = axes[i]
                } else {
                    axis = axes[i]
                    layer = p1[axes[i]]
                }
            }
        }
        if(axis !== undefined && layer !== undefined) {
            direction = p1[rotation] < p2[rotation] ? 1 : 0

            let movement = move[axis][layer+1][direction]
            let cubeMovement = getCubesFromMovement([layer, axis])
            for (let i = 0; i < cubeMovement.length; i++) {
                cubeMovement[i][0].update(movement, axis)
            }
        }
        setTimeout(()=> {
            let finalCheck = 0
            for (let i = 0; i < cubeArray.length; i++) {
                if(cubeArray[i].determinateCornerOrEdge() !== 1) {
                    finalCheck += cubeArray[i].checkOriginalPosition()
                }
            }
            if(finalCheck === 21) {
                console.log("CUBE terminé")
            }
        }, 500)
        return 1
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })
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

        movementWithScramble(movements, 0, group)
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
            if(p1 !== undefined && p2 === undefined) {
                p2 = pSave
                let move = moveLayer(p1, p2, normal)
                if(move) {
                    p1 = undefined
                    p2 = undefined
                    pSave = undefined
                }
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
                    let move = moveLayer(p1, p2, normal)
                    if(move) {
                        p1 = undefined
                        p2 = undefined
                        pSave = undefined
                    }
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