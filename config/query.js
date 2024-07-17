const db = require("./db");

// const createTables = async () => {
//   await db.query(`
//     CREATE TABLE IF NOT EXISTS patients (
//       id SERIAL PRIMARY KEY,
//       age INTEGER,
//       gender VARCHAR(10),
//       history TEXT,
//       symptoms TEXT,
//       additional_info TEXT,
//       correct_test VARCHAR(255),
//       correct_diagnosis VARCHAR(255)
//     )
//   `);

//   await db.query(`
//     CREATE TABLE IF NOT EXISTS users (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(255),
//       score INTEGER
//     )
//   `);
// };



const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        age INTEGER,
        gender VARCHAR(10),
        history TEXT,
        symptoms TEXT,
        additional_info TEXT,
        correct_test VARCHAR(255),
        correct_diagnosis VARCHAR(255)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        score INTEGER
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error; 
  }
};

module.exports = createTables;




const addPatientToDatabase = async (patient) => {
    const { age, gender, history, symptoms, additional_info, correct_test, correct_diagnosis } = patient;
  console.log(patient,"blyeee")
    const queryText = `
      INSERT INTO patients (age, gender, history, symptoms, additional_info, correct_test, correct_diagnosis)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
  
    const values = [age, gender, history, symptoms, additional_info, correct_test, correct_diagnosis];
  
    try {
      const { rows } = await db.query(queryText, values);
      return rows[0]; // Return the inserted patient record
    } catch (error) {
      throw error; // Throw any database errors for the caller to handle
    }
  };


  async function getPatients() {
    const query = 'SELECT * FROM patients';
    const { rows } = await db.query(query);
    return rows;
  }
  
  async function addUser(user) {
    const { name, score } = user;
    const query = 'INSERT INTO users (name, score) VALUES ($1, $2) RETURNING *';
    const values = [name, score];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
  
  async function getUsers() {
    const query = 'SELECT * FROM users';
    const { rows } = await db.query(query);
    return rows;
  }
  
  async function addAttempt(userId, answer, isCorrect) {
    const query = 'INSERT INTO attempts (user_id, answer, is_correct) VALUES ($1, $2, $3)';
    const values = [userId, answer, isCorrect];
    await db.query(query, values);
  }
  const getPatientById = async (id) => {
    const result = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
    return result.rows[0];
  };
 
module.exports = {
  createTables,
  addPatientToDatabase,
  getPatients,
    addUser,
    getUsers,
    addAttempt,
    getPatientById 
};
