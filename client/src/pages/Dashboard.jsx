import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import { useState } from "react";

export function Dashboard() {
  const [sessions, setSessions] = useState([
    // ✅ TODAY
    {
      startTime: new Date(),
      endTime: new Date(Date.now() + 25 * 60 * 1000),
      duration: "25:00",
    },

    // ✅ YESTERDAY
    {
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
      duration: "20:00",
    },

    // ✅ 3 DAYS AGO (this week)
    {
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      duration: "15:00",
    },

    // ✅ 10 DAYS AGO (this month)
    {
      startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      duration: "30:00",
    },

    // ❌ LAST MONTH
    {
      startTime: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endTime: new Date(
        new Date().setMonth(new Date().getMonth() - 1) + 20 * 60 * 1000,
      ),
      duration: "20:00",
    },

    // ❌ LAST YEAR
    {
      startTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      endTime: new Date(
        new Date().setFullYear(new Date().getFullYear() - 1) + 10 * 60 * 1000,
      ),
      duration: "10:00",
    },
  ]);
  return (
    <div>
      <Sidebar sessions={sessions} />
      <Timer sessions={sessions} setSessions={setSessions} />
    </div>
  );
}
