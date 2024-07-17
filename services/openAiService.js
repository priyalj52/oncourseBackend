// const axios = require('axios');
// require('dotenv').config();

// const apiKey = process.env.OPEN_AI_API_KEY;
// console.log('API Key:', apiKey);
// const endpoint = 'https://api.openai.com/v1/chat/completions';

// async function getResponse(prompt) {
//   const headers = {
//     'Authorization': `Bearer ${apiKey}`,
//     'Content-Type': 'application/json'
//   };

//   const requestData = {
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: prompt }],
//     max_tokens: 150
//   };

//   try {
//     const response = await axios.post(endpoint, requestData, { headers });
//     return response.data.choices[0].message.content.trim();
//   } catch (error) {
//     console.error('Error communicating with OpenAI:', error.message);
//     throw new Error('Failed to communicate with OpenAI API');
//   }
// }

// module.exports = { getResponse };











const { OpenAI } = require('openai');
require('dotenv').config();
// console.log(process.env.OPEN_AI_API_KEY)

// const openai = new OpenAI({
//   apiKey: process.env.OPEN_AI_API_KEY // This is also the default, can be omitted
// });

const apiKey=process.env.OPEN_AI_API_KEY
console.log(apiKey)
const openai = new OpenAI({ apiKey: apiKey});


const getResponse = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: 'user', content: prompt }],
    });
    // console.log("hiee",completion.choices)
    const response = completion.choices[0].message.content
    console.log("hiee",response)
    return response;
    // return completion.choices[0];
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    throw new Error('Failed to get response from OpenAI');
  }
};

module.exports = { getResponse };
