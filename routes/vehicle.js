const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const cheerio = require("cheerio");

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
  } catch {
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
  } catch {
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
  } catch {
    console.log("RegCheck fallback failed");
  }
  return null;
}

/* -------------------------------------------------------------------
   4) DVLA HTML SCRAPER (CHEERIO)
--------------------------------------------------------------------*/
async function lookupDvlaHtml(reg) {
  try {
    const url = "https://vehicleenquiry.service.gov.uk/";
    
    // Step 1: GET session cookie + hidden input values
    const firstReq = await fetch(url);
    const cookie = firstReq.headers.get("set-cookie") || "";
    const html1 = await firstReq.text();

    const $1 = cheerio.load(html1);

    const viewState =
      $1("input[name='__RequestVerificationToken']").attr("value") || "";

    if (!viewState) {
      console.log("DVLA scrape — could not extract token");
      return null;
    }

    // Step 2: POST reg plate into DVLA enquiry
    const postRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie
      },
      body: new URLSearchParams({
        "__RequestVerificationToken": viewState,
        "registrationNumber": reg,
        "Submit": "Continue"
      })
    });

    const html2 = await postRes.text();
    const $2 = cheerio.load(html2);

    // DVLA site shows make + model as separate lines under:
    // <h1 class="heading-large">VAUXHALL</h1>
    // <h2 class="heading-medium">INSIGNIA EXCLUSIV CDTI ECO SS</h2>

    const model = $2("h2.heading-medium").first().text().trim();

    if (model && model.length > 1) {
      return model.toUpperCase();
    }

    console.log("DVLA HTML scrape failed");
    return null;
  } catch (err) {
    console.log("DVLA HTML scrape error:", err);
    return null;
  }
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
    // STEP 1 — DVLA LOOKUP (official API)
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
    // STEP 2 — MAIN FIELDS
    // ---------------------------------------------
    const make = data.make ? data.make.toUpperCase() : "";

    let model =
      (data.model || data.longModelDescription || "").toUpperCase();

    // ---------------------------------------------
    // STEP 3 — FALLBACKS FOR MODEL (now includes DVLA scraping)
    // ---------------------------------------------
    if (!model || model.trim() === "") {
      console.log("DVLA missing model — performing external lookup...");

      model =
        await lookupAutoTrader(reg) ||
        await lookupCarApi(reg) ||
        await lookupRegCheck(reg) ||
        await lookupDvlaHtml(reg) ||
        "UNKNOWN MODEL";
    }

    // ---------------------------------------------
    // FINAL RESPONSE
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
