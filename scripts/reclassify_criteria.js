// Script para reclasificar preguntas del trivial budista
// Criterios de clasificación:

// FÁCIL: Conceptos básicos del budismo que cualquier persona con conocimientos elementales puede saber
const easyTopics = [
    // Biografía básica del Buda
    'Buda.*sufrimiento',
    'principio universal.*Buda',
    'Siddhartha',
    'Gautama', 
    'bodhi.*árbol',
    'despertar.*Buda',
    
    // Conceptos fundamentales simples
    'Todos somos Budas',
    'tomar refugio',
    'tres tesoros',
    'Buda.*Dharma.*Sangha',
    
    // Prácticas básicas
    'meditación.*sentado',
    'respiración',
    'mindfulness.*atención',
];

// INTERMEDIO: Conocimientos de budismo general, historia, escuelas principales
const intermediateTopics = [
    // Historia del budismo
    'canon pali',
    'Tripitaka',
    'concilio',
    'magadhi',
    'Ashoka',
    'compilación.*textos',
    
    // Escuelas principales
    'Theravada',
    'Mahayana',
    'Vajrayana',
    'Zen',
    'Tierra Pura',
    
    // Conceptos filosóficos intermedios
    'cuatro nobles verdades',
    'noble sendero.*óctuple',
    'cinco preceptos',
    'karma.*general',
    'samsara.*ciclo',
];

// DIFÍCIL: Filosofía avanzada, textos específicos, terminología técnica
const difficultTopics = [
    // Filosofía avanzada
    'Madhyamika',
    'Nagarjuna',
    'sunyata',
    'vacuidad.*técnica',
    'Vigrahavyavartani',
    'paticcasamuppada',
    'skandhas.*técnico',
    
    // Textos específicos y autores
    'Asanga',
    'Vasubandhu',
    'Buddhaghosa',
    'Abhidhamma.*específico',
    
    // Terminología técnica
    'dharmadhatu',
    'alaya.*vijnana',
    'bodhicitta.*técnico',
    'tathagatagarbha',
];

console.log('Criterios de reclasificación definidos');
