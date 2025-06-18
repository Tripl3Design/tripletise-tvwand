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

    //const price = document.getElementById('totalPrice').textContent;
    const price = document.querySelector('.productInfoPrice').textContent;

    var docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [30, 30, 30, 30],
        defaultStyle: {
            font: 'RobotoDefault',
        },

        content: [
            { image: mainImage, width: 210, absolutePosition: { x: 356, y: 30 } },
            { text: 'TV Wand', font: 'RobotoDefault', fontSize: 24, characterSpacing: 1.5, bold: true, color: '#292929', absolutePosition: { x: 28, y: 30 } },
            { text: 'Offerte', font: 'RobotoDefault', fontSize: 26, characterSpacing: 1.5, bold: true, color: '#dfdeda', absolutePosition: { x: 28, y: 60 } },
            {
                text: [
                    { text: 'Scan QR of ' },
                    { text: 'klik hier', link: configuratorUrl, decoration: 'underline' },
                    { text: ' om te configureren.' },
                ], lineHeight: 1.4, fontSize: 10, absolutePosition: { x: 130, y: 207 }
            },
            { qr: configuratorUrl, fit: 100, absolutePosition: { x: 28, y: 135 } },
            {
                canvas: [{
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 536, y2: 0,
                    lineWidth: 0.2
                }], margin: [0, 210, 0, 0]
            },
            { text: 'Basiselement', bold: true, fontSize: 12, margin: [0, 15, 0, 5] },
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'breedte', fontSize: 10, bold: true }, { text: `${model.width} cm`, fontSize: 10 }],
                        [{ text: 'hoogte', fontSize: 10, bold: true }, { text: `${model.height} cm`, fontSize: 10 }],
                        [{ text: 'diepte', fontSize: 10, bold: true }, { text: `${model.depth} cm`, fontSize: 10 }],
                        [{ text: 'uitsparing voor tv', fontSize: 10, bold: true }, { text: `${model.tvSize} inch`, fontSize: 10 }],
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
                        // Soundbar
                        [{ text: 'soundbar', fontSize: 10, bold: true }, { text: model.soundbar ? `ja, uitsparing voor soundbar` : `geen uitsparing voor soundbar`, fontSize: 10 }],

                        // Vakkenkast (met breedte en aantal planken en spots)
                        [{ text: 'vakkenkast', fontSize: 10, bold: true },
                        {
                            text: model.alcove
                                ? `breedte: ${model.alcove.left.width} cm, aantal planken: ${model.alcove.left.shelves || '0'}, spots: ${'ja' || 'nee'}`
                                : `nee`,
                            fontSize: 10
                        }
                        ],

                        // Sfeerhaard
                        [{ text: 'sfeerhaard', fontSize: 10, bold: true }, { text: model.fireplace ? `${model.fireplace.brand} ${model.fireplace.type}` : `nee`, fontSize: 10 }],
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
            {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: [100, 'auto'],
                    body: [
                        [{ text: 'Prijs', fontSize: 12, bold: true }, { text: `${price.trim()}`, fontSize: 12, bold: true }],

                    ]
                },
                margin: [0, 15, 0, 5]
            },

        ],

        footer: function (currentPage, pageCount) {
            if (currentPage === pageCount) {
                return {
                    columns: [
                        {
                            width: '*',
                            alignment: 'left',
                            text: 'Deze offerte is gegenereerd door de TripleTise Configurator',
                            link: 'http://tripledesign.nl',
                            fontSize: 8,
                            margin: [0, -50, 0, 0]
                        },
                        {
                            width: '*',
                            alignment: 'right',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="141px" height="91px" viewBox="0 0 141 91" version="1.1"><defs><rect id="path-1" x="0" y="0" width="141" height="91"/></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-tvwand"><polygon id="Path_140" fill="#292747" fill-rule="nonzero" points="50.4927027 0.00341527491 41.4494622 0.00341527491 60.9776192 56.2000563 72.3323072 56.2000563 78.619853 38.1742353 74.0803607 25.1125164 74.0803607 25.1125164 66.7307066 46.7072997 50.7667403 0.00341527491"/><polygon id="Path_141" fill="#292747" fill-rule="nonzero" points="68.9281136 0.00170763746 88.4562706 56.1983487 99.8109586 56.1983487 106.100206 38.1725277 101.560714 25.1039782 101.560714 25.1039782 94.21106 46.6987615 78.2385833 0.00170763746"/><polygon id="Path_142" fill="#292747" fill-rule="nonzero" points="105.441495 0.00341527491 96.3982544 0.00341527491 115.928114 56.2000563 127.282802 56.2000563 133.572049 38.1742353 129.034259 25.1125164 129.034259 25.1125164 121.681201 46.7072997 105.715533 0.00341527491"/><polygon id="Path_143" fill="#292747" fill-rule="nonzero" points="7.4279506 0.00341527491 10.1189657 7.74925877 24.3076449 7.74925877 24.3076449 56.2000563 33.0887625 56.2000563 33.0887625 7.75096641 40.5779886 7.75096641 37.8903777 0.00341527491"/><polygon id="Path_144" fill="#292747" fill-rule="nonzero" points="0 78.5769375 0 80.5321824 3.76503821 80.5321824 3.76503821 90.8343592 6.01010394 90.8343592 6.01010394 80.5304748 9.77344005 80.5304748 9.77344005 78.5752299"/><polygon id="Path_145" fill="#292747" fill-rule="nonzero" points="24.6174266 78.5769375 21.2830189 88.5495403 17.9469091 78.5769375 15.6014196 78.5769375 19.8124072 90.8343592 22.7349075 90.8343592 26.9612139 78.5769375"/><polygon id="Path_146" fill="#292747" fill-rule="nonzero" points="46.7583022 78.5769375 44.4791946 87.7708576 42.096259 78.5769375 39.8171513 78.5769375 37.4240032 87.7981798 35.1619165 78.5769375 32.8998298 78.5769375 36.0197733 90.8343592 38.792489 90.8343592 40.9558541 82.4857196 43.1021982 90.8343592 45.891935 90.8343592 48.9965596 78.5769375"/><path d="M59.2227574,80.8788328 L61.0388947,86.2954588 L57.4066201,86.2954588 L59.2227574,80.8788328 Z M57.7538478,78.5769375 L53.5428602,90.8343592 L55.8866476,90.8343592 L56.7615254,88.2507037 L61.6822873,88.2507037 L62.5571651,90.8343592 L64.9009524,90.8343592 L60.674646,78.5769375 L57.7538478,78.5769375 Z" id="Path_147" fill="#292747" fill-rule="nonzero"/><polygon id="Path_148" fill="#292747" fill-rule="nonzero" points="79.1202694 78.5769375 79.1202694 86.8931319 73.5033499 78.5769375 71.4608337 78.5769375 71.4608337 90.8343592 73.6905805 90.8343592 73.6905805 82.6684369 79.3075001 90.8343592 81.3500163 90.8343592 81.3500163 78.5769375"/><g id="Group_9-Clipped"><mask id="mask-2" fill="white"><use xlink:href="#path-1"/></mask><g id="Rectangle_8"/><g id="Group_9" mask="url(#mask-2)" fill="#292747" fill-rule="nonzero"><g transform="translate(88.512440, 78.575467)"><path d="M0,12.258892 L0,0.00147034584 L4.39140984,0.00147034584 C5.28608674,-0.0182266747 6.17409186,0.160185689 6.99221381,0.524007407 C7.7054031,0.849623892 8.33915015,1.32750125 8.84920146,1.92427012 C9.34181935,2.50441199 9.72014558,3.173129 9.96407489,3.89488374 C10.4594661,5.34422748 10.4594661,6.91784251 9.96407489,8.36718624 C9.72010774,9.08892396 9.34178538,9.75763413 8.84920146,10.3377999 C8.33918782,10.934609 7.70543122,11.4124936 6.99221381,11.7380626 C6.17404091,12.1017233 5.28607196,12.2801284 4.39140984,12.2605996 L0,12.258892 Z M4.29268823,1.97208397 L2.25017202,1.97208397 L2.25017202,10.271202 L4.29268823,10.271202 C5.04842899,10.3015824 5.79419556,10.0898632 6.42201137,9.66669834 C6.97541667,9.27368272 7.40959401,8.73466145 7.67645674,8.10933298 C8.2267705,6.84171404 8.2267705,5.40157193 7.67645674,4.13395299 C7.40928783,3.50880959 6.97517206,2.96986475 6.42201137,2.57658763 C5.79384535,2.15418201 5.04833071,1.94253432 4.29268823,1.97208397" id="Path_149"/><path d="M18.4932821,12.4245328 C18.1436334,12.4346519 17.8066796,12.292708 17.5690436,12.0351915 C17.3324933,11.7886905 17.2022431,11.4586308 17.2064969,11.1164825 C17.2008681,10.7761007 17.3314522,10.4476553 17.5690436,10.2046041 C17.8090933,9.95153365 18.1452325,9.81303814 18.4932821,9.82380099 C18.838206,9.81782069 19.1709694,9.951591 19.4163411,10.194869 C19.6617127,10.438147 19.7989724,10.7703894 19.7970883,11.1164825 C19.8040307,11.4632907 19.670083,11.798017 19.4260312,12.0437297 C19.1818927,12.2959676 18.8436032,12.4340773 18.4932821,12.4245328" id="Path_150"/><polygon id="Path_151" points="27.1109984 12.258892 27.1109984 0.00147034584 29.1535146 0.00147034584 34.7704342 8.31595712 34.7704342 0.00147034584 37.0069895 0.00147034584 37.0069895 12.258892 34.9644733 12.258892 29.3475537 4.09296969 29.3475537 12.258892"/><polygon id="Path_152" points="44.1660088 12.258892 44.1660088 0.00147034584 46.4110745 0.00147034584 46.4110745 10.3036471 52.4875602 10.3036471 52.4875602 12.258892"/></g></g></g></g></g></svg>',
                            width: 60,
                            margin: [0, -80, 0, 0]
                        }
                    ],
                    columnGap: 100,
                    margin: [30, 30, 30, 30]
                };
            }
        }
    }
    pdfMake.fonts = {
        RobotoDefault: {
            normal: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
            bold: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Medium.ttf'
            //italics: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
            //bold: 'https://pastoe-amsterdammer.web.app/fonts/Roboto-Light.ttf',
        },
    }
    pdfMake.createPdf(docDefinition).download(`TV-Wand_${dateString}`);
}