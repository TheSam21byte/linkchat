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

export function toChannelDto(channel) {
  return {
    id: channel._id ?? channel.id,
    name: channel.name,
    serverId: channel.serverId,
  };
}

export function toMembershipDto(membership) {
  return {
    id: membership._id ?? membership.id,
    role: membership.role,
    active: membership.active,
    joinedAt: membership.joinedAt,
    server: toServerDto(membership.serverId ?? membership.server, membership.role),
  };
}

export function toServerMemberDto(member) {
  return {
    id: member._id ?? member.id,
    role: member.role,
    active: member.active,
    joinedAt: member.joinedAt,
    user: {
      id: member.userId?._id ?? member.userId?.id,
      name: member.userId?.name,
      username: member.userId?.username,
      avatarUrl: member.userId?.avatarUrl,
      status: member.userId?.status,
      lastSeen: member.userId?.lastSeen,
    },
  };
}
