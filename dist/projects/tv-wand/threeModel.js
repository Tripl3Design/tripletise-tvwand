import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

let scene, camera, renderer, controls, rgbeLoader;
let groundGeometry, groundMaterial, ground;

let projectmap = 'projects/tv-wand/';

export function initThree(containerElem) {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd3d3d3);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffcc00, 1);
    directionalLight.position.set(5, 20, 5);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.target.set(0, 1.2, 0);
    controls.update();

    // Ground plane setup
    addGround();

    // desktop version
    if (windowHeight < windowWidth) {
        document.getElementById('fullscreen').addEventListener('click', fullscreenToggle);
    }

    render();
}

function addGround() {
    groundGeometry = new THREE.PlaneGeometry(20, 20);
    groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });

    groundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Desktop versie
if (windowHeight < windowWidth) {
    document.getElementById('downloadModel').addEventListener('click', () => {
        exportModel();
    });
}


function createCinewall(width, height, depth, tvSize, wallColor, soundbar, fireplaceWidth, fireplaceHeight, fireplaceType) {

    let widthInMeters = width / 100;
    let heightInMeters = height / 100;
    let depthInMeters = depth / 100;
    let fireplaceWidthInMeters = fireplaceWidth / 100;
    let fireplaceHeightInMeters = fireplaceHeight / 100;

    // Maak een rode kubus (1x1x1 meter)
    const cubeGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Rood
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Verplaats de kubus 1 meter naar rechts (x = 1)
    cube.position.set(1, 0.1, 0); // y = 0.5 zodat hij op de grond staat

    // Voeg de kubus toe aan de scene
    scene.add(cube);

    const evaluator = new Evaluator();

    const wallGeometry = new THREE.BoxGeometry(widthInMeters, heightInMeters, depthInMeters);
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
        const soundbarMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const soundbar = new THREE.Mesh(soundbarGeometry, soundbarMaterial);
        soundbar.rotation.z = Math.PI / 2;
        soundbar.position.set(0, .84, (depthInMeters / 2) - 0.075);
        scene.add(soundbar);
    }

    if (fireplaceWidth) {
        // recess
        const fireplaceRecess = new Brush(new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.30));
        fireplaceRecess.position.set(0, 0.2 - (heightInMeters / 2) + (fireplaceHeightInMeters / 2), (depthInMeters / 2) - 0.075);
        fireplaceRecess.updateMatrixWorld();

        wallResult = evaluator.evaluate(wallResult, fireplaceRecess, SUBTRACTION);

        // geometry
        const fireplaceGeometry = new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.30);
        const fireplaceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const fireplace = new THREE.Mesh(fireplaceGeometry, fireplaceMaterial);
        fireplace.position.set(0, 0.2, (depthInMeters / 2) - 0.15);
        scene.add(fireplace);

    }

    const sanitizedColor = wallColor.startsWith("#") ? wallColor : `#${wallColor}`;
    const color = new THREE.Color(sanitizedColor);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9
    });

    if (wallResult) {
        console.log("Boolean operatie geslaagd!");
        const wallMesh = new THREE.Mesh(wallResult.geometry, material);
        wallMesh.position.set(0, heightInMeters / 2, 0);
        scene.add(wallMesh);
    }

    const tvDepth = 0.02;
    const bezelThickness = 0.015;

    const tvFrameMesh = new Brush(new THREE.BoxGeometry(tvWidth + bezelThickness, tvHeight + bezelThickness, tvDepth));
    const tvMesh = new Brush(new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth));
    const tvResult = evaluator.evaluate(tvFrameMesh, tvMesh, SUBTRACTION);

    if (tvResult) {
        const tvFrameMesh = new THREE.Mesh(tvResult.geometry, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.6 }));
        tvFrameMesh.position.set(0, 1 + (tvHeight / 2) + 0.015, (depthInMeters / 2) - 0.02);
        scene.add(tvFrameMesh);
    }

    const videoElement = document.getElementById('tvVideo');

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    const tvScreenMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        //emissive: 0x555555
    });

    const tvScreenGeometry = new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth - 0.005);
    const tvScreenMesh = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreenMesh.position.set(0, 1 + (tvHeight / 2) + 0.015, depthInMeters / 2 - 0.02);
    scene.add(tvScreenMesh);
}


export async function clearScene() {
    scene.traverse((child) => {
        if (child.isMesh) {
            scene.remove(child);

            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
}


export async function loadModelData(model) {
    clearScene();
    const group = new THREE.Group();
    createCinewall(model.width, model.height, model.depth, 64, model.color, model.soundbar, model.fireplace.width ?? 0, model.fireplace.height ?? 0, model.fireplace.type ?? "none");


    //addGround();

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

            if (result.os.name.toLowerCase().includes("ios") || result.browser.name.toLowerCase().includes("safari")) {
                if (!usdzURL) {
                    throw new Error('USDZ URL ontbreekt.');
                }
                console.log('Generated URL (iOS):', usdzURL);

                const a = document.createElement('a');
                a.href = usdzURL;
                a.setAttribute('rel', 'ar');
                const img = document.createElement('img');
                img.src = 'img/logo_tv-wand.webp';
                img.alt = 'Bekijk in AR';
                a.appendChild(img);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                if (!glbURL) {
                    throw new Error('GLB URL ontbreekt.');
                }

                const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbURL)}&mode=ar_only&resizable=false&disable_occlusion=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
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
        binary: true,               // Export as binary GLB
        includeCustomExtensions: true, // Include custom extensions if applicable
    };

    try {
        // Temporarily remove the ground object to avoid exporting it
        scene.remove(ground);

        if (uap.getOS().name.toLowerCase().includes("ios") || uap.getBrowser().name.toLowerCase().includes("safari")) {
            // --- Generate USDZ ---
            const usdzBlob = await usdzExporter.parseAsync(scene); // Use async parsing for reliability
            console.log('USDZ Blob created:', usdzBlob);

            if (!usdzBlob) {
                throw new Error('USDZ Blob is undefined. Export failed.');
            }

            // Upload USDZ to storage
            const metadata = {
                contentType: 'model/vnd.usdz+zip', // Proper content type for USDZ
            };
            const usdzRef = ref(storage, 'usdzModels/model.usdz'); // Adjust path as needed
            await uploadBytes(usdzRef, usdzBlob, metadata);
            const usdzURL = await getDownloadURL(usdzRef);
            console.log('USDZ model URL:', usdzURL);

            // Return USDZ URL
            return { usdzURL };

        } else {
            // --- Generate GLB ---
            const glbBlob = await new Promise((resolve, reject) => {
                gltfExporter.parse(
                    scene,
                    (result) => {
                        const blob = new Blob([result], { type: 'model/gltf-binary' });
                        console.log('GLB Blob created:', blob);
                        resolve(blob);
                    },
                    (error) => {
                        console.error('Error during GLB export:', error);
                        reject(error);
                    },
                    options
                );
            });

            // Upload GLB to storage
            const glbRef = ref(storage, 'glbModels/model.glb'); // Adjust path as needed
            await uploadBytes(glbRef, glbBlob);
            const glbURL = await getDownloadURL(glbRef);
            console.log('GLB model URL:', glbURL);

            // Return GLB URL
            return { glbURL };
        }

    } catch (error) {
        // Handle any errors during the export process
        console.error('Error during exportModel:', error);
        throw error; // Re-throw to ensure errors are caught by the caller

    } finally {
        // Add the ground object back to the scene for consistency
        addGround();
    }
}