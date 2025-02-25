"use strict"
var ALLMODELS;
var ALLCOLORS;
var ALLCOMPONENTS;
var FEATUREDMODEL;

const urlParams = new URLSearchParams(window.location.search);

let mainModule = null;

async function downloadPdf() {
    try {
        // Verkrijg zowel de dataURL als de Blob van de screenshot
        const { dataURL, blob } = mainModule.captureScreenshot();

        const docRef = await addDoc(collection(db, "clientModels"), {
            brand: brand,
            product: product,
            from: document.referrer,
            model: FEATUREDMODEL,
            timestamp: serverTimestamp()
        });
        console.log("Document saved with ID: ", docRef.id);

        // Gebruik de dataURL voor het maken van de PDF
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
        let newWidth = parseInt(event.target.value, 10);
        if (newWidth >= 150 && newWidth <= 270) {
            document.getElementById("wallInputWidth").value = newWidth;
            model.width = newWidth; // Update de width in het model
        }
    });

    document.getElementById("wallInputWidth").addEventListener("input", function (event) {
        let newWidth = parseInt(event.target.value, 10);
        if (newWidth >= 150 && newWidth <= 270) {
            document.getElementById("wallWidth").value = newWidth;
            model.width = newWidth; // Update de width in het model
        }
    });
    console.log(model.width);

    // height
    document.getElementById("wallHeight").value = model.height;
    document.getElementById("wallInputHeight").value = model.height;

    document.getElementById("wallHeight").addEventListener("input", function (event) {
        let newHeight = parseInt(event.target.value, 10);
        if (newHeight >= 150 && newHeight <= 270) {
            document.getElementById("wallInputHeight").value = newHeight;
            model.width = newHeight; // Update de width in het model
        }
    });

    document.getElementById("wallInputHeight").addEventListener("input", function (event) {
        let newHeight = parseInt(event.target.value, 10);
        if (newHeight >= 150 && newHeight <= 270) {
            document.getElementById("wallHeight").value = newHeight;
            FEATUREDMODEL.width = newHeight; // Update de width in het model
        }
    });
    console.log(model.height);

    // depth
    document.getElementById("wallDepth").value = model.depth;
    document.getElementById("wallInputDepth").value = model.depth;

    document.getElementById("wallDepth").addEventListener("input", function (event) {
        let newDepth = parseInt(event.target.value, 10);
        if (newDepth >= 150 && newDepth <= 270) {
            document.getElementById("wallInputDepth").value = newDepth;
            model.width = newDepth; // Update de width in het model
        }
    });

    document.getElementById("wallInputDepth").addEventListener("input", function (event) {
        let newDepth = parseInt(event.target.value, 10);
        if (newDepth >= 150 && newHeight <= 270) {
            document.getElementById("wallDepth").value = newDepth;
            FEATUREDMODEL.width = newDepth; // Update de width in het model
        }
    });
    console.log(model.height);

    document.getElementById('widthText').textContent = 'b: ' + model.width + ' cm';
    document.getElementById('heightText').textContent = 'h: ' + model.height + ' cm';
    document.getElementById('depthText').textContent = 'd: ' + model.depth + ' cm';




    //tv diagonal
    //var tvSize = document.getElementById('tvSize');
    //var tvSizeValues = ['32 inch', '40 inch', '42 inch', '43 inch', '45 inch', '48 inch', '49 inch', '50 inch', '55 inch', '58 inch', '60 inch', '65 inch', '70 inch', '75 inch', '82 inch', '85 inch'];

    pricing(model);

    // is global FEATUREDMODEL for pdf really necessary?
    FEATUREDMODEL = model;
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
        options: ['width', 'height', 'depth'],
        display: "d-block",
        code: /*html*/`

        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
        <div class="justify-content-start m-0 p-0">
    
            <div class="wall-selector">
                <label for="wallWidth">breedte (cm):</label>
                <div class="input-group">
                    <input type="range" id="wallWidth" min="150" max="270" value="#" step="1">
                    <input type="number" id="wallInputWidth" min="150" max="270" value="150" step="1">
                </div>
            </div>

            <div class="wall-selector">
                <label for="wallHeight">hoogte (cm):</label>
                <div class="input-group">
                    <input type="range" id="wallHeight" min="200" max="280" value="#" step="1">
                    <input type="number" id="wallInputHeight" min="200" max="280" value="#" step="1">
                </div>
            </div>

            
            <div class="wall-selector">
                <label for="wallDepth">diepte (cm):</label>
                <div class="input-group">
                    <input type="range" id="wallDepth" min="20" max="60" value="#" step="1">
                    <input type="number" id="wallInputDepth" min="20" max="60" value="#" step="1">
                </div>
            </div>
    
        </div>
    </div>
    
    <style>
        .wall-selector {
           
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            border-radius: 0;
        }
    
        .input-group {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 10px;
        }
    
        input[type="range"] {
            flex-grow: 1;
        }
    
        input[type="number"] {
            width: 80px;
            text-align: center;
        }
    </style>

            </div>
        </div>`

    };


    accordions.tv = {
        title: "tv",
        options: ['numberOfSeats', 'dimensions'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">

                <div style="width: 100%;" class="m-0 p-3">
                <label for="tempB">Choose a comfortable temperature:</label><br />
                <input type="range" id="tempB" name="temp" list="values" />
                
                <datalist id="values">
                  <option value="0" label="very cold!"></option>
                  <option value="25" label="cool"></option>
                  <option value="50" label="medium"></option>
                  <option value="75" label="getting warm!"></option>
                  <option value="100" label="hot!"></option>
                </datalist>
    <style>
                datalist {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    writing-mode: vertical-lr;
                    width: 200px;
                  }
                  
                  option {
                    padding: 0;
                  }
                  
                  input[type="range"] {
                    width: 200px;
                    margin: 0;
                  }
        
    </style>
                </div>

                <div class="mb-1">kies video (ter indicatie):</div>
                <div>
                    <video id="tvVideo" height="100px" autoplay loop muted>
                        <source src="video/test.mp4" type="video/mp4" >
                        Your browser does not support the video tag.
                    </video>
                </div>

     
            


        </div>`
    };

    return { accordions };
}