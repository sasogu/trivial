#!/bin/bash

# Script para mejorar formato y coherencia de preguntas del trivial budista

cd /home/sasogu/web/trivial

echo "=== MEJORANDO FORMATO Y COHERENCIA DE PREGUNTAS ==="

# Crear backup
cp questions.js questions_before_format.js

# 1. Corregir errores tipográficos comunes
echo "1. Corrigiendo errores tipográficos..."
sed -i 's/pare el bien/para el bien/g' questions.js
sed -i 's/trasmigración/transmigración/g' questions.js
sed -i 's/Mâdhyamika/Madhyamika/g' questions.js
sed -i 's/sunyâta/sunyata/g' questions.js
sed -i 's/Mahâyâna/Mahayana/g' questions.js

# 2. Estandarizar formato de preguntas (agregar "?" donde falte)
echo "2. Estandarizando formato de preguntas..."
perl -i -pe 's/question: "([^"]+)([^?:])"/question: "$1$2?"/g unless /[?:]"$/' questions.js

# 3. Quitar el campo vacío innecesario de todas las respuestas
echo "3. Limpiando campos vacíos..."
perl -i -pe 's/,\s*"",?\s*]/]/g' questions.js

# 4. Estandarizar capitalización de respuestas (primera letra en minúscula excepto nombres propios)
echo "4. Estandarizando capitalización..."
# Esta parte se hará manualmente por ser más compleja

echo "=== FORMATO BÁSICO COMPLETADO ==="
echo "Backup guardado en: questions_before_format.js"
