import React, { useState, useEffect } from 'react';
import { studentService, gradeService, sectionService } from '../services/api';
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
  Avatar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Grade as GradeIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    usuario: '',
    email: '',
    password: '',
    password_confirmation: '',
    clave: '',
    grado_id: '',
    seccion: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, gradesData, sectionsData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
        sectionService.getAll()
      ]);
      
      // Manejo seguro de datos con verificación de estructura
      const studentsArray = studentsData?.data || studentsData || [];
      const gradesArray = gradesData?.data || gradesData || [];
      const sectionsArray = sectionsData?.data || sectionsData || [];
      
      console.log('Setting students:', studentsArray.length);
      console.log('Setting grades:', gradesArray.length);
      console.log('Setting sections:', sectionsArray.length);
      
      setStudents(studentsArray);
      setGrades(gradesArray);
      setSections(sectionsArray);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      setLoadingGrades(true);
      const gradesData = await gradeService.getAll();
      console.log('Grades loaded:', gradesData);
      setGrades(gradesData?.data || gradesData || []);
    } catch (err) {
      console.error('Error loading grades:', err);
      setError('Error al cargar los grados: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadSections = async () => {
    try {
      setLoadingSections(true);
      const sectionsData = await sectionService.getAll();
      console.log('Sections loaded:', sectionsData);
      setSections(sectionsData?.data || sectionsData || []);
    } catch (err) {
      console.error('Error loading sections:', err);
      setError('Error al cargar las secciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSections(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        nombre_completo: student.nombre_completo || '',
        usuario: student.usuario || '',
        email: student.user ? student.user.email : (student.usuario + '@escuela.com'),
        password: '',
        password_confirmation: '',
        clave: student.clave || '',
        grado_id: (student.grado_id && typeof student.grado_id === 'object') ? student.grado_id.id : (student.grado_id || ''),
        seccion: student.seccion || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        nombre_completo: '',
        usuario: '',
        email: '',
        password: '',
        password_confirmation: '',
        clave: '',
        grado_id: '',
        seccion: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre_completo || !formData.usuario || !formData.email || !formData.clave) {
      return 'El nombre completo, usuario, correo y clave son obligatorios';
    }
    if (!editingStudent && (!formData.password || !formData.password_confirmation)) {
      return 'La contraseña y confirmación son obligatorias para nuevos estudiantes';
    }
    if (formData.password && formData.password !== formData.password_confirmation) {
      return 'Las contraseñas no coinciden';
    }
    if (formData.password && formData.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
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
      const submitData = { ...formData };
      
      // Solo incluir contraseña si se está editando y se proporcionó una nueva
      if (editingStudent && !formData.password) {
        delete submitData.password;
        delete submitData.password_confirmation;
      }

      if (editingStudent) {
        await studentService.update(editingStudent.id, submitData);
      } else {
        await studentService.create(submitData);
      }

      await loadData();
      handleCloseDialog();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      return;
    }

    try {
      await studentService.delete(id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };



  const getGradeName = (gradeId) => {
    // Si gradeId es un objeto (relación cargada), usar directamente
    if (gradeId && typeof gradeId === 'object' && gradeId.nombre) {
      return gradeId.nombre;
    }
    // Si es un ID, buscar en el array de grados
    const grade = grades.find(g => g.id == gradeId);
    return grade ? grade.nombre : 'N/A';
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          Gestión de Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
            }
          }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {students.length}
              </Typography>
              <Typography variant="body2">
                Total de Estudiantes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {students.length}
              </Typography>
              <Typography variant="body2">
                Estudiantes Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #66bb6a 0%, #81c784 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h4" component="div">
                0
              </Typography>
              <Typography variant="body2">
                Graduados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #81c784 0%, #a5d6a7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h4" component="div">
                {grades.length}
              </Typography>
              <Typography variant="body2">
                Grados Disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e7d32' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estudiante</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Correo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clave</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sección</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay estudiantes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          backgroundColor: '#2e7d32',
                          width: 40,
                          height: 40
                        }}>
                          {student.nombre_completo?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {student.nombre_completo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Estudiante
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {student.usuario}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
                        <Typography variant="body2">
                          {student.usuario}@escuela.com
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.clave} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(() => {
                          const gradeName = getGradeName(student.grado_id);
                          return typeof gradeName === 'string' ? gradeName : 'N/A';
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {student.seccion}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip 
                        label="Estudiante" 
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(student)}
                        sx={{ 
                          color: '#2e7d32',
                          '&:hover': { backgroundColor: '#e8f5e8' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(student.id)}
                        sx={{ 
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: '#ffebee' }
                        }}
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
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#2e7d32', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          {editingStudent ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Información de estado */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8faf8', borderRadius: 1, border: '1px solid #e8f5e8' }}>
            <Typography variant="body2" sx={{ color: '#2e7d32', mb: 1 }}>
              <strong>Estado de datos:</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Grados: ${grades.length}`} 
                color={grades.length > 0 ? 'success' : 'error'} 
                size="small" 
              />
              <Chip 
                label={`Secciones: ${sections.length}`} 
                color={sections.length > 0 ? 'success' : 'warning'} 
                size="small" 
              />
              {loadingGrades && <Chip label="Cargando grados..." color="info" size="small" />}
              {loadingSections && <Chip label="Cargando secciones..." color="info" size="small" />}
            </Box>
          </Box>

          <Grid container spacing={2}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2 }}>
                Información Personal
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre Completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Clave Única"
                name="clave"
                value={formData.clave}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
                helperText="Identificador único del estudiante"
              />
            </Grid>

            {/* Información de Usuario */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, mt: 2 }}>
                Información de Usuario
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required={!editingStudent}
                margin="dense"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={editingStudent ? "Dejar vacío para mantener la contraseña actual" : "Mínimo 8 caracteres"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirmar Contraseña"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleInputChange}
                fullWidth
                required={!editingStudent}
                margin="dense"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Información Académica */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, mt: 2 }}>
                Información Académica
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Grado *</InputLabel>
                  <Select
                    name="grado_id"
                    value={formData.grado_id}
                    onChange={handleInputChange}
                    label="Grado *"
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          minWidth: 250
                        }
                      }
                    }}
                  >
                    {loadingGrades ? (
                      <MenuItem disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2">Cargando grados...</Typography>
                        </Box>
                      </MenuItem>
                    ) : grades.length === 0 ? (
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          No hay grados disponibles
                        </Typography>
                      </MenuItem>
                    ) : (
                      grades.map((grade) => (
                        <MenuItem key={grade.id} value={grade.id}>
                          <Typography variant="body1">
                            {grade.nombre}
                          </Typography>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {grades.length === 0 && !loadingGrades && (
                    <Typography variant="caption" color="error">
                      No hay grados disponibles. Contacte al administrador.
                    </Typography>
                  )}
                </FormControl>
                <IconButton 
                  onClick={loadGrades}
                  disabled={loadingGrades}
                  sx={{ color: '#2e7d32' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Sección</InputLabel>
                  <Select
                    name="seccion"
                    value={formData.seccion}
                    onChange={handleInputChange}
                    label="Sección"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          minWidth: 250
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">
                        Sin sección
                      </Typography>
                    </MenuItem>
                    <MenuItem value="A">Sección A</MenuItem>
                    <MenuItem value="B">Sección B</MenuItem>
                    <MenuItem value="C">Sección C</MenuItem>
                    <MenuItem value="D">Sección D</MenuItem>
                  </Select>
                  {sections.length === 0 && !loadingSections && (
                    <Typography variant="caption" color="warning">
                      No hay secciones disponibles. Se puede crear sin sección.
                    </Typography>
                  )}
                </FormControl>
                <IconButton 
                  onClick={loadSections}
                  disabled={loadingSections}
                  sx={{ color: '#2e7d32' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
              }
            }}
          >
            {editingStudent ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students; 