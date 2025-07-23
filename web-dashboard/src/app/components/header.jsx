export default function Header() {
    return (
        <div className="navbar">
            <div className="logo">
                <img src="/globe.svg" alt="" />
                <h2>Cipher</h2>
            </div>
            <div className="links">
                <a href="">Dashboard</a>
                <a href="">Devices</a>
                <a href="">Settings</a>
                <img src="/globe.svg" alt="user_icon" />
            </div>
        </div>
    );
}