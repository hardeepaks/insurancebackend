const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// DVLA: https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles
router.get("/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase();

  // If no DVLA key provided, use a safe fallback demo vehicle
  if (!process.env.DVLA_API_KEY) {
    return res.json({
      success: true,
      source: "fallback",
      registration: reg,
      make: "BMW",
      model: "330E M SPORT AUTO",
      yearOfManufacture: 2021,
      engineCapacity: 1998,
      fuelType: "PETROL/ELECTRIC",
      transmission: "AUTO"
    });
  }

  try {
    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DVLA_API_KEY
        },
        body: JSON.stringify({ registrationNumber: reg })
      }
    );

    const data = await response.json();

    // DVLA returns an error object sometimes
    if (data?.errors) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: data.errors
      });
    }

    // Clean response format for frontend
    return res.json({
      success: true,
      registration: reg,
      make: data.make,
      model: data.model,
      yearOfManufacture: data.yearOfManufacture,
      engineCapacity: data.engineCapacity,
      fuelType: data.fuelType,
      transmission: data.transmission
    });

  } catch (err) {
    console.error("DVLA Error:", err);
    return res.status(500).json({
      success: false,
      message: "DVLA lookup failed"
    });
  }
});

module.exports = router;
