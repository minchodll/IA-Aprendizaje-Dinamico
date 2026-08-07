import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup,
  FormControl, FormLabel, Chip, LinearProgress, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Stack, Grid, TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import {
  PlayArrow as StartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { examService, questionService } from '../services/api';

const TakeExam = ({ user }) => {
  const [assignedExams, setAssignedExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Función para cargar exámenes asignados
  const loadAssignedExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const assignedExamsData = await examService.getAssignedExams();
      setAssignedExams(assignedExamsData);
    } catch (err) {
      setError('Error al cargar los exámenes asignados: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para manejar el envío del examen
  const handleSubmitExam = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Enviando respuestas del examen:', {
        examId: currentExam?.exam?.id,
        answersCount: Object.keys(answers).length,
        totalQuestions: questions.length
      });

      if (Object.keys(answers).length < questions.length) {
        const unanswered = questions.length - Object.keys(answers).length;
        if (!window.confirm(`Tienes ${unanswered} pregunta(s) sin responder. ¿Deseas enviar el examen de todas formas?`)) {
          setLoading(false);
          return;
        }
      }
      
      const results = await examService.submitExam(currentExam.exam.id, answers);
      console.log('Resultados recibidos:', results);
      
      setExamResults(results);
      setExamCompleted(true);
      setShowResultsDialog(true);
      
      // Actualizar estado del examen asignado
      setAssignedExams(prev => 
        prev.map(exam => 
          exam.id === currentExam.id 
            ? { ...exam, status: 'completed' }
            : exam
        )
      );

      // Recargar la lista de exámenes asignados
      await loadAssignedExams();
    } catch (err) {
      console.error('Error al enviar el examen:', err);
      setError('Error al enviar el examen: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [currentExam, answers, questions, loadAssignedExams]);

  // Timer para el examen
  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examCompleted, handleSubmitExam]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAssignedExams();
  }, [loadAssignedExams]);

  const startExam = useCallback(async (assignedExam) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Iniciando examen:', assignedExam.exam.id);
      const examData = await examService.getExamWithQuestions(assignedExam.exam.id);
      
      console.log('Datos del examen recibidos:', examData);
      
      if (!examData?.questions?.length) {
        throw new Error('El examen no tiene preguntas configuradas');
      }

      setQuestions(examData.questions);
      setCurrentExam(assignedExam);
      setTimeLeft(assignedExam.exam.duracion_minutos * 60);
      setExamStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setExamCompleted(false);
      setShowResultsDialog(false);
    } catch (err) {
      console.error('Error al cargar el examen:', err);
      setError('Error al cargar el examen: ' + (err.response?.data?.message || err.message));
      setExamStarted(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };



  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // opciones llega como string JSON desde la columna JSON de MySQL (mysql2 no
  // la parsea automáticamente); en preguntas de respuesta_corta no aplica.
  const parseOpciones = (opciones) => {
    if (Array.isArray(opciones)) return opciones;
    if (typeof opciones === 'string') {
      try {
        const parsed = JSON.parse(opciones);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const getStatusColor = (status) => {
    return status === 'pending' ? 'warning' : 'success';
  };

  const getStatusIcon = (status) => {
    return status === 'pending' ? <AssignmentIcon /> : <CheckCircleIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si el examen está en progreso, mostrar la interfaz del examen
  if (examStarted && currentExam) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Si no hay pregunta actual, mostrar error
    if (!currentQuestion) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            Error: No se pudo cargar la pregunta
          </Typography>
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: 16 }}>
            {JSON.stringify({ currentQuestionIndex, questionsLength: questions.length }, null, 2)}
          </pre>
        </Box>
      );
    }

    return (
      <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
        {/* Header del examen */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
            {currentExam.exam.titulo}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<TimerIcon />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              variant="outlined"
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowConfirmDialog(true)}
              disabled={examCompleted}
            >
              Finalizar Examen
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Barra de progreso */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Math.round(progress)}% completado
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Pregunta actual */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Encabezado de la pregunta */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </Typography>
              <Chip
                label={currentQuestion.tipo === 'respuesta_corta' ? 'Respuesta Corta' : 'Opción Múltiple'}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Enunciado de la pregunta */}
            <Typography variant="body1" sx={{ 
              mb: 4, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              {currentQuestion.enunciado}
            </Typography>

            {/* Opciones de respuesta */}
            {currentQuestion.tipo === 'respuesta_corta' ? (
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  Escribe tu respuesta:
                </FormLabel>
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  placeholder="Escribe tu respuesta aquí..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </FormControl>
            ) : (
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary' }}>
                  Selecciona la respuesta correcta:
                </FormLabel>
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                >
                  <Stack spacing={2}>
                    {parseOpciones(currentQuestion.opciones).map((opcionValue, opcionIndex) => (
                      <Paper
                        key={opcionIndex}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: answers[currentQuestion.id] === opcionValue ? 'primary.main' : 'background.paper',
                          color: answers[currentQuestion.id] === opcionValue ? 'primary.contrastText' : 'text.primary',
                          '&:hover': {
                            bgcolor: answers[currentQuestion.id] === opcionValue ? 'primary.dark' : 'grey.100',
                            transform: 'translateX(8px)'
                          }
                        }}
                        onClick={() => handleAnswerChange(currentQuestion.id, opcionValue)}
                        elevation={answers[currentQuestion.id] === opcionValue ? 3 : 1}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Radio
                            checked={answers[currentQuestion.id] === opcionValue}
                            value={opcionValue}
                            sx={{
                              color: answers[currentQuestion.id] === opcionValue ? 'primary.contrastText' : 'primary.main',
                              '&.Mui-checked': {
                                color: answers[currentQuestion.id] === opcionValue ? 'primary.contrastText' : 'primary.main'
                              }
                            }}
                          />
                          <Typography>
                            {String.fromCharCode(65 + opcionIndex)}) {opcionValue}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            )}
          </CardContent>
        </Card>

        {/* Navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                size="small"
                onClick={() => goToQuestion(index)}
                sx={{ minWidth: 40 }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>

          <Button
            variant="outlined"
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Siguiente
          </Button>
        </Box>

        {/* Dialog de confirmación */}
        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <DialogTitle>Confirmar Finalización</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que quieres finalizar el examen? No podrás modificar tus respuestas después.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmitExam} variant="contained" color="primary">
              Finalizar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de resultados */}
        <Dialog open={showResultsDialog} onClose={() => setShowResultsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Resultados del Examen</DialogTitle>
          <DialogContent>
            {examResults && (() => {
              const puntajeObtenido = Number(examResults.puntaje_obtenido) || 0;
              const puntajeTotal = Number(examResults.puntaje_total) || 100;
              const percentage = puntajeTotal > 0 ? (puntajeObtenido / puntajeTotal) * 100 : 0;
              const detalle = examResults.detalle_ia || [];
              const correctas = detalle.filter((d) => d.correcto).length;
              const grade = percentage >= 60 ? 'Aprobado' : 'Reprobado';

              return (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="h6" color="primary">
                        {percentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Calificación
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" color={grade === 'Aprobado' ? 'success.main' : 'error.main'}>
                        {grade}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Estado
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        {correctas}/{detalle.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Respuestas Correctas
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        {puntajeObtenido.toFixed(0)}/{puntajeTotal.toFixed(0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Puntos Obtenidos
                      </Typography>
                    </Grid>
                  </Grid>

                  {detalle.length > 0 && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Retroalimentación por pregunta
                      </Typography>
                      <List dense>
                        {detalle.map((d, index) => (
                          <ListItem key={d.question_id || index} alignItems="flex-start">
                            <ListItemIcon>
                              {d.correcto ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <CancelIcon color="error" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={`Pregunta ${index + 1}`}
                              secondary={d.retroalimentacion}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowResultsDialog(false);
              setExamStarted(false);
              setCurrentExam(null);
              setExamCompleted(false);
            }}>
              Volver a Exámenes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Vista principal - lista de exámenes asignados
  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700 }}>
          Mis Exámenes
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadAssignedExams}
          variant="outlined"
          color="primary"
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Asignados
              </Typography>
              <Typography variant="h4" component="div">
                {assignedExams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4" component="div">
                {assignedExams.filter(exam => exam.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completados
              </Typography>
              <Typography variant="h4" component="div">
                {assignedExams.filter(exam => exam.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Materias
              </Typography>
                              <Typography variant="h4" component="div">
                {new Set(assignedExams.map(exam => exam.exam.titulo)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de exámenes */}
      <Grid container spacing={2}>
        {assignedExams.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No tienes exámenes asignados
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Los exámenes aparecerán aquí cuando tu profesor los asigne
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          assignedExams.map((assignedExam) => (
            <Grid item xs={12} md={6} key={assignedExam.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {assignedExam.exam.titulo}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(assignedExam.status)}
                      label={assignedExam.status === 'pending' ? 'Pendiente' : 'Completado'}
                      color={getStatusColor(assignedExam.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {assignedExam.exam.descripcion}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {assignedExam.exam.titulo}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {assignedExam.exam.duracion_minutos} minutos
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AssignmentIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {assignedExam.exam.puntaje_total} puntos
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="textSecondary">
                    Asignado: {formatDate(assignedExam.assigned_at)}
                  </Typography>
                  
                  {assignedExam.due_date && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Fecha límite: {formatDate(assignedExam.due_date)}
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  {assignedExam.status === 'pending' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<StartIcon />}
                      onClick={() => startExam(assignedExam)}
                      fullWidth
                    >
                      Comenzar Examen
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CheckIcon />}
                      fullWidth
                      disabled
                    >
                      Examen Completado
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default TakeExam; 