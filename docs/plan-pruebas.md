# Plan de pruebas - LinkChat

## Requisitos previos

- Backend levantado localmente o desplegado.
- `MONGO_URI` valida configurada.
- Dependencias instaladas con `npm install` dentro de `backend/`.

## Base URL local

```txt
http://localhost:4000
```

## Pruebas REST con Postman

### 1. Health check

Metodo: `GET`

```txt
/
```

Resultado esperado:

```json
{
  "app": "LinkChat API",
  "status": "running",
  "message": "Backend funcionando correctamente"
}
```

### 2. Crear o iniciar usuario

Metodo: `POST`

```txt
/api/users/start
```

Body:

```json
{
  "username": "German"
}
```

Resultado esperado: usuario creado o actualizado con estado `online`.

### 3. Crear servidor

Metodo: `POST`

```txt
/api/servers
```

Body:

```json
{
  "name": "Sistemas Distribuidos",
  "description": "Servidor de prueba LinkChat",
  "ownerUsername": "German"
}
```

Resultado esperado: se crea el servidor, el miembro owner y el canal `general`.

Guardar estos valores de la respuesta:

- `server._id`
- `defaultChannel._id`

### 4. Crear invitacion

Metodo: `POST`

```txt
/api/invitations
```

Body:

```json
{
  "serverId": "PEGAR_SERVER_ID"
}
```

Resultado esperado: devuelve `invitation.code` e `inviteUrl`.

### 5. Unirse por invitacion

Metodo: `POST`

```txt
/api/invitations/join/PEGAR_CODE
```

Body:

```json
{
  "username": "Invitado1"
}
```

Resultado esperado: el usuario queda unido al servidor como miembro.

### 6. Listar canales del servidor

Metodo: `GET`

```txt
/api/channels/server/PEGAR_SERVER_ID
```

Resultado esperado: aparece el canal `general`.

### 7. Listar mensajes del canal

Metodo: `GET`

```txt
/api/messages/channel/PEGAR_CHANNEL_ID
```

Resultado esperado: devuelve mensajes del canal.

## Pruebas Socket.IO

Abrir dos terminales en `backend/` y usar el mismo `CHANNEL_ID`:

```bash
node tests/socket-client.js German CHANNEL_ID
node tests/socket-client.js Ian CHANNEL_ID
```

### Mensaje publico

En una terminal escribir:

```txt
Hola desde German
```

Resultado esperado: ambos clientes reciben el mensaje.

### Usuarios conectados

Escribir:

```txt
/usuarios
```

Resultado esperado: se muestra la lista de usuarios conectados y sus `socketId`.

### Mensaje privado

Copiar el `socketId` del destinatario y escribir:

```txt
/privado SOCKET_ID Hola privado
```

Resultado esperado: solo el destinatario recibe el mensaje privado.

### Desconexion

Escribir:

```txt
/salir
```

Resultado esperado: el otro cliente recibe un mensaje de sistema indicando la salida.

## Evidencias que se deben capturar

- Backend respondiendo `GET /`.
- Usuario creado con Postman.
- Servidor creado con canal `general`.
- Invitacion creada.
- Usuario entrando por invitacion.
- Dos clientes socket conectados.
- Mensaje publico recibido por ambos.
- Lista de usuarios conectados.
- Mensaje privado recibido solo por un cliente.
- Backend desplegado funcionando desde internet.