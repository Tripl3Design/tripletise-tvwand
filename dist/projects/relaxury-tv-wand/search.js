"use strict";

const brand = 'relaxury';
const product = 'tv-wand';
const title = 'Stel je tv wand samen';

var ALLCOLORS;
var ALLCOMPONENTS;

var pricing = document.createElement('script');
pricing.src = `https://${brand}-${product}.web.app/projects/${brand}-${product}/pricing.js`;
document.head.appendChild(pricing);

async function showSearchImages(modelFromSearch) {
    const widths = [
        { "width": 37, "type": "cabinet" },
        { "width": 55, "type": "cabinet" },
        { "width": 74, "type": "cabinet" },
        { "width": 156, "type": "sideboard" },
        { "width": 156, "type": "sideboardOnFrame" },
        { "width": 156, "type": "sideboardOnFrameTV" },
        { "width": 194, "type": "sideboard" },
        { "width": 194, "type": "sideboardOnFrame" }
    ];
    const filteredWidth = widths.filter(item => item.width >= modelFromSearch.width.min && item.width <= modelFromSearch.width.max);

    const heights = [
        { "height": 75, "type": "sideboard" },
        { "height": 75, "type": "sideboardOnFrame" },
        { "height": 112, "type": "sideboardOnFrameTV" },
        { "height": 170, "type": "cabinet" },
        { "height": 205, "type": "cabinet" },
        { "height": 221, "type": "cabinet" }
    ];
    const filteredHeight = heights.filter(item => item.height >= modelFromSearch.height.min && item.height <= modelFromSearch.height.max);

    let randomType, randomWidthType, randomHeightType, randomWidth, randomHeight;

    const maxAttempts = 20;
    let attempts = 0;

    while (attempts < maxAttempts) {
        document.getElementById('searchTitle').textContent = '';
        if (filteredWidth.length === 0 || filteredHeight.length === 0) {
            console.log('No matching items found.');
            document.getElementById('searchTitle').textContent = 'No matching items found.';
            break;
        }

        const randomWidthIndex = Math.floor(Math.random() * filteredWidth.length);
        const randomWidthItem = filteredWidth[randomWidthIndex];
        randomWidthType = randomWidthItem.type;
        randomWidth = randomWidthItem.width;

        const randomHeightIndex = Math.floor(Math.random() * filteredHeight.length);
        const randomHeightItem = filteredHeight[randomHeightIndex];
        randomHeightType = randomHeightItem.type;
        randomHeight = randomHeightItem.height;

        if (randomWidthType === randomHeightType) {
            randomType = randomWidthType;
            console.log('Types match:', randomType);
            break;
        }
        else if (attempts === maxAttempts) {
            console.log('No matching items found after ' + maxAttempts + ' attempts.');
            document.getElementById('searchTitle').textContent = 'No matching items found.';
            break;
        } else {
            attempts++;
            console.log('Types do not match. Retrying...');
        }
    }

    let randomColorGroupIndex = Math.floor(Math.random() * modelFromSearch.color.length);
    let attemptsForColor = 0;
    const maxAttemptsForColor = modelFromSearch.color.length;
    const chosenColors = [];
    let randomOutsideColor;

    while (attemptsForColor < maxAttemptsForColor) {
        if (!chosenColors.includes(randomColorGroupIndex)) {
            let colorGroup = ALLCOLORS.outsideColors.filter(color => color.colorGroup === modelFromSearch.color[randomColorGroupIndex]);

            if (colorGroup.length > 0) {
                chosenColors.push(randomColorGroupIndex);

                const randomColorInGroupIndex = Math.floor(Math.random() * colorGroup.length);
                const randomColorGroup = colorGroup[randomColorInGroupIndex].colorHex;
                console.log(randomColorInGroupIndex);

                if (randomType === 'cabinet' && colorGroup[randomColorInGroupIndex].colorPath) {
                    randomOutsideColor = {
                        color: randomColorGroup,
                        path: `https://${brand}-${product}.web.app/${colorGroup[randomColorInGroupIndex].colorPath}`,
                        lacquer: "veneer"
                    };
                } else {
                    const nonVeneerColors = colorGroup.filter(color => !color.colorPath);
                    if (nonVeneerColors.length > 0) {
                        const randomColorIndex = Math.floor(Math.random() * nonVeneerColors.length);
                        const randomNonVeneerColor = nonVeneerColors[randomColorIndex];
                        randomOutsideColor = {
                            color: randomNonVeneerColor.colorHex,
                            lacquer: "basic"
                        };
                    }
                }

                console.log("Chosen Color:", randomOutsideColor);

                break;
            }
        }

        randomColorGroupIndex = (randomColorGroupIndex + 1) % modelFromSearch.color.length;
        attemptsForColor++;

        if (attemptsForColor === modelFromSearch.color.length) {
            console.log("No colors available in any color group.");
            document.getElementById('searchTitle').textContent = 'No products available in the choosen color(s)';
            break;
        }
    }

    // get random insideColor
    const insideColorsLength = Math.floor(Math.random() * ALLCOLORS.insideColors.length);
    const randomInsideColorHex = ALLCOLORS.insideColors[insideColorsLength].colorHex;

    // get random interior
    const interiors = ["one", "two", "three"];
    const randomInteriorIndex = Math.floor(Math.random() * interiors.length);
    const randomInterior = interiors[randomInteriorIndex];

    const model = {
        background: { original: "d4d4d4" },
        type: randomType,
        width: randomWidth,
        height: randomHeight,
        winerack: Math.random() < 0.5,
        winerackColor: "outsidecolor",
        shelves: 0,
        interior: randomInterior,
        outsideColor: randomOutsideColor,
        insideColor: { color: randomInsideColorHex },
        rollshutter: Math.floor(Math.random() * (26)) + 75
    }

    UNITY_INSTANCE.SendMessage('Amsterdammer', 'SetAmsterdammer', JSON.stringify(model));
    await generateRenderTexture('search', model);

    const btn = document.querySelector('.goToConfigurator');

    btn.addEventListener('click', (e) => {
        furnitiseModal(`${brand}-${product}.web.app?noDecor&noFeaturedModels&data=${encodeURIComponent(JSON.stringify(model))}`);
    });

    document.querySelector('.productInfoBrand').src = `https://${brand}-${product}.web.app/img/logo_${brand}.svg`;
    document.querySelector('.productInfoFamily').textContent = title;
    document.querySelector('.productInfoType').textContent = model.type.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    pricing(model);
}