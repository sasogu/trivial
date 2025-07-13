#!/bin/bash

# Reclasificación masiva de preguntas del trivial budista

cd /home/sasogu/web/trivial

echo "Iniciando reclasificación masiva..."

# Reclasificar conceptos complejos de fácil a difícil
echo "Cambiando conceptos filosóficos avanzados a difícil..."

# Cambiar conceptos específicos técnicos a difícil
perl -i -pe 's/level: "fácil"/level: "difícil"/ if /Yogacara|Cittamatra|Vijñanavada|alaya-vijnana|tathagatagarbha|trikaya|dharmadhatu/i' questions.js

# Cambiar términos técnicos específicos
perl -i -pe 's/level: "fácil"/level: "difícil"/ if /Abhidhamma.*específico|madhyamaka.*filosofía|skandhas.*técnico|samadhi.*vacío/i' questions.js

# Cambiar preguntas sobre bodhisattva paradójicas a intermedio
perl -i -pe 's/level: "fácil"/level: "intermedio"/ if /bodhisattva.*sabe que no hay|bodhisattva.*liberar.*seres/i' questions.js

# Cambiar historia del budismo de fácil a intermedio
perl -i -pe 's/level: "fácil"/level: "intermedio"/ if /concilio.*budista|Ashoka|canon.*compilación|magadhi.*idioma/i' questions.js

# Cambiar escuelas budistas específicas a intermedio
perl -i -pe 's/level: "fácil"/level: "intermedio"/ if /Theravada|Sangha.*división|Tripitaka.*colecciones/i' questions.js

echo "Reclasificación masiva completada."

# Mostrar estadísticas
echo "Nuevas estadísticas:"
echo "Fácil: $(grep -c 'level: "fácil"' questions.js)"
echo "Intermedio: $(grep -c 'level: "intermedio"' questions.js)" 
echo "Difícil: $(grep -c 'level: "difícil"' questions.js)"
