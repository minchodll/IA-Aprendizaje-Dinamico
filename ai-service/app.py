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

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel

import bank_editor
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


class ConfirmarTemaRequest(BaseModel):
    tema: dict


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


# ---- Plantilla para que un docente proponga un tema/ejercicios nuevos ----
# (ver bank_editor.py para el detalle del flujo plantilla -> preview -> confirmar)

@app.get("/plantilla-banco")
def plantilla_banco():
    contenido = bank_editor.generar_plantilla()
    return Response(
        content=contenido,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=plantilla-tema.docx"},
    )


@app.post("/banco/preview")
async def banco_preview(archivo: UploadFile = File(...)):
    contenido = await archivo.read()
    try:
        return bank_editor.parsear_docx(contenido)
    except Exception as e:
        return {"tema": None, "errores": [f"No se pudo leer el documento: {e}"], "advertencias": []}


@app.post("/banco/confirmar")
def banco_confirmar(req: ConfirmarTemaRequest):
    return bank_editor.agregar_tema_al_banco(req.tema)
