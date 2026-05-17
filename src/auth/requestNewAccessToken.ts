import { AccessTokenResponse } from "../types/types";
import { API_URL } from "./authConstants";

export default async function requestNewAccessToken() {
  const response = await fetch(`${API_URL}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // No enviamos el body, el backend lo leerá de la cookie httpOnly
    credentials: 'include',
  });

  if (response.ok) {
    const json = (await response.json()) as AccessTokenResponse;

    if (json.error) {
      throw new Error(json.error);
    }
    return json.body.accessToken;
  } else {
    throw new Error("Unable to refresh access token.");
  }
}
