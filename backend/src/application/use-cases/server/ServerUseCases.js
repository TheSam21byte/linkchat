import {
  ValidationError,
  Username,
  EntityId,
  NotFoundError,
  ServerBootstrapService,
} from "../../../domain/index.js";

export class CreateServerUseCase {
  constructor(userRepository, serverRepository, memberRepository, channelRepository, idGenerator) {
    this.userRepository = userRepository;
    this.serverRepository = serverRepository;
    this.memberRepository = memberRepository;
    this.channelRepository = channelRepository;
    this.idGenerator = idGenerator;
  }

  async execute({ name, description, ownerUsername }) {
    if (!name?.trim() || !ownerUsername?.trim()) {
      throw new ValidationError("El nombre del servidor y ownerUsername son obligatorios.");
    }

    const username = Username.create(ownerUsername);
    const owner = await this.userRepository.upsertGuestByUsername(username.value);
    const serverId = this.idGenerator.generate();

    const { server, member, channel } = ServerBootstrapService.createInitialSetup({
      serverId: serverId.value,
      name,
      description,
      ownerId: owner._id.toString(),
      ownerUsername: username.value,
    });

    const savedServer = await this.serverRepository.create(server.toPersistence());
    const savedMember = await this.memberRepository.create(member.toPersistence());
    const savedChannel = await this.channelRepository.create(channel.toPersistence());

    return {
      message: "Servidor creado correctamente",
      server: savedServer,
      owner: {
        id: owner._id,
        username: owner.username,
      },
      member: savedMember,
      defaultChannel: savedChannel,
    };
  }
}

export class GetServersUseCase {
  constructor(serverRepository) {
    this.serverRepository = serverRepository;
  }

  async execute() {
    const servers = await this.serverRepository.findAll();

    return {
      total: servers.length,
      servers,
    };
  }
}

export class GetServerByIdUseCase {
  constructor(serverRepository) {
    this.serverRepository = serverRepository;
  }

  async execute({ id }) {
    EntityId.create(id);

    const server = await this.serverRepository.findById(id);

    if (!server) {
      throw new NotFoundError("Servidor no encontrado.");
    }

    return server;
  }
}
