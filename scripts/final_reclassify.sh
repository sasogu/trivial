#!/bin/bash

# Reclasificación final más precisa

cd /home/sasogu/web/trivial

echo "Reclasificación final basada en contenido específico..."

# Primero, mover preguntas muy técnicas que aún están como fáciles a difícil
perl -i -pe 's/level: "fácil"/level: "difícil"/ if /samadhi.*vacío|prañaparamita.*mente.*purificado|skandhas.*técnico|tathatá|dharmadhatu/i' questions.js

# Mover conceptos de filosofía budista intermedia de fácil a intermedio  
perl -i -pe 's/level: "fácil"/level: "intermedio"/ if /bodhisattva.*liberar.*sabe|sangha.*grupo.*universo|bodhi.*camino/i' questions.js

# Mover historia específica y fechas de fácil a intermedio
perl -i -pe 's/level: "fácil"/level: "intermedio"/ if /año.*\d+.*[ad]\.c\.|siglo.*[IV]+|Ashoka.*emperador|concilio.*budista/i' questions.js

# Identificar preguntas que SÍ deberían ser fáciles y están mal clasificadas
# Buscar preguntas básicas marcadas como intermedio que deberían ser fáciles
perl -i -pe 's/level: "intermedio"/level: "fácil"/ if /Buda.*sufrimiento.*experiencia común|principio universal.*elaboró Buda|tres tesoros.*budismo/i' questions.js

# Preguntas sobre conceptos básicos de meditación
perl -i -pe 's/level: "intermedio"/level: "fácil"/ if /meditación.*sentado|respiración.*atención|mindfulness.*básico/i' questions.js

echo "Reclasificación final completada."

# Estadísticas finales
echo "=== ESTADÍSTICAS FINALES ==="
echo "Fácil: $(grep -c 'level: "fácil"' questions.js)"
echo "Intermedio: $(grep -c 'level: "intermedio"' questions.js)" 
echo "Difícil: $(grep -c 'level: "difícil"' questions.js)"

# Verificar algunas preguntas fáciles para asegurar que son apropiadas
echo ""
echo "=== MUESTRA DE PREGUNTAS FÁCILES ==="
grep -A 1 'level: "fácil"' questions.js | grep 'question:' | head -5
