"use strict"
function addColors(name, colorType, colorScheme, containerElem) {
    // Voeg een uniek nummer toe aan elk item in de colorScheme
    let textureItemsWithIndex = colorScheme.map((item, index) => ({
        ...item,
        uniqueId: `${name}Index_${index}` // Voeg een uniek ID toe aan elk item
    }));

    // Filter de items op colorType als dat nodig is
    const filteredItems = textureItemsWithIndex.filter(item => item.colorType === colorType);

    // Als er geen items gevonden worden, geef een bericht weer
    if (filteredItems.length === 0) {
        containerElem.innerHTML = `<p>No items found for colorType: ${colorType}</p>`;
        return;
    }

    // HTML array voor het opbouwen van de inhoud
    const html = [];
    html.push( /*html*/ `
        <div class="row row-cols-auto m-0 p-0">
    `);

    // Loop door de gefilterde items en voeg de HTML toe
    filteredItems.forEach((item) => {
        // Gebruik het unieke ID dat we aan elk item hebben toegevoegd
        const uniqueId = item.uniqueId;

        html.push( /*html*/ `
            <div class="col d-flex align-items-center m-0 p-1 colorTitle" style="aspect-ratio: 1">
                <img id="${uniqueId}" style="background-color: #${item.colorHex}; width: 50px;" src="img/transparant.png" class="rounded-pill img-fluid mx-auto p-0 border    border-5    colorButton ${name}_colorButton" alt="${item.colorName}">
            </div>
        `);
    });

    html.push( /*html*/ `
        </div>
    `);

    // Zet de HTML content in het container element
    containerElem.innerHTML = html.join('\n');
}

function addTextures(name, colorType, colorScheme, containerElem) {
    // Voeg een uniek nummer toe aan elk item in de colorScheme
    let textureItemsWithIndex = colorScheme.map((item, index) => ({
        ...item,
        uniqueId: `${name}Index_${index}` // Voeg een uniek ID toe aan elk item
    }));

    // Filter de items op colorType als dat nodig is
    const filteredItems = textureItemsWithIndex.filter(item => item.colorType === colorType);

    // Als er geen items gevonden worden, geef een bericht weer
    if (filteredItems.length === 0) {
        containerElem.innerHTML = `<p>No items found for colorType: ${colorType}</p>`;
        return;
    }

    // HTML array voor het opbouwen van de inhoud
    const html = [];
    html.push( /*html*/ `
        <div class="row row-cols-auto m-0 p-0">
    `);

    // Loop door de gefilterde items en voeg de HTML toe
    filteredItems.forEach((item) => {
        // Gebruik het unieke ID dat we aan elk item hebben toegevoegd
        const uniqueId = item.uniqueId;

        html.push( /*html*/ `
            <div class="col d-flex align-items-center m-0 p-1" style="aspect-ratio: 1">
                <img id="${uniqueId}" style="background-color: #${item.colorHex}; width: 50px;" src="${item.colorPathThumb}" class="rounded-pill img-fluid mx-auto p-0 border border-5 colorButton ${name}_colorButton" alt="${item.colorName}">
            </div>
        `);
    });

    html.push( /*html*/ `
        </div>
    `);

    // Zet de HTML content in het container element
    containerElem.innerHTML = html.join('\n');
}

