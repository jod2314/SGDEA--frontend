import { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../auth/authConstants";
import { MdPersonAdd } from "react-icons/lib/md";
import { AuthResponseError } from "../types/types";

export default function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [empresaName, setEmpresaName] = useState("");
  const [nit, setNit] = useState("");
  const [errorResponse, setErrorResponse] = useState("");

  const goTo = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, empresaName, nit }),
      });

      if (response.ok) {
        console.log("User created successfully");
        goTo("/"); // Redirect to login page after successful signup
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
        <h1>Crear Cuenta de Empresa</h1>
        <p className="text-muted center" style={{marginTop: '-10px', marginBottom: '10px'}}>El primer usuario será el Administrador.</p>
        {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}

        <label>Nombre de la Empresa</label>
        <input
          type="text"
          value={empresaName}
          onChange={(e) => setEmpresaName(e.target.value)}
          required
        />

        <label>NIT de la Empresa</label>
        <input type="text" value={nit} onChange={(e) => setNit(e.target.value)} required />

        <hr style={{width: '100%', border: '1px solid var(--bg-app)'}}/>

        <label>Tu Nombre Completo</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

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
          <span>Crear Cuenta</span>
          <MdPersonAdd />
        </button>
      </form>
    </DefaultLayout>
  );
}