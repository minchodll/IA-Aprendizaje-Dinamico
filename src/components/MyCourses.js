import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import { studentService } from '../services/api';

// Los cursos no se "inscriben" uno por uno: un alumno queda automáticamente
// en todos los cursos (materia + profesor) asignados a su grado y sección.
const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar tus cursos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
          Mis Cursos
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={loadCourses} variant="outlined" color="primary">
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Todavía no tienes cursos asignados
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Un curso aparece aquí automáticamente cuando se asigna un profesor a tu grado y sección.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course.assignment_id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {course.materia}
                      </Typography>
                      {course.materia_descripcion && (
                        <Typography variant="body2" color="textSecondary">
                          {course.materia_descripcion}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">{course.profesor}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    {course.academic_year && <Chip label={course.academic_year} size="small" />}
                    {course.semester && <Chip label={course.semester} size="small" variant="outlined" />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyCourses;
