
import { useState } from "react";
import SideBar from "./components/SideBar";
import "./styles/App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app">
      <SideBar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <h1>{activePage}</h1>
        <p>Track your workouts. Measure your progress.</p>
      </main>
    </div>
  );
}

export default App;
