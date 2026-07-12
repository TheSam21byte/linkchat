import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { IVoicePresenceRepository } from "../../domain/ports/IVoicePresenceRepository.js";
import { db, isFirebaseConfigured } from "./firebase.client.js";

function ensureFirebase() {
  if (!isFirebaseConfigured() || !db) {
    throw new Error(
      "Firebase no está configurado. Revisa las variables VITE_FIREBASE_* en frontend/.env"
    );
  }
}

function getChannelsCollection(serverId) {
  return collection(db, "voiceServers", serverId, "channels");
}

function getParticipantsCollection(serverId, channelId) {
  return collection(db, "voiceServers", serverId, "channels", channelId, "participants");
}

function getSignalingCollection(serverId, channelId) {
  return collection(db, "voiceServers", serverId, "channels", channelId, "signaling");
}

export class FirebaseVoicePresenceRepository extends IVoicePresenceRepository {
  async createChannel({ serverId, name, user }) {
    ensureFirebase();

    const channelName = name.trim();
    if (channelName.length < 2) {
      throw new Error("El nombre del canal de voz debe tener al menos 2 caracteres");
    }

    const channelRef = await addDoc(getChannelsCollection(serverId), {
      name: channelName,
      serverId,
      createdAt: serverTimestamp(),
      createdBy: {
        userId: user.id,
        username: user.username,
        name: user.name ?? user.username,
      },
    });

    return { id: channelRef.id, name: channelName, serverId };
  }

  subscribeVoiceChannels(serverId, onChange, onError) {
    ensureFirebase();

    const channelsQuery = query(getChannelsCollection(serverId), orderBy("createdAt", "asc"));

    return onSnapshot(
      channelsQuery,
      (snapshot) => {
        onChange(
          snapshot.docs.map((channelDoc) => ({
            id: channelDoc.id,
            ...channelDoc.data(),
          }))
        );
      },
      onError
    );
  }

  async joinParticipant({ serverId, channelId, user }) {
    ensureFirebase();

    await setDoc(doc(getParticipantsCollection(serverId, channelId), String(user.id)), {
      userId: String(user.id),
      username: user.username,
      name: user.name ?? user.username,
      avatarUrl: user.avatarUrl ?? null,
      isMuted: false,
      isDeafened: false,
      isVideoEnabled: false,
      joinedAt: serverTimestamp(),
    });
  }

  async leaveParticipant({ serverId, channelId, userId }) {
    ensureFirebase();
    await deleteDoc(doc(getParticipantsCollection(serverId, channelId), String(userId)));
  }

  async updateParticipant({ serverId, channelId, userId, data }) {
    ensureFirebase();
    await setDoc(doc(getParticipantsCollection(serverId, channelId), String(userId)), data, {
      merge: true,
    });
  }

  subscribeVoiceParticipants({ serverId, channelId }, onChange, onError) {
    ensureFirebase();

    return onSnapshot(
      getParticipantsCollection(serverId, channelId),
      (snapshot) => {
        onChange(
          snapshot.docs.map((participantDoc) => ({
            id: participantDoc.id,
            ...participantDoc.data(),
          }))
        );
      },
      onError
    );
  }

  async sendSignal({ serverId, channelId, signal }) {
    ensureFirebase();
    await addDoc(getSignalingCollection(serverId, channelId), {
      ...signal,
      createdAt: serverTimestamp(),
    });
  }

  subscribeSignals({ serverId, channelId, userId }, onSignal, onError) {
    ensureFirebase();

    const incomingQuery = query(
      getSignalingCollection(serverId, channelId),
      where("toUserId", "==", String(userId))
    );

    return onSnapshot(
      incomingQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            onSignal({ id: change.doc.id, ...change.doc.data() });
          }
        });
      },
      onError
    );
  }

  async deleteSignal({ serverId, channelId, signalId }) {
    ensureFirebase();
    await deleteDoc(doc(getSignalingCollection(serverId, channelId), signalId));
  }
}
