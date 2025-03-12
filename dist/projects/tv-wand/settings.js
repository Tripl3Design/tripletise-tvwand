"use strict"
var ALLMODELS;
var ALLCOLORS;
var ALLCOMPONENTS;
var FEATUREDMODEL;

const urlParams = new URLSearchParams(window.location.search);

let mainModule = null;

async function downloadPdf() {
    try {
        const { dataURL, blob } = mainModule.captureScreenshot();

        const docRef = await addDoc(collection(db, "clientModels"), {
            brand: brand,
            product: product,
            from: document.referrer,
            model: FEATUREDMODEL,
            timestamp: serverTimestamp()
        });
        console.log("Document saved with ID: ", docRef.id);

        createPdf(FEATUREDMODEL, dataURL, title, docRef.id);
    } catch (e) {
        console.error("Error: ", e);
    }
}

async function shareWithWhatsApp() {
    console.log('shareWithWhatsApp');

    try {
        // Maak een screenshot en verkrijg zowel de dataURL als de Blob
        const { dataURL, blob } = mainModule.captureScreenshot();

        // Upload de Blob naar Firebase Storage
        const storageRef = ref(storage, `screenshots/${Date.now()}_screenshot.png`);
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);
        console.log("Screenshot uploaded and accessible at: ", imageUrl);

        // Sla de configuratie op in Firestore
        const docRef = await addDoc(collection(db, "clientModels"), {
            brand: brand,
            product: product,
            from: document.referrer,
            model: FEATUREDMODEL,
            imageUrl: imageUrl, // voor Open Graph gebruik
            timestamp: serverTimestamp()
        });
        console.log("Document saved with ID: ", docRef.id);

        const configuratorUrl = `${document.referrer}?brand=${brand}&product=${product}&fsid=${docRef.id}`;
        const message = `Bekijk mijn configurator design!\nKlik hier: ${configuratorUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

    } catch (e) {
        console.error("Error: ", e);
    }
}

async function shareTroughQr() {
    console.log('shareTroughQr');

    try {
        // Sla de configuratie op in Firestore
        const docRef = await addDoc(collection(db, "clientModels"), {
            brand: brand,
            product: product,
            from: document.referrer,
            model: FEATUREDMODEL,
            timestamp: serverTimestamp()
        });
        console.log("Document saved with ID: ", docRef.id);

        const configuratorUrl = `${document.referrer}?brand=${brand}&product=${product}&fsid=${docRef.id}`;

        // QR-code genereren in de modal
        let qrCanvas = document.getElementById("qrCanvas");
        qrCanvas.innerHTML = ""; // Leegmaken voordat we een nieuwe genereren

        new QRCode(qrCanvas, {
            text: configuratorUrl,
            width: 200,
            height: 200
        });

        // Open de Bootstrap modal
        let qrModal = new bootstrap.Modal(document.getElementById("qrModal"));
        qrModal.show();

    } catch (e) {
        console.error("Error: ", e);
    }
}

function updateFeaturedModel(model) {
    import('/projects/tv-wand/threeModel.js')
        .then(main => {
            const viewer = document.getElementById('modelviewer');

            if (!mainModule) {
                main.initThree(viewer);
                mainModule = main;
            }
            if (mainModule && typeof mainModule.loadModelData === 'function') {
                mainModule.loadModelData(model);
            }
            if (viewer) {
                viewer.focus();
            }
        })
        .catch(error => {
            console.error('Error loading module:', error);
        });
}

function updateControlPanel(model, selectedLayer, expandedLayer) {
    const settings = initSettings(model);
    const elem = document.getElementById('controlpanelContainer');
    if (selectedLayer !== undefined) {
        controlPanel_updateLayer(selectedLayer, settings);
    } else {
        controlPanel(settings, ALLMODELS, elem, expandedLayer);
    }

    // width
    document.getElementById("wallWidth").value = model.width;
    document.getElementById("wallInputWidth").value = model.width;

    document.getElementById("wallWidth").addEventListener("input", function (event) {
        document.getElementById("wallInputWidth").value = event.target.value;
    });

    document.getElementById("wallWidth").addEventListener("change", function (event) {
        model.width = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("wallInputWidth").addEventListener("input", function (event) {
        document.getElementById("wallWidth").value = event.target.value;
        model.width = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    // height
    document.getElementById("wallHeight").value = model.height;
    document.getElementById("wallInputHeight").value = model.height;

    document.getElementById("wallHeight").addEventListener("input", function (event) {
        document.getElementById("wallInputHeight").value = event.target.value;
    });

    document.getElementById("wallHeight").addEventListener("change", function (event) {
        model.height = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("wallInputHeight").addEventListener("input", function (event) {
        model.height = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    // depth
    document.getElementById("wallDepth").value = model.depth;
    document.getElementById("wallInputDepth").value = model.depth;

    document.getElementById("wallDepth").addEventListener("input", function (event) {
        document.getElementById("wallInputDepth").value = event.target.value;
    });

    document.getElementById("wallDepth").addEventListener("change", function (event) {
        model.depth = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("wallInputDepth").addEventListener("input", function (event) {
        document.getElementById("wallDepth").value = event.target.value;
        model.depth = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById('sizeText').textContent = model.width + ' x ' + model.height + ' x ' + model.depth + ' cm';

    //tv diagonal 
    document.getElementById("tvSize").value = model.tvSize;
    document.getElementById("tvSizeInput").value = model.tvSize;

    document.getElementById("tvSize").addEventListener("input", function (event) {
        document.getElementById("tvSizeInput").value = event.target.value;
    });

    document.getElementById("tvSize").addEventListener("change", function (event) {
        model.tvSize = event.target.value;

        updateControlPanel(model, 'telly');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("tvSizeInput").addEventListener("input", function (event) {

        document.getElementById("tvSize").value = event.target.value;
        model.tvSize = event.target.value;

        updateControlPanel(model, 'telly');
        updateFeaturedModel(model);
        showSelected(false);

    });
    document.getElementById('inchText').textContent = model.tvSize + ' inch';

    // soundbar
    let soundbarCheckbox = document.getElementById('soundbar');

    if (model.soundbar) {
        soundbarCheckbox.checked = true;
    } else {
        soundbarCheckbox.checked = false;
    }

    soundbarCheckbox.addEventListener('click', () => {
        if (soundbarCheckbox.checked) {
            model.soundbar = true;
        } else {
            model.soundbar = false;
        }

        updateControlPanel(model, 'telly');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (soundbarCheckbox.checked) {
        document.getElementById('barText').textContent = 'met soundbar';
    } else {
        document.getElementById('barText').textContent = 'geen soundbar';
    }

    // video
    document.getElementById("video-1").addEventListener("click", function (event) {
        model.video = document.getElementById("video-1").id;

        updateControlPanel(model, 'telly');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("video-2").addEventListener("click", function (event) {
        model.video = document.getElementById("video-2").id;

        updateControlPanel(model, 'telly');
        updateFeaturedModel(model);
        showSelected(false);
    });

    //alcove
    let alcoveCheckbox = document.getElementById('alcoveToggle');

    if (model.alcove.left.width != 0) {
        alcoveCheckbox.checked = true;
    } else {
        alcoveCheckbox.checked = false;
    }

    alcoveCheckbox.addEventListener('click', () => {
        if (alcoveCheckbox.checked) {
            model.alcove.left.width = 50;
            model.alcove.right.width = 50;
        } else {
            model.alcove.left.width = 0;
            model.alcove.right.width = 0;
        }

        updateControlPanel(model, 'alcove');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (soundbarCheckbox.checked) {
        document.getElementById('barText').textContent = 'met soundbar';
    } else {
        document.getElementById('barText').textContent = 'geen soundbar';
    }

    document.getElementById("alcove").value = model.alcove.left.width;
    document.getElementById("alcoveInput").value = model.tvSize;

    document.getElementById("alcove").addEventListener("input", function (event) {
        document.getElementById("alcoveInput").value = event.target.value;
    });

    document.getElementById("alcove").addEventListener("change", function (event) {
        model.alcove.left.width = parseInt(event.target.value);
        model.alcove.right.width = parseInt(event.target.value);

        updateControlPanel(model, 'alcove');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("shelvesInput").value = model.alcove.left.shelves;

    document.getElementById("shelvesInput").addEventListener("change", function (event) {
        model.alcove.left.shelves = parseInt(event.target.value);
        model.alcove.right.shelves = parseInt(event.target.value);

        updateControlPanel(model, 'alcove');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById('alcoveWidthText').textContent = model.alcove.left.width + ' cm';
    if (model.alcove.left.shelves != 1) {
        document.getElementById('alcoveShelvesText').textContent = model.alcove.left.shelves + ' planken';
    } else {
        document.getElementById('alcoveShelvesText').textContent = model.alcove.left.shelves + ' plank';
    }

    //fireplace

    pricing(model);

    // is global FEATUREDMODEL for pdf really necessary?
    FEATUREDMODEL = model;

    console.log(model);
}

function toggleFeaturedModels() {
    let featuredModels = document.getElementById('featuredModels');
    if (urlParams.has('noFeaturedModels')) {
        featuredModels.classList.remove('d-block');
        featuredModels.classList.add('d-none');
    } else {
        featuredModels.classList.remove('d-none');
        featuredModels.classList.add('d-block');
    }
}

function showFeaturedModel(model) {
    updateControlPanel(model, undefined, undefined, 0);
    updateFeaturedModel(model);
}

function showFeaturedModelByIndex(index) {
    showFeaturedModel(JSON.parse(JSON.stringify(ALLMODELS[index])));
}

async function handleModelSelection() {
    //console.log(`BRAND: ${brand}, PRODUCT  ${product}, TITLE ${title}`);

    const colorsPromise = fetch(`projects/${brand}-${product}/colors.json`).then(response => response.json());
    ALLCOLORS = await colorsPromise;
    const modelsPromise = fetch(`projects/${brand}-${product}/models.json`).then(response => response.json());
    ALLMODELS = await modelsPromise;
    const componentsPromise = fetch(`projects/${brand}-${product}/components.json`).then(response => response.json());
    ALLCOMPONENTS = await componentsPromise;

    let modelIndex;
    let modelId;
    let modelFsid;
    let modelData;

    if (urlParams.has('id')) {
        modelId = urlParams.get('id');
        modelIndex = ALLMODELS.findIndex((item) => item.id == modelId);
        showFeaturedModel(ALLMODELS[modelIndex]);
    } else if (urlParams.has('data')) {
        modelData = urlParams.get('data');
        let model = JSON.parse(decodeURIComponent(modelData));
        showFeaturedModel(model);
    } else if (urlParams.has('fsid')) {
        modelFsid = urlParams.get('fsid');
        const docRef = doc(db, "clientModels", modelFsid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists) {
            modelData = docSnap.data().model;
            showFeaturedModel(modelData);
        } else {
            console.error("No document found with FSID:", modelFsid);
        }
    } else {
        modelIndex = Math.floor(Math.random() * ALLMODELS.length);
        showFeaturedModel(ALLMODELS[modelIndex]);
    }
}

function initSettings(model) {
    const accordions = {};

    accordions.size = {
        title: "afmeting",
        options: [],
        display: "d-block",
        code: /*html*/`

        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">

                <div>breedte:</div>
                <input class="input-group-text float-end rounded-0 bg-white" type="number" id="wallInputWidth" min="150" max="270" value="#" step="1">
                <input style="width: 80%" type="range" class="form-range" id="wallWidth" min="150" max="270" value="#" step="1">
                <div style="width: 80%; display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
                    <span>150</span>
                    <span>160</span>
                    <span>170</span>
                    <span>180</span>
                    <span>190</span>
                    <span>200</span>
                    <span>210</span>
                    <span>220</span>
                    <span>230</span>
                    <span>240</span>
                    <span>250</span>
                    <span>260</span>
                    <span>270</span>
                </div>
                
                <div class="mt-3">hoogte:</div>
                <input class="input-group-text float-end rounded-0 bg-white" type="number" id="wallInputHeight" min="200" max="280" value="#" step="1">
                <input style="width: 53%" type="range" class="form-range" id="wallHeight" min="200" max="280" value="#" step="1">
                <div style="width: 53%; display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
                    <span>200</span>
                    <span>210</span>
                    <span>220</span>
                    <span>230</span>
                    <span>240</span>
                    <span>250</span>
                    <span>260</span>
                    <span>270</span>
                    <span>280</span>
                </div>
                
                <div class="mt-3">diepte:</div>
                <input class="input-group-text float-end rounded-0 bg-white" type="number" id="wallInputDepth" min="20" max="50" value="#" step="1">
                <input style="width: 20%" type="range" class="form-range" id="wallDepth" min="20" max="50" value="#" step="1">
                <div style="width: 20%; display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
                    <span>20</span>
                    <span>30</span>
                    <span>40</span>
                    <span>50</span>
                </div>

            </div>
        </div>
    
        <style>
        /* Stijl voor de slider */
        input[type="range"] {
         
            border-radius: 0;
        }

        /* Zorg voor zichtbare tick marks */
        input[type="range"]::-webkit-slider-runnable-track {
            background: linear-gradient(to right, #ccc 0%, #ccc 33%, #ccc 66%, #ccc 100%);
            background-size: 100% 100%;
            height: 3px;
            border-radius: 0;
        }

        input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: #000;
            border-radius: 50%;
            margin-top: -6px;
        }
        </style>`
    };

    accordions.telly = {
        title: "tv",
        options: ['inch', 'bar'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">

                <div>inchmaat:</div>
                <input class="input-group-text float-end rounded-0 bg-white" type="number" id="tvSizeInput" min="30" max="90" value="#" step="1">
                <input style="width: 80%" type="range" class="form-range" id="tvSize" min="30" max="90" value="#" step="1">
                <div style="width: 80%; display: flex; justify-content: space-between; margin-top: -10px; font-size: 11px;">
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                    <span>45</span>
                    <span>50</span>
                    <span>55</span>
                    <span>60</span>
                    <span>65</span>
                    <span>70</span>
                    <span>75</span>
                    <span>80</span>
                    <span>85</span>
                    <span>90</span>
                </div>

                <div class="form-check my-3">
                    <input id="soundbar" name="soundbar" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="soundbar">
                    uitsparing voor sounbar
                    </label>
                </div>

                <div class="mb-1">kies video (ter indicatie):</div>
                <div class="d-flex me-3">
                    <video id="video-1" height="100px" autoplay loop muted>
                        <source src="projects/tv-wand/video/video-1.mp4" type="video/mp4" >
                        Your browser does not support the video tag.
                    </video>
                
                    <video id="video-2" height="100px" autoplay loop muted>
                        <source src="projects/tv-wand/video/video-2.mp4" type="video/mp4" >
                        Your browser does not support the video tag.
                    </video>

                    <video id="optiflame" style="display: none;" height="100px" autoplay loop muted>
                        <source src="projects/tv-wand/video/optiflame.mp4" type="video/mp4" >
                        Your browser does not support the video tag.
                    </video>
                </div>
                
            </div>
        </div>`
    };

    accordions.alcove = {
        title: "nissen",
        options: ['alcoveWidth', 'alcoveShelves'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">

            <div class="form-check my-3">
                <input id="alcoveToggle" name="soundbar" class="form-check-input" type="checkbox">
                <label class="form-check-label" for="alcoveToggle">
                voeg nissen toe
                </label>
            </div>

                <div>breedte:</div>
                <input class="input-group-text float-end rounded-0 bg-white" type="number" id="alcoveInput" min="30" max="90" value="#" step="1">
                <input style="width: 80%" type="range" class="form-range" id="alcove" min="50" max="100" value="#" step="1">
                <div style="width: 80%; display: flex; justify-content: space-between; margin-top: -10px; font-size: 11px;">
                    <span>50</span>
                    <span>60</span>
                    <span>70</span>
                    <span>80</span>
                    <span>90</span>
                    <span>100</span>
                </div>

                <div class="mt-3 mb-2">aantal planken:</div>
                <input class="input-group-text rounded-0 bg-white" type="number" id="shelvesInput" name="shelvesInput" min="0" max="6" value="0" step="1">
            </div>
        </div>`
    };

    accordions.fireplace = {
        title: "sfeerhaard",
        options: [],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">


                <div>maat:</div>

                <select id="fireplaceWidth" class="form-select">
                <option value="0">geen sfeerhaard</option>
                <option value="127">Dimplex Ignite XL 50″</option>
                <option value="152.4">Dimplex Ignite XL 60″</option>
                <option value="187.96">Dimplex Ignite XL 74″</option>
                <option value="254">Dimplex Ignite XL 100″</option>
            </select>

            </div>
        </div>`
    };

    return { accordions };
}