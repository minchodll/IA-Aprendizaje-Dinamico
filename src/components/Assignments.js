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
import { assignmentService, teacherService, gradeService, sectionService, subjectService } from '../services/api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    teacher_id: '', 
    grade_id: '', 
    section_id: '', 
    subject_id: '', 
    academic_year: '', 
    semester: '', 
    status: 'active' 
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignmentsData, teachersData, gradesData, sectionsData, subjectsData] = await Promise.all([
        assignmentService.getAll(),
        teacherService.getAll(),
        gradeService.getAll(),
        sectionService.getAll(),
        subjectService.getAll()
      ]);
      
      setAssignments(assignmentsData);
      setTeachers(teachersData);
      setGrades(gradesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (assignment = null) => {
    setEditing(assignment);
    if (assignment) {
      setForm({
        teacher_id: assignment.teacher_id || '',
        grade_id: assignment.grade_id || '',
        section_id: assignment.section_id || '',
        subject_id: assignment.subject_id || '',
        academic_year: assignment.academic_year || '',
        semester: assignment.semester || '',
        status: assignment.status || 'active'
      });
    } else {
      setForm({ 
        teacher_id: '', 
        grade_id: '', 
        section_id: '', 
        subject_id: '', 
        academic_year: '', 
        semester: '', 
        status: 'active' 
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ 
      teacher_id: '', 
      grade_id: '', 
      section_id: '', 
      subject_id: '', 
      academic_year: '', 
      semester: '', 
      status: 'active' 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.teacher_id || !form.grade_id || !form.section_id || !form.subject_id || !form.academic_year) {
      return 'Todos los campos obligatorios deben estar completos';
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
        await assignmentService.update(editing.id, form);
    } else {
        await assignmentService.create(form);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      try {
        setError(null);
        await assignmentService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getTeacherName = (teacherId) => {
    // Si teacherId es un objeto (relación cargada), usar directamente
    if (teacherId && typeof teacherId === 'object' && teacherId.nombre_completo) {
      return teacherId.nombre_completo;
    }
    // Si es un ID, buscar en el array de profesores
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.nombre_completo : 'Profesor no encontrado';
  };

  const getGradeName = (gradeId) => {
    // Si gradeId es un objeto (relación cargada), usar directamente
    if (gradeId && typeof gradeId === 'object' && gradeId.nombre) {
      return gradeId.nombre;
    }
    // Si es un ID, buscar en el array de grados
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.nombre : 'Grado no encontrado';
  };

  const getSectionName = (sectionId) => {
    // Si sectionId es un objeto (relación cargada), usar directamente
    if (sectionId && typeof sectionId === 'object' && sectionId.nombre) {
      return sectionId.nombre;
    }
    // Si es un ID, buscar en el array de secciones
    const section = sections.find(s => s.id === sectionId);
    return section ? section.nombre : 'Sección no encontrada';
  };

  const getSubjectName = (subjectId) => {
    // Si subjectId es un objeto (relación cargada), usar directamente
    if (subjectId && typeof subjectId === 'object' && subjectId.nombre) {
      return subjectId.nombre;
    }
    // Si es un ID, buscar en el array de materias
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.nombre : 'Materia no encontrada';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
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
          Asignaciones de Profesores
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
              <TableCell sx={{ color: '#fff' }}>Profesor</TableCell>
              <TableCell sx={{ color: '#fff' }}>Grado</TableCell>
              <TableCell sx={{ color: '#fff' }}>Sección</TableCell>
              <TableCell sx={{ color: '#fff' }}>Materia</TableCell>
              <TableCell sx={{ color: '#fff' }}>Año Académico</TableCell>
              <TableCell sx={{ color: '#fff' }}>Semestre</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay asignaciones disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>{getTeacherName(assignment.teacher_id)}</TableCell>
                  <TableCell>{getGradeName(assignment.grade_id)}</TableCell>
                  <TableCell>{getSectionName(assignment.section_id)}</TableCell>
                  <TableCell>{getSubjectName(assignment.subject_id)}</TableCell>
                  <TableCell>{assignment.academic_year}</TableCell>
                  <TableCell>{assignment.semester || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.status === 'active' ? 'Activo' : 'Inactivo'}
                      color={getStatusColor(assignment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpen(assignment)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(assignment.id)}
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
          {editing ? 'Editar Asignación' : 'Crear Nueva Asignación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Profesor</InputLabel>
                <Select
                  name="teacher_id"
                  value={form.teacher_id}
                  onChange={handleChange}
                  label="Profesor"
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
              <FormControl fullWidth margin="dense">
                <InputLabel>Grado</InputLabel>
                <Select
                  name="grade_id"
                  value={form.grade_id}
                  onChange={handleChange}
                  label="Grado"
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Sección</InputLabel>
                <Select
                  name="section_id"
                  value={form.section_id}
                  onChange={handleChange}
                  label="Sección"
                >
                  {sections.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <TextField
                margin="dense"
                label="Año Académico"
                name="academic_year"
                fullWidth
                value={form.academic_year}
                onChange={handleChange}
                placeholder="2024-2025"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Semestre"
                name="semester"
                fullWidth
                value={form.semester}
                onChange={handleChange}
                placeholder="Primer Semestre"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
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

export default Assignments; 