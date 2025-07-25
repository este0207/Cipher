"use client";

import React, { useEffect, useState } from "react";

export default function Dashboard() {
    const [status, setStatus] = useState("Loading...");
    const [ip, setIp] = useState("Loading...");

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await fetch("http://192.168.10.106:8000/status");
                let data = await response.text();
                // Remove JSON wrapper {"status":""} if present
                const match = data.match(/^\{"status":"(.+)"\}$/);
                if (match) {
                    data = match[1];
                }
                setStatus(data);
            } catch (error) {
                setStatus("Offline");
                console.error("Error fetching status:", error);
            }
        }

        async function fetchIp() {
            try {
                const response = await fetch("http://192.168.10.106:8000/ip");
                let data = await response.text();
                setIp(data);
            } catch (error) {
                setIp("Unavailable");
                console.error("Error fetching IP:", error);
            }
        }

        fetchStatus();
        fetchIp();
        const intervalId = setInterval(() => {
            fetchStatus();
            fetchIp();
        }, 10000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="dashboard">
            <div className="connection">
                <p>Connection Status</p>
                <h2>{status}</h2>
            </div>
            <div className="information">
                <p>Device Information</p>
                <h2>Device ID: 123456789</h2>
            </div>
            <div className="activity">
                <p>Recent Activity</p>
                <h2>Last Accessed: 2 hours ago</h2>
            </div>
            <div className="status">
                <p>IP</p>
                <h2>{ip}</h2>
            </div>
        </div>
    );
}
