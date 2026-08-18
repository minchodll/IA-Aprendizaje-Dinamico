import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import Login from './components/Login';
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
import ClassReport from './components/ClassReport';
import ExerciseBankUpload from './components/ExerciseBankUpload';
import FAQ from './components/FAQ';
import AccessDenied from './components/AccessDenied';
import { authService, api } from './services/api';

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
  const [route, setRoute] = useState('/dashboard');

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
    setRoute(path);
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
          {Content}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
