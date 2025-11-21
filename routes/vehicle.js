const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

/* ============================================================
   VEHICLE LOOKUP — USING CheckCarDetails.co.uk ONLY
   Clean, fast, accurate. No other APIs needed.
   ============================================================ */

router.get("/:reg", async (req, res) => {
    const reg = req.params.reg.toUpperCase();
    const apiKey = process.env.CHECKCAR_API_KEY; // Make sure env is set

    if (!apiKey) {
        return res.status(500).json({
            success: false,
            message: "CheckCarDetails API key missing in backend"
        });
    }

    const apiUrl = `https://api.checkcardetails.co.uk/vehicledata/vehiclespecs?apikey=${apiKey}&vrm=${reg}`;

    try {
        // ---------------------------------------------
        // REQUEST VEHICLE INFO
        // ---------------------------------------------
        const response = await fetch(apiUrl);
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.status(500).json({
                success: false,
                message: "Invalid JSON received from CheckCarDetails API",
                raw: text
            });
        }

        if (!data || !data.VehicleIdentification || !data.ModelData) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found in CheckCarDetails API",
            });
        }

        // ---------------------------------------------
        // EXTRACT CORE FIELDS
        // ---------------------------------------------
        const vid = data.VehicleIdentification;
        const modelData = data.ModelData;
        const dvlaTech = data.DvlaTechnicalDetails;

        const make = (modelData.Make || vid.DvlaMake || "").toUpperCase();
        const range = (modelData.Range || "").toUpperCase();
        const variant = (modelData.ModelVariant || vid.DvlaModel || "").toUpperCase();

        const year = vid.YearOfManufacture || modelData.StartDate?.substring(0, 4);
        const engine = dvlaTech?.EngineCapacityCc || null;
        const fuel = vid.DvlaFuelType || modelData.FuelType || "";

        // ---------------------------------------------
        // BUILD MODEL DISPLAY FORMAT YOU REQUESTED
        // ---------------------------------------------
        const formattedModel = `${make} ${range}\n${variant}`;

        // ---------------------------------------------
        // FINAL API RESPONSE TO FRONTEND
        // ---------------------------------------------
        return res.json({
            success: true,
            registration: reg,
            make: make,
            model: formattedModel,
            modelRange: range,
            modelVariant: variant,
            yearOfManufacture: year,
            engineCapacity: engine,
            fuelType: fuel
        });

    } catch (err) {
        console.error("CheckCarDetails API Error:", err);
        return res.status(500).json({
            success: false,
            message: "Vehicle lookup failed"
        });
    }
});

module.exports = router;
