import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Divider, Typography, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GradeIcon from '@mui/icons-material/Grade';
import ClassIcon from '@mui/icons-material/Class';
import BookIcon from '@mui/icons-material/Book';
import TopicIcon from '@mui/icons-material/Topic';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: 'dashboard' },
  { text: 'Estudiantes', icon: <SchoolIcon />, path: '/students', permission: 'students' },
  { text: 'Profesores', icon: <PeopleIcon />, path: '/teachers', permission: 'teachers' },
  { text: 'Grados', icon: <GradeIcon />, path: '/grades', permission: 'grades' },
  { text: 'Secciones', icon: <ClassIcon />, path: '/sections', permission: 'sections' },
  { text: 'Materias', icon: <BookIcon />, path: '/subjects', permission: 'subjects' },
  { text: 'Temas', icon: <TopicIcon />, path: '/topics', permission: 'topics' },
  { text: 'Plantillas de Temas', icon: <AutoAwesomeIcon />, path: '/topic-templates', permission: 'topic-templates' },
  { text: 'Cargar Banco de Ejercicios', icon: <UploadFileIcon />, path: '/exercise-bank', permission: 'exercise-bank' },
  { text: 'Exámenes', icon: <QuizIcon />, path: '/exams', permission: 'exams' },
  { text: 'Preguntas', icon: <QuestionAnswerIcon />, path: '/questions', permission: 'questions' },
  { text: 'Resultados', icon: <EmojiEventsIcon />, path: '/results', permission: 'results' },
  { text: 'Boletín de Clase', icon: <GroupsIcon />, path: '/class-report', permission: 'results' },
  { text: 'Asignaciones', icon: <AssignmentIcon />, path: '/assignments', permission: 'assignments' },
  { text: 'Asignar Exámenes', icon: <AssignmentTurnedInIcon />, path: '/exam-assignments', permission: 'exam-assignments' },
  { text: 'Mis Cursos', icon: <MenuBookIcon />, path: '/my-courses', permission: 'take-exam' },
  { text: 'Resolver Examen', icon: <PlayArrowIcon />, path: '/take-exam', permission: 'take-exam' },
  { text: 'Mis Notas', icon: <AssessmentIcon />, path: '/my-grades', permission: 'take-exam' },
  { text: 'Mi Progreso', icon: <TrendingUpIcon />, path: '/my-progress', permission: 'take-exam' },
  { text: 'Recomendaciones', icon: <LightbulbIcon />, path: '/recommendations', permission: 'recommendations' },
  { text: 'Preguntas Frecuentes', icon: <HelpOutlineIcon />, path: '/faq', permission: 'faq' },
];

const Sidebar = ({ onNavigate, user, hasPermission }) => {
  // Filtrar elementos del menú según los permisos del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) {
      console.log(`Ítem sin permiso definido: ${item.text}`);
      return true;
    }
    const hasAccess = hasPermission(item.permission);
    console.log(`Verificando acceso a ${item.text} (${item.permission}):`, hasAccess);
    return hasAccess;
  });

  // Agrupar elementos del menú por categorías
  const groupedItems = {
    principal: filteredMenuItems.filter(item => 
      ['dashboard'].includes(item.permission)
    ),
    gestion: filteredMenuItems.filter(item => 
      ['students', 'teachers'].includes(item.permission)
    ),
    academico: filteredMenuItems.filter(item => 
      ['grades', 'sections', 'subjects'].includes(item.permission)
    ),
    contenido: filteredMenuItems.filter(item =>
      ['topics', 'topic-templates', 'exams', 'questions', 'exercise-bank'].includes(item.permission)
    ),
    evaluacion: filteredMenuItems.filter(item =>
      ['results', 'assignments', 'exam-assignments', 'take-exam', 'recommendations'].includes(item.permission)
    ),
    ayuda: filteredMenuItems.filter(item =>
      ['faq'].includes(item.permission)
    )
  };

  const getRoleDisplayName = (roles) => {
    if (!roles || roles.length === 0) return 'Usuario';
    
    const roleNames = {
      'admin': 'Administrador',
      'teacher': 'Profesor',
      'student': 'Estudiante',
      'manager': 'Manager',
      'user': 'Usuario'
    };
    
    return roleNames[roles[0]] || roles[0];
  };

  const getRoleColor = (roles) => {
    if (!roles || roles.length === 0) return '#757575';
    
    const roleColors = {
      'admin': '#d32f2f',
      'teacher': '#2e7d32',
      'student': '#1976d2',
      'manager': '#f57c00',
      'user': '#757575'
    };
    
    return roleColors[roles[0]] || '#757575';
  };

  return (
  <Drawer
    variant="permanent"
    sx={{
        width: 260,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
          width: 260,
        boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)',
        color: '#fff',
          border: 'none',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
    }}
  >
    <Toolbar />
      
      {/* Información del usuario */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: getRoleColor(user?.roles),
              width: 40,
              height: 40,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
              {user?.name || 'Usuario'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {getRoleDisplayName(user?.roles)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', mt: 1 }}>
      <List>
          {/* Dashboard */}
          {groupedItems.principal.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => onNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                background: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translateX(4px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: 500 
                }}
              />
            </ListItem>
          ))}

          {/* Gestión */}
          {groupedItems.gestion.length > 0 && (
            <>
              <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                Gestión
              </Typography>
              {groupedItems.gestion.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    mx: 1,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* Académico */}
          {groupedItems.academico.length > 0 && (
            <>
              <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                Académico
              </Typography>
              {groupedItems.academico.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    mx: 1,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* Contenido */}
          {groupedItems.contenido.length > 0 && (
            <>
              <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                Contenido
              </Typography>
              {groupedItems.contenido.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    mx: 1,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* Evaluación */}
          {groupedItems.evaluacion.length > 0 && (
            <>
              <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                Evaluación
              </Typography>
              {groupedItems.evaluacion.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    mx: 1,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500 
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* Ayuda */}
          {groupedItems.ayuda.length > 0 && (
            <>
              <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>
                Ayuda
              </Typography>
              {groupedItems.ayuda.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    mx: 1,
                    background: 'rgba(255,255,255,0.08)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}
      </List>
    </Box>
  </Drawer>
);
};

export default Sidebar; 