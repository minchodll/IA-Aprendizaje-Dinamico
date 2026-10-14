import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Chip,
  ButtonBase,
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Topic as TopicIcon,
  Quiz as QuizIcon,
  Groups as GroupsIcon,
  AssignmentTurnedIn as AssignIcon,
  PlayArrow as PlayIcon,
  Assessment as GradesIcon,
  TrendingUp as ProgressIcon,
  Lightbulb as TipIcon,
  SmartToy as TutorIcon,
  AutoAwesome as SparkIcon,
  FactCheck as CheckIcon,
  ArrowForward as ArrowIcon,
  EditNote as EditIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AdminPanel from './AdminPanel';
import { API_ORIGIN } from '../services/api';

const VERDE = '#2e7d32';
const VERDE_OSCURO = '#1b5e20';

const ROLES = {
  admin: { etiqueta: 'Administrador', mensaje: 'Desde aquí administras usuarios, roles y todo el contenido de la plataforma.' },
  manager: { etiqueta: 'Docente', mensaje: 'Crea temas, deja que la IA arme los exámenes y revisa cómo va tu clase.' },
  user: { etiqueta: 'Estudiante', mensaje: 'Practica ofimática a tu ritmo, revisa tus notas y pídele ayuda al tutor cuando la necesites.' },
};

// permiso: módulo que valida hasPermission en App.js
const ACCESOS = {
  admin: [
    { texto: 'Estudiantes', detalle: 'Altas, grados y secciones', icono: <SchoolIcon />, ruta: '/students', permiso: 'students' },
    { texto: 'Profesores', detalle: 'Docentes y sus asignaciones', icono: <PeopleIcon />, ruta: '/teachers', permiso: 'teachers' },
    { texto: 'Temas', detalle: 'Genera exámenes con la IA', icono: <TopicIcon />, ruta: '/topics', permiso: 'topics' },
    { texto: 'Exámenes', detalle: 'Banco de exámenes del sistema', icono: <QuizIcon />, ruta: '/exams', permiso: 'exams' },
    { texto: 'Boletín de Clase', detalle: 'Rendimiento por alumno', icono: <GroupsIcon />, ruta: '/class-report', permiso: 'results' },
    { texto: 'Asignar Exámenes', detalle: 'Envía exámenes a tus secciones', icono: <AssignIcon />, ruta: '/exam-assignments', permiso: 'exam-assignments' },
  ],
  manager: [
    { texto: 'Boletín de Clase', detalle: 'Notas, ranking y puntos débiles', icono: <GroupsIcon />, ruta: '/class-report', permiso: 'results' },
    { texto: 'Temas', detalle: 'Crea un tema y genera su examen', icono: <TopicIcon />, ruta: '/topics', permiso: 'topics' },
    { texto: 'Exámenes', detalle: 'Revisa y edita tus exámenes', icono: <QuizIcon />, ruta: '/exams', permiso: 'exams' },
    { texto: 'Asignar Exámenes', detalle: 'Envía exámenes a tus secciones', icono: <AssignIcon />, ruta: '/exam-assignments', permiso: 'exam-assignments' },
    { texto: 'Estudiantes', detalle: 'Tus alumnos y su historial', icono: <SchoolIcon />, ruta: '/students', permiso: 'students' },
  ],
  user: [
    { texto: 'Resolver Examen', detalle: 'Tus exámenes asignados', icono: <PlayIcon />, ruta: '/take-exam', permiso: 'take-exam' },
    { texto: 'Mis Notas', detalle: 'Resultados y retroalimentación', icono: <GradesIcon />, ruta: '/my-grades', permiso: 'take-exam' },
    { texto: 'Mi Progreso', detalle: 'Insignias, racha y avance', icono: <ProgressIcon />, ruta: '/my-progress', permiso: 'take-exam' },
    { texto: 'Mis Recomendaciones', detalle: 'Qué reforzar según tus fallos', icono: <TipIcon />, ruta: '/my-recommendations', permiso: 'take-exam' },
    { texto: 'Tutor con IA', detalle: 'Resuelve tus dudas de ofimática', icono: <TutorIcon />, ruta: '/ai-tutor', permiso: 'take-exam' },
  ],
};

const PASOS = [
  { icono: <EditIcon />, titulo: 'Se elige un tema', texto: 'El docente indica qué quiere practicar: Excel, Word, PowerPoint, seguridad informática…' },
  { icono: <SparkIcon />, titulo: 'La IA arma el examen', texto: 'El sistema genera las preguntas a partir del banco de ejercicios y el nivel del grupo.' },
  { icono: <CheckIcon />, titulo: 'Se califica al instante', texto: 'Cada respuesta se evalúa y el alumno ve de inmediato qué acertó y qué debe repasar.' },
  { icono: <ProgressIcon />, titulo: 'Se refuerza lo que falta', texto: 'Las recomendaciones y el tutor ayudan a cada alumno según sus propios errores.' },
];

