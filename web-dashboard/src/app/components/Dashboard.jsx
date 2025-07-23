export default function Dashboard() {
    return (
        <div className="dashboard">
            <div className="connection">
                <p>Connection Status</p>
                <h2>Connected</h2>
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
                <p>status</p>
                <h2>Online</h2>
            </div>
        </div>
    );
}