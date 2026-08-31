import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Stack
} from '@mui/material';
import {
  ReportProblem as ReportProblemIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Red de seguridad para toda la pantalla activa: si algo dentro de
// {Content} truena al renderizar (dato inesperado del backend, un
// componente que falla, etc.) React deja de mostrar TODO en blanco --
// esto atrapa el error y muestra un aviso claro en su lugar, con
// opción de regresar a la última pantalla que sí funcionaba o de
// recargar la página.
//
// Nota: por diseño de React, un error boundary por sí solo no puede
// "reintentar" el render que falló -- necesita cambiar de key o de
// children. Por eso, además de mostrar el aviso, expone un botón
// "Regresar" que navega a otra ruta (cambia los children) y así se
// limpia solo, y un botón "Recargar" para el caso de una falla más
// profunda (ej. error de red al cargar el bundle).
class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error al renderizar la pantalla:', error, info);
  }

  componentDidUpdate(prevProps) {
    // Si el usuario navegó (cambió la ruta que identifica a esta
    // pantalla), se limpia el estado de error para que la próxima
    // pantalla no herede un error que ya no le corresponde.
    if (this.state.hasError && prevProps.routeKey !== this.props.routeKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
          }}
        >
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff8f0 0%, #fdeee0 100%)',
              border: '2px solid #f5d7b8',
              boxShadow: '0 8px 32px rgba(230, 126, 34, 0.12)',
              maxWidth: 420,
              width: '100%'
            }}
          >
            <CardContent>
              <ReportProblemIcon
                sx={{ fontSize: 80, color: '#e67e22', mb: 2, opacity: 0.85 }}
              />

              <Typography variant="h5" sx={{ fontWeight: 700, color: '#c0622a', mb: 2 }}>
                Algo salió mal
              </Typography>

              <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.6 }}>
                Esta pantalla no se pudo mostrar. No es necesario preocuparse:
                tu sesión y tus datos siguen intactos. Puedes regresar o
                recargar la página.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={this.props.onGoBack}
                  sx={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                    color: 'white',
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Regresar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: '#e67e22',
                    color: '#c0622a',
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#c0622a', background: 'rgba(230,126,34,0.06)' }
                  }}
                >
                  Recargar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }
}

export default ScreenErrorBoundary;
