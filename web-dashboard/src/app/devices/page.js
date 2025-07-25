"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getDevices() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("devices") || "[]");
  } catch {
    return [];
  }
}

function saveDevicesToStorage(devices) {
  localStorage.setItem("devices", JSON.stringify(devices));
}

export default function DevicesPage() {
  const [devices, setDevicesState] = useState([]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [active, setActive] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const devs = getDevices();
    setDevicesState(devs);
    // Set active from localStorage if exists
    const currentIp = localStorage.getItem("dashboard_ip");
    const currentPort = localStorage.getItem("dashboard_port");
    const found = devs.find(d => d.ip === currentIp && d.port === currentPort);
    setActive(found ? found.name : null);
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !ip || !port) return;
    const newDevice = { name, ip, port };
    const updated = [...devices, newDevice];
    setDevices(updated);
    setDevicesState(updated);
    setName(""); setIp(""); setPort("");
  };

  const setDevices = (devs) => {
    setDevicesState(devs);
    saveDevicesToStorage(devs);
  };

  const handleDelete = (name) => {
    const updated = devices.filter(d => d.name !== name);
    setDevices(updated);
    setDevicesState(updated);
    // If deleted device was active, unset
    if (active === name) setActive(null);
  };

  const handleSwitch = (device) => {
    localStorage.setItem("dashboard_ip", device.ip);
    localStorage.setItem("dashboard_port", device.port);
    setActive(device.name);
    router.push("/dashboard");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>Devices</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom" style={{ flex: 1, minWidth: 120 }} />
        <input type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="IP" style={{ flex: 1, minWidth: 120 }} />
        <input type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="Port" style={{ flex: 1, minWidth: 100 }} />
        <button type="submit" style={{ minWidth: 120 }}>Ajouter</button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {devices.length === 0 && <div style={{ color: "#888", textAlign: "center" }}>Aucun device enregistré.</div>}
        {devices.map(device => (
          <div key={device.name} style={{ display: "flex", alignItems: "center", background: active === device.name ? "#23272e" : "#222", borderRadius: 8, padding: 16, gap: 16, boxShadow: active === device.name ? "0 0 8px 2px #00bfff" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{device.name}</div>
              <div style={{ fontSize: 15, color: "#aaa" }}>{device.ip}:{device.port}</div>
            </div>
            <button onClick={() => handleSwitch(device)} style={{ minWidth: 100 }}>{active === device.name ? "Actif" : "Utiliser"}</button>
            <button onClick={() => handleDelete(device.name)} style={{ minWidth: 100, background: "#2a1a1a", color: "#ff5555" }}>Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
} 