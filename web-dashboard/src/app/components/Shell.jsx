"use client";

import React, { useState, useRef, useEffect } from "react";

function ShellPrompt({ prompt, command, cursor, onKeyDown, onClick }) {
    return (
        <div
            tabIndex={0}
            style={{ outline: "none", display: "flex", fontFamily: "monospace", fontSize: 18, width: "100%" }}
            onKeyDown={onKeyDown}
            onClick={onClick}
            className="shell-prompt-line"
        >
            <span style={{ color: "#00bfff", fontWeight: 700 }}>{prompt}</span>
            <span style={{ marginLeft: 4, whiteSpace: "pre-wrap" }}>{command}</span>
            <span className="shell-cursor" style={{ background: "#00bfff", color: "#181818", marginLeft: 0, width: 10, display: "inline-block", animation: "blink 1s steps(1) infinite" }}>{cursor}</span>
            <style>{`@keyframes blink { 0%{opacity:1;} 50%{opacity:0;} 100%{opacity:1;} }`}</style>
        </div>
    );
}

export default function Shell({ ip, port }) {
    const [history, setHistory] = useState([]); // [{cmd, output}]
    const [currentCommand, setCurrentCommand] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyIndex, setHistoryIndex] = useState(null); // null = pas dans l'historique
    const prompt = `Cipher@${ip}:~$ `;
    const shellRef = useRef(null);
    const scrollRef = useRef(null);

    // Focus auto au clic ou au chargement
    useEffect(() => {
        if (shellRef.current) shellRef.current.focus();
    }, []);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, [history, currentCommand]);

    const handleKeyDown = async (e) => {
        if (loading) return;
        if (e.key === "Enter") {
            e.preventDefault();
            const cmd = currentCommand;
            if (!cmd.trim()) return;
            setLoading(true);
            setHistory(h => [...h, { cmd, output: "..." }]);
            setCurrentCommand("");
            setHistoryIndex(null);
            try {
                const response = await fetch(`http://${ip}:${port}/shell`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ command: cmd })
                });
                let data = await response.text();
                if (data.startsWith('"') && data.endsWith('"')) data = data.slice(1, -1);
                data = data.replace(/\\n/g, '\n');
                data = data.replace(/"/g, '');
                setHistory(h => h.map((item, i) => i === h.length - 1 ? { ...item, output: data } : item));
            } catch {
                setHistory(h => h.map((item, i) => i === h.length - 1 ? { ...item, output: "[Erreur de connexion ou de commande]" } : item));
            }
            setLoading(false);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length === 0) return;
            if (historyIndex === null) {
                setHistoryIndex(history.length - 1);
                setCurrentCommand(history[history.length - 1].cmd);
            } else if (historyIndex > 0) {
                setHistoryIndex(historyIndex - 1);
                setCurrentCommand(history[historyIndex - 1].cmd);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex === null) return;
            if (historyIndex < history.length - 1) {
                setHistoryIndex(historyIndex + 1);
                setCurrentCommand(history[historyIndex + 1].cmd);
            } else {
                setHistoryIndex(null);
                setCurrentCommand("");
            }
        } else if (e.key.length === 1) {
            // Ajout de caractère
            setCurrentCommand(cmd => cmd + e.key);
        } else if (e.key === "Backspace") {
            setCurrentCommand(cmd => cmd.slice(0, -1));
        } else if (e.key === "Tab") {
            e.preventDefault();
            setCurrentCommand(cmd => cmd + "    ");
        } else if (e.key === "Home") {
            // Optionnel: aller au début (non géré ici)
        } else if (e.key === "End") {
            // Optionnel: aller à la fin (non géré ici)
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            // Optionnel: gestion du curseur horizontal (non géré ici)
        } else {
            // Empêche le scroll page, etc.
            e.preventDefault();
        }
    };

    const handleShellClick = () => {
        if (shellRef.current) shellRef.current.focus();
    };

    return (
        <div
            className="ShellContainer"
            style={{ background: "#181818", borderRadius: 8, padding: 16, boxShadow: "0 2px 12px #0004", minHeight: 320, fontFamily: "monospace", fontSize: 18, outline: "none", cursor: "text", width: "90%" }}
            tabIndex={0}
            ref={shellRef}
            onKeyDown={handleKeyDown}
            onClick={handleShellClick}
        >
            {history.map((item, i) => (
                <div key={i} style={{ marginBottom: 2 }}>
                    <span style={{ color: "#00bfff", fontWeight: 700 }}>{prompt}</span>
                    <span style={{ marginLeft: 4, whiteSpace: "pre-wrap" }}>{item.cmd}</span>
                    <div style={{ whiteSpace: "pre-wrap", color: "#e0e0e0", marginLeft: 16 }}>{item.output}</div>
                </div>
            ))}
            <ShellPrompt
                prompt={prompt}
                command={currentCommand}
                cursor={loading ? "" : "|"}
                onKeyDown={() => {}}
                onClick={handleShellClick}
            />
            <div ref={scrollRef} />
        </div>
    );
}
