import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, Chip, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { examService, studentService, gradeService, sectionService, examAssignmentService } from '../services/api';

const ExamAssignments = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('Componente montado, cargando datos iniciales...');
    loadData();
  }, []);

  // Filtrar estudiantes cuando cambian grado y sección
  useEffect(() => {
    console.log('Actualizando filtro de estudiantes:', {
      selectedGrade,
      selectedSection,
      totalStudents: students.length,
      studentsData: students
    });

    if (selectedGrade && selectedSection) {
      const filtered = students.filter(student => {
        const matchesGrade = student.grado_id == selectedGrade;
        const matchesSection = student.seccion === selectedSection; // Comparar como string
        
        if (!matchesGrade || !matchesSection) {
          console.log('Estudiante no coincide:', {
            studentId: student.id,
            studentGrade: student.grado_id,
            studentSection: student.seccion,
            selectedGrade,
            selectedSection,
            matchesGrade,
            matchesSection
          });
        }
        
        return matchesGrade && matchesSection;
      });

      console.log('Estudiantes filtrados:', {
        filtered,
        count: filtered.length,
        criterios: {
          grado: selectedGrade,
          seccion: selectedSection
        }
      });

      setFilteredStudents(filtered);
      setSelectedStudents([]);
    } else {
      console.log('No hay grado o sección seleccionada, limpiando filtros');
      setFilteredStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedGrade, selectedSection, students]);

  // Monitorear cambios en el estado de loading
  useEffect(() => {
    console.log('Estado de loading cambiado:', loading);
  }, [loading]);

  // Monitorear cambios en la selección
  useEffect(() => {
    console.log('Selección actualizada:', {
      exam: selectedExam,
      grade: selectedGrade,
      section: selectedSection,
      studentsCount: selectedStudents.length
    });
  }, [selectedExam, selectedGrade, selectedSection, selectedStudents]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando datos iniciales...');
      
      const [examsData, studentsData, gradesData, sectionsData] = await Promise.all([
        examService.getAll(),
        studentService.getAll(),
        gradeService.getAll(),
        sectionService.getAll()
      ]);
      
      console.log('Datos cargados:', {
        exams: examsData?.length,
        students: studentsData?.length,
        grades: gradesData?.length,
        sections: sectionsData?.length
      });

      if (!Array.isArray(studentsData)) {
        throw new Error('Los datos de estudiantes no son válidos');
      }

      // Log detallado de estudiantes
      console.log('Detalles de estudiantes cargados:');
      studentsData.forEach((student, index) => {
        console.log(`Estudiante ${index + 1}:`, {
          id: student.id,
          nombre: student.nombre_completo,
          grado_id: student.grado_id,
          seccion: student.seccion,
          usuario: student.usuario,
          email: student.email
        });
      });

      setExams(examsData || []);
      setStudents(studentsData);
      setGrades(gradesData || []);
      setSections(sectionsData || []);
      
      // Cargar asignaciones existentes
      try {
        console.log('Cargando asignaciones existentes...');
        const assignmentsData = await examAssignmentService.getAll();
        console.log('Asignaciones cargadas:', assignmentsData?.length);
        setAssignments(assignmentsData || []);
      } catch (err) {
        console.warn('No hay asignaciones cargadas aún:', err.message);
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error al cargar los datos:', err);
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    console.log('Abriendo diálogo de asignación');
    setError(null);
    setSelectedExam('');
    setSelectedGrade('');
    setSelectedSection('');
    setSelectedStudents([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('Cerrando diálogo de asignación');
    setError(null);
    setSelectedExam('');
    setSelectedGrade('');
    setSelectedSection('');
    setSelectedStudents([]);
    setOpenDialog(false);
  };

  const handleExamChange = (event) => {
    console.log('Examen seleccionado:', event.target.value);
    setSelectedExam(event.target.value);
  };

  const handleGradeChange = (event) => {
    console.log('Grado seleccionado:', event.target.value);
    setSelectedGrade(event.target.value);
  };

  const handleSectionChange = (event) => {
    console.log('Sección seleccionada:', event.target.value);
    setSelectedSection(event.target.value);
  };

  const handleStudentToggle = (studentId) => {
    console.log('Alternando selección de estudiante:', studentId);
    setSelectedStudents(prev => {
      const newSelection = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];
      console.log('Nueva selección de estudiantes:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAllStudents = () => {
    console.log('Alternando selección de todos los estudiantes');
    if (selectedStudents.length === filteredStudents.length) {
      console.log('Deseleccionando todos los estudiantes');
      setSelectedStudents([]);
    } else {
      const allStudentIds = filteredStudents.map(student => student.id);
      console.log('Seleccionando todos los estudiantes:', allStudentIds);
      setSelectedStudents(allStudentIds);
    }
  };

  const handleAssignExam = async () => {
    console.log('Iniciando asignación de examen con:', {
      selectedExam,
      selectedGrade,
      selectedSection,
      selectedStudentsCount: selectedStudents.length
    });

    if (!selectedExam || !selectedGrade || !selectedSection || selectedStudents.length === 0) {
      const error = 'Por favor selecciona un examen, grado, sección y al menos un estudiante';
      console.error(error, {
        selectedExam,
        selectedGrade,
        selectedSection,
        selectedStudents
      });
      setError(error);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log('Creando asignaciones para estudiantes:', selectedStudents);
      
      // Procesar estudiantes uno por uno para mejor manejo de errores
      for (const studentId of selectedStudents) {
        console.log(`Asignando examen al estudiante ${studentId}`);
        try {
          await examAssignmentService.create({
            exam_id: selectedExam,
            student_id: studentId,
            assigned_at: new Date().toISOString(),
            status: 'pending'
          });
          console.log(`Examen asignado exitosamente al estudiante ${studentId}`);
        } catch (studentError) {
          console.error(`Error al asignar examen al estudiante ${studentId}:`, studentError);
          throw new Error(`Error al asignar al estudiante ${studentId}: ${studentError.message}`);
        }
      }

      console.log('Todas las asignaciones completadas, recargando datos...');
      
      // Recargar asignaciones
      const assignmentsData = await examAssignmentService.getAll();
      console.log('Nuevas asignaciones cargadas:', assignmentsData);
      
      setAssignments(assignmentsData);
      handleCloseDialog();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('Error al asignar el examen:', {
        error: err,
        message: errorMessage,
        response: err.response?.data
      });
      setError('Error al asignar el examen: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToAllStudents = async () => {
    console.log('Iniciando asignación masiva de examen con:', {
      selectedExam,
      selectedGrade,
      selectedSection
    });

    if (!selectedExam || !selectedGrade || !selectedSection) {
      const error = 'Por favor selecciona un examen, grado y sección';
      console.error(error, {
        selectedExam,
        selectedGrade,
        selectedSection
      });
      setError(error);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log('Asignando examen a todos los estudiantes del grado y sección');
      
      const response = await examAssignmentService.assignToGradeSection({
        exam_id: selectedExam,
        grade_id: selectedGrade,
        section: selectedSection,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      });

      console.log('Asignación masiva completada:', response);
      
      // Recargar asignaciones
      const assignmentsData = await examAssignmentService.getAll();
      console.log('Nuevas asignaciones cargadas:', assignmentsData);
      
      setAssignments(assignmentsData);
      handleCloseDialog();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('Error al asignar el examen masivamente:', {
        error: err,
        message: errorMessage,
        response: err.response?.data
      });
      setError('Error al asignar el examen: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      try {
        setError(null);
        await examAssignmentService.delete(assignmentId);
        
        // Recargar asignaciones
        const assignmentsData = await examAssignmentService.getAll();
        setAssignments(assignmentsData);
      } catch (err) {
        setError('Error al eliminar la asignación: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getExamName = (examId) => {
    const exam = exams.find(e => e.id == examId);
    return exam ? exam.titulo : 'Examen no encontrado';
  };

  const getGradeName = (gradeId) => {
    // Si gradeId es un objeto (relación cargada), usar directamente
    if (gradeId && typeof gradeId === 'object' && gradeId.nombre) {
      return gradeId.nombre;
    }
    // Si es un ID, buscar en el array de grados
    const grade = grades.find(g => g.id == gradeId);
    return grade ? grade.nombre : 'Grado no encontrado';
  };

  const getSectionName = (sectionId) => {
    // Si sectionId es un objeto (relación cargada), usar directamente
    if (sectionId && typeof sectionId === 'object' && sectionId.nombre) {
      return sectionId.nombre;
    }
    // Si es un string (nombre de sección), devolverlo directamente
    if (typeof sectionId === 'string') {
      return sectionId;
    }
    // Si es un ID, buscar en el array de secciones
    const section = sections.find(s => s.id == sectionId);
    return section ? section.nombre : 'Sección no encontrada';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          Asignación de Exámenes
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Asignaciones
              </Typography>
              <Typography variant="h4" component="div">
                {assignments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4" component="div">
                {assignments.filter(a => a.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completados
              </Typography>
              <Typography variant="h4" component="div">
                {assignments.filter(a => a.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Exámenes Disponibles
              </Typography>
              <Typography variant="h4" component="div">
                {exams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Asignaciones */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3 }}>
        <Table>
          <TableHead sx={{ background: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Examen</TableCell>
              <TableCell sx={{ color: '#fff' }}>Grado</TableCell>
              <TableCell sx={{ color: '#fff' }}>Sección</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estudiantes</TableCell>
              <TableCell sx={{ color: '#fff' }}>Fecha Asignación</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay asignaciones de exámenes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {assignment.exam?.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.grade?.nombre} 
                      color="primary" 
                      size="small"
                      icon={<SchoolIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.section?.nombre} 
                      color="secondary" 
                      size="small"
                      icon={<GroupIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.students?.length || 0} estudiantes
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(assignment.assigned_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.status === 'pending' ? 'Pendiente' : 'Completado'}
                      color={assignment.status === 'pending' ? 'warning' : 'success'}
                      size="small"
                      icon={assignment.status === 'pending' ? <CancelIcon /> : <CheckCircleIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      title="Eliminar asignación"
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

      {/* Botón flotante para asignar */}
      <Fab 
        color="primary" 
        aria-label="assign exam" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }} 
        onClick={handleOpenDialog}
      >
        <AssignmentIcon />
      </Fab>

      {/* Dialog para asignar examen */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Asignar Examen a Estudiantes
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Seleccionar Examen</InputLabel>
                <Select
                  value={selectedExam}
                  onChange={handleExamChange}
                  label="Seleccionar Examen"
                >
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Grado</InputLabel>
                <Select
                  value={selectedGrade}
                  onChange={handleGradeChange}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sección</InputLabel>
                <Select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  label="Sección"
                >
                  {sections.map((section) => (
                    <MenuItem key={section.id} value={section.nombre}>
                      {section.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {filteredStudents.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Estudiantes del Grado {getGradeName(selectedGrade)} - Sección {getSectionName(selectedSection)}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                      onChange={handleSelectAllStudents}
                    />
                  }
                  label={`Seleccionar todos (${filteredStudents.length})`}
                />
              </Box>
              
              <List sx={{ 
                maxHeight: 300, 
                overflow: 'auto', 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: 'background.paper' 
              }}>
                {filteredStudents.map((student) => (
                  <React.Fragment key={student.id}>
                    <ListItem 
                      button 
                      onClick={() => handleStudentToggle(student.id)}
                      selected={selectedStudents.includes(student.id)}
                    >
                      <Checkbox
                        edge="start"
                        checked={selectedStudents.includes(student.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {student.nombre} {student.apellido}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            ID: {student.codigo}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  {selectedStudents.length} de {filteredStudents.length} estudiantes seleccionados
                </Typography>
                {selectedStudents.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setSelectedStudents([])}
                    color="secondary"
                  >
                    Limpiar selección
                  </Button>
                )}
              </Box>
            </Box>
          ) : selectedGrade && selectedSection ? (
            <Box sx={{ mt: 2, p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">
                No hay estudiantes disponibles para el grado y sección seleccionados
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            color="secondary"
            disabled={loading}
          >
            Cancelar
          </Button>
          
          {filteredStudents.length > 0 && (
            <Button 
              onClick={handleAssignToAllStudents}
              variant="contained" 
              color="secondary"
              disabled={!selectedExam || !selectedGrade || !selectedSection || loading}
              sx={{ 
                minWidth: 120,
                ml: 1,
                '&:not(:disabled)': {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#7b1fa2'
                  }
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Asignando...
                </>
              ) : (
                `Asignar a Todos (${filteredStudents.length})`
              )}
            </Button>
          )}
          
          <Button 
            onClick={() => {
              console.log('Intentando asignar examen con:', {
                exam: selectedExam,
                grade: selectedGrade,
                section: selectedSection,
                students: selectedStudents
              });
              handleAssignExam();
            }}
            variant="contained" 
            color="primary"
            disabled={!selectedExam || !selectedGrade || !selectedSection || selectedStudents.length === 0 || loading}
            sx={{ 
              minWidth: 120,
              ml: 2,
              '&:not(:disabled)': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Asignando...
              </>
            ) : (
              'Asignar Examen'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamAssignments; 