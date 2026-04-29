import { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../auth/authConstants";
import { MdPersonAdd } from "react-icons/md";
import { AuthResponseError } from "../types/types";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [identification, setIdentification] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const goTo = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, identification, password }),
      });

      if (response.ok) {
        console.log("User created successfully");
        goTo("/login");
      } else {
        const json = (await response.json()) as AuthResponseError;
        setErrorResponse(json.body.error);
      }
    } catch (error) {
      console.log(error);
      setErrorResponse("Error al contactar el servidor");
    }
  }

  return (
    <DefaultLayout>
      <form onSubmit={handleSubmit} className="form">
        <h1>Crear Cuenta</h1>
        <p className="text-muted center" style={{marginTop: '-10px', marginBottom: '10px'}}>
          Regístrate para gestionar tus documentos personales y corporativos.
        </p>

        {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}

        <label>Tu Nombre Completo</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Identificación (Cédula o NIT)</label>
        <input 
          type="text" 
          value={identification} 
          onChange={(e) => setIdentification(e.target.value)} 
          required 
          placeholder="Ej: 12345678"
        />

        <label>Nombre de Usuario (para login)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary">
          <span>Registrarse</span>
          <MdPersonAdd />
        </button>
      </form>
    </DefaultLayout>
  );
}