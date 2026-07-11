import { IAuthTokenStorage } from "../../domain/ports/IAuthTokenStorage.js";

const TOKEN_KEY = "linkchat-auth-token";

export class LocalAuthTokenStorage extends IAuthTokenStorage {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }
}
