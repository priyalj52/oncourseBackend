const express = require('express');
const pool = require('../utils/db'); // Import the database pool

const router = express.Router();

// Example route that fetches all patients
router.get('/hi', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM patients');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
