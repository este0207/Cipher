"use client";

import React, { useState } from "react";
import Terminal from "./terminal";

export default function Shell() {
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState([]);

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setHistory([...history, inputValue]);
            setInputValue("");
        }
    };

    return (
        <div className="ShellContainer">
            <p>Shell Output</p>
            <Terminal history={history} currentCommand={inputValue} />
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
