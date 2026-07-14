import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container
} from '@mui/material';
import {
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const AccessDenied = ({ onGoBack }) => {
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
            background: 'linear-gradient(135deg, #f8faf8 0%, #e8f5e8 100%)',
            border: '2px solid #e8f5e8',
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)',
            maxWidth: 400,
            width: '100%'
          }}
        >
          <CardContent>
            <SecurityIcon
              sx={{
                fontSize: 80,
                color: '#2e7d32',
                mb: 2,
                opacity: 0.8
              }}
            />
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2e7d32',
                mb: 2
              }}
            >
              Acceso Denegado
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                mb: 3,
                lineHeight: 1.6
              }}
            >
              No tienes permisos para acceder a esta sección del sistema. 
              Contacta al administrador si necesitas acceso a esta funcionalidad.
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={onGoBack}
              sx={{
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AccessDenied; 