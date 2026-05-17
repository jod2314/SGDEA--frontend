import { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { AuthResponse, AuthResponseError } from "../types/types";
import { API_URL } from "../auth/authConstants";
import * as IconsMd from "react-icons/md";

const MdLogin = IconsMd.MdLogin as any;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const auth = useAuth();

  function handleChange(e: React.ChangeEvent) {
    const { name, value } = e.target as HTMLInputElement;
    if (name === "username") {
      setUsername(value);
    }
    if (name === "password") {
      setPassword(value);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // IMPORTANTE: Para recibir y guardar la cookie httpOnly
      });
      if (response.ok) {
        const json = (await response.json()) as AuthResponse;
        console.log(json);

        // Ya no verificamos json.body.refreshToken porque ahora viene en una cookie segura
        if (json.body.accessToken) {
          auth.saveUser(json);
        }
      } else {
        const json = (await response.json()) as AuthResponseError;

        setErrorResponse(json.body.error);
      }
    } catch (error) {
      console.log(error);
      setErrorResponse("Error de conexión con el servidor");
    }
  }
  if (auth.isAuthenticated) {
    return <Navigate to="/select-empresa" />;
  }
  return (
    <DefaultLayout>
      <form onSubmit={handleSubmit} className="form">
        <h1>Login</h1>
        {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}
        <label>Username</label>
        <input
          name="username"
          type="text"
          onChange={handleChange}
          value={username}
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          onChange={handleChange}
          value={password}
        />

        <button className="btn btn-primary">
          <span>Login</span>
          <MdLogin />
        </button>
      </form>
    </DefaultLayout>
  );
}
