import { API_URL } from "../auth/authConstants";

interface RequestOptions extends RequestInit {
  accessToken?: string;
  empresaId?: string;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { accessToken, empresaId, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  
  if (!headers.has("Content-Type")) {
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
    credentials: "include", // Asegura que las cookies se envíen/reciban en todas las peticiones
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.body?.error || response.statusText,
    };
  }

  return response.json();
}
