let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let username = "";
let startTime = null;
let timerInterval = null;

// Load test data from txt file
async function loadTests() {
  const response = await fetch("tests.txt");
  const text = await response.text();
  const lines = text.split("\n");

  let question = {};
  lines.forEach((line) => {
    if (line.startsWith("?")) {
      if (question.text) questions.push(question);
      question = { text: line.slice(2).trim(), options: [], correctAnswer: "" };
    } else if (line.startsWith("а)") || line.startsWith("б)") || line.startsWith("в)") || line.startsWith("г)")) {
      const isCorrect = line.includes("*");
      const optionText = line.replace("*", "").trim();
      question.options.push(optionText);
      if (isCorrect) question.correctAnswer = optionText;
    }
  });
  if (question.text) questions.push(question);

  // Randomize the order of questions
  questions = shuffleArray(questions);
}

// Shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Start the test
function startTest() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Пожалуйста, введите имя пользователя.");

  document.getElementById("login-screen").style.display = "none";
  document.getElementById("test-screen").style.display = "block";
  startTimer();
  loadQuestion();
}

// Start the timer
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
  const now = new Date();
  const elapsed = new Date(now - startTime);
  const hours = String(elapsed.getUTCHours()).padStart(2, "0");
  const minutes = String(elapsed.getUTCMinutes()).padStart(2, "0");
  const seconds = String(elapsed.getUTCSeconds()).padStart(2, "0");
  document.getElementById("timer").innerText = `${hours}:${minutes}:${seconds}`;
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Load a question
function loadQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById("question").innerText = question.text;
  document.getElementById("question-counter").innerText = `${currentQuestionIndex + 1}/${questions.length}`;
  const optionsHtml = question.options.map((option) => `
    <div class="option-button" onclick="selectOption(this)">${option}</div>
  `).join("");
  document.getElementById("options").innerHTML = optionsHtml;

  // Highlight selected answer if any
  const selectedAnswer = userAnswers[currentQuestionIndex];
  if (selectedAnswer) {
    const buttons = document.querySelectorAll(".option-button");
    buttons.forEach((button) => {
      if (button.innerText === selectedAnswer) {
        button.classList.add("selected");
      }
    });
  }

  // Update buttons
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  document.getElementById("answer-btn").innerText = isLastQuestion ? "Завершить тестирование" : "Ответить";
}

// Select an option
function selectOption(button) {
  const buttons = document.querySelectorAll(".option-button");
  buttons.forEach((btn) => btn.classList.remove("selected"));
  button.classList.add("selected");
  userAnswers[currentQuestionIndex] = button.innerText;
}

// Answer a question
function answerQuestion() {
  if (!userAnswers[currentQuestionIndex]) return alert("Пожалуйста, выберите ответ.");

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    stopTimer();
    showResults();
  }
}

// Skip a question
function skipQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    stopTimer();
    showResults();
  }
}

// Show results
function showResults() {
  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  document.getElementById("test-screen").style.display = "none";
  document.getElementById("results-screen").style.display = "block";
  document.getElementById("score").innerText = `Вы ответили правильно на ${correctAnswers} из ${questions.length} вопросов.`;

  // Save results to localStorage
  saveResults(correctAnswers);
}

// Save results to localStorage
function saveResults(correctAnswers) {
  const results = JSON.parse(localStorage.getItem("results")) || [];
  const timeTaken = document.getElementById("timer").innerText;
  const status = userAnswers.length === questions.length ? "Finished" : "Not finished";
  results.push({ username, correctAnswers, timeTaken, status });
  localStorage.setItem("results", JSON.stringify(results));
}

// Show detailed results
function showDetailedResults() {
  const detailedResults = document.getElementById("detailed-results");
  if (detailedResults.style.display === "block") {
    detailedResults.style.display = "none";
  } else {
    const detailedResultsHtml = questions.map((question, index) => `
      <div class="result-item">
        <h3>${question.text}</h3>
        <p><strong>Правильный ответ:</strong> <span class="correct-answer">${question.correctAnswer}</span></p>
        <p><strong>Ваш ответ:</strong> <span class="${userAnswers[index] === question.correctAnswer ? "correct-answer" : "wrong-answer"}">${userAnswers[index] || "Пропущено"}</span></p>
      </div>
    `).join("");
    detailedResults.innerHTML = detailedResultsHtml;
    detailedResults.style.display = "block";
  }
}

// Show leaderboard
function showLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard.style.display === "block") {
    leaderboard.style.display = "none";
  } else {
    const results = JSON.parse(localStorage.getItem("results")) || [];
    const leaderboardHtml = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Результат</th>
            <th>Время</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          ${results.map((result) => `
            <tr>
              <td>${result.username}</td>
              <td>${result.correctAnswers} из ${questions.length}</td>
              <td>${result.timeTaken}</td>
              <td>${result.status}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    leaderboard.innerHTML = leaderboardHtml;
    leaderboard.style.display = "block";
  }
}

// Initialize
loadTests();
