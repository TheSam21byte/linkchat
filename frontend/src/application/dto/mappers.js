export function toUserDto(user) {
  if (!user) return null;

  return {
    id: user._id ?? user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl ?? null,
    status: user.status,
  };
}

export function toServerDto(server, role = "member") {
  return {
    id: server._id ?? server.id,
    name: server.name,
    description: server.description,
    ownerId: server.ownerId,
    role,
  };
}
