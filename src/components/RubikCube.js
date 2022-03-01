import * as THREE from "three";
import { useRef, useEffect} from "react";

const OrbitControls = require('three-orbit-controls')(THREE);

const RubikCube = ({cubeArray, getCubesFromMovement, scramble}) => {
    const mount = useRef(null)
    const controls = useRef(null)

    useEffect(() => {
        let width = mount.current.clientWidth
        let height = mount.current.clientHeight
        let frameId

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ antialias: true })

        camera.position.z = 10
        const controls = new OrbitControls(camera);
        let group = new THREE.Object3D()

        for (let i = 0; i < cubeArray.length; i++) {
            group.add(cubeArray[i].show())
        }
        scene.add(group)
        group.rotation.x = 0.5
        group.rotation.y = 0.5

        let movements = scramble.split(" ");

        let i = 0
        // TODO enhance for 2 moves (U2)
        setInterval(function() {
            let cubeMovement = getCubesFromMovement(movements[i])
            for (let j = 0; j < cubeMovement.length; j++) {
                cubeMovement[j].update(movements[i])
            }
            i++;
        }, 1000)

        // TODO Click for move

        renderer.setClearColor('#000000')
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

        controls.current = { start, stop }

        return () => {
            stop()
            window.removeEventListener('resize', handleResize)
            mount.current.removeChild(renderer.domElement)

            // scene.remove(cube)
            // geometry.dispose()
            // material.dispose()
        }
    }, [])

    return <div className="rubik" ref={mount} />
}

export default RubikCube;