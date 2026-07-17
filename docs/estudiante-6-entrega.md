# Entrega - Estudiante 6

Responsable: German

## Rol

Publicar, probar y documentar LinkChat para demostrar que el sistema funciona desde internet y puede ser usado por varios clientes al mismo tiempo.

## Entregables

| Entregable | Estado | Observacion |
| --- | --- | --- |
| Backend desplegado en Render/Railway | Pendiente | Requiere permisos de GitHub y `MONGO_URI` valida. |
| Frontend desplegado en Vercel/Netlify | Pendiente | Depende de que el estudiante 4 suba la carpeta `frontend/`. |
| Variables de entorno configuradas | Parcial | `.env.example` queda como plantilla segura; falta configurar valores reales en nube. |
| Pruebas desde distintos dispositivos | Pendiente | Se ejecutan despues del despliegue. |
| Evidencias del chat funcionando | Pendiente | Capturas despues de pruebas. |
| Diagrama de arquitectura | Listo | Ver `docs/arquitectura.mmd` y README. |
| Manual breve de instalacion | Listo | Ver README y `docs/despliegue.md`. |
| Manual breve de uso | Listo | Ver README. |
| README final del proyecto | Avanzado | README actualizado con instalacion, endpoints, sockets, pruebas y despliegue. |

## Que se hizo

- Se organizo la documentacion principal en el README.
- Se corrigio `backend/.env.example` para evitar credenciales reales y errores como `MONGO_URI=MONGO_URI=...`.
- Se documento la configuracion de variables de entorno.
- Se documento el plan minimo de pruebas del proyecto.
- Se agrego una guia de despliegue para backend y frontend.
- Se agrego un diagrama Mermaid de arquitectura.
- Se agrego una coleccion base de Postman para probar endpoints.

## Bloqueos actuales

1. La cuenta de GitHub no tiene permiso de escritura en `TheSam21byte/linkchat`.
2. Falta una `MONGO_URI` valida con usuario y contrasena reales.
3. El frontend aun no existe en este repo, por lo que no puede desplegarse todavia.

## Siguiente paso recomendado

Pedir al lider del repo:

```txt
Agregame como collaborator con permiso Write al repo TheSam21byte/linkchat. Mi usuario es German583-leg.
```

Pedir al encargado de MongoDB:

```txt
Pasame la URI real de MongoDB Atlas para mi usuario german_wasas o resetea la contrasena de ese usuario.
```