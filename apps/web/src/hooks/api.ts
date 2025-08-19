// Lightweight API client with error handling and auth support
export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function getBaseUrl(): string {
  // Prefer Vite env var, fall back to standard and global override
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeEnv = (typeof process !== 'undefined' ? (process as any).env?.API_URL : undefined) as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalOverride = (typeof window !== 'undefined' ? (window as any).__API_URL : undefined) as string | undefined;
  return viteEnv || nodeEnv || globalOverride || 'http://localhost:4000';
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  // Attach JWT if present
  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage access errors
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json().catch(() => undefined) : await response.text().catch(() => undefined);

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: (data && (data.message || data.error)) || response.statusText || 'Unbekannter Fehler',
      details: data,
    };
    throw error;
  }

  return data as T;
}

// Convenience helpers
export const api = {
  get: <T = unknown>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
  put: <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: 'DELETE' }),
};