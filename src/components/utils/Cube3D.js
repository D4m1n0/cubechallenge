import React, {Component} from 'react';
import CubeBlock from '../../Helpers/cube-block';
import Prescramble from '../../Helpers/cube-function';
import * as THREE from 'three';
import CubeMap from "../../Helpers/layers/solved-white-down";
import CubeMinMap from "../../Helpers/layers/min-map";
import {TweenMax} from "gsap/TweenMax";
import Scramble from "../../Helpers/scramble";
import './Cube3D.css';
import backIcon from '../../assets/2x/baseline_fast_rewind_white_48dp.png';
import pauseIcon from '../../assets/2x/baseline_pause_white_48dp.png';
import playIcon from '../../assets/2x/baseline_play_arrow_white_48dp.png';
// import replayIcon from '../assets/2x/baseline_replay_white_48dp.png';
import back1frameIcon from '../../assets/2x/baseline_skip_previous_white_48dp.png';
// import move1frameIcon from '../assets/2x/baseline_skip_next_white_48dp.png';

const OrbitControls = require('three-orbit-controls')(THREE);

class Cube3D extends Component {
    constructor(props) {
        super(props);
        this.state = {
            start: false,
            keyFrame:0,
            scramble:""
        };
        this.colors = [
            "#009D54",
            "#FFFFFF",
            "#DC422F",
            "#FF6C00",
            "#FDCC09",
            "#3D81F6",
            "#5a5a5a"
        ];

        this.initBlocks = CubeBlock.block;
        this.initRubiksArray = CubeMap;
        this.initRubiksMiniArray = CubeMinMap;

        this.blocks = CubeBlock.block;
        this.rubiksArray = CubeMap;
        this.rubiksMiniArray = CubeMinMap;
        this.rubiksMiniInverse = CubeMinMap;
        this.withMap = true;

        this.scramble = "";
        this.scrambleSplit = this.scramble.split(' ');
        this.writeCenter = true;
        this.prescramble = "";
        this.prescrambleSplit = this.prescramble.split(' ');
    }

    componentWillMount() {
        if(this.props.scramble !== undefined) {
            this.scramble = this.props.scramble;
            this.scrambleSplit = this.scramble.split(' ');
            this.setState({
                scramble: this.scramble
            });
        }
        if(this.props.map !== undefined){
            this.rubiksArray = this.props.map;
            this.initRubiksArray = this.props.map;
        }
        if(this.props.prescramble !== undefined && this.props.prescramble !== ''){
            this.prescramble = this.props.prescramble;
            this.prescrambleSplit = this.prescramble.split(' ');
            // Cette fonction change la map initiale ! A changer !!
            this.rubiksArray = new Prescramble()._scramble(this.rubiksArray,this.prescramble);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.scramble !== this.props.scramble){
            this.scramble = this.props.scramble;
            this.setState({
                scramble: this.scramble,
                keyFrame: 0
            });
            this.scrambleSplit = this.scramble.split(' ');
            // this.rubiksArray = this.initRubiksArray;
            this.scene.remove(this.group);
            this._resetCube();
            this.prescramble = this.props.prescramble;
            this.rubiksArray = this.props.map;
            this.rubiksArray = new Prescramble()._scramble(this.rubiksArray,this.prescramble);
            this._init();
            // console.log(this.initRubiksArray,this.rubiksArray);
        }
    }

    componentDidMount() {
        const width = this.props.sizeW; //window.innerWidth;
        const height = this.props.sizeH; //window.innerHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1000 );
        this.camera.position.z = 7;
        // this.controls = new OrbitControls(this.camera);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor('#303d57');
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement);

