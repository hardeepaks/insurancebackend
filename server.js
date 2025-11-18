require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vehicle', require('./routes/vehicle'));

app.get('/', (req, res) => res.send('Backend running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running', PORT));
