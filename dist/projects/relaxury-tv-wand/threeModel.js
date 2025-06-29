import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

let scene, camera, renderer, rgbeLoader, controls;
let groundGeometry, groundMaterial, ground;
let backwallGeometry, backwallMaterial, backwall;
let videoElement = null;
let videoTexture = null;
let imageTexture = null;

let projectmap = 'projects/relaxury-tv-wand/';

export function initThree(containerElem) {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4d4d4);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, containerElem.offsetWidth / containerElem.offsetHeight, 0.1, 100);
    camera.position.set(-4, 1.7, 4);
    camera.updateProjectionMatrix();

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerElem.offsetWidth, containerElem.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    containerElem.appendChild(renderer.domElement);

    const resizeObserver = new ResizeObserver(() => {
        onWindowResize(containerElem, camera, renderer);
    });

    resizeObserver.observe(modelviewer);

    rgbeLoader = new RGBELoader();
    rgbeLoader.load(projectmap + 'img/hdri/yoga_room_2k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const envMap = texture.clone();
        const exposure = 0.5;
        scene.environment = envMap;
        renderer.toneMappingExposure = exposure;
    });

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // Verhoog maxPolarAngle iets, maar niet te veel
    controls.minPolarAngle = Math.PI / 3;  // Minimum in 45 graden
    controls.maxPolarAngle = Math.PI / 2 + 0.1;  // Verhoog een beetje voor meer vrijheid, maar niet te veel

    controls.minAzimuthAngle = -Math.PI / 2 + 0.05;
    controls.maxAzimuthAngle = Math.PI / 2 - 0.05;

    controls.target.set(0, 1.2, 0);
    controls.update();

    // desktop version
    if (windowHeight < windowWidth) {
        document.getElementById('fullscreen').addEventListener('click', fullscreenToggle);
    }

    // Start the render loop
    render();
}

function addGround() {
    groundGeometry = new THREE.PlaneGeometry(20, 20);
    groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(ground);
    /*
        backwallGeometry = new THREE.PlaneGeometry(1000, 20);
        backwallMaterial = new THREE.MeshStandardMaterial({
            color: '#d2d2d2',
            side: THREE.FrontSide
        });
        backwall = new THREE.Mesh(backwallGeometry, backwallMaterial);
        backwall.position.set(0, 10, 0);
        backwall.castShadow = true;
        backwall.receiveShadow = true;
        scene.add(backwall);
        */
}

// Desktop versie
if (windowHeight < windowWidth) {
    document.getElementById('downloadModel').addEventListener('click', () => {
        exportModel();
    });
}

