"""Selecciona ejercicios del banco segun categoria y nivel (RF3: generacion
guiada a partir de un banco curado, no texto generado libremente)."""

import random

from bank_loader import load_bank


def generar_ejercicios(categoria, nivel=None, cantidad=5):
    tema = next((t for t in load_bank() if t["categoria"] == categoria), None)
    if tema is None:
        return None

    candidatos = [e for e in tema["ejercicios"] if nivel is None or e["dificultad"] == nivel]
    if not candidatos:
        candidatos = list(tema["ejercicios"])

    candidatos = candidatos.copy()
    random.shuffle(candidatos)
    seleccionados = candidatos[:cantidad]

    return {
        "categoria": categoria,
        "nombre_tema": tema["nombre_tema"],
        "competencia": tema["competencia"],
        "nivel_solicitado": nivel,
        "ejercicios": seleccionados,
    }
