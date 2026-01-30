import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import { useState } from "react";

export function Dashboard() {
  const [sessions, setSessions] = useState([]);
  return (
    <div>
      <Sidebar sessions={sessions} />
      <Timer sessions={sessions} setSessions={setSessions} />
    </div>
  );
}
