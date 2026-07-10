export function toMessageSocketDto({ savedMessage, username, channelId, content }) {
  return {
    id: savedMessage._id,
    _id: savedMessage._id,
    usuario: username,
    username,
    mensaje: content,
    content,
    channelId,
    type: savedMessage.type,
    hora: new Date().toLocaleTimeString(),
    createdAt: savedMessage.createdAt,
  };
}

export function toGuestUserDto(user) {
  return {
    id: user._id ?? user.id,
    username: user.username?.value ?? user.username,
    status: user.status?.value ?? user.status,
  };
}
