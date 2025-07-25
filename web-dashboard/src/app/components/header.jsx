export default function Header() {
    return (
        <div className="navbar">
            <div className="logo">
                <img src="/hack.png" alt="" style={{ filter: "invert(1)" }} />
                <h2>Cipher</h2>
            </div>
            <div className="links">
                <a href="/dashboard">Dashboard</a>
                <a href="/devices">Devices</a>
                <a href="/realtime">Real Time</a>
                <a href="/monitor">Monitor</a>
                <img src="/globe.svg" alt="user_icon" />
            </div>
        </div>
    );
}