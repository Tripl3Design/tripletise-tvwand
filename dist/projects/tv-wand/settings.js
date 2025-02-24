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

    // type
    let typeRadios = document.querySelectorAll(`input[type=radio][name="type"]`);
    typeRadios.forEach(radio => radio.addEventListener('click', () => {
        model.type = radio.value;

        updateControlPanel(model, `type`);
        updateFeaturedModel(model);
        showSelected(false);
    }));
    const numberOfSeats = ALLCOMPONENTS.elements[model.type].seats;
    const width = ALLCOMPONENTS.elements[model.type].width;
    const depth = ALLCOMPONENTS.elements[model.type].depth;
    document.getElementById(model.type).checked = true;
    document.getElementById('numberOfSeatsText').textContent = numberOfSeats + ' zits';
    document.getElementById('dimensionsText').textContent = `${width} x ${depth} cm`;

    // seatHeight
    let seatHeightRadios = document.querySelectorAll(`input[type=radio][name="seatHeight"]`);
    seatHeightRadios.forEach(radio => radio.addEventListener('click', () => {
        model.seatHeight = radio.value;

        updateControlPanel(model, `options`);
        updateFeaturedModel(model);
        showSelected(false);
    }));
    document.getElementById(`seatHeight_${model.seatHeight}`).checked = true;
    document.getElementById('seatHeightText').textContent = `${model.seatHeight} cm`;
    /*
        // legs
        let legRadios = document.querySelectorAll(`input[type=radio][name="leg"]`);
        legRadios.forEach(radio => radio.addEventListener('click', () => {
            model.legs = radio.value;
    
            updateControlPanel(model, `options`);
            updateFeaturedModel(model);
            showSelected(false);
        }));
        if (model.legs == 'legsStraight') {
            document.getElementById('legsText').textContent = 'rechte poten';
            document.getElementById('legsStraight').checked = true;
        } else {
            document.getElementById('legsText').textContent = 'gebogen poten';
            document.getElementById('legsBent').checked = true;
        }
    */
    // duotone
    let duotoneCheckbox = document.getElementById('duotone');
    if (model.upholsteryDuotone) {
        duotoneCheckbox.checked = true;
    } else {
        duotoneCheckbox.checked = false;
    }

    duotoneCheckbox.addEventListener('click', () => {
        if (duotoneCheckbox.checked) {
            model.upholsteryDuotone = { "hexColor": "323232", "type": "adore" };

            document.getElementById('duotoneText').textContent = 'duotone';
        } else {
            delete model.upholsteryDuotone;
            document.getElementById('duotoneText').textContent = '';
        }

        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (duotoneCheckbox.checked) {
        document.getElementById('duotoneText').textContent = 'duotone';
    } else {
        delete model.upholsteryDuotone;
        document.getElementById('duotoneText').textContent = '';
    }

    // footstool
    let footstoolCheckbox = document.getElementById('footstool');
    if (model.footstool) {
        footstoolCheckbox.checked = true;
    } else {
        footstoolCheckbox.checked = false;
    }

    footstoolCheckbox.addEventListener('click', () => {
        if (footstoolCheckbox.checked) {
            model.footstool = true;

            document.getElementById('footstoolText').textContent = 'voetenbank';
        } else {
            delete model.footstool;
            document.getElementById('footstoolText').textContent = '';
        }

        updateControlPanel(model, undefined, 'options');
        updateFeaturedModel(model);
        showSelected(false);
    });

    if (footstoolCheckbox.checked) {
        document.getElementById('footstoolText').textContent = 'voetenbank';
    } else {
        delete model.footstool;
        document.getElementById('footstoolText').textContent = '';
    }

    // upholstery
    //let upholsteryCategory = document.querySelectorAll(`input[type=radio][name="upholsteriesCategory"]`);
    //upholsteryCategory.forEach(radio => { radio.replaceWith(radio.cloneNode(true)) });
    //upholsteryCategory = document.querySelectorAll(`input[type=radio][name="upholsteriesCategory"]`);
    //document.getElementById(`upholsteriesCategory_${model.upholstery.category}`).checked = true;

    //upholsteryCategory.forEach(radio => radio.addEventListener('click', () => {
    //    model.upholstery.category = radio.value;
    //    document.getElementById(`upholsteriesCategory_${model.upholstery.category}`).checked = true;

    //    updateControlPanel(model, `upholstery`);
    //    updateFeaturedModel(model);
    //    showSelected(false);
    //}));

    const upholstery = model.upholstery.path;
    let upholsteryIndex = ALLCOLORS.upholsteries.findIndex(item => item.colorPath === upholstery);
    var upholsteryValue = document.querySelectorAll(`.upholsteryColors_colorButton`);
    model.upholstery.type = ALLCOLORS.upholsteries[upholsteryIndex].colorType;
    model.upholstery.name = ALLCOLORS.upholsteries[upholsteryIndex].colorName;
    model.upholstery.path = ALLCOLORS.upholsteries[upholsteryIndex].colorPath;
    model.upholstery.pricegroup = ALLCOLORS.upholsteries[upholsteryIndex].colorPricegroup;
    model.upholstery.structure = ALLCOLORS.upholsteries[upholsteryIndex].colorStructure;
    model.upholstery.pathThumb = ALLCOLORS.upholsteries[upholsteryIndex].colorPathThumb;

    if (uap.getDevice().type === 'mobile' || uap.getDevice().type === 'tablet' || uap.getDevice().withFeatureCheck().type === 'tablet') {
        upholsteryValue.forEach(item => item.addEventListener('mouseover', () => {
            upholsteryValue.forEach(item => { item.classList.remove('colorButtonActive') });
            const upholsteryId = item.id.split('_');
            upholsteryIndex = upholsteryId[1];
            document.getElementById(`upholsteryText`).style.visibility = 'visible';
            document.getElementById(`colorText`).innerHTML = '<img src="' + ALLCOLORS.upholsteries[upholsteryIndex].colorPathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + ALLCOLORS.upholsteries[upholsteryIndex].colorName;
            document.getElementById(`colorText`).classList.add('fst-italic');
            showSelected(true);
        }));

        upholsteryValue.forEach(item => item.addEventListener('mouseout', () => {
            document.getElementById(`upholsteryText`).style.visibility = 'hidden';
            document.getElementById(`colorText`).innerHTML = '<img src="' + model.upholstery.pathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + model.upholstery.type + ' ' + model.upholstery.name;
            document.getElementById(`colorText`).classList.remove('fst-italic');
            showSelected(true);
        }));
    }

    upholsteryValue.forEach(item => item.addEventListener('click', () => {
        upholsteryValue.forEach(item => { item.classList.remove('colorButtonActive') });
        const upholsteryId = item.id.split('_');
        upholsteryIndex = upholsteryId[1];

        model.upholstery.path = ALLCOLORS.upholsteries[upholsteryIndex].colorPath;
        document.getElementById(`upholsteryColorsIndex_${upholsteryIndex}`).classList.add('colorButtonActive');

        updateControlPanel(model, `upholstery`);
        updateFeaturedModel(model);
        showSelected(true);
    }));
    document.getElementById(`colorText`).innerHTML = '<img src="' + model.upholstery.pathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + model.upholstery.type + ' ' + model.upholstery.name;
    document.getElementById(`upholsteryColorsIndex_${upholsteryIndex}`).classList.remove('colorButton');
    document.getElementById(`upholsteryColorsIndex_${upholsteryIndex}`).classList.add('colorButtonActive');

    // upholsteryDuotone
    if (model.upholsteryDuotone) {
        /*
        let upholsteryDuotoneCategory = document.querySelectorAll(`input[type=radio][name="upholsteriesDuotoneCategory"]`);
        upholsteryDuotoneCategory.forEach(radio => { radio.replaceWith(radio.cloneNode(true)) });
        upholsteryDuotoneCategory = document.querySelectorAll(`input[type=radio][name="upholsteriesDuotoneCategory"]`);
        document.getElementById(`upholsteriesDuotoneCategory_${model.upholsteryDuotone.category}`).checked = true;

        upholsteryDuotoneCategory.forEach(radio => radio.addEventListener('click', () => {
            model.upholsteryDuotone.category = radio.value;
            document.getElementById(`upholsteriesDuotoneCategory_${model.upholsteryDuotone.category}`).checked = true;

            updateControlPanel(model, `upholsteryDuotone`);
            updateFeaturedModel(model);
            showSelected(false);
        }));
*/

        const upholsteryDuotone = model.upholsteryDuotone.path;
        let upholsteryDuotoneIndex = ALLCOLORS.upholsteries.findIndex(item => item.colorPath === upholsteryDuotone);
        var upholsteryDuotoneValue = document.querySelectorAll(`.upholsteryDuotoneColors_colorButton`);
        if (upholsteryDuotoneIndex === -1) {
            upholsteryDuotoneIndex = 0;
        }
        model.upholsteryDuotone.type = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorType;
        model.upholsteryDuotone.name = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorName;
        model.upholsteryDuotone.path = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorPath;
        model.upholsteryDuotone.pricegroup = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorPricegroup;
        model.upholsteryDuotone.structure = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorStructure;
        model.upholsteryDuotone.pathThumb = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorPathThumb;

        if (uap.getDevice().type === 'mobile' || uap.getDevice().type === 'tablet' || uap.getDevice().withFeatureCheck().type === 'tablet') {
            upholsteryDuotoneValue.forEach(item => item.addEventListener('mouseover', () => {
                upholsteryDuotoneValue.forEach(item => { item.classList.remove('colorButtonActive') });
                const upholsteryDuotoneId = item.id.split('_');
                upholsteryDuotoneIndex = upholsteryDuotoneId[1];
                document.getElementById(`upholsteryDuotoneText`).style.visibility = 'visible';
                document.getElementById(`colorDuotoneText`).innerHTML = '<img src="' + ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorPathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorName;
                document.getElementById(`colorDuotoneText`).classList.add('fst-italic');
                showSelected(true);
            }));

            upholsteryDuotoneValue.forEach(item => item.addEventListener('mouseout', () => {
                document.getElementById(`upholsteryDuotoneText`).style.visibility = 'hidden';
                document.getElementById(`colorDuotoneText`).innerHTML = '<img src="' + model.upholsteryDuotone.pathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + model.upholsteryDuotone.type + ' ' + model.upholsteryDuotone.name;
                document.getElementById(`colorDuotoneText`).classList.remove('fst-italic');
                showSelected(true);
            }));
        }

        upholsteryDuotoneValue.forEach(item => item.addEventListener('click', () => {
            upholsteryDuotoneValue.forEach(item => { item.classList.remove('colorButtonActive') });
            const upholsteryDuotoneId = item.id.split('_');
            upholsteryDuotoneIndex = upholsteryDuotoneId[1];

            model.upholsteryDuotone.path = ALLCOLORS.upholsteries[upholsteryDuotoneIndex].colorPath;
            document.getElementById(`upholsteryDuotoneColorsIndex_${upholsteryDuotoneIndex}`).classList.add('colorButtonActive');

            updateControlPanel(model, `upholsteryDuotone`);
            updateFeaturedModel(model);
            showSelected(true);
        }));
        document.getElementById(`colorDuotoneText`).innerHTML = '<img src="' + model.upholsteryDuotone.pathThumb + '" class="rounded-pill shadow" style="width: calc(1rem + 1vw);">&nbsp;&nbsp;&nbsp;&nbsp;' + model.upholsteryDuotone.type + ' ' + model.upholsteryDuotone.name;
        document.getElementById(`upholsteryDuotoneColorsIndex_${upholsteryDuotoneIndex}`).classList.remove('colorButton');
        document.getElementById(`upholsteryDuotoneColorsIndex_${upholsteryDuotoneIndex}`).classList.add('colorButtonActive');
    }
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

    accordions.type = {
        title: "type",
        options: ['numberOfSeats', 'dimensions'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="fst-italic mt-3 mb-2">2,5 zits banken</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art2502" id="art2502">
                        <label class="form-check-label" for="art2502">${ALLCOMPONENTS.elements.art2502.width} x ${ALLCOMPONENTS.elements.art2502.depth} cm ${ALLCOMPONENTS.elements.art2502.name}</label>
                    </div>
                </div>
            </div>            
            
            <div class="fst-italic mt-3 mb-2">3 zits banken</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art3002" id="art3002">
                        <label class="form-check-label" for="art3002">${ALLCOMPONENTS.elements.art3002.width} x ${ALLCOMPONENTS.elements.art3002.depth} cm ${ALLCOMPONENTS.elements.art3002.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">3,5 zits banken met longchair</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art846" id="art846">
                        <label class="form-check-label" for="art846">${ALLCOMPONENTS.elements.art846.width} x ${ALLCOMPONENTS.elements.art846.depth} cm ${ALLCOMPONENTS.elements.art846.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art553" id="art553">
                        <label class="form-check-label" for="art553">${ALLCOMPONENTS.elements.art553.width} x ${ALLCOMPONENTS.elements.art553.depth} cm ${ALLCOMPONENTS.elements.art553.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">4 zits banken met longchair</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art598" id="art598">
                        <label class="form-check-label" for="art598">${ALLCOMPONENTS.elements.art598.width} x ${ALLCOMPONENTS.elements.art598.depth} cm ${ALLCOMPONENTS.elements.art598.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art860" id="art860">
                        <label class="form-check-label" for="art860">${ALLCOMPONENTS.elements.art860.width} x ${ALLCOMPONENTS.elements.art860.depth} cm ${ALLCOMPONENTS.elements.art860.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">5 zits hoekbanken</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5310" id="art5310">
                        <label class="form-check-label" for="art5310">${ALLCOMPONENTS.elements.art5310.width} x ${ALLCOMPONENTS.elements.art5310.depth} cm ${ALLCOMPONENTS.elements.art5310.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5314" id="art5314">
                        <label class="form-check-label" for="art5314">${ALLCOMPONENTS.elements.art5314.width} x ${ALLCOMPONENTS.elements.art5314.depth} cm ${ALLCOMPONENTS.elements.art5314.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">5,5 zits hoekbanken</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5311" id="art5311">
                        <label class="form-check-label" for="art5311">${ALLCOMPONENTS.elements.art5311.width} x ${ALLCOMPONENTS.elements.art5311.depth} cm ${ALLCOMPONENTS.elements.art5311.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5316" id="art5316">
                        <label class="form-check-label" for="art5316">${ALLCOMPONENTS.elements.art5316.width} x ${ALLCOMPONENTS.elements.art5316.depth} cm ${ALLCOMPONENTS.elements.art5316.name}</label>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5312" id="art5312">
                        <label class="form-check-label" for="art5312">${ALLCOMPONENTS.elements.art5312.width} x ${ALLCOMPONENTS.elements.art5312.depth} cm ${ALLCOMPONENTS.elements.art5312.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5315" id="art5315">
                        <label class="form-check-label" for="art5315">${ALLCOMPONENTS.elements.art5315.width} x ${ALLCOMPONENTS.elements.art5315.depth} cm ${ALLCOMPONENTS.elements.art5315.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">6 zits hoekbanken</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5313" id="art5313">
                        <label class="form-check-label" for="art5313">${ALLCOMPONENTS.elements.art5313.width} x ${ALLCOMPONENTS.elements.art5313.depth} cm ${ALLCOMPONENTS.elements.art5313.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art5317" id="art5317">
                        <label class="form-check-label" for="art5317">${ALLCOMPONENTS.elements.art5317.width} x ${ALLCOMPONENTS.elements.art5317.depth} cm ${ALLCOMPONENTS.elements.art5317.name}</label>
                    </div>
                </div>
            </div>

            <div class="fst-italic mt-3 mb-2">recamieres</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art6093" id="art6093">
                        <label class="form-check-label" for="art6093">${ALLCOMPONENTS.elements.art6093.width} x ${ALLCOMPONENTS.elements.art6093.depth} cm ${ALLCOMPONENTS.elements.art6093.name}</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art6091" id="art6091">
                        <label class="form-check-label" for="art6091">${ALLCOMPONENTS.elements.art6091.width} x ${ALLCOMPONENTS.elements.art6091.depth} cm ${ALLCOMPONENTS.elements.art6091.name}</label>
                    </div>
                </div> 
            </div>
            <!--
            <div class="fst-italic mt-3 mb-2">voetenbank</div>
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="type" value="art9085110" id="art9085110">
                        <label class="form-check-label" for="art9085110">${ALLCOMPONENTS.elements.art9085110.width} x ${ALLCOMPONENTS.elements.art9085110.depth} cm ${ALLCOMPONENTS.elements.art9085110.name}</label>
                    </div>
                </div>
            </div>
            -->

        </div>`
    };

    accordions.options = {
        title: "opties",
        options: ['seatHeight', 'duotone', 'footstool'],
        display: "d-block",
        code: /*html*/`
        <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
            <div class="d-flex justify-content-start m-0 p-0">
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="fst-italic">zithoogte:</div>
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="seatHeight" value="44" id="seatHeight_44">
                        <label class="form-check-label" for="seatHeight_44">44 cm</label>
                    </div>
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="seatHeight" value="47" id="seatHeight_47">
                        <label class="form-check-label" for="seatHeight_47">47 cm</label>
                    </div>
                </div>
                <div class="card border-0 grid gap row-gap-3 me-5">
                <div class="fst-italic">duotone:</div>
                    <div class="h6 fw-normal form-check form-switch">
                    <input type="checkbox" class="form-check-input" name="duotone" id="duotone">
                   <!-- <label class="form-check-label" for="duotone"></label>-->
                </div>
            </div>
                <!--
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="fst-italic">poten:</div>
                        <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="legoption" value="legsStraight" id="legsStraight">
                        <label class="form-check-label" for="legsStraight">rechte poten</label>
                    </div>
                    <div class="h6 fw-normal form-check">
                        <input type="radio" class="form-check-input" name="legoption" value="legsBent" id="legsBent">
                        <label class="form-check-label" for="legsBent">gebogen poten</label>
                    </div>
                </div>
                -->
                <div class="card border-0 grid gap row-gap-3 me-5">
                    <div class="fst-italic">voetenbank:</div>
                        <div class="h6 fw-normal form-check form-switch">
                        <input type="checkbox" class="form-check-input" name="footstool" id="footstool">
                    </div>
                </div>
             
               
            </div>
        </div>`

    }
    accordions.upholstery = {
        title: "bekleding",
        options: [`color`],
        display: "d-block",
        code: /*html*/`
                <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
                <!--
                    <div>
                        <div class="h6 fw-normal">categorie</div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_2" value="2">
                            <label class="form-check-label" for="upholsteriesCategory_2">2</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_3" value="3">
                            <label class="form-check-label" for="upholsteriesCategory_3">3</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_4" value="4">
                            <label class="form-check-label" for="upholsteriesCategory_4">4</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_5" value="5">
                            <label class="form-check-label" for="upholsteriesCategory_5">5</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_6" value="6">
                            <label class="form-check-label" for="upholsteriesCategory_6">6</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_7" value="7">
                            <label class="form-check-label" for="upholsteriesCategory_7">7</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_8" value="8">
                            <label class="form-check-label" for="upholsteriesCategory_8">8</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesCategory" id="upholsteriesCategory_9" value="9">
                            <label class="form-check-label" for="upholsteriesCategory_9">9</label>
                        </div>
                    </div>
                    -->
                    <div class="h6 fw-normal">stofgroep adore</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesAdorePicker" class="m-0 p-0"></div>
                    </div>
                    <div class="h6 fw-normal">stofgroep dream</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesDreamPicker" class="m-0 p-0"></div>
                    </div>
                    <div class="h6 fw-normal">stofgroep essa</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesEssaPicker" class="m-0 p-0"></div>
                    </div>
                </div>`,
        "onload": function () {
            let containerElemsAdoreUpholsteries = document.getElementById(`upholsteriesAdorePicker`);
            addTextures(`upholsteryColors`, 'adore', ALLCOLORS.upholsteries, containerElemsAdoreUpholsteries);

            let containerElemsDreamUpholsteries = document.getElementById(`upholsteriesDreamPicker`);
            addTextures(`upholsteryColors`, 'dream', ALLCOLORS.upholsteries, containerElemsDreamUpholsteries);

            let containerElemsEssaUpholsteries = document.getElementById(`upholsteriesEssaPicker`);
            addTextures(`upholsteryColors`, 'essa', ALLCOLORS.upholsteries, containerElemsEssaUpholsteries);
        }
    }
    if (model.upholsteryDuotone) {
        accordions.upholsteryDuotone = {
            title: "bekleding rug",
            options: [`colorDuotone`],
            display: "d-block",
            code: /*html*/`
                <div class="row m-0 p-0 pb-xxl-4 pb-xl-4 pb-3">
                <!--
                    <div>
                        <div class="h6 fw-normal">categorie</div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_2" value="2">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_2">2</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_3" value="3">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_3">3</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_4" value="4">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_4">4</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_5" value="5">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_5">5</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_6" value="6">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_6">6</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_7" value="7">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_7">7</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_8" value="8">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_8">8</label>
                        </div>
                        <div class="h6 fw-normal form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="upholsteriesDuotoneCategory" id="upholsteriesDuotoneCategory_9" value="9">
                            <label class="form-check-label" for="upholsteriesDuotoneCategory_9">9</label>
                        </div>
                    </div>
                    -->
                    <div class="h6 fw-normal">stofgroep adore</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesDuotoneAdorePicker" class="m-0 p-0"></div>
                    </div>
                    <div class="h6 fw-normal">stofgroep dream</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesDuotoneDreamPicker" class="m-0 p-0"></div>
                    </div>
                    <div class="h6 fw-normal">stofgroep essa</div>
                    <div class="col-12 m-0 p-0">
                        <div id="upholsteriesDuotoneEssaPicker" class="m-0 p-0"></div>
                    </div>
                </div>`,
            "onload": function () {
                let containerElemsDuotoneAdoreUpholsteries = document.getElementById(`upholsteriesDuotoneAdorePicker`);
                addTextures(`upholsteryDuotoneColors`, 'adore', ALLCOLORS.upholsteries, containerElemsDuotoneAdoreUpholsteries);

                let containerElemsDuotoneDreamUpholsteries = document.getElementById(`upholsteriesDuotoneDreamPicker`);
                addTextures(`upholsteryDuotoneColors`, 'dream', ALLCOLORS.upholsteries, containerElemsDuotoneDreamUpholsteries);

                let containerElemsDuotoneEssaUpholsteries = document.getElementById(`upholsteriesDuotoneEssaPicker`);
                addTextures(`upholsteryDuotoneColors`, 'essa', ALLCOLORS.upholsteries, containerElemsDuotoneEssaUpholsteries);
            }
        }
    }


    return { accordions };
}