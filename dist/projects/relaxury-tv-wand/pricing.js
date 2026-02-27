

// Global variables to store current state
let currentModel = {};
let currentTotalPrice = "0";

//price & articleList
function pricing(model) {
    let totalPrice = 0;

    totalPrice = ((model.width - 150) * 5) + ((model.height - 200) * 5) + ((model.depth - 20) * 5) + 1000 //tv-wand kost € 1000 plus €5 per cm voor elke extra lengte, breedte, hoogte cm
        + (model.tvMount ? 250 : 0)  // tv-beugel kost €250
        + (model.hatchLeft ? 100 : 0) // luikje links kost €100
        + (model.hatchRight ? 100 : 0) // luikje rechts kost €100
        + (model.soundbar?.active ? 120 : 0)  // soundbar kost €120, tv gat is gratis
        + (model.alcove?.left?.width ? (model.alcove.left.width - 50) * 30 : 0) //vakkenkast kost € 800 plus €15 per cm aan elke kant
        + (model.alcove?.left?.shelves ? model.alcove.left.shelves * 60 : 0) //plank kost €30 per stuk
        + (model.alcove?.left?.spots ? (model.alcove.left.shelves * 80) + 180 + 80 : 0) //vakkenkast kost € 800 plus €15 per cm aan elke kant
        + (model.fireplace ? model.fireplace.price : 0)
        ;

    if (isNaN(totalPrice)) {
        console.error("Fout: Prijsberekening resulteerde in NaN. Controleer of alle model-eigenschappen (width, height, etc.) aanwezig zijn.", model);
        totalPrice = 0;
    }

    currentModel = model;
    currentTotalPrice = totalPrice.toFixed(0);

    const addToCartButton = document.getElementById('add-to-cart-button');
    if (addToCartButton) {
        // Use onclick to prevent stacking listeners if pricing() is called multiple times
        addToCartButton.onclick = handleAddToCartClickTest;
    } else {
        console.error("Element met ID 'add-to-cart-button' niet gevonden!");
    }

    const priceElement = document.querySelector('.productInfoPrice');
    if (priceElement) {
        // If device is mobile, add the shopping cart icon
        if (windowHeight > windowWidth && (uap.getDevice().type === 'mobile' || uap.getDevice().type === 'tablet' || uap.getDevice().withFeatureCheck().type === 'tablet')) {
            priceHTML = `
                <div">
                    <!--<span class="material-symbols-outlined align-middle">shopping_cart</span>-->
                    <span>bestel &nbsp;&nbsp;</span>
                    <span class="original-price-mobile" style="">€ ${totalPrice.toFixed(0)},-&nbsp;&nbsp;</span>
                </div>
            `;
        } else {
            priceHTML = `
                <div class="h5 fw-bold">
                    <span class="original-price" style="color: black;">€ ${totalPrice.toFixed(0)},-</span>
                </div>
            `;
        }

        priceElement.innerHTML = priceHTML;
    }
}

async function handleAddToCartClickTest() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";

    let screenshot = null;
    if (window.mainModule && typeof window.mainModule.captureScreenshot === 'function') {
        const { dataURL } = window.mainModule.captureScreenshot();
        screenshot = dataURL;
    }

    let configUrl = null;
    let fsid = null;
    if (typeof window.saveConfiguration === 'function') {
        configUrl = await window.saveConfiguration(currentModel);
        if (configUrl) {
            try {
                const url = new URL(configUrl);
                fsid = url.searchParams.get("fsid");
            } catch (e) {
                console.error("Kon fsid niet uit de configuratie-URL halen:", e);
            }
        }
    }

    let pdfDataUrl = null;
    // Generate PDF if we have the necessary data
    if (fsid && screenshot && typeof generatePdfDataUrl === 'function') {
        // The 'title' variable is globally available from index.html/search.js
        pdfDataUrl = await generatePdfDataUrl(currentModel, screenshot, title, fsid);
    }

    sendConfigurationToWooCommerce(currentModel, currentTotalPrice, screenshot, configUrl, pdfDataUrl);
}

function flattenConfigForWooCommerce(model) {
    const flatConfig = {};

    // Basic properties
    flatConfig['Breedte'] = `${model.width} cm`;
    flatConfig['Hoogte'] = `${model.height} cm`;
    flatConfig['Diepte'] = `${model.depth} cm`;
    flatConfig['TV Formaat'] = `${model.tvSize} inch`;

    // Color
    //if (model.color) {
    //    flatConfig['Kleur (impressie)'] = `${model.color.name} (${model.color.ral})`;
    //}

    // TV Mount
    flatConfig['TV beugel'] = model.tvMount ? 'Ja' : 'Nee';

    // Soundbar
    flatConfig['Uitsparing soundbar'] = model.soundbar?.active ? `Ja ${model.soundbar.text ? '(voor: ' + model.soundbar.text + ')' : ''}`.trim() : 'Nee';

    // Fireplace
    flatConfig['Sfeerhaard'] = model.fireplace ? `${model.fireplace.brand} ${model.fireplace.type}` : 'Nee';

    // Alcove
    flatConfig['Vakkenkasten'] = model.alcove ? `Ja, ${model.alcove.left.width} cm breed` : 'Nee';
    if (model.alcove) {
        flatConfig['Aantal planken per kast'] = model.alcove.left.shelves;
        flatConfig['Spots in vakkenkasten'] = model.alcove.left.spots ? 'Ja' : 'Nee';
    }

    // Hatches
    if (!model.alcove) { // Hatches are disabled if alcove is active
        flatConfig['Luikje links'] = model.hatchLeft ? 'Ja' : 'Nee';
        flatConfig['Luikje rechts'] = model.hatchRight ? 'Ja' : 'Nee';
    }

    return flatConfig;
}

async function sendConfigurationToWooCommerce(config, price, image, configUrl, pdf) {
    const endpoint = "https://createcheckoutsession-5x73s65jta-uc.a.run.app";
    const loader = document.getElementById("loader");

    try {
        const displayConfig = flattenConfigForWooCommerce(config);
        console.log("Versturen naar WooCommerce (platte data):", { price, config: displayConfig });

        const body = {
            price: parseFloat(price),
            config: displayConfig,
            image: image,
            configuration_url: configUrl,
            pdf: pdf
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server gaf status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.checkout_url) {
            // Stuur de hele pagina (parent) door naar de checkout.
            // Dit sluit effectief de configurator (iframe/modal) en navigeert de shop naar de checkout.
            window.parent.location.href = data.checkout_url;

            if (loader) loader.style.display = "none";
        } else {
            console.error("Fout: checkout_url niet gevonden in response:", data);
            alert("Er ging iets mis bij het verwerken van je configuratie.");
            if (loader) loader.style.display = "none";
        }
    } catch (err) {
        console.error("Verbinding mislukt:", err);
        alert("Er is een netwerkfout opgetreden. Controleer de console voor details.");
        if (loader) loader.style.display = "none";
    }
}
