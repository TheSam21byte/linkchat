import {
  ConflictError,
  Email,
  Username,
  ValidationError,
} from "../../../domain/index.js";
import { toGuestUserDto } from "../../dto/MessageDto.js";
import { toUserDto } from "../../dto/UserDto.js";

export class StartGuestUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ username }) {
    const normalizedUsername = Username.create(username);

    const user = await this.userRepository.upsertGuestByUsername(normalizedUsername.value);

    return {
      message: "Usuario iniciado correctamente",
      user: toGuestUserDto(user),
    };
  }
}

export class GetUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute() {
    const users = await this.userRepository.findAll();

    return {
      total: users.length,
      users,
    };
  }
}

export class UpdateUserProfileUseCase {
  constructor(userRepository, avatarStorage) {
    this.userRepository = userRepository;
    this.avatarStorage = avatarStorage;
  }

  async execute({ userId, name, email, username, avatarFile, currentAvatarUrl }) {
    if (!name?.trim() || !email?.trim() || !username?.trim()) {
      throw new ValidationError("Nombre, email y username son obligatorios.");
    }

    const normalizedEmail = Email.create(email);
    const normalizedUsername = Username.create(username);
    const normalizedName = name.trim();

    const existingUser = await this.userRepository.findByEmailOrUsername(
      normalizedEmail.value,
      normalizedUsername.value
    );

    if (existingUser && String(existingUser._id) !== String(userId)) {
      throw new ConflictError(
        existingUser.email === normalizedEmail.value
          ? "Ese email ya pertenece a otra cuenta."
          : "Ese username ya está en uso. Elige otro."
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ValidationError("Usuario no encontrado.");
    }

    user.name = normalizedName;
    user.email = normalizedEmail.value;
    user.username = normalizedUsername.value;

    if (avatarFile) {
      user.avatarUrl = await this.avatarStorage.uploadAvatar(avatarFile, userId);
    } else if (currentAvatarUrl) {
      user.avatarUrl = currentAvatarUrl;
    }

    await this.userRepository.save(user);

    return {
      message: "Perfil actualizado correctamente.",
      user: toUserDto(user),
    };
  }
}
