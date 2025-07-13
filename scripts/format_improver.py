#!/usr/bin/env python3
"""
Script para mejorar el formato y coherencia de las preguntas del trivial budista
"""
import re
import json

def improve_question_format(question_text):
    """Mejora el formato de una pregunta"""
    # Eliminar espacios extra
    question = question_text.strip()
    
    # Convertir preguntas que terminan en ":" a formato de pregunta
    if question.endswith(':'):
        # Casos especiales comunes
        if question.startswith('El ') or question.startswith('La '):
            question = '¿Qué es ' + question.lower()[3:-1] + '?'
        elif question.startswith('Los ') or question.startswith('Las '):
            question = '¿Qué son ' + question.lower()[4:-1] + '?'
        elif 'se compiló:' in question:
            question = question.replace(' se compiló:', '?').replace('El ', '¿Cuándo se compiló el ')
        elif 'defiende:' in question:
            question = question.replace(' defiende:', '?').replace('La escuela ', '¿Qué defiende la escuela ').replace('El ', '¿Qué defiende el ')
        else:
            question = '¿' + question[0].upper() + question[1:-1] + '?'
    
    # Asegurar que las preguntas empiecen con ¿
    if not question.startswith('¿') and question.endswith('?'):
        question = '¿' + question
    elif not question.endswith('?') and not question.endswith(':'):
        question = '¿' + question + '?'
    
    return question

def improve_answer_format(answer_text):
    """Mejora el formato de una respuesta"""
    answer = answer_text.strip()
    
    # Eliminar respuestas vacías
    if not answer:
        return None
        
    # Capitalizar primera letra excepto para artículos y preposiciones al inicio
    if answer and len(answer) > 0:
        # Nombres propios y lugares deben mantener mayúscula
        proper_nouns = ['Buda', 'Buddha', 'Nagarjuna', 'Tibet', 'China', 'India', 'Zen', 'Soto', 'Rinzai']
        
        # Si empieza con nombre propio, mantener mayúscula
        starts_with_proper = any(answer.startswith(noun) for noun in proper_nouns)
        
        if not starts_with_proper:
            # Minúscula para respuestas que no empiezan con nombre propio
            answer = answer[0].lower() + answer[1:] if len(answer) > 1 else answer.lower()
        
        # Casos especiales para respuestas que deben empezar con mayúscula
        if answer.startswith(('que ', 'se ', 'no ', 'sí', 'por ', 'en ', 'la ', 'el ', 'los ', 'las ')):
            pass  # Mantener minúscula
        elif re.match(r'^\d+', answer):  # Fechas y números
            pass  # Mantener como está
        else:
            # Otros casos, capitalizar
            answer = answer[0].upper() + answer[1:] if len(answer) > 1 else answer.upper()
    
    return answer

# El procesamiento principal se hará línea por línea en el siguiente script
print("Funciones de formato definidas. Ejecutar procesamiento principal...")
