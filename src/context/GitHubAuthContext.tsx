import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  isOAuthConfigured,
  loadSession,
  restoreSession,
  type GitHubSession,
} from '../lib/githubAuth';

type GitHubAuthContextValue = {
  session: GitHubSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  oauthConfigured: boolean;
  logout: () => void;
  setSession: (session: GitHubSession | null) => void;
  refreshSession: () => Promise<void>;
};

const GitHubAuthContext = createContext<GitHubAuthContextValue | null>(null);

export function GitHubAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<GitHubSession | null>(() => loadSession());
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const restored = await restoreSession();
      setSessionState(restored);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const setSession = useCallback((next: GitHubSession | null) => {
    setSessionState(next);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      oauthConfigured: isOAuthConfigured(),
      logout,
      setSession,
      refreshSession,
    }),
    [session, isLoading, logout, setSession, refreshSession],
  );

  return <GitHubAuthContext.Provider value={value}>{children}</GitHubAuthContext.Provider>;
}

export function useGitHubAuth() {
  const ctx = useContext(GitHubAuthContext);
  if (!ctx) throw new Error('useGitHubAuth must be used within GitHubAuthProvider');
  return ctx;
}
