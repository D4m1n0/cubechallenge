import * as THREE from "three";
import {useRef, useEffect} from "react";
import {Interaction} from "../../node_modules/three.interaction/src/index";
import {TrackballControls} from "three/examples/jsm/controls/experimental/CameraControls";

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
        ["S'", "S"],
        ["F'", "F"]
    ]
}

const RubikCube = (props) => {
    const mount = useRef(null)
    const controls = useRef(null)
    const {cubes, scramble, addTurn, startTimer, maxPosition, delta, cubeLength} = props

    const getCubesFromMovement = (movement) => {
        let cubesToMove = [];
        let face;
        let axe;

        if(Array.isArray(movement)) {
            // Movement made by user
            face = movement[0]
            axe = movement[1]
        }else {
            // Movement made by scramble
            // console.log(maxPosition, delta)
            switch (movement) {
                case "F":
                case "F'":  face = maxPosition;   axe = "z"; break;
                case "f":
                case "f'":  face = maxPosition-delta;   axe = "z"; break;
                case "3f":
                case "3f'":  face = maxPosition-(delta*2);   axe = "z"; break;
                case "Fw":
                case "Fw'":  face = [maxPosition, maxPosition-delta];   axe = "z"; break;

                case "B":
                case "B'":  face = -maxPosition;  axe = "z"; break;
                case "b":
                case "b'":  face = -maxPosition+delta;  axe = "z"; break;
                case "3b":
                case "3b'":  face = -maxPosition+(delta*2);  axe = "z"; break;
                case "Bw":
                case "Bw'":  face = [-maxPosition, -maxPosition+delta];   axe = "z"; break;

                case "U":
                case "U'":  face = maxPosition;   axe = "y"; break;
                case "u":
                case "u'":   face = maxPosition-delta;   axe = "y"; break;
                case "3u":
                case "3u'":   face = maxPosition-(delta*2);   axe = "y"; break;
                case "Uw":
                case "Uw'":   face = [maxPosition, maxPosition-delta];   axe = "y"; break;

                case "D":
                case "D'":  face = -maxPosition;  axe = "y"; break;
                case "d":
                case "d'":  face = -maxPosition+delta;  axe = "y"; break;
                case "3d":
                case "3d'":  face = -maxPosition+(delta*2);  axe = "y"; break;
                case "Dw":
                case "Dw'":  face = [-maxPosition, -maxPosition+delta];   axe = "y"; break;

                case "L":
                case "L'":  face = -maxPosition;  axe = "x"; break;
                case "l":
                case "l'":  face = -maxPosition+delta;  axe = "x"; break;
                case "3l":
                case "3l'":  face = -maxPosition+(delta*2);  axe = "x"; break;
                case "Lw":
                case "Lw'":  face = [-maxPosition, -maxPosition+delta];   axe = "x"; break;

                case "R":
                case "R'":  face = maxPosition;   axe = "x"; break;
                case "r":
                case "r'":  face = maxPosition-delta;   axe = "x"; break;
                case "3r":
                case "3r'":  face = maxPosition-(delta*2);   axe = "x"; break;
                case "Rw":
                case "Rw'":  face = [maxPosition, maxPosition-delta];   axe = "x"; break;

                case "S":
                case "S'":  face = 0;   axe = "z"; break;
                case "E":
                case "E'":  face = 0;   axe = "y"; break;
                case "M":
                case "M'":  face = 0;   axe = "x"; break;
                default:    face = 0; break;
            }
        }

        for (let i = 0; i < cubes.length; i++) {
            if(Array.isArray(face)) {
                for (let j = 0; j < face.length; j++) {
                    if(cubes[i]["position"][axe] === face[j]) {
                        cubesToMove.push([cubes[i], axe])
                    }
                }
            }else {
                if(cubes[i]["position"][axe] === face) {
                    cubesToMove.push([cubes[i], axe])
                }
            }
        }

        return cubesToMove
    }

    const getComplicatedMovement = (axisOfRotation, layer, direction) => {
        let movement = move[axisOfRotation][Math.sign(layer)+1][direction]
        let maxPositionTemp = maxPosition;
        let deltaTemp = delta;
        if(Math.sign(layer) === -1) {
            maxPositionTemp = -maxPositionTemp;
            deltaTemp = -deltaTemp;
        }
        if(Math.sign(layer) !== 0) {
            switch (layer) {
                case maxPositionTemp-deltaTemp: movement = movement.toLowerCase(); break;
                case maxPositionTemp-(deltaTemp*2): movement = "3"+movement.toLowerCase(); break;
                // default: console.log("same"); break;
            }
        }
        // console.log(movement)

        return movement
    }

    const setScramble = (movements, index) => {
        let double = movements[index].indexOf("2") > -1 ? 1 : 0
        let movement = double ? movements[index].replace("2", "") : movements[index]
        movements[index] = movement
        console.log("move", movement)

        if(double) {
            movements.splice(index, 0, movement)
        }

        let cubesToMove = getCubesFromMovement(movement)
        for (let i = 0; i < cubesToMove.length; i++) {
            cubesToMove[i][0].update(movement, cubesToMove[i][1])
        }

        if(index < movements.length-1) {
            index += 1
            setTimeout(() => {
                setScramble(movements, index)
            }, 1)
        }
    }

    const determinationFaceOnClick = (vector) => {
        let face = ["x", vector.x]
        if(Math.abs(vector.y) > Math.abs(face[1])) {
            face = ["y", vector.y]
        }
        if(Math.abs(vector.z) > Math.abs(face[1])) {
            face = ["z", vector.z]
        }
        face[1] = Math.floor(face[1])
        face[1] = Math.abs(face[1]) === 2 ? face[1] / 2 : face[1]
        return face
    }

    const removePoint = (vector, faceOnClick) => {
        let returnObj = {x: vector.x, y: vector.y , z: vector.z}
        delete returnObj[faceOnClick]

        return returnObj
    }

    const moveLayer = (p1, p2, faceOnClick) => {
        let pos1 = removePoint(p1, faceOnClick[0])
        let pos2 = removePoint(p2, faceOnClick[0])
        let directionOfRotation, axisOfRotation, direction, layer;
        let axes = ["x", "y", "z"]
        for (let i = 0; i < axes.length; i++) {
            if(pos1[axes[i]] !== undefined) {
                if(pos1[axes[i]] !== pos2[axes[i]]) {
                    directionOfRotation = axes[i]
                } else {
                    axisOfRotation = axes[i]
                    layer = p1[axes[i]]
                }
            }
        }

        if(axisOfRotation !== undefined && layer !== undefined) {
            let reverseAxis = [...axes]
            reverseAxis.splice(reverseAxis.indexOf(directionOfRotation), 1)
            reverseAxis.splice(reverseAxis.indexOf(axisOfRotation), 1)
            reverseAxis = reverseAxis[0]

            if(Math.sign(p1[reverseAxis]) === 1) {
                direction = p1[directionOfRotation] < p2[directionOfRotation] ? 1 : 0
            } else {
                direction = p1[directionOfRotation] < p2[directionOfRotation] ? 0 : 1
            }
            if(directionOfRotation === "z" && axisOfRotation === "x") { direction = (-direction)+1 }
            if(directionOfRotation === "z" && axisOfRotation === "y") { direction = (-direction)+1 }
            if(directionOfRotation === "y" && axisOfRotation === "z") { direction = (-direction)+1 }
            let movement = getComplicatedMovement(axisOfRotation, layer, direction)
            let cubeMovement = getCubesFromMovement([layer, axisOfRotation])
            for (let i = 0; i < cubeMovement.length; i++) {
                cubeMovement[i][0].update(movement, axisOfRotation)
            }
        }
        let locationCheck = 0

        if(locationCheck === 21) {
            console.log("CUBE end")
            startTimer(false)
        }
        return 1
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const axesHelper = new THREE.AxesHelper( 20 );
        scene.add( axesHelper );
        const size = 10;
        const divisions = 10;

        const gridHelper = new THREE.GridHelper( size, divisions );
        scene.add( gridHelper );

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 15

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const interaction = new Interaction(renderer, scene, camera)

        const controls = new TrackballControls(camera, renderer.domElement)
        controls.enablePan = false

        let group = new THREE.Object3D()
        for (let i = 0; i < cubes.length; i++) {
            group.add(cubes[i].show())
        }
        scene.add(group)
        group.name = "rubik"

        let movements = scramble.split(" ");
        setScramble(movements, 0)

        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        let faceOnClick = []
        let position1, position2, positionSave

        const mousePosition = (e) => {
            mouse.x = (e.clientX / width) * 2 - 1
            mouse.y = - (e.clientY / height) * 2 + 1
            raycaster.setFromCamera( mouse, camera )
        }

        let count = 0
        const mouseUpOutEvent = () => {
            let move = moveLayer(position1, position2, faceOnClick)
            if(move) {
                position1 = undefined
                position2 = undefined
                positionSave = undefined

                if(count === 0) {
                    // startTimer(true)
                }

                count += 1
                addTurn(count)
            }
        }

        const pointerOutEvent = (e) => {
            if(position1 !== undefined && position2 === undefined) {
                position2 = positionSave
                mouseUpOutEvent()
            }

            setTimeout(() => {
                controls.enableRotate = true
            }, 500)
        }

        const pointerMoveEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {
                if(position1 !== undefined) {
                    positionSave = intersects[0].object.position
                }
            }
        }

        const mouseEvent = (e) => {
            mousePosition(e)
            const intersects = raycaster.intersectObjects( group.children );
            if(intersects.length > 0) {
                if(e.type === "mousedown") {
                    faceOnClick = determinationFaceOnClick(intersects[0].point)
                    position1 = intersects[0].object.position
                }
                if(e.type === "mouseup") {
                    position2 = intersects[0].object.position
                    mouseUpOutEvent()
                }
                controls.enableRotate = !controls.enableRotate
            }
        }

        window.addEventListener('mousedown', mouseEvent)
        window.addEventListener('mouseup', mouseEvent)
        window.addEventListener('pointermove', pointerMoveEvent)
        group.on("pointerout", pointerOutEvent)

        renderer.setClearColor('#9f9f9f')
        renderer.setSize(width, height)

        const renderScene = () => {
            raycaster.setFromCamera( mouse, camera )
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

export default RubikCube;
