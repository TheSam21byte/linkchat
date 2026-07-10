export class ITokenService {
  sign(_userId) {
    throw new Error("ITokenService.sign no implementado.");
  }

  verify(_token) {
    throw new Error("ITokenService.verify no implementado.");
  }
}
