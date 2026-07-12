import {
  EntityId,
  Invitation,
  InvitationCode,
  NotFoundError,
  ValidationError,
} from "../../../domain/index.js";

export class CreateInvitationUseCase {
  constructor(serverRepository, invitationRepository, invitationCodeGenerator) {
    this.serverRepository = serverRepository;
    this.invitationRepository = invitationRepository;
    this.invitationCodeGenerator = invitationCodeGenerator;
  }

  async execute({ serverId, code, clientUrl }) {
    if (!serverId) {
      throw new ValidationError("serverId es obligatorio.");
    }

    EntityId.create(serverId);

    const server = await this.serverRepository.findById(serverId);

    if (!server) {
      throw new NotFoundError("Servidor no encontrado.");
    }

    const invitationCode = code?.trim()
      ? InvitationCode.create(code)
      : InvitationCode.create(this.invitationCodeGenerator.generate());

    const invitationEntity = new Invitation({
      code: invitationCode,
      serverId,
      active: true,
    });

    const invitation = await this.invitationRepository.create(invitationEntity.toPersistence());

    return {
      message: "Invitación creada correctamente",
      invitation,
      inviteUrl: `${clientUrl}/invite/${invitation.code}`,
    };
  }
}

export class GetInvitationsUseCase {
  constructor(invitationRepository) {
    this.invitationRepository = invitationRepository;
  }

  async execute() {
    const invitations = await this.invitationRepository.findAll();

    return {
      total: invitations.length,
      invitations,
    };
  }
}

export class GetInvitationByCodeUseCase {
  constructor(invitationRepository) {
    this.invitationRepository = invitationRepository;
  }

  async execute({ code }) {
    const invitation = await this.invitationRepository.findByCode(code);

    if (!invitation) {
      throw new NotFoundError("Invitación no encontrada.");
    }

    return invitation;
  }
}

export class JoinByInvitationUseCase {
  constructor(invitationRepository, memberRepository) {
    this.invitationRepository = invitationRepository;
    this.memberRepository = memberRepository;
  }

  async execute({ code, user }) {
    const invitation = await this.invitationRepository.findActiveByCode(code);

    if (!invitation) {
      throw new NotFoundError("Invitación no encontrada o inactiva.");
    }

    const member = await this.memberRepository.upsertActiveMembership({
      userId: user._id,
      serverId: invitation.serverId._id,
      role: "member",
    });

    return {
      message: "Usuario unido al servidor correctamente",
      user,
      server: invitation.serverId,
      member,
    };
  }
}

export class DisableInvitationUseCase {
  constructor(invitationRepository) {
    this.invitationRepository = invitationRepository;
  }

  async execute({ code }) {
    const invitation = await this.invitationRepository.deactivateByCode(code);

    if (!invitation) {
      throw new NotFoundError("Invitación no encontrada.");
    }

    return {
      message: "Invitación desactivada correctamente",
      invitation,
    };
  }
}
