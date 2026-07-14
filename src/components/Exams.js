import React, { useState, useEffect } from 'react';
import { examService, teacherService, subjectService } from '../services/api';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Fab,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';

const Exams = ({ user, onNavigate }) => {
  const [exams, setExams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    subject_id: '',
    teacher_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    duracion_minutos: '',
    puntaje_total: '',
    estado: 'activo'
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [examsData, teachersData, subjectsData] = await Promise.all([
        examService.getAll(),
        teacherService.getAll(),
        subjectService.getAll()
      ]);
      
      setExams(examsData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        titulo: exam.titulo || '',
        descripcion: exam.descripcion || '',
        subject_id: exam.subject_id || '',
        teacher_id: exam.teacher_id || '',
        fecha_inicio: exam.fecha_inicio || '',
        fecha_fin: exam.fecha_fin || '',
        duracion_minutos: exam.duracion_minutos || '',
        puntaje_total: exam.puntaje_total || '',
        estado: exam.estado || 'activo'
      });
    } else {
      setEditingExam(null);
      setFormData({
        titulo: '',
        descripcion: '',
        subject_id: '',
        teacher_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        duracion_minutos: '',
        puntaje_total: '',
        estado: 'activo'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExam(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.titulo || !formData.subject_id || !formData.teacher_id) {
      return 'El título, materia y profesor son obligatorios';
    }
    if (formData.duracion_minutos && parseInt(formData.duracion_minutos) <= 0) {
      return 'La duración debe ser mayor a 0';
    }
    if (formData.puntaje_total && parseInt(formData.puntaje_total) <= 0) {
      return 'El puntaje total debe ser mayor a 0';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      const formDataToSend = {
        ...formData,
        duracion_minutos: formData.duracion_minutos ? parseInt(formData.duracion_minutos) : null,
        puntaje_total: formData.puntaje_total ? parseInt(formData.puntaje_total) : null
      };

      if (editingExam) {
        await examService.update(editingExam.id, formDataToSend);
      } else {
        await examService.create(formDataToSend);
      }
      
      await loadData();
      handleCloseDialog();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este examen?')) {
      try {
        setError(null);
        await examService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'borrador': return 'warning';
      case 'programado': return 'info';
      default: return 'default';
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.nombre_completo : 'Profesor no encontrado';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.nombre : 'Materia no encontrada';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'No especificada';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
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
          Gestión de Exámenes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {(user?.roles?.includes('admin') || user?.roles?.includes('teacher')) && (
            <Button
              startIcon={<AssignmentTurnedInIcon />}
              variant="contained"
              color="secondary"
              onClick={() => onNavigate('/exam-assignments')}
            >
              Asignar Exámenes
            </Button>
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadData}
            variant="outlined"
            color="primary"
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Exámenes
              </Typography>
              <Typography variant="h4" component="div">
                {exams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Exámenes Activos
              </Typography>
              <Typography variant="h4" component="div">
                {exams.filter(e => e.estado === 'activo').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Materias Diferentes
              </Typography>
              <Typography variant="h4" component="div">
                {new Set(exams.map(e => e.subject_id)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Profesores Diferentes
              </Typography>
              <Typography variant="h4" component="div">
                {new Set(exams.map(e => e.teacher_id)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ background: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Título</TableCell>
              <TableCell sx={{ color: '#fff' }}>Materia</TableCell>
              <TableCell sx={{ color: '#fff' }}>Profesor</TableCell>
              <TableCell sx={{ color: '#fff' }}>Duración</TableCell>
              <TableCell sx={{ color: '#fff' }}>Puntaje</TableCell>
              <TableCell sx={{ color: '#fff' }}>Fechas</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay exámenes disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {exam.titulo}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {exam.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getSubjectName(exam.subject_id)}</TableCell>
                  <TableCell>{getTeacherName(exam.teacher_id)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimerIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {formatDuration(exam.duracion_minutos)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${exam.puntaje_total || 0} pts`}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <strong>Inicio:</strong> {formatDate(exam.fecha_inicio)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fin:</strong> {formatDate(exam.fecha_fin)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exam.estado === 'activo' ? 'Activo' : exam.estado}
                      color={getStatusColor(exam.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(exam)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(exam.id)}
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
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExam ? 'Editar Examen' : 'Crear Nuevo Examen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Título del Examen"
                name="titulo"
                fullWidth
                value={formData.titulo}
                onChange={handleInputChange}
                required
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
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Materia</InputLabel>
                <Select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  label="Materia"
                  required
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
                <InputLabel>Profesor</InputLabel>
                <Select
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  label="Profesor"
                  required
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.nombre_completo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Inicio"
                name="fecha_inicio"
                type="datetime-local"
                fullWidth
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fecha de Fin"
                name="fecha_fin"
                type="datetime-local"
                fullWidth
                value={formData.fecha_fin}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Duración (minutos)"
                name="duracion_minutos"
                type="number"
                fullWidth
                value={formData.duracion_minutos}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 480 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Puntaje Total"
                name="puntaje_total"
                type="number"
                fullWidth
                value={formData.puntaje_total}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="borrador">Borrador</MenuItem>
                  <MenuItem value="programado">Programado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingExam ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exams; 