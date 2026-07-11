import { IInvitationRepository } from "../../../domain/ports/IInvitationRepository.js";

export class InvitationApiRepository extends IInvitationRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getByCode(code) {
    return this.httpClient.request(`/api/invitations/${encodeURIComponent(code)}`);
  }

  async joinByCode(code) {
    return this.httpClient.request(`/api/invitations/join/${encodeURIComponent(code)}`, {
      method: "POST",
    });
  }
}
