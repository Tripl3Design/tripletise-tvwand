function createPdf(model, mainImage, title, fsid) {
    const configuratorUrl = `${document.referrer}?brand=${brand}&product=${product}&fsid=${fsid}`;
    const now = new Date();
    const padToTwoDigits = (number) => (number < 10 ? '0' + number : number);
    // Datum en tijd formatteren als DD-MM-YYYY_HH-MM
    const day = padToTwoDigits(now.getDate());
    const month = padToTwoDigits(now.getMonth() + 1); // Maanden zijn 0-indexed
    const year = now.getFullYear();
    const hours = padToTwoDigits(now.getHours());
    const minutes = padToTwoDigits(now.getMinutes());

    const dateString = `${day}-${month}-${year}_${hours}-${minutes}`;

    const price = document.getElementById('totalPrice').textContent;
/*
    let upholsteryTable = [
        [{ text: '', fontSize: 10 }, { text: 'type', fontSize: 10, bold: true }, { text: 'collectie', fontSize: 10, bold: true }, { text: 'naam', fontSize: 10, bold: true }, { text: 'prijsgroep', fontSize: 10, bold: true },],
        [{ text: 'zitting en rug', fontSize: 10, bold: true }, { text: 'stof', fontSize: 10 }, { text: model.upholstery.type, fontSize: 10 }, { text: model.upholstery.name, fontSize: 10 }, { text: model.upholstery.pricegroup, fontSize: 10 }]
    ];

    if (model.upholsteryDuotone) {
        upholsteryTable.push(
            [{ text: 'achterkant rug', fontSize: 10, bold: true }, { text: 'stof', fontSize: 10 }, { text: model.upholsteryDuotone.type, fontSize: 10 }, { text: model.upholsteryDuotone.name, fontSize: 10 }, { text: model.upholsteryDuotone.pricegroup, fontSize: 10 }]
        );
    }
*/
    var docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [30, 30, 30, 30],
        defaultStyle: {
            font: 'RobotoDefault',
        },

        content: [
            { image: mainImage, width: 210, absolutePosition: { x: 356, y: 30 } },
            { text: `${title}`, font: 'RobotoDefault', fontSize: 24, characterSpacing: 1.5, color: '#292929', absolutePosition: { x: 28, y: 30 } },
            { text: 'Offerte', font: 'RobotoDefault', fontSize: 26, characterSpacing: 1.5, color: '#dfdeda', absolutePosition: { x: 28, y: 60 } },
            {
                text: [
                    { text: 'Scan QR of ' },
                    { text: 'klik hier', link: configuratorUrl, decoration: 'underline' },
                    { text: ' om te configureren.' },
                ], lineHeight: 1.4, fontSize: 10, absolutePosition: { x: 130, y: 207 }
            },
            { qr: configuratorUrl, fit: 120, absolutePosition: { x: 28, y: 135 } },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }], margin: [0, 210, 0, 0]
            },
            { text: 'Basiselement', bold: true, fontSize: 12, margin: [0, 15, 0, 5] },
            /*
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'type', fontSize: 10, bold: true }, { text: `Evan`, fontSize: 10 }],
                        [{
                            text: 'artikelnummer',
                            fontSize: 10,
                            bold: true
                        }, {
                            text: model.footstool
                                ? `${model.type.substring(3)} (bank) & 9085110 (voetenbank)`
                                : `${model.type.substring(3)}`,
                            fontSize: 10
                        }]
                    ]
                },
                margin: [0, 5, 0, 0]
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }], margin: [0, 15, 0, 0]
            },
            { text: 'Afmetingen', bold: true, fontSize: 12, margin: [0, 15, 0, 5] },
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'breedte', fontSize: 10, bold: true }, { text: `${ALLCOMPONENTS.elements[model.type].width} cm`, fontSize: 10 }],
                        [{ text: 'diepte', fontSize: 10, bold: true }, { text: `${ALLCOMPONENTS.elements[model.type].depth} cm`, fontSize: 10 }],
                        [{ text: 'hoogte', fontSize: 10, bold: true }, { text: `84 cm`, fontSize: 10 }]
                    ]
                }, margin: [0, 5, 0, 0]
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }], margin: [0, 15, 0, 0]
            },
            { text: 'Opties', bold: true, fontSize: 12, margin: [0, 15, 0, 5] },
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'zithoogte', fontSize: 10, bold: true }, { text: `${model.seatHeight} cm`, fontSize: 10 }],
                        // [{ text: 'voetenbank', fontSize: 10, bold: true }, { text: `${(model.footstool === true) ? 'ja' : 'nee'}`, fontSize: 10 }]
                    ]
                }, margin: [0, 5, 0, 0]
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }], margin: [0, 15, 0, 0]
            },
            { text: 'Bekleding', bold: true, fontSize: 12, margin: [0, 15, 0, 5] },
            {
                layout: 'noBorders',
                table: {
                    headerRows: 1, // ✅ Zet header row correct
                    widths: [100, 75, 75, 75, 75],
                    body: upholsteryTable
                },
                margin: [0, 5, 0, 0]
            },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }],
                margin: [0, 15, 0, 0]
            },
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'Prijs :', fontSize: 12, bold: true }, { text: `${price}`, fontSize: 12, bold: true }],

                    ]
                }, margin: [0, 15, 0, 0]
            },
            */
            {
                columns: [
                    {
                        width: 240,
                        alignment: 'left',
                        text: 'Deze offerte is gegenereerd door de TripleTise Configurator', link: 'http://tripledesign.nl', fontSize: 8
                    },
                    {
                        width: '*',
                        alignment: 'right',
                        //text: { text: 'LOGO', fontSize: 30, bold: true }
                        svg: '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="400.000000pt" height="101.000000pt" viewBox="0 0 400.000000 101.000000" preserveAspectRatio="xMidYMid meet" ><g transform="translate(0.000000,101.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M494 983 c2 -10 14 -52 26 -93 12 -41 30 -103 41 -137 20 -61 22 -63 54 -63 l34 0 39 123 c22 67 43 137 47 155 6 30 5 32 -22 32 -26 0 -30 -5 -41 -47 -7 -27 -22 -79 -34 -118 l-21 -70 -14 50 c-56 196 -51 185 -84 185 -24 0 -29 -4 -25 -17z"/><path d="M841 983 c-13 -25 -92 -285 -88 -289 2 -2 14 -5 27 -6 20 -3 26 3 35 37 12 40 12 40 61 40 48 0 48 0 60 -40 6 -22 16 -40 22 -39 7 1 20 2 31 3 17 1 15 13 -28 154 -47 152 -47 152 -78 155 -23 2 -34 -2 -42 -15z m53 -116 l14 -47 -33 0 -33 0 16 50 c9 27 17 48 19 47 2 -2 9 -25 17 -50z"/><path d="M1057 993 c-4 -3 -7 -73 -7 -155 l0 -148 30 0 29 0 3 100 3 100 60 -105 c40 -71 64 -104 73 -100 7 3 20 5 28 5 11 0 14 28 14 156 l0 155 -27 -3 c-28 -3 -28 -3 -33 -99 l-5 -96 -55 98 c-47 86 -58 99 -81 99 -14 0 -29 -3 -32 -7z"/><path d="M1450 978 c1 -13 13 -81 28 -153 l27 -130 34 0 34 0 27 98 c15 54 29 100 32 102 2 2 16 -43 32 -100 l28 -105 33 0 c27 0 34 5 40 27 10 42 55 265 55 275 0 5 -12 8 -27 6 -27 -3 -29 -6 -49 -113 l-21 -110 -12 45 c-49 184 -46 175 -76 175 -27 0 -29 -3 -58 -110 l-31 -110 -20 113 c-19 112 -19 112 -48 112 -22 0 -28 -4 -28 -22z"/><path d="M1921 975 c-39 -33 -54 -83 -49 -156 5 -73 29 -109 86 -129 37 -13 47 -13 84 0 58 21 81 56 86 134 8 120 -33 176 -130 176 -35 0 -54 -6 -77 -25z m123 -44 c25 -27 32 -108 13 -154 -15 -34 -19 -37 -56 -37 -51 0 -63 21 -63 107 0 47 4 69 17 83 23 25 67 26 89 1z"/><path d="M2200 845 l0 -155 90 0 c89 0 90 0 90 25 0 24 -3 25 -60 25 l-60 0 0 40 0 40 40 0 c36 0 40 3 40 25 0 23 -4 25 -40 25 -39 0 -40 1 -40 35 l0 35 54 0 c47 0 54 3 59 22 3 12 4 25 1 30 -3 4 -43 8 -90 8 l-84 0 0 -155z"/><path d="M2447 993 c-4 -3 -7 -73 -7 -155 l0 -148 30 0 30 0 0 60 c0 53 2 60 20 60 13 0 29 -17 49 -52 44 -78 43 -77 73 -71 l27 5 -29 58 c-16 32 -34 61 -40 65 -5 3 2 16 17 29 39 34 39 98 0 132 -24 20 -39 24 -96 24 -37 0 -71 -3 -74 -7z m128 -88 c0 -39 -1 -40 -37 -43 l-38 -3 0 46 0 46 38 -3 c36 -3 37 -4 37 -43z"/><path d="M2720 846 l0 -155 44 -6 c107 -16 174 23 196 115 18 77 -3 148 -55 180 -25 15 -50 20 -109 20 l-76 0 0 -154z m150 86 c15 -12 24 -33 27 -64 10 -89 -14 -128 -78 -128 l-39 0 0 105 0 105 34 0 c19 0 44 -8 56 -18z"/><path d="M3030 845 l0 -156 93 3 c87 3 92 4 95 26 3 21 0 22 -62 22 l-66 0 0 39 c0 40 0 40 43 43 35 2 43 7 45 26 3 20 -1 22 -42 22 -46 0 -46 0 -46 35 l0 34 58 3 c54 3 57 4 60 31 l3 27 -90 0 -91 0 0 -155z"/><path d="M3280 846 l0 -156 25 0 c24 0 24 1 27 107 l3 106 52 -94 c70 -126 72 -129 106 -122 l28 5 -3 152 -3 151 -27 3 -27 3 -3 -102 -3 -102 -55 99 c-51 90 -59 99 -88 102 l-32 3 0 -155z"/><path d="M1580 486 c-55 -14 -83 -33 -115 -76 -76 -103 -51 -321 43 -385 32 -22 47 -25 128 -25 84 0 94 2 131 29 74 54 107 195 73 319 -28 107 -146 169 -260 138z m78 -102 c36 -10 52 -54 52 -143 0 -116 -22 -149 -91 -139 -69 9 -83 244 -16 276 27 13 27 13 55 6z"/><path d="M768 483 c-12 -3 -16 -12 -13 -31 19 -113 59 -329 71 -384 l16 -68 69 0 c67 0 69 1 75 28 3 15 16 70 29 122 13 52 26 109 30 125 6 26 11 14 35 -80 15 -60 33 -129 39 -152 l12 -43 69 0 68 0 10 48 c11 47 68 352 77 403 3 21 -1 28 -18 33 -27 7 -97 8 -97 1 0 -3 -9 -62 -20 -132 -11 -71 -21 -141 -22 -158 -2 -18 -18 33 -41 133 l-39 162 -59 0 c-56 0 -59 -1 -66 -27 -3 -16 -21 -88 -38 -161 l-31 -133 -18 133 c-28 205 -21 188 -75 187 -25 -1 -54 -3 -63 -6z"/><path d="M1963 483 l-23 -4 0 -240 0 -239 66 0 65 0 -3 144 -3 144 75 -144 75 -144 63 0 62 0 0 245 0 245 -60 0 -60 0 0 -135 0 -135 -69 132 -69 133 -49 1 c-26 1 -58 0 -70 -3z"/><path d="M2457 483 c-4 -3 -7 -114 -7 -245 l0 -239 158 3 157 3 3 53 3 52 -90 0 -91 0 0 40 0 40 60 0 60 0 0 55 0 55 -60 0 -60 0 0 40 0 40 79 0 c87 0 91 3 91 78 l0 32 -148 0 c-82 0 -152 -3 -155 -7z"/><path d="M2878 483 c-17 -4 -18 -24 -18 -244 l0 -239 60 0 60 0 0 140 0 141 46 -88 c25 -48 60 -112 76 -141 l30 -53 61 3 62 3 0 240 0 240 -60 0 -60 0 0 -135 0 -136 -33 66 c-19 36 -52 98 -74 138 l-39 72 -47 -1 c-26 -1 -55 -3 -64 -6z"/><path d="M68 336 c-32 -7 -60 -15 -63 -17 -2 -3 3 -31 11 -61 32 -112 103 -141 228 -93 70 26 96 23 96 -11 0 -18 59 -17 115 0 36 11 40 15 37 42 -6 52 -39 112 -71 128 -41 22 -100 20 -163 -4 -68 -26 -76 -25 -90 5 -13 28 -19 29 -100 11z"/><path d="M3840 331 c0 -32 -25 -36 -86 -12 -31 11 -78 21 -106 21 -43 0 -54 -4 -83 -33 -30 -30 -55 -88 -55 -129 0 -12 14 -19 50 -27 78 -17 110 -15 110 8 0 30 25 32 95 6 36 -14 80 -25 98 -25 66 0 120 58 134 145 5 32 4 34 -33 43 -22 6 -58 13 -81 17 -39 6 -43 5 -43 -14z"/></g></svg > ', width: 150, margin: [-20, -20, 0, 0]


    //svg: '<svg viewBox="0 0 197.4 57.2"><path class="st0" d="m20.9 19.4c-1.2-1.5-2.9-2.7-5.4-2.7-6.3 0-7.6 5.9-7.6 10.8 0 4.8 1.3 10.7 7.6 10.7 2.5 0 4.2-1.2 5.4-2.7 1.6-2.2 2.1-5.2 2.1-8s-0.4-5.9-2.1-8.1m4.3 22.9c-2 1.6-4.8 2.7-8.1 2.7-4 0-7.2-1.4-8.7-3.3v15.2h-8v-46h6.9l0.5 3.7c2-3.1 5.7-4.4 9.3-4.4 3.3 0 6 1.2 8 2.8 4 3.3 5.9 8.3 5.9 14.5 0.2 6.5-1.9 11.6-5.8 14.8m32-12.9-8.5 0.6c-2.5 0.2-4.8 1.6-4.8 4.4 0 2.6 2.3 4.2 4.8 4.2 5 0 8.5-2.7 8.5-7.6v-1.6zm6.7 15.3c-3.5 0-5.4-2.2-5.7-4.7-1.6 2.7-5.4 5-10.1 5-8 0-12.1-5-12.1-10.4 0-6.3 4.9-10 11.3-10.4l9.8-0.7v-2c0-3.1-1.1-5.3-5.7-5.3-3.8 0-5.9 1.6-6.1 4.8h-7.8c0.5-7.5 6.4-10.8 13.8-10.8 5.7 0 10.6 1.8 12.5 6.8 0.8 2.1 1 4.5 1 6.8v12.3c0 1.6 0.5 2.1 1.8 2.1 0.5 0 1-0.1 1-0.1v5.9c-1 0.4-1.8 0.7-3.7 0.7m34-3.5c-2.7 2.7-6.9 3.8-11.4 3.8-4.2 0-8-1.2-10.8-3.8-1.9-1.8-3.5-4.6-3.5-7.8h7.5c0 1.5 0.8 3.1 1.8 3.9 1.3 1 2.7 1.5 5 1.5 2.7 0 6.8-0.5 6.8-4.2 0-1.9-1.3-3.2-3.3-3.5-2.9-0.5-6.3-0.6-9.2-1.3-4.6-1-7.6-4.7-7.6-8.9 0-3.4 1.4-5.8 3.4-7.5 2.5-2.1 5.9-3.3 10.1-3.3 4 0 8 1.3 10.4 3.9 1.8 1.9 2.9 4.4 2.9 6.9h-7.6c0-1.3-0.5-2.3-1.4-3.1-1-1-2.7-1.6-4.4-1.6-1.2 0-2.3 0-3.5 0.5-1.4 0.5-2.6 1.8-2.6 3.5 0 2.4 2 3.1 3.8 3.3 3 0.4 3.8 0.5 7.1 1 5.3 0.8 9.1 4.2 9.1 9.4 0.2 3.2-0.9 5.6-2.6 7.3m22.1 3.5c-6.8 0-10.1-3.8-10.1-10.2v-17h-6.1v-6.6h6.1v-8.5l8-2v10.4h8.4v6.6h-8.4v16.3c0 2.6 1.2 3.7 3.7 3.7 1.6 0 3-0.1 5.2-0.3v6.8c-2.3 0.4-4.5 0.8-6.8 0.8m31.3-25.5c-1.1-1.2-2.9-2.1-5-2.1s-4 1-5 2.1c-1.9 2.1-2.4 5.3-2.4 8.4s0.5 6.3 2.4 8.4c1.1 1.2 2.9 2.1 5 2.1s4-1 5-2.1c1.9-2.1 2.4-5.3 2.4-8.4 0-3.2-0.5-6.3-2.4-8.4m6.6 20.6c-2.3 2.8-6.6 5.2-11.7 5.2-5 0-9.3-2.4-11.7-5.2-2.5-3.1-3.9-6.7-3.9-12.3 0-5.7 1.4-9.1 3.9-12.3 2.3-2.8 6.6-5.2 11.7-5.2 5 0 9.3 2.4 11.7 5.2 2.5 3.1 3.9 6.7 3.9 12.3 0 5.7-1.4 9.2-3.9 12.3m29.7-21.5c-1.1-1.2-2.7-1.9-5-1.9-2.5 0-4.4 1-5.6 2.6-1.2 1.5-1.7 3-1.7 5.2h14.4c-0.1-2.5-0.8-4.4-2.1-5.9m9.4 11.7h-22.3c-0.1 2.6 0.8 5 2.5 6.5 1.2 1.1 2.7 2 4.9 2 2.3 0 3.8-0.5 4.8-1.6 0.7-0.7 1.3-1.6 1.6-2.8h7.7c-0.2 2-1.6 4.6-2.8 6.1-2.8 3.3-7 4.7-11.2 4.7-4.6 0-7.9-1.6-10.5-4.1-3.3-3.2-5.1-7.9-5.1-13.3 0-5.3 1.6-10.1 4.8-13.4 2.5-2.6 6.1-4.2 10.6-4.2 4.9 0 9.4 2 12.2 6.1 2.5 3.7 3 7.4 2.9 11.6-0.1 0.2-0.1 1.7-0.1 2.4"/></svg>', width: 100, margin: [0, 0, 0, 0]
}
                ],
columnGap: 100,
    margin: [0, 15, 0, 0]
            }
        ]
    }
pdfMake.fonts = {
    Poppins: {
        normal: 'https://vanwoerdenwonen-levante.web.app/fonts/Poppins-Black.ttf',
        bold: 'https://vanwoerdenwonen-levante.web.app/fonts/Poppins-Black.ttf',
        tekst: 'https://vanwoerdenwonen-levante.web.app/fonts/Roboto-Light.ttf',
        //bold: 'https://vanwoerdenwonen-levante.web.app/fonts/Roboto-Light.ttf',
    },
    RobotoDefault: {
        normal: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
        bold: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Medium.ttf'
        //italics: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
        //bold: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
    },
}
pdfMake.createPdf(docDefinition).download(`${title}_${dateString}`);
}