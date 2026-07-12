import { IAuthRepository } from "../../../domain/ports/IAuthRepository.js";

export class AuthApiRepository extends IAuthRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async register({ name, username, email, password, avatar }) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    return this.httpClient.request("/api/auth/register", {
      method: "POST",
      body: formData,
    });
  }

  async login({ email, password }) {
    return this.httpClient.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.httpClient.request("/api/auth/me");
  }
}
