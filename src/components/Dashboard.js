import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import AdminPanel from './AdminPanel';
import BasicStats from './BasicStats';
import axios from 'axios';
import { authService } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [refreshingPermissions, setRefreshingPermissions] = useState(false);

  useEffect(() => {
    if (!showAdminPanel) {
      fetchDashboardData();
    }
  }, [showAdminPanel]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDashboardData(response.data.data);
    } catch (err) {
      setError('No tienes permisos para ver el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (onLogout) {
        onLogout();
      }
    }
  };

  const handleRefreshPermissions = async () => {
    setRefreshingPermissions(true);
    try {
      const refreshedData = await authService.refreshPermissions();
      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      setError('Error al actualizar permisos');
    } finally {
      setRefreshingPermissions(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon sx={{ color: 'error.main' }} />;
      case 'manager':
        return <ManagerIcon sx={{ color: 'warning.main' }} />;
      case 'user':
        return <UserIcon sx={{ color: 'info.main' }} />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'success';
      case 'manager':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'default';
    }
  };

  // Si el usuario es admin y quiere ver el panel administrativo
  if (showAdminPanel && user?.roles?.includes('admin')) {
    return <AdminPanel user={user} onLogout={onLogout} />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Administración
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.name}
            </Typography>
            <Avatar 
              sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
              onClick={handleMenuClick}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {user?.roles?.includes('admin') && (
              <MenuItem onClick={() => { setShowAdminPanel(true); handleMenuClose(); }}>
                <ListItemIcon>
                  <AdminIcon fontSize="small" />
                </ListItemIcon>
                Panel de Administración
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Información del Usuario */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Información del Usuario</Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                <strong>Nombre:</strong> {user?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {user?.id}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Roles:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user?.roles?.map((role) => (
                    <Chip
                      key={role}
                      icon={getRoleIcon(role)}
                      label={role}
                      color={getRoleColor(role)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Estadísticas del Sistema */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DashboardIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Estadísticas del Sistema</Typography>
              </Box>
              
              {loading ? (
                <Typography>Cargando estadísticas...</Typography>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {dashboardData?.total_users || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usuarios
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {dashboardData?.total_roles || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Roles
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {dashboardData?.total_permissions || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Permisos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Permisos del Usuario */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Permisos del Usuario</Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefreshPermissions}
                  disabled={refreshingPermissions}
                  startIcon={<SettingsIcon />}
                >
                  {refreshingPermissions ? 'Actualizando...' : 'Refrescar Permisos'}
                </Button>
              </Box>
              
              {user?.permissions?.length > 0 ? (
                <Grid container spacing={1}>
                  {user.permissions.map((permission) => (
                    <Grid item key={permission}>
                      <Chip
                        icon={<CheckIcon />}
                        label={permission}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tienes permisos asignados
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Estadísticas del Sistema de Generación Automática */}
          <Grid item xs={12}>
            <BasicStats />
          </Grid>

          {/* Acciones Rápidas */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {user?.permissions?.includes('view reports') && (
                  <Button variant="outlined" startIcon={<DashboardIcon />}>
                    Ver Reportes
                  </Button>
                )}
                {user?.permissions?.includes('view settings') && (
                  <Button variant="outlined" startIcon={<SettingsIcon />}>
                    Configuración
                  </Button>
                )}
                {user?.roles?.includes('admin') && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AdminIcon />}
                    onClick={() => setShowAdminPanel(true)}
                  >
                    Panel de Administración
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 