function createCinewall(width, height, depth, tvSize, wallColor, soundbar, fireplaceWidth, fireplaceHeight, fireplaceType, video, alcoveRight, alcoveRightShelves, alcoveRightSpots, alcoveLeft, alcoveLeftShelves, alcoveLeftSpots) {
    let widthInMeters = width / 100;
    let heightInMeters = height / 100;
    let depthInMeters = depth / 100;
    let fireplaceWidthInMeters;
    if (fireplaceWidth) {
        fireplaceWidthInMeters = fireplaceWidth / 100;
    }
    let fireplaceHeightInMeters;
    if (fireplaceHeight) {
        fireplaceHeightInMeters = fireplaceHeight / 100;
    }

    let alcoveRightWidthInMeters = alcoveRight / 100;
    let alcoveLeftWidthInMeters = alcoveLeft / 100;

    const evaluator = new Evaluator();



    const wallGeometry = new THREE.BoxGeometry(widthInMeters, heightInMeters, depthInMeters);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#' + wallColor });

    let wall = new Brush(wallGeometry);
    wall.updateMatrixWorld();

    const tvWidth = tvSize * (16 / 18.3576) * 0.0254;
    const tvHeight = tvSize * (9 / 18.3576) * 0.0254;
    const recessWidth = tvWidth + 0.03;
    const recessHeight = tvHeight + 0.03;

    const tvRecess = new Brush(new THREE.BoxGeometry(recessWidth, recessHeight, 0.15));
    tvRecess.position.set(0, 1 - (heightInMeters / 2) + (recessHeight / 2), depthInMeters / 2);
    tvRecess.updateMatrixWorld();

    let wallResult = evaluator.evaluate(wall, tvRecess, SUBTRACTION);

    if (soundbar) {
        // recess
        const soundbarRecess = new Brush(new THREE.BoxGeometry(recessWidth, 0.1, 0.15));
        soundbarRecess.position.set(0, 0.8 - (heightInMeters / 2) + 0.05, (depthInMeters / 2) - 0.075);
        soundbarRecess.updateMatrixWorld();

        wallResult = evaluator.evaluate(wallResult, soundbarRecess, SUBTRACTION);

        // geometry
        const soundbarGeometry = new THREE.CylinderGeometry(0.04, 0.04, recessWidth - 0.03, 32);;
        const soundbarMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

        const soundbarMesh = new THREE.Mesh(soundbarGeometry, soundbarMaterial);
        soundbarMesh.rotation.z = Math.PI / 2;
        soundbarMesh.position.set(0, .84, (depthInMeters) - 0.075);
        scene.add(soundbarMesh);

        soundbarMesh.castShadow = true;
        soundbarMesh.receiveShadow = true;
    }

    if (fireplaceWidth) {
        // Maak de recess voor de haard
        const fireplaceRecess = new Brush(new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.30));
        fireplaceRecess.position.set(0, 0.2 - (heightInMeters / 2) + (fireplaceHeightInMeters / 2), (depthInMeters / 2) - 0.075);
        fireplaceRecess.updateMatrixWorld();

        wallResult = evaluator.evaluate(wallResult, fireplaceRecess, SUBTRACTION);

        // Video-element ophalen en afspelen
        const fireElement = document.getElementById('optiflame');
        fireElement.play().catch(error => console.error("Video afspelen mislukt:", error));

        // Video-textuur aanmaken
        const fireplaceTexture = new THREE.VideoTexture(fireElement);
        fireplaceTexture.minFilter = THREE.LinearFilter;
        fireplaceTexture.magFilter = THREE.LinearFilter;

        // Materiaal aanmaken met video als textuur
        const fireplaceMaterial = new THREE.MeshBasicMaterial({ map: fireplaceTexture });

        // Geometrie en mesh voor de video-textuur
        const fireplaceGeometry = new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.005);
        const fireplaceMesh = new THREE.Mesh(fireplaceGeometry, fireplaceMaterial);
        fireplaceMesh.position.set(0, 0.2 + (fireplaceHeightInMeters / 2), depthInMeters - 0.15);
        scene.add(fireplaceMesh);

        // Frame maken voor de haard
        const fireplaceFrameMesh = new Brush(new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.3));
        const fireplaceCutout = new Brush(new THREE.BoxGeometry(fireplaceWidthInMeters - 0.03, fireplaceHeightInMeters - 0.03, 4));
        const fireplaceFrameResult = evaluator.evaluate(fireplaceFrameMesh, fireplaceCutout, SUBTRACTION);

        if (fireplaceFrameResult) {
            const fireplaceMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0.6 });
            const fireplaceFrameMesh = new THREE.Mesh(fireplaceFrameResult.geometry, fireplaceMaterial);
            fireplaceFrameMesh.position.set(0, 0.2 + (fireplaceHeightInMeters / 2), depthInMeters - 0.15);
            scene.add(fireplaceFrameMesh);

            fireplaceFrameMesh.castShadow = true;
            fireplaceFrameMesh.receiveShadow = true;
        }
    }


    let wallMesh = null;

    if (wallResult) {
        wallMesh = new THREE.Mesh(wallResult.geometry, wallMaterial);
        wallMesh.position.set(0, heightInMeters / 2, depthInMeters / 2);
        scene.add(wallMesh);

        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
    }

    const tvDepth = 0.02;
    const bezelThickness = 0.015;

    const tvFrameMesh = new Brush(new THREE.BoxGeometry(tvWidth + bezelThickness, tvHeight + bezelThickness, tvDepth));
    const tvMesh = new Brush(new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth));
    const tvBezelResult = evaluator.evaluate(tvFrameMesh, tvMesh, SUBTRACTION);

    if (tvBezelResult) {
        const tvFrameMesh = new THREE.Mesh(tvBezelResult.geometry, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.6 }));
        tvFrameMesh.position.set(0, 1 + (tvHeight / 2) + 0.015, depthInMeters - 0.02);
        scene.add(tvFrameMesh);

        tvFrameMesh.castShadow = true;
        tvFrameMesh.receiveShadow = true;
    }

    // Gebruik de functie in je TV-materiaal
    const tvScreenMaterial = new THREE.MeshStandardMaterial({
        map: updateVideoTexture(video),
        //color: 0x000000,

        roughness: 0.1,
        metalness: 0.5,
    });

    // Maak en plaats het TV-scherm
    const tvScreenGeometry = new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth - 0.005);
    const tvScreenMesh = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreenMesh.position.set(0, 1 + (tvHeight / 2) + 0.015, depthInMeters - 0.02);
    scene.add(tvScreenMesh);

    tvScreenMesh.castShadow = true;
    tvScreenMesh.receiveShadow = true;

    if (alcoveLeft) {
        // Geometry
        const alcoveLeftGeometry = new Brush(new THREE.BoxGeometry(alcoveLeftWidthInMeters, heightInMeters, depthInMeters - 0.05));

        // Recess
        const alcoveLeftRecess = new Brush(new THREE.BoxGeometry(alcoveLeftWidthInMeters - 0.2, heightInMeters - 0.4, depthInMeters - 0.07));
        alcoveLeftRecess.position.set(0, 0, 0.035);
        alcoveLeftRecess.updateMatrixWorld();

        const alcoveLeftResult = evaluator.evaluate(alcoveLeftGeometry, alcoveLeftRecess, SUBTRACTION);

        if (alcoveLeftResult) {
            const alcoveLeft = new THREE.Mesh(alcoveLeftResult.geometry, wallMaterial);
            alcoveLeft.position.set(-(widthInMeters / 2) - (alcoveLeftWidthInMeters / 2), heightInMeters / 2, depthInMeters / 2 - 0.025);

            scene.add(alcoveLeft);

            alcoveLeft.castShadow = true;
            alcoveLeft.receiveShadow = true;
            if (alcoveLeftSpots) {
                const lampCeilingLeftGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 32);
                const lampCeilingLeftMaterial = new THREE.MeshStandardMaterial({
                    color: 0xfff5e1,
                    emissive: 0xfff5e1,
                    emissiveIntensity: 1.5,
                    roughness: 0.3
                });
                const lampCeilingLeft = new THREE.Mesh(lampCeilingLeftGeometry, lampCeilingLeftMaterial);

                lampCeilingLeft.position.set(-(widthInMeters / 2) - (alcoveLeftWidthInMeters / 2), heightInMeters - 0.2, depthInMeters / 2);
                scene.add(lampCeilingLeft);

                const ceilingLeftLight = new THREE.SpotLight(0xffcc88, 1.5);
                ceilingLeftLight.position.copy(lampCeilingLeft.position);
                ceilingLeftLight.position.y -= -0.2;
                ceilingLeftLight.angle = Math.PI / 6;
                ceilingLeftLight.penumbra = 0.5;
                ceilingLeftLight.decay = 2;
                ceilingLeftLight.distance = 2;

                ceilingLeftLight.castShadow = false;
                ceilingLeftLight.shadow.mapSize.width = 1024;
                ceilingLeftLight.shadow.mapSize.height = 1024;

                ceilingLeftLight.target.position.set(lampCeilingLeft.position.x, lampCeilingLeft.position.y, lampCeilingLeft.position.z);

                scene.add(ceilingLeftLight);
                scene.add(ceilingLeftLight.target);
            }
        }

        for (let i = 0; i < alcoveLeftShelves; i++) {
            const alcoveLeftShelveGeometry = new THREE.BoxGeometry(alcoveLeftWidthInMeters - 0.2, 0.06, depthInMeters - 0.07);
            const alcoveLeftShelve = new THREE.Mesh(alcoveLeftShelveGeometry, wallMaterial);

            const shelfStartY = (heightInMeters - 0.37) / (alcoveLeftShelves + 1);
            const shelfY = (shelfStartY * (i + 1) + 0.185);

            alcoveLeftShelve.position.set(-(widthInMeters / 2) - (alcoveLeftWidthInMeters / 2), shelfY, depthInMeters / 2 - 0.017);
            alcoveLeftShelve.castShadow = false;
            alcoveLeftShelve.receiveShadow = false;
            scene.add(alcoveLeftShelve);

            if (alcoveLeftSpots) {
                const lampGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 32);
                const lampMaterial = new THREE.MeshStandardMaterial({
                    color: 0xfff5e1,  // Warm lichtkleur
                    emissive: 0xfff5e1, // Laat de lamp zelf licht uitstralen
                    emissiveIntensity: 1.5,
                    roughness: 0.3
                });
                const lamp = new THREE.Mesh(lampGeometry, lampMaterial);

                lamp.position.set(alcoveLeftShelve.position.x, alcoveLeftShelve.position.y - 0.03, alcoveLeftShelve.position.z);
                scene.add(lamp);

                const shelfLight = new THREE.SpotLight(0xffcc88, 1.5);
                shelfLight.position.copy(lamp.position);
                shelfLight.position.y -= -0.2;
                shelfLight.angle = Math.PI / 6;
                shelfLight.penumbra = 0.5;
                shelfLight.decay = 2;
                shelfLight.distance = 2;

                shelfLight.castShadow = false;
                shelfLight.shadow.mapSize.width = 1024;
                shelfLight.shadow.mapSize.height = 1024;

                shelfLight.target.position.set(lamp.position.x, lamp.position.y, lamp.position.z);

                scene.add(shelfLight);
                scene.add(shelfLight.target);
            }
        }

        if (alcoveRight) {
            // Geometry
            const alcoveRightGeometry = new Brush(new THREE.BoxGeometry(alcoveRightWidthInMeters, heightInMeters, depthInMeters - 0.05));

            // Recess
            const alcoveRightRecess = new Brush(new THREE.BoxGeometry(alcoveRightWidthInMeters - 0.2, heightInMeters - 0.4, depthInMeters - 0.07));
            alcoveRightRecess.position.set(0, 0, 0.035);
            alcoveRightRecess.updateMatrixWorld();

            const alcoveRightResult = evaluator.evaluate(alcoveRightGeometry, alcoveRightRecess, SUBTRACTION);
            if (alcoveRightSpots) {
                const lampCeilingRightGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 32);
                const lampCeilingRightMaterial = new THREE.MeshStandardMaterial({
                    color: 0xfff5e1,
                    emissive: 0xfff5e1,
                    emissiveIntensity: 1.5,
                    roughness: 0.3
                });
                const lampCeilingRight = new THREE.Mesh(lampCeilingRightGeometry, lampCeilingRightMaterial);

                lampCeilingRight.position.set((widthInMeters / 2) + (alcoveRightWidthInMeters / 2), heightInMeters - 0.2, depthInMeters / 2);
                scene.add(lampCeilingRight);

                const ceilingRightLight = new THREE.SpotLight(0xffcc88, 1.5);
                ceilingRightLight.position.copy(lampCeilingRight.position);
                ceilingRightLight.position.y -= -0.2;
                ceilingRightLight.angle = Math.PI / 6;
                ceilingRightLight.penumbra = 0.5;
                ceilingRightLight.decay = 2;
                ceilingRightLight.distance = 2;

                ceilingRightLight.castShadow = false;
                ceilingRightLight.shadow.mapSize.width = 1024;
                ceilingRightLight.shadow.mapSize.height = 1024;

                ceilingRightLight.target.position.set(lampCeilingRight.position.x, lampCeilingRight.position.y, lampCeilingRight.position.z);

                scene.add(ceilingRightLight);
                scene.add(ceilingRightLight.target);
            }

            if (alcoveRightResult) {
                const alcoveRight = new THREE.Mesh(alcoveRightResult.geometry, wallMaterial);
                alcoveRight.position.set((widthInMeters / 2) + (alcoveRightWidthInMeters / 2), heightInMeters / 2, depthInMeters / 2 - 0.025);

                scene.add(alcoveRight);

                alcoveRight.castShadow = true;
                alcoveRight.receiveShadow = true;
            }
            for (let i = 0; i < alcoveRightShelves; i++) {
                const alcoveRightShelveGeometry = new THREE.BoxGeometry(alcoveRightWidthInMeters - 0.2, 0.06, depthInMeters - 0.07);
                const alcoveRightShelve = new THREE.Mesh(alcoveRightShelveGeometry, wallMaterial);

                const shelfStartY = (heightInMeters - 0.37) / (alcoveRightShelves + 1);
                const shelfY = (shelfStartY * (i + 1) + 0.185);

                alcoveRightShelve.position.set((widthInMeters / 2) + (alcoveRightWidthInMeters / 2), shelfY, depthInMeters / 2 - 0.017);
                alcoveRightShelve.castShadow = true;
                alcoveRightShelve.receiveShadow = true;
                scene.add(alcoveRightShelve);
                if (alcoveRightSpots) {
                    const lampGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.005, 32);
                    const lampMaterial = new THREE.MeshStandardMaterial({
                        color: 0xfff5e1,
                        emissive: 0xfff5e1,
                        emissiveIntensity: 1.5,
                        roughness: 0.3
                    });
                    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);

                    lamp.position.set(alcoveRightShelve.position.x, alcoveRightShelve.position.y - 0.03, alcoveRightShelve.position.z);
                    scene.add(lamp);

                    const shelfLight = new THREE.SpotLight(0xffcc88, 1.5);
                    shelfLight.position.copy(lamp.position);
                    shelfLight.position.y -= -0.2;
                    shelfLight.angle = Math.PI / 6;
                    shelfLight.penumbra = 0.5;
                    shelfLight.decay = 2;
                    shelfLight.distance = 2;

                    shelfLight.castShadow = false;
                    shelfLight.shadow.mapSize.width = 1024;
                    shelfLight.shadow.mapSize.height = 1024;

                    shelfLight.target.position.set(lamp.position.x, lamp.position.y, lamp.position.z);

                    scene.add(shelfLight);
                    scene.add(shelfLight.target);
                }
            }
        }
    }
}

