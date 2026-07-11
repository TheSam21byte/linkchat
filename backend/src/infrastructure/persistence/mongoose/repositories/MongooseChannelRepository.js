import { IChannelRepository } from "../../../../domain/ports/IChannelRepository.js";
import Channel from "../models/Channel.js";

export class MongooseChannelRepository extends IChannelRepository {
  async findById(id) {
    return Channel.findById(id).populate("serverId", "name description");
  }

  async findByServerId(serverId) {
    return Channel.find({ serverId }).sort({ createdAt: 1 });
  }

  async create(channelData) {
    return Channel.create(channelData);
  }

  async updateById(id, data) {
    return Channel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
  }

  async deleteById(id) {
    return Channel.findByIdAndDelete(id);
  }
}
