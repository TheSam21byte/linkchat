import { IMessageRepository } from "../../../domain/ports/IMessageRepository.js";

export class MessageApiRepository extends IMessageRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getByChannelId(channelId) {
    const data = await this.httpClient.request(`/api/messages/channel/${channelId}`);
    return data.messages ?? [];
  }
}
