const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/:reg', async (req, res) => {
  const reg = req.params.reg.toUpperCase();
  if (!process.env.DVLA_KEY) {
    return res.json({
      make: 'BMW',
      model: '330E M SPORT AUTO',
      engineCapacity: 1998,
      fuelType: 'PETROL/ELECTRIC',
      transmission: 'AUTO'
    });
  }

  try {
    const r = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.DVLA_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ registrationNumber: reg })
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'DVLA error' });
  }
});

module.exports = router;
