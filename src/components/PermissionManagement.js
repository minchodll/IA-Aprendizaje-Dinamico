import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para el modal
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });

  const permissionCategories = [
    'users',
    'roles',
    'permissions',
    'dashboard',
    'reports',
    'settings',
    'api'
  ];

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPermissions(response.data.permissions);
    } catch (err) {
      setError('Error al cargar permisos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      setEditingPermission(permission);
      setFormData({
        name: permission.name,
        description: permission.description || '',
        category: getPermissionCategory(permission.name)
      });
    } else {
      setEditingPermission(null);
      setFormData({
        name: '',
        description: '',
        category: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPermission(null);
    setFormData({
      name: '',
      description: '',
      category: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const dataToSend = { ...formData, guard_name: 'web' };

      if (editingPermission) {
        // Actualizar permiso existente
        await axios.put(`http://localhost:8000/api/permissions/${editingPermission.id}`, dataToSend, { headers });
        setSuccess('Permiso actualizado exitosamente');
      } else {
        // Crear nuevo permiso
        await axios.post('http://localhost:8000/api/permissions', dataToSend, { headers });
        setSuccess('Permiso creado exitosamente');
      }

      handleCloseDialog();
      fetchPermissions();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este permiso?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/permissions/${permissionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccess('Permiso eliminado exitosamente');
      fetchPermissions();
    } catch (err) {
      setError('Error al eliminar permiso: ' + (err.response?.data?.message || err.message));
    }
  };

  const getPermissionCategory = (permissionName) => {
    if (permissionName.includes('user')) return 'users';
    if (permissionName.includes('role')) return 'roles';
    if (permissionName.includes('permission')) return 'permissions';
    if (permissionName.includes('dashboard')) return 'dashboard';
    if (permissionName.includes('report')) return 'reports';
    if (permissionName.includes('setting')) return 'settings';
    if (permissionName.includes('api')) return 'api';
    return 'general';
  };

  const getCategoryColor = (category) => {
    const colors = {
      users: 'primary',
      roles: 'secondary',
      permissions: 'error',
      dashboard: 'success',
      reports: 'warning',
      settings: 'info',
      api: 'default'
    };
    return colors[category] || 'default';
  };

  const getPermissionsByCategory = () => {
    const grouped = {};
    permissions.forEach(permission => {
      const category = getPermissionCategory(permission.name);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  if (loading && permissions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Permisos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Permiso
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Permisos
              </Typography>
              <Typography variant="h4">
                {permissions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categorías
              </Typography>
              <Typography variant="h4">
                {Object.keys(getPermissionsByCategory()).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Roles Activos
              </Typography>
              <Typography variant="h4">
                {roles.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Permisos del Sistema
              </Typography>
              <Typography variant="h4">
                {permissions.filter(p => ['view users', 'create users', 'edit users', 'delete users'].includes(p.name)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Permisos por Categoría */}
        {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
          <Grid item xs={12} key={category}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={category.toUpperCase()}
                  color={getCategoryColor(category)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {categoryPermissions.length} permisos
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Roles Asignados</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id} hover>
                        <TableCell>{permission.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {permission.description || 'Sin descripción'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {roles
                              .filter(role => role.permissions?.some(p => p.name === permission.name))
                              .map(role => (
                                <Chip
                                  key={role.id}
                                  label={role.name}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(permission)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePermission(permission.id)}
                              color="error"
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
          </Grid>
        ))}
      </Grid>

      {/* Modal para Crear/Editar Permiso */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Permiso"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              placeholder="ej: create users"
            />
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Descripción del permiso..."
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Categoría"
              >
                {permissionCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (editingPermission ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionManagement; 