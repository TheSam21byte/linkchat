import { UnauthorizedError, ValidationError } from "../../../domain/index.js";

export class ValidateSessionUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute({ token }) {
    if (!token?.trim()) {
      throw new ValidationError("Token de sesión requerido.");
    }

    let payload;

    try {
      payload = this.tokenService.verify(token);
    } catch {
      throw new UnauthorizedError("Sesión inválida o expirada.");
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado.");
    }

    return user;
  }
}
