import * as THREE from 'three'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'lil-gui'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Light, Object3D } from 'three'
import { radToDeg } from 'three/src/math/MathUtils'
let fence: THREE.Group;
let coords = {x: 5, y: 1, z: 25}
let coords2 = {x: 19, y: 1, z: 19}
let second_fence: THREE.Group;
let raycasters : THREE.Raycaster[] = [];
let birds: THREE.Object3D<THREE.Event>[] | THREE.Group[] = [];
let sceneObjects: THREE.Object3D<THREE.Event>[] | THREE.Group[] = [];
let mouse: THREE.Vector2;
let tween: TWEEN.Tween<any>;
let cube: THREE.Mesh;
let score: number = 0;
let obj : { x: number, y: number, z: number, scale: number}
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, cameraControls: PointerLockControls, text: THREE.Mesh, light: THREE.DirectionalLight;
let mixer2: THREE.AnimationMixer
let model2Ready = false
let modelReady = false
let mixer3: THREE.AnimationMixer
let model3Ready = false
let mixer4: THREE.AnimationMixer
let model4Ready = false
let archer: THREE.Group = new THREE.Group()
let loadedScene: number = 0;
let parrot: THREE.Group = new THREE.Group()
let ftl = new FontLoader();
let mixerTab: THREE.AnimationMixer[] = []
let possibleDirections: boolean[] = [true, true, true, true]
let lookingDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
let gun : THREE.Group = new THREE.Group()
let mode : string = "normal"
let savedDirection: THREE.Euler = new THREE.Euler(0, 0, 0)
let started: boolean = false
let gameTheme = new Audio('assets/sounds/gameTheme.mp3')
let loadingTheme = new Audio('assets/sounds/loadingTheme.mp3')
let AK47Shot = new Audio('assets/sounds/AK47.mp3')
init();

function init() {
    
    scene = new THREE.Scene()
    // set perspective camera with parameters adapted to first person view and the scene
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000)

    

    camera.position.z = 0.5
    camera.position.x = -0.2
    camera.position.y = 0.6;


    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor('skyblue')
    document.body.appendChild(renderer.domElement)
    //cameraControls = new OrbitControls(camera, renderer.domElement)

    cameraControls = new PointerLockControls(camera,  document.body);
    // slow down camera movement


    cameraControls.addEventListener('unlock', function(){
        
        camera.rotation.y = 0
        camera.rotation.x = 0
        camera.rotation.z = 0
    })

    scene.add(cameraControls.getObject())

    loadingTheme.play();
    loadingTheme.volume = 0.5;

    document.body.addEventListener( 'keypress', function (event) {
        if(started) {
            if ( event.code === 'Enter' ) {
                savedDirection = camera.rotation
                console.log("lock :"+savedDirection.x+" "+savedDirection.y+" "+savedDirection.z)
                cameraControls.lock()
            }
            if ( event.code === 'Space' ) {
                mode = mode == "normal" ? "shoot" : "normal"
                if(mode == "shoot"){
                    gun.position.y += 0.02
                    gun.rotation.y -= 0.355
                    gun.position.z += 0.16
                    gun.position.x += 0.0485
                    archer.position.x += 0.3
                    archer.position.z += 0.3
                
                }else{
                    gun.position.y -= 0.02
                    gun.rotation.y += 0.355
                    gun.position.z -= 0.16
                    gun.position.x -= 0.0485
                    archer.position.x -= 0.3
                    archer.position.z -= 0.3
                }
            }
        }else {
            event.preventDefault();
        }
        
    }, false );

    light = new THREE.DirectionalLight('white', 5);

    light.position.set(20, 20, 20);
    scene.add(light)


