#!/bin/bash

# Script final de limpieza y estandarización

cd /home/sasogu/web/trivial

echo "=== LIMPIEZA Y ESTANDARIZACIÓN FINAL ==="

# 1. Eliminar todos los campos vacíos de respuestas
echo "1. Eliminando campos vacíos..."
perl -i -pe 's/,\s*""\s*//g; s/\[\s*"",\s*/[/g; s/,\s*""\s*\]/]/g' questions.js

# 2. Asegurar que todas las respuestas empiecen con mayúscula
echo "2. Capitalizando respuestas..."
perl -i -pe 's/(\s*)"([a-z])/\1"' . uc($2) . '/g' questions.js

# 3. Corregir tildes y caracteres especiales
echo "3. Corrigiendo caracteres especiales..."
sed -i 's/Hinayâna/Hinayana/g' questions.js
sed -i 's/prañaparamita/prajñaparamita/g' questions.js
sed -i 's/Budha/Buda/g' questions.js

# 4. Asegurar formato consistente de preguntas
echo "4. Estandarizando formato de preguntas..."
# Preguntas que empiezan con "El" o "La" sin ¿
perl -i -pe 's/question: "(El|La) ([^"]+) es:"/question: "¿Qué es $2?"/g' questions.js
perl -i -pe 's/question: "(El|La) ([^"]+) fue:"/question: "¿Quién fue $2?"/g' questions.js

echo "=== LIMPIEZA COMPLETADA ==="

# Estadísticas finales
echo "Total de preguntas: $(grep -c 'question:' questions.js)"
echo "Preguntas con formato ¿...?: $(grep -c 'question: "¿.*?"' questions.js)"
echo "Campos vacíos restantes: $(grep -c '""' questions.js)"
