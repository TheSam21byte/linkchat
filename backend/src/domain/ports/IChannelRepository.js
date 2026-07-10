export class IChannelRepository {
  async findById(_id) {
    throw new Error("IChannelRepository.findById no implementado.");
  }

  async findByServerId(_serverId) {
    throw new Error("IChannelRepository.findByServerId no implementado.");
  }

  async create(_channelData) {
    throw new Error("IChannelRepository.create no implementado.");
  }
}
