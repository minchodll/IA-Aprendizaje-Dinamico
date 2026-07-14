import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Obtiene todas las plantillas de temas.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de plantillas.
 */
export const getTemplates = async () => {
  try {
    const response = await axios.get(`${API_URL}/topic-templates`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las plantillas de temas:', error.response?.data || error.message);
    throw error;
  }
};

const topicTemplateService = {
  getTemplates,
};

export default topicTemplateService;
