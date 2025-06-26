const questions = [
    {
        question: "¿Cuál es la capital de Francia?",
        answers: ["Madrid", "París", "Roma", "Berlín"],
        correct: 1
    },
    {
        question: "¿Quién escribió 'Cien años de soledad'?",
        answers: ["Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar", "Pablo Neruda"],
        correct: 0
    },
    {
        question: "¿Cuál es el elemento químico con símbolo O?",
        answers: ["Oro", "Oxígeno", "Osmio", "Oxalato"],
        correct: 1
    },
    // Ejemplo 1
    {
        question: "¿En qué año llegó el hombre a la Luna?",
        answers: ["1965", "1969", "1972", "1959"],
        correct: 1
    },
    // Ejemplo 2
    {
        question: "¿Cuál es el río más largo del mundo?",
        answers: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"],
        correct: 1
    },
    // Ejemplo 3
    {
        question: "¿Quién pintó la Mona Lisa?",
        answers: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Claude Monet"],
        correct: 1
    }
];

// NUEVO: Selección de número de preguntas
const container = document.querySelector('.container');
const questionContainer = document.getElementById('question-container');
const scoreDiv = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');

let selectedQuestions = [];
let numQuestions = 3;
let questionEl, answersEl, scoreEl;
let currentQuestion = 0;
let score = 0;

function showStartScreen() {
    container.innerHTML = `
        <h1>Juego de Trivial</h1>
        <form id="start-form">
            <label for="num">¿Cuántas preguntas quieres responder? (1-${questions.length})</label>
            <input type="number" id="num" name="num" min="1" max="${questions.length}" value="${questions.length}" required style="width:60px; margin-left:8px;">
            <button type="submit">Comenzar</button>
        </form>
    `;
    document.getElementById('start-form').onsubmit = function(e) {
        e.preventDefault();
        numQuestions = parseInt(document.getElementById('num').value, 10);
        startGame();
    };
}

function startGame() {
    // Selecciona preguntas aleatorias
    selectedQuestions = questions.slice().sort(() => Math.random() - 0.5).slice(0, numQuestions);
    currentQuestion = 0;
    score = 0;
    renderGameUI();
    // Reasignar referencias tras renderizar la UI
    questionEl = document.getElementById('question');
    answersEl = document.getElementById('answers');
    scoreEl = document.getElementById('score');
    nextBtn = document.getElementById('next-btn');
    nextBtn.onclick = nextQuestion;
    showQuestion();
}

function renderGameUI() {
    container.innerHTML = `
        <h1>Juego de Trivial</h1>
        <div id="question-container">
            <div id="question">Cargando pregunta...</div>
            <div id="answers"></div>
        </div>
        <div id="score">Puntuación: 0</div>
        <button id="next-btn">Siguiente</button>
    `;
    // Reasignar referencias correctamente
    questionEl = document.getElementById('question');
    answersEl = document.getElementById('answers');
    scoreEl = document.getElementById('score');
    nextBtn = document.getElementById('next-btn');
    nextBtn.onclick = nextQuestion;
}

function showQuestion() {
    if (!selectedQuestions[currentQuestion]) {
        // Si no hay pregunta, termina el juego
        questionEl.textContent = '¡Juego terminado!';
        answersEl.innerHTML = '';
        nextBtn.style.display = 'none';
        return;
    }
    const q = selectedQuestions[currentQuestion];
    questionEl.textContent = q.question;
    answersEl.innerHTML = '';
    q.answers.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(idx);
        answersEl.appendChild(btn);
    });
    nextBtn.style.display = 'none';
}

function selectAnswer(idx) {
    const q = selectedQuestions[currentQuestion];
    if (idx === q.correct) {
        score++;
        scoreEl.textContent = `Puntuación: ${score}`;
    }
    Array.from(answersEl.children).forEach((btn, i) => {
        btn.disabled = true;
        btn.style.background = i === q.correct ? '#4caf50' : '#f44336';
        btn.style.color = '#fff';
    });
    nextBtn.style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < selectedQuestions.length) {
        showQuestion();
    } else {
        questionEl.textContent = '¡Juego terminado!';
        answersEl.innerHTML = '';
        nextBtn.style.display = 'none';
        scoreEl.textContent += ` | Preguntas respondidas: ${selectedQuestions.length}`;
        // Botón para volver a empezar
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Jugar de nuevo';
        restartBtn.onclick = showStartScreen;
        scoreEl.parentNode.appendChild(restartBtn);
    }
}

// Iniciar con pantalla de selección
showStartScreen();
