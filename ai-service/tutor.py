"""Tutor con IA: acompañamiento conversacional para el alumno.

Igual que el resto del sistema (ver generator.py), esto NO es un modelo de
lenguaje que redacta explicaciones libres. Ante la pregunta del alumno,
busca -en todo el banco curado, o solo dentro de una categoría si se
indica una- el contenido REAL más parecido: conceptos clave del tema, o
el enunciado de un ejercicio. Responde con la retroalimentación real de
ese contenido -nunca un texto inventado- y sugiere un ejercicio de
práctica real del mismo tema.

Nota de diseño: se probó primero con el embedder de TensorFlow que ya usa
/evaluar-respuesta (evaluator.py), pero ese modelo se entrenó para una
tarea mucho más angosta (comparar una respuesta corta contra las 2-3
respuestas de referencia de UN ejercicio específico) y generalizaba mal
aquí: le daba similitud alta (hasta 0.9) a preguntas completamente
ajenas al banco. Como el objetivo es nunca sonar seguro de algo que no
lo es, se usa en su lugar una comparación por palabras clave (Jaccard
sobre tokens, quitando palabras vacías): es más simple, pero falla de
forma segura -da 0 ante una pregunta sin relación real- en vez de
inventar una coincidencia con confianza alta.
"""

import re

from bank_loader import load_bank

UMBRAL_CONFIANZA = 0.12

_STOPWORDS = {
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a', 'en', 'y', 'o',
    'que', 'es', 'son', 'para', 'por', 'con', 'sin', 'se', 'su', 'sus', 'lo', 'le', 'les', 'me',
    'mi', 'tu', 'no', 'si', 'como', 'cual', 'cuales', 'quien', 'sirve', 'sirven', 'uso', 'usa',
    'usar', 'entiendo', 'entender', 'significa', 'porque', 'hace', 'hacer', 'sentido', 'explica',
    'explicame', 'dime', 'ayuda', 'puedo', 'debo', 'sobre', 'este', 'esta', 'eso', 'ese', 'esa',
}


def _tokens(texto):
    palabras = re.findall(r"[a-záéíóúñ0-9]+", texto.lower())
    return {p for p in palabras if p not in _STOPWORDS and len(p) > 2}


def _similitud(a, b):
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return 0.0
    interseccion = ta & tb
    if not interseccion:
        return 0.0
    return len(interseccion) / len(ta | tb)


def _candidatos_explicativos(tema):
    """Arma la lista de contenido real del banco contra el que se compara
    la pregunta: los conceptos clave del tema, y cada ejercicio (comparando
    contra su enunciado, respondiendo con su retroalimentacion)."""
    candidatos = []
    for concepto in tema.get("conceptos_clave", []):
        candidatos.append({
            "texto_comparar": concepto,
            "explicacion": f"Eso forma parte de \"{tema['nombre_tema']}\": {concepto}.",
            "ejercicio": None,
            "tema": tema,
        })
    for ej in tema["ejercicios"]:
        explicacion = ej.get("retroalimentacion_correcta") or ej["enunciado"]
        candidatos.append({
            "texto_comparar": ej["enunciado"], "explicacion": explicacion, "ejercicio": ej, "tema": tema,
        })
    return candidatos


def responder_pregunta(pregunta, categoria=None):
    if categoria:
        temas = [t for t in load_bank() if t["categoria"] == categoria]
        if not temas:
            return {"error": f"Todavía no hay contenido en el banco para la categoría '{categoria}'."}
    else:
        temas = load_bank()

    candidatos = []
    for tema in temas:
        candidatos.extend(_candidatos_explicativos(tema))

    if not candidatos:
        return {"error": "El banco de ejercicios todavía no tiene contenido explicativo."}

    for c in candidatos:
        c["score"] = _similitud(pregunta, c["texto_comparar"])

    mejor = max(candidatos, key=lambda c: c["score"])

    if mejor["score"] < UMBRAL_CONFIANZA:
        return {
            "categoria": categoria,
            "nombre_tema": None,
            "respuesta": None,
            "confianza": round(mejor["score"], 3),
            "mensaje": "No encontré algo lo bastante parecido a tu pregunta en el banco de "
                       "ejercicios. Intenta preguntarlo de otra forma, o revísalo con tu docente.",
        }

    mejor_tema = mejor["tema"]
    if mejor["ejercicio"] is not None:
        ejercicio_sugerido = mejor["ejercicio"]
    elif mejor_tema["ejercicios"]:
        # El mejor match fue un concepto clave (no trae ejercicio propio):
        # se sugiere el ejercicio del MISMO tema mas parecido a la
        # pregunta, en vez de tomar el primero al azar.
        ejercicio_sugerido = max(
            mejor_tema["ejercicios"], key=lambda ej: _similitud(pregunta, ej["enunciado"])
        )
    else:
        ejercicio_sugerido = None

    return {
        "categoria": mejor_tema["categoria"],
        "nombre_tema": mejor_tema["nombre_tema"],
        "respuesta": mejor["explicacion"],
        "confianza": round(mejor["score"], 3),
        "ejercicio_sugerido": ejercicio_sugerido,
    }
