import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { resultService, studentService, examService } from '../services/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    student_id: '', 
    exam_id: '', 
    score: '', 
    total: '', 
    details: '{}' 
  });
  const [stats, setStats] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resultsData, studentsData, examsData, statsData] = await Promise.all([
        resultService.getAll(),
        studentService.getAll(),
        examService.getAll(),
        resultService.getStats()
      ]);
      
      setResults(resultsData);
      setStudents(studentsData);
      setExams(examsData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (result = null) => {
    setEditing(result);
    if (result) {
      setForm({
        student_id: result.student_id || '',
        exam_id: result.exam_id || '',
        score: result.score || '',
        total: result.total || '',
        details: result.details || '{}'
      });
    } else {
      setForm({ 
        student_id: '', 
        exam_id: '', 
        score: '', 
        total: '', 
        details: '{}' 
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ 
      student_id: '', 
      exam_id: '', 
      score: '', 
      total: '', 
      details: '{}' 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.student_id || !form.exam_id || !form.score || !form.total) {
      return 'Todos los campos son obligatorios';
    }
    if (parseInt(form.score) < 0) {
      return 'El puntaje no puede ser negativo';
    }
    if (parseInt(form.total) <= 0) {
      return 'El total debe ser mayor a 0';
    }
    if (parseInt(form.score) > parseInt(form.total)) {
      return 'El puntaje no puede ser mayor al total';
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
        score: parseInt(form.score),
        total: parseInt(form.total)
      };

      if (editing) {
        await resultService.update(editing.id, formData);
      } else {
        await resultService.create(formData);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este resultado?')) {
      try {
        setError(null);
        await resultService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nombre_completo : 'Estudiante no encontrado';
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.titulo || `Examen ${exam.id}` : 'Examen no encontrado';
  };

  const getPercentage = (score, total) => {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const getScoreColor = (score, total) => {
    const percentage = getPercentage(score, total);
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
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
          Resultados de Exámenes
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

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Resultados
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total_results}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Promedio de Puntaje
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.average_score}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Exámenes
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total_exams}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Estudiantes
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total_students}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ background: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Estudiante</TableCell>
              <TableCell sx={{ color: '#fff' }}>Examen</TableCell>
              <TableCell sx={{ color: '#fff' }}>Puntaje</TableCell>
              <TableCell sx={{ color: '#fff' }}>Total</TableCell>
              <TableCell sx={{ color: '#fff' }}>Porcentaje</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay resultados disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              results.map((result) => (
                <TableRow key={result.id} hover>
                  <TableCell>{getStudentName(result.student_id)}</TableCell>
                  <TableCell>{getExamName(result.exam_id)}</TableCell>
                  <TableCell>{result.score}</TableCell>
                  <TableCell>{result.total}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${getPercentage(result.score, result.total)}%`}
                      color={getScoreColor(result.score, result.total)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpen(result)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(result.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Editar Resultado' : 'Agregar Nuevo Resultado'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Estudiante</InputLabel>
            <Select
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              label="Estudiante"
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  {exam.titulo || `Examen ${exam.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Puntaje Obtenido"
            name="score"
            type="number"
            fullWidth
            value={form.score}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />

          <TextField
            margin="dense"
            label="Puntaje Total"
            name="total"
            type="number"
            fullWidth
            value={form.total}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />

          <TextField
            margin="dense"
            label="Detalles (JSON)"
            name="details"
            fullWidth
            multiline
            rows={3}
            value={form.details}
            onChange={handleChange}
            helperText="Información adicional en formato JSON"
          />
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

export default Results; 