import React, { useState, useEffect } from 'react';
import { teacherService } from '../services/api';
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton as MuiIconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    usuario: '',
    email: '',
    password: '',
    password_confirmation: '',
    especialidad: ''
  });

  const specialties = ['Matemáticas', 'Física', 'Química', 'Lenguaje', 'Historia', 'Geografía', 'Biología', 'Inglés', 'Arte', 'Música', 'Educación Física', 'Computación', 'Informática'];

  // Cargar profesores al montar el componente
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherService.getAll();
      setTeachers(response.data || response);
    } catch (err) {
      setError('Error al cargar los profesores: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        nombre_completo: teacher.nombre_completo || '',
        usuario: teacher.usuario || '',
        email: teacher.email || '',
        password: '',
        password_confirmation: '',
        especialidad: teacher.especialidad || ''
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        nombre_completo: '',
        usuario: '',
        email: '',
        password: '',
        password_confirmation: '',
        especialidad: ''
      });
    }
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTeacher(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.nombre_completo || !formData.usuario || !formData.email) {
      return 'El nombre completo, usuario y correo son obligatorios';
    }
    if (!editingTeacher && (!formData.password || !formData.password_confirmation)) {
      return 'La contraseña y confirmación son obligatorias para nuevos profesores';
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
      
      // Preparar datos para envío
      const submitData = {
        nombre_completo: formData.nombre_completo,
        usuario: formData.usuario,
        email: formData.email,
        especialidad: formData.especialidad
      };

      // Solo incluir contraseña si se está creando o si se cambió
      if (!editingTeacher || formData.password) {
        submitData.password = formData.password;
        submitData.password_confirmation = formData.password_confirmation;
      }

      if (editingTeacher) {
        // Editar profesor existente
        await teacherService.update(editingTeacher.id, submitData);
      } else {
        // Agregar nuevo profesor
        await teacherService.create(submitData);
      }
      
      handleCloseDialog();
      loadTeachers(); // Recargar la lista
    } catch (err) {
      setError('Error al guardar el profesor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
    try {
        setError(null);
      await teacherService.delete(id);
      loadTeachers(); // Recargar la lista
    } catch (err) {
      setError('Error al eliminar el profesor: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Inactivo': return 'error';
      case 'Jubilado': return 'info';
      case 'Licencia': return 'warning';
      default: return 'default';
    }
  };

  const totalTeachers = teachers.length;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2
        }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          Gestión de Profesores
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {totalTeachers}
                    </Typography>
                    <Typography variant="body2">Total Profesores</Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e7d32' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Profesor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Correo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Especialidad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: '#2e7d32',
                        width: 40,
                        height: 40
                      }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {teacher.nombre_completo || 'Sin nombre'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {teacher.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{teacher.usuario || 'Sin usuario'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{teacher.email || 'Sin correo'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                                          <Chip 
                        label={teacher.especialidad || 'Sin especialidad'} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#e8f5e8',
                          color: '#2e7d32',
                          fontWeight: 'bold'
                        }}
                      />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={teacher.roles?.[0] || 'Sin rol'} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(teacher)}
                        sx={{ 
                          color: '#2e7d32',
                          '&:hover': { backgroundColor: '#e8f5e8' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(teacher.id)}
                        sx={{ 
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: '#ffebee' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#2e7d32', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          {editingTeacher ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
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
              <FormControl fullWidth margin="dense">
                <InputLabel>Especialidad</InputLabel>
                <Select
              name="especialidad"
              value={formData.especialidad}
              onChange={handleInputChange}
                  label="Especialidad"
                >
                  <MenuItem value="">Seleccionar especialidad</MenuItem>
              {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                  {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required={!editingTeacher}
                margin="dense"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MuiIconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </MuiIconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={editingTeacher ? "Dejar vacío para mantener la contraseña actual" : "Mínimo 8 caracteres"}
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
                required={!editingTeacher}
                margin="dense"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MuiIconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </MuiIconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
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
            {editingTeacher ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers; 