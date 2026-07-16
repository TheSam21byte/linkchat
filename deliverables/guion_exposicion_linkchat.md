# Guion breve de exposicion - LinkChat (5 a 7 minutos)

## 1. Portada
Presento LinkChat, un sistema de chat en tiempo real desarrollado para Sistemas Distribuidos. La idea es acercarse a un mini Discord, donde varios usuarios puedan comunicarse mediante canales.

## 2. Problema
El problema es coordinar comunicacion inmediata entre multiples usuarios. En un sistema distribuido necesitamos manejar concurrencia, estados de conexion, mensajes en tiempo real y persistencia.

## 3. Que es LinkChat
LinkChat organiza la comunicacion con usuarios, servidores, canales, invitaciones, miembros y mensajes. El repositorio revisado muestra principalmente el backend; el frontend no aparece claramente, por eso se indica como externo o pendiente de integrar.

## 4. Arquitectura
La arquitectura es cliente-servidor. El cliente consume endpoints HTTP del backend Express y usa Socket.IO para tiempo real. El backend persiste informacion con Mongoose en MongoDB Atlas y puede desplegarse en nube.

## 5. Backend
El backend esta separado por modulos: users, servers, channels, invitations, members y messages. Cada parte tiene rutas, controladores y modelos, lo que facilita mantener el sistema.

## 6. Tiempo real
Socket.IO maneja eventos como join_channel, send_message, get_users, private_message y disconnect. Un usuario entra a un canal, envia un mensaje, el servidor lo guarda y lo emite a los demas clientes conectados.

## 7. Base de datos
MongoDB almacena usuarios, servidores, canales, invitaciones, miembros y mensajes. El modelo Message guarda usuario, canal, contenido, tipo y fecha, permitiendo historial de mensajes.

## 8. Despliegue y pruebas
Para demostrar el sistema se prueba el backend desplegado, las variables de entorno, la conexion a MongoDB, endpoints con Postman y eventos Socket.IO con dos clientes. Las evidencias deben incluir capturas del backend funcionando, usuarios conectados, mensajes publicos y privados.

## 9. Conclusiones
LinkChat aplica conceptos de Sistemas Distribuidos: separacion de componentes, comunicacion bidireccional, persistencia en la nube y despliegue. La mejora pendiente es integrar claramente el frontend para completar la experiencia web.