const GRID_ACCESOS = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } };
const GRID_PASOS = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } };

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const Dashboard = ({ user, onLogout, onNavigate, hasPermission }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const esAdmin = user?.roles?.includes('admin');
  const rol = esAdmin ? 'admin' : user?.roles?.includes('manager') ? 'manager' : 'user';
  const info = ROLES[rol];
  const primerNombre = (user?.name || '').split(' ')[0];
  const accesos = ACCESOS[rol].filter((a) => !hasPermission || hasPermission(a.permiso));
  const fechaCruda = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fecha = fechaCruda.charAt(0).toUpperCase() + fechaCruda.slice(1);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_ORIGIN}/api/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (onLogout) onLogout();
    }
  };

  if (showAdminPanel && esAdmin) {
    return <AdminPanel user={user} onLogout={onLogout} />;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Barra superior mínima: usuario + cerrar sesión */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {fecha}
        </Typography>
        <Chip label={info.etiqueta} size="small" sx={{ bgcolor: '#e8f5e9', color: VERDE_OSCURO, fontWeight: 600 }} />
        <Avatar sx={{ bgcolor: VERDE, cursor: 'pointer', width: 36, height: 36 }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          {user?.name?.charAt(0)}
        </Avatar>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {esAdmin && (
            <MenuItem onClick={() => { setShowAdminPanel(true); setAnchorEl(null); }}>
              <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
              Panel de Administración
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Cerrar Sesión
          </MenuItem>
        </Menu>
      </Box>

      {/* Bienvenida */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          color: '#fff',
          background: `linear-gradient(135deg, ${VERDE_OSCURO} 0%, ${VERDE} 55%, #66bb6a 100%)`,
          boxShadow: '0 12px 32px rgba(46,125,50,0.25)',
        }}
      >
        <Box sx={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', right: 90, bottom: -90, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'relative', maxWidth: 640 }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
            Bienvenido a la plataforma
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.15, mt: 0.5, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            {saludo()}, {primerNombre}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 400, color: '#fff', opacity: 0.92 }}>
            Ejercicios de ofimática que se adaptan a cada alumno.
          </Typography>
          <Typography sx={{ mt: 1, color: '#fff', opacity: 0.8 }}>{info.mensaje}</Typography>
        </Box>
      </Paper>

      {/* Accesos rápidos */}
      <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700, color: VERDE_OSCURO }}>
        ¿Por dónde quieres empezar?
      </Typography>
      <Box sx={GRID_ACCESOS}>
        {accesos.map((a) => (
          <ButtonBase key={a.ruta}
              onClick={() => onNavigate && onNavigate(a.ruta)}
              sx={{
                width: '100%', height: '100%', textAlign: 'left', p: 2.5, borderRadius: 3, bgcolor: '#fff',
                border: '1px solid #e3ede3', display: 'flex', alignItems: 'center', gap: 2,
                transition: 'transform .15s, box-shadow .15s, border-color .15s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 24px rgba(0,0,0,0.08)', borderColor: VERDE },
              }}
            >
              <Avatar sx={{ bgcolor: '#e8f5e9', color: VERDE, width: 48, height: 48 }}>{a.icono}</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{a.texto}</Typography>
                <Typography variant="body2" color="text.secondary">{a.detalle}</Typography>
              </Box>
              <ArrowIcon sx={{ color: 'text.disabled' }} />
            </ButtonBase>
        ))}
      </Box>

      {/* Cómo funciona */}
      <Typography variant="h6" sx={{ mt: 5, mb: 2, fontWeight: 700, color: VERDE_OSCURO }}>
        Así funciona
      </Typography>
      <Box sx={GRID_PASOS}>
        {PASOS.map((p, i) => (
          <Paper key={p.titulo} elevation={0} sx={{ p: 2.5, height: '100%', borderRadius: 3, border: '1px solid #e3ede3', bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: VERDE, width: 36, height: 36 }}>{p.icono}</Avatar>
                <Typography variant="caption" sx={{ fontWeight: 700, color: VERDE, letterSpacing: 1 }}>PASO {i + 1}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{p.titulo}</Typography>
              <Typography variant="body2" color="text.secondary">{p.texto}</Typography>
            </Paper>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 5, mb: 2 }}>
        Universidad Mariano Gálvez · Proyecto de graduación
      </Typography>
    </Box>
  );
};

export default Dashboard;
