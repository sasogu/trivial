#!/usr/bin/env python3
"""
Script para estandarizar la capitalización de todas las respuestas
Todas las respuestas deben empezar con mayúscula
"""

import re

def capitalize_first_letter(text):
    """Capitaliza la primera letra de un texto, manteniendo el resto igual"""
    if not text:
        return text
    return text[0].upper() + text[1:] if len(text) > 1 else text.upper()

def process_questions_file():
    """Procesa el archivo de preguntas para estandarizar capitalización"""
    
    # Leer el archivo
    with open('questions.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Patrón para encontrar arrays de respuestas
    # Busca líneas que empiecen con espacios, comillas, texto en minúscula
    pattern = r'^(\s*)"([a-z][^"]*)"'
    
    def replace_answer(match):
        spaces = match.group(1)
        answer_text = match.group(2)
        capitalized = capitalize_first_letter(answer_text)
        return f'{spaces}"{capitalized}"'
    
    # Aplicar la corrección
    corrected_content = re.sub(pattern, replace_answer, content, flags=re.MULTILINE)
    
    # Escribir el archivo corregido
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.write(corrected_content)
    
    print("✅ Capitalización de respuestas estandarizada")

if __name__ == "__main__":
    process_questions_file()
