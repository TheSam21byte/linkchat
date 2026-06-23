import dotenv from "dotenv";
import mongoose from "mongoose";

import Member from "../models/Member.js";
import Server from "../models/Server.js";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const server = await Server.findOne({ name: "LinkChat UNAMAD" });

if (!server) {
  throw new Error("No existe el servidor LinkChat UNAMAD");
}

const users = await User.find();

for (const user of users) {
  await Member.findOneAndUpdate(
    {
      userId: user._id,
      serverId: server._id
    },
    {
      $set: {
        active: true,
        nickname: user.username
      },
      $setOnInsert: {
        userId: user._id,
        serverId: server._id,
        role: server.ownerId?.equals(user._id) ? "owner" : "member"
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
}

console.log(`Usuarios vinculados a ${server.name}: ${users.length}`);

await mongoose.disconnect();
