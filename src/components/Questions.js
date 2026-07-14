import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent, Grid, RadioGroup,
  FormControlLabel, Radio, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { questionService, examService } from '../services/api';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    enunciado: '', 
    tipo: 'multiple_choice', 
    opciones: ['', '', '', ''], 
    respuesta_correcta: '', 
    exam_id: '', 
    orden: 1
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [questionsData, examsData] = await Promise.all([
        questionService.getAll(),
        examService.getAll()
      ]);
      
      setQuestions(questionsData);
      setExams(examsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (question = null) => {
    setEditing(question);
    if (question) {
      setForm({
        enunciado: question.enunciado || '',
        tipo: question.tipo || 'multiple_choice',
        opciones: question.opciones || ['', '', '', ''],
        respuesta_correcta: question.respuesta_correcta || '',
        exam_id: question.exam_id || '',
        orden: question.orden || 1
      });
    } else {
      setForm({ 
        enunciado: '', 
        tipo: 'multiple_choice', 
        opciones: ['', '', '', ''], 
        respuesta_correcta: '', 
        exam_id: '', 
        orden: 1
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ 
      enunciado: '', 
      tipo: 'multiple_choice', 
      opciones: ['', '', '', ''], 
      respuesta_correcta: '', 
      exam_id: '', 
      orden: 1
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpcionChange = (index, value) => {
    const newOpciones = [...form.opciones];
    newOpciones[index] = value;
    setForm(prev => ({ ...prev, opciones: newOpciones }));
  };

  const validateForm = () => {
    if (!form.enunciado || !form.exam_id) {
      return 'El enunciado y el examen son obligatorios';
    }
    if (form.tipo === 'multiple_choice') {
      if (form.opciones.some(opcion => !opcion.trim())) {
        return 'Todas las opciones son obligatorias para preguntas de opción múltiple';
      }
      if (!form.respuesta_correcta) {
        return 'Debe seleccionar la respuesta correcta';
      }
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
      
      const formData = {
        ...form,
        opciones: form.opciones.filter(opcion => opcion.trim() !== ''),
        respuesta_correcta: form.respuesta_correcta
      };
      
      if (editing) {
        await questionService.update(editing.id, formData);
      } else {
        await questionService.create(formData);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      try {
        setError(null);
        await questionService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.titulo : 'Examen no encontrado';
  };

  const getTipoColor = (tipo) => {
    return tipo === 'multiple_choice' ? 'primary' : 'secondary';
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'multiple_choice': return 'Opción Múltiple';
      case 'true_false': return 'Verdadero/Falso';
      case 'drag_drop': return 'Arrastrar y Soltar';
      default: return tipo;
    }
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
          Preguntas de Exámenes
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
              <TableCell sx={{ color: '#fff' }}>Enunciado</TableCell>
              <TableCell sx={{ color: '#fff' }}>Examen</TableCell>
              <TableCell sx={{ color: '#fff' }}>Tipo</TableCell>
              <TableCell sx={{ color: '#fff' }}>Orden</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay preguntas disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id} hover>
                  <TableCell>{truncateText(question.enunciado)}</TableCell>
                  <TableCell>{getExamName(question.exam_id)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoText(question.tipo)}
                      color={getTipoColor(question.tipo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{question.orden}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpen(question)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(question.id)}
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
          {editing ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Enunciado de la Pregunta"
                name="enunciado"
                fullWidth
                multiline
                rows={3}
                value={form.enunciado}
                onChange={handleChange}
                placeholder="Escriba la pregunta aquí..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Examen</InputLabel>
                <Select
                  name="exam_id"
                  value={form.exam_id}
                  onChange={handleChange}
                  label="Examen"
                >
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Tipo de Pregunta</InputLabel>
                <Select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  label="Tipo de Pregunta"
                >
                  <MenuItem value="multiple_choice">Opción Múltiple</MenuItem>
                  <MenuItem value="true_false">Verdadero/Falso</MenuItem>
                  <MenuItem value="drag_drop">Arrastrar y Soltar</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {form.tipo === 'multiple_choice' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Opciones de Respuesta" />
                  </Divider>
                </Grid>
                
                {form.opciones.map((opcion, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <TextField
                      margin="dense"
                      label={`Opción ${String.fromCharCode(65 + index)}`}
                      fullWidth
                      value={opcion}
                      onChange={(e) => handleOpcionChange(index, e.target.value)}
                    />
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <FormControl component="fieldset" margin="dense">
                    <Typography variant="subtitle2" gutterBottom>
                      Respuesta Correcta:
                    </Typography>
                    <RadioGroup
                      name="respuesta_correcta"
                      value={form.respuesta_correcta}
                      onChange={handleChange}
                      row
                    >
                      {form.opciones.map((opcion, index) => (
                        <FormControlLabel 
                          key={index}
                          value={String.fromCharCode(65 + index)} 
                          control={<Radio />} 
                          label={String.fromCharCode(65 + index)} 
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </>
            )}

            {form.tipo === 'true_false' && (
              <Grid item xs={12}>
                <FormControl component="fieldset" margin="dense">
                  <Typography variant="subtitle2" gutterBottom>
                    Respuesta Correcta:
                  </Typography>
                  <RadioGroup
                    name="respuesta_correcta"
                    value={form.respuesta_correcta}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Verdadero" />
                    <FormControlLabel value="false" control={<Radio />} label="Falso" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Orden"
                name="orden"
                type="number"
                fullWidth
                value={form.orden}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
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

export default Questions; 