import { authenticateLocalUser } from './devData';

export const authService = {
  async login(name: string, password: string) {
    return authenticateLocalUser(name, password);
  },

  async getProfile(userId: number) {
    if (userId !== 1) {
      throw new Error('用户不存在');
    }
    return (await authenticateLocalUser('admin', 'admin123')).user;
  },
};