function clearScene(video) {
    while (scene.children.length > 0) {
        let child = scene.children[0];
        scene.remove(child);
    }
}

function updateVideoTexture(videoOrImage) {
    // Controleer of het een afbeelding is
    if (videoOrImage.endsWith('.png') || videoOrImage.endsWith('.jpg')) {
        // Maak een HTMLImageElement aan voor de afbeelding
        const imageElement = new Image();
        imageElement.src = videoOrImage;
        console.log(videoOrImage);

        const texture = new THREE.Texture();

        imageElement.onload = () => {
            texture.image = imageElement;
            texture.needsUpdate = true;
        };

        return texture;
    }

    // Als het geen afbeelding is, ga door met het video-proces zoals normaal
    if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.setAttribute('playsinline', '');
    }

    if (videoElement.src.includes(videoOrImage)) {
        if (videoElement.paused || videoElement.ended) {
            videoElement.play().catch(error => console.error("Video kan niet automatisch starten:", error));
        }
        return videoTexture;
    }

    videoElement.src = `projects/relaxury-tv-wand/video/${videoOrImage}.mp4`;
    videoElement.load();

    if (!videoTexture) {
        videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
    }

    videoElement.play().catch(error => console.error("Video kan niet automatisch starten:", error));

    return videoTexture;
}

