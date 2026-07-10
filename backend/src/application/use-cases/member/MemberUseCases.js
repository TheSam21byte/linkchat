import { EntityId, Member, NotFoundError, ValidationError } from "../../../domain/index.js";

export class GetMembersByServerUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  async execute({ serverId }) {
    EntityId.create(serverId);

    const members = await this.memberRepository.findActiveByServerId(serverId);

    return {
      total: members.length,
      members,
    };
  }
}

export class GetServersByUserUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  async execute({ userId }) {
    EntityId.create(userId);

    const memberships = await this.memberRepository.findActiveByUserId(userId);

    return {
      total: memberships.length,
      memberships,
    };
  }
}

export class GetMyServersUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  async execute({ userId }) {
    const memberships = await this.memberRepository.findActiveByUserId(userId);

    return {
      total: memberships.length,
      memberships,
    };
  }
}

export class JoinServerUseCase {
  constructor(serverRepository, memberRepository) {
    this.serverRepository = serverRepository;
    this.memberRepository = memberRepository;
  }

  async execute({ serverId, userId, username }) {
    EntityId.create(serverId);

    const server = await this.serverRepository.findById(serverId);

    if (!server) {
      throw new NotFoundError("Servidor no encontrado.");
    }

    let membership = await this.memberRepository.findByUserAndServer(userId, serverId);

    if (membership) {
      membership.active = true;
      membership.nickname = membership.nickname || username;
      await this.memberRepository.save(membership);
    } else {
      const memberEntity = Member.join({
        userId: userId.toString(),
        serverId,
        nickname: username,
      });
      membership = await this.memberRepository.create(memberEntity.toPersistence());
    }

    await membership.populate("serverId", "name description ownerId");

    return {
      message: "Te uniste al servidor correctamente.",
      membership,
    };
  }
}
