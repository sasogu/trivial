#!/usr/bin/env python3
"""
Script para limpiar completamente el formato del archivo de preguntas
"""

import re

def clean_questions_file():
    """Limpia el archivo eliminando líneas vacías dentro de arrays"""
    
    with open('questions.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    cleaned_lines = []
    in_answers_array = False
    
    for line in lines:
        # Detectar si estamos dentro de un array de answers
        if 'answers: [' in line:
            in_answers_array = True
            cleaned_lines.append(line)
        elif in_answers_array and '],' in line:
            in_answers_array = False
            cleaned_lines.append(line)
        elif in_answers_array:
            # Solo agregar líneas que no estén vacías o con solo espacios
            if line.strip() and line.strip() not in ['', ',']:
                cleaned_lines.append(line)
        else:
            cleaned_lines.append(line)
    
    # Escribir el archivo limpio
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)
    
    print("✅ Archivo limpiado - eliminadas líneas vacías en arrays")

if __name__ == "__main__":
    clean_questions_file()
