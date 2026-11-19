import { createAuthClient } from 'better-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  fetchOptions: {
    credentials: 'include',
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;