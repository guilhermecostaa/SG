var controls;
var renderer, scene, camera;
var ship;
var sphere;
var moving;
var movingLeft, movingRight, movingDown, movingUp;
var spawnControl = 0;
var asteroideVelocity = 0;

window.onload = function init() {

    // create an empty scene, that will hold all our elements such as objects, cameras and lights
    scene = new THREE.Scene();

    /*********************
     * CAMERA 
     * *******************/
    // create a camera, which defines where we're looking at
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
    camera.position.z = 50;
    camera.position.y = 15;

    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', function () { renderer.render(scene, camera); });
    /*********************
     * RENDERER 
     * *******************/
    // create a render and set the size
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // configure renderer clear color
    renderer.setClearColor("#0000000");

    // add the output of the renderer to an HTML element (this case, the body)
    document.body.appendChild(renderer.domElement);

    // Add key handling
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
    scene.add(hemisphereLight);

    // directionallight
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(100, 80, 50);
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.castShadow = true;
    scene.add(directionalLight);


    createShip();
    createEarth();
    createAsteroide();
    animate();
}

function createShip() {
    // LOAD THE MESH
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('./models/3d-model.mtl', function (materials) {
        materials.preload();
        let loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load('./models/3d-model.obj', function (object) {
            ship = object;
            ship.scale.set(0.1, 0.1, 0.1);
            ship.rotateY(Math.PI);
            scene.add(ship);
        });
    });
}

function createEarth() {
    // create the geometry (shape) of the cylinder: radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    let geometry = new THREE.SphereGeometry(100, 100, 100, 40, 10);

    map = new THREE.TextureLoader().load('images/no_clouds_4k.jpg');
    bumpmap = new THREE.TextureLoader().load('images/elev_bump_4k.jpg');
    material = new THREE.MeshPhongMaterial({
        map: map,
        bumpMap: bumpmap,
        bumpScale: 0.05
    });
    // And put the geometry and material together into a mesh
    sphere = new THREE.Mesh(geometry, material);
    sphere.position.y = -80
    sphere.scale.set(0.8, 0.8, 0.8)
    sphere.receiveShadow = true;

    console.log("earth created")
    scene.add(sphere);
}

function handleKeyDown(event) {
    var char = String.fromCharCode(event.keyCode);
    switch (char) {
        case "A":
            moving = true
            movingLeft = true
            break;
        case "D":
            movingRight = true
            moving = true
            break;
        case "W":
            movingUp = true
            moving = true
            break;
        case "S":
            movingDown = true
            moving = true
            break;
        default:
            break;
    }
}

function handleKeyUp(event) {
    var char = String.fromCharCode(event.keyCode);
    switch (char) {
        case "A":
            moving = false
            movingLeft = false
            break;
        case "D":
            movingRight = false
            moving = false
            break;
        case "W":
            movingUp = false
            moving = false
            break;
        case "S":
            movingDown = false
            moving = false
            break;
        default:
            break;
    }
}

function UpdateShip() {

    if (movingLeft == true) {
        movingLeft = true
        ship.position.x -= 0.1
        if (ship.rotation.z > -0.2)
            ship.rotation.z -= 0.01
        else
            ship.rotation.z = -0.2
    }

    if (movingRight == true) {
        ship.position.x += 0.1
        if (ship.rotation.z < 0.2)
            ship.rotation.z += 0.01
        else
            ship.rotation.z = 0.2
    }

    if (movingUp == true) {
        ship.position.y += 0.1
        if (ship.rotation.x < 0.6)
            ship.rotation.x += 0.03
        else
            ship.rotation.x = 0.6
    }

    if (movingDown == true) {
        ship.position.y -= 0.1
        if (ship.rotation.x > -0.6)
            ship.rotation.x -= 0.03
        else
            ship.rotation.x = -0.6
    }

    if (moving == false) {
        if (ship.rotation.z < 0) {
            ship.rotation.z += 0.01
        }

        if (ship.rotation.z > 0) {
            ship.rotation.z -= 0.01
        }

        if (ship.rotation.z == 0) {
            ship.rotation.z = 0
        }

        if (ship.rotation.x < 0) {
            ship.rotation.x += 0.01
        }

        if (ship.rotation.x > 0) {
            ship.rotation.x -= 0.01
        }

        if (ship.rotation.x == 0) {
            ship.rotation.x = 0
        }
    }
}

function createAsteroide() {
    if (spawnControl > 0 && spawnControl < 100) {
        spawnControl++
    }

    if (spawnControl == 100) {
        spawnControl = 0

        if (asteroideVelocity < 0.7)
            asteroideVelocity += 0.01
    }

    if (spawnControl == 0) {
        // create an empty container
        asteroide = new THREE.Object3D();
        let raio = getRandom(10, 20)
        var geometry = new THREE.SphereGeometry(raio, 32, 32);
        var material = new THREE.MeshPhongMaterial({ color: 0xd8d0d1 });
        var rocha = new THREE.Mesh(geometry, material);
        rocha.position.y = 30 - Math.floor((Math.random() * 40) + 1)
        rocha.position.x = 10 - Math.floor((Math.random() * 20) + 1)
        rocha.position.z =  -50
        rocha.scale.set(0.3, 0.3, 0.3)
        asteroide.add(rocha)
        scene.add(asteroide);

        spawnControl = 1;
    }

}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function animate() {
    sphere.rotation.x += 0.005;
    // render
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}