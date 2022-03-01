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
                    cube[index].x = x;
                    cube[index].y = y;
                    cube[index].z = z;
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

        // TODO refacto this
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

        for (let i = 0; i < cubes.length; i++) {
            if(cubes[i][axe] === face) {
                myCubes.push(cubes[i]);
            }
        }

        return myCubes
    }

    return (
        <div className="App">
            {
                cubes.length !== 0 ? ( <RubikCube cubeArray={cubes} getCubesFromMovement={getCubesFromMovement} scramble={"F U2 F B L2"} /> ) : ""
            }
        </div>
    );
}

export default App;
