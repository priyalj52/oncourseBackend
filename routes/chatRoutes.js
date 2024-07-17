const express = require('express');
const router = express.Router();
const openAiService = require('../services/openAiService');

router.post('/chat', async (req, res) => {
  try {
    const { patient, correctTest, correctDiagnosis } = req.body;
    const prompt = `Patient info: Age: ${patient.age}, Gender: ${patient.gender}, History: ${patient.history}, Symptoms: ${patient.symptoms}, Additional Info: ${patient.additionalInfo}. What is the best test for these symptoms? Correct Test: ${correctTest}, Correct Diagnosis: ${correctDiagnosis}.`;

    const response = await openAiService.getResponse(prompt);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat request:', error);
    res.status(500).json({ error: 'Failed to process the chat request' });
  }
});

module.exports = router;
