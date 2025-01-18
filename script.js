let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let username = "";

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
  loadQuestion();
}

// Load a question
function loadQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById("question").innerText = question.text;
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
    showResults();
  }
}

// Skip a question
function skipQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    showResults();
  }
}

// Show results
function showResults() {
  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  document.getElementById("test-screen").style.display = "none";
  document.getElementById("results-screen").style.display = "block";
  document.getElementById("score").innerText = `Вы ответили правильно на ${correctAnswers} из ${questions.length} вопросов.`;
}

// Show detailed results
function showDetailedResults() {
  const detailedResultsHtml = questions.map((question, index) => `
    <div class="result-item">
      <h3>${question.text}</h3>
      <p><strong>Правильный ответ:</strong> <span class="correct-answer">${question.correctAnswer}</span></p>
      <p><strong>Ваш ответ:</strong> <span class="${userAnswers[index] === question.correctAnswer ? "correct-answer" : "wrong-answer"}">${userAnswers[index] || "Пропущено"}</span></p>
    </div>
  `).join("");
  document.getElementById("detailed-results").innerHTML = detailedResultsHtml;
  document.getElementById("detailed-results").style.display = "block";
}

// Initialize
loadTests();