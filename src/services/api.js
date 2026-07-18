import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 segundos
});

// Función para verificar si una ruta es pública
const isPublicRoute = (url) => {
  const publicRoutes = ['/login', '/register'];
  return publicRoutes.some(route => url.includes(route));
};

// Función para obtener el token
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('No auth token found');
    return null;
  }
  return `Bearer ${token}`;
};

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    // No modificar la configuración para rutas públicas
    if (isPublicRoute(config.url)) {
      return config;
    }

    const token = getAuthToken();
    if (!token) {
      // Solo redirigir si no estamos en login y es una petición de la aplicación
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('No auth token found'));
    }

    // Configurar headers con el token
    config.headers = {
      ...config.headers,
      'Authorization': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Log de la petición
    console.log('Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Función para limpiar la sesión
const clearSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Función para manejar errores de autenticación
const handleAuthError = () => {
  clearSession();
  if (!window.location.pathname.includes('login')) {
    window.location.href = '/login';
  }
};

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta indica éxito
    if (response.data && response.data.status === false) {
      return Promise.reject(new Error(response.data.message || 'Error en la respuesta'));
    }
    return response;
  },
  async (error) => {
    // Log detallado del error
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Si no hay respuesta, es un error de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject(error);
    }

    // Manejar diferentes tipos de error
    switch (error.response.status) {
      case 401: // No autorizado
        console.log('Error de autenticación, redirigiendo a login...');
        handleAuthError();
        break;

      case 403: // Forbidden
        console.log('Error de permisos, refrescando...');
        try {
          await authService.refreshPermissions();
          return api(error.config); // Reintentar petición
        } catch (refreshError) {
          console.error('Error al refrescar permisos:', refreshError);
          handleAuthError();
        }
        break;

      case 419: // CSRF token mismatch
        console.log('Error de CSRF, refrescando...');
        try {
          await authService.refreshPermissions();
          return api(error.config); // Reintentar petición
        } catch (refreshError) {
          console.error('Error al refrescar CSRF:', refreshError);
          handleAuthError();
        }
        break;

      default:
        // Otros errores
        if (error.response.data && error.response.data.message) {
          error.message = error.response.data.message;
        }
        break;
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    try {
      // Limpiar cualquier token anterior
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      console.log('Iniciando login con:', credentials.email);
    const response = await api.post('/login', credentials);
      console.log('Respuesta de login:', response.data);
      
      if (!response.data.status || !response.data.token || !response.data.user) {
        throw new Error('Respuesta de login inválida');
      }

      const { token, user } = response.data;

      // Configurar el token en axios para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verificar que el token funcione antes de guardarlo
      try {
        const verifyResponse = await api.get('/refresh-permissions');
        console.log('Token verificado:', verifyResponse.data);
        
        if (!verifyResponse.data.status) {
          throw new Error('Error al verificar token');
        }

        // Si la verificación es exitosa, guardar token y usuario
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(verifyResponse.data.user || user));
        
        console.log('Autenticación completada:', {
          token: token.substring(0, 10) + '...',
          user: verifyResponse.data.user || user
        });

        return {
          ...response.data,
          user: verifyResponse.data.user || user
        };
      } catch (verifyError) {
        console.error('Error verificando token:', verifyError);
        throw new Error('Error verificando token');
      }
    } catch (error) {
      console.error('Error en login:', error);
      // Limpiar datos en caso de error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  refreshPermissions: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No hay token para refrescar permisos');
      }

      console.log('Llamando a /refresh-permissions...');
      const response = await api.get('/refresh-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta de /refresh-permissions:', response.data);
      
      if (!response.data.status || !response.data.user) {
        throw new Error('Respuesta inválida al refrescar permisos');
      }

      // Actualizar datos del usuario
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Error en refreshPermissions:', error);
      // Si hay un error de autenticación, limpiar todo
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
      throw error;
    }
  }
};

