# Guia de despliegue - LinkChat

## Backend en Render o Railway

### Opcion 1: desplegar desde la raiz del repo

Build command:

```bash
npm install && npm install --prefix backend
```

Start command:

```bash
npm start
```

### Opcion 2: desplegar usando `backend/` como root

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

## Variables de entorno del backend

Configurar en el panel del servicio:

```env
PORT=4000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@HOST/linkchat?retryWrites=true&w=majority&appName=APP_NAME
CLIENT_URL=https://URL-DEL-FRONTEND
NODE_ENV=production
```

Notas:

- No subir el archivo `.env` al repositorio.
- `MONGO_URI` debe empezar con `mongodb+srv://` o `mongodb://`.
- Si la contrasena tiene caracteres especiales, debe estar codificada para URL.
- `CLIENT_URL` debe ser la URL real del frontend desplegado.

## Verificacion del backend desplegado

Abrir en navegador o Postman:

```txt
https://URL-DEL-BACKEND/
```

Debe responder:

```json
{
  "app": "LinkChat API",
  "status": "running",
  "message": "Backend funcionando correctamente"
}
```

## Frontend en Vercel o Netlify

Cuando exista la carpeta `frontend/`, desplegar esa carpeta.

Variables sugeridas del frontend:

```env
VITE_API_URL=https://URL-DEL-BACKEND
VITE_SOCKET_URL=https://URL-DEL-BACKEND
```

Despues del despliegue del frontend:

1. Copiar la URL publica del frontend.
2. Actualizar `CLIENT_URL` en el backend desplegado.
3. Reiniciar el backend si el servicio no lo hace automaticamente.
4. Probar ingreso al chat desde dos navegadores o dispositivos.

## Checklist de despliegue

- [ ] Rama subida a GitHub.
- [ ] Backend conectado a MongoDB Atlas.
- [ ] Backend desplegado y respondiendo `GET /`.
- [ ] Frontend desplegado.
- [ ] `CLIENT_URL` apunta al frontend real.
- [ ] Frontend consume API y Socket.IO del backend real.
- [ ] Pruebas realizadas desde dos clientes.
- [ ] Evidencias guardadas.