const container = document.querySelector('.container');
const gameContent = document.getElementById('game-content');

let selectedQuestions = [];
let numQuestions = 3;
let questionEl, answersEl, scoreEl, nextBtn;
let currentQuestion = 0;
let score = 0;
let selectedLevel = 'facil'; // Nivel por defecto

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
        <div class="level-select">
            <span>Selecciona nivel:</span>
            <div class="level-buttons">
                <button type="button" class="level-btn" data-level="facil">Fácil</button>
                <button type="button" class="level-btn" data-level="intermedio">Intermedio</button>
                <button type="button" class="level-btn" data-level="dificil">Difícil</button>
            </div>
        </div>
        <div class="quick-select">
            <span>Elige número de preguntas:</span>
            <div class="quick-buttons">
                <button type="button" class="quick-btn" data-num="5">5</button>
                <button type="button" class="quick-btn" data-num="10">10</button>
                <button type="button" class="quick-btn" data-num="15">15</button>
                <button type="button" class="quick-btn" data-num="20">20</button>
            </div>
        </div>
        <div id="error-msg" style="color:red;margin-top:10px;text-align:center;"></div>
        <div id="ranking-inicio"></div>
    `;
    // Selección de nivel
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.onclick = function() {
            // Normaliza el valor del botón para evitar problemas de tildes
            selectedLevel = this.dataset.level.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        };
    });
    document.querySelector('.level-btn[data-level="' + selectedLevel + '"]').classList.add('active');
    // Listeners para los botones rápidos
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.onclick = function() {
            // Filtrar preguntas por nivel
            const filtered = questions.filter(q => {
                if (!q.level) return false;
                return q.level.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === selectedLevel;
            });
            let n = parseInt(this.dataset.num, 10);
            if (n > filtered.length) n = filtered.length;
            numQuestions = n;
            if (n < 1) {
                document.getElementById('error-msg').textContent = 'No hay suficientes preguntas para este nivel.';
                return;
            }
            startGame();
        };
    });
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
    // Normaliza el valor del nivel para evitar problemas con tildes o mayúsculas
    const normalizedLevel = selectedLevel;
    const filtered = questions.filter(q => {
        if (!q.level) return false;
        return q.level.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === normalizedLevel;
    });
    const maxQuestions = filtered.length;
    if (maxQuestions === 0) {
        gameContent.innerHTML = '<div style="color:red;text-align:center;">No hay preguntas para este nivel.</div>';
        return;
    }
    if (numQuestions > maxQuestions) numQuestions = maxQuestions;
    selectedQuestions = filtered.slice().sort(() => Math.random() - 0.5).slice(0, numQuestions);
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
    // Barajar las respuestas antes de mostrarlas y guardar el nuevo índice correcto
    const respuestas = q.answers
        .map((a, i) => ({ text: a, originalIdx: i }))
        .filter(a => a.text && a.text.trim() !== '');
    for (let i = respuestas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [respuestas[i], respuestas[j]] = [respuestas[j], respuestas[i]];
    }
    // Guardar el índice de la respuesta correcta tras barajar
    q._shuffledCorrect = respuestas.findIndex(r => r.originalIdx === q.correct);
    // Guardar el último orden barajado para feedback
    q._lastShuffled = respuestas;
    respuestas.forEach((answerObj, idx) => {
        const btn = document.createElement('button');
        btn.textContent = answerObj.text;
        btn.onclick = () => selectAnswer(idx);
        answersEl.appendChild(btn);
    });
    nextBtn.style.display = 'none';
}

function selectAnswer(idx) {
    const q = selectedQuestions[currentQuestion];
    if (idx === q._shuffledCorrect) {
        score++;
        scoreEl.textContent = `Puntuación: ${score}`;
        vibrateSuccess(); // Feedback táctil por respuesta correcta
    } else {
        vibrateError(); // Feedback táctil por respuesta incorrecta
    }
    Array.from(answersEl.children).forEach((btn, i) => {
        btn.disabled = true;
        btn.style.background = i === q._shuffledCorrect ? '#4caf50' : '#f44336';
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
        restartBtn.className = 'styled-btn restart-btn';
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
    // Filtrar para que solo quede la mejor puntuación por nombre
    const mejoresPorNombre = {};
    arr.forEach(item => {
        const nombre = item.nombre.trim().toLowerCase();
        if (!mejoresPorNombre[nombre] || item.puntuacion > mejoresPorNombre[nombre].puntuacion ||
            (item.puntuacion === mejoresPorNombre[nombre].puntuacion && item.fecha > mejoresPorNombre[nombre].fecha)) {
            mejoresPorNombre[nombre] = item;
        }
    });
    // Convertir a array y ordenar por puntuación descendente y, en caso de empate, por fecha más reciente
    const filtrado = Object.values(mejoresPorNombre);
    filtrado.sort((a, b) => {
        if (b.puntuacion !== a.puntuacion) return b.puntuacion - a.puntuacion;
        return b.fecha - a.fecha;
    });
    return filtrado.slice(0, top);
}

// Iniciar cargando preguntas
loadQuestions();

// Prueba manual de obtención de ranking
obtenerRanking(10).then(ranking => {
  console.log('Ranking manual:', ranking);
}).catch(e => {
  console.error('Error manual ranking:', e);
});

// Funciones de feedback táctil para móviles
function vibrateOnTouch(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function vibrateSuccess() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function vibrateError() {
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
    }
}

// Detectar dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
}

// Agregar clase CSS para dispositivos móviles
if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
}

// Service Worker para actualización automática
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registrado con éxito:', registration);
                
                // Escuchar actualizaciones del service worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nueva versión del SW disponible');
                            // Mostrar notificación de actualización al usuario
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => console.log('SW falló al registrarse:', error));
        
        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SW_UPDATED') {
                console.log('Service Worker actualizado:', event.data.version);
                showUpdateNotification();
            }
        });
    });
}

function showUpdateNotification() {
    // Crear notificación discreta de actualización
    if (document.getElementById('update-notification')) return; // Evitar duplicados
    
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">📱 Nueva versión disponible</div>
        <div style="font-size: 12px; opacity: 0.9;">Toca para actualizar</div>
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    notification.onclick = () => {
        window.location.reload(true); // Forzar recarga completa
    };
    
    // Auto-ocultar después de 8 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 8000);
    
    document.body.appendChild(notification);
}

// --- Feedback flotante ---
(function() {
  const btn = document.getElementById('feedback-btn');
  const modal = document.getElementById('feedback-modal');
  const close = document.getElementById('feedback-close');
  const form = document.getElementById('feedback-form');
  const textarea = document.getElementById('feedback-msg');
  let lastQuestion = '';

  // Detectar pregunta actual si existe
  function getCurrentQuestion() {
    const q = document.getElementById('question');
    if (q && q.textContent && q.textContent.trim() && !q.textContent.includes('Cargando')) {
      return q.textContent.trim();
    }
    return '';
  }

  // Abrir modal
  btn.addEventListener('click', () => {
    modal.style.display = 'flex';
    textarea.value = '';
    lastQuestion = getCurrentQuestion();
    if (lastQuestion) {
      textarea.placeholder = 'Escribe aquí tu mensaje sobre la pregunta actual...';
    } else {
      textarea.placeholder = 'Escribe aquí tu sugerencia o error...';
    }
    setTimeout(() => textarea.focus(), 200);
  });

  // Cerrar modal
  close.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Enviar sugerencia por mailto
  form.addEventListener('submit', e => {
    e.preventDefault();
    const mensaje = textarea.value.trim();
    if (!mensaje) return;
    let asunto = 'Sugerencia/Reporte Trivial Budismo';
    let cuerpo = '';
    let pregunta = '';
    let respuestas = [];
    // Buscar la pregunta y respuestas actuales si existen
    if (lastQuestion) {
      pregunta = lastQuestion;
      // Buscar en selectedQuestions la pregunta actual
      let qObj = null;
      let respuestasMostradas = [];
      if (window.selectedQuestions && Array.isArray(window.selectedQuestions)) {
        qObj = window.selectedQuestions.find(q => q.question === lastQuestion);
        // Intentar obtener las respuestas barajadas del DOM
        const answersDiv = document.getElementById('answers');
        if (answersDiv) {
          respuestasMostradas = Array.from(answersDiv.children).map(btn => btn.textContent);
        }
      }
      if (!qObj && window.questions && Array.isArray(window.questions)) {
        qObj = window.questions.find(q => q.question === lastQuestion);
      }
      // Si hay respuestas mostradas en pantalla, usarlas; si no, usar las del objeto pregunta
      if (respuestasMostradas.length) {
        respuestas = respuestasMostradas;
      } else if (qObj && Array.isArray(qObj.answers)) {
        respuestas = qObj.answers;
      }
      asunto += ' - ' + pregunta;
      cuerpo += 'Pregunta actual: ' + pregunta + '\n';
      if (respuestas.length) {
        cuerpo += '\nRespuestas mostradas al usuario:\n';
        respuestas.forEach((r, i) => {
          cuerpo += `  ${i + 1}. ${r}\n`;
        });
      }
      cuerpo += '\n';
    }
    cuerpo += mensaje;
    const mail = 'sensei@daizansoriano.com'; // <-- CAMBIA AQUÍ POR TU EMAIL REAL
    window.open(`mailto:${mail}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`);
    modal.style.display = 'none';
  });
})();
