import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box, Button, Divider, CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService } from '../services/api';

const POLL_MS = 45000;

function tiempoRelativo(fechaIso) {
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return 'Justo ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

// Campana de notificaciones: cuenta no leidas en segundo plano (poll cada
// 45s) y solo trae la lista completa cuando el usuario abre el menu, para
// no golpear el backend constantemente.
const NotificationBell = ({ onNavigate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn('No se pudo actualizar el contador de notificaciones:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    intervalRef.current = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refreshCount]);

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = async (n) => {
    if (!n.leida) {
      try {
        await notificationService.markRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: 1 } : x)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('No se pudo marcar como leída:', err);
      }
    }
    handleClose();
    if (n.enlace && onNavigate) onNavigate(n.enlace);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, leida: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('No se pudo marcar todas como leídas:', err);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: '#fff' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 360, maxHeight: 440 } }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notificaciones</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>Marcar todas leídas</Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No tienes notificaciones</Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                borderLeft: n.leida ? 'none' : '3px solid #2e7d32',
                background: n.leida ? 'transparent' : 'rgba(46,125,50,0.06)',
                py: 1.2,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: n.leida ? 500 : 700 }}>
                  {n.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {n.mensaje}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                  {tiempoRelativo(n.created_at)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