createScore();

    
let fl: FBXLoader = new FBXLoader();
// creer 12 spectateurs
for(let i = 0; i < 24; i++){
    fl.load(
        'models/espectador.fbx',
        (object) => {
            mixerTab.push(new THREE.AnimationMixer(object))

            const animationAction = mixerTab[i].clipAction(
                (object as THREE.Object3D).animations[0]
            )
            animationAction.play()
            object.scale.set(0.001, 0.001, 0.001)
            // set position to make a crowd of spectators behind the fence
            if(i < 12){
                object.position.set((Math.random() * 3) + -0.5, -1.25, (Math.random() * 4) + 13)
                object.rotation.y = 2.5
            }else{
                object.position.set((Math.random() * 3) + 14, -1.25, (Math.random() * 3) + 7)
                object.rotation.y = -1.5
            }
            
            scene.add(object)
            sceneObjects.push(object)
            if(i == 11){
                modelReady = true;
            }
            loadedScene++;
        },
        (xhr) => { 
            console.log((xhr.loaded / xhr.total) * 100 + '% spectator loaded')
        },
        (error) => { console.log(error)}
    )
}
            


const animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction
let gl: GLTFLoader = new GLTFLoader();

fl.load(
    'models/archerV6.fbx',
    (object) => {
        archer = object

        mixer2 = new THREE.AnimationMixer(archer)
        archer.scale.set(10, 10, 10)
        camera.add(archer)
        camera.position.set(0, 0.6, 0)
        cameraControls.getObject().add(archer)

        archer.position.set(0.025, -1.35, 0.25)
        archer.rotation.y = 0.35 +  Math.PI
        cameraControls.getObject().rotation.y = 0.5 + Math.PI

        mixer2.clipAction(
            (object as THREE.Object3D).animations[0]
        ).play()
        model2Ready = true;
        loadedScene++;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% archer loaded')
        
    },
    (error) => {
        console.log(error)
    }
)

// load AK.FBX model
setTimeout(function(){
fl.load(
    'models/AK.fbx',
    (object) => {
        gun = object
        gun.scale.set(0.005, 0.005, 0.005)
        gun.position.set(-0.05, -0.1, -0.2)
        gun.rotation.y = 0.35


        // add a new cube to the fence

       cameraControls.getObject().add(gun)
        loadedScene++;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% AK loaded')
    },
    (error) => {
        console.log(error)
    }
)
}, 5000);


gl.load(
    'models/Parrot.glb',
    (object) => {
        parrot = object.scene
        parrot.scale.set(0.01, 0.01, 0.01)
        parrot.position.x = 0
        parrot.position.z = 0;
        parrot.position.y = 1
        parrot.rotation.y = 1.5
        mixer3 = new THREE.AnimationMixer(parrot)

        mixer3.clipAction(
          object.animations[0]
        ).play()
        scene.add(parrot)
        model3Ready = true;
        birds.push(parrot)
        sceneObjects.push(parrot)
        loadedScene++;
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% bird loaded')
    },
    (error) => {
        console.log(error)
    }
)


gl.load( 'models/floor/sceneV3.glb', function ( gltf ) {
    gltf.scene.position.y = -1
    gltf.scene.scale.set(0.01,0.01,0.01)
    gltf.scene.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    scene.add( gltf.scene );
    sceneObjects.push(gltf.scene)
    loadedScene++;
}, 
(xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
},
function ( error ) {console.error( error );} );

gl.load( 'models/wood_fence/scene.gltf', function ( gltf ) {
    fence = gltf.scene;
    fence.position.y = -0.6;
    fence.position.x = 4;
    fence.position.z = 15;
    fence.rotation.y = 90;
    fence.scale.set(0.1, 0.1, 0.1)
    fence.castShadow = true;
    scene.add( fence );
    sceneObjects.push(fence)
    second_fence = fence.clone();
    second_fence.position.x = 14;
    second_fence.position.z = 9;
    scene.add( second_fence );
    sceneObjects.push(second_fence)
    loadedScene++;
  }, 
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% fence loaded')
 },
  function ( error ) {console.error( error );} );

  // create a cube 
const cubeGeometry = new THREE.BoxGeometry(200, 200, 200)
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
})


cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
cube.position.set(0, -1, 0)
cube.castShadow = true
cube.receiveShadow = true
let gr = new THREE.Group().add(cube)
sceneObjects.push(gr)
scene.add(gr)


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const onKeyDown = function (event: KeyboardEvent) {
    if(started){
    let xDirection = archer.getWorldDirection(new THREE.Vector3()).x
    let zDirection = archer.getWorldDirection(new THREE.Vector3()).z
    switch (event.code) {
        case 'KeyW':
            if(possibleDirections[0]) cameraControls.moveForward(0.2)
            break
        
        case 'KeyA':
            if(possibleDirections[3]) cameraControls.moveRight(-0.2)
            break
        case 'KeyS':
            if(possibleDirections[2]) cameraControls.moveForward(-0.2)
            break
        case 'KeyD':
            if(possibleDirections[1]) cameraControls.moveRight(0.2)
            break
        case 'ArrowLeft':
            cameraControls.getObject().rotation.y += 0.05
            break
        case 'ArrowRight':
            cameraControls.getObject().rotation.y -= 0.05
            break
        case 'KeyI':
            document.getElementById("blocker")!.style.display = "block";
            started = false;
            gameTheme.pause();
            loadingTheme.play();
            loadingTheme.loop = true;
            loadingTheme.volume = 0.5;
            break;
    }
} else {
    event.preventDefault();
}
}
document.addEventListener('keydown', onKeyDown, false)


const onClick = function ( event: { x: number; y: number; } ) {
        if(loadedScene == 30 && !started) {
            document.getElementById("blocker")!.style.display = "none";
            loadingTheme.pause();
            gameTheme.play();
            gameTheme.loop = true;
            gameTheme.volume = 0.5;
            started = true;
        } else if (started){
            AK47Shot.play();
            const intersects : any = raycasters[0].intersectObjects( birds, true );
            if ( intersects.length > 0 ) {
                delete3DOBJ('score')
                score += 1;
                createScore()
                
    
    
            }   
        }

};

window.addEventListener( 'click', onClick );

// make parrot move in a circle in 3 seconds using tween.js

tween = new TWEEN.Tween(coords)
.to(coords2, 10000)   
.easing(TWEEN.Easing.Quadratic.InOut)
.onUpdate(() => {
    parrot.position.x = coords.x
    parrot.position.z = coords.z

})
.onComplete(() => {
    parrot.rotation.y += Math.PI
})


tween.chain(new TWEEN.Tween(coords2)
.to(coords, 10000)
.easing(TWEEN.Easing.Quadratic.InOut)
.onUpdate(() => {
    parrot.position.x = coords2.x
    parrot.position.z = coords2.z
})
.onComplete(() => {
    parrot.rotation.y += Math.PI
    console.log("done")
}).chain(tween))



tween.start()

const gui = new dat.GUI()
const parrotFolder = gui.addFolder('Parrot')

obj = { x: 0, y: 1, z: 0, scale: 0.01} 

parrotFolder.add(obj, 'scale',0.01,1,0.01).listen().onChange(() => {
    parrot.scale.set(obj.scale,obj.scale,obj.scale)
    });

// parrot y position
parrotFolder.add(obj, 'y',0,10,0.1).listen().onChange(() => {
    parrot.position.y = obj.y
});

gui.open()


for(let i = 0; i < 12; i++) {
    raycasters.push(new THREE.Raycaster())
}

}



















const clock = new THREE.Clock()


mouse = new THREE.Vector2();


