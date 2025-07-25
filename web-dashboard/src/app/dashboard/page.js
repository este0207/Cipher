"use client";
import Dashboard from "../components/Dashboard";
import Shell from "../components/Shell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const storedIp = localStorage.getItem("dashboard_ip");
      const storedPort = localStorage.getItem("dashboard_port");
      if (!storedIp || !storedPort) {
        setError("Aucun device sélectionné. Veuillez en choisir un dans Devices ou vous connecter.");
        return;
      }
      setIp(storedIp);
      setPort(storedPort);
    } catch (e) {
      setError("Erreur lors du chargement de l'IP/port. Veuillez réessayer.");
    }
  }, [router]);

  if (error) {
    return <div style={{ color: "#ff5555", textAlign: "center", marginTop: 64, fontSize: 20 }}>{error}</div>;
  }

  if (!ip || !port) return null;

  return (
    <div className="main">
      <h1>Dashboard</h1>
      <Dashboard ip={ip} port={port} />
      <h1>Online Shell</h1>
      <Shell ip={ip} port={port} />
    </div>
  );
} 