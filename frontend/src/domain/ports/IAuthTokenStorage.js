export class IAuthTokenStorage {
  getToken() {
    throw new Error("IAuthTokenStorage.getToken no implementado.");
  }

  saveToken(_token) {
    throw new Error("IAuthTokenStorage.saveToken no implementado.");
  }

  clearToken() {
    throw new Error("IAuthTokenStorage.clearToken no implementado.");
  }
}
