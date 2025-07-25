"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const accent = "#00bfff"; // bleu électrique
const textColor = "#e0e0e0";
const borderColor = "#444";
const inputStyle = {
  fontSize: 20,
  padding: "12px 10px",
  borderRadius: 6,
  border: `2px solid ${borderColor}`,
  background: "#111",
  color: textColor,
  fontFamily: "monospace",
  outline: "none",
  boxShadow: `0 0 0 0 ${accent}`,
  transition: "box-shadow 0.2s, border-color 0.2s, color 0.2s"
};
const inputFocusStyle = {
  boxShadow: `0 0 8px 2px ${accent}`,
  borderColor: accent,
  color: accent
};
const buttonStyle = {
  fontSize: 20,
  padding: "12px 0",
  borderRadius: 6,
  border: `2px solid ${borderColor}`,
  background: "#111",
  color: textColor,
  fontFamily: "monospace",
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: 2,
  fontWeight: 700,
  transition: "background 0.2s, color 0.2s, box-shadow 0.2s, border-color 0.2s",
  boxShadow: `0 0 0 0 ${accent}`
};
const buttonHoverStyle = {
  background: accent,
  color: "#111",
  boxShadow: `0 0 12px 2px ${accent}`,
  borderColor: accent
};

export default function Login() {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const router = useRouter();
  const [ipFocus, setIpFocus] = useState(false);
  const [portFocus, setPortFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ip && port) {
      localStorage.setItem("dashboard_ip", ip);
      localStorage.setItem("dashboard_port", port);
      router.push("/dashboard");
    }
  };

  return (
    <>
      <h1 style={{ textAlign: "center", marginTop: 48, marginBottom: 0, color: textColor, fontFamily: "monospace", letterSpacing: 2 }}>Connexion au Dashboard</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", background: "#181818" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 320 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="ip" style={{ fontSize: 18, fontWeight: 500, color: textColor, fontFamily: "monospace" }}>Server IP</label>
            <input id="ip" type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="ex: 192.168.1.10" required style={{ ...inputStyle, ...(ipFocus ? inputFocusStyle : {}) }} onFocus={() => setIpFocus(true)} onBlur={() => setIpFocus(false)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="port" style={{ fontSize: 18, fontWeight: 500, color: textColor, fontFamily: "monospace" }}>Port</label>
            <input id="port" type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="ex: 8000" required style={{ ...inputStyle, ...(portFocus ? inputFocusStyle : {}) }} onFocus={() => setPortFocus(true)} onBlur={() => setPortFocus(false)} />
          </div>
          <button type="submit"
            style={{ ...buttonStyle, ...(btnHover ? buttonHoverStyle : {}) }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >Se connecter</button>
        </form>
      </div>
    </>
  );
}
