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

export class UpdateMemberRoleUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  async execute({ memberId, role, actorUserId }) {
    EntityId.create(memberId);

    if (!["admin", "member"].includes(role)) {
      throw new ValidationError("Rol no válido. Solo se permite admin o member.");
    }

    const targetMember = await this.memberRepository.findById(memberId);

    if (!targetMember || !targetMember.active) {
      throw new NotFoundError("Miembro no encontrado.");
    }

    const actorMember = await this.memberRepository.findByUserAndServer(
      actorUserId,
      targetMember.serverId
    );

    if (!actorMember || actorMember.role !== "owner") {
      throw new ValidationError("Solo el owner puede cambiar roles.");
    }

    if (targetMember.role === "owner") {
      throw new ValidationError("No se puede cambiar el rol del owner.");
    }

    targetMember.role = role;
    await this.memberRepository.save(targetMember);

    return {
      message: "Rol actualizado correctamente.",
      member: targetMember,
    };
  }
}

export class KickMemberUseCase {
  constructor(memberRepository) {
    this.memberRepository = memberRepository;
  }

  async execute({ memberId, actorUserId }) {
    EntityId.create(memberId);

    const targetMember = await this.memberRepository.findById(memberId);

    if (!targetMember || !targetMember.active) {
      throw new NotFoundError("Miembro no encontrado.");
    }

    const actorMember = await this.memberRepository.findByUserAndServer(
      actorUserId,
      targetMember.serverId
    );

    if (!actorMember || !["owner", "admin"].includes(actorMember.role)) {
      throw new ValidationError("No tienes permisos para expulsar miembros.");
    }

    if (targetMember.role === "owner") {
      throw new ValidationError("No se puede expulsar al owner.");
    }

    targetMember.active = false;
    await this.memberRepository.save(targetMember);

    return {
      message: "Usuario expulsado correctamente.",
      member: targetMember,
    };
  }
}
