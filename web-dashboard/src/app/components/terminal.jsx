import { useEffect, useRef } from "react";

export default function Terminal({ history, responses, currentCommand }) {
    const terminalEndRef = useRef(null);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [history, responses, currentCommand]);

    return (
        <div className="terminal" style={{ overflowY: "auto", maxHeight: "400px" }}>
            {history.map((cmd, index) => (
                <div key={index}>
                    <p className="name"><span className="TerminalName">Cipher@Ubuntu</span>:<span className="tidle">~</span>$ {cmd}</p>
                    <pre className="response">{responses[index]}</pre>
                </div>
            ))}
            <p className="name"><span className="TerminalName">Cipher@Ubuntu</span>:<span className="tidle">~</span>$ {currentCommand}</p>
            <div ref={terminalEndRef} />
        </div>
    );
}
