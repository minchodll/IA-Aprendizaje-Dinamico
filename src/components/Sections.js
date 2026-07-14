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
import { sectionService, gradeService } from '../services/api';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    grade_id: '', 
    capacidad_maxima: '', 
    horario: '',
    estado: 'activo'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sectionsData, gradesData] = await Promise.all([
        sectionService.getAll(),
        gradeService.getAll()
      ]);
      
      setSections(sectionsData);
      setGrades(gradesData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (section = null) => {
    setEditing(section);
    if (section) {
      setForm({
        nombre: section.nombre || '',
        descripcion: section.descripcion || '',
        grade_id: section.grade_id || '',
        capacidad_maxima: section.capacidad_maxima || '',
        horario: section.horario || '',
        estado: section.estado || 'activo'
      });
    } else {
      setForm({ 
        nombre: '', 
        descripcion: '', 
        grade_id: '', 
        capacidad_maxima: '', 
        horario: '',
        estado: 'activo'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm({ 
      nombre: '', 
      descripcion: '', 
      grade_id: '', 
      capacidad_maxima: '', 
      horario: '',
      estado: 'activo'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre || !form.grade_id) {
      return 'El nombre y el grado son obligatorios';
    }
    if (form.capacidad_maxima && parseInt(form.capacidad_maxima) <= 0) {
      return 'La capacidad máxima debe ser mayor a 0';
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
        capacidad_maxima: form.capacidad_maxima ? parseInt(form.capacidad_maxima) : null
      };

      if (editing) {
        await sectionService.update(editing.id, formData);
      } else {
        await sectionService.create(formData);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sección?')) {
      try {
        setError(null);
        await sectionService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
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

  const getStatusColor = (status) => {
    return status === 'activo' ? 'success' : 'error';
  };

  const getCapacityColor = (current, max) => {
    if (!max) return 'default';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
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
          Gestión de Secciones
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
                Total de Secciones
              </Typography>
              <Typography variant="h4" component="div">
                {sections.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Secciones Activas
              </Typography>
              <Typography variant="h4" component="div">
                {sections.filter(s => s.estado === 'activo').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Grados Diferentes
              </Typography>
              <Typography variant="h4" component="div">
                {new Set(sections.map(s => s.grade_id)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Capacidad Total
              </Typography>
              <Typography variant="h4" component="div">
                {sections.reduce((sum, s) => sum + (s.capacidad_maxima || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ background: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
              <TableCell sx={{ color: '#fff' }}>Grado</TableCell>
              <TableCell sx={{ color: '#fff' }}>Capacidad</TableCell>
              <TableCell sx={{ color: '#fff' }}>Horario</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay secciones disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
                <TableRow key={section.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {section.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>{section.descripcion || 'Sin descripción'}</TableCell>
                  <TableCell>{getGradeName(section.grade_id)}</TableCell>
                  <TableCell>
                    {section.capacidad_maxima ? (
                      <Chip
                        label={`${section.capacidad_maxima} estudiantes`}
                        color={getCapacityColor(section.students_count || 0, section.capacidad_maxima)}
                        size="small"
                      />
                    ) : (
                      'Sin límite'
                    )}
                  </TableCell>
                  <TableCell>{section.horario || 'No especificado'}</TableCell>
                  <TableCell>
                    <Chip
                      label={section.estado === 'activo' ? 'Activa' : 'Inactiva'}
                      color={getStatusColor(section.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpen(section)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(section.id)}
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
          {editing ? 'Editar Sección' : 'Crear Nueva Sección'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre de la Sección"
            name="nombre"
            fullWidth
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Sección A"
          />

          <TextField
            margin="dense"
            label="Descripción"
            name="descripcion"
            fullWidth
            multiline
            rows={2}
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción de la sección..."
          />

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

          <TextField
            margin="dense"
            label="Capacidad Máxima"
            name="capacidad_maxima"
            type="number"
            fullWidth
            value={form.capacidad_maxima}
            onChange={handleChange}
            inputProps={{ min: 1, max: 100 }}
            placeholder="Número máximo de estudiantes"
          />

          <TextField
            margin="dense"
            label="Horario"
            name="horario"
            fullWidth
            value={form.horario}
            onChange={handleChange}
            placeholder="Ej: 7:00 AM - 2:00 PM"
          />

          <TextField
            margin="dense"
            label="Estado"
            name="estado"
            fullWidth
            select
            value={form.estado}
            onChange={handleChange}
          >
            <option value="activo">Activa</option>
            <option value="inactivo">Inactiva</option>
          </TextField>
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

export default Sections; 