function animate() {
    if(loadedScene == 29) {
        setTimeout(() => {
    
            (document.getElementById("status") as HTMLImageElement).src = "assets/vamonos.jpg"
            document.getElementById("controls")?.children[0].appendChild(document.createTextNode("Left Click to start !"))
        }, 2000);
        loadedScene++;
    }

requestAnimationFrame(animate)
TWEEN.update()

    console.log("world direction : "+camera.getWorldDirection(new THREE.Vector3()).x+" "+camera.getWorldDirection(new THREE.Vector3()).y+" "+camera.getWorldDirection(new THREE.Vector3()).z)
    lookingDirection = camera.getWorldDirection(new THREE.Vector3())

    raycasters[0].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
    raycasters[1].set(camera.getWorldPosition(new THREE.Vector3()).setY(-0.75), camera.getWorldDirection(new THREE.Vector3()))
    raycasters[2].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()))

    raycasters[3].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI/2).setZ(lookingDirection.z+Math.PI/2))
    raycasters[4].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI/2).setZ(lookingDirection.z+Math.PI/2))
    raycasters[5].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI/2).setZ(lookingDirection.z+Math.PI/2))

    raycasters[6].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI).setZ(lookingDirection.z+Math.PI))
    raycasters[7].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI).setZ(lookingDirection.z+Math.PI))
    raycasters[8].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x+Math.PI).setZ(lookingDirection.z+Math.PI))

    raycasters[9].set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x-Math.PI/2).setZ(lookingDirection.z-Math.PI/2))
    raycasters[10].set(camera.getWorldPosition(new THREE.Vector3()).setY(0.25), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x-Math.PI/2).setZ(lookingDirection.z-Math.PI/2))
    raycasters[11].set(camera.getWorldPosition(new THREE.Vector3()).setY(0), camera.getWorldDirection(new THREE.Vector3()).setX(lookingDirection.x-Math.PI/2).setZ(lookingDirection.z-Math.PI/2))

    for(let i = 0; i < 12; i++) {
        let side = Math.floor(i/3)
        possibleDirections[side] = detectCollision(raycasters[i])
        if (!possibleDirections[side]) {
            i = side*3+2
        }
    }

    if (modelReady) {
        mixerTab.forEach(mix => mix.update(0.025));
    }    
    if (model2Ready) {
        mixer2.update(0.05)
    }


    if (model3Ready) {
        mixer3.update(0.05)
    }

    if (model4Ready) {
        mixer4.update(0.05)
    }
    render()
}



function render() {
    renderer.render(scene, camera)
}

animate()

function findBoneByName(object: THREE.Object3D, name: string): THREE.Bone | undefined {
    let bone: THREE.Bone | undefined;
    object.traverse((node) => {
      if (node instanceof THREE.Bone && node.name === name) {
        bone = node as THREE.Bone;
      }
    });
    return bone;
}


function getDistWithAngle(angle: number) {
    let angleNormalized = (1 - Math.abs(angle)) / 2
    let dist = (1 - Math.sin(angleNormalized * Math.PI)) * 0.1
    
    return angle > 0 ? dist : -dist
}

function createScore(){
    ftl.load('fonts/helvetiker_bold.typeface.json', function (font) {
      var geo = new TextGeometry(score.toString(), {
        font: font,
        size: 5,
        height: 2,
        
      });
      var material = new THREE.MeshPhongMaterial({color: 0x15c727});
      text = new THREE.Mesh(geo, material);
      text.castShadow = true;
      text.position.y = 4;
      text.position.x = 22;
      text.position.z = 15;
      text.rotation.y = 4;
      text.name = "score"
      scene.add(text);
    
    },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% text loaded')
            if((xhr.loaded / xhr.total)==1) loadedScene++;
            },
            (error) => {
                console.log(error)
                });
    
}

function delete3DOBJ(objName : string){
    let selectedObject = scene.getObjectByName(objName);
    selectedObject != undefined ? scene.remove( selectedObject ) : console.log("object not found")
}

// function to detect collision between the camera and sceneObjects using raycaster
function detectCollision(raycaster : THREE.Raycaster) {
    let intersects = raycaster.intersectObjects(sceneObjects, true);
    if (intersects.length > 0 ) {
        return intersects[0].distance < 0.5 ? false : true   
    }
    return true
}
