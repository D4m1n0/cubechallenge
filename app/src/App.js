import './App.css';
import {useEffect, useState} from "react";
import Cube from "./components/Cube";
import RubikCube from "./components/RubikCube";
import useInterval from "./hooks/UseInterval";
import RotationCube from "./tests/RotationCube";

function App() {
    const [cubes, setCubes] = useState([])
    const [count, setCount] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [time, setTime] = useState(false)

    useInterval(() => {
        setTime(time + 10);
    }, isRunning ? 10 : null)

    useEffect(() => {
        if(cubes.length === 0) {
            buildCubes();
        }

    }, [cubes])

    const buildCubes = () => {
        let cube = Array.from({length: 27}, () => {
            return new Cube(0, 0, 0, {x: 0, y: 0, z: 0});
        })

        let index = 0;

        for (let z = 1; z >= -1; z-- ) {
            for (let y = 1; y >= -1; y--) {
                for (let x = -1; x <= 1; x++ ) {
                    cube[index].setPosition({x: x, y: y, z: z}, index)
                    index++
                }
            }
        }

        setCubes(cube)
    }

    const getCubesFromMovement = (movement) => {
        let myCubes = [];
        let face;
        let axe;

        if(Array.isArray(movement)) {
            face = movement[0]
            axe = movement[1]
        }else {
            switch (movement) {
                case "F": face = 1; axe = "z"; break;
                case "F'": face = 1; axe = "z"; break;
                case "B": face = -1; axe = "z"; break;
                case "B'": face = -1; axe = "z"; break;
                case "S": face = 0; axe = "z"; break;
                case "S'": face = 0; axe = "z"; break;
                case "U": face = 1; axe = "y"; break;
                case "U'": face = 1; axe = "y"; break;
                case "D": face = -1; axe = "y"; break;
                case "D'": face = -1; axe = "y"; break;
                case "E": face = 0; axe = "y"; break;
                case "E'": face = 0; axe = "y"; break;
                case "L": face = -1; axe = "x"; break;
                case "L'": face = -1; axe = "x"; break;
                case "R": face = 1; axe = "x"; break;
                case "R'": face = 1; axe = "x"; break;
                case "M": face = 0; axe = "x"; break;
                case "M'": face = 0; axe = "x"; break;
                default: face = 0; break;
            }
        }

        for (let i = 0; i < cubes.length; i++) {
            if(cubes[i]["position"][axe] === face) {
                myCubes.push([cubes[i], axe]);
            }
        }

        return myCubes
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

    return (
        <div className="App">
            {
                cubes.length !== 0 ? (
                    <RubikCube
                        startTimer={(type) => { setIsRunning(type)} }
                        cubeArray={cubes} timeScramble={1} addTurn={(val) => setCount(val)}
                        getCubesFromMovement={getCubesFromMovement} scramble={"U' B2 F2 L2 R2 D R2 D' U2 L F' U B2 U2 L2 U L U"} />
                ) : ""
            }
            {
                // <RotationCube />
            }
            <div className="turn">Nombre de mouvements : {count}</div>
            <div className="timer">
                <span className="timer__title">{handleCount()}</span>
            </div>
        </div>
    )
}

export default App;
