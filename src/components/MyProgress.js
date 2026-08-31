import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Stack, LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { studentService } from '../services/api';

const NIVEL_LABEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const nivelColor = (nivel) => {
  if (nivel === 'avanzado') return 'error';
  if (nivel === 'intermedio') return 'warning';
  return 'success';
};

// Agrupa los intentos del alumno por tema para mostrar la progresion
// basico -> intermedio -> avanzado del mismo tema a lo largo de varios
// examenes (RF5 + personalizacion: el nucleo de "aprendizaje dinamico").
const MyProgress = () => {
  const [data, setData] = useState({ promedio: 0, exams_completados: 0, progreso_por_tema: [], racha_actual: 0, insignias: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await studentService.getMyProgress();
      setData(result || { promedio: 0, exams_completados: 0, progreso_por_tema: [], racha_actual: 0, insignias: [] });
    } catch (err) {
      setError('Error al cargar tu progreso: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { promedio, exams_completados, progreso_por_tema = [], racha_actual = 0, insignias = [] } = data;

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Mi Progreso
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadProgress} variant="outlined" color="primary">
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{exams_completados}</Typography>
            <Typography variant="body2" color="textSecondary">Exámenes realizados</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{Math.round(promedio)}</Typography>
            <Typography variant="body2" color="textSecondary">Puntaje promedio</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, height: '100%' }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 34, color: racha_actual > 0 ? '#f57c00' : '#bdbdbd' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: racha_actual > 0 ? '#f57c00' : 'text.disabled', lineHeight: 1 }}>
                  {racha_actual}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {racha_actual > 0
                    ? `examen${racha_actual === 1 ? '' : 'es'} seguidos con 70% o más`
                    : 'Aprueba tu próximo examen para iniciar racha'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <EmojiEventsIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Mis insignias</Typography>
      </Box>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {insignias.map((ins) => (
          <Grid item xs={6} sm={4} md={3} key={ins.id}>
            <Card
              variant="outlined"
              sx={{
                textAlign: 'center',
                p: 1.5,
                height: '100%',
                opacity: ins.conseguida ? 1 : 0.55,
                borderColor: ins.conseguida ? 'warning.main' : undefined,
                background: ins.conseguida ? 'linear-gradient(180deg, #fff8e1 0%, #ffffff 100%)' : undefined,
              }}
            >
              <Typography sx={{ fontSize: 32, lineHeight: 1 }}>{ins.icono}</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>{ins.nombre}</Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', minHeight: 32, mb: 1 }}>
                {ins.descripcion}
              </Typography>
              {ins.conseguida ? (
                <Chip label="Conseguida" size="small" color="warning" />
              ) : (
                <LinearProgress
                  variant="determinate"
                  value={ins.meta > 0 ? Math.min(100, (ins.progreso / ins.meta) * 100) : 0}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Progresión por tema</Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Se muestran los temas que ya intentaste más de una vez, en orden básico → intermedio → avanzado.
      </Typography>

      {progreso_por_tema.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Todavía no tienes un tema resuelto en más de un nivel. Pídele a tu profesor que te asigne
              el mismo tema en un nivel superior para ver aquí tu progreso.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {progreso_por_tema.map((tema) => (
            <Grid item xs={12} key={tema.topic_id || tema.tema}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    {tema.tema}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {tema.intentos.map((intento, idx) => (
                      <React.Fragment key={`${intento.exam_id}-${intento.fecha}-${idx}`}>
                        <Card variant="outlined" sx={{ minWidth: 140, textAlign: 'center', p: 1 }}>
                          <Chip
                            label={NIVEL_LABEL[intento.nivel] || intento.nivel}
                            size="small"
                            color={nivelColor(intento.nivel)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {intento.porcentaje}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(intento.fecha).toLocaleDateString()}
                          </Typography>
                        </Card>
                        {idx < tema.intentos.length - 1 && <ArrowForwardIcon color="action" />}
                      </React.Fragment>
                    ))}
                  </Stack>
                  {tema.intentos.length > 1 && tema.intentos[tema.intentos.length - 1].porcentaje > tema.intentos[0].porcentaje && (
                    <Chip
                      sx={{ mt: 2 }}
                      color="success"
                      label={`Mejoró ${tema.intentos[tema.intentos.length - 1].porcentaje - tema.intentos[0].porcentaje} puntos desde el primer intento`}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyProgress;
