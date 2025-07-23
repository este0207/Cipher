import Dashboard from "./components/Dashboard";
import Shell from "./components/Shell";
export default function Home() {
  return (
    <div className="main">
    <h1>Dashbord</h1>
    <Dashboard></Dashboard>
    <h1>Online Shell</h1>
    <Shell></Shell>
    </div>
  );
}
