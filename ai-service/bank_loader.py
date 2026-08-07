"""Carga el banco de ejercicios semilla usado tanto para entrenar los
clasificadores de TensorFlow como para generar ejercicios en tiempo real."""

import json
from pathlib import Path

BANK_PATH = Path(__file__).resolve().parent.parent / "docs" / "exercise-bank" / "banco-ejercicios.json"


def load_bank():
    with open(BANK_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return data["temas"]


def build_training_samples():
    """Convierte el banco en pares (texto, categoria, dificultad) para entrenar.

    A nivel de tema (nombre_tema, competencia, conceptos_clave) solo se conoce
    la categoria, no la dificultad. A nivel de ejercicio (enunciado) se conocen
    ambas etiquetas.
    """
    categoria_samples = []  # (texto, categoria)
    dificultad_samples = []  # (texto, dificultad)

    for tema in load_bank():
        categoria = tema["categoria"]

        textos_tema = [tema["nombre_tema"], tema["competencia"], *tema["conceptos_clave"]]
        for texto in textos_tema:
            categoria_samples.append((texto, categoria))

        for ejercicio in tema["ejercicios"]:
            categoria_samples.append((ejercicio["enunciado"], categoria))
            dificultad_samples.append((ejercicio["enunciado"], ejercicio["dificultad"]))

    return categoria_samples, dificultad_samples


def build_answer_samples():
    """Pares (texto, ejercicio_id) para entrenar el embedder de respuestas:
    la respuesta modelo y cada variante alternativa de cada ejercicio de tipo
    'respuesta_corta' son ejemplos positivos de esa misma clase (ejercicio_id).
    """
    samples = []
    for tema in load_bank():
        for ejercicio in tema["ejercicios"]:
            if ejercicio["tipo"] != "respuesta_corta":
                continue
            textos = [ejercicio["respuesta_correcta"], *ejercicio.get("respuestas_alternativas", [])]
            for texto in textos:
                samples.append((texto, ejercicio["id"]))
    return samples


def find_exercise(ejercicio_id):
    """Busca un ejercicio por id en todo el banco. Devuelve (tema, ejercicio) o (None, None)."""
    for tema in load_bank():
        for ejercicio in tema["ejercicios"]:
            if ejercicio["id"] == ejercicio_id:
                return tema, ejercicio
    return None, None
