import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Fab, CircularProgress,
  Alert, Chip, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { subjectService, gradeService } from '../services/api';

const Subjects = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '', 
    codigo: '', 
    creditos: '', 
    horas_teoricas: '',
    horas_practicas: '',
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
      
      const [subjectsData, gradesData] = await Promise.all([
        subjectService.getAll(),
        gradeService.getAll()
      ]);
      
      setSubjects(subjectsData);
      setGrades(gradesData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (subject = null) => {
    setEditing(subject);
    if (subject) {
      setForm({
        nombre: subject.nombre || '',
        descripcion: subject.descripcion || '',
        codigo: subject.codigo || '',
        creditos: subject.creditos || '',
        horas_teoricas: subject.horas_teoricas || '',
        horas_practicas: subject.horas_practicas || '',
        estado: subject.estado || 'activo'
      });
    } else {
      setForm({ 
        nombre: '', 
        descripcion: '', 
        codigo: '', 
        creditos: '', 
        horas_teoricas: '',
        horas_practicas: '',
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
      codigo: '', 
      creditos: '', 
      horas_teoricas: '',
      horas_practicas: '',
      estado: 'activo'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre || !form.codigo) {
      return 'El nombre y código son obligatorios';
    }
    if (form.creditos && parseInt(form.creditos) <= 0) {
      return 'Los créditos deben ser mayores a 0';
    }
    if (form.horas_teoricas && parseInt(form.horas_teoricas) < 0) {
      return 'Las horas teóricas no pueden ser negativas';
    }
    if (form.horas_practicas && parseInt(form.horas_practicas) < 0) {
      return 'Las horas prácticas no pueden ser negativas';
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
        creditos: form.creditos ? parseInt(form.creditos) : null,
        horas_teoricas: form.horas_teoricas ? parseInt(form.horas_teoricas) : null,
        horas_practicas: form.horas_practicas ? parseInt(form.horas_practicas) : null
      };

      if (editing) {
        await subjectService.update(editing.id, formData);
      } else {
        await subjectService.create(formData);
      }
      
      await loadData();
      handleClose();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      try {
        setError(null);
        await subjectService.delete(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'activo' ? 'success' : 'error';
  };

  const getCreditsColor = (credits) => {
    if (!credits) return 'default';
    if (credits >= 5) return 'error';
    if (credits >= 3) return 'warning';
    return 'success';
  };

  // Verificar si el usuario es estudiante
  const isStudent = user?.roles?.includes('student');

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
          Gestión de Materias
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

      {isStudent && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Modo de solo lectura: Puedes ver las materias disponibles pero no modificarlas.
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Materias
              </Typography>
              <Typography variant="h4" component="div">
                {subjects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Materias Activas
              </Typography>
              <Typography variant="h4" component="div">
                {subjects.filter(s => s.estado === 'activo').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Créditos
              </Typography>
              <Typography variant="h4" component="div">
                {subjects.reduce((sum, s) => sum + (s.creditos || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Horas
              </Typography>
              <Typography variant="h4" component="div">
                {subjects.reduce((sum, s) => sum + (s.horas_teoricas || 0) + (s.horas_practicas || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ background: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Código</TableCell>
              <TableCell sx={{ color: '#fff' }}>Nombre</TableCell>
              <TableCell sx={{ color: '#fff' }}>Descripción</TableCell>
              <TableCell sx={{ color: '#fff' }}>Créditos</TableCell>
              <TableCell sx={{ color: '#fff' }}>Horas</TableCell>
              <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
              {!isStudent && <TableCell sx={{ color: '#fff' }} align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isStudent ? 6 : 7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No hay materias disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {subject.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {subject.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>{subject.descripcion || 'Sin descripción'}</TableCell>
                  <TableCell>
                    {subject.creditos ? (
                      <Chip
                        label={`${subject.creditos} créditos`}
                        color={getCreditsColor(subject.creditos)}
                        size="small"
                      />
                    ) : (
                      'No especificado'
                    )}
                  </TableCell>
                  <TableCell>
                    {subject.horas_teoricas || subject.horas_practicas ? (
                      <Typography variant="body2">
                        T: {subject.horas_teoricas || 0}h | P: {subject.horas_practicas || 0}h
                      </Typography>
                    ) : (
                      'No especificado'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={subject.estado === 'activo' ? 'Activa' : 'Inactiva'}
                      color={getStatusColor(subject.estado)}
                      size="small"
                    />
                  </TableCell>
                  {!isStudent && (
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpen(subject)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(subject.id)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isStudent && (
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 32, right: 32 }} 
          onClick={() => handleOpen()}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Editar Materia' : 'Crear Nueva Materia'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Código de la Materia"
            name="codigo"
            fullWidth
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: MAT101"
          />

          <TextField
            margin="dense"
            label="Nombre de la Materia"
            name="nombre"
            fullWidth
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Matemáticas Básicas"
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
            placeholder="Descripción de la materia..."
          />

          <TextField
            margin="dense"
            label="Créditos"
            name="creditos"
            type="number"
            fullWidth
            value={form.creditos}
            onChange={handleChange}
            inputProps={{ min: 1, max: 10 }}
            placeholder="Número de créditos"
          />

          <TextField
            margin="dense"
            label="Horas Teóricas"
            name="horas_teoricas"
            type="number"
            fullWidth
            value={form.horas_teoricas}
            onChange={handleChange}
            inputProps={{ min: 0, max: 20 }}
            placeholder="Horas de teoría por semana"
          />

          <TextField
            margin="dense"
            label="Horas Prácticas"
            name="horas_practicas"
            type="number"
            fullWidth
            value={form.horas_practicas}
            onChange={handleChange}
            inputProps={{ min: 0, max: 20 }}
            placeholder="Horas de práctica por semana"
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

export default Subjects; 