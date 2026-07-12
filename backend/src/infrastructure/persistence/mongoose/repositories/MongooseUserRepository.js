import { IUserRepository } from "../../../../domain/ports/IUserRepository.js";
import User from "../models/User.js";

export class MongooseUserRepository extends IUserRepository {
  async findByEmailWithPassword(email) {
    return User.findOne({ email }).select("+passwordHash");
  }

  async findByEmailOrUsername(email, username) {
    return User.findOne({
      $or: [{ email }, { username }],
    }).select("email username");
  }

  async findById(id) {
    return User.findById(id).select("-passwordHash");
  }

  async create(userData) {
    return User.create(userData);
  }

  async save(user) {
    return user.save();
  }

  async findAll() {
    return User.find().sort({ createdAt: -1 });
  }

  async upsertGuestByUsername(username) {
    return User.findOneAndUpdate(
      { username },
      {
        $set: {
          status: "online",
          lastSeen: null,
        },
        $setOnInsert: {
          username,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
  }
}
