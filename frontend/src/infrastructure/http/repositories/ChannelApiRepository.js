import { IChannelRepository } from "../../../domain/ports/IChannelRepository.js";
import { toChannelDto } from "../mappers.js";

export class ChannelApiRepository extends IChannelRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getByServerId(serverId) {
    const data = await this.httpClient.request(`/api/channels/server/${serverId}`);
    return (data.channels ?? []).map(toChannelDto);
  }
}
