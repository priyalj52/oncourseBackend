const express = require('express');
const http = require('http');
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
app.use('/patients', patientRoutes);
app.use(cors());


let activeTest = {}; // Track the current test state for each user
let globalScore = 0; // Initialize global score
// let labScore=0;
// let diagnosisScore=0;
io.on('connection', async (socket) => {
  console.log('New client connected');
  
  socket.on('message', async (data) => {
    const { userId, input } = data;

    // Initialize userState if it doesn't exist
    if (!activeTest[userId]) {
      // Fetch patient details or initialize as needed
      activeTest[userId] = {
        stage: 'test', // 'test' or 'diagnosis'
        attempts: 0,
        maxAttempts: 5,
        patient: await getPatientById(userId),
        // globalScore: 0,

        labScore: 0,
        diagnosisScore: 0, // Fetch patient details
      };
    }

    const userState = activeTest[userId]; // Access user state

    try {
      console.log(`Input: ${input}`);
      console.log(`User ID: ${userId}`);

      userState.attempts += 1;

      let prompt;
      let maxScore = userState.maxAttempts - userState.attempts + 1;
      console.log(`Max Score: ${maxScore}`);

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
console.log("sc",score)
      socket.emit('message', { response: aiResponse, fromUser: false ,score:score});

      if (userState.stage === 'test' && score === maxScore) {
      userState.labScore+=score;
        globalScore += score; 
        userState.stage = 'diagnosis'; // Move to diagnosis stage if test is correct
        userState.attempts = 0; // Reset attempts for diagnosis
        userState.maxAttempts = 5; // Reset max score for diagnosis
        socket.emit('message', { response: 'Now, please provide your diagnosis.', fromUser: false});
      } else if (userState.stage === 'diagnosis' && score === maxScore) {
        userState.diagnosisScore+=score;
        globalScore += score; 
        delete activeTest[userId]; // Clear user state after diagnosis
        socket.emit('message', { response: 'Diagnosis is correct. Session complete.', fromUser: false });
        socket.emit('totalScore', { totalScore: globalScore });
        socket.emit('labScore', { labScore: userState.labScore });
        socket.emit('diagnosisScore', { diagnosisScore: userState.diagnosisScore });

      }
      console.log("global score", globalScore);

      // socket.emit('message', { response: `Score: ${score}`, fromUser: false });
    } catch (error) {
      console.error('Error in socket message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    globalScore = 0; // Reset global score on client disconnect

    labScore = 0; // Reset lab score on client disconnect
    diagnosisScore = 0; // Reset diagnosis score on client disconnect
  });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  await createTables(); // Create database tables on server start
  console.log(`Server is running on port ${PORT}`);
});
