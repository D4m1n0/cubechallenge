import './assets/scss/main.scss';
import {useEffect, useState} from "react";
import Cube from "./components/Cube";
import RubikCube from "./components/RubikCube";
import useInterval from "./hooks/UseInterval";

function App() {
    const [cubes, setCubes] = useState([])
    const [count, setCount] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isFinish, setIsFinish] = useState(false)
    const [time, setTime] = useState(0)
    const [timeTable, setTimeTable] = useState([])
    const [cubeLength, setCubeLength] = useState(3)
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

        // Get first cubes front of the camera
        for (let i = cubeLength-1; i >= 0; i--) {
            for (let j = 0; j < cubeLength; j++) {
                for (let k = 0; k < cubeLength; k++) {
                    let x = (k - positionOffset) * delta
                    let y = (j - positionOffset) * delta
                    let z = (i - positionOffset) * delta

                    if(Math.max(Math.abs(x), Math.abs(y)) === maxPosition || Math.max(Math.abs(y), Math.abs(z)) === maxPosition) {
                        cube[index].setPosition({x: x, y: y, z: z}, index, maxPosition, delta)
                        cube[index].setSize(delta)
                        // cube[index].addText = true
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

    const handleReset = () => {
        for (let i = 0; i < cubes.length; i++) {
            cubes[i].reset()
        }
        setIsRunning(false)
        setTime(0)
        setCount(0)
    }

    const startTimer = () => {
        setTime(0)
        setCount(0)
        setIsRunning(true)
    }

    const handleFinishCube = () => {
        setIsRunning(false)
        let timeTableShadow = [...timeTable]
        timeTableShadow.push([time, count])
        setTimeTable(timeTableShadow)
        setIsFinish(true)
    }

    const handleScrambleCube = () => {
        setCubes([])
        setIsRunning(false)
        setTime(0)
        setCount(0)
    }

    const handleRestart = () => {
        setIsFinish(false)
        handleScrambleCube()
    }

    const handleCubeLength = (e) => {
        let cubeL = parseInt(e.currentTarget.dataset.cube)
        if(cubeL !== cubeLength) {
            setCubeLength(cubeL)
            handleScrambleCube()
        }
    }

    // R2 U2 R2 U R2 U R F2 U' U' L U' R' U R U' L U2 L' U2 R' U2 R U R' U R U' R2 L2 U' D
    // L U' U U' L L' U2 R' U2 U R' U U' R2 D
    // U' B L F' R D R2 B' R2 B2 D F2 D B2 R2 D2 B2 D' R2 F2 R'
    // solve U' L F' B R L U2 L2 U L U' L' U L R U R2 U' R D2 L' U L U2 L' U' L D U F U F' U L' U' L R U R' U R' F R F' U2 R' F R F' U2 L U2 L' U2 L F' L' U' L U L F L
    return (
        <div className="App">
            {
                cubes.length !== 0 ? (
                    <RubikCube
                        cubes={cubes}
                        addTurn={(val) => setCount(val)}
                        scramble={cubeLength === 3?"U' B L F' R D R2 B' R2 B2 D F2 D B2 R2 D2 B2 D' R2 F2 R'":"U F' U F' R F U' F' R'"}
                        maxPosition={maxPosition}
                        delta={delta}
                        cubeLength={cubeLength}
                        startTimer={startTimer}
                        handleFinishCube={handleFinishCube}
                    />
                ) : ""
            }
            <div className="menu">
                <ul className="menu__list">
                    <li><button className="menu__button--solve" onClick={handleReset}>Solve</button></li>
                    <li><button className="menu__button--scramble" onClick={handleScrambleCube}>Scramble</button></li>
                </ul>
            </div>
            <div className="header">
                <h1 className="header__heading-1"><strong>Rubik's Cube</strong> Challenge</h1>
                <div className="header__container-button">
                    <button className="header__button" onClick={handleCubeLength} data-cube={2}>2x2x2</button>
                    <button className="header__button" onClick={handleCubeLength} data-cube={3}>3x3x3</button>
                </div>
            </div>
            <div className={`end-screen${isFinish?'--active':''}`}>
                <div className="end-screen__container">
                    <div className="end-screen__time">
                        <h2 className="end-screen__heading-2">{handleCount()}</h2>
                        <div className="end-screen__counter">
                            <span className="end-screen__counter-title">Nombre de mouvements :</span>
                            <span className="end-screen__counter-num">{count}</span>
                        </div>
                        <div className="end-screen__retry">
                            <button className="end-screen__retry-button" onClick={handleRestart}>Recommencer</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer">
                <div className="footer__start">
                    {
                        !isRunning && (<button className="footer__start-button" onClick={startTimer}>Start</button>)
                    }
                </div>
                <div className="footer__timer">
                    <span className="footer__timer-title">{handleCount()}</span>
                </div>
                <div className="footer__counter">
                    <span className="footer__counter-title">Nombre de mouvements :</span>
                    <span className="footer__counter-num">{count}</span>
                </div>
            </div>
        </div>
    )
}

export default App;
