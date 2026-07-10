export class ICurrentUserStorage {
  getUser() {
    throw new Error("ICurrentUserStorage.getUser no implementado.");
  }

  saveUser(_user) {
    throw new Error("ICurrentUserStorage.saveUser no implementado.");
  }

  clearUser() {
    throw new Error("ICurrentUserStorage.clearUser no implementado.");
  }
}
