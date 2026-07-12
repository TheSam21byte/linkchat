export function toUserDto(user) {
  if (!user) return null;

  const id = user.id?.value ?? user.id ?? user._id;

  return {
    id,
    email: user.email?.value ?? user.email,
    name: user.name,
    username: user.username?.value ?? user.username,
    avatarUrl: user.avatarUrl,
    status: user.status?.value ?? user.status,
  };
}
