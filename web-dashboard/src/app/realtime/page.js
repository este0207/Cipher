"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RealTimePage() {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const router = useRouter();
  const scrollRef = useRef(null);

  useEffect(() => {
    const storedIp = localStorage.getItem("dashboard_ip");
    const storedPort = localStorage.getItem("dashboard_port");
    if (!storedIp || !storedPort) {
      router.push("/");
      return;
    }
    setIp(storedIp);
    setPort(storedPort);
    const socket = new window.WebSocket(`ws://${storedIp}:${storedPort}/ws`);
    setWs(socket);
    socket.onopen = () => setStatus("Connected");
    socket.onclose = () => setStatus("Disconnected");
    socket.onerror = () => setStatus("Error");
    socket.onmessage = (event) => {
      setMessages(msgs => [...msgs, { from: "server", text: event.data }]);
    };
    return () => socket.close();
  }, [router]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (ws && ws.readyState === 1 && input.trim()) {
      ws.send(input);
      setMessages(msgs => [...msgs, { from: "me", text: input }]);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32, width: "100%" }}>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>Real Time (WebSocket)</h1>
      <div style={{ background: "#181818", borderRadius: 8, padding: 16, minHeight: 320, fontFamily: "monospace", fontSize: 18, width: "100%", boxShadow: "0 2px 12px #0004", marginBottom: 24, maxHeight: 500, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ color: msg.from === "me" ? "#00bfff" : "#e0e0e0", textAlign: msg.from === "me" ? "right" : "left", margin: "2px 0" }}>
            {msg.from === "me" ? "> " : "< "}{msg.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={status === "Connected" ? "Type a message..." : status}
          disabled={status !== "Connected"}
          style={{ flex: 1, fontSize: 18, padding: "12px 10px", borderRadius: 6, border: "2px solid #444", background: "#111", color: "#e0e0e0", fontFamily: "monospace", outline: "none" }}
        />
        <button
          onClick={sendMessage}
          disabled={status !== "Connected" || !input.trim()}
          style={{ fontSize: 18, padding: "12px 24px", borderRadius: 6, border: "2px solid #00bfff", background: status === "Connected" ? "#00bfff" : "#444", color: status === "Connected" ? "#181818" : "#888", fontFamily: "monospace", cursor: status === "Connected" ? "pointer" : "not-allowed" }}
        >Send</button>
      </div>
      <div style={{ color: status === "Connected" ? "#00bfff" : "#ff5555", marginTop: 12, fontWeight: 500 }}>{status}</div>
    </div>
  );
} 