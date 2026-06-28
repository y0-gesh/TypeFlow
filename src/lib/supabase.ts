import { createClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Local Storage keys for Mock Auth
const MOCK_USERS_KEY = 'typeflow_mock_users';
const MOCK_SESSION_KEY = 'typeflow_mock_session';

interface MockUserData extends User {
  password?: string;
}

// Helper to get mock data from localStorage
const getMockUsers = (): MockUserData[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveMockUsers = (users: MockUserData[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getMockSession = (): Session | null => {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(MOCK_SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

const saveMockSession = (session: Session | null) => {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
};

type AuthListener = (event: string, session: Session | null) => void;

// Create a listener queue for auth state changes in mock mode
const authStateListeners = new Set<AuthListener>();

const triggerAuthStateChange = (event: string, session: Session | null) => {
  authStateListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.error('Error in auth state listener:', e);
    }
  });
};

// Mock Supabase Client implementation
const mockSupabase = {
  auth: {
    signUp: async ({ email, password, options = {} }: any) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const users = getMockUsers();
      if (users.some((u) => u.email === email)) {
        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
      }

      const newUser: MockUserData = {
        id: `mock-user-${Math.random().toString(36).substring(2, 11)}`,
        email: email || '',
        created_at: new Date().toISOString(),
        user_metadata: options.data || {},
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
        password // local mock password check
      };

      users.push(newUser);
      saveMockUsers(users);

      // Safe user object to return (no password)
      const { password: _, ...userSafe } = newUser;

      const session: Session = {
        access_token: `mock-token-${Math.random().toString(36).substring(2, 11)}`,
        refresh_token: `mock-refresh-${Math.random().toString(36).substring(2, 11)}`,
        user: userSafe as User,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer'
      };

      saveMockSession(session);
      triggerAuthStateChange('SIGNED_IN', session);

      return { data: { user: userSafe as User, session }, error: null };
    },

    signInWithPassword: async ({ email, password }: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const users = getMockUsers();
      const user = users.find((u) => u.email === email && u.password === password);

      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }

      // Remove password from user object before returning
      const { password: _, ...userSafe } = user;

      const session: Session = {
        access_token: `mock-token-${Math.random().toString(36).substring(2, 11)}`,
        refresh_token: `mock-refresh-${Math.random().toString(36).substring(2, 11)}`,
        user: userSafe as User,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer'
      };

      saveMockSession(session);
      triggerAuthStateChange('SIGNED_IN', session);

      return { data: { user: userSafe as User, session }, error: null };
    },

    signOut: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveMockSession(null);
      triggerAuthStateChange('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const session = getMockSession();
      return { data: { session }, error: null };
    },

    getUser: async () => {
      const session = getMockSession();
      return { data: { user: session ? session.user : null }, error: null };
    },

    resetPasswordForEmail: async (email: string, { redirectTo }: any = {}) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const user = users.find((u) => u.email === email);
      if (!user) {
        return { data: null, error: { message: 'Email address not found' } };
      }
      console.log(`[Mock Auth] Password reset link sent to ${email} redirecting to ${redirectTo}`);
      return { data: {}, error: null };
    },

    updateUser: async ({ password }: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const session = getMockSession();
      if (!session || !session.user) {
        return { data: { user: null }, error: { message: 'Not authenticated' } };
      }

      const users = getMockUsers();
      const userIdx = users.findIndex((u) => u.id === session.user.id);
      
      if (userIdx === -1) {
        return { data: { user: null }, error: { message: 'User not found' } };
      }

      users[userIdx].password = password;
      saveMockUsers(users);

      return { data: { user: session.user }, error: null };
    },

    onAuthStateChange: (callback: any) => {
      authStateListeners.add(callback);
      
      const session = getMockSession();
      // Trigger initial callback asynchronously
      setTimeout(() => {
        callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authStateListeners.delete(callback);
            },
          },
        },
      };
    },
  },
};

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl || '', supabaseAnonKey || '')
  : mockSupabase;

export const isMockAuth = !isSupabaseConfigured;

if (isMockAuth) {
  console.warn('Supabase URL/Key missing. TypeFlow is running in Mock Auth local fallback mode.');
}
