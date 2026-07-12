export class IMemberRepository {
  async getMyServers() {
    throw new Error("IMemberRepository.getMyServers no implementado.");
  }

  async joinServer(_serverId) {
    throw new Error("IMemberRepository.joinServer no implementado.");
  }

  async getServerMembers(_serverId) {
    throw new Error("IMemberRepository.getServerMembers no implementado.");
  }
}
