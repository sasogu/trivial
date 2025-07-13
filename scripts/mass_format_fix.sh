#!/bin/bash

# Script para correcciones masivas de formato en preguntas

cd /home/sasogu/web/trivial

echo "=== CORRIGIENDO FORMATO DE PREGUNTAS MASIVAMENTE ==="

# Corregir preguntas que terminan en "?" pero no empiezan con "¿"
# Patrón: preguntas incompletas que solo tienen "?" al final
perl -i -pe '
    if (/question: "([^¿][^"]*)\?"/) {
        my $q = $1;
        if ($q =~ /^(El|La|Los|Las) (.+)$/) {
            $q = "¿Qué es $2?";
        } elsif ($q =~ /^(.+) escribió$/) {
            $q = "¿Qué escribió $1?";
        } elsif ($q =~ /^(.+) es conocida? como$/) {
            $q = "¿Cómo es conocid" . ($1 =~ /escuela|doctrina/ ? "a" : "o") . " $1?";
        } elsif ($q =~ /^(.+) sostiene que (.+)$/) {
            $q = "¿Qué sostiene $1 sobre $2?";
        } elsif ($q =~ /^(.+) causalidad$/) {
            $q = "¿Cómo es $1?";
        } else {
            $q = "¿$q?";
        }
        s/question: "[^"]*"/question: "$q"/;
    }
' questions.js

# Corregir preguntas que terminan en ":" y convertirlas a preguntas
perl -i -pe '
    if (/question: "([^"]*):\"/) {
        my $q = $1;
        if ($q =~ /^(.*) fue$/) {
            $q = "¿Quién fue $1?";
        } elsif ($q =~ /^(.*) es$/) {
            $q = "¿Qué es $1?";
        } else {
            $q = "¿$q?";
        }
        s/question: "[^"]*"/question: "$q"/;
    }
' questions.js

# Eliminar espacios extra en campos vacíos y limpiar formato
perl -i -pe 's/,\s*""\s*]/]/g' questions.js

# Estandarizar capitalización en respuestas
perl -i -pe 's/^(\s*)"([a-z])/\1"' . uc($2) . '/gm if /^\s*"[a-z]/' questions.js

echo "=== CORRECCIONES MASIVAS COMPLETADAS ==="

# Mostrar algunas estadísticas
echo "Preguntas con formato ¿...?: $(grep -c 'question: "¿.*?"' questions.js)"
echo "Preguntas con formato incorrecto: $(grep -c 'question: "[^¿].*[^?]"' questions.js)"