// Servicios de estudiantes
export const studentService = {
  getAll: async () => {
    try {
      console.log('Obteniendo lista de estudiantes...');
    const response = await api.get('/students');
      
      if (!response.data?.status || !Array.isArray(response.data?.data)) {
        console.error('Respuesta de estudiantes inválida:', response.data);
        throw new Error('Formato de respuesta inválido');
      }

      const students = response.data.data;
      console.log(`${students.length} estudiantes obtenidos`);
      
      // Verificar que cada estudiante tenga los campos necesarios
      students.forEach(student => {
        if (!student.id || !student.grado_id || !student.seccion) {
          console.warn('Estudiante con datos incompletos:', student);
        }
      });

      return students;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`Obteniendo estudiante ${id}...`);
    const response = await api.get(`/students/${id}`);
      
      if (!response.data?.status || !response.data?.data) {
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error);
      throw error;
    }
  },

  create: async (studentData) => {
    try {
      console.log('Creando estudiante:', studentData);
    const response = await api.post('/students', studentData);
      
      if (!response.data?.status || !response.data?.data) {
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  update: async (id, studentData) => {
    try {
      console.log(`Actualizando estudiante ${id}:`, studentData);
    const response = await api.put(`/students/${id}`, studentData);
      
      if (!response.data?.status || !response.data?.data) {
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error al actualizar estudiante ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`Eliminando estudiante ${id}...`);
    await api.delete(`/students/${id}`);
    } catch (error) {
      console.error(`Error al eliminar estudiante ${id}:`, error);
      throw error;
    }
  },

  getMyProgress: async () => {
    try {
      console.log('Obteniendo progreso del estudiante...');
    const response = await api.get('/student/my-progress');
      
      if (!response.data?.status || !response.data?.data) {
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      throw error;
    }
  }
};

// Servicios de profesores
export const teacherService = {
  getAll: async () => {
    const response = await api.get('/teachers');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.data;
  },

  create: async (teacherData) => {
    const response = await api.post('/teachers', teacherData);
    return response.data.data;
  },

  update: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/teachers/${id}`);
  },

  getMyAssignments: async () => {
    const response = await api.get('/teacher/my-assignments');
    return response.data.data;
  },

  getStudentsProgress: async () => {
    const response = await api.get('/teacher/students-progress');
    return response.data.data;
  }
};

// Servicios de exámenes
export const examService = {
  getAll: async () => {
    const response = await api.get('/exams');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data.data;
  },

  create: async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data.data;
  },

  update: async (id, examData) => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/exams/${id}`);
  },

  submitAnswers: async (examId, answers) => {
    const response = await api.post(`/exams/${examId}/submit`, { answers });
    return response.data.data;
  },

  getAvailableExams: async () => {
    const response = await api.get('/student/available-exams');
    return response.data.data;
  },

  getTeacherExams: async () => {
    const response = await api.get('/teacher/exams');
    return response.data.data;
  },

  getAssignedExams: async () => {
    const response = await api.get('/student/assigned-exams');
    return response.data.data;
  },

  getExamWithQuestions: async (examId) => {
    try {
      console.log('Obteniendo examen con preguntas:', examId);
      const response = await api.get(`/exams/${examId}/with-questions`);
      console.log('Respuesta del servidor:', response.data);
      
      if (!response.data?.status || !response.data?.data?.questions) {
        console.error('Respuesta inválida:', response.data);
        throw new Error('Formato de respuesta inválido');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener examen con preguntas:', error);
      throw error;
    }
  },

  submitExam: async (examId, answers) => {
    const response = await api.post(`/exams/${examId}/submit`, { answers });
    return response.data.data;
  }
};

// Servicios de resultados
export const resultService = {
  getAll: async () => {
    const response = await api.get('/exam-results');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exam-results/${id}`);
    return response.data;
  },

  create: async (resultData) => {
    const response = await api.post('/exam-results', resultData);
    return response.data;
  },

  update: async (id, resultData) => {
    const response = await api.put(`/exam-results/${id}`, resultData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/exam-results/${id}`);
  },

  getStats: async () => {
    const response = await api.get('/exam-results/stats');
    return response.data;
  }
};

// Servicios de asignaciones
export const assignmentService = {
  getAll: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  create: async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },

  update: async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/assignments/${id}`);
  }
};

// Servicios de grados
export const gradeService = {
  getAll: async () => {
    const response = await api.get('/grades');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/grades/${id}`);
    return response.data.data;
  },

  create: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data.data;
  },

  update: async (id, gradeData) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/grades/${id}`);
  }
};

// Servicios de secciones
export const sectionService = {
  getAll: async () => {
    const response = await api.get('/sections');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sections/${id}`);
    return response.data.data;
  },

  create: async (sectionData) => {
    const response = await api.post('/sections', sectionData);
    return response.data.data;
  },

  update: async (id, sectionData) => {
    const response = await api.put(`/sections/${id}`, sectionData);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/sections/${id}`);
  }
};

// Servicios de materias
export const subjectService = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data.data;
  },

  create: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data.data;
  },

  update: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/subjects/${id}`);
  }
};

