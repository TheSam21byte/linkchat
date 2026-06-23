## [2026-06-22] Conexión MongoDB Atlas

### Configurado
- [x] Archivo `backend/.env` creado con `MONGO_URI` del cluster SamCluster
- [x] Archivo `frontend/.env` creado con URLs del backend local
- [x] Corregido typo en `backend/.env.example`

### FIXME
- [ ] FIXME: La conexión a MongoDB Atlas falló con `bad auth: Authentication failed`
- [ ] TODO: Verificar usuario/contraseña en MongoDB Atlas → Database Access
- [ ] TODO: Agregar IP actual en Network Access (o `0.0.0.0/0` para desarrollo)


### Completado
- [x] Generación de códigos con `nanoid` (6 caracteres alfanuméricos)
- [x] `POST /api/invitations` con `inviteUrl` dinámico usando `CLIENT_URL`
- [x] `GET /api/invitations/:code` con validación de invitación activa
- [x] `POST /api/invitations/join/:code` devuelve usuario y servidor
- [x] Ruta frontend `/invite/:codigo` con `react-router-dom`
- [x] Página de ingreso por invitación (`frontend/src/pages/invite.jsx`)
- [x] Comando `/usuarios` en el chat web
- [x] Comando `/privado NombreUsuario mensaje` en el chat web
- [x] UI para generar y copiar enlaces de invitación en `server.jsx`
- [x] Mensajes privados por nombre de usuario en `chat.socket.js`

### Pendiente / FIXME
- [ ] FIXME: Los mensajes privados no se persisten en MongoDB
- [ ] TODO: Pruebas end-to-end con backend y MongoDB Atlas en despliegue
- [ ] TODO: Desactivar invitaciones desde la UI (endpoint `PATCH` ya existe)

### Archivos modificados
- `backend/src/controllers/invitation.controller.js`
- `backend/src/sockets/chat.socket.js`
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/pages/invite.jsx` (nuevo)
- `frontend/src/pages/server.jsx`
- `frontend/src/constants/backend-coverage.js`
