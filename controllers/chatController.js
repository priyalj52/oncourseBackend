// controllers/chatController.js

const { getResponse } = require('../services/openAiService');

async function handleChat(req, res) {
  const userQuery = req.body.query;

  try {
    const response = await getResponse(userQuery);

   
    const patientData = {
      age: 5,
      gender: 'Male',
      history: 'Diagnosed with posterior superior retraction pocket',
      symptoms: 'None specified',
      additionalInfo: 'Posterior superior retraction pocket present'
    };

   
    const nextPrompt = `Patient data: ${JSON.stringify(patientData)}\n`;
    res.json({ response: nextPrompt });
  } catch (error) {
    console.error('Error handling chat:', error.message);
    res.status(500).json({ error: 'Failed to process the chat request' });
  }
}

module.exports = { handleChat };
