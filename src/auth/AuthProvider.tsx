import { useContext, createContext, useState, useEffect } from "react";
import type { AuthResponse, User, Empresa } from "../types/types";
import requestNewAccessToken from "./requestNewAccessToken";
import { API_URL } from "./authConstants";

import { apiFetch } from "../lib/api";

const AuthContext = createContext({
  isAuthenticated: false,
  getAccessToken: () => "" as string,
  setAccessTokenAndRefreshToken: (
    _accessToken: string,
    _refreshToken: string
  ) => {},
  getRefreshToken: () => null as string | null,
  saveUser: (_userData: AuthResponse) => {},
  getUser: () => ({} as User | undefined),
  signout: () => {},
  setSelectedEmpresa: (_empresa: Empresa) => {},
  getSelectedEmpresa: () => ({} as Empresa | undefined),
  request: async function <T>(endpoint: string, options?: any): Promise<T> {
    console.log(endpoint, options);
    return {} as T;
  },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | undefined>();
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresaState] = useState<Empresa | undefined>();

  function getAccessToken() {
    return accessToken;
  }

  function saveUser(userData: AuthResponse) {
    setAccessToken(userData.body.accessToken);
    setUser(userData.body.user);
    setIsAuthenticated(true);

    // INICIALIZACIÓN DE CONTEXTO (Espacio Personal)
    fetch(`${API_URL}/empresas/inicializar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userData.body.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.body && json.body.personalSpace) {
          setSelectedEmpresa(json.body.personalSpace);
        }
      })
      .catch((err) => console.error("Error inicializando:", err));
  }

  function setSelectedEmpresa(empresa: Empresa) {
    setSelectedEmpresaState(empresa);
    localStorage.setItem("selectedEmpresa", JSON.stringify(empresa));
  }

  function getSelectedEmpresa(): Empresa | undefined {
    return selectedEmpresa;
  }

  function setAccessTokenAndRefreshToken(
    accessToken: string,
    _refreshToken: string
  ) {
    setAccessToken(accessToken);
  }

  function getRefreshToken() {
    // El refresh token ahora vive en una cookie httpOnly
    return null;
  }

  async function getNewAccessToken() {
    const token = await requestNewAccessToken();
    if (token) {
      return token;
    }
  }

  function getUser(): User | undefined {
    return user;
  }

  function signout() {
    // Llamar al backend para limpiar la cookie
    apiFetch('/signout', { method: 'DELETE', credentials: 'include' })
      .finally(() => {
        localStorage.removeItem("selectedEmpresa");
        setAccessToken("");
        setUser(undefined);
        setSelectedEmpresaState(undefined);
        setIsAuthenticated(false);
      });
  }

  async function checkAuth() {
    try {
      const storedEmpresa = localStorage.getItem("selectedEmpresa");
      if (storedEmpresa) {
        setSelectedEmpresaState(JSON.parse(storedEmpresa));
      }

      if (!!accessToken) {
        const userInfo = await retrieveUserInfo(accessToken);
        setUser(userInfo);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        // Intentar refrescar usando la cookie httpOnly (si existe)
        getNewAccessToken()
          .then(async (newToken) => {
            const userInfo = await retrieveUserInfo(newToken!);
            setUser(userInfo);
            setAccessToken(newToken!);
            setIsAuthenticated(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function request<T>(endpoint: string, options: any = {}): Promise<T> {
    const token = getAccessToken();
    const empresa = getSelectedEmpresa();
    
    return apiFetch(endpoint, {
      ...options,
      accessToken: token,
      empresaId: empresa?.id,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        getAccessToken,
        setAccessTokenAndRefreshToken,
        getRefreshToken,
        saveUser,
        getUser,
        signout,
        setSelectedEmpresa,
        getSelectedEmpresa,
        request,
      }}
    >
      {isloading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

async function retrieveUserInfo(accessToken: string) {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json);
      return json.body;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export const useAuth = () => useContext(AuthContext);
