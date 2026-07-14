import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Función para obtener el token de autenticación desde localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) {
    console.warn('No se encontró token de autenticación.');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * Obtiene todos los temas del backend.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de temas.
 */
export const getTopics = async () => {
  try {
    const response = await axios.get(`${API_URL}/topics`, {
      headers: getAuthHeaders(),
    });
    return response.data.data; // La API envuelve los datos en una propiedad 'data'
  } catch (error) {
    console.error('Error al obtener los temas:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene un tema específico por su ID.
 * @param {number} id El ID del tema.
 * @returns {Promise<Object>} Una promesa que resuelve al objeto del tema.
 */
export const getTopic = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/topics/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener el tema ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Crea un nuevo tema.
 * @param {Object} topicData Los datos del tema a crear.
 * @returns {Promise<Object>} Una promesa que resuelve al nuevo tema creado.
 */
export const createTopic = async (topicData) => {
  try {
    const response = await axios.post(`${API_URL}/topics`, topicData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear el tema:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Actualiza un tema existente.
 * @param {number} id El ID del tema a actualizar.
 * @param {Object} topicData Los nuevos datos para el tema.
 * @returns {Promise<Object>} Una promesa que resuelve al tema actualizado.
 */
export const updateTopic = async (id, topicData) => {
  try {
    const response = await axios.put(`${API_URL}/topics/${id}`, topicData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el tema ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Elimina un tema.
 * @param {number} id El ID del tema a eliminar.
 * @returns {Promise<Object>} Una promesa que resuelve a la respuesta de la API.
 */
export const deleteTopic = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/topics/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el tema ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Solicita la generación de un examen para un tema específico.
 * @param {number} topicId El ID del tema.
 * @param {Object} options Opciones para la generación del examen (ej. { teacher_id: 1 }).
 * @returns {Promise<Object>} Una promesa que resuelve al examen generado.
 */
export const generateExamFromTopic = async (topicId, options) => {
  try {
    const response = await axios.post(`${API_URL}/topics/${topicId}/generate-exam`, options, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error al generar examen para el tema ${topicId}:`, error.response?.data || error.message);
    throw error;
  }
};

const topicService = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  generateExamFromTopic,
};

export default topicService;
