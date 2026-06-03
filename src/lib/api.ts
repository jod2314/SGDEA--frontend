import { API_URL } from "../auth/authConstants";

interface RequestOptions extends RequestInit {
  accessToken?: string;
  empresaId?: string;
  responseType?: 'json' | 'blob' | 'text';
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { accessToken, empresaId, responseType = 'json', ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  
  if (fetchOptions.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (empresaId) {
    headers.set("X-Empresa-ID", empresaId);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.body?.error || response.statusText,
    };
  }

  if (responseType === 'blob') {
    return response.blob();
  }
  if (responseType === 'text') {
    return response.text();
  }
  return response.json();
}
