import React, { useState, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, AlertTitle,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { exerciseBankService } from '../services/api';

const nivelColor = (nivel) => {
  if (nivel === 'avanzado') return 'error';
  if (nivel === 'intermedio') return 'warning';
  return 'success';
};

// Flujo: descargar plantilla -> el docente la llena en Word -> subirla aqui
// (se previsualiza sin guardar nada) -> confirmar (recien ahi se agrega al
// banco). Reentrenar los modelos con lo nuevo sigue siendo un paso manual
// aparte, a proposito: un archivo mal llenado no debe poder degradar la IA
// sin que alguien lo revise primero.
const ExerciseBankUpload = () => {
  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null); // { tema, errores, advertencias }
  const [confirming, setConfirming] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      setError(null);
      await exerciseBankService.downloadTemplate();
    } catch (err) {
      setError('Error al descargar la plantilla: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setPreview(null);
    setResultado(null);
    setError(null);
  };

  const handlePreview = async () => {
    if (!file) return;
    try {
      setPreviewing(true);
      setError(null);
      setResultado(null);
      const data = await exerciseBankService.preview(file);
      setPreview(data);
    } catch (err) {
      setError('Error al leer el archivo: ' + (err.response?.data?.message || err.message));
    } finally {
      setPreviewing(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview?.tema) return;
    try {
      setConfirming(true);
      setError(null);
      const data = await exerciseBankService.confirm(preview.tema);
      setResultado(data);
      setPreview(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Error al guardar en el banco: ' + (err.response?.data?.message || err.message));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3 }}>
      <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 1 }}>
        Cargar Tema al Banco de Ejercicios
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Descarga la plantilla, llénala en Word con el tema y sus ejercicios, y súbela aquí.
        Se revisa todo antes de guardar — nada se agrega al banco sin que lo confirmes.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>1. Descarga la plantilla</Typography>
          <Button
            startIcon={<DownloadIcon />}
            variant="contained"
            onClick={handleDownloadTemplate}
            disabled={downloading}
          >
            {downloading ? 'Generando…' : 'Descargar plantilla (.docx)'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>2. Sube la plantilla ya llena</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              {file ? file.name : 'Elegir archivo .docx'}
              <input ref={fileInputRef} type="file" accept=".docx" hidden onChange={handleFileChange} />
            </Button>
            <Button variant="contained" onClick={handlePreview} disabled={!file || previewing}>
              {previewing ? 'Leyendo…' : 'Subir y previsualizar'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {resultado && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
          <AlertTitle>Guardado en el banco</AlertTitle>
          Se agregaron <strong>{resultado.ejercicios_agregados}</strong> ejercicio(s) a "{resultado.nombre_tema}"
          ({resultado.categoria}), que ahora tiene {resultado.total_ejercicios_en_categoria} ejercicio(s) en total.
          {resultado.es_categoria_nueva && (
            <> Es una categoría nueva — la IA no la reconocerá bien hasta que un administrador reentrene los modelos
            (<code>python train_classifier.py</code>).</>
          )}
          {!resultado.es_categoria_nueva && ' Para que los modelos usen este contenido en su clasificación, un administrador debe reentrenarlos.'}
        </Alert>
      )}

      {preview && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>3. Revisa antes de guardar</Typography>

            {preview.errores.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>No se puede guardar todavía</AlertTitle>
                <List dense disablePadding>
                  {preview.errores.map((e, i) => (
                    <ListItem key={i} disableGutters><ListItemText primary={e} /></ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {preview.advertencias.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Revisa esto (no bloquea el guardado)</AlertTitle>
                <List dense disablePadding>
                  {preview.advertencias.map((a, i) => (
                    <ListItem key={i} disableGutters><ListItemText primary={a} /></ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {preview.tema && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Tema:</strong> {preview.tema.nombre_tema || '(vacío)'}</Typography>
                    <Typography variant="body2"><strong>Categoría:</strong> {preview.tema.categoria || '(vacía)'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Competencia:</strong> {preview.tema.competencia || '(vacía)'}</Typography>
                    <Typography variant="body2"><strong>Conceptos clave:</strong> {preview.tema.conceptos_clave?.join(', ') || '(vacío)'}</Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Ejercicios detectados ({preview.tema.ejercicios.length})
                </Typography>
                <List sx={{ mb: 2 }}>
                  {preview.tema.ejercicios.map((ej, i) => (
                    <React.Fragment key={i}>
                      <ListItem disableGutters alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                              <Chip label={ej.tipo} size="small" />
                              <Chip label={ej.dificultad} size="small" color={nivelColor(ej.dificultad)} />
                            </Box>
                          }
                          secondary={ej.enunciado}
                        />
                      </ListItem>
                      {i < preview.tema.ejercicios.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="contained"
                  color="success"
                  onClick={handleConfirm}
                  disabled={preview.errores.length > 0 || confirming}
                >
                  {confirming ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Confirmar y guardar en el banco
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExerciseBankUpload;
