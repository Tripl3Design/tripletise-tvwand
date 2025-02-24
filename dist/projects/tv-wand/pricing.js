//price & articleList
function pricing(model) {
    let totalPrice = 0;

    const pricegroup = model.upholstery.pricegroup;
    let price = ALLCOMPONENTS.elements[model.type].prices[pricegroup];

    if (model.upholsteryDuotone != null && model.type != 'art9085110') {
        let additionalPrice = ALLCOMPONENTS.elements[model.type].prices.A18.fabric;
        totalPrice += additionalPrice;
    }

    if (model.footstool == true) {
        let footstoolPrice = ALLCOMPONENTS.elements.art9085110.prices[pricegroup];
        totalPrice += footstoolPrice;
    }

    totalPrice += price;

    // Calculate 10% off
    let discountedPrice = totalPrice * 0.9;

    // Globale variabelen om prijs en model op te slaan
    currentModel = model;
    currentTotalPrice = discountedPrice.toFixed(0);

    const addToCartButton = document.getElementById('add-to-cart-button');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', handleAddToCartClick, { once: true });
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
                    <span id="totalPrice" class="discounted-price">€ ${discountedPrice.toFixed(0)},-</span>
                </div>
            `;
        } else {
            priceHTML = `
                <div class="h5 fw-bold">
                  <span>van </span>
                  <span>van </span>
                    <span class="original-price" style="color: black;">€ ${totalPrice.toFixed(0)} ,- voor </span>
                    <span id="totalPrice" class="discounted-price">€ ${discountedPrice.toFixed(0)},-</span>
                </div>
            `;
        }

        // Insert the price HTML into the price element
        priceElement.innerHTML = priceHTML;
    }

    // CSS voor diagonale streep toevoegen
    const originalPriceElement = document.querySelector('.original-price');
    const originalPriceElementMobile = document.querySelector('.original-price-mobile');
    if (originalPriceElement) {
        // Voeg de diagonale streep toe met behulp van een pseudo-element
        originalPriceElement.style.display = 'inline-block';
        originalPriceElement.style.position = 'relative';

        // Pseudo-element voor diagonale streep
        const style = document.createElement('style');
        style.innerHTML = `
            .original-price::after {
                content: '';
                position: absolute;
                top: 10px;
                right: 65px;
                width: 50%;
                height: 100%;
                border-top: 2px solid red;
                transform: rotate(-10deg); /* Dit maakt de streep diagonaal */
                transform-origin: 80 -80; /* Zorgt ervoor dat de streep vanuit de linkerbovenhoek komt */
            }
        `;
        document.head.appendChild(style);
    } else {
        // Voeg de diagonale streep toe met behulp van een pseudo-element
        originalPriceElementMobile.style.display = 'inline-block';
        originalPriceElementMobile.style.position = 'relative';

        // Pseudo-element voor diagonale streep
        const style = document.createElement('style');
        style.innerHTML = `
            .original-price-mobile::after {
                content: '';
                position: absolute;
                top: 10px;
                right: 10px;
                width: 80%;
                height: 100%;
                border-top: 2px solid red;
                transform: rotate(-10deg); /* Dit maakt de streep diagonaal */
                transform-origin: 80 -80; /* Zorgt ervoor dat de streep vanuit de linkerbovenhoek komt */
            }
        `;
        document.head.appendChild(style);
    }
}

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

