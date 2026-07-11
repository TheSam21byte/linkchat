import mongoose from "mongoose";
import { IIdGenerator } from "../../../domain/ports/IIdGenerator.js";
import { EntityId } from "../../../domain/value-objects/EntityId.js";

export class MongoObjectIdGenerator extends IIdGenerator {
  generate() {
    return EntityId.create(new mongoose.Types.ObjectId().toString());
  }
}
