
const express = require('express');
const http = require('http');
// const socketIo = require('socket.io');
const { createTables, getPatientById } = require('./config/query');
const patientRoutes = require('./routes/patientRoutes');
const openAiService = require('./services/openAiService');
require('dotenv').config();
const cors = require('cors');
const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
app.use(cors({
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST'],
  }
});

app.use(express.json());
// Connect routes
app.use('/patients', patientRoutes);

// CORS configuration
app.use(cors());

let activeTest = {}; // track of current test state for each user



// Socket.io
io.on('connection', async (socket) => {
  console.log('New client connected');

 
  let userState = {
    stage: 'test', // 'test' or 'diagnosis'
    attempts: 0,
    maxAttempts: 5,
    patient: null,
  };

 
  socket.on('message', async (data) => {
    const { userId, input } = data;
    console.log(input,"input")
    console.log(userId,"id")
    try {
      if (!userState.patient) {
        userState.patient = await getPatientById(userId);
      }
     
      console.log("userrr",userState)
      userState.attempts += 1;

      let prompt;
      let maxScore = userState.maxAttempts - userState.attempts + 1;
      console.log("max",maxScore)
      if (userState.stage === 'test') {
        prompt = `Patient details: Age: ${userState.patient.age}, Gender: ${userState.patient.gender}, History: ${userState.patient.history}, Symptoms: ${userState.patient.symptoms}, Additional Info: ${userState.patient.additional_info}. User's test answer: ${input}. Correct test: ${userState.patient.correct_test}. Evaluate the user's test answer and provide a score out of ${maxScore}. If incorrect, provide a hint.`;
      } else {
        prompt = `Patient details: Age: ${userState.patient.age}, Gender: ${userState.patient.gender}, History: ${userState.patient.history}, Symptoms: ${userState.patient.symptoms}, Additional Info: ${userState.patient.additional_info}. User's diagnosis answer: ${input}. Correct diagnosis: ${userState.patient.correct_diagnosis}. Evaluate the user's diagnosis answer and provide a score out of ${maxScore}. If incorrect, provide a hint.`;
      }

      const response = await openAiService.getResponse(prompt);
      const aiResponse = response.trim();
      const scoreMatch = aiResponse.match(/Score: (\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const hintMatch = aiResponse.match(/Hint: (.*)/);
      const hint = hintMatch ? hintMatch[1] : null;

      socket.emit('message', { response: aiResponse, fromUser: false });

      if (userState.stage === 'test' && score === maxScore) {
        userState.stage = 'diagnosis'; // Move to diagnosis stage if test is correct
        userState.attempts = 0; // Reset attempts for diagnosis
        userState.maxAttempts = 5; // Reset max score for diagnosis
        socket.emit('message', { response: 'Now, please provide your diagnosis.', fromUser: false });
      } else if (userState.stage === 'diagnosis' && score === maxScore) {
        delete activeTest[userId]; // Clear user state after diagnosis
        socket.emit('message', { response: 'Diagnosis is correct. Session complete.', fromUser: false });
      }

      // score back to the client
      socket.emit('message', { response: `Score: ${score}`, fromUser: false });
    } catch (error) {
      console.error('Error in socket message:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  await createTables(); //  database tables on server start
  console.log(`Server is running on port ${PORT}`);
});