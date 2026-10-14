import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ORIGIN } from '../services/api';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';

const drawerWidth = 240;

const AdminPanel = ({ user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    if (onLogout) {
      onLogout();
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Usuarios', icon: <PeopleIcon />, value: 'users' },
    { text: 'Roles', icon: <SecurityIcon />, value: 'roles' },
    { text: 'Permisos', icon: <CheckIcon />, value: 'permissions' },
  ];

  const renderContent = () => {
    switch (selectedView) {
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionManagement />;
      case 'dashboard':
      default:
        return <AdminDashboard onGo={setSelectedView} />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <AdminIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={selectedView === item.value}
              onClick={() => setSelectedView(item.value)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.value === selectedView)?.text || 'Dashboard'}
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
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

// Resumen del panel administrativo: cifras reales leidas de la base de datos
const AdminDashboard = ({ onGo }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    axios.get(`${API_ORIGIN}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setDatos(res.data.data))
      .catch(() => setError(true));
  }, []);

  const tarjetas = [
    { titulo: 'Usuarios', valor: datos?.total_users, destino: 'users' },
    { titulo: 'Roles', valor: datos?.total_roles, destino: 'roles' },
    { titulo: 'Permisos', valor: datos?.total_permissions, destino: 'permissions' },
    { titulo: 'Alumnos', valor: datos?.total_students },
    { titulo: 'Docentes', valor: datos?.total_teachers },
    { titulo: 'Exámenes creados', valor: datos?.total_exams },
    { titulo: 'Exámenes calificados', valor: datos?.total_results },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Resumen del sistema. Desde el menú puedes gestionar usuarios, roles y permisos.
      </Typography>

      {error && <Typography color="error" sx={{ mb: 2 }}>No se pudieron cargar las cifras.</Typography>}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
        {tarjetas.map((t) => (
          <Card key={t.titulo}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>{t.titulo}</Typography>
              <Typography variant="h4">{datos ? t.valor : '…'}</Typography>
            </CardContent>
            {t.destino && (
              <CardActions>
                <Button size="small" onClick={() => onGo(t.destino)}>Ver detalles</Button>
              </CardActions>
            )}
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default AdminPanel; 