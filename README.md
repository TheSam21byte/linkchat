# LinkChat

Sistema distribuido de chat en tiempo real tipo Discord, desarrollado para el curso de Sistemas Distribuidos.

## Responsabilidad del estudiante 6

El estudiante 6 se encarga de despliegue en la nube, pruebas y documentacion:

- Backend desplegado en Render, Railway o servicio compatible.
- Frontend desplegado en Vercel o Netlify cuando exista la carpeta `frontend/`.
- Variables de entorno configuradas en local y nube.
- Pruebas desde varios clientes o dispositivos.
- Evidencias del chat funcionando.
- Diagrama de arquitectura.
- Manual breve de instalacion y uso.
- README final del proyecto.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Backend | Node.js, Express |
| Tiempo real | Socket.IO |
| Base de datos | MongoDB Atlas, Mongoose |
| Variables de entorno | dotenv |
| Frontend | React + Vite |
| Despliegue backend | Render o Railway |
| Despliegue frontend | Vercel o Netlify |

## Instalacion local

1. Instalar dependencias del backend:

```bash
cd backend
npm install
```

2. Crear `backend/.env` desde `backend/.env.example`:

```env
PORT=4000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@HOST/linkchat?retryWrites=true&w=majority&appName=APP_NAME
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. Levantar el backend:

```bash
npm run dev
```

4. Probar el health check:

```txt
GET http://localhost:4000/
```

Respuesta esperada:

```json
{
  "app": "LinkChat API",
  "status": "running",
  "message": "Backend funcionando correctamente"
}
```

## Endpoints REST

| Metodo | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/` | Health check del backend |
| `POST` | `/api/users/start` | Iniciar o registrar usuario |
| `GET` | `/api/users` | Listar usuarios |
| `POST` | `/api/servers` | Crear servidor |
| `GET` | `/api/servers` | Listar servidores |
| `GET` | `/api/servers/:id` | Obtener servidor por ID |
| `POST` | `/api/channels` | Crear canal |
| `GET` | `/api/channels/server/:serverId` | Listar canales de un servidor |
| `GET` | `/api/channels/:id` | Obtener canal por ID |
| `POST` | `/api/invitations` | Crear invitacion |
| `GET` | `/api/invitations` | Listar invitaciones |
| `GET` | `/api/invitations/:code` | Validar invitacion |
| `POST` | `/api/invitations/join/:code` | Unirse mediante invitacion |
| `PATCH` | `/api/invitations/:code/disable` | Desactivar invitacion |
| `GET` | `/api/members/server/:serverId` | Listar miembros de servidor |
| `GET` | `/api/members/user/:userId` | Listar servidores de un usuario |
| `GET` | `/api/messages/channel/:channelId` | Listar mensajes de un canal |

## Eventos Socket.IO

| Evento | Uso |
| --- | --- |
| `join_channel` | Entrar a un canal |
| `system_message` | Avisos de entrada y salida |
| `send_message` | Enviar mensaje publico |
| `receive_message` | Recibir mensaje publico |
| `get_users` | Pedir usuarios conectados |
| `users_list` | Recibir usuarios conectados |
| `private_message` | Enviar mensaje privado |
| `receive_private_message` | Recibir mensaje privado |
| `error_message` | Error al guardar mensaje |

## Pruebas locales de sockets

Abrir dos terminales dentro de `backend`:

```bash
node tests/socket-client.js German CHANNEL_ID
node tests/socket-client.js Ian CHANNEL_ID
```

Usar el mismo `CHANNEL_ID` en ambos clientes.

Comandos del cliente:

```txt
/usuarios
/privado SOCKET_ID mensaje
/salir
```

## Plan minimo de pruebas

| Prueba | Resultado esperado |
| --- | --- |
| `GET /` | Backend responde `status: running` |
| Crear usuario | Devuelve usuario online |
| Crear servidor | Crea servidor, owner y canal `general` |
| Crear invitacion | Devuelve `code` e `inviteUrl` |
| Unirse por invitacion | Crea o activa miembro |
| Enviar mensaje publico | Todos reciben `receive_message` |
| `/usuarios` | Retorna lista de conectados |
| `/privado` | Solo el destinatario recibe el mensaje |
| Desconexion | El canal recibe mensaje de salida |
| Despliegue | La API funciona desde internet |

## Despliegue del backend

### Desde la raiz del repo

Build command:

```bash
npm install && npm install --prefix backend
```

Start command:

```bash
npm start
```

### Usando `backend/` como root

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Variables en Render/Railway:

```env
PORT=4000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@HOST/linkchat?retryWrites=true&w=majority&appName=APP_NAME
CLIENT_URL=https://URL-DEL-FRONTEND
NODE_ENV=production
```

## Despliegue del frontend

Cuando exista la carpeta `frontend/`, desplegar en Vercel o Netlify.

Variables sugeridas:

```env
VITE_API_URL=https://URL-DEL-BACKEND
VITE_SOCKET_URL=https://URL-DEL-BACKEND
```

En el backend, actualizar `CLIENT_URL` con la URL publica del frontend.

## Arquitectura

```mermaid
flowchart LR
  U1[Cliente web 1] --> FE[Frontend React + Vite]
  U2[Cliente web 2] --> FE
  FE -->|REST API| BE[Backend Express]
  FE <-->|Socket.IO| BE
  BE --> DB[(MongoDB Atlas)]
```

## Manual de uso

1. El usuario ingresa al frontend o a un enlace de invitacion.
2. Registra un nombre de usuario.
3. Entra a un servidor y canal.
4. Envia mensajes publicos en tiempo real.
5. Usa `/usuarios` para consultar conectados.
6. Usa `/privado SOCKET_ID mensaje` para enviar un mensaje privado.
7. Al desconectarse, los demas usuarios reciben una notificacion.


## Documentacion de entrega

- [Entrega del estudiante 6](docs/estudiante-6-entrega.md)
- [Plan de pruebas](docs/plan-pruebas.md)
- [Guia de despliegue](docs/despliegue.md)
- [Diagrama Mermaid](docs/arquitectura.mmd)
- [Coleccion Postman](docs/postman/linkchat.postman_collection.json)
## Seguridad

- No subir `backend/.env`.
- No publicar usuarios o contrasenas reales de MongoDB Atlas.
- Usar `backend/.env.example` solo como plantilla.
- Si una contrasena tiene caracteres especiales, codificarla para URL antes de ponerla en `MONGO_URI`.