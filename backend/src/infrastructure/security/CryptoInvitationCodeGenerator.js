import crypto from "crypto";
import { IInvitationCodeGenerator } from "../../domain/ports/IInvitationCodeGenerator.js";

export class CryptoInvitationCodeGenerator extends IInvitationCodeGenerator {
  generate() {
    return crypto.randomBytes(4).toString("hex");
  }
}
