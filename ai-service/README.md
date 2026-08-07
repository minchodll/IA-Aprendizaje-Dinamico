# Microservicio de IA — Generación (RF3) y evaluación (RF5) de ejercicios

Prototipo del microservicio de IA descrito en la tesis (Marco Teórico 3.1, RF3,
RF5, RNF2): un servicio Python separado del backend Node.js, que el backend
llama por HTTP para generar ejercicios a partir de un tema y para evaluar las
respuestas de los alumnos.

## Qué hace (y qué no) en esta fase

- **Genera** ejercicios: selecciona un subconjunto del [banco semilla](../docs/exercise-bank/banco-ejercicios.json)
  que coincide con la categoría y el nivel de dificultad pedidos.
- **Clasifica tema (híbrido palabras clave + TensorFlow)**: `classifier.py` primero
  intenta una heurística determinista por palabras clave (si el docente escribe
  literalmente "Excel", "seguridad", "contraseñas", etc.); solo si no encuentra
  ninguna coincidencia usa el clasificador de TensorFlow. Se decidió así después
  de probar con temas reales: el modelo entrenado con ~70 muestras fallaba en
  casos obvios (clasificó un tema sobre "seguridad y contraseñas" como
  `powerpoint`, y uno sobre "fórmulas de Excel" como `word`) — la heurística
  nunca falla en esos casos explícitos, y TensorFlow sigue aportando valor real
  para descripciones parafraseadas que no mencionan el nombre del programa
  (ver pruebas manuales en el historial de desarrollo). El clasificador de
  dificultad no tiene este respaldo todavía y usa solo TensorFlow.
- **Evalúa** respuestas del alumno: opción múltiple se compara directamente
  (no necesita IA); respuesta corta se mide por **similitud coseno de
  embeddings** entrenados con TensorFlow sobre el banco (ver "Por qué un
  embedder propio" abajo), con retroalimentación específica tomada del banco.
- **No genera texto libre/nuevo todavía**: los enunciados vienen del banco
  curado, no de un modelo generativo. Ver el roadmap: eso requeriría mucho más
  dato de entrenamiento del que existe hoy.

## Por qué un embedder propio y no Universal Sentence Encoder

La opción "estándar" para similitud semántica sería el USE multilingüe de
TensorFlow Hub, pero requiere `tensorflow-text`, que **no publica wheels
oficiales para Windows** — no se puede instalar de forma confiable en este
equipo. En su lugar, `train_classifier.py` entrena un modelo pequeño
(TextVectorization + Embedding + pooling + Dense) clasificando cada respuesta
del banco por el `ejercicio_id` al que pertenece; la capa densa antes del
softmax queda como espacio vectorial semántico, reutilizado en `evaluator.py`
para comparar por coseno la respuesta del alumno contra la(s) respuesta(s) de
referencia de ese ejercicio específico. Sigue siendo un modelo de TensorFlow
entrenado por el proyecto, solo que sin la dependencia problemática en Windows.

## Setup

Requiere Python 3.10+ con TensorFlow. Este equipo Windows no tiene un Python
"de verdad" instalado (solo el stub de Microsoft Store) — instala Python desde
python.org antes de continuar.

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Entrenar los modelos

```bash
python train_classifier.py
```

Esto lee `docs/exercise-bank/banco-ejercicios.json` y entrena tres modelos en
`ai-service/models/` (ignorado por git): `categoria_model`, `dificultad_model`
y `respuesta_embedder`.

**Aviso honesto sobre el dataset**: el banco actual da ~70 muestras para
categoría, ~28 para dificultad y ~45 (14 ejercicios de respuesta corta) para
el embedder — el `accuracy_train` que se imprime es sobre los mismos datos de
entrenamiento (no hay validación por lo pequeño del dataset), así que no mide
generalización real. Aun así, se probó manualmente con paráfrasis nunca vistas
en el entrenamiento y clasificó/evaluó correctamente la mayoría de los casos
(ver historial de pruebas). Es un prototipo que demuestra el flujo completo
(RF3/RF5), no un modelo listo para producción. Para mejorarlo:
- Ampliar el banco de ejercicios (más frases por tema, más variantes de respuesta).
- Reentrenar con los temas y respuestas reales que docentes/alumnos generen en producción.
- Si hace falta más precisión en similitud semántica, considerar correr el
  entrenamiento/servicio en Linux o Docker, donde `tensorflow-text` sí tiene
  wheels, para poder usar Universal Sentence Encoder en vez del embedder propio.

Si no se ha entrenado nada todavía, `classifier.py`/`evaluator.py` caen a
heurísticas simples (palabras clave / solapamiento de palabras) como respaldo,
así que el servicio funciona igual mientras se entrena el modelo real.

## Correr el servicio

```bash
uvicorn app:app --reload --port 8500
```

## Contrato con el backend Node.js

```
POST /generar-ejercicio
{
  "tema": "Fórmulas y funciones en Excel",
  "nivel": "basico",       // opcional; si se omite, lo predice el clasificador
  "cantidad": 5             // opcional, default 5
}

->

{
  "categoria": "excel",
  "nombre_tema": "Microsoft Excel",
  "competencia": "Manejo de hojas de cálculo: celdas, fórmulas y funciones básicas",
  "nivel_solicitado": "basico",
  "ejercicios": [ ... ]
}
```

El backend Node.js debe llamar a `/generar-ejercicio` cuando el docente activa
"Generar examen automáticamente" en `Topics.js`, y a `/evaluar-respuesta`
cuando el alumno envía cada respuesta en `TakeExam.js`, guardando ambos
resultados en MySQL (banco de ejercicios publicado + intentos de alumnos, per
RF04/RF05 de la tesis).

```
POST /evaluar-respuesta
{
  "ejercicio_id": "excel-3",
  "respuesta_alumno": "calcula la media de un grupo de numeros"
}

->

{
  "ejercicio_id": "excel-3",
  "tipo": "respuesta_corta",
  "correcto": true,
  "similitud": 0.962,
  "retroalimentacion": "Bien explicado: PROMEDIO calcula la media aritmética de los valores seleccionados."
}
```