// Servicios de temas
export const topicService = {
  getAll: async () => {
    const response = await api.get('/topics');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  create: async (topicData) => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  update: async (id, topicData) => {
    const response = await api.put(`/topics/${id}`, topicData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/topics/${id}`);
  },

  generateExam: async (topicId) => {
    const response = await api.post(`/topics/${topicId}/generate-exam`);
    return response.data;
  }
};

// Servicios de preguntas
export const questionService = {
  getAll: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  create: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  update: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/questions/${id}`);
  }
};

// Servicios de recomendaciones
export const recommendationService = {
  getAll: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/recommendations/${id}`);
    return response.data;
  },

  create: async (recommendationData) => {
    const response = await api.post('/recommendations', recommendationData);
    return response.data;
  },

  update: async (id, recommendationData) => {
    const response = await api.put(`/recommendations/${id}`, recommendationData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/recommendations/${id}`);
  }
};

// Servicios de asignación de exámenes
export const examAssignmentService = {
  getAll: async () => {
    try {
      console.log('Obteniendo todas las asignaciones...');
      const response = await api.get('/exam-assignments');
      console.log('Respuesta de asignaciones:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`Obteniendo asignación ${id}...`);
      const response = await api.get(`/exam-assignments/${id}`);
      console.log(`Respuesta de asignación ${id}:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener asignación ${id}:`, error);
      throw error;
    }
  },

  create: async (assignmentData) => {
    try {
      console.log('Creando asignación con datos:', assignmentData);
      const response = await api.post('/exam-assignments', assignmentData);
      console.log('Respuesta de creación:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear asignación:', error.response?.data || error);
      throw error;
    }
  },

  assignToGradeSection: async (assignmentData) => {
    try {
      console.log('Asignando examen por grado/sección con datos:', assignmentData);
      const response = await api.post('/exam-assignments/assign-to-grade-section', assignmentData);
      console.log('Respuesta de asignación por grado/sección:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error al asignar por grado/sección:', error.response?.data || error);
      throw error;
    }
  },

  update: async (id, assignmentData) => {
    try {
      console.log(`Actualizando asignación ${id} con datos:`, assignmentData);
      const response = await api.put(`/exam-assignments/${id}`, assignmentData);
      console.log(`Respuesta de actualización ${id}:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error al actualizar asignación ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`Eliminando asignación ${id}...`);
      const response = await api.delete(`/exam-assignments/${id}`);
      console.log(`Respuesta de eliminación ${id}:`, response.data);
    } catch (error) {
      console.error(`Error al eliminar asignación ${id}:`, error);
      throw error;
    }
  }
};

export { api };
export default api;