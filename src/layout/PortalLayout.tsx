import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import AppBar from "./AppBar";
import Drawer from "./Drawer";

interface PortalLayoutProps {
  children?: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const auth = useAuth();
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem("drawerPinned");
    return saved !== "false"; // Activo por defecto
  });

  async function handleSignOut() {
    try {
      await auth.request<any>("/signout", {
        method: "DELETE"
      });
      auth.signout();
    } catch (error) {
      console.log(error);
      auth.signout();
    }
  }

  const togglePin = () => {
    const nextVal = !isPinned;
    setIsPinned(nextVal);
    localStorage.setItem("drawerPinned", String(nextVal));
  };

  return (
    <div className={`app-layout ${isPinned ? "drawer-pinned" : "drawer-unpinned"}`}>
      <Drawer 
        isOpen={isDrawerOpen} 
        isPinned={isPinned} 
        onPinToggle={togglePin} 
        onLogout={handleSignOut} 
      />
      <div className="app-main-content">
        <AppBar onMenuClick={() => setDrawerOpen(!isDrawerOpen)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
