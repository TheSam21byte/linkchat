import { IUserRepository } from "../../../domain/ports/IUserRepository.js";

export class UserApiRepository extends IUserRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getUsers() {
    const data = await this.httpClient.request("/api/users");
    return data.users ?? [];
  }

  async startGuest(username) {
    const data = await this.httpClient.request("/api/users/start", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    return data.user;
  }

  async updateProfile({ name, username, email, avatar }) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);

    const data = await this.httpClient.request("/api/users/me", {
      method: "PATCH",
      body: formData,
    });
    return data.user;
  }
}
