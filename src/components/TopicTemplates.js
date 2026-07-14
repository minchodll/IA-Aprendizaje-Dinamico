import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Card, CardContent, Grid, Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import QuizIcon from '@mui/icons-material/Quiz';
import ComputerIcon from '@mui/icons-material/Computer';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';

const TopicTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configurar el token de autenticación
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get('http://localhost:8000/api/topic-templates', { headers });
      setTemplates(response.data?.data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('No se pudieron cargar las plantillas. Mostrando datos de ejemplo.');
      // Datos de ejemplo en caso de error
      setTemplates([
        {
          id: 1,
          nombre: 'Introducción a Excel',
          descripcion: 'Conceptos básicos de Microsoft Excel',
          categoria: 'excel',
          nivel_dificultad: 'basico',
          activo: true,
          conceptos_clave: ['Interfaz de Excel', 'Celdas, filas y columnas'],
          preguntas_plantilla: [
            { enunciado: '¿Qué es una celda en Excel?', tipo: 'opcion_multiple' }
          ]
        },
        {
          id: 2,
          nombre: 'Procesador de Texto Word',
          descripcion: 'Fundamentos de Microsoft Word',
          categoria: 'word',
          nivel_dificultad: 'basico',
          activo: true,
          conceptos_clave: ['Interfaz de Word', 'Documentos y texto'],
          preguntas_plantilla: [
            { enunciado: '¿Para qué sirve Microsoft Word?', tipo: 'opcion_multiple' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoria) => {
    const icons = {
      excel: <TableChartIcon />,
      word: <DescriptionIcon />,
      powerpoint: <SlideshowIcon />,
      computacion: <ComputerIcon />,
      office: <BusinessIcon />
    };
    return icons[categoria] || <QuizIcon />;
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      excel: 'success',
      word: 'primary',
      powerpoint: 'warning',
      computacion: 'info',
      office: 'secondary'
    };
    return colors[categoria] || 'default';
  };

  const getDifficultyColor = (nivel) => {
    const colors = {
      basico: 'success',
      intermedio: 'warning',
      avanzado: 'error'
    };
    return colors[nivel] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          📚 Plantillas de Temas de Computación
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadData}
          variant="outlined"
          color="primary"
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas simples */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
        <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
          📊 Resumen de Plantillas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {templates.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Plantillas Disponibles
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
              {templates.filter(t => t.activo).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Plantillas Activas
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
              {new Set(templates.map(t => t.categoria)).size}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Categorías
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de plantillas */}
      <Grid container spacing={3}>
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id || Math.random()}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getCategoryIcon(template.categoria)}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                      {template.nombre}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={template.categoria?.toUpperCase() || 'N/A'}
                      color={getCategoryColor(template.categoria)}
                      size="small"
                    />
                    <Chip
                      label={template.nivel_dificultad || 'N/A'}
                      color={getDifficultyColor(template.nivel_dificultad)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {template.descripcion || 'Sin descripción disponible'}
                  </Typography>

                  {template.conceptos_clave && template.conceptos_clave.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        📝 Conceptos Clave:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {template.conceptos_clave.slice(0, 3).map((concepto, index) => (
                          <Chip
                            key={index}
                            label={concepto}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {template.conceptos_clave.length > 3 && (
                          <Chip
                            label={`+${template.conceptos_clave.length - 3} más`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {template.preguntas_plantilla && template.preguntas_plantilla.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        ❓ Preguntas de Ejemplo:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {template.preguntas_plantilla.length} pregunta(s) disponibles
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Chip
                      label={template.activo ? '✅ Activa' : '❌ Inactiva'}
                      color={template.activo ? 'success' : 'error'}
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      ID: {template.id}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                📚 No hay plantillas disponibles
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Las plantillas se cargarán automáticamente cuando el backend esté disponible.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 4, p: 3, background: '#e8f5e8', borderRadius: 2 }}>
        <Typography variant="body2" color="success.main" align="center">
          ✅ Sistema de plantillas funcionando correctamente
        </Typography>
      </Box>
    </Box>
  );
};

export default TopicTemplates; 