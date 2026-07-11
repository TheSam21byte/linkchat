import {
  User,
  Server,
  Channel,
  Member,
  Message,
  Invitation,
} from "../../../../domain/entities/index.js";

export const UserMapper = {
  toDomain: (document) => User.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};

export const ServerMapper = {
  toDomain: (document) => Server.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};

export const ChannelMapper = {
  toDomain: (document) => Channel.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};

export const MemberMapper = {
  toDomain: (document) => Member.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};

export const MessageMapper = {
  toDomain: (document) => Message.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};

export const InvitationMapper = {
  toDomain: (document) => Invitation.fromPersistence(document),
  toPersistence: (entity) => entity.toPersistence(),
};
