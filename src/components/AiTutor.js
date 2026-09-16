import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, IconButton, CircularProgress,
  Chip, Avatar, Stack, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { studentService } from '../services/api';

const MENSAJE_BIENVENIDA = {
  from: 'tutor',
  texto: 'Hola, soy tu tutor. Pregúntame algo sobre Excel, Word, PowerPoint, hardware, redes o seguridad informática — busco la explicación en el banco de ejercicios y te sugiero una práctica.',
};

// Tutor con IA: NO es un chat con un modelo de lenguaje libre. Cada
// respuesta viene de contenido real del banco de ejercicios (conceptos
// clave o retroalimentación de un ejercicio existente), encontrado por
// similitud de palabras clave -- ver ai-service/tutor.py. Si no encuentra
// nada suficientemente parecido, lo dice en vez de inventar una respuesta.
const AiTutor = () => {
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [pregunta, setPregunta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [temaActual, setTemaActual] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    const texto = pregunta.trim();
    if (!texto || enviando) return;

    setMensajes((prev) => [...prev, { from: 'alumno', texto }]);
    setPregunta('');
    setEnviando(true);

    try {
      const data = await studentService.preguntarTutor(texto, temaActual?.categoria);

      if (!data.respuesta) {
        setMensajes((prev) => [...prev, {
          from: 'tutor',
          texto: data.mensaje || 'No encontré algo lo bastante parecido a tu pregunta.',
          sinRespuesta: true,
        }]);
        return;
      }

      setTemaActual({ categoria: data.categoria, nombre: data.nombre_tema });
      setMensajes((prev) => [...prev, {
        from: 'tutor',
        texto: data.respuesta,
        nombreTema: data.nombre_tema,
        ejercicio: data.ejercicio_sugerido,
      }]);
    } catch (err) {
      setMensajes((prev) => [...prev, {
        from: 'tutor',
        texto: err.response?.data?.message || 'El tutor con IA no está disponible en este momento. Intenta de nuevo en unos minutos.',
        esError: true,
      }]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const cambiarDeTema = () => setTemaActual(null);

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
            Tutor con IA
          </Typography>
          {temaActual && (
            <Typography variant="body2" color="textSecondary">
              Tema actual: {temaActual.nombre}
            </Typography>
          )}
        </Box>
        {temaActual && (
          <Button size="small" startIcon={<RestartAltIcon />} onClick={cambiarDeTema}>
            Cambiar de tema
          </Button>
        )}
      </Box>

      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CardContent sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {mensajes.map((m, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                justifyContent: m.from === 'alumno' ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {m.from === 'tutor' && (
                <Avatar sx={{ bgcolor: m.esError ? 'grey.400' : 'primary.main', width: 32, height: 32 }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}
              <Box sx={{ maxWidth: '75%' }}>
                <Card
                  variant="outlined"
                  sx={{
                    px: 2, py: 1.2,
                    background: m.from === 'alumno' ? '#e3f2fd' : (m.esError || m.sinRespuesta) ? '#fff8e1' : '#eef6ee',
                    borderColor: m.esError ? 'warning.main' : 'transparent',
                  }}
                >
                  <Typography variant="body2">{m.texto}</Typography>
                </Card>
                {m.ejercicio && (
                  <Card variant="outlined" sx={{ mt: 1, px: 2, py: 1.2, borderColor: 'primary.light' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip label="Practica" size="small" color="primary" />
                      {m.nombreTema && <Chip label={m.nombreTema} size="small" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {m.ejercicio.enunciado}
                    </Typography>
                  </Card>
                )}
              </Box>
              {m.from === 'alumno' && (
                <Avatar sx={{ bgcolor: 'grey.500', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}
          {enviando && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <CircularProgress size={18} />
            </Box>
          )}
          <div ref={bottomRef} />
        </CardContent>

        <Box sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid #eee' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Escribe tu pregunta sobre el tema..."
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={enviando}
            multiline
            maxRows={3}
          />
          <IconButton color="primary" onClick={handleEnviar} disabled={enviando || !pregunta.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
};

export default AiTutor;
