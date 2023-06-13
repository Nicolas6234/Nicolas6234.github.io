"use strict";
import * as THREE from 'three'
import {FBXLoader} from '/node_modules/three/examples/jsm/loaders/FBXLoader.js'
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import GUI from '/node_modules/lil-gui/dist/lil-gui.esm.js'
import {FontLoader} from '/node_modules/three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from '/node_modules/three/examples/jsm/geometries/TextGeometry.js'
import {PointerLockControls} from '/node_modules/three/examples/jsm/controls/PointerLockControls.js'
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
var fence;
var coords = { x: 5, y: 1, z: 25 };
var coords2 = { x: 19, y: 1, z: 19 };
var second_fence;
var raycasters = [];
var birds = [];
var sceneObjects = [];
var mouse;
var tween;
var cube;
var score = 0;
var obj;
var camera, scene, renderer, cameraControls, text, light;
var mixer2;
var model2Ready = false;
var modelReady = false;
var mixer3;
var model3Ready = false;
var mixer4;
var model4Ready = false;
var archer = new THREE.Group();
var loadedScene = 0;
var parrot = new THREE.Group();
var ftl = new FontLoader();
var mixerTab = [];
var possibleDirections = [true, true, true, true];
var lookingDirection = new THREE.Vector3(0, 0, 0);
var gun = new THREE.Group();
var mode = "normal";
var savedDirection = new THREE.Euler(0, 0, 0);
var started = false;
var gameTheme = new Audio('assets/sounds/gameTheme.mp3');
var loadingTheme = new Audio('assets/sounds/loadingTheme.mp3');
var AK47Shot = new Audio('assets/sounds/AK47.mp3');
init();
function init() {
    scene = new THREE.Scene();
    // set perspective camera with parameters adapted to first person view and the scene
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);
    camera.position.z = 0.5;
    camera.position.x = -0.2;
    camera.position.y = 0.6;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('skyblue');
    document.body.appendChild(renderer.domElement);
    //cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls = new PointerLockControls(camera, document.body);
    // slow down camera movement
    cameraControls.addEventListener('unlock', function () {
        camera.rotation.y = 0;
        camera.rotation.x = 0;
        camera.rotation.z = 0;
    });
    scene.add(cameraControls.getObject());
    loadingTheme.play();
    loadingTheme.volume = 0.5;
    document.body.addEventListener('keypress', function (event) {
        if (started) {
            if (event.code === 'Enter') {
                savedDirection = camera.rotation;
                console.log("lock :" + savedDirection.x + " " + savedDirection.y + " " + savedDirection.z);
                cameraControls.lock();
            }
            if (event.code === 'Space') {
                mode = mode == "normal" ? "shoot" : "normal";
                if (mode == "shoot") {
                    gun.position.y += 0.02;
                    gun.rotation.y -= 0.355;
                    gun.position.z += 0.16;
                    gun.position.x += 0.0485;
                    archer.position.x += 0.3;
                    archer.position.z += 0.3;
                }
                else {
                    gun.position.y -= 0.02;
                    gun.rotation.y += 0.355;
                    gun.position.z -= 0.16;
                    gun.position.x -= 0.0485;
                    archer.position.x -= 0.3;
                    archer.position.z -= 0.3;
                }
            }
        }
        else {
            event.preventDefault();
        }
    }, false);
    light = new THREE.DirectionalLight('white', 5);
    light.position.set(20, 20, 20);
    scene.add(light);
    createScore();
    var fl = new FBXLoader();
    var _loop_1 = function (i) {
        fl.load('models/espectador.fbx', function (object) {
            mixerTab.push(new THREE.AnimationMixer(object));
            var animationAction = mixerTab[i].clipAction(object.animations[0]);
            animationAction.play();
            object.scale.set(0.001, 0.001, 0.001);
            // set position to make a crowd of spectators behind the fence
            if (i < 12) {
                object.position.set((Math.random() * 3) + -0.5, -1.25, (Math.random() * 4) + 13);
                object.rotation.y = 2.5;
            }
            else {
                object.position.set((Math.random() * 3) + 14, -1.25, (Math.random() * 3) + 7);
                object.rotation.y = -1.5;
            }
            scene.add(object);
            sceneObjects.push(object);
            if (i == 11) {
                modelReady = true;
            }
            loadedScene++;
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + '% spectator loaded');
        }, function (error) { console.log(error); });
    };
    // creer 12 spectateurs
    for (var i = 0; i < 24; i++) {
        _loop_1(i);
    }
    var animationActions = [];
    var activeAction;
    var lastAction;
    var gl = new GLTFLoader();
    fl.load('models/archerV6.fbx', function (object) {
        archer = object;
        mixer2 = new THREE.AnimationMixer(archer);
        archer.scale.set(10, 10, 10);
        camera.add(archer);
        camera.position.set(0, 0.6, 0);
        cameraControls.getObject().add(archer);
        archer.position.set(0.025, -1.35, 0.25);
        archer.rotation.y = 0.35 + Math.PI;
        cameraControls.getObject().rotation.y = 0.5 + Math.PI;
        mixer2.clipAction(object.animations[0]).play();
        model2Ready = true;
        loadedScene++;
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% archer loaded');
    }, function (error) {
        console.log(error);
    });
    // load AK.FBX model
    setTimeout(function () {
        fl.load('models/AK.fbx', function (object) {
            gun = object;
            gun.scale.set(0.005, 0.005, 0.005);
            gun.position.set(-0.05, -0.1, -0.2);
            gun.rotation.y = 0.35;
            // add a new cube to the fence
            cameraControls.getObject().add(gun);
            loadedScene++;
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + '% AK loaded');
        }, function (error) {
            console.log(error);
        });
    }, 5000);
    gl.load('models/Parrot.glb', function (object) {
        parrot = object.scene;
        parrot.scale.set(0.01, 0.01, 0.01);
        parrot.position.x = 0;
        parrot.position.z = 0;
        parrot.position.y = 1;
        parrot.rotation.y = 1.5;
        mixer3 = new THREE.AnimationMixer(parrot);
        mixer3.clipAction(object.animations[0]).play();
        scene.add(parrot);
        model3Ready = true;
        birds.push(parrot);
        sceneObjects.push(parrot);
        loadedScene++;
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% bird loaded');
    }, function (error) {
        console.log(error);
    });
    gl.load('models/floor/sceneV3.glb', function (gltf) {
        gltf.scene.position.y = -1;
        gltf.scene.scale.set(0.01, 0.01, 0.01);
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(gltf.scene);
        sceneObjects.push(gltf.scene);
        loadedScene++;
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    }, function (error) { console.error(error); });
    gl.load('models/wood_fence/scene.gltf', function (gltf) {
        fence = gltf.scene;
        fence.position.y = -0.6;
        fence.position.x = 4;
        fence.position.z = 15;
        fence.rotation.y = 90;
        fence.scale.set(0.1, 0.1, 0.1);
        fence.castShadow = true;
        scene.add(fence);
        sceneObjects.push(fence);
        second_fence = fence.clone();
        second_fence.position.x = 14;
        second_fence.position.z = 9;
        scene.add(second_fence);
        sceneObjects.push(second_fence);
        loadedScene++;
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% fence loaded');
    }, function (error) { console.error(error); });
    // create a cube 
    var cubeGeometry = new THREE.BoxGeometry(200, 200, 200);
    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, -1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    var gr = new THREE.Group().add(cube);
    sceneObjects.push(gr);
    scene.add(gr);
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    var onKeyDown = function (event) {
        if (started) {
            var xDirection = archer.getWorldDirection(new THREE.Vector3()).x;
            var zDirection = archer.getWorldDirection(new THREE.Vector3()).z;
            switch (event.code) {
                case 'KeyW':
                    if (possibleDirections[0])
                        cameraControls.moveForward(0.2);
                    break;
                case 'KeyA':
                    if (possibleDirections[3])
                        cameraControls.moveRight(-0.2);
                    break;
                case 'KeyS':
                    if (possibleDirections[2])
                        cameraControls.moveForward(-0.2);
                    break;
                case 'KeyD':
                    if (possibleDirections[1])
                        cameraControls.moveRight(0.2);
                    break;
                case 'ArrowLeft':
                    cameraControls.getObject().rotation.y += 0.05;
                    break;
                case 'ArrowRight':
                    cameraControls.getObject().rotation.y -= 0.05;
                    break;
                case 'KeyI':
                    document.getElementById("blocker").style.display = "block";
                    started = false;
                    gameTheme.pause();
                    loadingTheme.play();
                    loadingTheme.loop = true;
                    loadingTheme.volume = 0.5;
                    break;
            }
        }
        else {
            event.preventDefault();
        }
    };
    document.addEventListener('keydown', onKeyDown, false);
    var onClick = function (event) {
        if (loadedScene == 30 && !started) {
            document.getElementById("blocker").style.display = "none";
            loadingTheme.pause();
            gameTheme.play();
            gameTheme.loop = true;
            gameTheme.volume = 0.5;
            started = true;
        }
        else if (started) {
            AK47Shot.play();
            var intersects = raycasters[0].intersectObjects(birds, true);
            if (intersects.length > 0) {
                delete3DOBJ('score');
                score += 1;
                createScore();
            }
        }
    };
    window.addEventListener('click', onClick);
    // make parrot move in a circle in 3 seconds using tween.js
    tween = new TWEEN.Tween(coords)
        .to(coords2, 10000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
        parrot.position.x = coords.x;
        parrot.position.z = coords.z;
    })
        .onComplete(function () {
        parrot.rotation.y += Math.PI;
    });
    tween.chain(new TWEEN.Tween(coords2)
        .to(coords, 10000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
        parrot.position.x = coords2.x;
        parrot.position.z = coords2.z;
    })
        .onComplete(function () {
        parrot.rotation.y += Math.PI;
        console.log("done");
    }).chain(tween));
    tween.start();
    var gui = new GUI();
    var parrotFolder = gui.addFolder('Parrot');
    obj = { x: 0, y: 1, z: 0, scale: 0.01 };
    parrotFolder.add(obj, 'scale', 0.01, 1, 0.01).listen().onChange(function () {
        parrot.scale.set(obj.scale, obj.scale, obj.scale);
    });
    // parrot y position
    parrotFolder.add(obj, 'y', 0, 10, 0.1).listen().onChange(function () {
        parrot.position.y = obj.y;
    });
    gui.open();
    for (var i = 0; i < 12; i++) {
        raycasters.push(new THREE.Raycaster());
    }
}
var clock = new THREE.Clock();
mouse = new THREE.Vector2();
function animate() {
    if (loadedScene == 29) {
        setTimeout(function () {
            var _a;
            document.getElementById("status").src = "assets/vamonos.jpg";
            (_a = document.getElementById("controls")) === null || _a === void 0 ? void 0 : _a.children[0].appendChild(document.createTextNode("Left Click to start !"));
        }, 2000);
        loadedScene++;
    }
    requestAnimationFrame(animate);
    TWEEN.update();
    console.log("world direction : " + camera.getWorldDirection(new THREE.Vector3()).x + " " + camera.getWorldDirection(new THREE.Vector3()).y + " " + camera.getWorldDirection(new THREE.Vector3()).z);
    lookingDirection = camera.getWorldDirection(new THREE.Vector3());
    raycasters[0].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
    raycasters[1].set(camera.getWorldPosition(new THREE.Vector3()).setY(-0.75), camera.getWorldDirection(new THREE.Vector3()));
    raycasters[2].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()));
    raycasters[3].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI / 2).setZ(lookingDirection.z + Math.PI / 2));
    raycasters[4].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI / 2).setZ(lookingDirection.z + Math.PI / 2));
    raycasters[5].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI / 2).setZ(lookingDirection.z + Math.PI / 2));
    raycasters[6].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI).setZ(lookingDirection.z + Math.PI));
    raycasters[7].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI).setZ(lookingDirection.z + Math.PI));
    raycasters[8].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x + Math.PI).setZ(lookingDirection.z + Math.PI));
    raycasters[9].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x - Math.PI / 2).setZ(lookingDirection.z - Math.PI / 2));
    raycasters[10].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x - Math.PI / 2).setZ(lookingDirection.z - Math.PI / 2));
    raycasters[11].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x - Math.PI / 2).setZ(lookingDirection.z - Math.PI / 2));
    for (var i = 0; i < 12; i++) {
        var side = Math.floor(i / 3);
        possibleDirections[side] = detectCollision(raycasters[i]);
        if (!possibleDirections[side]) {
            i = side * 3 + 2;
        }
    }
    if (modelReady) {
        mixerTab.forEach(function (mix) { return mix.update(0.025); });
    }
    if (model2Ready) {
        mixer2.update(0.05);
    }
    if (model3Ready) {
        mixer3.update(0.05);
    }
    if (model4Ready) {
        mixer4.update(0.05);
    }
    render();
}
function render() {
    renderer.render(scene, camera);
}
animate();
function findBoneByName(object, name) {
    var bone;
    object.traverse(function (node) {
        if (node instanceof THREE.Bone && node.name === name) {
            bone = node;
        }
    });
    return bone;
}
function getDistWithAngle(angle) {
    var angleNormalized = (1 - Math.abs(angle)) / 2;
    var dist = (1 - Math.sin(angleNormalized * Math.PI)) * 0.1;
    return angle > 0 ? dist : -dist;
}
function createScore() {
    ftl.load('fonts/helvetiker_bold.typeface.json', function (font) {
        var geo = new TextGeometry(score.toString(), {
            font: font,
            size: 5,
            height: 2,
        });
        var material = new THREE.MeshPhongMaterial({ color: 0x15c727 });
        text = new THREE.Mesh(geo, material);
        text.castShadow = true;
        text.position.y = 4;
        text.position.x = 22;
        text.position.z = 15;
        text.rotation.y = 4;
        text.name = "score";
        scene.add(text);
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% text loaded');
        if ((xhr.loaded / xhr.total) == 1)
            loadedScene++;
    }, function (error) {
        console.log(error);
    });
}
function delete3DOBJ(objName) {
    var selectedObject = scene.getObjectByName(objName);
    selectedObject != undefined ? scene.remove(selectedObject) : console.log("object not found");
}
// function to detect collision between the camera and sceneObjects using raycaster
function detectCollision(raycaster) {
    var intersects = raycaster.intersectObjects(sceneObjects, true);
    if (intersects.length > 0) {
        return intersects[0].distance < 0.5 ? false : true;
    }
    return true;
}
