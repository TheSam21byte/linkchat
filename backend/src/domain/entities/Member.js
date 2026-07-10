import { EntityId } from "../value-objects/EntityId.js";
import { MemberRole } from "../value-objects/MemberRole.js";
import { Username } from "../value-objects/Username.js";

export class Member {
  constructor({
    id = null,
    userId,
    serverId,
    role = MemberRole.member(),
    nickname = null,
    active = true,
    joinedAt = new Date(),
  }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.userId = userId instanceof EntityId ? userId : EntityId.create(userId);
    this.serverId = serverId instanceof EntityId ? serverId : EntityId.create(serverId);
    this.role = role instanceof MemberRole ? role : MemberRole.create(role);
    this.nickname = nickname;
    this.active = Boolean(active);
    this.joinedAt = joinedAt;
  }

  static createOwner({ userId, serverId, nickname }) {
    const normalizedNickname =
      nickname instanceof Username ? nickname.value : Username.create(nickname).value;

    return new Member({
      userId,
      serverId,
      role: MemberRole.owner(),
      nickname: normalizedNickname,
      active: true,
    });
  }

  static join({ userId, serverId, nickname }) {
    const normalizedNickname =
      nickname instanceof Username ? nickname.value : Username.create(nickname).value;

    return new Member({
      userId,
      serverId,
      role: MemberRole.member(),
      nickname: normalizedNickname,
      active: true,
    });
  }

  reactivate(nickname) {
    this.active = true;

    if (nickname) {
      this.nickname =
        nickname instanceof Username ? nickname.value : Username.create(nickname).value;
    }
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      userId: this.userId.value,
      serverId: this.serverId.value,
      role: this.role.value,
      nickname: this.nickname,
      active: this.active,
      joinedAt: this.joinedAt,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new Member({
      id: document._id ?? document.id,
      userId: document.userId?._id ?? document.userId,
      serverId: document.serverId?._id ?? document.serverId,
      role: document.role,
      nickname: document.nickname,
      active: document.active,
      joinedAt: document.joinedAt,
    });
  }
}
