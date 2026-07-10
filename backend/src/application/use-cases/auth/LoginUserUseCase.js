import {
  UnauthorizedError,
  ValidationError,
  User,
  Email,
  Password,
} from "../../../domain/index.js";
import { toUserDto } from "../../dto/UserDto.js";

export class LoginUserUseCase {
  constructor(userRepository, tokenService, passwordHasher) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.passwordHasher = passwordHasher;
  }

  async execute({ email, password }) {
    if (!email?.trim() || !password) {
      throw new ValidationError("Email y contraseña son obligatorios.");
    }

    const normalizedEmail = Email.create(email);
    const validatedPassword = Password.create(password);

    const userDocument = await this.userRepository.findByEmailWithPassword(
      normalizedEmail.value
    );

    if (!userDocument || !userDocument.passwordHash) {
      throw new UnauthorizedError("Credenciales incorrectas.");
    }

    const isValidPassword = await this.passwordHasher.compare(
      validatedPassword.value,
      userDocument.passwordHash
    );

    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciales incorrectas.");
    }

    const user = User.fromPersistence(userDocument);
    user.markOnline();

    userDocument.status = user.status.value;
    userDocument.lastSeen = user.lastSeen;
    await this.userRepository.save(userDocument);

    return {
      message: "Inicio de sesión correcto.",
      token: this.tokenService.sign(userDocument._id),
      user: toUserDto(user),
    };
  }
}
