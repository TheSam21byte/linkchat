# Verificacion del software - German

## Objetivo

Verificar que LinkChat funcione correctamente antes de la demostracion en tiempo real, comprobando ingreso al sistema, invitaciones, conexion simultanea, envio de mensajes, usuarios conectados, mensajes privados y desconexion.

## Ambiente de prueba

| Elemento | Valor |
| --- | --- |
| Rama | `german-devel` |
| Backend local | `http://localhost:4000` |
| Frontend local | `http://localhost:5173` |
| Base de datos | MongoDB configurado en `backend/.env` |
| Fecha | 2026-06-23 |

## Validaciones automaticas realizadas

| Prueba | Comando / accion | Resultado |
| --- | --- | --- |
| Build frontend | `npm run build` en `frontend/` | Aprobado |
| Lint frontend | `npm run lint` en `frontend/` | Aprobado |
| Health check backend | `GET http://localhost:4000/` | Aprobado: `{"app":"LinkChat API","status":"running","message":"Backend funcionando correctamente"}` |

Nota: antes de ejecutar build/lint fue necesario instalar dependencias del frontend con `npm install`.

## Checklist de pruebas manuales

| ID | Actividad | Pasos | Resultado esperado | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- |
| V-01 | Verificar ingreso al sistema | Abrir el frontend, ingresar un nombre de usuario y continuar. | El usuario entra sin errores visuales ni problemas de carga. | Pendiente | Captura del usuario dentro del sistema. |
| V-02 | Verificar invitaciones | Crear una invitacion y abrir el enlace con otro usuario. | El sistema valida la invitacion y el usuario entra al canal correcto. | Pendiente | Captura del enlace y del usuario unido. |
| V-03 | Verificar conexion en tiempo real | Abrir dos navegadores o ventanas con usuarios distintos en el mismo canal. | Ambos usuarios permanecen conectados y reciben eventos sin recargar. | Pendiente | Captura de dos sesiones conectadas. |
| V-04 | Verificar envio de mensajes publicos | Enviar un mensaje desde un usuario en el canal. | Todos los usuarios conectados al canal reciben el mensaje. | Pendiente | Captura del mensaje visible en ambas sesiones. |
| V-05 | Verificar lista de usuarios conectados | Usar la funcion/lista de usuarios conectados o el comando `/usuarios` en el cliente socket. | Se muestran correctamente los usuarios conectados al canal. | Pendiente | Captura de la lista de usuarios. |
| V-06 | Verificar mensajes privados | Enviar `/privado SOCKET_ID mensaje` desde un cliente socket hacia otro usuario. | Solo el destinatario recibe el mensaje privado. | Pendiente | Captura del emisor y receptor. |
| V-07 | Verificar desconexion de usuarios | Cerrar una sesion o ejecutar `/salir` en un cliente socket. | El resto recibe el mensaje de salida del usuario. | Pendiente | Captura del aviso de desconexion. |

## Comandos utiles para la demostracion

### Levantar backend

```bash
cd backend
npm start
```

### Levantar frontend

```bash
cd frontend
npm run dev
```

### Probar Socket.IO con dos usuarios

Abrir dos terminales en `backend/` usando el mismo `CHANNEL_ID`:

```bash
node tests/socket-client.js German CHANNEL_ID
node tests/socket-client.js Invitado1 CHANNEL_ID
```

Comandos dentro del cliente:

```txt
/usuarios
/privado SOCKET_ID Hola privado
/salir
```

## Evidencias esperadas

- Backend respondiendo `GET /`.
- Usuario creado o iniciado.
- Servidor creado con canal `general`.
- Invitacion creada.
- Usuario entrando por invitacion.
- Dos usuarios conectados al mismo canal.
- Mensaje publico recibido por ambos usuarios.
- Lista de usuarios conectados.
- Mensaje privado recibido solo por el destinatario.
- Aviso de desconexion de usuario.

## Confirmacion para la demostracion

Cuando todas las pruebas manuales esten aprobadas y las capturas esten agregadas al entregable, el sistema puede marcarse como listo para la demostracion.
