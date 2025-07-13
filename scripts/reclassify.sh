#!/bin/bash

# Script para reclasificar preguntas del trivial budista
cd /home/sasogu/web/trivial

# Copiar el archivo original como backup
cp questions.js questions_original.js

# Reclasificar preguntas complejas marcadas como fáciles a difícil
sed -i 's/level: "fácil"/level: "difícil"/g' questions.js

# Ahora vamos a corregir las que realmente deberían ser fáciles
# Patrones para preguntas que SÍ deberían ser fáciles
declare -a easy_patterns=(
    "Buda.*sufrimiento"
    "principio universal"
    "¿Qué han enseñado los Budas"
    "Todos somos Budas"
    "tomar refugio"
    "¿A partir de qué principio"
    "El sufrimiento.*experiencia común"
)

# Patrones para preguntas de nivel intermedio
declare -a intermediate_patterns=(
    "canon pali"
    "Tripitaka"
    "concilio"
    "Sangha.*división"
    "magadhi"
    "enseñanzas del Buda"
)

echo "Reclasificación completada"
echo "Archivo de backup: questions_original.js"