export async function loadModelData(model) {
    const group = new THREE.Group();
    clearScene(model.video ?? "logoAnimation");

    const ambientLight = new THREE.AmbientLight(0xeeeeee, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, model.height / 100, 4);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground plane setup
    addGround();
    createCinewall(
        model.width,
        model.height,
        model.depth,
        model.tvSize,
        model.color.hex,
        model.soundbar,
        model.fireplace?.width ?? 0,
        model.fireplace?.height ?? 0,
        model.fireplace?.type ?? 0,
        model.video ?? "logoAnimation",
        model.alcove?.right?.width ?? 0,
        model.alcove?.right?.shelves ?? 0,
        model.alcove?.right?.spots ?? false,
        model.alcove?.left?.width ?? 0,
        model.alcove?.left?.shelves ?? 0,
        model.alcove?.left?.spots ?? false
    );

    scene.add(group);
}

function render() {
    renderer.setAnimationLoop((timestamp, frame) => {
        controls.update();
        renderer.render(scene, camera);
    });
}

function onWindowResize(container, camera, renderer) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // Optioneel: Schaal de rendering voor high-DPI schermen
    renderer.setPixelRatio(window.devicePixelRatio || 1);
}

export function fullscreenToggle() {
    var controlpanelCol = document.getElementById('controlpanelCol');
    var modelviewerCol = document.getElementById('modelviewerCol');

    if (controlpanelCol.classList.contains('d-none')) {
        // Show control panel and shrink model viewer to 50%
        modelviewerCol.classList.add('col-md-6');
        modelviewerCol.style.width = '50%';
        controlpanelCol.classList.remove('d-none');
        document.getElementById('fullscreen').innerHTML = '<span class="material-symbols-outlined m-0 p-1">open_in_full</span>';
    } else {
        // Hide control panel and make model viewer full width
        modelviewerCol.classList.remove('col-md-6');
        modelviewerCol.style.width = '100%';
        controlpanelCol.classList.add('d-none');
        document.getElementById('fullscreen').innerHTML = '<span class="material-symbols-outlined m-0 p-1">close_fullscreen</span>';
    }

    // Get new dimensions of the modelviewerCol
    const newWidth = modelviewerCol.offsetWidth;
    const newHeight = modelviewerCol.offsetHeight;

    // Resize the Three.js renderer
    renderer.setSize(newWidth, newHeight);

    // Update the camera aspect ratio and projection matrix
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
}

