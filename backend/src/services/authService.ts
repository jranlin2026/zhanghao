import { authenticateLocalUser, getLocalUserProfile } from './devData';

export const authService = {
  async login(name: string, password: string) {
    return authenticateLocalUser(name, password);
  },

  async getProfile(userId: number) {
    return getLocalUserProfile(userId);
  },
};
