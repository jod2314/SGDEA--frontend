export interface AuthResponse {
  body: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
export interface AuthResponseError {
  body: {
    error: string;
  };
}

export interface User {
  id: string;
  name: string;
  username: string;
}

export interface Empresa {
  id: string;
  name: string;
  nit: string;
  logo?: string;
  isPersonal: boolean;
  rol: string;
  estado: string;
}

export interface AccessTokenResponse {
  statusCode: number;
  body: {
    accessToken: string;
  };
  error?: string;
}
