

//price & articleList
function pricing(model) {
    let totalPrice = 0;

    totalPrice = ((model.width - 150) * 5) + ((model.height - 200) * 5) + ((model.depth - 20) * 5) + 1000 //tv-wand kost € 1000 plus €5 per cm voor elke extra lengte, breedte, hoogte cm
        + (model.soundbar ? 120 : 0)  // soundbar kost €120, tv gat is gratis
        + (model.alcove?.left?.width ? (model.alcove.left.width - 50) * 30 : 0) //vakkenkast kost € 800 plus €15 per cm aan elke kant
        + (model.alcove?.left?.shelves ? model.alcove.left.shelves * 60 : 0) //plank kost €30 per stuk
        + (model.alcove?.left?.spots ? (model.alcove.left.shelves * 80) + 180 + 80 : 0) //vakkenkast kost € 800 plus €15 per cm aan elke kant
        + (model.fireplace ? model.fireplace.price : 0)
        ;

    // Globale variabelen om prijs en model op te slaan
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

        // Insert the price HTML into the price element
        priceElement.innerHTML = priceHTML;
    }
}





/*
function handleAddToCartClick() {
    const { dataURL, blob } = mainModule.captureScreenshot();
    const product = {
        model: currentModel,
        price: currentTotalPrice,
        imageUrl: dataURL
    };

    parent.postMessage({ action: 'showSidebar' }, '*');
    parent.postMessage({ action: 'addToCart', product: product }, '*');
    parent.postMessage({ action: 'showCheckoutButton' }, '*');

    document.getElementById('add-to-cart-button').removeEventListener('click', handleAddToCartClick);

    
}
*/

function handleAddToCartClickTest() {
    const afmeting = `${((+currentModel.alcove?.left?.width || 0) + (+currentModel.alcove?.right?.width || 0) + (+currentModel.width || 0))} x ${+currentModel.height || 0} x ${+currentModel.depth || 0} cm`;
    document.getElementById('sizesText').textContent = afmeting;

    const soundbarOption = document.getElementById('soundbarText')?.textContent || 'geen soundbar';
    const alcoveOption = document.getElementById('alcoveText')?.textContent || 'geen vakkenkast';
    const fireplaceOption = document.getElementById('fireplaceText')?.textContent || 'geen sfeerhaard';
     
    const config = {
        afmeting: afmeting,
        tvmaat: currentModel.tvSize + ' inch tv',
        soundbar: soundbarOption,
        vakkenkasten: alcoveOption,
        sfeerhaard: fireplaceOption,
        kleur: currentModel.color.name,
        prijs: currentTotalPrice
    };

   /*
    const { dataURL, blob } = mainModule.captureScreenshot();
        const config = {
            name
            maat: document.getElementById('sizesText').textContent = `${((+currentModel.alcove?.left?.width || 0) + (+currentModel.alcove?.right?.width || 0) + (+currentModel.width || 0))} x ${+currentModel.height || 0} x ${+currentModel.depth || 0} cm`,
            kleur: currentModel.color.name,
            motief: 'leuk',
            prijs: currentTotalPrice,
            thumbnail: dataURL
        };
    
    */document.getElementById('add-to-cart-button').removeEventListener('click', stuurConfiguratieNaarWooCommerce(config));
}

async function stuurConfiguratieNaarWooCommerce(config, product_id = 397, domein = "https://veiligheidshesjekopen.nl") {
    try {
        const response = await fetch(`${domein}/wp-json/tvwand/v1/generate-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ product_id, config })
        });

        if (!response.ok) {
            throw new Error(`Server gaf status ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error("Fout bij parsen van JSON:", parseError);
            alert("Ongeldige serverrespons ontvangen.");
            return;
        }

        if (data.url) {
            // Open in nieuw tabblad
            window.open(data.url, "_blank");
        } else {
            console.error("Fout bij genereren URL:", data);
            alert("Er ging iets mis bij het verwerken van je configuratie.");
        }
    } catch (err) {
        console.error("Verbinding mislukt:", err);
        alert("Er is een netwerkfout opgetreden.");
    }
}

