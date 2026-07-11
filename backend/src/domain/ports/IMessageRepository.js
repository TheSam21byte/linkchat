export class IMessageRepository {
  async findByChannelId(_channelId, _limit = 50) {
    throw new Error("IMessageRepository.findByChannelId no implementado.");
  }

  async create(_messageData) {
    throw new Error("IMessageRepository.create no implementado.");
  }

  async deleteById(_id) {
    throw new Error("IMessageRepository.deleteById no implementado.");
  }

  async deleteByChannelId(_channelId) {
    throw new Error("IMessageRepository.deleteByChannelId no implementado.");
  }
}
