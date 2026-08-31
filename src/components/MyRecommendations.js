import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Button,
  Grid, Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { studentService } from '../services/api';

const prioridadColor = (p) => {
  if (p >= 5) return 'error';
  if (p >= 4) return 'warning';
  return 'info';
};

const tipoTexto = (tipo) => {
  switch (tipo) {
    case 'ejercicio': return 'Ejercicios';
    case 'recurso': return 'Recurso';
    default: return 'Estudio';
  }
};

// Recomendaciones de refuerzo: la IA revisa en qué temas el alumno falla
// preguntas de forma recurrente y selecciona ejercicios reales del banco
// para practicar (no texto inventado). "Generar con IA" es un botón
// explícito -- no corre solo en cada carga -- para que se vea claramente
// cuándo la IA generó algo nuevo.
const MyRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getMyRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      setError('Error al cargar tus recomendaciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setInfo(null);
      const result = await studentService.generateRecommendations();
      if (result.message) {
        setInfo(result.message);
      }
      await loadRecommendations();
    } catch (err) {
      setError('No se pudieron generar recomendaciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setCompletingId(id);
      setError(null);
      await studentService.completeRecommendation(id);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError('No se pudo marcar como completada: ' + (err.response?.data?.message || err.message));
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Mis Recomendaciones
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<RefreshIcon />} onClick={loadRecommendations} variant="outlined" color="primary">
            Actualizar
          </Button>
          <Button
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            disabled={generating}
          >
            {generating ? 'Generando...' : 'Generar con IA'}
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        La IA revisa los temas donde has fallado preguntas varias veces y te trae ejercicios
        de práctica reales del banco de ejercicios, del nivel donde más lo necesitas.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setInfo(null)}>
          {info}
        </Alert>
      )}

      {recommendations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
              Todavía no tienes recomendaciones activas.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Presiona "Generar con IA" para revisar tu desempeño y recibir ejercicios de refuerzo.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((rec) => (
            <Grid item xs={12} md={6} key={rec.id}>
              <Card sx={{ height: '100%', borderLeft: '4px solid', borderLeftColor: `${prioridadColor(rec.prioridad)}.main` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {rec.titulo}
                    </Typography>
                    <Chip label={tipoTexto(rec.tipo)} size="small" color="primary" variant="outlined" />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                    {rec.tema && <Chip label={rec.tema} size="small" />}
                    <Chip
                      label={`Prioridad ${rec.prioridad}`}
                      size="small"
                      color={prioridadColor(rec.prioridad)}
                    />
                    {rec.student_id === null && (
                      <Chip label="General" size="small" variant="outlined" />
                    )}
                  </Stack>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                    {rec.descripcion}
                  </Typography>

                  {rec.contenido && (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-line',
                        background: '#f5f7fa',
                        borderRadius: 2,
                        p: 1.5,
                        mb: 1.5,
                      }}
                    >
                      {rec.contenido}
                    </Typography>
                  )}

                  {rec.student_id !== null && (
                    <Button
                      size="small"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleComplete(rec.id)}
                      disabled={completingId === rec.id}
                    >
                      {completingId === rec.id ? 'Guardando...' : 'Marcar como completada'}
                    </Button>
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

export default MyRecommendations;
