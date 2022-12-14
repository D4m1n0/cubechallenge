import * as THREE from "three";
import {useRef, useEffect, useState} from "react";
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
const originalCube = [ ["L", "R"], ["D", "U"], ["B", "F"] ]
const speedScramble = 100
const cameraByCubeLength = {"2": {x: -6, y: 6, z: 10}, "3": {x: -4, y: 4, z: 7}, "4": {x: -11, y: 11, z: 18}, "5": {x: -19, y: 19, z: 32}, "6": {x: -29, y: 29, z: 49}, "7": {x: -42, y: 42, z: 70}}

const RubikCube = (props) => {
    const mount = useRef(null)
    const controls = useRef(null)
    const {cubes, scramble, addTurn, maxPosition, delta, cubeLength, handleFinishCube, startTimer} = props

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
        return movement
    }

    const setScramble = (movements, index) => {
        let double = movements[index].indexOf("2") > -1 ? 1 : 0
        let movement = double ? movements[index].replace("2", "") : movements[index]
        movements[index] = movement

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
            }, speedScramble)
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

    const checkFinishedCube = () => {
        let cube
        // If odd cube, get center element at position {x: 0, y: 0, z: 1}
        if(cubeLength !== 2 && cubeLength%2 !== 0) {
            cube = cubes.filter((obj) => obj.originalPosition.x === 0 && obj.originalPosition.y === 0 && obj.originalPosition.z === maxPosition ? obj : '')[0]
        } else if(cubeLength !== 2 && cubeLength%2 === 0) {
            cube = cubes.filter((obj) => obj.type === "center")[0]
        } else {
            cube = cubes[2]
        }

        const cubeIndicator = {x: cube.cube.position.x, y: cube.cube.position.y, z: cube.cube.position.z}
        const maxKey = Object.keys(cubeIndicator).reduce((a, b) => cubeIndicator[a] > cubeIndicator[b] ? a : b)
        let centerArray = [ [[], []], [[], []], [[], []] ]
        let wrongCubes = 0

        for (let i = 0; i < cubes.length; i++) {
            let cubeWorldDirection = cubes[i].getWDirection()
            if(cubes[i].type === "center") {
                // setup checks for centers
                const cubePosition = cubes[i].position
                const cubeMaxPosition = Object.keys(cubePosition).filter((a) => Math.abs(cubePosition[a]) === maxPosition ? a : "")[0]
                const cubeSignPosition = Math.sign(cubePosition[cubeMaxPosition]) === -1 ? 0 : 1
                let cubeMaxPositionNumber = 0
                if(cubeMaxPosition === "y") cubeMaxPositionNumber = 1
                else if(cubeMaxPosition === "z") cubeMaxPositionNumber = 2
                centerArray[cubeMaxPositionNumber][cubeSignPosition].push(cubes[i])
            } else {
                if(cubeWorldDirection[1][maxKey] === 1) {
                    // cube ok
                } else {
                    // cube wrong
                    wrongCubes++
                }
            }
        }

        let centerAtGoodPlace = 0
        let evenCenter = [ [], [], [] ]
        const nCenter = (centerArray[0][0].length * 6) - 6

        if(cubeLength > 3) {
            for (let i = 0; i < centerArray.length; i++) {
                for (let j = 0; j < centerArray[i].length; j++) {
                    let centerIndicator = centerArray[i][j][0]
                    evenCenter[i].push(centerIndicator.originalLayer)
                    for (let k = 1; k < centerArray[i][j].length; k++) {
                        const center = centerArray[i][j][k]
                        if(center.originalLayer === centerIndicator.originalLayer) {
                            centerAtGoodPlace++
                        }
                    }
                }
            }
        }

        let checkAxisCenter = 0
        if(cubeLength !== 2 && cubeLength%2 === 0) {
            for (let i = 0; i < evenCenter.length; i++) {
                for (let j = 0; j < evenCenter.length; j++) {
                    if (JSON.stringify(evenCenter[i]) === JSON.stringify(originalCube[j])) {
                        checkAxisCenter++
                    } else {
                        originalCube[j].reverse()
                        if (JSON.stringify(evenCenter[i]) === JSON.stringify(originalCube[j])) {
                            checkAxisCenter++
                        }
                    }
                }
            }
        }
        // if(wrongCubes === 0) {
        //     console.log("3x3 or 2x2 is correct")
        // }
        // if(cubeLength > 3) {
        //     if(centerAtGoodPlace === nCenter) {
        //         if(cubeLength%2 !== 0) {
        //             console.log("odd cube centers are correct")
        //         } else {
        //             if(checkAxisCenter === 3) {
        //                 console.log("even cube centers are correct")
        //             }
        //         }
        //     }
        // }
        if(cubeLength <= 3 && wrongCubes === 0) {
            return 1
        } else if(cubeLength > 3 && wrongCubes === 0 && centerAtGoodPlace === nCenter) {
            if(cubeLength%2 !== 0) {
                return 1
            } else if(checkAxisCenter === 3) {
                return 1
            } else {
                return 0
            }
        } else {
            return 0
        }
        // console.log(centerAtGoodPlace, nCenter, checkAxisCenter, wrongCubes)
        // console.log(evenCenter, originalCube)
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

        if(checkFinishedCube()) {
            handleFinishCube()
        }

        return 1
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        // const axesHelper = new THREE.AxesHelper( 20 );
        // scene.add( axesHelper );
        // const size = 10;
        // const divisions = 10;

        // const gridHelper = new THREE.GridHelper( size, divisions );
        // scene.add( gridHelper );

        const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000)
        camera.position.x = cameraByCubeLength[cubeLength].x
        camera.position.y = cameraByCubeLength[cubeLength].y
        camera.position.z = cameraByCubeLength[cubeLength].z

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const interaction = new Interaction(renderer, scene, camera)

        const controls = new TrackballControls(camera, renderer.domElement)
        // controls.addEventListener("change", () => {
        //     console.log(camera.position)
        // })
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
                    startTimer()
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

        renderer.setClearColor('#262626')
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
