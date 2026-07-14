import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({ client_id: '', category_id: '', amount: '', date: '', description: '' });

  useEffect(() => { fetchIncomes(); fetchClients(); fetchCategories(); }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8000/api/incomes', { headers });
      setIncomes(response.data);
    } catch (err) {
      setError('Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8000/api/clients', { headers });
      setClients(response.data);
    } catch (err) {}
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8000/api/categories', { headers });
      setCategories(response.data);
    } catch (err) {}
  };

  const handleOpenDialog = (income = null) => {
    setEditingIncome(income);
    setFormData(income ? { ...income, client_id: income.client?.id || '', category_id: income.category?.id || '' } : { client_id: '', category_id: '', amount: '', date: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncome(null);
    setFormData({ client_id: '', category_id: '', amount: '', date: '', description: '' });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (editingIncome) {
        await axios.put(`http://localhost:8000/api/incomes/${editingIncome.id}`, formData, { headers });
        setSuccess('Ingreso actualizado exitosamente');
      } else {
        await axios.post('http://localhost:8000/api/incomes', formData, { headers });
        setSuccess('Ingreso creado exitosamente');
      }
      handleCloseDialog();
      fetchIncomes();
    } catch (err) {
      setError('Error al guardar ingreso');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingreso?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:8000/api/incomes/${id}`, { headers });
      setSuccess('Ingreso eliminado exitosamente');
      fetchIncomes();
    } catch (err) {
      setError('Error al eliminar ingreso');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2>Gestión de Ingresos</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Nuevo Ingreso</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>{income.client?.name || ''}</TableCell>
                <TableCell>{income.category?.name || ''}</TableCell>
                <TableCell>{income.amount}</TableCell>
                <TableCell>{income.date}</TableCell>
                <TableCell>{income.description}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(income)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(income.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingIncome ? 'Editar Ingreso' : 'Nuevo Ingreso'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Cliente</InputLabel>
              <Select name="client_id" value={formData.client_id} onChange={handleChange} required label="Cliente">
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Categoría</InputLabel>
              <Select name="category_id" value={formData.category_id} onChange={handleChange} label="Categoría">
                <MenuItem value="">Sin categoría</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField margin="dense" label="Monto" name="amount" value={formData.amount} onChange={handleChange} fullWidth required type="number" inputProps={{ step: '0.01' }} />
            <TextField margin="dense" label="Fecha" name="date" value={formData.date} onChange={handleChange} fullWidth required type="date" InputLabelProps={{ shrink: true }} />
            <TextField margin="dense" label="Descripción" name="description" value={formData.description} onChange={handleChange} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">{editingIncome ? 'Actualizar' : 'Crear'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default IncomeManagement; 