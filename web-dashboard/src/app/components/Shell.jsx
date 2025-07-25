"use client";

import React, { useState } from "react";
import Terminal from "./terminal";

export default function Shell() {
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState([]);
    const [responses, setResponses] = useState([]);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleKeyDown = async (event) => {
        if (event.key === "Enter") {
            setHistory([...history, inputValue]);
            try {
                const response = await fetch(`http://192.168.10.106:8000/shell`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ command: inputValue })
                });
                let data = await response.text();
                // Remove surrounding quotes if present
                if (data.startsWith('"') && data.endsWith('"')) {
                    data = data.slice(1, -1);
                }
                // Replace escaped \n with actual newlines
                data = data.replace(/\\n/g, '\n');
                // Remove all remaining quotes inside the string
                data = data.replace(/"/g, '');
                setResponses([...responses, data]);
                console.log("Response from server:", data);
            } catch (error) {
                setResponses([...responses, "Error fetching response"]);
                console.error("Error fetching command response:", error);
            }
            setInputValue("");
        }
    };

    return (
        <div className="ShellContainer">
            <p>Shell Output</p>
            <Terminal history={history} responses={responses} currentCommand={inputValue} />
            <input
                type="text"
                name="commande"
                id="commande"
                placeholder="Enter command here..."
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}
