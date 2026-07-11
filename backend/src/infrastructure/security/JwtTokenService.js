import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain/ports/ITokenService.js";

export class JwtTokenService extends ITokenService {
  sign(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
