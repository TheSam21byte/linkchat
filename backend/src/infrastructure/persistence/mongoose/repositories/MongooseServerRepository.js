import { IServerRepository } from "../../../../domain/ports/IServerRepository.js";
import Server from "../models/Server.js";

export class MongooseServerRepository extends IServerRepository {
  async findById(id) {
    return Server.findById(id).populate("ownerId", "username status");
  }

  async findAll() {
    return Server.find()
      .populate("ownerId", "username status")
      .sort({ createdAt: -1 });
  }

  async create(serverData) {
    return Server.create(serverData);
  }

  async save(server) {
    return server.save();
  }

  async updateById(id, data) {
    return Server.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
  }

  async deleteById(id) {
    return Server.findByIdAndDelete(id);
  }
}
