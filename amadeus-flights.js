// routes/amadeus-flights.js
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.get("/", async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      success: false,
      message: "Parâmetros obrigatórios ausentes: origin, destination, date"
    });
  }

  try {
    // 1. Obter token
    const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      })
    });

    const authData = await authResponse.json();
    const token = authData.access_token;

    // 2. Buscar voos
    const flightResponse = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&max=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const flights = await flightResponse.json();

    res.json({
      success: true,
      message: "Voos encontrados com sucesso",
      results: flights
    });

  } catch (error) {
    console.error("Erro ao buscar voos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
