import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

let scene, camera, renderer, rgbeLoader, ambientLight, directionalLight, controls;
let groundGeometry, groundMaterial, ground;
let floorGeometry, floorMaterial, floor;

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

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2 + 0.2;
    controls.minAzimuthAngle = -Math.PI / 2 + 0.1;
    controls.maxAzimuthAngle = Math.PI / 2 - 0.1;
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

function createCinewall(width, height, depth, tvSize, wallColor, soundbar, fireplaceWidth, fireplaceHeight, fireplaceType, video, alcoveRight, alcoveRightShelves, alcoveLeft, alcoveLeftShelves) {
    let widthInMeters = width / 100;
    let heightInMeters = height / 100;
    let depthInMeters = depth / 100;
    let fireplaceWidthInMeters = fireplaceWidth / 100;
    let fireplaceHeightInMeters = fireplaceHeight / 100;
    let alcoveRightWidthInMeters = alcoveRight / 100;
    let alcoveLeftWidthInMeters = alcoveLeft / 100;

    const evaluator = new Evaluator(); floorGeometry = new THREE.PlaneGeometry(20, 20);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 1
    });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0, 0.5, 1);
    scene.add(boxMesh);

    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;


    /*
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            side: THREE.FrontSide,
            transparent: true,
            opacity: .5
        });
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, 0, 10);
        scene.add(floorMesh);
    
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
    
        const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: wallColor,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.2
        });
        const ceilingMesh = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.set(0, heightInMeters, 10);
        scene.add(ceilingMesh);
    
        ceilingMesh.castShadow = true;
        ceilingMesh.receiveShadow = true;
    
        const backwallGeometry = new THREE.PlaneGeometry(20, heightInMeters);
        const backwallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.5
        });
        const backwallMesh = new THREE.Mesh(backwallGeometry, backwallMaterial);
        backwallMesh.position.set(0, heightInMeters/2, 0);
        scene.add(backwallMesh);
    
        backwallMesh.castShadow = true;
        backwallMesh.receiveShadow = true;
    
        const sidewallGeometry = new THREE.PlaneGeometry(20, heightInMeters);
        const sidewallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0.5
        });
        const leftwallMesh = new THREE.Mesh(sidewallGeometry, sidewallMaterial);
        leftwallMesh.rotation.y = -Math.PI / 2;
        leftwallMesh.position.set(-10, heightInMeters/2, 10);
        scene.add(leftwallMesh);
    
        leftwallMesh.castShadow = true;
        leftwallMesh.receiveShadow = true;
    
        const rightwallMesh = new THREE.Mesh(sidewallGeometry, sidewallMaterial);
        rightwallMesh.rotation.y = -Math.PI / 2;
        rightwallMesh.position.set(-10, heightInMeters/2, 10);
        scene.add(rightwallMesh);
    
        rightwallMesh.castShadow = true;
        rightwallMesh.receiveShadow = true;
    */

    const wallGeometry = new THREE.BoxGeometry(widthInMeters, heightInMeters, depthInMeters);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor });

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
        soundbarMesh.position.set(0, .84, (depthInMeters / 2) - 0.075);
        scene.add(soundbarMesh);

        soundbarMesh.castShadow = true;
        soundbarMesh.receiveShadow = true;
    }

    if (fireplaceWidth) {
        // recess
        const fireplaceRecess = new Brush(new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.30));
        fireplaceRecess.position.set(0, 0.2 - (heightInMeters / 2) + (fireplaceHeightInMeters / 2), (depthInMeters / 2) - 0.075);
        fireplaceRecess.updateMatrixWorld();

        wallResult = evaluator.evaluate(wallResult, fireplaceRecess, SUBTRACTION);

        const fireElement = document.getElementById('optiflame');

        const fireTexture = new THREE.VideoTexture(fireElement);
        fireTexture.minFilter = THREE.LinearFilter;
        fireTexture.magFilter = THREE.LinearFilter;
        fireTexture.format = THREE.RGBFormat;

        const fireMaterial = new THREE.MeshStandardMaterial({
            map: fireTexture,
            emissive: 0x555555
        });

        const fireGeometry = new THREE.BoxGeometry(fireplaceWidthInMeters, fireplaceHeightInMeters, 0.005);
        const fireMesh = new THREE.Mesh(fireGeometry, fireMaterial);
        fireMesh.position.set(0, 0.2 + (fireplaceHeightInMeters / 2), depthInMeters / 2 - 0.02);
        scene.add(fireMesh);

        fireMesh.castShadow = true;
        fireMesh.receiveShadow = true;
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

    const videoElement = document.createElement('video');
    videoElement.src = 'projects/tv-wand/video/' + video + '.mp4';

    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.play();

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    const tvScreenMaterial = new THREE.MeshStandardMaterial({
        map: videoTexture,
        emissiveMap: videoTexture, // Laat het scherm zelf oplichten
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        roughness: 0.1, // Lager = glanzender
        metalness: 0.5, // Hoger = meer reflectie
    });

    const tvScreenGeometry = new THREE.BoxGeometry(tvWidth, tvHeight, tvDepth - 0.005);
    const tvScreenMesh = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreenMesh.position.set(0, 1 + (tvHeight / 2) + 0.015, depthInMeters - 0.02);
    scene.add(tvScreenMesh);

    tvScreenMesh.castShadow = true;
    tvScreenMesh.receiveShadow = true;

    if (alcoveRight) {
        // Geometry
        const alcoveRightGeometry = new Brush(new THREE.BoxGeometry(alcoveRightWidthInMeters, heightInMeters, depthInMeters - 0.05));

        // Recess
        const alcoveRightRecess = new Brush(new THREE.BoxGeometry(alcoveRightWidthInMeters - 0.2, heightInMeters - 0.4, depthInMeters - 0.07));
        alcoveRightRecess.position.set(0, 0, 0.035);
        alcoveRightRecess.updateMatrixWorld();

        const alcoveRightResult = evaluator.evaluate(alcoveRightGeometry, alcoveRightRecess, SUBTRACTION);

        if (alcoveRightResult) {
            const alcoveRight = new THREE.Mesh(alcoveRightResult.geometry, wallMaterial);

            alcoveRight.position.set(-(widthInMeters / 2) - (alcoveRightWidthInMeters / 2), heightInMeters / 2, depthInMeters / 2 - 0.025);

            scene.add(alcoveRight);

            alcoveRight.castShadow = true;
            alcoveRight.receiveShadow = true;
        }


        // Aantal planken en afstand berekenen
        const plankAfstand = (heightInMeters - 0.4) / (alcoveRightShelves + 1);
        console.log(plankAfstand);
        // Positioneer de planken
        for (let i = 0; i < alcoveRightShelves; i++) {
            const alcoveRightShelveGeometry = new THREE.BoxGeometry(alcoveRightWidthInMeters - 0.2, 0.06, depthInMeters - 0.07);
            const alcoveRightShelve = new THREE.Mesh(alcoveRightShelveGeometry, wallMaterial);

            // Bereken de Y-positie, zodat de planken gelijkmatig verdeeld worden rond het midden
            alcoveRightShelve.position.set(
                -(widthInMeters / 2) - (alcoveRightWidthInMeters / 2),
                (heightInMeters / 2) + ((i - 1) * plankAfstand),
                depthInMeters / 2 - 0.025
            );

            scene.add(alcoveRightShelve);
        }
    }

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

            alcoveLeft.position.set((widthInMeters / 2) + (alcoveLeftWidthInMeters / 2), heightInMeters / 2, depthInMeters / 2 - 0.025);

            scene.add(alcoveLeft);

            alcoveLeft.castShadow = true;
            alcoveLeft.receiveShadow = true;
        }

        for (let i = 0; i < alcoveLeftShelves; i++) {
            const alcoveLeftShelveGeometry = new THREE.BoxGeometry(alcoveLeftWidthInMeters - 0.2, 0.06, depthInMeters - 0.07);
            const alcoveLeftShelve = new THREE.Mesh(alcoveLeftShelveGeometry, wallMaterial);
            alcoveLeftShelve.position.set((widthInMeters / 2) + (alcoveLeftWidthInMeters / 2), 0.17 + (((i + 1) / (heightInMeters - 0.4) + 0.03)), depthInMeters / 2 - 0.025);
            scene.add(alcoveLeftShelve);
        }
    }
}

function clearScene(video) {
    while (scene.children.length > 0) {
        let child = scene.children[0];
        scene.remove(child);
    }
    resetVideo(video);
    resetVideo('optiflame');
}

function resetVideo(video) {
    const videoElement = document.getElementById(video);
    if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.load();
        videoElement.play();
    }
}

export async function loadModelData(model) {
    const group = new THREE.Group();
    clearScene(model.video ?? "video-1");
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffcc00, 1);
    directionalLight.intensity = 2;
    directionalLight.position.set(5, 20, 5);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

     // Ground plane setup
     addGround();
    
    createCinewall(model.width, model.height, model.depth, model.tvSize, model.color, model.soundbar, model.fireplace.width ?? 0, model.fireplace.height ?? 0, model.fireplace.type ?? "none", model.video ?? "video-1", model.alcove.right.width ?? undefined, model.alcove.right.shelves ?? 0, model.alcove.left.width ?? undefined, model.alcove.left.shelves ?? 0);
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