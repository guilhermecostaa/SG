var controls;
var renderer, scene, camera;
var ship = new THREE.Object3D();
var shipBox
var hitbox;
var sphere;
var moving;
var movingLeft, movingRight, movingDown, movingUp;
var asteroides = [];
var numbAsteroides = 0;
var sphere2;
var bullet;
var openFire;
var bullets = [];
let bullBoxes = [];
let astBoxes = [];
let score = 0;
let scoreText = "";
let lifesText = "";
let lifes = 3;
let bbHelper;

window.onload = function init() {

    // create an empty scene, that will hold all our elements such as objects, cameras and lights
    scene = new THREE.Scene();

    /*********************
     * CAMERA 
     * *******************/
    // create a camera, which defines where we're looking at
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
    camera.position.z = 70;
    camera.position.y = 10;

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

    var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0xffffff, 0.9);
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


    // text - points
    scoreText = document.createElement('div');
    scoreText.style.position = 'absolute';
    scoreText.style.width = 100;
    scoreText.style.height = 100;
    scoreText.style.color = "white";
    scoreText.innerHTML = "Pontos: " + score;
    scoreText.style.top = 50 + 'px';
    scoreText.style.left = 50 + 'px';
    document.body.appendChild(scoreText);

    //text - lives
    livesText = document.createElement('div');
    livesText.style.position = 'absolute';
    livesText.style.width = 100;
    livesText.style.height = 100;
    livesText.style.color = "white";
    livesText.innerHTML = "Vidas: " + lifes;
    livesText.style.top = 75 + 'px';
    livesText.style.left = 50 + 'px';
    document.body.appendChild(livesText);



    createShip();
    createSpace();
    createAsteroide();
    animate();
}

// create and place the ship
function createShip() {
    // LOAD THE MESH
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('./models/fast-ship.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load('./models/fast-ship.obj', function (object) {
            ship = object;
            ship.position.z = 40
            ship.scale.set(1, 1, 1);
            ship.rotateY(Math.PI);

            shipBox = new THREE.Box3().setFromObject(ship);
            scene.add(shipBox)
            scene.add(ship);

        });
    });
}

function createSpace() {
    let textureCube = new THREE.CubeTextureLoader()
        .setPath('images/')
        .load([
            'espaco.png',
            'espaco.png',
            'espaco.png',
            'espaco.png',
            'espaco.png',
            'espaco.png'
        ], function () { renderer.render(scene, camera) });
    scene.background = textureCube;


}

//create projectiles to be fired
function createBullet() {
    if (openFire) {
        var geometry = new THREE.BoxGeometry(0.5, 0.5);
        var material = new THREE.MeshBasicMaterial();
        bullet = new THREE.Mesh(geometry, material);

        bullet.position.z = ship.position.z
        bullet.position.x = ship.position.x
        bullet.position.y = ship.position.y

        bullets.push(bullet)

        scene.add(bullet)
        bullet.pos = ship.position.clone()
        bullet.pos = bullet.pos.clone().applyMatrix4(ship.matrixWorld);

    }

    //removes bullets
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].position.z < -100) {

            scene.remove(bullets[i])
            bullets.splice(i, 1)
        }
    }
}


function createAsteroide() {


    // create an empty container
    asteroide = new THREE.Object3D();
    let raio = getRandom(3, 20)
    var texture = new THREE.TextureLoader().load("./images/asteroid.png")
    var geometry = new THREE.SphereGeometry(raio, getRandom(6,10), getRandom(5,7));
    var material = new THREE.MeshPhongMaterial({ map: texture });
    var rocha = new THREE.Mesh(geometry, material);
    //random positioning
    rocha.position.y = 30 - Math.floor((Math.random() * 40) + 1)
    rocha.position.x = 10 - Math.floor((Math.random() * 50) + 1)
    rocha.position.z = getRandom(-80, -150)
    rocha.scale.set(0.3, 0.3, 0.3)

    asteroides.push(asteroide)
    asteroide.add(rocha)
    scene.add(asteroide);

    numbAsteroides++;


}

function createCollisionBox() {

    //colision box for the bullets and asteroids
    for (let i = 0; i < asteroides.length; i++) {
        for (let j = 0; j < bullets.length; j++) {

            //hitbox
            let bullBox = new THREE.Box3().setFromObject(bullets[j])
            let astBox = new THREE.Box3().setFromObject(asteroides[i]);

            bullBoxes.push(bullBox)
            astBoxes.push(astBox)
        }
    }
}

function checkCollision() {

    createCollisionBox()

    //colision between bullets and asteroids
    if (bullBoxes.length) {
        for (let i = 0; i < bullBoxes.length; i++) {
            for (let j = 0; j < astBoxes.length; j++) {

                if (bullBoxes[i].intersectsBox(astBoxes[j])) {
                    scene.remove(asteroides[j])
                    asteroides.splice(j, 1)
                    astBoxes.splice(j, 1)
                    score += 1
                    scoreText.innerHTML = "Pontos:" + score

                }
            }
        }
    }
}

function handleKeyDown(event) {
    var char = String.fromCharCode(event.keyCode);
    //moviment
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
        //firing bullets
        case "K":
            openFire = true
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
        case "K":
            openFire = false
        default:
            break;
    }
}

function UpdateShip() {

    if (movingLeft == true) {
        movingLeft = true
        ship.position.x -= 0.2
        if (ship.position.z > +0.2) {
            ship.position.z += 0.01
        }
        else {
            ship.position.z = +0.2
        }

    }

    if (movingRight == true) {
        ship.position.x += 0.2
    }

    if (movingUp == true) {
        ship.position.y += 0.2
    }

    if (movingDown == true) {
        ship.position.y -= 0.2
    }



    //Colision between ship - asteroid

     /*  shipBox = new THREE.Box3().setFromObject(ship)
    

    //colisions
    for (let i = 0; i < asteroides.length; i++) {
        if (shipBox.intersectsBox(astBoxes[i])) {
            scene.remove(asteroides[i])
            asteroides.splice(i, 1)
            astBoxes.splice(i, 1)
            lifes --
        }
    }     */
}
function updateBullet() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].position.z += -5
    }
}

function updateAsteroide() {

    if (numbAsteroides <= 3) {
        createAsteroide();
    }
    //asteroides speed
    for (let i = 0; i < asteroides.length; i++) {
        if (score <= 5) {
            asteroides[i].position.z += getRandom(0.01, 0.03)
        }
        if (score <= 10) {
            asteroides[i].position.z += getRandom(0.04, 0.06)
        }
        if (score <= 20) {
            asteroides[i].position.z += getRandom(0.07, 0.1)
        } else {
            asteroides[i].position.z += getRandom(0.1, 0.2)
        }

        //update number of asteroides
        if (asteroides[i].position.z > 200) {

            scene.remove(asteroides[i])
            asteroides.splice(i, 1)
            numbAsteroides--
        }
    }

}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function animate() {

    createBullet();
    updateBullet();
    updateAsteroide();
    checkCollision();
    UpdateShip();
    // render
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}