function showSelected(displayTitle) {
    let accordionButton = document.getElementsByClassName('accordion-button');
    let accordionText = document.getElementsByClassName('accordion-text');
    let accordionBody = document.getElementsByClassName('accordion-body');

    for (var i = 0; i < accordionButton.length; i++) {
        if (accordionButton[i].getAttribute('aria-expanded') == "true") {
            if (displayTitle == true) {
                accordionText[i].classList.remove('d-none');
                accordionText[i].classList.add('d-block');
            } else {
                accordionText[i].classList.remove('d-block');
                accordionText[i].classList.add('d-none');
            }
            accordionBody[i].classList.remove('invisible');
            accordionBody[i].classList.add('visible');
        }
        if (accordionButton[i].getAttribute('aria-expanded') == "false") {
            accordionText[i].style.visibility = 'visible';
            accordionText[i].classList.add('d-block');
            accordionText[i].classList.remove('d-none');
            accordionBody[i].classList.add('invisible');
            accordionBody[i].classList.remove('visible');
        }
    }

    // comment out if DECOR is not applicable
    /*
    let accordionButtonDecor = document.getElementById('collapse-check-decor');
    toggleDecor(accordionButtonDecor.getAttribute('aria-expanded'));
    */
    // comment out if RADIOBUTTON is not applicable
    /*
    //let accordionButtonComponent = document.getElementById('collapse-check-selectedComponent');
    let accordionButtonComponentColor = document.getElementById('collapse-check-selectedComponentColor');
    //if (accordionButtonComponent.getAttribute('aria-expanded') == 'true' || accordionButtonComponentColor.getAttribute('aria-expanded') == 'true') {
    if (accordionButtonComponentColor.getAttribute('aria-expanded') == 'true') {
        toggleRadioButtons('true');
    } else {
        toggleRadioButtons('false');
    }
    */
    // comment out if SIZINGBUTTONS are not applicable
    /*
    let accordionButtonWidth = document.getElementById('collapse-check-width');
    if (accordionButtonWidth.getAttribute('aria-expanded') == 'true') {
        toggleSizingButtons('true');
    } else {
        toggleSizingButtons('false');
    }
    */
}

function controlPanel_updateLayer(name, settings) {
    const accordion = settings.accordions[name];

    let html = [];
    const onloadFuncs = [];
    const titleElemId = `collapse-check-${name}`;
    html.push( /*html*/ `
    <div class="col-12 d-xxl-flex d-xl-flex justify-content-start">
    `);
    html.push( /*html*/ `
        <div class="col-xxl-4 col-xl-4 col-12 h6 fw-medium m-0 p-0 py-xxl-4 py-xl-4 pt-3 pb-1">${accordion.title}</div>
        `);
    html.push( /*html*/ `
            <div id="${name}Text" class="col-xxl-6 col-xl-6 col-12 h6 fw-medium m-0 p-0 my-xxl-auto my-xl-auto mb-3 accordion-text fadein">
            `);
    for (let i = 0; i < accordion.options.length; i++) {
        html.push( /*html*/ `
            <span id="${accordion.options[i]}Text">#</span>
            `);
        if (i === 1) { continue; }
        html.push( /*html*/ `
            &nbsp;&nbsp;&nbsp;&nbsp;
            `);
    }
    html.push( /*html*/ `
        </div>
    </div>
    `);
    document.getElementById(titleElemId).innerHTML = html.join('\n');
    html = [];
    const bodyElemId = `body-${name}`;
    html.push( /*html*/ `
        <div class="accordion-body m-0 p-0">
          ${accordion.code}
    `);
    if (accordion.onload) onloadFuncs.push(accordion.onload);
    html.push( /*html*/ `
        </div>
    `);
    document.getElementById(bodyElemId).innerHTML = html.join('\n');
    for (let func of onloadFuncs) {
        func();
    }
}

function controlPanel_addLayer(name, settings, collapsed) {
    const accordion = settings.accordions[name];
    if (accordion.collapsible == false) {
        collapsed = false;
    }
    var collapse = collapsed ? '' : 'show';
    var accordionElem = document.getElementById('accordion');
    accordionElem.innerHTML +=
    /*html*/ ` 
        <div id="show${name[0].toUpperCase()}${name.slice(1)}" class="accordion-item m-0 p-0 shadow-none border border-0 border-top border-dark ${accordion.display}">
            <div id="collapse-check-${name}" class="m-0 p-0      shadow-none accordion-button  ${collapsed ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#body-${name}" aria-expanded="${!collapsed}" aria-controls="${name}" onclick="showSelected(${accordion.displayTitle});"></div>
            <div id="body-${name}" class="m-0 p-0 accordion-collapse collapse ${collapse}" aria-labelledby="body-${name}" data-bs-parent="#accordion"></div>
        </div>`
    controlPanel_updateLayer(name, settings);
    if (accordion.collapsible == false) {
        showSelected(false);
    }
}

