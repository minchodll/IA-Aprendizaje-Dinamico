import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ORIGIN, authService } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mini-flujo de "olvidé mi contraseña" dentro de la misma pantalla, sin
  // necesitar una ruta aparte (esta app no usa react-router).
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    try {
      setForgotLoading(true);
      const result = await authService.forgotPassword(forgotEmail);
      setForgotMessage(result.message || 'Si el correo está registrado, te enviamos un enlace.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'No se pudo enviar la solicitud. Intenta de nuevo.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
     const response = await axios.post(`${API_ORIGIN}/api/login`, formData);
      
      if (response.data.status) {
        setSuccess('Login exitoso!');
        
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Llamar a la función de callback para actualizar el estado del padre
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        }
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Error en el login');
      } else {
        setError('Error de conexión. Verifica que el servidor esté corriendo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />

          <Typography component="h1" variant="h4" gutterBottom>
            {mode === 'login' ? 'Iniciar Sesión' : 'Recuperar contraseña'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {mode === 'login'
              ? 'Sistema de Administración con Roles y Permisos'
              : 'Escribe tu correo y te enviamos un enlace para elegir una nueva contraseña.'}
          </Typography>

          {mode === 'forgot' ? (
            <Box component="form" onSubmit={handleForgotSubmit} sx={{ width: '100%' }}>
              {forgotError && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {forgotError}
                </Alert>
              )}
              {forgotMessage && (
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  {forgotMessage}
                </Alert>
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1, py: 1.5 }}
                disabled={forgotLoading}
              >
                {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar enlace'}
              </Button>
              <Button
                fullWidth
                onClick={() => { setMode('login'); setForgotError(''); setForgotMessage(''); }}
                disabled={forgotLoading}
              >
                Volver a iniciar sesión
              </Button>
            </Box>
          ) : (
          <>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Usuarios de prueba:
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Admin: admin@example.com / password123
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Manager: manager@example.com / password123
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              User: user@example.com / password123
            </Typography>
          </Box>
          </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 