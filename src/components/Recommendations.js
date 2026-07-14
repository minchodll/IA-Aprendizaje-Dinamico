import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent, Grid, Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { recommendationService, topicService, studentService } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    titulo: '', 
    descripcion: '', 
    contenido: '', 
    topic_id: '', 
    student_id: '', 
    prioridad: 3,
    estado: 'activo',
    tipo: 'estudio'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [recommendationsData, topicsData, studentsData] = await Promise.all([
        recommendationService.getAll(),
        topicService.getAll(),
        studentService.getAll()
      ]);
      
      setRecommendations(recommendationsData);
      setTopics(topicsData);
      setStudents(studentsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (recommendation = null) => {
    setEditing(recommendation);
    if (recommendation) {
      setForm({
        titulo: recommendation.titulo || '',
        descripcion: recommendation.descripcion || '',
        contenido: recommendation.contenido || '',
        topic_id: recommendation.topic_id || '',
        student_id: recommendation.student_id || '',
        prioridad: recommendation.prioridad || 3,
        estado: recommendation.estado || 'activo',
        tipo: recommendation.tipo || 'estudio'
      });
    } else {
      setForm({ 
        titulo: '', 
        descripcion: '', 
        contenido: '', 
        topic_id: '', 
        student_id: '', 
        prioridad: 3,
        estado: 'activo',
        tipo: 'estudio'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ 
      titulo: '', 
      descripcion: '', 
      contenido: '', 
      topic_id: '', 
      student_id: '', 
      prioridad: 3,
      estado: 'activo',
      tipo: 'estudio'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.titulo || !form.descripcion || !form.contenido) {
      return 'El título, descripción y contenido son obligatorios';
    }
    if (!form.topic_id) {
      return 'Debe seleccionar un tema';
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
        await recommendationService.update(editing.id, form);
      } else {
        await recommendationService.create(form);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta recomendación?')) {
      try {
        setError(null);
        await recommendationService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.nombre : 'Tema no encontrado';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nombre_completo : 'Estudiante no encontrado';
  };

  const getStatusColor = (status) => {
    return status === 'activo' ? 'success' : 'error';
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'estudio': return 'primary';
      case 'ejercicio': return 'secondary';
      case 'recurso': return 'info';
      default: return 'default';
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'estudio': return 'Estudio';
      case 'ejercicio': return 'Ejercicio';
      case 'recurso': return 'Recurso';
      default: return tipo;
    }
  };

  const getPrioridadColor = (prioridad) => {
    if (prioridad >= 4) return 'error';
    if (prioridad >= 3) return 'warning';
    return 'success';
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          Recomendaciones de Estudio
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
              <TableCell sx={{ color: '#fff' }}>Título</TableCell>
              <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
              <TableCell sx={{ color: '#fff' }}>Tema</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estudiante</TableCell>
              <TableCell sx={{ color: '#fff' }}>Tipo</TableCell>
              <TableCell sx={{ color: '#fff' }}>Prioridad</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recommendations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay recomendaciones disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              recommendations.map((recommendation) => (
                <TableRow key={recommendation.id} hover>
                  <TableCell>{truncateText(recommendation.titulo)}</TableCell>
                  <TableCell>{truncateText(recommendation.descripcion)}</TableCell>
                  <TableCell>{getTopicName(recommendation.topic_id)}</TableCell>
                  <TableCell>{getStudentName(recommendation.student_id)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoText(recommendation.tipo)}
                      color={getTipoColor(recommendation.tipo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Rating 
                      value={recommendation.prioridad} 
                      readOnly 
                      size="small"
                      sx={{ '& .MuiRating-iconFilled': { color: getPrioridadColor(recommendation.prioridad) } }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={recommendation.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      color={getStatusColor(recommendation.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpen(recommendation)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(recommendation.id)}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
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
          {editing ? 'Editar Recomendación' : 'Crear Nueva Recomendación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Título"
                name="titulo"
                fullWidth
                value={form.titulo}
                onChange={handleChange}
                placeholder="Título de la recomendación"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Descripción"
                name="descripcion"
                fullWidth
                multiline
                rows={2}
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción breve de la recomendación"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Contenido"
                name="contenido"
                fullWidth
                multiline
                rows={4}
                value={form.contenido}
                onChange={handleChange}
                placeholder="Contenido detallado de la recomendación..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Tema</InputLabel>
                <Select
                  name="topic_id"
                  value={form.topic_id}
                  onChange={handleChange}
                  label="Tema"
                >
                  {topics.map((topic) => (
                    <MenuItem key={topic.id} value={topic.id}>
                      {topic.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Estudiante (Opcional)</InputLabel>
                <Select
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  label="Estudiante (Opcional)"
                >
                  <MenuItem value="">Para todos los estudiantes</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.nombre_completo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  label="Tipo"
                >
                  <MenuItem value="estudio">Estudio</MenuItem>
                  <MenuItem value="ejercicio">Ejercicio</MenuItem>
                  <MenuItem value="recurso">Recurso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Prioridad</InputLabel>
                <Select
                  name="prioridad"
                  value={form.prioridad}
                  onChange={handleChange}
                  label="Prioridad"
                >
                  <MenuItem value={1}>Baja (1)</MenuItem>
                  <MenuItem value={2}>Media-Baja (2)</MenuItem>
                  <MenuItem value={3}>Media (3)</MenuItem>
                  <MenuItem value={4}>Media-Alta (4)</MenuItem>
                  <MenuItem value={5}>Alta (5)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recommendations; 