const TOKEN_KEY = 'paroquia_token';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: { campo: string; mensagem: string }[];

  constructor(status: number, message: string, details?: { campo: string; mensagem: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

type ApiInit = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!init.skipAuth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    let details: { campo: string; mensagem: string }[] | undefined;
    try {
      const data: unknown = JSON.parse(text);
      if (isRecord(data) && typeof data.error === 'string') message = data.error;
      if (isRecord(data) && Array.isArray(data.details)) details = data.details;
    } catch {
      // corpo não-JSON: mantém a mensagem padrão
    }
    throw new ApiError(response.status, message, details);
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}