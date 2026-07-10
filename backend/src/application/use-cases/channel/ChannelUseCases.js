import { Channel, EntityId, NotFoundError, ValidationError } from "../../../domain/index.js";

export class CreateChannelUseCase {
  constructor(serverRepository, channelRepository) {
    this.serverRepository = serverRepository;
    this.channelRepository = channelRepository;
  }

  async execute({ name, serverId }) {
    if (!name?.trim() || !serverId) {
      throw new ValidationError("El nombre del canal y serverId son obligatorios.");
    }

    EntityId.create(serverId);

    const server = await this.serverRepository.findById(serverId);

    if (!server) {
      throw new NotFoundError("Servidor no encontrado.");
    }

    const channelEntity = new Channel({ name, serverId });
    const channel = await this.channelRepository.create(channelEntity.toPersistence());

    return {
      message: "Canal creado correctamente",
      channel,
    };
  }
}

export class GetChannelsByServerUseCase {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  async execute({ serverId }) {
    EntityId.create(serverId);

    const channels = await this.channelRepository.findByServerId(serverId);

    return {
      total: channels.length,
      channels,
    };
  }
}

export class GetChannelByIdUseCase {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  async execute({ id }) {
    EntityId.create(id);

    const channel = await this.channelRepository.findById(id);

    if (!channel) {
      throw new NotFoundError("Canal no encontrado.");
    }

    return channel;
  }
}
