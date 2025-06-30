const container = document.querySelector('.container');
const gameContent = document.getElementById('game-content');

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
    gameContent.innerHTML = `
       
        <form id="start-form">
            <label for="num">¿Cuántas preguntas quieres responder? (1-${questions.length})</label>
             <div class="quick-select">
          
            <button type="button" class="quick-btn" data-num="5">5</button>
            <button type="button" class="quick-btn" data-num="10">10</button>
            <button type="button" class="quick-btn" data-num="15">15</button>
            <button type="button" class="quick-btn" data-num="20">20</button>
        </div>
            <input type="number" id="num" name="num" min="1" max="${questions.length}" value="0" required>
            <button type="submit">Comenzar</button>
        </form>
        <div id="error-msg" style="color:red;margin-top:10px;"></div>
        <div id="ranking-inicio"></div>
    `;
    // Listeners para los botones rápidos
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.onclick = function() {
            numQuestions = parseInt(this.dataset.num, 10);
            if (numQuestions > questions.length) numQuestions = questions.length;
            startGame();
        };
    });
    document.getElementById('start-form').onsubmit = function(e) {
        e.preventDefault();
        numQuestions = parseInt(document.getElementById('num').value, 10);
        if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > questions.length) {
            document.getElementById('error-msg').textContent = 'Por favor, elige un número válido de preguntas.';
            return;
        }
        startGame();
    };
    // Mostrar ranking automáticamente al cargar la pantalla inicial
    mostrarRankingInicio();
}

async function mostrarRankingInicio() {
    const div = document.getElementById('ranking-inicio');
    div.innerHTML = '<div style="text-align:center;color:#2193b0;">Cargando ranking...</div>';
    try {
        const ranking = await obtenerRanking(10);
        let html = '<div class="ranking-lista"><h3>Ranking</h3><ol>';
        ranking.forEach(r => {
            html += `<li><b>${r.nombre}</b> - ${r.puntuacion}</li>`;
        });
        html += '</ol></div>';
        div.innerHTML = html;
    } catch (e) {
        div.innerHTML = '<b style="color:red">No se pudo cargar el ranking.</b>';
    }
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
    gameContent.innerHTML = `
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

async function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < selectedQuestions.length) {
        showQuestion();
    } else {
        questionEl.textContent = '¡Juego terminado!';
        answersEl.innerHTML = '';
        nextBtn.style.display = 'none';
        scoreEl.textContent += ` | Preguntas respondidas: ${selectedQuestions.length}`;
        // Frase motivadora según el resultado
        const motivacion = document.createElement('div');
        motivacion.className = 'motivacion';
        let porcentaje = Math.round((score / selectedQuestions.length) * 100);
        if (porcentaje === 100) {
            motivacion.textContent = '¡Perfecto! Has alcanzado la sabiduría del Buda.';
        } else if (porcentaje >= 80) {
            motivacion.textContent = '¡Excelente! Estás en el camino del despertar.';
        } else if (porcentaje >= 50) {
            motivacion.textContent = '¡Muy bien! Sigue practicando y profundizando.';
        } else {
            motivacion.textContent = 'Cada paso es aprendizaje. ¡Sigue explorando la sabiduría budista!';
        }
        scoreEl.parentNode.appendChild(motivacion);
        // --- Ranking Firebase ---
        const nombreDiv = document.createElement('div');
        nombreDiv.className = 'ranking-nombre';
        nombreDiv.innerHTML = '<label>Introduce tu nombre para el ranking: <input id="nombreRanking" maxlength="20" style="margin-left:8px;"></label>';
        const guardarBtn = document.createElement('button');
        guardarBtn.textContent = 'Guardar puntuación';
        guardarBtn.className = 'styled-btn';
        guardarBtn.onclick = async () => {
            const nombre = document.getElementById('nombreRanking').value.trim() || 'Anónimo';
            await guardarPuntuacion(nombre, score);
            nombreDiv.innerHTML = '<b>¡Puntuación guardada!</b>';
            await mostrarRanking(); // <-- Asegura que se espera a mostrar el ranking
        };
        nombreDiv.appendChild(guardarBtn);
        scoreEl.parentNode.appendChild(nombreDiv);
        // Mostrar ranking automáticamente si ya hay puntuaciones
        mostrarRanking();
        async function mostrarRanking() {
            try {
                const ranking = await obtenerRanking(10);
                console.log('Ranking obtenido:', ranking); // DEBUG
                // El array ya viene ordenado de mayor a menor, no usar reverse
                let html = '<h3>Ranking</h3><ol style="text-align:left">';
                ranking.forEach(r => {
                    html += `<li><b>${r.nombre}</b> - ${r.puntuacion}</li>`;
                });
                html += '</ol>';
                let div = document.querySelector('.ranking-lista');
                if (!div) {
                    div = document.createElement('div');
                    div.className = 'ranking-lista';
                    scoreEl.parentNode.appendChild(div);
                }
                div.innerHTML = html;
            } catch (e) {
                console.error('Error mostrando ranking:', e);
                let div = document.querySelector('.ranking-lista');
                if (!div) {
                    div = document.createElement('div');
                    div.className = 'ranking-lista';
                    scoreEl.parentNode.appendChild(div);
                }
                div.innerHTML = '<b style="color:red">No se pudo cargar el ranking.</b>';
            }
        }
        // Botón para volver a empezar
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'Jugar de nuevo';
        restartBtn.onclick = showStartScreen;
        restartBtn.className = 'styled-btn';
        scoreEl.parentNode.appendChild(restartBtn);
    }
}

// --- INTEGRACIÓN FIREBASE RANKING ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, limitToLast, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const RANKING_PATH = 'ranking';

async function guardarPuntuacion(nombre, puntuacion) {
    await push(ref(db, RANKING_PATH), { nombre, puntuacion, fecha: Date.now() });
}

async function obtenerRanking(top = 10) {
    // Consulta todos los elementos y filtra solo los válidos
    const rankingRef = query(ref(db, RANKING_PATH));
    const snap = await get(rankingRef);
    let arr = [];
    snap.forEach(child => {
        const val = child.val();
        if (val && typeof val.puntuacion === 'number' && typeof val.nombre === 'string') {
            arr.push(val);
        }
    });
    // Ordena por puntuación descendente y, en caso de empate, por fecha más reciente
    arr.sort((a, b) => {
        if (b.puntuacion !== a.puntuacion) return b.puntuacion - a.puntuacion;
        return b.fecha - a.fecha;
    });
    return arr.slice(0, top);
}

// Iniciar cargando preguntas
loadQuestions();

// Prueba manual de obtención de ranking
obtenerRanking(10).then(ranking => {
  console.log('Ranking manual:', ranking);
}).catch(e => {
  console.error('Error manual ranking:', e);
});
