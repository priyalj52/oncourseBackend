const express = require('express');
const router = express.Router();
const { addPatient, fetchPatients, getPatientCase } = require('../controllers/patientController');

router.post('/', addPatient);

// router.get('/', fetchPatients);
router.get("/case",getPatientCase);


module.exports = router;
