import './App.css';
import {useEffect, useState} from "react";
import Cube from "./components/Cube";
import RubikCube from "./components/RubikCube";
import useInterval from "./hooks/UseInterval";

function App() {
    const [cubes, setCubes] = useState([])
    const [count, setCount] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [time, setTime] = useState(false)
    const cubeLength = 5
    const spacing = cubeLength !== 2 ? -2 : 0
    const positionOffset = (cubeLength - 1) / 2
    const delta = (cubeLength + spacing)
    const maxPosition = positionOffset * delta

    useInterval(() => {
        setTime(time + 10);
    }, isRunning ? 10 : null)

    useEffect(() => {
        if(cubes.length === 0) {
            buildCubes();
        }

    }, [cubes])

    const buildCubes = () => {
        let cube = Array.from({length: cubeLength**3}, () => {
            return new Cube(0, 0, 0, {x: 0, y: 0, z: 0});
        })

        let index = 0;

        for (let i = cubeLength-1; i >= 0; i--) {
            for (let j = 0; j < cubeLength; j++) {
                for (let k = 0; k < cubeLength; k++) {
                    let x = (k - positionOffset) * delta
                    let y = (j - positionOffset) * delta
                    let z = (i - positionOffset) * delta

                    if(Math.max(Math.abs(x), Math.abs(y)) === maxPosition || Math.max(Math.abs(y), Math.abs(z)) === maxPosition) {
                        cube[index].setPosition({x: x, y: y, z: z}, index, maxPosition, delta)
                        cube[index].setSize(delta)
                        // cube[index].setVisible(false)
                    } else {
                        cube[index] = null
                        // cube[index].setPosition({x: x, y: y, z: z}, index, maxPosition, delta)
                        // cube[index].setSize(delta)
                    }
                    index++
                }
            }
        }
        cube = cube.filter((el) => el !== null)
        setCubes(cube)
    }

    const handleCount = () => {
        let minutes = Math.floor(time / 60000);
        let diff = time - (minutes * 60000);
        let seconds = Math.floor(diff / 1000);
        diff = diff - (seconds * 1000);
        let cent = Math.round(diff);

        let returnString = '';
        if(minutes > 0) {
            returnString += minutes + ":";
        }
        returnString += seconds>9?seconds:'0'+seconds;
        returnString += ':'+((cent/10)>9?cent/10:'0'+cent/10);

        return (
            `${returnString}`
        );
    };

    // R2 U2 R2 U R2 U R F2 U' U' L U' R' U R U' L U2 L' U2 R' U2 R U R' U R U' R2 L2 U' D
    // L U' U U' L L' U2 R' U2 U R' U U' R2 D
    // U' B L F' R D R2 B' R2 B2 D F2 D B2 R2 D2 B2 D' R2 F2 R' U' L F' B R L U2 L2 U L U' L' U L R U R2 U' R D2 L' U L U2 L' U' L D U F U F' U L' U' L R U R' U R' F R F' U2 R' F R F' U2 L U2 L' U2 L F' L' U' L U L F L2
    // solve U' L F' B R L U2 L2 U L U' L' U L R U R2 U' R D2 L' U L U2 L' U' L D U F U F' U L' U' L R U R' U R' F R F' U2 R' F R F' U2 L U2 L' U2 L F' L' U' L U L F L
    return (
        <div className="App">
            {
                cubes.length !== 0 ? (
                    <RubikCube
                        startTimer={(type) => { setIsRunning(type)} }
                        cubes={cubes}
                        addTurn={(val) => setCount(val)}
                        scramble={"U' B L F' R D R2 B' R2 B2 D F2 D B2 R2 D2 B2 D' R2 F2 R' U' L F' B R L U2 L2 U L U' L' U L R U R2 U' R D2 L' U L U2 L' U' L D U F U F' U L' U' L R U R' U R' F R F' U2 R' F R F' U2 L U2 L' U2 L F' L' U' L U L F L"}
                        // scramble={""}
                        maxPosition={maxPosition}
                        delta={delta}
                        cubeLength={cubeLength}
                    />
                ) : ""
            }
            <div className="turn">Nombre de mouvements : {count}</div>
            <div className="timer">
                <span className="timer__title">{handleCount()}</span>
            </div>
        </div>
    )
}

export default App;
