"""Entrena los modelos de TensorFlow a partir del banco de ejercicios semilla
(docs/exercise-bank/banco-ejercicios.json):

1. categoria_model: predice a que tema (excel, word, ..., seguridad_informatica)
   corresponde una descripcion libre de un tema ingresado por el docente.
2. dificultad_model: predice el nivel (basico/intermedio/avanzado) de un enunciado.
3. respuesta_embedder: modelo de embeddings entrenado clasificando cada
   respuesta (modelo + variantes) por ejercicio_id de origen; la capa densa
   previa al softmax se reutiliza en evaluator.py como vector semantico para
   medir similitud entre la respuesta del alumno y la respuesta esperada
   (RF5), sin depender de tensorflow-text/USE (sin wheels oficiales en Windows).

Es un modelo semilla/prototipo: el banco aporta pocas muestras por clase,
suficiente para demostrar el flujo (RF3/RF5), pero el train accuracy que
imprime no mide generalizacion real (no hay conjunto de validacion por lo
pequeno del dataset). Debe reentrenarse con mas datos conforme se amplie el
banco o se recojan intentos de estudiantes.

Uso:
    python train_classifier.py
"""

import numpy as np
import tensorflow as tf
from pathlib import Path

from bank_loader import build_training_samples, build_answer_samples

MODELS_DIR = Path(__file__).resolve().parent / "models"
MAX_TOKENS = 2000
SEQUENCE_LENGTH = 30
EMBEDDING_DIM = 32
RESPUESTA_EMBED_DIM = 24


def build_model(vectorizer, num_classes):
    model = tf.keras.Sequential([
        tf.keras.Input(shape=(1,), dtype=tf.string),
        vectorizer,
        tf.keras.layers.Embedding(MAX_TOKENS, EMBEDDING_DIM, mask_zero=True),
        tf.keras.layers.GlobalAveragePooling1D(),
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(num_classes, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


def train_one(samples, model_name):
    # dtype=object evita que numpy infiera un dtype de string de ancho fijo
    # (p.ej. '<U4000'), que Keras 3 no acepta como entrada tf.string.
    textos = np.array([texto for texto, _ in samples], dtype=object)
    etiquetas_texto = [etiqueta for _, etiqueta in samples]
    clases = sorted(set(etiquetas_texto))
    clase_a_indice = {clase: i for i, clase in enumerate(clases)}
    etiquetas = np.array([clase_a_indice[e] for e in etiquetas_texto])

    vectorizer = tf.keras.layers.TextVectorization(
        max_tokens=MAX_TOKENS, output_sequence_length=SEQUENCE_LENGTH
    )
    vectorizer.adapt(textos)

    model = build_model(vectorizer, len(clases))
    model.fit(textos, etiquetas, epochs=40, verbose=0)

    loss, acc = model.evaluate(textos, etiquetas, verbose=0)
    print(f"[{model_name}] muestras={len(textos)} clases={clases} accuracy_train={acc:.2f}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save(MODELS_DIR / f"{model_name}.keras")
    (MODELS_DIR / f"{model_name}_labels.txt").write_text("\n".join(clases), encoding="utf-8")


def train_embedder():
    """Entrena un modelo de embeddings de respuestas cortas, clasificando cada
    respuesta (modelo o variante) por el ejercicio_id al que pertenece. La capa
    densa previa al softmax queda como espacio vectorial donde respuestas
    parecidas en significado deberían quedar cerca (medido por coseno en
    evaluator.py), sin necesitar un modelo preentrenado externo.
    """
    samples = build_answer_samples()
    textos = np.array([texto for texto, _ in samples], dtype=object)
    ids_texto = [ejercicio_id for _, ejercicio_id in samples]
    clases = sorted(set(ids_texto))
    clase_a_indice = {clase: i for i, clase in enumerate(clases)}
    etiquetas = np.array([clase_a_indice[e] for e in ids_texto])

    vectorizer = tf.keras.layers.TextVectorization(
        max_tokens=MAX_TOKENS, output_sequence_length=SEQUENCE_LENGTH
    )
    vectorizer.adapt(textos)

    inputs = tf.keras.Input(shape=(1,), dtype=tf.string)
    x = vectorizer(inputs)
    x = tf.keras.layers.Embedding(MAX_TOKENS, EMBEDDING_DIM, mask_zero=True)(x)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    embedding = tf.keras.layers.Dense(RESPUESTA_EMBED_DIM, activation="tanh", name="embedding_vector")(x)
    outputs = tf.keras.layers.Dense(len(clases), activation="softmax")(embedding)

    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(textos, etiquetas, epochs=60, verbose=0)

    loss, acc = model.evaluate(textos, etiquetas, verbose=0)
    print(f"[respuesta_embedder] muestras={len(textos)} ejercicios={len(clases)} accuracy_train={acc:.2f}")

    embedder = tf.keras.Model(inputs, model.get_layer("embedding_vector").output)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    embedder.save(MODELS_DIR / "respuesta_embedder.keras")


def main():
    categoria_samples, dificultad_samples = build_training_samples()
    train_one(categoria_samples, "categoria_model")
    train_one(dificultad_samples, "dificultad_model")
    train_embedder()
    print(f"\nModelos guardados en {MODELS_DIR}")


if __name__ == "__main__":
    main()
