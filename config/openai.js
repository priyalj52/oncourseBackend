const { OpenAI } = require('openai');
require('dotenv').config();
// console.log(process.env.OPEN_AI_API_KEY)

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY // This is also the default, can be omitted
});

module.exports=openai