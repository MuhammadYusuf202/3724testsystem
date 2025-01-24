let questions = []; // Array to store all questions
let currentQuestionIndex = 0; // Index of the current question
let userAnswers = []; // Array to store user's answers
let username = ""; // Username of the user
let startTime = null; // Start time of the test
let timerInterval = null; // Interval for the timer

// Load test data from txt file
async function loadTests() {
  const response = await fetch("tests.txt"); // Fetch the test file
  const text = await response.text(); // Get the text content of the file
  const lines = text.split("\n"); // Split the text into lines

  let question = {}; // Object to store a single question
  lines.forEach((line) => {
    if (line.startsWith("?")) { // If the line starts with '?', it's a question
      if (question.text) questions.push(question); // Push the previous question to the array
      question = { text: line.slice(2).trim(), options: [], correctAnswer: "" }; // Create a new question object
    } else if (line.startsWith("+") || line.startsWith("=")) { // If the line starts with '+' or '=', it's an option
      const isCorrect = line.startsWith("+"); // Check if the option is correct
      const optionText = line.slice(1).trim(); // Remove the prefix and trim the option text
      question.options.push(optionText); // Add the option to the question
      if (isCorrect) question.correctAnswer = optionText; // Set the correct answer
    }
  });
  if (question.text) questions.push(question); // Push the last question to the array

  // Randomize the order of questions and options
  questions = shuffleArray(questions);
  questions.forEach(question => {
    question.options = shuffleArray(question.options); // Shuffle options for each question
  });
}

// Shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Start the test with all questions
function startTest() {
  username = document.getElementById("username").value.trim(); // Get the username
  if (!username) return alert("Пожалуйста, введите имя пользователя."); // Alert if username is empty

  document.getElementById("login-screen").style.display = "none"; // Hide the login screen
  document.getElementById("test-screen").style.display = "block"; // Show the test screen
  startTimer(); // Start the timer
  loadQuestion(); // Load the first question
}

// Start the test with 25 random questions
function startRandomTest() {
  username = document.getElementById("username").value.trim(); // Get the username
  if (!username) return alert("Пожалуйста, введите имя пользователя."); // Alert if username is empty

  // Select 25 random questions
  const randomQuestions = shuffleArray(questions).slice(0, 25);
  questions = randomQuestions;

  document.getElementById("login-screen").style.display = "none"; // Hide the login screen
  document.getElementById("test-screen").style.display = "block"; // Show the test screen
  startTimer(); // Start the timer
  loadQuestion(); // Load the first question
}

// Start the timer
function startTimer() {
  startTime = new Date(); // Set the start time
  timerInterval = setInterval(updateTimer, 1000); // Update the timer every second
}

// Update the timer
function updateTimer() {
  const now = new Date(); // Get the current time
  const elapsed = new Date(now - startTime); // Calculate the elapsed time
  const hours = String(elapsed.getUTCHours()).padStart(2, "0"); // Format hours
  const minutes = String(elapsed.getUTCMinutes()).padStart(2, "0"); // Format minutes
  const seconds = String(elapsed.getUTCSeconds()).padStart(2, "0"); // Format seconds
  document.getElementById("timer").innerText = `${hours}:${minutes}:${seconds}`; // Update the timer display
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval); // Clear the timer interval
}

// Load a question
function loadQuestion() {
  const question = questions[currentQuestionIndex]; // Get the current question
  document.getElementById("question").innerText = question.text; // Display the question text
  document.getElementById("question-counter").innerText = `${currentQuestionIndex + 1}/${questions.length}`; // Update the question counter

  // Add variant letters (а, б, в, г) to the options
  const variantLetters = ["а", "б", "в", "г"];
  const optionsHtml = question.options.map((option, index) => `
    <div class="option-button ${document.body.classList.contains('night') ? 'night' : 'day'}" onclick="selectOption(this)">
      ${variantLetters[index]}) ${option}
    </div>
  `).join(""); // Create HTML for the options
  document.getElementById("options").innerHTML = optionsHtml; // Display the options

  // Highlight selected answer if any
  const selectedAnswer = userAnswers[currentQuestionIndex];
  if (selectedAnswer) {
    const buttons = document.querySelectorAll(".option-button");
    buttons.forEach((button) => {
      if (button.innerText === selectedAnswer) {
        button.classList.add("selected"); // Highlight the selected answer
      }
    });
  }

  // Update buttons
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  document.getElementById("answer-btn").innerText = isLastQuestion ? "Завершить тестирование" : "Ответить"; // Update the button text
}

// Select an option
function selectOption(button) {
  const buttons = document.querySelectorAll(".option-button");
  buttons.forEach((btn) => btn.classList.remove("selected")); // Remove selection from all buttons
  button.classList.add("selected"); // Select the clicked button
  userAnswers[currentQuestionIndex] = button.innerText; // Store the selected answer
}

