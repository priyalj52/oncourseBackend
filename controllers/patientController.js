const { addPatientToDatabase, getPatients } = require('../config/query');

const addPatient = async (req, res) => {
  const {  correctTest, correctDiagnosis } = req.body;
  const{age, gender, history, symptoms, additionalInfo}=req.body.patient
  // console.log(req.body.patient,"hii")
  try {
    const result = await addPatientToDatabase({
      age:age,
      gender:gender,
      history:history,
      symptoms:symptoms,
      additional_info: additionalInfo, 
      correct_test: correctTest, 
      correct_diagnosis: correctDiagnosis 
    });
    return res.json(result);
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Failed to add patient' });
  }
};

const fetchPatients = async (req, res) => {
  try {
    const patients = await getPatients();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};



const getPatientCase = async (req, res) => {
  try {
    const patients = await getPatients();
    const randomIndex = Math.floor(Math.random() * patients.length);
    const randomCase = patients[randomIndex];
console.log(randomCase,"randonnnn")
    const message = `The patient is a ${randomCase.age}-year-old ${randomCase.gender.toLowerCase()} with a history of ${randomCase.history.toLowerCase()}. They present with ${randomCase.symptoms.toLowerCase()}. These symptoms warrant further investigation. Let's go to the lab to diagnose further. What test should we run?`;

    res.json({ patient: randomCase, message,userId:randomCase.id });
  } catch (error) {
    console.error('Error fetching patient case:', error);
    res.status(500).json({ error: 'Failed to fetch patient case' });
  }
};

const calculateScore = async (req, res) => {
  // const { userId, testAnswer, diagnosisAnswer, patientId } = req.body;

  // try {
  //   const patients = await getPatients();
  //   const patient = patients.find(p => p.id === patientId);

  //   const openaiResponse = await openai.createCompletion({
  //     model: "text-davinci-003",
  //     prompt: `Patient details: Age: ${patient.age}, Gender: ${patient.gender}, History: ${patient.history}, Symptoms: ${patient.symptoms}, Additional Info: ${patient.additional_info}. User's test answer: ${testAnswer}. User's diagnosis answer: ${diagnosisAnswer}. Correct test: ${patient.correct_test}. Correct diagnosis: ${patient.correct_diagnosis}. Evaluate the user's answers and provide a score out of 10. If the test or diagnosis is incorrect, provide a hint.`,
  //     max_tokens: 150,
  //     temperature: 0.7,
  //   });

  //   const openaiMessage = openaiResponse.data.choices[0].text.trim();
  //   let score = parseInt(openaiMessage.match(/Score: (\d+)/)[1]);
  //   let hint = openaiMessage.includes('Hint:') ? openaiMessage.split('Hint:')[1].trim() : null;

  //   // Store the score in the database
  //   await addUserScore(userId, score);

  //   res.json({ message: openaiMessage, score, hint });
  // } catch (error) {
  //   console.error('Error calculating score:', error);
  //   res.status(500).json({ error: 'Failed to calculate score' });
  // }
};




module.exports = {
  addPatient,
  fetchPatients,
  getPatientCase,
  calculateScore
};
