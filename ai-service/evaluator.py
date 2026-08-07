"""Evaluacion automatica de respuestas del alumno (RF5).

- opcion_multiple: comparacion directa contra respuesta_correcta, no necesita IA.
- respuesta_corta: se calcula el embedding semantico (TensorFlow, entrenado en
  train_classifier.py -> train_embedder()) de la respuesta del alumno y se
  compara por similitud coseno contra los embeddings de referencia
  (respuesta_correcta + respuestas_alternativas) de ese ejercicio especifico.

Si el embedder todavia no fue entrenado, cae a una heuristica de solapamiento
de palabras (Jaccard) para que el servicio no se caiga.
"""

from pathlib import Path
import numpy as np
import tensorflow as tf

from bank_loader import find_exercise

MODELS_DIR = Path(__file__).resolve().parent / "models"
UMBRAL_SIMILITUD = 0.6


def _cargar_embedder():
    model_path = MODELS_DIR / "respuesta_embedder.keras"
    if not model_path.exists():
        return None
    return tf.keras.models.load_model(model_path)


_embedder = _cargar_embedder()


def _normalizar(texto):
    return texto.strip().lower()


def _similitud_jaccard(a, b):
    set_a = set(_normalizar(a).split())
    set_b = set(_normalizar(b).split())
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def _embed(texto):
    entrada = np.array([texto], dtype=object)
    return _embedder.predict(entrada, verbose=0)[0]


def _cosine(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))


def _similitud_respuesta_corta(respuesta_alumno, respuestas_referencia):
    if _embedder is not None:
        vector_alumno = _embed(respuesta_alumno)
        similitudes = [_cosine(vector_alumno, _embed(ref)) for ref in respuestas_referencia]
    else:
        similitudes = [_similitud_jaccard(respuesta_alumno, ref) for ref in respuestas_referencia]
    return max(similitudes)


def evaluar_respuesta(ejercicio_id, respuesta_alumno):
    tema, ejercicio = find_exercise(ejercicio_id)
    if ejercicio is None:
        return {"error": f"No existe el ejercicio '{ejercicio_id}' en el banco"}

    if ejercicio["tipo"] == "opcion_multiple":
        correcto = _normalizar(respuesta_alumno) == _normalizar(ejercicio["respuesta_correcta"])
        return {
            "ejercicio_id": ejercicio_id,
            "tipo": "opcion_multiple",
            "correcto": correcto,
            "retroalimentacion": ejercicio["retroalimentacion_correcta"] if correcto else ejercicio["retroalimentacion_incorrecta"],
        }

    respuestas_referencia = [ejercicio["respuesta_correcta"], *ejercicio.get("respuestas_alternativas", [])]
    similitud = _similitud_respuesta_corta(respuesta_alumno, respuestas_referencia)
    correcto = similitud >= UMBRAL_SIMILITUD

    return {
        "ejercicio_id": ejercicio_id,
        "tipo": "respuesta_corta",
        "correcto": correcto,
        "similitud": round(similitud, 3),
        "retroalimentacion": ejercicio["retroalimentacion_correcta"] if correcto else ejercicio["retroalimentacion_incorrecta"],
    }
