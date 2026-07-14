import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent, Grid, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Divider, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { topicService, subjectService } from '../services/api';

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    subject_id: '', 
    nivel: 'basico',
    estado: 'activo',
    generar_examen: true,
    opciones_examen: {
      duracion: 30,
      puntaje_total: 100
    }
  });
  const [generatedExam, setGeneratedExam] = useState(null);
  const [showExamDetails, setShowExamDetails] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [topicsData, subjectsData] = await Promise.all([
        topicService.getAll(),
        subjectService.getAll()
      ]);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (topic = null) => {
    setEditing(topic);
    setGeneratedExam(null);
    setShowExamDetails(false);
    if (topic) {
      setForm({
        nombre: topic.nombre || '',
        descripcion: topic.descripcion || '',
        subject_id: topic.subject_id || '',
        nivel: topic.nivel || 'basico',
        estado: topic.estado || 'activo',
        generar_examen: false,
        opciones_examen: {
          duracion: 30,
          puntaje_total: 100
        }
      });
    } else {
      setForm({ 
        nombre: '', 
        descripcion: '', 
        subject_id: '', 
        nivel: 'basico',
        estado: 'activo',
        generar_examen: true,
        opciones_examen: {
          duracion: 30,
          puntaje_total: 100
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setGeneratedExam(null);
    setShowExamDetails(false);
    setForm({ 
      nombre: '', 
      descripcion: '', 
      subject_id: '', 
      nivel: 'basico',
      estado: 'activo',
      generar_examen: true,
      opciones_examen: {
        duracion: 30,
        puntaje_total: 100
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith('opciones_examen.')) {
      const optionKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        opciones_examen: {
          ...prev.opciones_examen,
          [optionKey]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.nombre || !form.subject_id || !form.nivel) {
      return 'El nombre, la materia y el nivel son obligatorios';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      
      if (editing) {
        await topicService.update(editing.id, form);
        await loadData();
        handleClose();
      } else {
        const response = await topicService.create(form);
        
        // Si se generó un examen automáticamente, mostrarlo
        if (response.exam_generado) {
          setGeneratedExam(response.exam_generado);
          setShowExamDetails(true);
        } else {
          await loadData();
          handleClose();
        }
      }
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tema?')) {
      try {
        setError(null);
        await topicService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleGenerateExam = async (topicId) => {
    try {
      setError(null);
      const response = await topicService.generateExam(topicId);
      setGeneratedExam(response);
      setShowExamDetails(true);
    } catch (err) {
      setError('Error al generar examen: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseExamDetails = () => {
    setShowExamDetails(false);
    setGeneratedExam(null);
    loadData();
    handleClose();
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.nombre : 'Materia no encontrada';
  };

  const getStatusColor = (status) => {
    return status === 'activo' ? 'success' : 'error';
  };

  const getLevelColor = (level) => {
    const colors = {
      basico: 'success',
      intermedio: 'warning',
      avanzado: 'error'
    };
    return colors[level] || 'default';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Temas de Materias
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadData}
          variant="outlined"
          color="primary"
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
                     <TableHead sx={{ background: '#1976d2' }}>
             <TableRow>
               <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
               <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
               <TableCell sx={{ color: '#fff' }}>Materia</TableCell>
               <TableCell sx={{ color: '#fff' }}>Nivel</TableCell>
               <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
               <TableCell sx={{ color: '#fff' }}>Exámenes</TableCell>
               <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
             </TableRow>
           </TableHead>
          <TableBody>
            {topics.length === 0 ? (
                             <TableRow>
                 <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay temas disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
                <React.Fragment key={topic.id}>
                  <TableRow hover>
                    <TableCell>{topic.nombre}</TableCell>
                    <TableCell>{topic.descripcion || '-'}</TableCell>
                    <TableCell>{getSubjectName(topic.subject_id)}</TableCell>
                    <TableCell>
                      <Chip
                        label={topic.nivel || 'N/A'}
                        color={getLevelColor(topic.nivel)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={topic.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        color={getStatusColor(topic.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={topic.exams_count || 0}
                        color="info"
                        size="small"
                        icon={<QuizIcon />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpen(topic)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleGenerateExam(topic.id)}
                        title="Generar Examen"
                      >
                        <AutoAwesomeIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(topic.id)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Preguntas</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {topic.questions && topic.questions.length > 0 ? (
                            <List>
                              {topic.questions.map((question, index) => (
                                <ListItem key={question.id}>
                                  <ListItemText
                                    primary={`${index + 1}. ${question.enunciado}`}
                                    secondary={`Tipo: ${question.tipo}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography>No hay preguntas para este tema.</Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }} 
        onClick={() => handleOpen()}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editing ? 'Editar Tema' : 'Crear Nuevo Tema'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Nombre del Tema"
                name="nombre"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Introducción a Excel"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Descripción"
                name="descripcion"
                fullWidth
                multiline
                rows={3}
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción del tema..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Materia</InputLabel>
                <Select
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  label="Materia"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Nivel</InputLabel>
                <Select
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                  label="Nivel"
                >
                  <MenuItem value="basico">Básico</MenuItem>
                  <MenuItem value="intermedio">Intermedio</MenuItem>
                  <MenuItem value="avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {!editing && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Generación Automática de Examen" color="primary" />
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.generar_examen}
                        onChange={handleChange}
                        name="generar_examen"
                        color="primary"
                      />
                    }
                    label="Generar examen automáticamente"
                  />
                </Grid>

                {form.generar_examen && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        label="Duración (minutos)"
                        name="opciones_examen.duracion"
                        type="number"
                        fullWidth
                        value={form.opciones_examen.duracion}
                        onChange={handleChange}
                        inputProps={{ min: 10, max: 180 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        label="Puntaje Total"
                        name="opciones_examen.puntaje_total"
                        type="number"
                        fullWidth
                        value={form.opciones_examen.puntaje_total}
                        onChange={handleChange}
                        inputProps={{ min: 10, max: 100 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>💡 Consejo:</strong> El sistema detectará automáticamente la categoría del tema 
                          (Excel, Word, PowerPoint, Computación, Office) y generará preguntas relevantes.
                        </Typography>
                      </Alert>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para mostrar detalles del examen generado */}
      <Dialog open={showExamDetails} onClose={handleCloseExamDetails} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          Examen Generado Automáticamente
        </DialogTitle>
        <DialogContent>
          {generatedExam && (
            <Box>
              <Card sx={{ mb: 2, background: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {generatedExam.titulo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {generatedExam.descripcion}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Duración:</strong> {generatedExam.duracion_minutos} minutos
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Puntaje Total:</strong> {generatedExam.puntaje_total} puntos
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Preguntas:</strong> {generatedExam.questions?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Estado:</strong> 
                        <Chip 
                          label={generatedExam.estado === 'activo' ? 'Activo' : 'Inactivo'} 
                          color={generatedExam.estado === 'activo' ? 'success' : 'error'} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {generatedExam.questions && generatedExam.questions.length > 0 && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Preguntas Generadas ({generatedExam.questions.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {generatedExam.questions.map((question, index) => (
                        <Box key={question.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Pregunta ${index + 1}: ${question.enunciado}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    <strong>Tipo:</strong> {question.tipo === 'multiple_choice' ? 'Opción Múltiple' : 'Verdadero/Falso'}
                                  </Typography>
                                  {question.opciones && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                      <strong>Opciones:</strong> {question.opciones.join(', ')}
                                    </Typography>
                                  )}
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    <strong>Respuesta Correcta:</strong> {question.respuesta_correcta}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < generatedExam.questions.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExamDetails} variant="contained" color="primary">
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Topics; 