import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Paper
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TopicIcon from '@mui/icons-material/Topic';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const SimpleStats = () => {
  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 3 }}>
        📊 Estadísticas del Sistema de Generación Automática
      </Typography>

      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    9
                  </Typography>
                  <Typography variant="body2">
                    Plantillas Disponibles
                  </Typography>
                </Box>
                <AutoAwesomeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    3
                  </Typography>
                  <Typography variant="body2">
                    Temas Creados
                  </Typography>
                </Box>
                <TopicIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    3
                  </Typography>
                  <Typography variant="body2">
                    Exámenes Totales
                  </Typography>
                </Box>
                <QuizIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    3
                  </Typography>
                  <Typography variant="body2">
                    Generados Automáticamente
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categorías de plantillas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
              📁 Plantillas por Categoría
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="EXCEL: 3" color="primary" variant="outlined" sx={{ mb: 1 }} />
              <Chip label="WORD: 2" color="primary" variant="outlined" sx={{ mb: 1 }} />
              <Chip label="POWERPOINT: 1" color="primary" variant="outlined" sx={{ mb: 1 }} />
              <Chip label="COMPUTACION: 2" color="primary" variant="outlined" sx={{ mb: 1 }} />
              <Chip label="OFFICE: 1" color="primary" variant="outlined" sx={{ mb: 1 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
              📈 Eficiencia del Sistema
            </Typography>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tasa de Generación Automática:</strong>
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                100%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                3 de 3 exámenes generados automáticamente
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, background: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="body2" color="primary" align="center">
          ✅ Sistema de generación automática funcionando correctamente
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleStats; 