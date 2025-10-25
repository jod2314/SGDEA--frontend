import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import AppBar from "./AppBar";
import Drawer from "./Drawer";

interface PortalLayoutProps {
  children?: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const auth = useAuth();
  const [isDrawerOpen, setDrawerOpen] = useState(true); // Drawer is open by default

  async function handleSignOut() {
    try {
      const response = await fetch(`${API_URL}/signout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getRefreshToken()}`,
        },
      });
      if (response.ok) {
        auth.signout();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="app-layout">
      <Drawer isOpen={isDrawerOpen} onLogout={handleSignOut} />
      <div className="app-main-content">
        <AppBar onMenuClick={() => setDrawerOpen(!isDrawerOpen)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
