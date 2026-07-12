import { HttpClient } from "../../infrastructure/http/HttpClient.js";
import { LocalAuthTokenStorage } from "../../infrastructure/storage/LocalAuthTokenStorage.js";
import { LocalCurrentUserStorage } from "../../infrastructure/storage/LocalCurrentUserStorage.js";
import { AuthApiRepository } from "../../infrastructure/http/repositories/AuthApiRepository.js";
import { UserApiRepository } from "../../infrastructure/http/repositories/UserApiRepository.js";
import { ServerApiRepository } from "../../infrastructure/http/repositories/ServerApiRepository.js";
import { MemberApiRepository } from "../../infrastructure/http/repositories/MemberApiRepository.js";
import { InvitationApiRepository } from "../../infrastructure/http/repositories/InvitationApiRepository.js";
import { ChannelApiRepository } from "../../infrastructure/http/repositories/ChannelApiRepository.js";
import { MessageApiRepository } from "../../infrastructure/http/repositories/MessageApiRepository.js";
import { ChimeMeetingApiRepository } from "../../infrastructure/http/repositories/ChimeMeetingApiRepository.js";
import { FirebaseVoicePresenceRepository } from "../../infrastructure/firebase/FirebaseVoicePresenceRepository.js";
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  SaveAuthSessionUseCase,
  ClearAuthSessionUseCase,
  GetStoredSessionUseCase,
  UpdateProfileUseCase,
  StartGuestUserUseCase,
  GetServersUseCase,
  GetServerByIdUseCase,
  GetMyServersUseCase,
  JoinServerUseCase,
  GetServerMembersUseCase,
  GetInvitationByCodeUseCase,
  JoinInvitationUseCase,
  ResolveInvitationUseCase,
  GetServerChannelsUseCase,
  GetChannelMessagesUseCase,
  CreateVoiceChannelUseCase,
  BuildVoiceMeetingIdUseCase,
} from "../../application/use-cases/index.js";

const tokenStorage = new LocalAuthTokenStorage();
const userStorage = new LocalCurrentUserStorage();
const httpClient = new HttpClient(tokenStorage);

const authRepository = new AuthApiRepository(httpClient);
const userRepository = new UserApiRepository(httpClient);
const serverRepository = new ServerApiRepository(httpClient);
const memberRepository = new MemberApiRepository(httpClient);
const invitationRepository = new InvitationApiRepository(httpClient);
const channelRepository = new ChannelApiRepository(httpClient);
const messageRepository = new MessageApiRepository(httpClient);
const voiceMeetingRepository = new ChimeMeetingApiRepository(httpClient);
const voicePresenceRepository = new FirebaseVoicePresenceRepository();

export const registerUserUseCase = new RegisterUserUseCase(authRepository);
export const loginUserUseCase = new LoginUserUseCase(authRepository);
export const saveAuthSessionUseCase = new SaveAuthSessionUseCase(tokenStorage, userStorage);
export const clearAuthSessionUseCase = new ClearAuthSessionUseCase(tokenStorage, userStorage);
export const getStoredSessionUseCase = new GetStoredSessionUseCase(userStorage);
export const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
export const startGuestUserUseCase = new StartGuestUserUseCase(userRepository);
export const getServersUseCase = new GetServersUseCase(serverRepository);
export const getServerByIdUseCase = new GetServerByIdUseCase(serverRepository);
export const getMyServersUseCase = new GetMyServersUseCase(memberRepository);
export const joinServerUseCase = new JoinServerUseCase(memberRepository);
export const getServerMembersUseCase = new GetServerMembersUseCase(memberRepository);
export const getInvitationByCodeUseCase = new GetInvitationByCodeUseCase(invitationRepository);
export const joinInvitationUseCase = new JoinInvitationUseCase(invitationRepository);
export const resolveInvitationUseCase = new ResolveInvitationUseCase(
  invitationRepository,
  serverRepository
);
export const getServerChannelsUseCase = new GetServerChannelsUseCase(channelRepository);
export const getChannelMessagesUseCase = new GetChannelMessagesUseCase(messageRepository);
export const createVoiceChannelUseCase = new CreateVoiceChannelUseCase(voicePresenceRepository);
export const buildVoiceMeetingIdUseCase = new BuildVoiceMeetingIdUseCase();

export { voiceMeetingRepository, voicePresenceRepository, tokenStorage, userStorage };
