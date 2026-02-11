

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

    currentModel = model;
    currentTotalPrice = totalPrice.toFixed(0);

    const addToCartButton = document.getElementById('add-to-cart-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', handleAddToCartClickTest, { once: true });
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

function handleAddToCartClickTest() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";

    const totalWidth = (+currentModel.alcove?.left?.width || 0) + (+currentModel.alcove?.right?.width || 0) + (+currentModel.width || 0);
    const afmeting = `${totalWidth} x ${+currentModel.height || 0} x ${+currentModel.depth || 0} cm`;

    const soundbarOption = currentModel.soundbar?.active
        ? 'Ja' + (currentModel.soundbar.text ? ` (${currentModel.soundbar.text})` : '')
        : 'Nee';

    let alcoveDetails = 'Nee';
    if (currentModel.alcove) {
        alcoveDetails = `Ja, breedte: ${currentModel.alcove.left.width} cm, planken: ${currentModel.alcove.left.shelves || '0'}, spots: ${currentModel.alcove.left.spots ? 'Ja' : 'Nee'}`;
    }

    const fireplaceOption = currentModel.fireplace ? `${currentModel.fireplace.brand} ${currentModel.fireplace.type}` : 'Nee';

    const config = {
        'Afmeting': afmeting,
        'TV-maat': currentModel.tvSize + ' inch',
        'TV-beugel': currentModel.tvMount ? 'Ja' : 'Nee',
        'Uitsparing soundbar': soundbarOption,
        'Vakkenkasten': alcoveDetails,
        'Luikje links': currentModel.hatchLeft ? 'Ja' : 'Nee',
        'Luikje rechts': currentModel.hatchRight ? 'Ja' : 'Nee',
        'Sfeerhaard': fireplaceOption,
        'Kleur (impressie)': `${currentModel.color.name} (${currentModel.color.ral})`
    };

    sendConfigurationToWooCommerce(config, currentTotalPrice);
}

async function createHmacSha256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await window.crypto.subtle.sign("HMAC", key, messageData);

    return Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function sendConfigurationToWooCommerce(config, price) {
    const endpoint = "https://iom-develop.nl/tvwand/wp-json/tvwand/v2/session";
    const secretKey = "7uN$e48pX@aQ!39k2R";
    const productId = 713;
    const loader = document.getElementById("loader");

    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const body = {
            product_id: productId,
            price: parseFloat(price),
            config: config
        };
        const rawJsonBody = JSON.stringify(body);

        const canonicalString = `${timestamp}\n${nonce}\n${rawJsonBody}`;

        const signature = await createHmacSha256(canonicalString, secretKey);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-TVWAND-Timestamp": timestamp,
                "X-TVWAND-Nonce": nonce,
                "X-TVWAND-Signature": signature
            },
            body: rawJsonBody
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server gaf status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.checkout_url) {
            window.location.href = data.checkout_url;
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
