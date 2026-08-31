"""Recomendaciones de refuerzo para un alumno que falla preguntas de un
tema de forma recurrente.

Como el resto del sistema (ver generator.py), esto NO es texto libre
generado por un LLM: selecciona ejercicios reales del mismo banco curado
que usa /generar-ejercicio, dirigidos a la categoria y nivel donde el
alumno realmente esta fallando, y arma el texto de la recomendacion a
partir de plantillas + los datos reales del tema (nombre, competencia,
cantidad de fallos). Es "dinamico" porque depende del desempeño real del
alumno, no porque el texto se invente.
"""

from generator import generar_ejercicios

NIVEL_TEXTO = {
    'basico': 'básico',
    'intermedio': 'intermedio',
    'avanzado': 'avanzado',
}


def generar_recomendacion(categoria, nivel, veces_fallada, excluir_ids=None):
    excluir_ids = set(excluir_ids or [])

    # Pedimos varios candidatos para poder descartar los que el alumno ya
    # vio (excluir_ids) y aun asi tener de donde elegir.
    resultado = generar_ejercicios(categoria, nivel, cantidad=8)
    if resultado is None:
        return {"error": f"No hay ejercicios en el banco para la categoria '{categoria}'"}

    ejercicios = resultado["ejercicios"]
    nuevos = [e for e in ejercicios if e["id"] not in excluir_ids]
    seleccionados = (nuevos or ejercicios)[:3]

    if not seleccionados:
        return {"error": f"No hay ejercicios disponibles en el banco para '{categoria}' nivel '{nivel}'"}

    nivel_txt = NIVEL_TEXTO.get(nivel, nivel or 'básico')
    palabra_pregunta = 'pregunta' if veces_fallada == 1 else 'preguntas'

    titulo = f"Refuerza: {resultado['nombre_tema']} (nivel {nivel_txt})"
    descripcion = (
        f"Has fallado {veces_fallada} {palabra_pregunta} de este tema. "
        f"Practica estos ejercicios de nivel {nivel_txt}: {resultado['competencia']}."
    )
    contenido = "\n".join(f"{i}. {ej['enunciado']}" for i, ej in enumerate(seleccionados, start=1))

    if veces_fallada >= 5:
        prioridad = 5
    elif veces_fallada >= 3:
        prioridad = 4
    else:
        prioridad = 3

    return {
        "titulo": titulo,
        "descripcion": descripcion,
        "contenido": contenido,
        "tipo": "ejercicio",
        "prioridad": prioridad,
        "ejercicios": seleccionados,
    }
