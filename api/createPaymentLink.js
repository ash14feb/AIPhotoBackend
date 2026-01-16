import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body; // data sent from React

    const cfResponse = await fetch("https://sandbox.cashfree.com/pg/links", {
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

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
