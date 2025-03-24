import express from 'express';
import bodyParser from 'body-parser';

import pg from 'pg';

const app = express();
const port = 3000;

// Fix: properly declare totalCorrect
let totalCorrect = 0;

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: 'den24is24',
    port: 5432
});

db.connect();



let quiz = [
  { country: 'USA', capital: 'Washington, D.C.' },
  { country: 'Japan', capital: 'Tokyo' },
  { country: 'India', capital: 'New Delhi' },
  { country: 'Russia', capital: 'Moscow' },
  { country: 'China', capital: 'Beijing' },
];

db.query('SELECT * FROM capitals', (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else{
    quiz = res.rows;
  }
  db.end();
});

// Initialize with a valid question object
let currentQuestion = quiz[0];

// Define the nextQuestion function once
function nextQuestion() {
  // Make sure we always get a valid question object
  if (quiz && quiz.length > 0) {
    const randomIndex = Math.floor(Math.random() * quiz.length);
    currentQuestion = quiz[randomIndex];
  } else {
    // Fallback in case quiz array is empty
    currentQuestion = { country: "Example", capital: "Example Capital" };
    console.error("Error: quiz array is empty or undefined");
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log("Current question:", currentQuestion);
  res.render('index', { question: currentQuestion });
});

app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  
  // Add error handling to prevent undefined errors
  if (currentQuestion && currentQuestion.capital) {
    if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
      totalCorrect++;
      console.log("Total correct:", totalCorrect);
      isCorrect = true;
    }
  } else {
    console.error("Error: currentQuestion or currentQuestion.capital is undefined");
  }
  
  nextQuestion();
  res.render('index', { 
    question: currentQuestion, 
    wasCorrect: isCorrect, 
    totalScore: totalCorrect 
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});