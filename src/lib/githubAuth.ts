export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
};

export type GitHubSession = {
  accessToken: string;
  user: GitHubUser;
  scope: string;
  savedAt: string;
};

export type DeviceFlowStart = {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  interval: number;
  expiresIn: number;
};

const SESSION_KEY = 'mindshtorm.github.session';
/** @deprecated PAT — только для обратной совместимости */
const LEGACY_TOKEN_KEY = 'mindshtorm.github.token';

/** public_repo — запись в публичные репо; read:user — профиль в UI */
export const GITHUB_OAUTH_SCOPES = 'public_repo read:user';

export function getGitHubClientId(): string {
  return (import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined)?.trim() ?? '';
}

export function isOAuthConfigured(): boolean {
  return getGitHubClientId().length > 0;
}

export function loadSession(): GitHubSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as GitHubSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: GitHubSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  const session = loadSession();
  if (session?.accessToken) return session.accessToken;
  return localStorage.getItem(LEGACY_TOKEN_KEY)?.trim() || null;
}

export function getCurrentUser(): GitHubUser | null {
  return loadSession()?.user ?? null;
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) {
    throw new Error('Сессия GitHub недействительна. Войдите снова.');
  }
  const data = (await response.json()) as GitHubUser;
  return {
    login: data.login,
    name: data.name,
    avatar_url: data.avatar_url,
  };
}

export async function startDeviceFlow(): Promise<DeviceFlowStart> {
  const clientId = getGitHubClientId();
  if (!clientId) {
    throw new Error('OAuth не настроен. Добавьте VITE_GITHUB_CLIENT_ID (см. README).');
  }

  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      scope: GITHUB_OAUTH_SCOPES,
    }),
  });

  const payload = (await response.json()) as {
    device_code?: string;
    user_code?: string;
    verification_uri?: string;
    interval?: number;
    expires_in?: number;
    error_description?: string;
    message?: string;
  };

  if (!response.ok || !payload.device_code || !payload.user_code || !payload.verification_uri) {
    throw new Error(payload.error_description ?? payload.message ?? 'Не удалось начать вход через GitHub');
  }

  return {
    deviceCode: payload.device_code,
    userCode: payload.user_code,
    verificationUri: payload.verification_uri,
    interval: payload.interval ?? 5,
    expiresIn: payload.expires_in ?? 900,
  };
}

export async function pollDeviceFlowToken(
  deviceCode: string,
  intervalSec: number,
  signal?: AbortSignal,
): Promise<string> {
  const clientId = getGitHubClientId();
  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

  while (!signal?.aborted) {
    await wait(intervalSec * 1000);

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
      signal,
    });

    const payload = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (payload.access_token) return payload.access_token;

    if (payload.error === 'authorization_pending') continue;
    if (payload.error === 'slow_down') {
      intervalSec += 5;
      continue;
    }
    if (payload.error === 'expired_token') {
      throw new Error('Время входа истекло. Начните заново.');
    }
    if (payload.error === 'access_denied') {
      throw new Error('Доступ к GitHub не был разрешён.');
    }

    throw new Error(payload.error_description ?? payload.error ?? 'Ошибка авторизации GitHub');
  }

  throw new DOMException('Aborted', 'AbortError');
}

export async function completeDeviceLogin(
  deviceCode: string,
  intervalSec: number,
  signal?: AbortSignal,
): Promise<GitHubSession> {
  const accessToken = await pollDeviceFlowToken(deviceCode, intervalSec, signal);
  const user = await fetchGitHubUser(accessToken);
  const session: GitHubSession = {
    accessToken,
    user,
    scope: GITHUB_OAUTH_SCOPES,
    savedAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}

export async function restoreSession(): Promise<GitHubSession | null> {
  const session = loadSession();
  if (!session?.accessToken) return null;

  try {
    const user = await fetchGitHubUser(session.accessToken);
    const fresh = { ...session, user };
    saveSession(fresh);
    return fresh;
  } catch {
    clearSession();
    return null;
  }
}
