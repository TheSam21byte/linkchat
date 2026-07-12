import { IServerRepository } from "../../../domain/ports/IServerRepository.js";
import { toServerDto } from "../mappers.js";

export class ServerApiRepository extends IServerRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getAll() {
    const data = await this.httpClient.request("/api/servers");
    return (data.servers ?? []).map((server) => toServerDto(server));
  }

  async getById(serverId) {
    const data = await this.httpClient.request(`/api/servers/${serverId}`);
    return toServerDto(data);
  }

  async create({ name, description, ownerUsername }) {
    const data = await this.httpClient.request("/api/servers", {
      method: "POST",
      body: JSON.stringify({ name, description, ownerUsername }),
    });

    return {
      server: toServerDto(data.server, data.member?.role ?? "owner"),
      defaultChannel: data.defaultChannel,
      owner: data.owner,
    };
  }
}
