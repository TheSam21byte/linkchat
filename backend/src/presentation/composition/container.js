import {
  MongooseUserRepository,
  MongooseServerRepository,
  MongooseChannelRepository,
  MongooseMemberRepository,
  MongooseMessageRepository,
  MongooseInvitationRepository,
  MongooseChimeMeetingRepository,
  MongoObjectIdGenerator,
  JwtTokenService,
  BcryptPasswordHasher,
  CryptoInvitationCodeGenerator,
  S3AvatarStorageService,
  ChimeVoiceService,
  LambdaVoiceAdapter,
} from "../../infrastructure/index.js";
import { RegisterUserUseCase } from "../../application/use-cases/auth/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../application/use-cases/auth/LoginUserUseCase.js";
import { ValidateSessionUseCase } from "../../application/use-cases/auth/ValidateSessionUseCase.js";
import { JoinChimeMeetingUseCase } from "../../application/use-cases/voice/JoinChimeMeetingUseCase.js";
import {
  CreateServerUseCase,
  GetServerByIdUseCase,
  GetServersUseCase,
  UpdateServerUseCase,
  DeleteServerUseCase,
} from "../../application/use-cases/server/ServerUseCases.js";
import {
  CreateChannelUseCase,
  GetChannelByIdUseCase,
  GetChannelsByServerUseCase,
  UpdateChannelUseCase,
  DeleteChannelUseCase,
} from "../../application/use-cases/channel/ChannelUseCases.js";
import {
  GetMembersByServerUseCase,
  GetMyServersUseCase,
  GetServersByUserUseCase,
  JoinServerUseCase,
  KickMemberUseCase,
  UpdateMemberRoleUseCase,
} from "../../application/use-cases/member/MemberUseCases.js";
import {
  GetMessagesByChannelUseCase,
  SendMessageUseCase,
  DeleteMessageUseCase,
} from "../../application/use-cases/message/MessageUseCases.js";
import {
  GetUsersUseCase,
  StartGuestUserUseCase,
  UpdateUserProfileUseCase,
} from "../../application/use-cases/user/UserUseCases.js";
import {
  CreateInvitationUseCase,
  DisableInvitationUseCase,
  GetInvitationByCodeUseCase,
  GetInvitationsUseCase,
  JoinByInvitationUseCase,
} from "../../application/use-cases/invitation/InvitationUseCases.js";

const userRepository = new MongooseUserRepository();
const serverRepository = new MongooseServerRepository();
const channelRepository = new MongooseChannelRepository();
const memberRepository = new MongooseMemberRepository();
const messageRepository = new MongooseMessageRepository();
const invitationRepository = new MongooseInvitationRepository();
const chimeMeetingRepository = new MongooseChimeMeetingRepository();
const tokenService = new JwtTokenService();
const avatarStorage = new S3AvatarStorageService();
const lambdaVoiceAdapter = new LambdaVoiceAdapter();
const voiceService = new ChimeVoiceService(lambdaVoiceAdapter, chimeMeetingRepository);
const passwordHasher = new BcryptPasswordHasher();
const idGenerator = new MongoObjectIdGenerator();
const invitationCodeGenerator = new CryptoInvitationCodeGenerator();

export const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  avatarStorage,
  passwordHasher,
  idGenerator
);
export const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  tokenService,
  passwordHasher
);
export const validateSessionUseCase = new ValidateSessionUseCase(
  userRepository,
  tokenService
);
export const joinChimeMeetingUseCase = new JoinChimeMeetingUseCase(voiceService);

export const createServerUseCase = new CreateServerUseCase(
  userRepository,
  serverRepository,
  memberRepository,
  channelRepository,
  idGenerator
);
export const getServersUseCase = new GetServersUseCase(serverRepository);
export const getServerByIdUseCase = new GetServerByIdUseCase(serverRepository);
export const updateServerUseCase = new UpdateServerUseCase(serverRepository);
export const deleteServerUseCase = new DeleteServerUseCase(serverRepository);

export const createChannelUseCase = new CreateChannelUseCase(
  serverRepository,
  channelRepository
);
export const getChannelsByServerUseCase = new GetChannelsByServerUseCase(channelRepository);
export const getChannelByIdUseCase = new GetChannelByIdUseCase(channelRepository);
export const updateChannelUseCase = new UpdateChannelUseCase(channelRepository);
export const deleteChannelUseCase = new DeleteChannelUseCase(
  channelRepository,
  messageRepository
);

export const getMembersByServerUseCase = new GetMembersByServerUseCase(memberRepository);
export const getServersByUserUseCase = new GetServersByUserUseCase(memberRepository);
export const getMyServersUseCase = new GetMyServersUseCase(memberRepository);
export const joinServerUseCase = new JoinServerUseCase(serverRepository, memberRepository);
export const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(memberRepository);
export const kickMemberUseCase = new KickMemberUseCase(memberRepository);

export const getMessagesByChannelUseCase = new GetMessagesByChannelUseCase(messageRepository);
export const sendMessageUseCase = new SendMessageUseCase(messageRepository);
export const deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);

export const startGuestUserUseCase = new StartGuestUserUseCase(userRepository);
export const getUsersUseCase = new GetUsersUseCase(userRepository);
export const updateUserProfileUseCase = new UpdateUserProfileUseCase(
  userRepository,
  avatarStorage
);

export const createInvitationUseCase = new CreateInvitationUseCase(
  serverRepository,
  invitationRepository,
  invitationCodeGenerator
);
export const getInvitationsUseCase = new GetInvitationsUseCase(invitationRepository);
export const getInvitationByCodeUseCase = new GetInvitationByCodeUseCase(invitationRepository);
export const joinByInvitationUseCase = new JoinByInvitationUseCase(
  invitationRepository,
  memberRepository
);
export const disableInvitationUseCase = new DisableInvitationUseCase(invitationRepository);
