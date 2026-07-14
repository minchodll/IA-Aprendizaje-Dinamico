import React, { useState, useEffect } from 'react';
import topicService from '../services/topicService';
import {
  Box, Typography, List, ListItem, ListItemText, Divider, Paper, 
  CircularProgress, Alert, Button, IconButton, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';

const TopicsList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const topicsData = await topicService.getTopics();
      setTopics(topicsData);
    } catch (err) {
      setError('Error al cargar los temas. Por favor, asegúrate de que has iniciado sesión y el servidor está funcionando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tema?')) {
      try {
        await topicService.deleteTopic(id);
        // Actualizar la lista de temas después de eliminar
        setTopics(topics.filter(topic => topic.id !== id));
        alert('Tema eliminado con éxito');
      } catch (err) {
        alert('Error al eliminar el tema.');
      }
    }
  };

  const handleGenerateExam = async (topicId) => {
    // Aquí necesitaríamos el ID del profesor. Usaremos un valor por defecto por ahora.
    const teacherId = 1; // Reemplazar con el ID del profesor autenticado
    if (window.confirm(`¿Generar un nuevo examen para este tema?`)) {
        try {
            const exam = await topicService.generateExamFromTopic(topicId, { teacher_id: teacherId });
            alert(`¡Éxito! Se ha generado el examen "${exam.data.titulo}" con ID: ${exam.data.id}`);
        } catch (err) {
            alert('Error al generar el examen. Revisa la consola para más detalles.');
            console.error(err);
        }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, background: '#f5f7fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Gestión de Temas
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlineIcon />}
          // onClick={() => { /* Lógica para abrir el formulario de creación */ }}
        >
          Crear Tema
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <List>
        {topics.length > 0 ? (
          topics.map((topic, index) => (
            <React.Fragment key={topic.id}>
              <ListItem 
                sx={{ 
                  my: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 2, 
                  boxShadow: 1 
                }}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="generate-exam" onClick={() => handleGenerateExam(topic.id)} title="Generar Examen">
                      <QuizIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="edit" sx={{ mx: 1 }} title="Editar Tema">
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(topic.id)} title="Eliminar Tema">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography variant="h6" component="span">{topic.nombre}</Typography>}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {topic.descripcion || 'Sin descripción'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`Materia: ${topic.subject?.nombre || 'N/A'}`} size="small" sx={{ mr: 1 }} />
                        <Chip label={`Nivel: ${topic.nivel}`} size="small" variant="outlined" />
                      </Box>
                    </>
                  }
                />
              </ListItem>
              {index < topics.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Alert severity="info">No se encontraron temas. ¡Intenta crear uno nuevo!</Alert>
        )}
      </List>
    </Paper>
  );
};

export default TopicsList;
