export const unsupportedFrontendFeatures = [
  {
    page: 'ChatHome',
    feature: 'Mensajes directos persistentes',
    missingBackend: 'No existe GET/POST /api/direct-messages',
    currentSupport: 'El backend solo tiene evento Socket.IO private_message por username o socketId.',
  },
  {
    page: 'ServerPage',
    feature: 'Enviar mensajes de canal por HTTP',
    missingBackend: 'No existe POST /api/messages/channel/:channelId',
    currentSupport: 'El envio real se hace con Socket.IO: send_message.',
  },
]
