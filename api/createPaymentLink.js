//export default async function handler(req, res) {
//    if (req.method !== "POST") {
//        return res.status(405).json({ error: "Method not allowed" });
//    }

//    try {
//        const payload = req.body;

//        const cfResponse = await fetch("https://sandbox.cashfree.com/pg/links", {
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json",
//                "x-client-id": process.env.CASHFREE_CLIENT_ID,
//                "x-client-secret": process.env.CASHFREE_SECRET,
//                "x-api-version": "2025-01-01"
//            },
//            body: JSON.stringify(payload),
//        });

//        const data = await cfResponse.json();
//        return res.status(200).json(data);

//    } catch (error) {
//        console.error("Error calling Cashfree:", error);
//        return res.status(500).json({ error: "Server error" });
//    }
//}

// commonCors.js
const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

export default async function handler(req, res) {
    // Always add CORS headers
    addCorsHeaders(res, req.headers.origin || "*");

    // Handle preflight (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const payload = req.body;

        const cfResponse = await fetch("https://api.cashfree.com/pg/links", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_CLIENT_ID,
                "x-client-secret": process.env.CASHFREE_SECRET,
                "x-api-version": "2025-01-01"
            },
            body: JSON.stringify(payload),
        });

        const data = await cfResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error calling Cashfree:", error);
        return res.status(500).json({ error: "Server error" });
    }
}

