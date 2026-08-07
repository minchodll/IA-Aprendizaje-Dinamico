"""Carga los modelos entrenados por train_classifier.py y expone las
funciones de prediccion usadas por app.py.

predecir_categoria() prioriza la heuristica por palabras clave sobre el
modelo de TensorFlow. Se probo con temas reales durante el desarrollo y el
modelo (entrenado con ~70 muestras) fallaba incluso en casos obvios donde el
docente escribe literalmente el nombre del programa (p.ej. clasifico un tema
sobre "seguridad y contraseñas" como powerpoint, y uno sobre "formulas de
Excel" como word). La heuristica por palabras clave es determinista y nunca
falla en esos casos explicitos; el modelo de TensorFlow queda para cuando el
docente describe el tema sin mencionar el nombre del programa/categoria (ahi
si generaliza razonablemente sobre parafraseos, ver README).
"""

from pathlib import Path
import numpy as np
import tensorflow as tf

MODELS_DIR = Path(__file__).resolve().parent / "models"

_PALABRAS_CLAVE = {
    "excel": ["excel", "hoja de calculo", "hoja de cálculo", "formula", "fórmula", "celda"],
    "word": ["word", "documento", "procesador de texto"],
    "powerpoint": ["powerpoint", "presentacion", "presentación", "diapositiva"],
    "internet_redes": ["internet", "red", "redes", "ip", "router", "navegador"],
    "sistema_operativo": ["sistema operativo", "windows", "proceso", "archivos"],
    "hardware_software": ["hardware", "software", "cpu", "ram", "componente"],
    "seguridad_informatica": ["seguridad", "virus", "contraseña", "phishing", "antivirus"],
}


def _cargar(nombre_modelo):
    model_path = MODELS_DIR / f"{nombre_modelo}.keras"
    labels_path = MODELS_DIR / f"{nombre_modelo}_labels.txt"
    if not model_path.exists() or not labels_path.exists():
        return None, None
    modelo = tf.keras.models.load_model(model_path)
    etiquetas = labels_path.read_text(encoding="utf-8").splitlines()
    return modelo, etiquetas


_categoria_model, _categoria_labels = _cargar("categoria_model")
_dificultad_model, _dificultad_labels = _cargar("dificultad_model")


def _heuristica_categoria(texto):
    texto_normalizado = texto.lower()
    for categoria, palabras in _PALABRAS_CLAVE.items():
        if any(palabra in texto_normalizado for palabra in palabras):
            return categoria
    return None


def predecir_categoria(texto):
    categoria_heuristica = _heuristica_categoria(texto)
    if categoria_heuristica is not None:
        return categoria_heuristica

    if _categoria_model is not None:
        entrada = np.array([texto], dtype=object)
        prediccion = _categoria_model.predict(entrada, verbose=0)[0]
        return _categoria_labels[prediccion.argmax()]

    return None


def predecir_dificultad(texto):
    if _dificultad_model is not None:
        entrada = np.array([texto], dtype=object)
        prediccion = _dificultad_model.predict(entrada, verbose=0)[0]
        return _dificultad_labels[prediccion.argmax()]
    return "basico"
