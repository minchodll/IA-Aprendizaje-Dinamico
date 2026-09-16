import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Results from './components/Results';
import Assignments from './components/Assignments';
import Teachers from './components/Teachers';
import Students from './components/Students';
import Grades from './components/Grades';
import Sections from './components/Sections';
import Subjects from './components/Subjects';
import Topics from './components/Topics';
import TopicTemplates from './components/TopicTemplates';
import Exams from './components/Exams';
import Questions from './components/Questions';
import Recommendations from './components/Recommendations';
import ExamAssignments from './components/ExamAssignments';
import TakeExam from './components/TakeExam';
import MyCourses from './components/MyCourses';
import MyGrades from './components/MyGrades';
import MyProgress from './components/MyProgress';
import MyRecommendations from './components/MyRecommendations';
import ClassReport from './components/ClassReport';
import ExerciseBankUpload from './components/ExerciseBankUpload';
import FAQ from './components/FAQ';
import AccessDenied from './components/AccessDenied';
import NotFound from './components/NotFound';
import ScreenErrorBoundary from './components/ScreenErrorBoundary';
import { authService, api } from './services/api';

// Todas las rutas internas reales de la app (deben coincidir con los
// "case" del switch de abajo). Si `route` no está en esta lista, se
// muestra la pantalla 404 en vez de caer silenciosamente en otra cosa.
const VALID_ROUTES = [
  '/dashboard', '/students', '/teachers', '/grades', '/sections', '/subjects',
  '/topics', '/topic-templates', '/exams', '/questions', '/results',
  '/assignments', '/recommendations', '/exam-assignments', '/take-exam',
  '/my-courses', '/my-grades', '/my-progress', '/my-recommendations', '/class-report',
  '/exercise-bank', '/faq'
];
const LAST_ROUTE_KEY = 'last_route';

function getStoredRoute() {
  try {
    const stored = localStorage.getItem(LAST_ROUTE_KEY);
    return stored && VALID_ROUTES.includes(stored) ? stored : '/dashboard';
  } catch {
    return '/dashboard';
  }
}

// Los enlaces de correo (notificaciones) traen ?goto=/ruta para abrir
// directo en esa pantalla -- esta SPA no tiene router, así que se lee de
// la URL una sola vez al montar, igual que ?reset_token=.
function getInitialRoute() {
  try {
    const goto = new URLSearchParams(window.location.search).get('goto');
    if (goto && VALID_ROUTES.includes(goto)) return goto;
  } catch {
    // ignorar y caer al valor guardado
  }
  return getStoredRoute();
}

// Tema verde moderno
const theme = createTheme({
  palette: {
    primary: { 
      main: '#2e7d32', // Verde principal
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#66bb6a', // Verde secundario
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8faf8',
      paper: '#ffffff'
    },
    success: {
      main: '#4caf50',
      light: '#66bb6a',
      dark: '#388e3c'
    },
    info: {
      main: '#26a69a',
      light: '#4db6ac',
      dark: '#00897b'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2e7d32'
    },
    h5: {
      fontWeight: 600,
      color: '#2e7d32'
    },
    h6: {
      fontWeight: 600,
      color: '#2e7d32'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600
        },
        contained: {
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.1)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    }
  }
});

