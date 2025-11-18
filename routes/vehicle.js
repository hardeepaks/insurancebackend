const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const DVLA_KEY = process.env.DVLA_KEY;

// VEHICLE LOOKUP
router.get("/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase();

  // If no DVLA key → return placeholder
  if (!DVLA_KEY) {
    return res.json({
      registration: reg,
      make: "BMW",
      model: "3 Series",
      engineCapacity: "1998",
      yearOfManufacture: "2019",
      colour: "Grey"
    });
  }

  try {
    const result = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": DVLA_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationNumber: reg })
      }
    );

    const data = await result.json();

    if (data.errorMessage) {
      return res.status(400).json({ error: "Vehicle not found" });
    }

    return res.json({
      registration: reg,
      make: data.make,
      model: data.model,
      engineCapacity: data.engineCapacity?.toString() || "",
      yearOfManufacture: data.yearOfManufacture || "",
      colour: data.colour || ""
    });

  } catch (err) {
    console.log("DVLA error:", err);
    return res.status(500).json({ error: "DVLA API error" });
  }
});

module.exports = router;
