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
                        cubes={cubes}
                        addTurn={(val) => setCount(val)}
                        scramble={"U' B2 F2 L2 R2 D R2 D' U2 L F' U B2 U2 L2 U L U"} />
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
