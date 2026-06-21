declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        roles: string[];
      };
    }
  }
}

export {};
