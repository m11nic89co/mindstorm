import type { GitHubUser } from './githubAuth';

import { fetchGitHubUser, getAccessToken, getCurrentUser, saveSession } from './githubAuth';

import type { JsonCanvas } from '../types/jsonCanvas';

import { parseCanvasFile } from './jsonCanvas';



export const GITHUB_OWNER = 'm11nic89co';

export const GITHUB_REPO = 'mindshtorm';

export const GITHUB_CANVASES_DIR = 'canvases';

export const GITHUB_MANIFEST_FILE = 'boards-manifest.json';

export const GITHUB_ACTIVE_BOARD_KEY = 'mindshtorm.github.activeBoard';



export type GitHubBoardMeta = {

  name: string;

  path: string;

  sha: string;

  size: number;

  updatedAt?: string;

  updatedBy?: string;

  updatedByName?: string;

};



export type ActiveBoard = {

  name: string;

  sha: string;

};



export type BoardsManifest = {

  version: 1;

  boards: Record<

    string,

    {

      updatedAt: string;

      updatedBy: string;

      updatedByName?: string;

    }

  >;

};



function emptyManifest(): BoardsManifest {

  return { version: 1, boards: {} };

}



function toBase64(text: string): string {

  const bytes = new TextEncoder().encode(text);

  let binary = '';

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary);

}



function fromBase64(base64: string): string {

  const binary = atob(base64.replace(/\n/g, ''));

  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  return new TextDecoder().decode(bytes);

}



export function getActiveBoard(): ActiveBoard | null {

  try {

    const raw = localStorage.getItem(GITHUB_ACTIVE_BOARD_KEY);

    return raw ? (JSON.parse(raw) as ActiveBoard) : null;

  } catch {

    return null;

  }

}



export function setActiveBoard(board: ActiveBoard | null) {

  if (board) {

    localStorage.setItem(GITHUB_ACTIVE_BOARD_KEY, JSON.stringify(board));

  } else {

    localStorage.removeItem(GITHUB_ACTIVE_BOARD_KEY);

  }

}



export function requireWriteAccess(): string {

  const token = getAccessToken();

  if (!token) {

    throw new Error('AUTH_REQUIRED');

  }

  return token;

}



async function resolveEditor(): Promise<GitHubUser> {

  const cached = getCurrentUser();

  if (cached) return cached;



  const token = getAccessToken();

  if (!token) throw new Error('AUTH_REQUIRED');



  const user = await fetchGitHubUser(token);

  saveSession({

    accessToken: token,

    user,

    scope: 'legacy',

    savedAt: new Date().toISOString(),

  });

  return user;

}



function formatGitHubError(status: number, message: string): string {

  if (status === 401) return 'Сессия GitHub истекла. Войдите снова.';

  if (status === 403) {

    return (

      `Нет прав на запись в ${GITHUB_OWNER}/${GITHUB_REPO}. ` +

      'Попросите владельца добавить ваш GitHub-аккаунт в Collaborators репозитория.'

    );

  }

  if (status === 409) {

    return 'Схему уже изменил другой участник. Обновите список и сохраните снова.';

  }

  return message;

}



async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {

  const token = getAccessToken();

  const headers: Record<string, string> = {

    Accept: 'application/vnd.github+json',

    'X-GitHub-Api-Version': '2022-11-28',

  };

  if (token) headers.Authorization = `Bearer ${token}`;

  if (init?.headers) {

    Object.assign(headers, init.headers as Record<string, string>);

  }



  const response = await fetch(`https://api.github.com${path}`, { ...init, headers });

  if (!response.ok) {

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    const message = payload?.message ?? `GitHub: ошибка ${response.status}`;

    throw new Error(formatGitHubError(response.status, message));

  }

  return response.json() as Promise<T>;

}



type GitHubContentFile = {

  type: 'file';

  name: string;

  path: string;

  sha: string;

  size: number;

};



type GitHubContentResponse = GitHubContentFile | GitHubContentFile[];



async function loadManifest(): Promise<{ manifest: BoardsManifest; sha?: string }> {

  const path = `${GITHUB_CANVASES_DIR}/${GITHUB_MANIFEST_FILE}`;

  try {

    const data = await githubRequest<{ content: string; sha: string }>(

      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,

    );

    return {

      manifest: JSON.parse(fromBase64(data.content)) as BoardsManifest,

      sha: data.sha,

    };

  } catch (error) {

    if (error instanceof Error && /404|not found/i.test(error.message)) {

      return { manifest: emptyManifest() };

    }

    throw error;

  }

}



