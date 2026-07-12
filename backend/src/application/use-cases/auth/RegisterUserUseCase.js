import {
  ConflictError,
  ValidationError,
  User,
  Email,
  Username,
  Password,
  UserStatus,
} from "../../../domain/index.js";
import { toUserDto } from "../../dto/UserDto.js";

export class RegisterUserUseCase {
  constructor(userRepository, avatarStorage, passwordHasher, idGenerator) {
    this.userRepository = userRepository;
    this.avatarStorage = avatarStorage;
    this.passwordHasher = passwordHasher;
    this.idGenerator = idGenerator;
  }

  async execute({ email, password, name, username, avatarFile }) {
    if (!email?.trim() || !password || !name?.trim()) {
      throw new ValidationError("Nombre, username, email y contraseña son obligatorios.");
    }

    const normalizedEmail = Email.create(email);
    const normalizedUsername = Username.create(username || name);
    const validatedPassword = Password.create(password);
    const normalizedName = name.trim();

    const existingUser = await this.userRepository.findByEmailOrUsername(
      normalizedEmail.value,
      normalizedUsername.value
    );

    if (existingUser) {
      throw new ConflictError(
        existingUser.email === normalizedEmail.value
          ? "Ya existe un usuario registrado con ese email."
          : "Ese username ya está en uso. Elige otro."
      );
    }

    const userId = this.idGenerator.generate();
    const avatarUrl = avatarFile
      ? await this.avatarStorage.uploadAvatar(avatarFile, userId.value)
      : null;

    const passwordHash = await this.passwordHasher.hash(validatedPassword.value);

    const user = new User({
      id: userId,
      email: normalizedEmail,
      name: normalizedName,
      username: normalizedUsername,
      avatarUrl,
      status: UserStatus.offline(),
      passwordHash,
    });

    await this.userRepository.create(user.toPersistence());

    return {
      message: "Usuario registrado correctamente. Ahora inicia sesión.",
      user: toUserDto(user),
    };
  }
}
