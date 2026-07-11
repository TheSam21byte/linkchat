import { toUserDto, toServerDto } from "../dto/mappers.js";
import { VoiceMeetingId } from "../../domain/value-objects/VoiceMeetingId.js";

export class RegisterUserUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  execute(input) {
    return this.authRepository.register(input);
  }
}

export class LoginUserUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute({ email, password }) {
    const data = await this.authRepository.login({ email, password });
    return {
      ...data,
      user: toUserDto(data.user),
    };
  }
}

export class SaveAuthSessionUseCase {
  constructor(tokenStorage, userStorage) {
    this.tokenStorage = tokenStorage;
    this.userStorage = userStorage;
  }

  execute({ user, token = null }) {
    const normalizedUser = toUserDto(user);

    if (token) {
      this.tokenStorage.saveToken(token);
    }

    this.userStorage.saveUser(normalizedUser);
    return normalizedUser;
  }
}

export class ClearAuthSessionUseCase {
  constructor(tokenStorage, userStorage) {
    this.tokenStorage = tokenStorage;
    this.userStorage = userStorage;
  }

  execute() {
    this.tokenStorage.clearToken();
    this.userStorage.clearUser();
  }
}

export class GetStoredSessionUseCase {
  constructor(userStorage) {
    this.userStorage = userStorage;
  }

  execute() {
    return this.userStorage.getUser();
  }
}

export class UpdateProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(input) {
    const user = await this.userRepository.updateProfile(input);
    return toUserDto(user);
  }
}

export class StartGuestUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ username }) {
    const user = await this.userRepository.startGuest(username);
    return toUserDto(user);
  }
}

export class GetServersUseCase {
  constructor(serverRepository) {
    this.serverRepository = serverRepository;
  }

  execute() {
    return this.serverRepository.getAll();
  }
}

export class GetServerByIdUseCase {
  constructor(serverRepository) {
    this.serverRepository = serverRepository;
  }

  execute({ serverId }) {
    return this.serverRepository.getById(serverId);
  }
}

export class GetMyServersUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  execute() {
    return this.memberRepository.getMyServers();
  }
}

export class JoinServerUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  execute({ serverId }) {
    return this.memberRepository.joinServer(serverId);
  }
}

export class GetServerMembersUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  execute({ serverId }) {
    return this.memberRepository.getServerMembers(serverId);
  }
}

export class GetInvitationByCodeUseCase {
  constructor(invitationRepository) {
    this.invitationRepository = invitationRepository;
  }

  execute({ code }) {
    return this.invitationRepository.getByCode(code);
  }
}

export class JoinInvitationUseCase {
  constructor(invitationRepository) {
    this.invitationRepository = invitationRepository;
  }

  execute({ code }) {
    return this.invitationRepository.joinByCode(code);
  }
}

export class ResolveInvitationUseCase {
  constructor(invitationRepository, serverRepository) {
    this.invitationRepository = invitationRepository;
    this.serverRepository = serverRepository;
  }

  async execute({ code }) {
    const data = await this.invitationRepository.getByCode(code);
    const invitation = data.invitation ?? data;
    const inviteServer = invitation.serverId ?? invitation.server;

    if (!inviteServer) {
      throw new Error("La invitación no tiene un servidor asociado.");
    }

    const server =
      typeof inviteServer === "object"
        ? toServerDto(inviteServer)
        : await this.serverRepository.getById(inviteServer);

    return { code, invitation, server };
  }
}

export class GetServerChannelsUseCase {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  execute({ serverId }) {
    return this.channelRepository.getByServerId(serverId);
  }
}

export class GetChannelMessagesUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  execute({ channelId }) {
    return this.messageRepository.getByChannelId(channelId);
  }
}

export class CreateVoiceChannelUseCase {
  constructor(voicePresenceRepository) {
    this.voicePresenceRepository = voicePresenceRepository;
  }

  execute({ serverId, name, user }) {
    return this.voicePresenceRepository.createChannel({ serverId, name, user });
  }
}

export class BuildVoiceMeetingIdUseCase {
  execute({ serverId, channelId }) {
    return VoiceMeetingId.build(serverId, channelId);
  }
}
