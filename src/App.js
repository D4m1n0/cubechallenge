import './App.css';
import {useEffect, useState} from "react";
import Cube from "./components/Cube";
import RubikCube from "./components/RubikCube";

function App() {
    const [cubes, setCubes] = useState([])

    useEffect(() => {
        if(cubes.length === 0) {
            buildCubes();
        }

    }, [cubes]);

    const buildCubes = () => {
        let cube = Array.from({length: 27}, () => {
            return new Cube(0, 0, 0, [0, 0, 0]);
        })

        let index = 0;

        for (let z = 1; z >= -1; z-- ) {
            for (let y = 1; y >= -1; y--) {
                for (let x = -1; x <= 1; x++ ) {
                    cube[index].position.x = x;
                    cube[index].position.y = y;
                    cube[index].position.z = z;
                    cube[index].n = index;
                    index++;
                }
            }
        }

        setCubes(cube);
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

    return (
        <div className="App">
            {
                cubes.length !== 0 ? ( <RubikCube cubeArray={cubes} getCubesFromMovement={getCubesFromMovement} scramble={"F U F2 R2 D2 B2 L2 F2 D B2 D U B L' F' L2 F U' B2 R F'"} /> ) : ""
            }
        </div>
    );
}

export default App;