async function saveManifest(manifest: BoardsManifest, sha: string | undefined, editor: GitHubUser) {

  const path = `${GITHUB_CANVASES_DIR}/${GITHUB_MANIFEST_FILE}`;

  const body = {

    message: `Update boards manifest (@${editor.login})`,

    content: toBase64(JSON.stringify(manifest, null, 2)),

    ...(sha ? { sha } : {}),

  };



  await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {

    method: 'PUT',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify(body),

  });

}



function attachManifestMeta(

  boards: GitHubBoardMeta[],

  manifest: BoardsManifest,

): GitHubBoardMeta[] {

  return boards.map((board) => {

    const entry = manifest.boards[board.name];

    if (!entry) return board;

    return {

      ...board,

      updatedAt: entry.updatedAt,

      updatedBy: entry.updatedBy,

      updatedByName: entry.updatedByName,

    };

  });

}



export async function listGitHubBoards(): Promise<GitHubBoardMeta[]> {

  const [{ manifest }, data] = await Promise.all([

    loadManifest(),

    githubRequest<GitHubContentResponse>(

      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CANVASES_DIR}`,

    ).catch((error) => {

      if (error instanceof Error && /404|not found/i.test(error.message)) return [] as GitHubContentFile[];

      throw error;

    }),

  ]);



  if (!Array.isArray(data)) return [];



  const boards = data

    .filter(

      (file) =>

        file.type === 'file' &&

        file.name.endsWith('.canvas') &&

        file.name !== GITHUB_MANIFEST_FILE,

    )

    .map((file) => ({

      name: file.name.replace(/\.canvas$/i, ''),

      path: file.path,

      sha: file.sha,

      size: file.size,

    }))

    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));



  return attachManifestMeta(boards, manifest);

}



export async function loadGitHubBoard(meta: GitHubBoardMeta): Promise<JsonCanvas> {

  const data = await githubRequest<{ content: string }>(

    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${meta.path}`,

  );

  const canvas = parseCanvasFile(fromBase64(data.content));

  setActiveBoard({ name: meta.name, sha: meta.sha });

  return canvas;

}



export async function saveGitHubBoard(name: string, canvas: JsonCanvas): Promise<GitHubBoardMeta> {

  requireWriteAccess();

  const editor = await resolveEditor();



  const safeName = name.trim().replace(/[\\/:*?"<>|]/g, '-');

  if (!safeName) throw new Error('Введите название схемы');



  const filename = `${safeName}.canvas`;

  const path = `${GITHUB_CANVASES_DIR}/${filename}`;

  const active = getActiveBoard();

  let sha: string | undefined;



  if (active?.name === safeName) {

    sha = active.sha;

  } else {

    const existing = (await listGitHubBoards()).find((b) => b.name === safeName);

    sha = existing?.sha;

  }



  const body = {

    message: sha

      ? `Update canvas: ${filename} (@${editor.login})`

      : `Add canvas: ${filename} (@${editor.login})`,

    content: toBase64(JSON.stringify(canvas, null, 2)),

    ...(sha ? { sha } : {}),

  };



  const result = await githubRequest<{ content: GitHubContentFile }>(

    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,

    {

      method: 'PUT',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    },

  );



  const saved: GitHubBoardMeta = {

    name: safeName,

    path: result.content.path,

    sha: result.content.sha,

    size: result.content.size,

    updatedAt: new Date().toISOString(),

    updatedBy: editor.login,

    updatedByName: editor.name ?? editor.login,

  };



  try {

    const { manifest, sha: manifestSha } = await loadManifest();

    manifest.boards[safeName] = {

      updatedAt: saved.updatedAt!,

      updatedBy: editor.login,

      updatedByName: editor.name ?? undefined,

    };

    await saveManifest(manifest, manifestSha, editor);

  } catch {

    /* manifest — дополнение; схема уже сохранена */

  }



  setActiveBoard({ name: saved.name, sha: saved.sha });

  return saved;

}



export async function deleteGitHubBoard(meta: GitHubBoardMeta): Promise<void> {

  requireWriteAccess();

  const editor = await resolveEditor();



  await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${meta.path}`, {

    method: 'DELETE',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({

      message: `Delete canvas: ${meta.name}.canvas (@${editor.login})`,

      sha: meta.sha,

    }),

  });



  try {

    const { manifest, sha: manifestSha } = await loadManifest();

    delete manifest.boards[meta.name];

    await saveManifest(manifest, manifestSha, editor);

  } catch {

    /* ignore */

  }



  const active = getActiveBoard();

  if (active?.sha === meta.sha) setActiveBoard(null);

}



export function formatBoardTimestamp(iso?: string): string {

  if (!iso) return '';

  try {

    return new Intl.DateTimeFormat('ru-RU', {

      dateStyle: 'short',

      timeStyle: 'short',

    }).format(new Date(iso));

  } catch {

    return iso;

  }

}



export function sharedRepoLabel(): string {

  return `${GITHUB_OWNER}/${GITHUB_REPO}`;

}


