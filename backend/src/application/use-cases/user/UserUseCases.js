import { Username } from "../../../domain/index.js";
import { toGuestUserDto } from "../../dto/MessageDto.js";

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
