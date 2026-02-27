const { onRequest } = require("firebase-functions/v2/https");
const crypto = require("crypto");

// ====== Config ======
const WP_ENDPOINT = "https://iom-develop.nl/tvwand/wp-json/tvwand/v2/session";
const PRODUCT_ID = 713;

exports.createCheckoutSession = onRequest(
    {
        // Specificeer de domeinen die de functie mogen aanroepen.
        cors: [
            "https://relaxury-tv-wand.web.app",
            "https://relaxury-tv-wand.firebaseapp.com",
            "https://iom-develop.nl",
            "https://tvwand.nl",
            "https://www.tvwand.nl"
        ],
        secrets: ["TVWAND_SECRET_KEY"]
    },
    async (req, res) => {
        // Zet secret in environment (Firebase secret/config)
        // Gebruik commando: firebase functions:secrets:set TVWAND_SECRET_KEY
        const SECRET_KEY = process.env.TVWAND_SECRET_KEY;

        try {
            if (req.method !== "POST") {
                return res.status(405).json({ error: "Method not allowed" });
            }
            if (!SECRET_KEY) {
                console.error("Server misconfigured: missing secret");
                return res.status(500).json({ error: "Server misconfigured: missing secret" });
            }

            // 1) Neem config + prijs aan van configurator (browser -> cloud function)
            const { config, price, line_items, image, configuration_url, pdf } = req.body || {};
            console.log("Request ontvangen:", { config, price, line_items });

            if (!config || typeof config !== "object" || price === undefined || price === null || isNaN(Number(price))) {
                return res.status(400).json({ error: "config and a valid price are required" });
            }

            // 2) Bouw payload voor WP plugin
            const bodyObj = {
                product_id: PRODUCT_ID,
                price: Number(price),
                config,
                line_items: Array.isArray(line_items) ? line_items : undefined,
                image,
                configuration_url,
                pdf,
            };

            // Verwijder undefined keys
            Object.keys(bodyObj).forEach(k => bodyObj[k] === undefined && delete bodyObj[k]);

            const rawBody = JSON.stringify(bodyObj);

            // 3) Signing headers
            const ts = Math.floor(Date.now() / 1000).toString();
            const nonce = crypto.randomBytes(16).toString("hex");

            const canonical = `${ts}\n${nonce}\n${rawBody}`;
            const signature = crypto
                .createHmac("sha256", SECRET_KEY)
                .update(canonical, "utf8")
                .digest("hex");

            // 4) Call WP endpoint server-to-server
            // Node 18+ heeft global fetch
            const wpResp = await fetch(WP_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-TVWAND-Timestamp": ts,
                    "X-TVWAND-Nonce": nonce,
                    "X-TVWAND-Signature": signature,
                },
                body: rawBody,
            });

            const data = await wpResp.json().catch(() => ({}));
            if (!wpResp.ok) {
                return res.status(wpResp.status).json({ error: "WP error", details: data });
            }

            // 5) Geef checkout_url terug aan browser
            return res.status(200).json({ checkout_url: data.checkout_url });
        } catch (e) {
            return res.status(500).json({ error: "Unexpected error", details: String(e) });
        }
    });