// Configuración de permisos por módulo
const modulePermissions = {
  dashboard: ['view dashboard'],
  students: ['view students'],
  teachers: ['view users'],
  grades: ['view grades'],
  sections: ['view sections'],
  subjects: ['view subjects'],
  topics: ['view topics'],
  'topic-templates': ['view topics'],
  'exercise-bank': ['manage topics'],
  faq: ['view dashboard'],
  exams: ['view exams'],
  questions: ['view questions'],
  results: ['view results'],
  assignments: ['view assignments'],
  recommendations: ['view recommendations'],
  'exam-assignments': ['view exam-assignments'],
  'take-exam': ['view take-exam']
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Arranca en la última pantalla guardada: si el usuario recarga la
  // página (o falló una carga y refrescó), vuelve adonde estaba en vez
  // de mandarlo siempre al dashboard.
  const [route, setRoute] = useState(getInitialRoute);
  // Última ruta VÁLIDA distinta de la actual -- a donde regresan los
  // botones "Regresar" de la pantalla 404 y del error boundary.
  const previousRouteRef = useRef('/dashboard');

  // Si la URL trajo ?goto=..., ya se aplicó como ruta inicial (ver
  // getInitialRoute); se limpia de la URL para que un refresh posterior no
  // quede forzando esa misma pantalla una y otra vez.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('goto')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // El enlace del correo de recuperación abre la app en la raíz con
  // ?reset_token=... (esta SPA no tiene rutas propias). Se lee una sola vez
  // al montar; si está presente, se muestra ResetPassword sin importar si
  // hay sesión activa o no.
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get('reset_token')
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (!token) {
          console.log('No hay token guardado');
          setLoading(false);
          return;
        }

        // Configurar el token en axios antes de cualquier petición
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Token configurado:', token.substring(0, 10) + '...');

        try {
          // Intentar refrescar permisos
          console.log('Refrescando permisos...');
          const refreshedData = await authService.refreshPermissions();
          
          if (!refreshedData?.status || !refreshedData?.user) {
            throw new Error('Respuesta inválida al refrescar permisos');
          }

          console.log('Permisos refrescados exitosamente:', {
            roles: refreshedData.user.roles,
            permissionsCount: refreshedData.user.permissions?.length
          });

          setUser(refreshedData.user);
          localStorage.setItem('user', JSON.stringify(refreshedData.user));
        } catch (refreshError) {
          console.error('Error al refrescar permisos:', refreshError);
          // Si falla el refresh, intentar usar el usuario guardado como fallback
          if (savedUser) {
            console.log('Usando datos de usuario guardados como fallback');
            setUser(JSON.parse(savedUser));
          } else {
            throw new Error('No se pudo obtener información del usuario');
          }
        }
      } catch (error) {
        console.error('Error fatal en initializeApp:', error);
        // Limpiar todo en caso de error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Renovacion de sesion en silencio: el token dura poco a proposito
  // (JWT_EXPIRES_IN, hoy 2h) para que una laptop perdida con sesion abierta
  // no quede utilizable por dias. Mientras la pestaña siga abierta y el
  // usuario siga activo, se renueva solo cada 20 minutos -- muy por debajo
  // de las 2h, así que nunca se nota. Si el usuario cierra la pestaña o
  // deja de usarla, la renovacion deja de correr y la sesion expira sola.
  useEffect(() => {
    if (!user) return undefined;
    const intervalId = setInterval(() => {
      authService.refreshPermissions().catch((err) => {
        console.warn('No se pudo renovar la sesión (se reintentará en el próximo ciclo):', err.message);
      });
    }, 20 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);

  const handleLoginSuccess = async (loginData) => {
    if (!loginData?.token || !loginData?.user) {
      console.error('Datos de login inválidos');
      return;
    }

    try {
      // Configurar el token primero
      api.defaults.headers.common['Authorization'] = `Bearer ${loginData.token}`;
      localStorage.setItem('auth_token', loginData.token);
      
      // Refrescar permisos inmediatamente después del login
      const refreshedData = await authService.refreshPermissions();
      
      if (!refreshedData?.status || !refreshedData?.user) {
        throw new Error('Error al refrescar permisos después del login');
      }

      // Usar los datos actualizados
      setUser(refreshedData.user);
      localStorage.setItem('user', JSON.stringify(refreshedData.user));
      
      console.log('Login completado exitosamente:', {
        roles: refreshedData.user.roles,
        permissionsCount: refreshedData.user.permissions?.length
      });
    } catch (error) {
      console.error('Error en handleLoginSuccess:', error);
      // En caso de error, usar los datos originales del login
      setUser(loginData.user);
      localStorage.setItem('user', JSON.stringify(loginData.user));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  const handleNavigate = (path) => {
    setRoute((prevRoute) => {
      if (prevRoute !== path && VALID_ROUTES.includes(prevRoute)) {
        previousRouteRef.current = prevRoute;
      }
      return path;
    });
    try {
      localStorage.setItem(LAST_ROUTE_KEY, path);
    } catch {
      // localStorage puede fallar (modo privado, cuota llena); no es crítico
    }
  };

  // A donde manda el botón "Regresar" de la 404 y del error boundary:
  // la última pantalla válida distinta de la actual, o el dashboard si
  // no hay ninguna (ej. primera carga con una ruta guardada rota).
  const goToPreviousRoute = () => {
    const target = previousRouteRef.current !== route ? previousRouteRef.current : '/dashboard';
    handleNavigate(target);
  };

  // Función para verificar si el usuario tiene acceso a un módulo
  const hasPermission = (moduleName) => {
    if (!user || !user.permissions) {
      console.log('No hay usuario o permisos definidos');
      return false;
    }
    
    const requiredPermissions = modulePermissions[moduleName];
    if (!requiredPermissions) {
      console.log(`No hay permisos definidos para el módulo: ${moduleName}`);
      return true; // Si no hay permisos definidos, permitir acceso
    }
    
    const hasAccess = requiredPermissions.some(permission => 
      user.permissions.includes(permission)
    );
    
    console.log(`Verificando acceso a ${moduleName}:`, {
      requiredPermissions,
      userPermissions: user.permissions,
      hasAccess
    });
    
    return hasAccess;
  };

  if (resetToken) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResetPassword
          token={resetToken}
          onDone={() => {
            // Limpia el token de la URL para que no quede reusable por
            // accidente (recargar, historial del navegador, etc.).
            window.history.replaceState({}, '', window.location.pathname);
            setResetToken(null);
          }}
        />
      </ThemeProvider>
    );
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          Cargando...
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  let Content;
  if (!VALID_ROUTES.includes(route)) {
    Content = <NotFound onGoBack={goToPreviousRoute} />;
  } else
  switch (route) {
    case '/students':
      Content = hasPermission('students') ? <Students /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/teachers': 
      Content = hasPermission('teachers') ? <Teachers /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/grades':
      Content = hasPermission('grades') ? <Grades /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
      break;
    case '/sections': 
      Content = hasPermission('sections') ? <Sections /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/subjects': 
      Content = hasPermission('subjects') ? <Subjects user={user} /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/topics': 
      Content = hasPermission('topics') ? <Topics /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/topic-templates': 
      Content = hasPermission('topic-templates') ? <TopicTemplates /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
                case '/exams': 
              Content = hasPermission('exams') ? <Exams user={user} onNavigate={handleNavigate} /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
              break;
    case '/questions': 
      Content = hasPermission('questions') ? <Questions /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/results': 
      Content = hasPermission('results') ? <Results /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/assignments': 
      Content = hasPermission('assignments') ? <Assignments /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
    case '/recommendations': 
      Content = hasPermission('recommendations') ? <Recommendations /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
      break;
                case '/exam-assignments': 
              Content = hasPermission('exam-assignments') ? <ExamAssignments user={user} /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />; 
              break;
            case '/take-exam':
              Content = hasPermission('take-exam') ? <TakeExam user={user} /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/my-courses':
              Content = hasPermission('take-exam') ? <MyCourses /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/my-grades':
              Content = hasPermission('take-exam') ? <MyGrades /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/my-progress':
              Content = hasPermission('take-exam') ? <MyProgress /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/my-recommendations':
              Content = hasPermission('take-exam') ? <MyRecommendations /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/class-report':
              Content = hasPermission('results') ? <ClassReport /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/exercise-bank':
              Content = hasPermission('exercise-bank') ? <ExerciseBankUpload user={user} /> : <AccessDenied onGoBack={() => handleNavigate('/dashboard')} />;
              break;
            case '/faq':
              Content = <FAQ />;
              break;
    default: 
      Content = <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8faf8' }}>
        <Sidebar onNavigate={handleNavigate} user={user} hasPermission={hasPermission} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <ScreenErrorBoundary routeKey={route} onGoBack={goToPreviousRoute}>
            {Content}
          </ScreenErrorBoundary>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
