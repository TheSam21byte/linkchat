import { IMemberRepository } from "../../../domain/ports/IMemberRepository.js";
import { toMembershipDto, toServerMemberDto } from "../mappers.js";

export class MemberApiRepository extends IMemberRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getMyServers() {
    const data = await this.httpClient.request("/api/members/me");
    return (data.memberships ?? []).map(toMembershipDto);
  }

  async joinServer(serverId) {
    const data = await this.httpClient.request(`/api/members/join/${serverId}`, {
      method: "POST",
    });
    return toMembershipDto(data.membership);
  }

  async getServerMembers(serverId) {
    const data = await this.httpClient.request(`/api/members/server/${serverId}`);
    return (data.members ?? []).map(toServerMemberDto);
  }
}
