import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, Chip, CircularProgress, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { teacherService } from '../services/api';

const nivelColor = (nivel) => {
  if (nivel === 'avanzado') return 'error';
  if (nivel === 'intermedio') return 'warning';
  return 'success';
};

const porcentajeColor = (porcentaje) => {
  if (porcentaje === null || porcentaje === undefined) return 'text.disabled';
  if (porcentaje >= 70) return 'success.main';
  if (porcentaje >= 50) return 'warning.main';
  return 'error.main';
};

// Boletin agregado: mismo patron que "Mis Notas"/"Mi Progreso" del alumno,
// pero visto desde el profesor - una fila por alumno de su clase, mas los
// temas que mas se le dificultan al grupo en conjunto.
const ClassReport = () => {
  const [data, setData] = useState({ promedio_clase: 0, total_estudiantes: 0, examenes_realizados: 0, por_estudiante: [], temas_dificiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTema, setSelectedTema] = useState(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherService.getClassReport();
      setData(result || { promedio_clase: 0, total_estudiantes: 0, examenes_realizados: 0, por_estudiante: [], temas_dificiles: [] });
    } catch (err) {
      setError('Error al cargar el boletín de la clase: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { promedio_clase, total_estudiantes, examenes_realizados, por_estudiante, temas_dificiles } = data;

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Boletín de Clase
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadReport} variant="outlined" color="primary">
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {total_estudiantes === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Todavía no tienes alumnos asignados. Un alumno aparece aquí automáticamente cuando
              se te asigna como profesor de su grado y sección en "Asignaciones".
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{total_estudiantes}</Typography>
                <Typography variant="body2" color="textSecondary">Alumnos en tu clase</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>{examenes_realizados}</Typography>
                <Typography variant="body2" color="textSecondary">Exámenes realizados</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: porcentajeColor(promedio_clase) }}>{promedio_clase}%</Typography>
                <Typography variant="body2" color="textSecondary">Promedio general de la clase</Typography>
              </CardContent></Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card><CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {por_estudiante.filter((e) => e.examenes_realizados === 0).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">Sin realizar ningún examen</Typography>
              </CardContent></Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon color="primary" /> Desempeño por alumno
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: '#1976d2' }}>
                  <TableCell sx={{ color: '#fff' }}>Alumno</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Exámenes realizados</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Último examen</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Promedio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {por_estudiante.map((alumno) => (
                  <TableRow key={alumno.student_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>
                          {alumno.nombre?.charAt(0) || '?'}
                        </Avatar>
                        {alumno.nombre}
                      </Box>
                    </TableCell>
                    <TableCell>{alumno.examenes_realizados}</TableCell>
                    <TableCell>{alumno.ultimo_examen ? new Date(alumno.ultimo_examen).toLocaleDateString() : '-'}</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>
                      {alumno.promedio === null ? (
                        <Chip label="Sin datos" size="small" variant="outlined" />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={alumno.promedio}
                              sx={{ height: 8, borderRadius: 4 }}
                              color={alumno.promedio >= 70 ? 'success' : alumno.promedio >= 50 ? 'warning' : 'error'}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: porcentajeColor(alumno.promedio), minWidth: 40 }}>
                            {alumno.promedio}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="warning" /> Lo que más se le dificulta a la clase
          </Typography>
          {temas_dificiles.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Todavía no hay suficientes exámenes resueltos para detectar un patrón.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {temas_dificiles.map((tema) => (
                <Grid item xs={12} md={6} key={tema.enunciado}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                    <CardActionArea onClick={() => setSelectedTema(tema)} sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip label={tema.tema} size="small" />
                          <Chip label={tema.dificultad} size="small" color={nivelColor(tema.dificultad)} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {tema.enunciado}
                        </Typography>
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                          {tema.alumnos_afectados} {tema.alumnos_afectados === 1 ? 'alumno la falló' : 'alumnos distintos la fallaron'} · ver quiénes
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={!!selectedTema} onClose={() => setSelectedTema(null)} maxWidth="sm" fullWidth>
        {selectedTema && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={selectedTema.tema} size="small" />
                <Chip label={selectedTema.dificultad} size="small" color={nivelColor(selectedTema.dificultad)} />
              </Box>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 700 }}>{selectedTema.enunciado}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <List disablePadding>
                {selectedTema.alumnos.map((alumno, idx) => (
                  <React.Fragment key={alumno.student_id}>
                    <ListItem alignItems="flex-start" disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>{alumno.nombre?.charAt(0) || '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alumno.nombre}
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Respondió:</strong> {alumno.respuesta_dada}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1, p: 1, bgcolor: '#FFF8E1', borderRadius: 1 }}>
                              <LightbulbIcon fontSize="small" color="warning" sx={{ mt: 0.2 }} />
                              <Typography variant="body2" color="text.secondary">
                                {alumno.recomendacion}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < selectedTema.alumnos.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTema(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ClassReport;
