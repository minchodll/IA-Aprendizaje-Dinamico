import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { studentService } from '../services/api';

const nivelColor = (nivel) => {
  if (nivel === 'avanzado') return 'error';
  if (nivel === 'intermedio') return 'warning';
  return 'success';
};

const porcentajeColor = (porcentaje) => {
  if (porcentaje >= 70) return 'success.main';
  if (porcentaje >= 50) return 'warning.main';
  return 'error.main';
};

// Historial de notas del alumno + un resumen de "que debo mejorar" armado por
// el backend a partir de las preguntas falladas de todos sus examenes.
const MyGrades = () => {
  const [data, setData] = useState({ promedio: 0, notas: [], areas_de_mejora: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await studentService.getMyGrades();
      setData(result || { promedio: 0, notas: [], areas_de_mejora: [] });
    } catch (err) {
      setError('Error al cargar tus notas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { promedio, notas, areas_de_mejora } = data;

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Mis Notas
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadGrades} variant="outlined" color="primary">
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">Promedio general</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: porcentajeColor(promedio) }}>
                {promedio}%
              </Typography>
              <Typography variant="body2" color="textSecondary">{notas.length} examen(es) realizados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDownIcon color="action" fontSize="small" />
                <Typography variant="body2" color="textSecondary">
                  Temas que más se te dificultan
                </Typography>
              </Box>
              {areas_de_mejora.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Sin errores recurrentes todavía — buen trabajo.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[...new Set(areas_de_mejora.map((a) => a.tema))].map((tema) => (
                    <Chip key={tema} label={tema} size="small" color="warning" variant="outlined" />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Historial de exámenes</Typography>
      {notas.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">Todavía no has realizado ningún examen.</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#1976d2' }}>
                <TableCell sx={{ color: '#fff' }}>Examen</TableCell>
                <TableCell sx={{ color: '#fff' }}>Tema</TableCell>
                <TableCell sx={{ color: '#fff' }}>Fecha</TableCell>
                <TableCell sx={{ color: '#fff' }}>Nota</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notas.map((nota) => (
                <TableRow key={nota.id} hover>
                  <TableCell>{nota.examen}</TableCell>
                  <TableCell>{nota.tema || '-'}</TableCell>
                  <TableCell>{new Date(nota.fecha_realizacion).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={nota.porcentaje}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={nota.porcentaje >= 70 ? 'success' : nota.porcentaje >= 50 ? 'warning' : 'error'}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: porcentajeColor(nota.porcentaje), minWidth: 40 }}>
                        {nota.porcentaje}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Qué debo mejorar</Typography>
      {areas_de_mejora.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No hay preguntas falladas de forma recurrente — sigue así.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {areas_de_mejora.map((area) => (
            <Grid item xs={12} md={6} key={area.enunciado}>
              <Card sx={{ height: '100%', borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={area.tema} size="small" />
                    <Chip label={area.dificultad} size="small" color={nivelColor(area.dificultad)} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {area.enunciado}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {area.retroalimentacion}
                  </Typography>
                  <Typography variant="caption" color="error">
                    Fallada {area.veces_fallada} {area.veces_fallada === 1 ? 'vez' : 'veces'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyGrades;