function dataURLToBlob(dataURL) {
    // Split the data URL into its parts
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // Create a Uint8Array to hold the binary data
    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
    }

    // Create a Blob from the binary data
    return new Blob([arrayBuffer], { type: mimeString });
}

export function captureScreenshot() {
    renderer.render(scene, camera);

    const originalCanvas = renderer.domElement;
    const originalWidth = originalCanvas.width;
    const originalHeight = originalCanvas.height;

    const size = Math.min(originalWidth, originalHeight);
    const squareCanvas = document.createElement('canvas');
    squareCanvas.width = size;
    squareCanvas.height = size;
    const context = squareCanvas.getContext('2d');

    const offsetX = (originalWidth - size) / 2;
    const offsetY = (originalHeight - size) / 2;

    context.drawImage(originalCanvas, offsetX, offsetY, size, size, 0, 0, size, size);

    // Convert the canvas content to a data URL
    const dataURL = squareCanvas.toDataURL('image/png');

    // Convert the data URL to a Blob
    const blob = dataURLToBlob(dataURL);

    // Return both the dataURL and the Blob
    return { dataURL, blob };
}

const arButton = document.getElementById("arButton");

if (arButton) {
    arButton.addEventListener("click", async () => {
        const loader = document.getElementById("loader");
        loader.style.display = "flex"; // Laat de loader zien

        try {
            const { glbURL, usdzURL } = await exportModel();

            if (uap.getOS().name.toLowerCase().includes("ios") || uap.getBrowser().name.toLowerCase().includes("safari")) {
                if (!usdzURL) {
                    throw new Error('USDZ URL ontbreekt.');
                }
                console.log('Generated URL (iOS):', usdzURL);

                const a = document.createElement('a');
                //a.href = usdzURL;
                const arParams = 'allowsContentScaling=0&placement=wall';
                const finalURL = usdzURL.includes('?')
                    ? `${usdzURL}&${arParams}`
                    : `${usdzURL}?${arParams}`;
                a.href = finalURL;

                a.setAttribute('rel', 'ar');
                const img = document.createElement('img');
                img.src = 'img/logo_tv.svg';
                img.alt = 'Bekijk in AR';
                a.appendChild(img);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                if (!glbURL) {
                    throw new Error('GLB URL ontbreekt.');
                }
                const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbURL)}&mode=ar_only&resizable=false&disable_occlusion=true&enable_vertical_placement=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=vanwoerdenwonen.nl/ar;end;`;
                console.log('Generated URL (Android):', intentUrl);
                window.location.href = intentUrl;
            }
        } catch (error) {
            console.error('Error during AR setup:', error);
            alert('AR-ervaring kon niet worden gestart. Probeer opnieuw.');
        } finally {
            loader.style.display = "none"; // Verberg de loader
        }
    });
} else {
    console.warn("AR-knop niet gevonden, AR-functionaliteit wordt niet geladen.");
}

async function exportModel() {
    const gltfExporter = new GLTFExporter();
    const usdzExporter = new USDZExporter();
    const options = {
        binary: true,
        includeCustomExtensions: true,
    };

    const exportStillImage = 'projects/relaxury-tv-wand/video/logoAnimation.png';
    FEATUREDMODEL.video = exportStillImage;

    // 🔥 LAAD DE AFBEELDING EN WACHT TOT DIE GELADEN IS
    const tvTexture = await loadImageTexture(exportStillImage); // Zie functie hieronder

    // 👉 Nu pas createCinewall, mét de geladen texture
    createCinewall(
        FEATUREDMODEL.width,
        FEATUREDMODEL.height,
        FEATUREDMODEL.depth,
        FEATUREDMODEL.tvSize,
        FEATUREDMODEL.color.hex,
        FEATUREDMODEL.soundbar,
        FEATUREDMODEL.fireplace?.width ?? 0,
        FEATUREDMODEL.fireplace?.height ?? 0,
        FEATUREDMODEL.fireplace?.type ?? 0,
        tvTexture, // gebruik hier de echte texture
        FEATUREDMODEL.alcove?.right?.width ?? 0,
        FEATUREDMODEL.alcove?.right?.shelves ?? 0,
        FEATUREDMODEL.alcove?.left?.width ?? 0,
        FEATUREDMODEL.alcove?.left?.shelves ?? 0
    );

    try {
        // Temporarily remove the ground object to avoid exporting it
        if (ground) scene.remove(ground);
        scene.remove(backwall);

        // Check of we een iOS/Safari device hebben
        const isIOS = uap.getOS().name.toLowerCase().includes("ios");
        const isSafari = uap.getBrowser().name.toLowerCase().includes("safari");

        if (isIOS || isSafari) {
            // --- Generate USDZ ---
            const usdzBlob = await usdzExporter.parseAsync(scene);
            console.log('USDZ Blob created:', usdzBlob);

            if (!usdzBlob || !(usdzBlob instanceof ArrayBuffer)) {
                throw new Error('USDZ export failed: Invalid output.');
            }

            // Upload USDZ naar cloud storage
            const metadata = { contentType: 'model/vnd.usdz+zip' };
            const usdzRef = ref(storage, 'usdzModels/model.usdz');
            await uploadBytes(usdzRef, usdzBlob, metadata);
            const usdzURL = await getDownloadURL(usdzRef);
            console.log('USDZ model URL:', usdzURL);

            return { usdzURL };

        } else {
            // --- Generate GLB ---
            const glbBlob = await new Promise((resolve, reject) => {
                gltfExporter.parse(
                    scene,
                    (result) => {
                        if (result instanceof ArrayBuffer) {
                            resolve(new Blob([result], { type: 'model/gltf-binary' }));
                        } else if (typeof result === 'object') {
                            resolve(new Blob([JSON.stringify(result)], { type: 'application/json' }));
                        } else {
                            reject(new Error('Unexpected GLB export format.'));
                        }
                    },
                    (error) => {
                        console.error('Error during GLB export:', error);
                        reject(error);
                    },
                    options
                );
            });

            // Upload GLB naar cloud storage
            const glbRef = ref(storage, 'glbModels/model.glb');
            await uploadBytes(glbRef, glbBlob);
            const glbURL = await getDownloadURL(glbRef);
            console.log('GLB model URL:', glbURL);

            return { glbURL };
        }

    } catch (error) {
        console.error('Error during exportModel:', error);
        throw error;

    } finally {
        // Zet het ground object terug als het verwijderd was
        if (ground) scene.add(ground);
    }
}

function loadImageTexture(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // belangrijk als je extern laadt
        img.src = path;

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            resolve(texture);
        };

        img.onerror = () => reject(new Error(`Image failed to load: ${path}`));
    });
}

