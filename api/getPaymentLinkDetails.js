

const addCorsHeaders = (res, origin = "*") => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};
export default async function handler(req, res) {
    addCorsHeaders(res, req.headers.origin || "*");

    // Only allow GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET allowed" });
    }

    // Expect link_id as a query parameter
    const { link_id } = req.query;
    if (!link_id) {
        return res.status(400).json({ error: "link_id is required" });
    }

    try {
        const cfResponse = await fetch(
            `https://api.cashfree.com/pg/links/${encodeURIComponent(link_id)}`,
            {
                method: "GET",
                headers: {
                    "x-client-id": process.env.CASHFREE_CLIENT_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET,
                    "x-api-version": "2025-01-01",
                },
            }
        );

        const data = await cfResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error fetching payment link details:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
