import React, { useState } from 'react';
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
  Paper,
  Grid,
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
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';
import ClientManagement from './ClientManagement';
import SupplierManagement from './SupplierManagement';
import CategoryManagement from './CategoryManagement';
import IncomeManagement from './IncomeManagement';
import ExpenseManagement from './ExpenseManagement';

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
    { text: 'Clientes', icon: <PeopleIcon />, value: 'clients' },
    { text: 'Proveedores', icon: <PeopleIcon />, value: 'suppliers' },
    { text: 'Categorías', icon: <SettingsIcon />, value: 'categories' },
    { text: 'Ingresos', icon: <AddIcon />, value: 'incomes' },
    { text: 'Egresos', icon: <DeleteIcon />, value: 'expenses' },
    { text: 'Reportes', icon: <AssessmentIcon />, value: 'reports' },
    { text: 'Configuración', icon: <SettingsIcon />, value: 'settings' }
  ];

  const renderContent = () => {
    switch (selectedView) {
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'incomes':
        return <IncomeManagement />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'dashboard':
      default:
        return <AdminDashboard user={user} />;
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

// Componente Dashboard para el panel administrativo
const AdminDashboard = ({ user }) => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Usuarios Activos
              </Typography>
              <Typography variant="h4">
                12
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => window.location.reload()}>
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Roles Configurados
              </Typography>
              <Typography variant="h4">
                5
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => window.location.reload()}>
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Permisos Totales
              </Typography>
              <Typography variant="h4">
                24
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => window.location.reload()}>
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sesiones Activas
              </Typography>
              <Typography variant="h4">
                3
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => window.location.reload()}>
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información del Sistema
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Bienvenido al panel de administración. Aquí puedes gestionar usuarios, roles y permisos del sistema.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPanel; 