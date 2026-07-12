import { Channel } from "../entities/Channel.js";
import { Member } from "../entities/Member.js";
import { Server } from "../entities/Server.js";
import { EntityId } from "../value-objects/EntityId.js";

export class ServerBootstrapService {
  static createInitialSetup({ serverId, name, description, ownerId, ownerUsername }) {
    const normalizedServerId =
      serverId instanceof EntityId ? serverId : EntityId.create(serverId);
    const normalizedOwnerId =
      ownerId instanceof EntityId ? ownerId : EntityId.create(ownerId);

    const server = new Server({
      id: normalizedServerId,
      name,
      description,
      ownerId: normalizedOwnerId,
    });

    const member = Member.createOwner({
      userId: normalizedOwnerId,
      serverId: normalizedServerId,
      nickname: ownerUsername,
    });

    const channel = Channel.createDefault(normalizedServerId);

    return { server, member, channel };
  }
}
