import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({ supplier_id: '', category_id: '', amount: '', date: '', description: '' });

  useEffect(() => { fetchExpenses(); fetchSuppliers(); fetchCategories(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8000/api/expenses', { headers });
      setExpenses(response.data);
    } catch (err) {
      setError('Error al cargar egresos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8000/api/suppliers', { headers });
      setSuppliers(response.data);
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

  const handleOpenDialog = (expense = null) => {
    setEditingExpense(expense);
    setFormData(expense ? { ...expense, supplier_id: expense.supplier?.id || '', category_id: expense.category?.id || '' } : { supplier_id: '', category_id: '', amount: '', date: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    setFormData({ supplier_id: '', category_id: '', amount: '', date: '', description: '' });
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
      if (editingExpense) {
        await axios.put(`http://localhost:8000/api/expenses/${editingExpense.id}`, formData, { headers });
        setSuccess('Egreso actualizado exitosamente');
      } else {
        await axios.post('http://localhost:8000/api/expenses', formData, { headers });
        setSuccess('Egreso creado exitosamente');
      }
      handleCloseDialog();
      fetchExpenses();
    } catch (err) {
      setError('Error al guardar egreso');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este egreso?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:8000/api/expenses/${id}`, { headers });
      setSuccess('Egreso eliminado exitosamente');
      fetchExpenses();
    } catch (err) {
      setError('Error al eliminar egreso');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2>Gestión de Egresos</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Nuevo Egreso</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Proveedor</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.supplier?.name || ''}</TableCell>
                <TableCell>{expense.category?.name || ''}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(expense)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(expense.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingExpense ? 'Editar Egreso' : 'Nuevo Egreso'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Proveedor</InputLabel>
              <Select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required label="Proveedor">
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
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
            <Button type="submit" variant="contained">{editingExpense ? 'Actualizar' : 'Crear'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExpenseManagement; 