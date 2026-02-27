"use strict"
var ALLMODELS;
var ALLCOLORS;
var ALLFIREPLACES;
var FEATUREDMODEL;

const urlParams = new URLSearchParams(window.location.search);

let mainModule = null;

async function downloadPdf() {
    console.log(FEATUREDMODEL, brand, product, title);
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
    import('/projects/relaxury-tv-wand/threeModel.js')
        .then(main => {
            const viewer = document.getElementById('modelviewer');

            if (!mainModule) {
                main.initThree(viewer);
                mainModule = main;
                window.mainModule = main;
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

window.saveConfiguration = async function (model) {
    try {
        const docRef = await addDoc(collection(db, "clientModels"), {
            brand: brand,
            product: product,
            from: document.referrer,
            model: model,
            timestamp: serverTimestamp()
        });
        console.log("Configuration saved with ID: ", docRef.id);
        return `${document.referrer}?brand=${brand}&product=${product}&fsid=${docRef.id}`;
    } catch (e) {
        console.error("Error saving configuration for checkout: ", e);
        return null;
    }
};

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

        let refreshAll = false;
        if (model.fireplace && model.fireplace.width > parseInt(model.width) - 10) {
            delete model.fireplace;
            refreshAll = true;
        }

        if (refreshAll) {
            updateControlPanel(model, undefined, 'size');
        } else {
            updateControlPanel(model, 'size');
        }
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById("wallInputWidth").addEventListener("input", function (event) {
        document.getElementById("wallWidth").value = event.target.value;
        model.width = event.target.value;

        let refreshAll = false;
        if (model.fireplace && model.fireplace.width > parseInt(model.width) - 10) {
            delete model.fireplace;
            refreshAll = true;
        }

        if (refreshAll) {
            updateControlPanel(model, undefined, 'size');
            setTimeout(() => { const el = document.getElementById("wallInputWidth"); if (el) el.focus(); }, 0);
        } else {
            updateControlPanel(model, 'size');
        }
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

    document.getElementById('sizesText').textContent = `${(
        (+model.alcove?.left?.width || 0) +
        (+model.alcove?.right?.width || 0) +
        (+model.width || 0)
    )} x ${+model.height || 0} x ${+model.depth || 0} cm`;


    //tv diagonal
    const maxTvWidth = model.width - 23;
    const maxTvHeight = model.height - 121;
    const inchToCm = 2.54;
    const maxWidthInInches = (maxTvWidth / inchToCm) * (18.3576 / 16);
    const maxHeightInInches = (maxTvHeight / inchToCm) * (18.3576 / 9);
    const maxDiagonalInInches = Math.sqrt(Math.pow(maxTvWidth / inchToCm, 2) + Math.pow(maxTvHeight / inchToCm, 2));
    const maxTvSize = Math.floor(Math.min(maxWidthInInches, maxHeightInInches, maxDiagonalInInches));
    const tvSizeSlider = document.getElementById("tvSize");
    const tvSizeInput = document.getElementById("tvSizeInput");
    const minTvSize = 30;
    tvSizeSlider.setAttribute("min", minTvSize);
    tvSizeSlider.setAttribute("max", maxTvSize);
    tvSizeInput.setAttribute("min", minTvSize);
    tvSizeInput.setAttribute("max", maxTvSize);

    if (maxTvSize < model.tvSize) {
        model.tvSize = maxTvSize;
    }

    document.getElementById("minTvInch").textContent = minTvSize;
    document.getElementById("maxTvInch").textContent = maxTvSize;

    tvSizeSlider.value = model.tvSize;
    tvSizeInput.value = model.tvSize;

    tvSizeSlider.addEventListener("input", function (event) {
        tvSizeInput.value = event.target.value;
    });

    tvSizeSlider.addEventListener("change", function (event) {
        model.tvSize = event.target.value;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    tvSizeInput.addEventListener("input", function (event) {
        let newValue = Math.min(event.target.value, maxTvSize);
        tvSizeInput.value = newValue;
        tvSizeSlider.value = newValue;
        model.tvSize = newValue;

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    document.getElementById('inchText').textContent = model.tvSize + ' inch tv';

    // tvMount
    let tvMountCheckbox = document.getElementById('tvMount');

    if (model.tvMount) {
        tvMountCheckbox.checked = true;
    } else {
        tvMountCheckbox.checked = false;
    }

    if (tvMountCheckbox.checked) {
        document.getElementById('tvMountText').textContent = 'tv-beugel';
    } else {
        document.getElementById('tvMountText').textContent = '';
    }

    tvMountCheckbox.addEventListener('click', () => {
        if (tvMountCheckbox.checked) {
            model.tvMount = true;
        } else {
            model.tvMount = false;
        }

        updateControlPanel(model, 'size');
        updateFeaturedModel(model);
        showSelected(false);
    });

    // hatches
    let hatchLeftCheckbox = document.getElementById('hatchLeft');
    let hatchRightCheckbox = document.getElementById('hatchRight');

    if (model.hatchLeft) hatchLeftCheckbox.checked = true;
    if (model.hatchRight) hatchRightCheckbox.checked = true;

    const updateHatchLabel = () => {
        let text = [];
        if (hatchLeftCheckbox.checked) text.push('luikje links');
        if (hatchRightCheckbox.checked) text.push('luikje rechts');
        document.getElementById('hatchText').textContent = text.join(' & ');
    }
    updateHatchLabel();

    hatchLeftCheckbox.addEventListener('click', () => {
        model.hatchLeft = hatchLeftCheckbox.checked;
        if (hatchLeftCheckbox.checked) {
            delete model.alcove;
        }
        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    hatchRightCheckbox.addEventListener('click', () => {
        model.hatchRight = hatchRightCheckbox.checked;
        if (hatchRightCheckbox.checked) {
            delete model.alcove;
        }
        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    // soundbar
    let soundbarCheckbox = document.getElementById('soundbar');
    let soundbarInput = document.getElementById('soundbarInput');

    if (model.soundbar?.active) {
        soundbarCheckbox.checked = true;
    } else {
        soundbarCheckbox.checked = false;
    }

    const updateSoundbarLabel = () => {
        if (soundbarCheckbox.checked) {
            document.getElementById('soundbarText').textContent = 'soundbar';
            if (document.getElementById('soundbarDetailText')) {
                document.getElementById('soundbarDetailText').textContent = model.soundbar?.text || '';
            }
        } else {
            document.getElementById('soundbarText').textContent = '';
        }
    }
    updateSoundbarLabel();

    soundbarCheckbox.addEventListener('click', () => {
        if (!model.soundbar) model.soundbar = { active: false, text: '' };
        if (soundbarCheckbox.checked) {
            model.soundbar.active = true;
        } else {
            model.soundbar.active = false;
        }

        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (soundbarInput) {
        soundbarInput.addEventListener('input', (e) => {
            if (!model.soundbar) model.soundbar = { active: true, text: '' };
            model.soundbar.text = e.target.value;
            updateSoundbarLabel();
        });
    }

    /*
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
*/
    //alcove
    let alcoveCheckbox = document.getElementById('alcoveToggle');

    if (model.alcove) {
        alcoveCheckbox.checked = true;
    } else {
        alcoveCheckbox.checked = false;
    }

    if (alcoveCheckbox.checked) {
        document.getElementById('alcoveText').textContent = 'vakkenkasten';
    } else {
        document.getElementById('alcoveText').textContent = '';
    }

    alcoveCheckbox.addEventListener('click', () => {
        if (alcoveCheckbox.checked) {
            model.alcove = model.alcove || {};
            model.alcove.left = model.alcove.left || {};
            model.alcove.right = model.alcove.right || {};
            model.alcove.left.width = 50;
            model.alcove.right.width = 50;
            model.alcove.left.shelves = 2;
            model.alcove.right.shelves = 2;

            // Disable hatches when alcove is selected
            model.hatchLeft = false;
            model.hatchRight = false;
        } else {
            delete model.alcove;
        }

        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (model.alcove) {
        document.getElementById("alcove").value = model.alcove.left.width;
        document.getElementById("alcoveInput").value = model.alcove.left.width;

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

        document.getElementById("alcoveInput").addEventListener("input", function (event) {
            document.getElementById("alcove").value = event.target.value;
            model.alcove.left.width = parseInt(event.target.value);
            model.alcove.right.width = parseInt(event.target.value);

            updateControlPanel(model, 'alcove');
            updateFeaturedModel(model);
            showSelected(false);
        });

        document.getElementById("shelvesInput").value = model.alcove.left.shelves;

        document.getElementById("shelvesInput").addEventListener("input", function (event) {
            model.alcove.left.shelves = parseInt(event.target.value);
            model.alcove.right.shelves = parseInt(event.target.value);

            updateControlPanel(model, 'alcove');
            updateFeaturedModel(model);
            showSelected(false);
        });

        document.getElementById('alcoveWidthText').textContent = model.alcove.left.width + ' cm';
        if (model.alcove.left.shelves == 1) {
            document.getElementById('alcoveShelvesText').textContent = model.alcove.left.shelves + ' plank';
        } else {
            document.getElementById('alcoveShelvesText').textContent = model.alcove.left.shelves + ' planken';
        }


        //spots in alcove
        let alcoveSpotsCheckbox = document.getElementById('alcoveSpotsToggle');
        if (model.alcove) {
            if (model.alcove.left.spots) {
                alcoveSpotsCheckbox.checked = true;
            } else {
                alcoveSpotsCheckbox.checked = false;
            }
        }
        if (alcoveSpotsCheckbox.checked) {
            document.getElementById('alcoveSpotsText').textContent = 'spots';
        } else {
            document.getElementById('alcoveSpotsText').textContent = '';
        }

        alcoveSpotsCheckbox.addEventListener('click', () => {
            if (alcoveSpotsCheckbox.checked) {
                model.alcove.left.spots = true;
                model.alcove.right.spots = true;
            } else {
                model.alcove.left.spots = false;
                model.alcove.right.spots = false;
            }

            updateControlPanel(model, 'alcove');
            updateFeaturedModel(model);
            showSelected(false);
        });
    }

    //fireplace
    const fireplaceCheckbox = document.getElementById('fireplaceToggle');
    const fireplace = document.getElementById('fireplace');

    let fireplaceCheckboxListenerAdded = false;
    let fireplaceListenerAdded = false;

    let selectedFireplace;

    if (model.fireplace) {
        fireplaceCheckbox.checked = true;
        fireplace.value = model.fireplace.id; // Zet de geselecteerde waarde

        fireplace.innerHTML = ""; // Leeg de bestaande opties in de dropdown

        ALLFIREPLACES.fireplaces.forEach(fireplaceOption => {
            // Sla haarden over die te breed zijn
            if (fireplaceOption.width > model.width - 10) {
                return;
            }

            let opt = document.createElement("option");
            opt.value = String(fireplaceOption.id); // Gebruik fireplaceOption.id hier

            // Toon de haard met prijs in de optie
            opt.textContent = `${fireplaceOption.brand} ${fireplaceOption.type} (€ ${fireplaceOption.price})`;

            fireplace.appendChild(opt);
        });

        // Zorg ervoor dat de juiste optie geselecteerd is na het toevoegen
        if (model.fireplace) {
            fireplace.value = String(model.fireplace.id); // Reset de geselecteerde haard
        }

        if (!fireplaceListenerAdded) {
            fireplace.addEventListener('input', function (event) {
                let fireplaceId = event.target.value;
                selectedFireplace = ALLFIREPLACES.fireplaces.find(f => fireplaceId == f.id);
                model.fireplace = { ...selectedFireplace };

                fireplaceListenerAdded = true;

                updateControlPanel(model, 'fireplace');
                updateFeaturedModel(model);
                showSelected(false);
            });
        }
    } else {
        fireplaceCheckbox.checked = false;
    }

    if (!fireplaceCheckboxListenerAdded) {
        fireplaceCheckbox.addEventListener('click', () => {
            if (fireplaceCheckbox.checked) {
                selectedFireplace = ALLFIREPLACES.fireplaces.find(f => 3 == f.id);
                model.fireplace = { ...selectedFireplace };
            } else {
                delete model.fireplace;
            }

            fireplaceCheckboxListenerAdded = true;

            updateControlPanel(model, undefined, 'options');
            updateFeaturedModel(model);
            showSelected(false);
        });
    }

    if (fireplaceCheckbox.checked) {
        document.getElementById('fireplaceText').textContent = 'sfeerhaard';
        if (model.fireplace) {
            document.getElementById('fireplacebrandandtypeText').textContent = `${model.fireplace.brand} ${model.fireplace.type}`;
        }
    } else {
        document.getElementById('fireplaceText').textContent = '';
    }


    //colors  
    const ralColor = model.color.hex;
    let colorIndex = ALLCOLORS.colors.findIndex(item => item.colorHex === ralColor);
    var colorValue = document.querySelectorAll(`.finishingColors_colorButton`);
    model.color.ral = ALLCOLORS.colors[colorIndex].colorCode;
    model.color.name = ALLCOLORS.colors[colorIndex].colorNameNL;
    model.color.group = ALLCOLORS.colors[colorIndex].colorGroup;

    if (uap.getDevice().type != 'mobile' || uap.getDevice().type != 'tablet' || uap.getDevice().withFeatureCheck().type != 'tablet') {
        colorValue.forEach(item => item.addEventListener('mouseover', () => {
            console.log('hover');
            colorValue.forEach(item => { item.classList.remove('colorButtonActive') });
            const colorId = item.id.split('_');
            colorIndex = colorId[1];
            document.getElementById(`finishingText`).style.visibility = 'visible';
            document.getElementById(`colorText`).innerHTML = '<img src="img/transparant.png" class="rounded-pill shadow" style="width: calc(1rem + 1vw); background-color: #' + ALLCOLORS.colors[colorIndex].colorHex + ';">&nbsp;&nbsp;&nbsp;&nbsp;' + ALLCOLORS.colors[colorIndex].colorCode + ' ' + ALLCOLORS.colors[colorIndex].colorNameNL;
            // document.getElementById(`colorText`).innerHTML = '<img src="' + ALLCOLORS.colors[colorIndex].colorPathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + ALLCOLORS.colors[colorIndex].colorName;
            document.getElementById(`colorText`).classList.add('fst-italic');
            showSelected(true);
        }));

        colorValue.forEach(item => item.addEventListener('mouseout', () => {
            document.getElementById(`finishingText`).style.visibility = 'hidden';
            document.getElementById(`colorText`).innerHTML = '<img src="img/transparant.png" class="rounded-pill shadow" style="width: calc(1rem + 1vw); background-color: #' + model.color.hex + ';">&nbsp;&nbsp;&nbsp;&nbsp;' + model.color.ral + ' ' + model.color.name;
            // document.getElementById(`colorText`).innerHTML = '<img src="' + model.color.pathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + model.color.type + ' ' + model.color.name;
            document.getElementById(`colorText`).classList.remove('fst-italic');
            showSelected(true);
        }));
    }

    colorValue.forEach(item => item.addEventListener('click', () => {
        colorValue.forEach(item => { item.classList.remove('colorButtonActive') });
        const colorId = item.id.split('_');
        colorIndex = colorId[1];

        model.color.hex = ALLCOLORS.colors[colorIndex].colorHex;
        document.getElementById(`finishingColorsIndex_${colorIndex}`).classList.add('colorButtonActive');

        updateControlPanel(model, `finishing`);
        updateFeaturedModel(model);
        showSelected(true);
    }));
    document.getElementById('colorText').innerHTML = '<img src="img/transparant.png" class="rounded-pill shadow" style="width: calc(1rem + 1vw); background-color: #' + model.color.hex + ';">&nbsp;&nbsp;&nbsp;&nbsp;' + model.color.ral + ' ' + model.color.name
    document.getElementById(`finishingColorsIndex_${colorIndex}`).classList.remove('colorButton');
    document.getElementById(`finishingColorsIndex_${colorIndex}`).classList.add('colorButtonActive');

    let selectedColorGroup = model.color.group;
    document.querySelectorAll(".color-group").forEach(group => {
        if (group.getAttribute("data-color") === selectedColorGroup) {
            group.style.display = "block";
        } else {
            group.style.display = "none";
        }
    });

    document.querySelectorAll(".filter-btn").forEach(button => {
        if (button.getAttribute("data-color") === selectedColorGroup) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

        button.addEventListener("click", function () {
            let selectedColor = this.getAttribute("data-color");

            document.querySelectorAll(".color-group").forEach(group => {
                if (group.getAttribute("data-color") === selectedColor) {
                    group.style.display = "block";
                } else {
                    group.style.display = "none";
                }
            });

            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });
            this.classList.add("active");
        });
    });





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
    const fireplacesPromise = fetch(`projects/${brand}-${product}/fireplaces.json`).then(response => response.json());
    ALLFIREPLACES = await fireplacesPromise;

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
        options: ['sizes', 'inch', 'tvMount'],
        display: "d-block",
        code: /*html*/`

        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">

                <div>breedte basiselement:</div>
                <div class="row">
                    <div class="col-12 col-lg-9">
                        <input type="range" class="form-range" id="wallWidth" min="150" max="270" value="${model.width}" step="1">
                        <div style=" display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
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
                    </div>      
                    <div class="col-12 col-lg-3">
                        <input class="input-group-text mt-3 mt-lg-0 float-lg-end rounded-0 bg-white" type="number" id="wallInputWidth" min="150" max="270" value="${model.width}" step="1">
                    </div>
                </div>
                
                <div class="mt-3">hoogte:</div>
                <div class="row">
                    <div class="col-12 col-lg-9">
                        <input style="width: 66.6%;" type="range" class="form-range" id="wallHeight" min="200" max="280" value="${model.height}" step="1">
                        <div style="width: 66.6%; display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
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
                    </div>      
                    <div class="col-12 col-lg-3">
                        <input class="input-group-text mt-3 mt-lg-0 float-lg-end rounded-0 bg-white" type="number" id="wallInputHeight" min="200" max="280" value="${model.height}" step="1">
                    </div>
                </div>

                <div class="mt-3">diepte:</div>
                <div class="row">
                    <div class="col-12 col-lg-9">
                        <input style="width: 25%" type="range" class="form-range" id="wallDepth" min="20" max="50" value="${model.depth}" step="1">
                        <div style="width: 25%; display: flex; justify-content: space-between; margin-top: -8px; font-size: 11px;">
                            <span>20</span>
                            <span>30</span>
                            <span>40</span>
                            <span>50</span>
                        </div>
                    </div>      
                    <div class="col-12 col-lg-3">
                        <input class="input-group-text mt-3 mt-lg-0 float-lg-end rounded-0 bg-white" type="number" id="wallInputDepth" min="20" max="50" value="${model.depth}" step="1">
                    </div>
                </div>

                <div class="mt-3">inchmaat tv:</div>
                <div class="row">
                    <div class="col-12 col-lg-9">
                        <input type="range" class="form-range" id="tvSize" min="30" max="90" value="${model.tvSize}" step="1">
                        <div style="display: flex; justify-content: space-between; margin-top: -10px; font-size: 11px;">
                            <span id="minTvInch">30</span>
                            <span id="maxTvInch">90</span>
                        </div>
                    </div>      
                    <div class="col-12 col-lg-3">
                        <input class="input-group-text mt-3 mt-lg-0 float-lg-end rounded-0 bg-white" type="number" id="tvSizeInput" min="30" max="90" value="${model.tvSize}" step="1">
                    </div>
                </div>
                <div class="form-check my-3">
                    <input id="tvMount" name="tvMount" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="tvMount">
                    tv-beugel toevoegen (+ €250)
                    </label>
                </div>

                <!-- videos for videotexture, do not remove -->
                <!--
                <video id="video-1" style="display: none;" height="100px" autoplay loop muted>
                    <source src="projects/relaxury-tv-wand/video/video-1.mp4" type="video/mp4" >
                    Your browser does not support the video tag.
                </video>
            
                <video id="video-2" style="display: none;" height="100px" autoplay loop muted>
                    <source src="projects/relaxury-tv-wand/video/video-2.mp4" type="video/mp4" >
                    Your browser does not support the video tag.
                </video>
-->
<!-- poster image needed for model export and AR -->
                <video id="logoAnimation" style="display: none;" height="100px" autoplay loop muted poster="projects/relaxury-tv-wand/video/logoAnimation.png">
                    <source src="projects/relaxury-tv-wand/video/logoAnimation.mp4" type="video/mp4" >
                    Your browser does not support the video tag.
                </video>

                <video id="optiflame" style="display: none;" height="100px" autoplay loop muted poster="projects/relaxury-tv-wand/video/optiflame.png">
                    <source src="projects/relaxury-tv-wand/video/optiflame.mp4" type="video/mp4" >
                    Your browser does not support the video tag.
                </video>

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

    accordions.options = {
        title: "opties",
        options: ['soundbar', 'alcove', 'fireplace', 'hatch'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="justify-content-start m-0 p-0">
                <div class="form-check mt-3 mb-1">
                    <input id="soundbar" name="soundbar" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="soundbar">
                    uitsparing voor soundbar
                    </label>
                </div>
                <div class="form-check my-3">
                    <input id="fireplaceToggle" name="fireplaceToggle" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="fireplaceToggle">
                    sfeerhaard
                    </label>
                </div>
                <div class="form-check my-3">
                    <input id="alcoveToggle" name="alcoveToggle" class="form-check-input" type="checkbox" ${model.hatchLeft || model.hatchRight ? 'disabled' : ''}>
                    <label class="form-check-label" for="alcoveToggle">
                    vakkenkasten aan weerszijden
                    </label>
                </div>
                <div class="row m-0 p-0">
                    <div class="col-3 m-0 p-0">
                        <div class="form-check">
                            <input id="hatchLeft" name="hatchLeft" class="form-check-input" type="checkbox" ${model.alcove ? 'disabled' : ''}>
                            <label class="form-check-label" for="hatchLeft">
                            luikje links
                            </label>
                        </div>
                    </div>
                    <div class="col-3 m-0 p-0">
                        <div class="form-check">
                            <input id="hatchRight" name="hatchRight" class="form-check-input" type="checkbox" ${model.alcove ? 'disabled' : ''}>
                            <label class="form-check-label" for="hatchRight">
                            luikje rechts
                            </label>
                        </div>
                    </div>
                </div>                
            </div>
        </div>`
    };

    if (model.soundbar?.active) {
        accordions.soundbar = {
            title: "soundbar",
            options: ['soundbarDetail'],
            display: "d-block",
            code: /*html*/`
            <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
                <div class="justify-content-start m-0 p-0">
                     <div class="pb-3">Vul merk en type van uw soundbar in om de juiste uitsparing te maken:</div>
                     <input type="text" class="form-control form-control-sm rounded-0 border-dark" id="soundbarInput" placeholder="merk en type soundbar" value="${model.soundbar?.text || ''}">
                </div>
            </div>`
        };
    }

    if (model.alcove) {
        accordions.alcove = {
            title: "vakkenkasten",
            options: ['alcoveWidth', 'alcoveShelves', 'alcoveSpots'],
            display: "d-block",
            code: /*html*/`
            <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
                <div class="justify-content-start m-0 p-0">
                    <div>breedte:</div>
                    <div class="row">
                        <div class="col-12 col-lg-9">
                            <input type="range" class="form-range" id="alcove" min="50" max="100" value="${model.alcove.left.width}" step="1">
                            <div style="display: flex; justify-content: space-between; margin-top: -10px; font-size: 11px;">
                                <span>50</span>
                                <span>60</span>
                                <span>70</span>
                                <span>80</span>
                                <span>90</span>
                                <span>100</span>
                            </div>
                        </div>      
                        <div class="col-12 col-lg-3">
                            <input class="input-group-text float-end rounded-0 bg-white" type="number" id="alcoveInput" min="50" max="100" value="${model.alcove.left.width}" step="1">
                        </div>
                    </div>
                    <div class="mt-3 mb-2">aantal planken:</div>
                        <select style="width: 100px;" class="form-select rounded-0 bg-white" id="shelvesInput" name="shelvesInput">
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    <div class="form-check my-3">
                        <input id="alcoveSpotsToggle" name="alcoveSpotsToggle" class="form-check-input" type="checkbox">
                        <label class="form-check-label" for="alcoveSpotsToggle">
                            spots in vakken
                        </label>
                    </div>
                </div>
            </div>`
        };
    }

    if (model.fireplace) {
        accordions.fireplace = {
            title: "sfeerhaard",
            options: ['fireplacebrandandtype'],
            display: "d-block",
            code: /*html*/`
            <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
                <div class="justify-content-start m-0 p-0">

                    <div class="pb-3">Kies uw sfeerhaard:</div>
                    <select style="width: 300px;" class="form-select rounded-0 bg-white" id="fireplace" class="form-select"></select>

                </div>
            </div>`
        }
    }

    accordions.finishing = {
        title: "kleur impressie",
        options: ['color'],
        display: "d-block",
        code: /*html*/`
            <div class="pb-3">De tv-wand wordt afgewerkt met lakdraagfolie, die u zelf in de gewenste kleur kunt schilderen.<br>
                Om een indruk te krijgen van het eindresultaat kunt u hier een RAL kleur toepassen.
            </div>
            <div class="pb-3">
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="white">wit</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="grey">grijs</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="black">zwart</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="brown">bruin</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="yellow">geel</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="orange">oranje</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="red">rood</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="violet">violet</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="blue">blauw</button>
                        <button class="btn btn-outline-dark btn-sm filter-btn rounded-0 mt-1" data-color="green">groen</button>
            </div>
            <div id="colorOptions" class="mb-3">
                <div class="color-group" data-color="white">
                    <div id="colorsWhitePicker"></div>
                </div>
                <div class="color-group" data-color="grey">
                    <div id="colorsGreyPicker"></div>
                </div>
                <div class="color-group" data-color="black">
                    <div id="colorsBlackPicker"></div>
                </div>
                <div class="color-group" data-color="brown">
                    <div id="colorsBrownPicker"></div>
                </div>
                <div class="color-group" data-color="yellow">
                    <div id="colorsYellowPicker"></div>
                </div>
                <div class="color-group" data-color="orange">
                    <div id="colorsOrangePicker"></div>
                </div>
                <div class="color-group" data-color="red">
                    <div id="colorsRedPicker"></div>
                </div>
                <div class="color-group" data-color="violet">
                    <div id="colorsVioletPicker"></div>
                </div>
                <div class="color-group" data-color="blue">
                    <div id="colorsBluePicker"></div>
                </div>
                <div class="color-group" data-color="green">
                    <div id="colorsGreenPicker"></div>
                </div>
            </div>
        `,
        onload: function () {
            function addColorsToPicker(colorGroup, elementId) {
                let container = document.getElementById(elementId);
                if (container) {
                    addColors("finishingColors", colorGroup, ALLCOLORS.colors, container);
                }
            }

            addColorsToPicker("white", "colorsWhitePicker");
            addColorsToPicker("grey", "colorsGreyPicker");
            addColorsToPicker("black", "colorsBlackPicker");
            addColorsToPicker("brown", "colorsBrownPicker");
            addColorsToPicker("yellow", "colorsYellowPicker");
            addColorsToPicker("orange", "colorsOrangePicker");
            addColorsToPicker("red", "colorsRedPicker");
            addColorsToPicker("violet", "colorsVioletPicker");
            addColorsToPicker("blue", "colorsBluePicker");
            addColorsToPicker("green", "colorsGreenPicker");
        }
    };


    return { accordions };
}