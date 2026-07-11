import { IMemberRepository } from "../../../../domain/ports/IMemberRepository.js";
import Member from "../models/Member.js";

export class MongooseMemberRepository extends IMemberRepository {
  async findByUserAndServer(userId, serverId) {
    return Member.findOne({ userId, serverId });
  }

  async findActiveByServerId(serverId) {
    return Member.find({ serverId, active: true })
      .populate("userId", "name username avatarUrl status lastSeen")
      .populate("serverId", "name description")
      .sort({ joinedAt: 1 });
  }

  async findActiveByUserId(userId) {
    return Member.find({ userId, active: true })
      .populate("serverId", "name description ownerId")
      .populate("userId", "username status")
      .sort({ joinedAt: -1 });
  }

  async create(memberData) {
    return Member.create(memberData);
  }

  async save(member) {
    return member.save();
  }

  async findById(memberId) {
    return Member.findById(memberId);
  }

  async upsertActiveMembership({ userId, serverId, role = "member", nickname = null }) {
    return Member.findOneAndUpdate(
      { userId, serverId },
      {
        userId,
        serverId,
        role,
        active: true,
        joinedAt: new Date(),
        ...(nickname ? { nickname } : {}),
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  }
}
