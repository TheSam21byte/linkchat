import { IInvitationRepository } from "../../../../domain/ports/IInvitationRepository.js";
import Invitation from "../models/Invitation.js";

export class MongooseInvitationRepository extends IInvitationRepository {
  async findByCode(code) {
    return Invitation.findOne({ code }).populate("serverId", "name description");
  }

  async findActiveByCode(code) {
    return Invitation.findOne({ code, active: true }).populate("serverId");
  }

  async findAll() {
    return Invitation.find()
      .populate("serverId", "name description")
      .sort({ createdAt: -1 });
  }

  async create(invitationData) {
    return Invitation.create(invitationData);
  }

  async save(invitation) {
    return invitation.save();
  }

  async deactivateByCode(code) {
    return Invitation.findOneAndUpdate({ code }, { active: false }, { new: true });
  }
}
