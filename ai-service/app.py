"""Microservicio de IA: generacion guiada (RF3) y evaluacion automatica (RF5)
de ejercicios.

Contrato con el backend Node.js:
    POST /generar-ejercicio
        body: {"tema": "...", "nivel": "basico|intermedio|avanzado" (opcional), "cantidad": 5 (opcional)}
        -> {"categoria", "nombre_tema", "competencia", "nivel_solicitado", "ejercicios": [...]}

    POST /evaluar-respuesta
        body: {"ejercicio_id": "excel-3", "respuesta_alumno": "..."}
        -> {"ejercicio_id", "tipo", "correcto", "similitud" (solo respuesta_corta), "retroalimentacion"}

La clasificacion de categoria/dificultad a partir del texto libre del tema la
hace TensorFlow (classifier.py); la seleccion de ejercicios en si viene del
banco semilla (generator.py + bank_loader.py). La evaluacion de respuesta
corta usa un embedder de TensorFlow entrenado sobre el banco (evaluator.py).

Correr con:
    uvicorn app:app --reload --port 8500
"""

from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

import classifier
import evaluator
import generator

app = FastAPI(title="Microservicio IA - Generacion y Evaluacion de Ejercicios")


class GenerarRequest(BaseModel):
    tema: str
    nivel: Optional[str] = None
    cantidad: Optional[int] = 5


class EvaluarRequest(BaseModel):
    ejercicio_id: str
    respuesta_alumno: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generar-ejercicio")
def generar_ejercicio(req: GenerarRequest):
    categoria = classifier.predecir_categoria(req.tema)
    if categoria is None:
        return {"error": f"No se pudo determinar una categoria para el tema: '{req.tema}'"}

    nivel = req.nivel or classifier.predecir_dificultad(req.tema)
    resultado = generator.generar_ejercicios(categoria, nivel, req.cantidad or 5)

    if resultado is None:
        return {"error": f"No hay ejercicios en el banco para la categoria '{categoria}'"}

    return resultado


@app.post("/evaluar-respuesta")
def evaluar_respuesta(req: EvaluarRequest):
    return evaluator.evaluar_respuesta(req.ejercicio_id, req.respuesta_alumno)
