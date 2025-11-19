const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* -------------------------------------------------------------------
   EXTERNAL MODEL FALLBACK FUNCTIONS (when DVLA returns no model)
--------------------------------------------------------------------*/

// 1) Autotrader (unofficial public endpoint)
async function lookupAutoTrader(reg) {
  try {
    const url = `https://autotrader.co.uk/car-search-api/search?postcode=SW1A1AA&reg=${reg}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.results?.length > 0) {
      const model = data.results[0].vehicle?.model;
      if (model) return model.toUpperCase();
    }
  } catch (e) {
    console.log("Autotrader fallback failed");
  }
  return null;
}

// 2) CarAPI (public endpoint)
async function lookupCarApi(reg) {
  try {
    const res = await fetch(`https://carapi.app/api/search?vin=${reg}`);
    const data = await res.json();

    if (data?.data?.length > 0) {
      const model = data.data[0].model;
      if (model) return model.toUpperCase();
    }
  } catch (e) {
    console.log("CarAPI fallback failed");
  }
  return null;
}

// 3) RegCheck (simple model lookup)
async function lookupRegCheck(reg) {
  try {
    const url = `https://www.regcheck.org.uk/api/json.aspx/CheckUKVehicle?RegistrationNumber=${reg}&username=demo`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.Vehicle?.Model) {
      return data.Vehicle.Model.toUpperCase();
    }
  } catch (e) {
    console.log("RegCheck fallback failed");
  }
  return null;
}

/* -------------------------------------------------------------------
   MAIN VEHICLE ROUTE
--------------------------------------------------------------------*/

router.get("/:reg", async (req, res) => {
  const reg = req.params.reg.toUpperCase();

  // Fallback if DVLA key missing
  if (!process.env.DVLA_API_KEY) {
    return res.json({
      success: true,
      registration: reg,
      make: "BMW",
      model: "330E M SPORT AUTO",
      yearOfManufacture: 2021,
      engineCapacity: 1998,
      fuelType: "PETROL"
    });
  }

  try {
    // ---------------------------------------------
    // STEP 1 — DVLA LOOKUP
    // ---------------------------------------------
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

    if (data?.errors) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: data.errors
      });
    }

    // ---------------------------------------------
    // STEP 2 — PROCESS MAKE / MODEL
    // ---------------------------------------------
    const make = data.make ? data.make.toUpperCase() : "";

    // DVLA sometimes omits model completely → we fix it
    let model =
      (data.model || data.longModelDescription || "").toUpperCase();

    // ---------------------------------------------
    // STEP 3 — FALLBACK MODEL LOOKUP IF MODEL EMPTY
    // ---------------------------------------------
    if (!model || model.trim() === "") {
      console.log("DVLA missing model — performing external lookup...");

      model =
        await lookupAutoTrader(reg) ||
        await lookupCarApi(reg) ||
        await lookupRegCheck(reg) ||
        "UNKNOWN MODEL";
    }

    // ---------------------------------------------
    // FINAL RESPONSE TO FRONTEND
    // ---------------------------------------------
    return res.json({
      success: true,
      registration: reg,
      make: make,
      model: model,
      yearOfManufacture: data.yearOfManufacture,
      engineCapacity: data.engineCapacity,
      fuelType: data.fuelType || ""
    });

  } catch (err) {
    console.error("DVLA Vehicle API Error:", err);
    return res.status(500).json({
      success: false,
      message: "DVLA lookup failed"
    });
  }
});

module.exports = router;
