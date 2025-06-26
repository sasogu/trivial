const container = document.querySelector('.container');

let selectedQuestions = [];
let numQuestions = 3;
let questionEl, answersEl, scoreEl, nextBtn;
let currentQuestion = 0;
let score = 0;

// Cargar preguntas desde questions.js
let questions = [];

async function loadQuestions() {
    // Cargar el archivo de preguntas dinámicamente
    if (window.questions) {
        questions = window.questions;
        showStartScreen();
        return;
    }
    try {
        const module = await import('./questions.js');
        questions = module.questions;
        showStartScreen();
    } catch (e) {
        container.innerHTML = '<p style="color:red">No se pudieron cargar las preguntas.</p>';
    }
}

function showStartScreen() {
    container.innerHTML = `
        <h1>Explora la sabiduría ancestral del budismo</h1>
        <form id="start-form">
            <label for="num">¿Cuántas preguntas quieres responder? (1-${questions.length})</label>
    
            <input type="number" id="num" name="num" min="1" max="${questions.length}" value="${questions.length}" required style="width:60px; margin-left:8px;">
    
            <button type="submit">Comenzar</button>
        </form>
        <div id="error-msg" style="color:red;margin-top:10px;"></div>
    `;
    document.getElementById('start-form').onsubmit = function(e) {
        e.preventDefault();
        numQuestions = parseInt(document.getElementById('num').value, 10);
        if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > questions.length) {
            document.getElementById('error-msg').textContent = 'Por favor, elige un número válido de preguntas.';
            return;
        }
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
    setTimeout(showQuestion, 0); // Asegura que el DOM esté listo
}

function renderGameUI() {
    container.innerHTML = `
        <h1></h1>
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

// Iniciar cargando preguntas
loadQuestions();