function controlPanel(settings, allModels, containerElem, expandedLayer) {
    const html = [];
    if (uap.getDevice().type != 'mobile' || uap.getDevice().type != 'tablet' || uap.getDevice().withFeatureCheck().type != 'tablet') {
        html.push( /*html*/ `
    <div class="row m-0 p-0">
        <div id="featuredModels" class="text-nowrap carousel slide border-top border-1 border-dark m-0 p-0    py-3" data-bs-theme="dark">
            `);
    } else {
        html.push( /*html*/ `
            <div class="row m-0 p-0">
                <div id="featuredModels" class="text-nowrap carousel slide border-dark m-0 p-0   pb-3" data-bs-theme="dark">
                    `);
    }
    if (allModels.length > 4) {
        html.push( /*html*/ `
        <div class="d-flex justify-content-center">
                <button class="carousel-control-prev text-start d-block" type="button" data-bs-target="#featuredModels" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                 `);
    } else if (uap.getDevice().type === 'mobile' || uap.getDevice().type === 'tablet' || uap.getDevice().withFeatureCheck().type === 'tablet') {
        html.push( /*html*/ `
        <div class="d-flex justify-content-center">
                 `);
    } else {
        html.push( /*html*/ `
        <div class="d-flex justify-content-start">
        `);
    }
    html.push( /*html*/ `
                <!-- images -->
                <div class="col-10">
                    <div class="carousel-inner">
                        <div id="slide-1" class="carousel-item active">
                            <div class="container p-0 m-0 text-center">
                                <div class="row gx-3">
                                `);
    let slideNumber = 1;
    for (let i = 0; i < allModels.length; i++) {
        let imageNumber = i + 1;
        if (imageNumber % 4 == 0) {
            html.push( /*html*/ `
                                        <div class="col-3">
                                            <img id="${allModels[i].id}" src="${allModels[i].image}" class="btn rounded-0 img-fluid m-0 p-0" alt="${allModels[i].name}" onclick="showFeaturedModelByIndex(${i}); setCarouselActive('slide-${slideNumber}'); showSelected(false); //toggleDecor('false');">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `);
            slideNumber++;
            html.push( /*html*/ `
                            <div id="slide-${slideNumber}" class="carousel-item">
                                <div class="container p-0 m-0 text-center">
                                    <div class="row gx-3">
                                    `);

        } else {
            html.push( /*html*/ `
                                        <div class="col-3">
                                            <img id="${allModels[i].id}" src="${allModels[i].image}" class="btn rounded-0 img-fluid m-0 p-0" alt="${allModels[i].name}" onclick="showFeaturedModelByIndex(${i}); setCarouselActive('slide-${slideNumber}'); showSelected(false); //toggleDecor('false');">
                                        </div>
                                    `);
        }
    }
    html.push( /*html*/ `
                            </div>
                        </div>
                    </div>
                </div>
                `);
    if (allModels.length > 4) {
        html.push( /*html*/ `
                <button class="carousel-control-next text-end d-block" type="button" data-bs-target="#featuredModels" data-bs-slide="next">
                    <div class="carousel-control-next-icon " aria-hidden="true"></div>
                    <div class="visually-hidden">Next</div>
                </button>
                `);
    }
    html.push( /*html*/ `
            </div>
        </div>

    </div>
    `);
    //}
    html.push( /*html*/ `
    <div id="accordion" class="m-0 p-0 accordion accordion-flush open"></div>  
    `);

    containerElem.innerHTML = html.join('\n');

    for (const name in settings["accordions"]) {
        controlPanel_addLayer(name, settings, !(expandedLayer && name == expandedLayer));
    }
}

function setCarouselActive(slide) {
    let slide1 = document.getElementById("slide-1");
    let slide2 = document.getElementById("slide-2");

    if (slide == "slide-1") {
        slide1.classList.add("active");
        if (slide2) {
            slide2.classList.remove("active");
        }
    }
    if (slide == "slide-2") {
        slide1.classList.remove("active");
        slide2.classList.add("active");
    }
}



