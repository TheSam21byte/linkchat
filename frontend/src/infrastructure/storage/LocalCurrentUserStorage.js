import { ICurrentUserStorage } from "../../domain/ports/ICurrentUserStorage.js";

const USER_KEY = "linkchat-current-user";

export class LocalCurrentUserStorage extends ICurrentUserStorage {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }

  saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearUser() {
    localStorage.removeItem(USER_KEY);
  }
}