// Answer a question
function answerQuestion() {
  if (!userAnswers[currentQuestionIndex]) return alert("Пожалуйста, выберите ответ."); // Alert if no answer is selected

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++; // Move to the next question
    loadQuestion(); // Load the next question
  } else {
    stopTimer(); // Stop the timer
    showResults(); // Show the results
  }
}

// Skip a question
function skipQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++; // Move to the next question
    loadQuestion(); // Load the next question
  } else {
    stopTimer(); // Stop the timer
    showResults(); // Show the results
  }
}

// Show results
function showResults() {
  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length; // Calculate the number of correct answers
  document.getElementById("test-screen").style.display = "none"; // Hide the test screen
  document.getElementById("results-screen").style.display = "block"; // Show the results screen
  document.getElementById("score").innerText = `Вы ответили правильно на ${correctAnswers} из ${questions.length} вопросов.`; // Display the score

  // Save results to localStorage
  saveResults(correctAnswers);
}

// Save results to localStorage
function saveResults(correctAnswers) {
  const results = JSON.parse(localStorage.getItem("results")) || []; // Get existing results from localStorage
  const timeTaken = document.getElementById("timer").innerText; // Get the time taken
  const status = userAnswers.length === questions.length ? "Finished" : "Not finished"; // Determine the status
  results.push({ username, correctAnswers, timeTaken, status }); // Add the new result
  localStorage.setItem("results", JSON.stringify(results)); // Save the results to localStorage
}

// Show detailed results
function showDetailedResults() {
  const detailedResults = document.getElementById("detailed-results");
  if (detailedResults.style.display === "block") {
    detailedResults.style.display = "none"; // Hide detailed results if already shown
  } else {
    const detailedResultsHtml = questions.map((question, index) => `
      <div class="result-item ${document.body.classList.contains('night') ? 'night' : 'day'}">
        <h3>${question.text}</h3>
        <p><strong>Правильный ответ:</strong> <span class="correct-answer ${document.body.classList.contains('night') ? 'night' : 'day'}">${question.correctAnswer}</span></p>
        <p><strong>Ваш ответ:</strong> <span class="${userAnswers[index] === question.correctAnswer ? "correct-answer" : "wrong-answer"} ${document.body.classList.contains('night') ? 'night' : 'day'}">${userAnswers[index] || "Пропущено"}</span></p>
      </div>
    `).join(""); // Create HTML for detailed results
    detailedResults.innerHTML = detailedResultsHtml; // Display detailed results
    detailedResults.style.display = "block"; // Show detailed results
  }
}

// Show leaderboard
function showLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  if (leaderboard.style.display === "block") {
    leaderboard.style.display = "none"; // Hide leaderboard if already shown
  } else {
    const results = JSON.parse(localStorage.getItem("results")) || []; // Get results from localStorage
    const leaderboardHtml = `
      <table class="leaderboard-table ${document.body.classList.contains('night') ? 'night' : 'day'}">
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
    `; // Create HTML for the leaderboard
    leaderboard.innerHTML = leaderboardHtml; // Display the leaderboard
    leaderboard.style.display = "block"; // Show the leaderboard
  }
}

// Toggle color mode between day and night
function toggleColorMode() {
  const body = document.body;
  const topBar = document.querySelector('.top-bar');
  const footer = document.querySelector('.footer');
  const buttons = document.querySelectorAll('button');
  const optionButtons = document.querySelectorAll('.option-button');
  const correctAnswers = document.querySelectorAll('.correct-answer');
  const wrongAnswers = document.querySelectorAll('.wrong-answer');

  if (body.classList.contains('day')) {
    body.classList.remove('day');
    body.classList.add('night');
    topBar.classList.remove('day');
    topBar.classList.add('night');
    footer.classList.remove('day');
    footer.classList.add('night');
    buttons.forEach(button => {
      button.classList.remove('day');
      button.classList.add('night');
    });
    optionButtons.forEach(button => {
      button.classList.remove('day');
      button.classList.add('night');
    });
    correctAnswers.forEach(answer => {
      answer.classList.remove('day');
      answer.classList.add('night');
    });
    wrongAnswers.forEach(answer => {
      answer.classList.remove('day');
      answer.classList.add('night');
    });
    document.querySelector('.color-mode-switch button').innerText = 'Switch to Day Mode';
  } else {
    body.classList.remove('night');
    body.classList.add('day');
    topBar.classList.remove('night');
    topBar.classList.add('day');
    footer.classList.remove('night');
    footer.classList.add('day');
    buttons.forEach(button => {
      button.classList.remove('night');
      button.classList.add('day');
    });
    optionButtons.forEach(button => {
      button.classList.remove('night');
      button.classList.add('day');
    });
    correctAnswers.forEach(answer => {
      answer.classList.remove('night');
      answer.classList.add('day');
    });
    wrongAnswers.forEach(answer => {
      answer.classList.remove('night');
      answer.classList.add('day');
    });
    document.querySelector('.color-mode-switch button').innerText = 'Switch to Night Mode';
  }
}

// Initialize
loadTests(); // Load the tests when the page loads
