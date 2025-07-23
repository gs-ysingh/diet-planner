import jwt from 'jsonwebtoken';

export interface AuthContext {
  user?: {
    id: string;
    email: string;
  };
}

export const createContext = ({ req }: { req: any }): AuthContext => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return {};
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      user: {
        id: decoded.userId,
        email: decoded.email
      }
    };
  } catch (error) {
    return {};
  }
};
