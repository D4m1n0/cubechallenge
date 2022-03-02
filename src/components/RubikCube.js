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
            cubeMovement[i].update(movement)
        }
        setTimeout(() => {
            if(index < movements.length-1) {
                index += 1
                movementWithScramble(movements, index)
            }
        }, 500)
    }

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );
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
        // group.rotation.x = 0.5
        // group.rotation.y = 0.5
        // group.rotation.z = Math.PI

        let movements = scramble.split(" ");

        movementWithScramble(movements, 0)
        // cubeArray[0].cube.position.x = -2
        // TODO Click for move

        // group.on("pointerdown", function(e) {
        //     controls.enabled = false
        //     console.log("start", e.data.tangentialPressure )
        // })
        // group.on("pointerup", function(e) {
        //     controls.enabled = true
        //     console.log("end", e.data.global)
        // })
        // group.on("mouseover", function(e) {
        //     controls.enabled = true
        //     console.log("in", e.data.global.x, e.data.global.y)
        // })
        // group.on("pointerout", function(e) {
        //     controls.enabled = true
        //     // console.log("out", e.data.global)
        // })

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