import React, { useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, TextField, InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import TopicIcon from '@mui/icons-material/Topic';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BuildIcon from '@mui/icons-material/Build';

// Contenido estatico (no necesita backend): preguntas reales que ya
// surgieron usando el sistema esta semana, agrupadas por tema. Si se agrega
// una funcionalidad nueva, conviene agregar aqui la pregunta que le vaya a
// surgir al docente antes de que la tenga que preguntar.
const SECCIONES = [
  {
    id: 'inicio',
    titulo: 'Primeros pasos',
    icon: <PlayCircleOutlineIcon />,
    preguntas: [
      {
        q: '¿Cómo inicio el sistema cada vez que lo voy a usar?',
        a: 'Corré "iniciar-todo.bat" — abre las 3 ventanas necesarias (microservicio de IA, backend, frontend) y avisa si falta algo. Esperá unos 20 segundos antes de abrir localhost:3000. No cierres esas 3 ventanas mientras usás el sistema.',
      },
      {
        q: 'Creé un tema y el examen salió con "Pregunta 1", "Opción A, B, C, D" genéricas. ¿Qué pasó?',
        a: 'El microservicio de IA (Python) no está corriendo. Cuando está caído, el sistema no avisa con un error grande — cae automáticamente a un examen de relleno para no dejarte sin nada. Solución: cerrá y volvé a abrir con "iniciar-todo.bat", confirmá que la ventana del microservicio de IA no se haya cerrado sola, y generá el examen de nuevo.',
      },
      {
        q: 'No recuerdo la contraseña de un alumno o profesor que creé.',
        a: 'No hay forma de "ver" la contraseña (queda encriptada), pero sí se puede resetear: andá a Estudiantes o Profesores → editar esa persona → escribí una contraseña nueva en el campo Contraseña → Guardar. Si dejás ese campo vacío al editar, no le cambia la contraseña actual.',
      },
      {
        q: '¿Con qué cuentas puedo entrar a probar el sistema?',
        a: 'La pantalla de login muestra 3 cuentas de prueba abajo del formulario: admin@example.com, manager@example.com y user@example.com, todas con la contraseña password123.',
      },
    ],
  },
  {
    id: 'temas',
    titulo: 'Temas y exámenes',
    icon: <TopicIcon />,
    preguntas: [
      {
        q: '¿Cómo genero un examen automáticamente para un tema?',
        a: 'En Temas → botón "+" → escribí el nombre y descripción del tema, elegí el Nivel (Básico/Intermedio/Avanzado) y dejá activado "Generar examen automáticamente". El sistema detecta la categoría (Excel, Word, Redes, etc.) a partir del texto que escribiste, y selecciona ejercicios del banco que coincidan con esa categoría y ese nivel.',
      },
      {
        q: '¿Cuál es la diferencia entre "Asignaciones" y "Asignar Exámenes"?',
        a: '"Asignaciones" define qué profesor da qué materia a qué grado y sección — es lo que hace que un alumno vea ese curso en "Mis Cursos" automáticamente. "Asignar Exámenes" es distinto: ahí elegís un examen ya generado y se lo asignás a uno o varios alumnos puntuales para que lo resuelvan.',
      },
      {
        q: '¿Puedo hacer que un alumno repita el mismo tema pero en un nivel más difícil?',
        a: 'Sí. Editá el tema (lápiz en Temas) y cambiá el Nivel a Intermedio o Avanzado, después usá el botón "Generar Examen" de ese tema para crear un examen nuevo con ejercicios de ese nivel, y asignaselo al alumno desde "Asignar Exámenes". El alumno queda con los dos intentos, y "Mi Progreso" le muestra la mejora entre uno y otro.',
      },
      {
        q: 'Cambié el nivel del tema pero el examen sigue saliendo con ejercicios básicos.',
        a: 'Revisá que estés generando un examen nuevo (botón "Generar Examen") después de cambiar el nivel — un examen que ya existía no cambia de contenido solo porque editaste el tema; hay que generar uno nuevo para que tome el nivel actualizado.',
      },
    ],
  },
  {
    id: 'notas',
    titulo: 'Notas y seguimiento',
    icon: <AssessmentIcon />,
    preguntas: [
      {
        q: '¿Dónde veo las notas de todos mis alumnos en un solo lugar?',
        a: '"Boletín de Clase" (menú Evaluación). Muestra el promedio general de la clase, una tabla con la nota de cada alumno ordenada de mejor a peor punteo, y qué preguntas se le dificultan más al grupo.',
      },
      {
        q: 'No veo a ninguno de mis alumnos en el Boletín de Clase.',
        a: 'El Boletín solo muestra alumnos de tus asignaciones activas (grado + sección donde estás asignado como profesor). Si no aparece nadie, revisá en "Asignaciones" que tengas una asignación activa a ese grado y sección — sin eso, el sistema no sabe cuáles son "tus" alumnos.',
      },
      {
        q: '¿Cómo sé específicamente qué le cuesta a un alumno, no solo su nota?',
        a: 'En el Boletín de Clase, hacé clic en cualquier tarjeta de "Lo que más se le dificulta a la clase" — se abre el detalle de quién falló esa pregunta puntual, qué respondió, y una recomendación de qué debería repasar.',
      },
      {
        q: '¿Puedo entregar o imprimir las notas en vez de solo verlas en pantalla?',
        a: 'Sí, en el Boletín de Clase hay botones "PDF" y "Excel/CSV" para descargar el boletín completo, y un ícono de descarga por fila en la tabla para el reporte individual de un alumno en PDF.',
      },
      {
        q: 'Como alumno, ¿dónde veo mi propio avance?',
        a: '"Mis Notas" muestra el historial de exámenes y qué debe mejorar. "Mi Progreso" muestra la evolución de un mismo tema resuelto en distintos niveles (básico → avanzado), si ya lo intentó más de una vez.',
      },
    ],
  },
  {
    id: 'banco',
    titulo: 'Banco de ejercicios',
    icon: <MenuBookIcon />,
    preguntas: [
      {
        q: 'Quiero agregar ejercicios de un tema que el sistema todavía no cubre. ¿Cómo hago?',
        a: 'En "Cargar Banco de Ejercicios" descargá la plantilla en Word, llenala con el tema y sus ejercicios (enunciado, tipo, opciones, respuesta correcta, dificultad y retroalimentación), y entregásela al administrador — es quien la sube y confirma al sistema.',
      },
      {
        q: 'Soy profesor y no puedo subir la plantilla, solo descargarla. ¿Es un error?',
        a: 'No, es intencional. Subir y confirmar queda reservado al administrador porque un archivo mal llenado afecta el banco compartido de todos los profesores, no solo el de quien lo subió — centralizar esa revisión evita errores que después son difíciles de rastrear.',
      },
      {
        q: 'El administrador ya confirmó mi plantilla pero el sistema sigue sin usar ese contenido al generar exámenes.',
        a: 'Guardar en el banco no reentrena los modelos de IA automáticamente — es un paso manual aparte que hace el administrador. Si es una categoría totalmente nueva (no una de las 7 existentes), además necesita varios ejercicios más antes de que la IA la reconozca bien.',
      },
    ],
  },
  {
    id: 'problemas',
    titulo: 'Problemas comunes',
    icon: <BuildIcon />,
    preguntas: [
      {
        q: 'El sistema "no me deja nada" o "no genera nada".',
        a: 'Casi siempre es que el microservicio de IA se cayó silenciosamente. Revisá que las 3 ventanas de "iniciar-todo.bat" sigan abiertas; si alguna se cerró, volvé a correr el script.',
      },
      {
        q: 'Aparecieron datos raros o exámenes que ya no están.',
        a: 'Puede pasar si hay más de una instancia de MySQL corriendo al mismo tiempo (por ejemplo, una desde XAMPP y otra abierta manualmente por terminal) — cada una puede pisar los datos de la otra. Arrancá MySQL siempre desde el panel de control de XAMPP, y solo una vez.',
      },
      {
        q: 'Un alumno dice que no le aparece un examen que le asigné.',
        a: 'Confirmá en "Asignar Exámenes" que la asignación se haya guardado (aparece en la tabla con estado "Pendiente"). Si el alumno tiene una sección distinta a la que elegiste al asignar, no le va a aparecer — revisá que el grado y sección coincidan con los del alumno en "Estudiantes".',
      },
    ],
  },
];

const FAQ = () => {
  const [busqueda, setBusqueda] = useState('');

  const texto = busqueda.trim().toLowerCase();
  const secciones = texto
    ? SECCIONES
        .map((s) => ({ ...s, preguntas: s.preguntas.filter((p) => (p.q + ' ' + p.a).toLowerCase().includes(texto)) }))
        .filter((s) => s.preguntas.length > 0)
    : SECCIONES;

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
        Preguntas Frecuentes
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Cómo usar el sistema y qué hacer en los casos más comunes.
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar una pregunta…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 3, background: '#fff', borderRadius: 1 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {secciones.length === 0 ? (
        <Typography variant="body2" color="textSecondary">No hay preguntas que coincidan con "{busqueda}".</Typography>
      ) : (
        secciones.map((seccion) => (
          <Box key={seccion.id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {seccion.icon}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{seccion.titulo}</Typography>
              <Chip label={seccion.preguntas.length} size="small" />
            </Box>
            {seccion.preguntas.map((p, i) => (
              <Accordion key={i} disableGutters sx={{ mb: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{p.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">{p.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
};

export default FAQ;
