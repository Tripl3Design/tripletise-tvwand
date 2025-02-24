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

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
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
    controls.update();

    // Ground plane setup
    addGround();

    // desktop version
    if (windowHeight < windowWidth) {
        document.getElementById('fullscreen').addEventListener('click', fullscreenToggle);
    }

    // Start the render loop
    render();
}

function addGround() {
    groundGeometry = new THREE.PlaneGeometry(20, 20);
    groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
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


function createCinewall(width, height, depth, wallColor, soundbar, fireplace, tvSize) {
    // Maak de wand (CSG Brush object)
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    let wall = new Brush(wallGeometry);
    wall.updateMatrixWorld();

    // ✅ Bereken de afmetingen van de TV-uitsparing
    const tvWidth = tvSize * (16 / 18.3576) * 0.0254;
    const tvHeight = tvSize * (9 / 18.3576) * 0.0254;
    const recessWidth = tvWidth + 0.03;
    const recessHeight = tvHeight + 0.03;

    // ✅ Maak een Brush voor de uitsparing van de TV
    const tvRecess = new Brush(new THREE.BoxGeometry(recessWidth, recessHeight, 1));
    tvRecess.position.set(0, 1 - (tvHeight / 2), 0);
    tvRecess.updateMatrixWorld();

    // ✅ Boolean-operatie om de TV-uitsparing te maken
    const evaluator = new Evaluator();
    const wallResult = evaluator.evaluate(wall, tvRecess, SUBTRACTION);






    // ✅ Voeg de soundbar toe (indien gewenst)
    if (soundbar) {
        console.log('soundbar');
        // ✅ Maak een Brush voor de uitsparing van de TV
        const soundbarRecess = new Brush(new THREE.BoxGeometry(recessWidth, 0.1, 1));
        soundbarRecess.position.set(0, 0.8 - (tvHeight / 2), 0);
        soundbarRecess.updateMatrixWorld();

        // ✅ Boolean-operatie om de TV-uitsparing te maken
        const evaluator = new Evaluator();
        const wallResult = evaluator.evaluate(wall, soundbarRecess, SUBTRACTION);

        scene.add(soundbarRecess);



        const soundbarGeometry = new THREE.BoxGeometry(tvWidth - 0.1, 0.1, 0.04);
        const soundbarMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const soundbarMesh = new THREE.Mesh(soundbarGeometry, soundbarMaterial);
        soundbarMesh.position.set(0, -height / 4, -depth + 0.15);
    }

    // ✅ Voeg de haard toe (indien gewenst)
    if (fireplace) {
        const fireplaceGeometry = new THREE.BoxGeometry(width - 0.1, 0.6, 0.4);
        const fireplaceMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const fireplaceMesh = new THREE.Mesh(fireplaceGeometry, fireplaceMaterial);
        fireplaceMesh.position.set(0, height / 4, -depth + 0.25);
        scene.add(fireplaceMesh);
    }



    // ✅ Kleurverwerking
    const sanitizedColor = wallColor.startsWith("#") ? wallColor : `#${wallColor}`;
    const color = new THREE.Color(sanitizedColor);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9
    });



    // ✅ Controleer of de boolean operatie is geslaagd
    if (wallResult) {
        console.log("Boolean operatie geslaagd!");
        const wallMesh = new THREE.Mesh(wallResult.geometry, material);
        wallMesh.position.set(0, 0, 0); // Zorg dat het resultaat ook op de grond begint
        scene.add(wallMesh);
    } else {
        console.error("Boolean operatie voor TV-uitsparing mislukt. Valt terug op standaard wand.");
        const wallMesh = new THREE.Mesh(wall.geometry, material);
        wallMesh.position.set(0, 0, 0); // Zorg dat de standaard wand op de grond begint
        scene.add(wallMesh);
    }


    // ✅ Voeg de TV toe in de uitsparing
    const tvDepth = 0.02; // Diepte van de TV
    const bezelThickness = 0.015; // 5mm randje rondom het scherm

    const tvFrameMesh = new Brush(new THREE.BoxGeometry(tvWidth + bezelThickness, tvHeight + bezelThickness, tvDepth));
    const tvMesh = new Brush(new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth));
    const tvResult = evaluator.evaluate(tvFrameMesh, tvMesh, SUBTRACTION);

    if (tvResult) {
        console.log("Boolean operatie geslaagd!");
        const tvFrameMesh = new THREE.Mesh(tvResult.geometry, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.6 }));
        tvFrameMesh.position.set(0, -depth / 2 + 1.03, 0);
        scene.add(tvFrameMesh);
    }

    scene.add(tvFrameMesh);

    // Verkrijg het video-element
    const videoElement = document.getElementById('tvVideo');

    // Maak een VideoTexture met het video-element
    const videoTexture = new THREE.VideoTexture(videoElement);

    // Zorg ervoor dat de textuur goed wordt herhaald en gespiegeld
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    // Maak het materiaal voor het TV-scherm
    const tvScreenMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture, // Gebruik de video als textuur
        emissive: 0x555555 // Lichte gloed om de video beter zichtbaar te maken
    });

    // Maak de geometrie voor het TV-scherm
    const tvScreenGeometry = new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth - 0.005);

    // Maak de mesh en voeg deze toe aan de scene
    const tvScreenMesh = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreenMesh.position.set(0, -depth / 2 + 1.03, 0);
    scene.add(tvScreenMesh);

}



const models = [];

export async function loadModelData(model) {
    // Remove old models from the scene
    models.forEach(modelGroup => {
        if (scene.children.includes(modelGroup)) {
            scene.remove(modelGroup);
            modelGroup.traverse(child => {
                if (child.isMesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        child.material.dispose();
                    }
                }
            });
        }
    });

    models.length = 0;

    const group = new THREE.Group();

    createCinewall(3, 2, 0.3, '808000', true, false, 64);

    scene.add(group);
    models.push(group);
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