        this._init();
    }

    _init = () =>{
        this.group = new THREE.Object3D();
        this.group.rotation.x = 0.5;
        this.group.rotation.y = -0.5;

        this.newCubePositions = [];
        this.rotationCube = [];
        for (let z = 1; z >= -1; z-- ) {
            for (let y = 1; y >= -1; y--) {
                for (let x = -1; x <= 1; x++ ) {
                    this.newCubePositions.push([x,y,z]);
                    this.rotationCube.push([0,0,0]);
                }
            }
        }

        this.cubes = [];
        this.cubeData = {};
        for (let i = 0; i <27; i++) {
            this.cubeData[i] = this.rubiksArray[i];
            this.cubes[i] = this._createRect(i,this.newCubePositions[i],this.rubiksArray[i]);
            this.group.add(this.cubes[i]);
        }
        this.scene.add(this.group);

        this.start();
    };

    _animateScramble = (n) => {
        if(this.scrambleSplit[n].indexOf('x') !== -1 || this.scrambleSplit[n].indexOf("y") !== -1 || this.scrambleSplit[n].indexOf("z") !== -1){
            this._cubeRotate(this.scrambleSplit[n],n);
        }else{
            this._faceToRotate(this.scrambleSplit[n],n);
        }
    };

    _cubeRotate = (mouv,n) => {
        let mouvObject = {
            letter: mouv.replace("'","").replace('2',''),
            prime: mouv.indexOf("'") !== -1,
            double: mouv.indexOf("2") !== -1,
        };
        let doublePi = mouvObject.double?-Math.PI:-Math.PI/2;
        let sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi;
        let typeMouv;
        let x = 0;
        let y = 0;
        let z = 0;

        switch (mouvObject.letter) {
            case "z": typeMouv = {z:sensRotate}; z=1; break;
            case "x": typeMouv = {x:sensRotate}; x=1; break;
            case "y": typeMouv = {y:sensRotate}; y=1; break;
            default: return;
        }

        this.groupAnimate = new THREE.Object3D();
        this.group.add(this.groupAnimate);

        for (let i = 0; i < 27; i++) {
            this.groupAnimate.add(this.cubes[i]);
        }
        typeMouv.onComplete = () => {
            this.rubiksMiniArray = new Scramble()._scramble(this.rubiksMiniArray, mouvObject);
            this.rubiksMiniInverse = new Scramble()._scrambleInverse(this.rubiksMiniInverse, mouvObject);
            if(mouvObject.double){
                this.rubiksMiniArray = new Scramble()._scramble(this.rubiksMiniArray, mouvObject);
                this.rubiksMiniInverse = new Scramble()._scrambleInverse(this.rubiksMiniInverse, mouvObject);
            }
            for (let i = 0; i < 27; i++) {
                this.group.add(this.cubes[i]);
                if (this.rubiksMiniArray[i] !== undefined) {
                    this.cubes[i].position.x = this.newCubePositions[this.rubiksMiniArray[i]][0];
                    this.cubes[i].position.y = this.newCubePositions[this.rubiksMiniArray[i]][1];
                    this.cubes[i].position.z = this.newCubePositions[this.rubiksMiniArray[i]][2];
                    this.cubes[i].rotateOnWorldAxis(new THREE.Vector3(x,y,z),sensRotate);
                }
            }
            this.scene.remove(this.groupAnimate);
            this.blocks = new Scramble()._face(this.rubiksMiniInverse, this.blocks);

            n = n+1;
            this.setState({
                keyFrame: n
            });
            if(this.state.start) {
                if (n < this.scrambleSplit.length) {
                    this._animateScramble(n);
                }else{
                    this.setState({
                        keyFrame: -1,
                        start:false
                    });
                }
            }
        };

        this.animateTween = TweenMax.to(this.groupAnimate.rotation,.5,typeMouv);
    };

    _faceToRotate = (mouv,n) => {
        let mouvObject = {
            letter: mouv.replace("'","").replace('2',''),
            prime: mouv.indexOf("'") !== -1,
            double: mouv.indexOf("2") !== -1,
            faceString: ""
        };

        let typeMouv = {};
        let doublePi = mouvObject.double?-Math.PI:-Math.PI/2;
        let typeRotate = "";
        let sensRotate = doublePi;
        let x = 0;
        let y = 0;
        let z = 0;

        switch (mouvObject.letter) {
            case "F": mouvObject.faceString = "front"; typeRotate = "z"; z = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {z:sensRotate};  break;
            case "B": mouvObject.faceString = "back"; typeRotate = "z"; z = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {z:sensRotate}; break;
            case "U": mouvObject.faceString = "up"; typeRotate = "y"; y = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {y:sensRotate}; break;
            case "D": mouvObject.faceString = "down"; typeRotate = "y"; y = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {y:sensRotate}; break;
            case "R": mouvObject.faceString = "right"; typeRotate = "x"; x = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {x:sensRotate}; break;
            case "L": mouvObject.faceString = "left"; typeRotate = "x"; x = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {x:sensRotate}; break;
            case "M": mouvObject.faceString = "middle"; typeRotate = "x"; x = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {x:sensRotate}; break;
            case "E": mouvObject.faceString = "equator"; typeRotate = "y"; y = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {y:sensRotate}; break;
            case "S": mouvObject.faceString = "standing"; typeRotate = "z"; z = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {z:sensRotate}; break;
            case "u": mouvObject.faceString = "upeq"; typeRotate = "y"; y = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {y:sensRotate}; break;
            case "d": mouvObject.faceString = "downeq"; typeRotate = "y"; y = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {y:sensRotate}; break;
            case "r": mouvObject.faceString = "rightmid"; typeRotate = "x"; x = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {x:sensRotate}; break;
            case "l": mouvObject.faceString = "leftmid"; typeRotate = "x"; x = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {x:sensRotate}; break;
            case "f": mouvObject.faceString = "frontstan"; typeRotate = "z"; z = 1; sensRotate = mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {z:sensRotate}; break;
            case "b": mouvObject.faceString = "backstan"; typeRotate = "z"; z = 1; sensRotate = !mouvObject.prime?Math.abs(doublePi):doublePi; typeMouv = {z:sensRotate}; break;
            default: mouvObject.faceString = ""; break;
        }

        let faceArrayBlock = this.blocks[mouvObject.faceString];
        this.groupAnimate = new THREE.Object3D();
        this.group.add(this.groupAnimate);

        for (let i = 0; i < faceArrayBlock.length; i++) {
            this.groupAnimate.add(this.cubes[faceArrayBlock[i]]);
        }
        typeMouv.onComplete = () => {
            this.rubiksMiniArray = new Scramble()._scramble(this.rubiksMiniArray, mouvObject);
            this.rubiksMiniInverse = new Scramble()._scrambleInverse(this.rubiksMiniInverse, mouvObject);
            if(mouvObject.double){
                this.rubiksMiniArray = new Scramble()._scramble(this.rubiksMiniArray, mouvObject);
                this.rubiksMiniInverse = new Scramble()._scrambleInverse(this.rubiksMiniInverse, mouvObject);
            }
            for (let i = 0; i < faceArrayBlock.length; i++) {
                this.group.add(this.cubes[faceArrayBlock[i]]);
                if (this.rubiksMiniArray[faceArrayBlock[i]] !== undefined) {
                    this.cubes[faceArrayBlock[i]].position.x = this.newCubePositions[this.rubiksMiniArray[faceArrayBlock[i]]][0];
                    this.cubes[faceArrayBlock[i]].position.y = this.newCubePositions[this.rubiksMiniArray[faceArrayBlock[i]]][1];
                    this.cubes[faceArrayBlock[i]].position.z = this.newCubePositions[this.rubiksMiniArray[faceArrayBlock[i]]][2];
                    this.cubes[faceArrayBlock[i]].rotateOnWorldAxis(new THREE.Vector3(x,y,z),sensRotate);
                }
            }
            this.scene.remove(this.groupAnimate);
            this.blocks = new Scramble()._face(this.rubiksMiniInverse, this.blocks);
            console.log(n);
            n = n+1;
            this.setState({
                keyFrame: n
            });
            if(this.state.start) {
                if (n < this.scrambleSplit.length) {
                    this._animateScramble(n);
                }else{
                    this.setState({
                        keyFrame: -1,
                        start:false
                    });
                }
            }
        };
        this.animateTween = TweenMax.to(this.groupAnimate.rotation,.5,typeMouv);
    };

    _createRect = (n,pos,block) => {
        let materials = [];
        let j = 0;
        for (let i = 0; i < 6; i++) {
            if(this.withMap){
                if(i===0) j = block[2];
                else if(i===1) j = block[3];
                else if(i===2) j = block[1];
                else if(i===3) j = block[4];
                else if(i===4) j = block[0];
                else if(i===5) j = block[5];
            }else{
                if(i===0) j = 2;
                else if(i===1) j = 3;
                else if(i===2) j = 1;
                else if(i===3) j = 4;
                else if(i===4) j = 0;
                else if(i===5) j = 5;
            }

            let color = this.colors[j];
            let texture = this._colorFaceTexture(128,128,color,block[6]);
            let m = new THREE.MeshBasicMaterial({map:texture});
            materials.push(m);
        }
        let geometry = new THREE.BoxGeometry(1,1,1);
        let rect = new THREE.Mesh(geometry,materials);
        rect.name = n;
        rect.position.x = pos[0];
        rect.position.y = pos[1];
        rect.position.z = pos[2];

        return rect;
    };

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    };

    animate = () => {
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };
    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    };

    _handlePlay = () => {
        if(this.state.start){
            this.setState({
                start:false
            });
        }else{
            if(this.state.keyFrame === -1){
                this.scene.remove(this.group);
                this._resetCube();
                this.prescramble = this.props.prescramble;
                if(this.props.map !== undefined) {
                    this.rubiksArray = this.props.map;
                }
                this.rubiksArray = new Prescramble()._scramble(this.rubiksArray,this.prescramble);
                this._init();
                setTimeout(()=>{
                    this.setState({
                        start:true,
                        keyFrame:0
                    },()=>{
                        this._animateScramble(this.state.keyFrame);
                    });
                },1000);
            }else{
                this.setState({
                    start:true
                },()=>{
                    this._animateScramble(this.state.keyFrame);
                });
            }
        }
    };

    _resetCube = () => {
        this.blocks = this.initBlocks;
        this.rubiksArray = this.initRubiksArray;
        this.rubiksMiniArray = this.initRubiksMiniArray;
        this.rubiksMiniInverse = this.initRubiksMiniArray;
    };

    _handleBack = () => {
        if(this.state.keyFrame !== 0) {
            this.animateTween.paused();
            this.setState({
                start: false,
                keyFrame: 0
            },()=>{
                setTimeout(()=>{
                    this.scene.remove(this.group);
                    this._resetCube();
                    this.prescramble = this.props.prescramble;
                    if(this.props.map !== undefined) {
                        this.rubiksArray = this.props.map;
                    }
                    this.rubiksArray = new Prescramble()._scramble(this.rubiksArray,this.prescramble);
                    this._init();
                },1000);
            });
        }
    };

    _handleBackOneFrame = () => {
        if(this.state.keyFrame !== 0) {
            this.animateTween.paused();
            this.setState({
                start: false
            },()=>{
                setTimeout(()=>{
                    let frame = this.state.keyFrame-1;
                    console.log(frame);
                    let newMouv = this.scrambleSplit[frame].indexOf("'") === -1?this.scrambleSplit[frame]+"'":this.scrambleSplit[frame].replace("'","");
                    // ATTENTION x et y et z
                    this._faceToRotate(newMouv,frame-1);
                },1000);
            });
        }
    };

    _colorFaceTexture = (width,height,color,name) => {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.rect(0,0,width,height);
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000000";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        if(this.writeCenter && (name === 4 || name === 10 || name === 12 || name === 14 || name === 16 || name === 22)){
            ctx.beginPath();
            ctx.font = "60px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            let typeFace = "";
            switch (name) {
                case 4: typeFace = "F"; break;
                case 10: typeFace = "U"; break;
                case 12: typeFace = "L"; break;
                case 14: typeFace = "R"; break;
                case 16: typeFace = "D"; break;
                case 22: typeFace = "B"; break;
                default: typeFace = ""; break;
            }
            ctx.fillText(typeFace,canvas.width/2,(canvas.height/2)+20);
            ctx.closePath();
        }

        let image = new Image();
        image.src = canvas.toDataURL();

        let texture = new THREE.Texture(image);
        texture.anisotropy = 4;
        texture.needsUpdate = true;

        return texture;
    };

    render() {
        return (
            <div id="containerCube">
                <div
                    ref={(mount) => { this.mount = mount }}
                />
                {this.props.controls===undefined?
                    (<div id={"controls"} style={{left:this.props.sizeW/2}}>
                        <span style={{textAlign:'center'}}>{this.state.scramble}</span>
                        <div>
                            <button type="button" onClick={this._handleBack}>
                                <img src={backIcon} className="icon" alt=""/>
                            </button>
                            <button type={"button"} onClick={this._handleBackOneFrame}><img src={back1frameIcon} className="icon" alt=""/></button>
                            <button type="button" onClick={this._handlePlay}>
                                {this.state.start?<img src={pauseIcon} className="icon" alt=""/>:<img src={playIcon} className="icon" alt=""/>}
                            </button>
                        </div>
                    </div>):null}
            </div>
        );
    }
}

export default Cube3D;